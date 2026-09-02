import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

/** Warm greeting modal shown once each time the app is opened. */
export function WelcomePopup({ name = "Laiba" }: { name?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("only-us-greeted") === "1") return;
    sessionStorage.setItem("only-us-greeted", "1");
    const t = setTimeout(() => setOpen(true), 350);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel float-in relative w-full max-w-sm px-6 py-9 text-center"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close greeting"
          className="absolute right-3 top-3 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex justify-center gap-3">
          <Heart className="heart-float size-5 fill-primary text-primary" />
          <Heart
            className="heart-float size-8 fill-gold text-gold"
            style={{ animationDelay: "-1s" }}
          />
          <Heart
            className="heart-float size-5 fill-primary text-primary"
            style={{ animationDelay: "-2s" }}
          />
        </div>

        <h2 className="mt-5 font-display text-3xl leading-snug text-romance">
          Welcome back to Our Universe, {name}!
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Every wave, every bird, every little star here belongs to us.
        </p>

        <button
          onClick={() => setOpen(false)}
          className="mt-6 w-full rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground"
        >
          Enter our world
        </button>
      </div>
    </div>
  );
}
