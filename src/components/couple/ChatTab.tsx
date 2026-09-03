import { useEffect, useRef, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable, type Message } from "@/lib/couple";
import type { CoupleMember } from "@/lib/auth";
import { toast } from "sonner";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Live chat with photo & video sharing, WhatsApp style bubbles. */
export function ChatTab({ member }: { member: CoupleMember }) {
  const { rows } = useLiveTable<Message>("messages", true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [rows.length]);

  // Media lives in a private bucket, so resolve short-lived signed URLs.
  useEffect(() => {
    const missing = rows.filter((r) => r.media_url && !urls[r.media_url]);
    if (!missing.length) return;
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const m of missing) {
        const { data } = await supabase.storage
          .from("chat-media")
          .createSignedUrl(m.media_url!, 60 * 60 * 12);
        if (data?.signedUrl) next[m.media_url!] = data.signedUrl;
      }
      if (!cancelled && Object.keys(next).length) setUrls((u) => ({ ...u, ...next }));
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, urls]);

  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ body, sender_id: member.user_id, sender: member.display_name });
    if (error) toast.error("Message didn't send");
  };

  const sendMedia = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${member.couple_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("chat-media").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("messages").insert({
        media_url: path,
        media_type: file.type.startsWith("video") ? "video" : "image",
        sender_id: member.user_id,
        sender: member.display_name,
      });
      if (error) throw error;
    } catch {
      toast.error("Couldn't send that file");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (m: Message) => {
    await supabase.from("messages").delete().eq("id", m.id);
    if (m.media_url) await supabase.storage.from("chat-media").remove([m.media_url]);
  };

  return (
    <section className="flex flex-col">
      <p className="mx-auto mb-3 rounded-full border border-border/70 px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
        Texting as {member.display_name}
      </p>

      <ul className="space-y-3">
        {rows.map((m) => {
          const mine = m.sender_id ? m.sender_id === member.user_id : m.sender === member.display_name;
          const src = m.media_url ? urls[m.media_url] : undefined;
          return (
            <li
              key={m.id}
              className={`float-in flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`group max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-[var(--shadow-soft)] ${
                  mine
                    ? "rounded-br-sm romance-gradient text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-card"
                }`}
              >
                {m.media_url &&
                  (m.media_type === "video" ? (
                    <video
                      src={src}
                      controls
                      playsInline
                      className="mb-1 max-h-64 rounded-xl"
                    />
                  ) : (
                    <img
                      src={src}
                      alt="Shared moment"
                      loading="lazy"
                      className="mb-1 max-h-64 rounded-xl object-cover"
                    />
                  ))}
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span
                    className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {timeOf(m.created_at)}
                  </span>
                  <button
                    onClick={() => remove(m)}
                    aria-label="Delete message"
                    className="opacity-50 transition-opacity hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        <div ref={endRef} />
      </ul>

      <div className="sticky bottom-24 mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card/90 p-2 backdrop-blur-xl">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Send a photo or video"
          className="flex size-9 shrink-0 items-center justify-center rounded-full romance-gradient text-primary-foreground disabled:opacity-60"
        >
          <Plus className="size-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => sendMedia(e.target.files?.[0])}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={busy ? "Uploading…" : "Message…"}
          className="flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button
          onClick={send}
          aria-label="Send message"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-primary"
        >
          <Send className="size-4" />
        </button>
      </div>
    </section>
  );
}
