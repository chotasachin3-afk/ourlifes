import { useLiveTable, type Mood } from "@/lib/couple";
import { supabase } from "@/integrations/supabase/client";

const EMOJIS = ["😍", "😊", "🥰", "😌", "😴", "😢", "😤", "🤗"];

/** Daily mood for each of us, always visible on the home screen. */
export function MoodTracker() {
  const { rows } = useLiveTable<Mood>("moods", true);
  const her = rows.find((r) => r.id === "her");
  const him = rows.find((r) => r.id === "him");

  const set = async (id: string, emoji: string) => {
    await supabase.from("moods").update({ emoji, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const row = (id: string, label: string, current?: Mood) => (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label} · {current?.emoji ?? "💖"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => set(id, e)}
            aria-label={`Set ${label} mood to ${e}`}
            className={`rounded-full px-2 py-1 text-lg transition-transform active:scale-90 ${
              current?.emoji === e ? "bg-primary/25 ring-1 ring-primary" : "bg-accent/30"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="panel mx-4 space-y-3 p-4">
      {row("her", "Laiba's mood", her)}
      {row("him", "His mood", him)}
    </section>
  );
}
