import { useCallback, useEffect, useRef, useState } from "react";
import { Film, Loader2, Maximize2, Play, Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable } from "@/lib/couple";
import { toast } from "sonner";

type Clip = {
  id: string;
  storage_path: string;
  thumb_url: string | null;
  caption: string | null;
  uploader: string | null;
  duration: number | null;
  created_at: string;
};

const BUCKET = "couple-videos";
const ME_KEY = "only-us-chat-me";

/** Grab a still frame + duration from the picked file, for the preview tile. */
function makePreview(file: File): Promise<{ thumb: string | null; duration: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const done = (thumb: string | null, duration: number | null) => {
      URL.revokeObjectURL(url);
      resolve({ thumb, duration });
    };
    video.onerror = () => done(null, null);
    video.onloadeddata = () => {
      const seekTo = Math.min(1, (video.duration || 1) / 3);
      video.currentTime = Number.isFinite(seekTo) ? seekTo : 0;
    };
    video.onseeked = () => {
      try {
        const scale = Math.min(1, 640 / Math.max(video.videoWidth || 1, video.videoHeight || 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((video.videoWidth || 640) * scale));
        canvas.height = Math.max(1, Math.round((video.videoHeight || 360) * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(null, video.duration ?? null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/jpeg", 0.7), video.duration ?? null);
      } catch {
        done(null, video.duration ?? null);
      }
    };
    video.src = url;
  });
}

function formatDuration(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideosTab() {
  const { rows } = useLiveTable<Clip>("videos");
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string | null>(null);

  // Private bucket: fetch short-lived signed links for the clips on screen.
  useEffect(() => {
    let cancelled = false;
    const missing = rows.filter((r) => !links[r.id]).map((r) => r);
    if (missing.length === 0) return;
    (async () => {
      const entries: [string, string][] = [];
      for (const clip of missing) {
        const { data } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(clip.storage_path, 60 * 60 * 4);
        if (data?.signedUrl) entries.push([clip.id, data.signedUrl]);
      }
      if (!cancelled && entries.length) {
        setLinks((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, links]);

  const upload = useCallback(
    async (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        toast.error("Please pick a video file");
        return;
      }
      setBusy(true);
      try {
        const { data: auth } = await supabase.auth.getSession();
        if (!auth.session) throw new Error("no session");
        const { data: couple, error: coupleError } = await supabase
          .from("couple_members")
          .select("couple_id")
          .limit(1)
          .maybeSingle();
        if (coupleError || !couple) throw coupleError ?? new Error("no couple");

        const { thumb, duration } = await makePreview(file);
        const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
        const path = `${couple.couple_id}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;

        const { error: rowErr } = await supabase.from("videos").insert({
          storage_path: path,
          thumb_url: thumb,
          duration,
          caption: caption.trim() || null,
          uploader: localStorage.getItem(ME_KEY) || "us",
        });
        if (rowErr) {
          await supabase.storage.from(BUCKET).remove([path]);
          throw rowErr;
        }
        setCaption("");
        toast.success("Moment saved");
      } catch {
        toast.error("Couldn't upload that video");
      }
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    [caption],
  );

  const remove = async (clip: Clip) => {
    await supabase.storage.from(BUCKET).remove([clip.storage_path]);
    await supabase.from("videos").delete().eq("id", clip.id);
    setPlaying((p) => (p === clip.id ? null : p));
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-3 p-4">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption this moment…"
          className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
          {busy ? "Uploading…" : "Add a video"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No moments yet. Add your first video.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((clip) => {
            const src = links[clip.id];
            const isPlaying = playing === clip.id;
            return (
              <figure key={clip.id} className="float-in panel overflow-hidden p-0">
                <div className="relative bg-black/40">
                  {isPlaying && src ? (
                    <video
                      src={src}
                      controls
                      autoPlay
                      playsInline
                      controlsList="nodownload"
                      className="aspect-video w-full bg-black object-contain"
                    />
                  ) : (
                    <button
                      onClick={() => src && setPlaying(clip.id)}
                      aria-label="Play video"
                      className="relative block w-full"
                    >
                      {clip.thumb_url ? (
                        <img
                          src={clip.thumb_url}
                          alt={clip.caption ?? "Our moment"}
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-secondary/40">
                          <Film className="size-7 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full bg-background/70 p-3 backdrop-blur">
                          {src ? (
                            <Play className="size-5 fill-primary text-primary" />
                          ) : (
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                          )}
                        </span>
                      </span>
                      {formatDuration(clip.duration) && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-background/75 px-1.5 py-0.5 text-[10px] text-foreground backdrop-blur">
                          {formatDuration(clip.duration)}
                        </span>
                      )}
                    </button>
                  )}

                  <div className="absolute right-2 top-2 flex gap-2">
                    <button
                      onClick={() => src && window.open(src, "_blank", "noopener")}
                      aria-label="Open fullscreen"
                      className="rounded-full bg-background/70 p-2 text-foreground backdrop-blur"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(clip)}
                      aria-label="Delete video"
                      className="rounded-full bg-background/70 p-2 text-destructive backdrop-blur"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <figcaption className="space-y-1 px-3 py-2">
                  {clip.caption && <p className="text-sm">{clip.caption}</p>}
                  <p className="text-[11px] text-muted-foreground">
                    {clip.uploader ? `${clip.uploader} · ` : ""}
                    {new Date(clip.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
