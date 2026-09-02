import { useState } from "react";
import { Heart, Delete } from "lucide-react";

export function PinLock({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [entry, setEntry] = useState("");
  const [shake, setShake] = useState(false);

  const press = (digit: string) => {
    if (entry.length >= 4) return;
    const next = entry + digit;
    setEntry(next);
    if (next.length === 4) {
      window.setTimeout(() => {
        if (next === pin) {
          onUnlock();
        } else {
          setShake(true);
          window.setTimeout(() => {
            setShake(false);
            setEntry("");
          }, 500);
        }
      }, 150);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Heart className="heart-pulse size-10 fill-primary text-primary" />
      <h1 className="mt-5 text-4xl font-light tracking-wide text-romance">Only Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter our secret code</p>

      <div className={`mt-8 flex gap-4 ${shake ? "animate-bounce" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full border transition-all ${
              entry.length > i
                ? "romance-gradient scale-110 border-transparent"
                : "border-border bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className="mt-10 grid w-full max-w-[16rem] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <PinKey key={d} label={d} onClick={() => press(d)} />
        ))}
        <span />
        <PinKey label="0" onClick={() => press("0")} />
        <button
          type="button"
          onClick={() => setEntry((e) => e.slice(0, -1))}
          className="flex h-16 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Delete"
        >
          <Delete className="size-5" />
        </button>
      </div>
    </div>
  );
}

function PinKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-16 rounded-full border border-border/70 bg-card/60 text-xl font-light text-foreground backdrop-blur transition-all active:scale-95 active:bg-accent"
    >
      {label}
    </button>
  );
}
