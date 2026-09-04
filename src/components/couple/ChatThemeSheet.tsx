import { X, Check, Users, User } from "lucide-react";
import {
  BUBBLE_STYLES,
  CHAT_ACCENTS,
  CHAT_THEMES,
  CHAT_WALLPAPERS,
  themeVars,
  type ChatThemePrefs,
} from "@/lib/chat-themes";

type Props = {
  open: boolean;
  prefs: ChatThemePrefs;
  personal: boolean;
  onClose: () => void;
  onChange: (patch: Partial<ChatThemePrefs>) => void;
  onTogglePersonal: (value: boolean) => void;
};

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--chat-subtle)" }}>
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ChatThemeSheet({ open, prefs, personal, onClose, onChange, onTogglePersonal }: Props) {
  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        aria-label="Close theme picker"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={`absolute inset-x-0 bottom-0 mx-auto max-h-[78vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t p-5 pb-10 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          background: "var(--chat-surface)",
          borderColor: "var(--chat-border)",
          color: "var(--chat-text)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-light">Chat look</h2>
          <button onClick={onClose} className="rounded-full p-1.5" style={{ background: "var(--chat-in)" }}>
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5">
          <Row title="Theme">
            {CHAT_THEMES.map((t) => {
              const active = prefs.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onChange({ theme: t.id })}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all duration-200"
                  style={{
                    borderColor: active ? "var(--chat-accent)" : "var(--chat-border)",
                    background: t.surface,
                    color: t.text,
                  }}
                >
                  <span
                    className="size-3.5 rounded-full"
                    style={{ background: t.incoming, border: `1px solid ${t.border}` }}
                  />
                  {t.label}
                  {active && <Check className="size-3.5" />}
                </button>
              );
            })}
          </Row>

          <Row title="Wallpaper">
            {CHAT_WALLPAPERS.map((w) => {
              const active = prefs.wallpaper === w.id;
              const vars = themeVars({ ...prefs, wallpaper: w.id });
              return (
                <button
                  key={w.id}
                  onClick={() => onChange({ wallpaper: w.id })}
                  className="h-14 w-[4.5rem] overflow-hidden rounded-xl border text-[10px] transition-all duration-200"
                  style={{
                    borderColor: active ? "var(--chat-accent)" : "var(--chat-border)",
                    backgroundColor: "var(--chat-surface)",
                    backgroundImage: vars["--chat-wallpaper"],
                    backgroundSize: vars["--chat-wallpaper-size"],
                    color: "var(--chat-text)",
                  }}
                >
                  {w.label}
                </button>
              );
            })}
          </Row>

          <Row title="Bubbles">
            {BUBBLE_STYLES.map((b) => {
              const active = prefs.bubble === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onChange({ bubble: b.id })}
                  className="px-3 py-2 text-xs transition-all duration-200"
                  style={{
                    borderRadius: b.mine,
                    backgroundImage: active
                      ? "linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2))"
                      : "none",
                    backgroundColor: active ? "transparent" : "var(--chat-in)",
                    color: active ? "var(--chat-on-accent)" : "var(--chat-in-text)",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </Row>

          <Row title="Accent">
            {CHAT_ACCENTS.map((a) => {
              const active = prefs.accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => onChange({ accent: a.id })}
                  aria-label={a.label}
                  className="size-9 rounded-full transition-transform duration-200"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                    outline: active ? "2px solid var(--chat-text)" : "none",
                    outlineOffset: "2px",
                    transform: active ? "scale(1.06)" : "none",
                  }}
                />
              );
            })}
          </Row>

          <div
            className="flex items-center justify-between rounded-2xl border px-4 py-3"
            style={{ borderColor: "var(--chat-border)", background: "var(--chat-panel)" }}
          >
            <div className="flex items-center gap-2 text-xs">
              {personal ? <User className="size-4" /> : <Users className="size-4" />}
              <span>{personal ? "Just for me" : "Shared with both of us"}</span>
            </div>
            <button
              onClick={() => onTogglePersonal(!personal)}
              className="relative h-6 w-11 rounded-full transition-colors duration-300"
              style={{
                backgroundImage: personal
                  ? "linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2))"
                  : "none",
                backgroundColor: personal ? "transparent" : "var(--chat-in)",
              }}
              aria-label="Toggle personal theme"
            >
              <span
                className="absolute top-0.5 size-5 rounded-full transition-all duration-300"
                style={{ left: personal ? "1.375rem" : "0.125rem", background: "var(--chat-text)" }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
