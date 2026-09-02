import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resizeImage, useLiveTable, type Photo } from "@/lib/couple";
import { toast } from "sonner";

export function Gallery() {
  const { rows } = useLiveTable<Photo>("photos");
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await resizeImage(file);
      const { error } = await supabase.from("photos").insert({ url, caption: caption || null });
      if (error) throw error;
      setCaption("");
      toast.success("Memory saved");
    } catch {
      toast.error("Couldn't upload that photo");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (id: string) => {
    await supabase.from("photos").delete().eq("id", id);
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-3 p-4">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption this memory…"
          className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {busy ? "Uploading…" : "Add a photo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No memories yet. Add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((p) => (
            <figure key={p.id} className="float-in panel overflow-hidden p-0">
              <div className="relative">
                <img
                  src={p.url}
                  alt={p.caption ?? "Our memory"}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <button
                  onClick={() => remove(p.id)}
                  aria-label="Delete photo"
                  className="absolute right-2 top-2 rounded-full bg-background/70 p-2 text-destructive backdrop-blur"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {p.caption && (
                <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                  {p.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
