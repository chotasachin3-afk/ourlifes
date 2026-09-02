import { useState } from "react";
import { Trash2, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { spotifyEmbed, useLiveTable, type Track } from "@/lib/couple";
import { toast } from "sonner";

export function MusicTab() {
  const { rows } = useLiveTable<Track>("music");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const add = async () => {
    if (!spotifyEmbed(url)) {
      toast.error("Paste a Spotify track, album or playlist link");
      return;
    }
    await supabase.from("music").insert({ url: url.trim(), title: title.trim() || null });
    setUrl("");
    setTitle("");
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-3 p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Why this song?"
          className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://open.spotify.com/track/…"
          className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground"
        >
          <Music2 className="size-4" /> Add to our playlist
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No songs yet. Add the one that's yours.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((t) => (
            <li key={t.id} className="float-in panel space-y-2 p-3">
              <div className="flex items-center justify-between gap-3 px-1">
                <span className="truncate font-display text-lg text-blush">
                  {t.title ?? "Our song"}
                </span>
                <button
                  onClick={() => supabase.from("music").delete().eq("id", t.id)}
                  aria-label="Remove song"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <iframe
                src={spotifyEmbed(t.url) ?? ""}
                title={t.title ?? "Spotify player"}
                className="h-[152px] w-full rounded-xl border-0"
                loading="lazy"
                allow="encrypted-media; clipboard-write; autoplay"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
