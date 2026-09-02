import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable, type BingoItem } from "@/lib/couple";

/** Relationship bingo — tick off the things we've done together. */
export function BingoGame() {
  const { rows } = useLiveTable<BingoItem>("bingo", true);
  const [label, setLabel] = useState("");
  const done = rows.filter((r) => r.done).length;

  const toggle = async (item: BingoItem) => {
    await supabase.from("bingo").update({ done: !item.done }).eq("id", item.id);
  };

  const add = async () => {
    if (!label.trim()) return;
    await supabase.from("bingo").insert({ label: label.trim() });
    setLabel("");
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {done} of {rows.length} squares filled
      </p>

      <div className="grid grid-cols-2 gap-2">
        {rows.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item)}
            className={`relative min-h-20 rounded-2xl border p-3 text-left text-xs leading-snug transition-colors ${
              item.done
                ? "border-gold bg-gold/15 text-gold"
                : "border-border bg-card/70 text-foreground"
            }`}
          >
            {item.label}
            {item.done && <span className="absolute bottom-2 right-2 text-base">💙</span>}
          </button>
        ))}
      </div>

      <div className="panel flex gap-2 p-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add a square…"
          className="flex-1 rounded-xl border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={add}
          aria-label="Add bingo square"
          className="flex size-9 items-center justify-center rounded-xl romance-gradient text-primary-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
            <span className="flex-1">{r.label}</span>
            <button
              onClick={() => supabase.from("bingo").delete().eq("id", r.id)}
              aria-label={`Delete ${r.label}`}
              className="hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
