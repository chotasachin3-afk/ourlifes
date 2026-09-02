import { Bird } from "lucide-react";

const BIRDS = [
  { top: "8%", size: 22, delay: "0s", duration: "30s", opacity: 0.1 },
  { top: "22%", size: 14, delay: "-6s", duration: "38s", opacity: 0.08 },
  { top: "44%", size: 28, delay: "-14s", duration: "44s", opacity: 0.07 },
  { top: "62%", size: 16, delay: "-3s", duration: "34s", opacity: 0.09 },
  { top: "80%", size: 20, delay: "-20s", duration: "48s", opacity: 0.06 },
];

/** Subtle bird silhouettes drifting behind every page. */
export function BirdsBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BIRDS.map((b, i) => (
        <span
          key={i}
          className="bird-drift absolute left-0 text-foreground"
          style={{
            top: b.top,
            opacity: b.opacity,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        >
          <Bird style={{ width: b.size, height: b.size }} />
        </span>
      ))}
    </div>
  );
}
