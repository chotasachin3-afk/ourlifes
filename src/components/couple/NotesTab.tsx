import { useState } from "react";
import { Trash2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable, type Note } from "@/lib/couple";

export function NotesTab() {
  const { rows } = useLiveTable<Note>("notes");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  const add = async () => {
    if (!body.trim()) return;
    await supabase.from("notes").insert({ body: body.trim(), author: author.trim() || null });
    setBody("");
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-3 p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write something only they should read…"
          className="w-full resize-none rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="From"
            className="w-28 rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={add}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Send className="size-4" /> Leave note
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No love notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((n) => (
            <li key={n.id} className="float-in panel flex gap-3 p-4">
              <div className="flex-1">
                <p className="whitespace-pre-wrap font-display text-lg leading-snug text-blush">
                  {n.body}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {n.author ? `— ${n.author} · ` : ""}
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => supabase.from("notes").delete().eq("id", n.id)}
                aria-label="Delete note"
                className="self-start text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
