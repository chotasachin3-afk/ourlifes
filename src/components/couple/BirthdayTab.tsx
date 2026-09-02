import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Gift, Pencil, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/lib/couple";
import { toast } from "sonner";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function BirthdayTab({ settings, reload }: { settings: Settings; reload: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(settings.birthday_date?.slice(0, 16) ?? "");
  const [letter, setLetter] = useState(settings.birthday_letter ?? "");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const target = settings.birthday_date ? new Date(settings.birthday_date).getTime() : null;
  const left = target ? target - now : 0;
  const t = parts(left);
  const arrived = target !== null && left <= 0;

  const pop = () => {
    setOpened(true);
    const end = Date.now() + 2000;
    const shoot = () => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#ff8fab", "#ffd6a5", "#e0aaff", "#ffc8dd"],
      });
      if (Date.now() < end) requestAnimationFrame(shoot);
    };
    shoot();
  };

  const save = async () => {
    const { error } = await supabase
      .from("settings")
      .update({
        birthday_date: date ? new Date(date).toISOString() : null,
        birthday_letter: letter,
      })
      .eq("id", "main");
    if (error) {
      toast.error("Couldn't save");
      return;
    }
    setEditing(false);
    reload();
  };

  if (editing) {
    return (
      <section className="panel space-y-3 p-4">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Birthday moment
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Birthday letter
        </label>
        <textarea
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={8}
          className="w-full resize-none rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
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
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="panel relative p-6 text-center">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit surprise"
          className="absolute right-4 top-4 text-muted-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <Sparkles className="mx-auto size-6 text-gold" />
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {arrived ? "It's today" : "Counting down to your day"}
        </p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {(
            [
              [t.d, "days"],
              [t.h, "hrs"],
              [t.m, "min"],
              [t.s, "sec"],
            ] as [number, string][]
          ).map(([v, l]) => (
            <div key={l} className="rounded-xl border border-border/60 bg-accent/25 py-3">
              <p className="font-display text-3xl leading-none text-gold">
                {String(v).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!opened ? (
        <button
          onClick={pop}
          className="flex w-full items-center justify-center gap-2 rounded-2xl romance-gradient py-4 font-display text-xl text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-95"
        >
          <Gift className="size-5" /> Open Surprise
        </button>
      ) : (
        <article className="float-in panel space-y-4 p-6">
          <h2 className="text-center font-display text-3xl text-romance">Happy Birthday</h2>
          <p className="whitespace-pre-wrap text-center font-display text-lg leading-relaxed text-blush">
            {settings.birthday_letter ?? "Write your letter by tapping the pencil above."}
          </p>
          <button
            onClick={pop}
            className="mx-auto block rounded-full border border-gold/60 px-4 py-2 text-xs text-gold"
          >
            More confetti
          </button>
        </article>
      )}
    </section>
  );
}
