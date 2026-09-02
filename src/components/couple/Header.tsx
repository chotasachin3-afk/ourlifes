import { useRef, useState } from "react";
import { Camera, Heart, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { daysBetween, resizeImage, type Settings } from "@/lib/couple";
import { toast } from "sonner";

export function Header({ settings, reload }: { settings: Settings; reload: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [names, setNames] = useState(settings.names);
  const [start, setStart] = useState(settings.start_date);
  const [busy, setBusy] = useState(false);

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await resizeImage(file, 600, 0.85);
      const { error } = await supabase.from("settings").update({ photo_url: url }).eq("id", "main");
      if (error) throw error;
      reload();
      toast.success("Our photo is updated");
    } catch {
      toast.error("Couldn't update that photo");
    }
    setBusy(false);
  };

  const saveDetails = async () => {
    const { error } = await supabase
      .from("settings")
      .update({ names, start_date: start })
      .eq("id", "main");
    if (error) {
      toast.error("Couldn't save");
      return;
    }
    setEditing(false);
    reload();
  };

  const days = daysBetween(settings.start_date);

  return (
    <header className="flex flex-col items-center px-6 pb-6 pt-12 text-center">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative size-32 rounded-full p-[3px] romance-gradient shadow-[var(--shadow-glow)] transition-transform active:scale-95"
        aria-label="Change our photo"
      >
        <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-card">
          {settings.photo_url ? (
            <img
              src={settings.photo_url}
              alt="Us together"
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Camera className="size-8 text-muted-foreground" />
          )}
        </span>
        <span className="absolute -bottom-1 -right-1 rounded-full romance-gradient p-1.5 text-primary-foreground shadow-[var(--shadow-glow)]">
          <Camera className="size-3.5" />
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickPhoto(e.target.files?.[0])}
        disabled={busy}
      />

      {editing ? (
        <div className="mt-5 w-full max-w-xs space-y-3">
          <input
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder="Her & Him"
            className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-center text-sm outline-none focus:border-primary"
          />
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-center text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={saveDetails}
              className="flex-1 rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-4 flex items-center gap-2 text-3xl font-light text-romance">
            {settings.names}
            <button onClick={() => setEditing(true)} aria-label="Edit details">
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </h1>
          <div className="mt-3 flex items-baseline gap-2">
            <Heart className="heart-pulse size-4 translate-y-0.5 fill-primary text-primary" />
            <span className="font-display text-5xl leading-none text-gold">{days}</span>
            <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              days together
            </span>
          </div>
        </>
      )}
    </header>
  );
}
