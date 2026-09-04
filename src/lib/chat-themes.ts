export type ChatThemePrefs = {
  theme: string;
  wallpaper: string;
  bubble: string;
  accent: string;
};

export const DEFAULT_CHAT_PREFS: ChatThemePrefs = {
  theme: "midnight",
  wallpaper: "aurora",
  bubble: "rounded",
  accent: "rose",
};

export type ChatTheme = {
  id: string;
  label: string;
  surface: string;
  panel: string;
  text: string;
  subtle: string;
  incoming: string;
  incomingText: string;
  border: string;
};

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: "midnight",
    label: "Midnight Rose",
    surface: "oklch(0.16 0.045 340)",
    panel: "oklch(0.21 0.05 342 / 0.72)",
    text: "oklch(0.95 0.02 350)",
    subtle: "oklch(0.74 0.04 345)",
    incoming: "oklch(0.28 0.055 340 / 0.9)",
    incomingText: "oklch(0.95 0.02 350)",
    border: "oklch(0.34 0.06 340 / 0.6)",
  },
  {
    id: "noir",
    label: "Velvet Noir",
    surface: "oklch(0.14 0.012 280)",
    panel: "oklch(0.2 0.015 280 / 0.7)",
    text: "oklch(0.96 0.005 280)",
    subtle: "oklch(0.72 0.01 280)",
    incoming: "oklch(0.26 0.015 280 / 0.9)",
    incomingText: "oklch(0.96 0.005 280)",
    border: "oklch(0.34 0.015 280 / 0.6)",
  },
  {
    id: "ocean",
    label: "Deep Ocean",
    surface: "oklch(0.17 0.05 240)",
    panel: "oklch(0.23 0.06 240 / 0.7)",
    text: "oklch(0.95 0.02 230)",
    subtle: "oklch(0.75 0.04 230)",
    incoming: "oklch(0.3 0.06 240 / 0.9)",
    incomingText: "oklch(0.96 0.02 230)",
    border: "oklch(0.36 0.06 240 / 0.6)",
  },
  {
    id: "sand",
    label: "Warm Sand",
    surface: "oklch(0.95 0.02 80)",
    panel: "oklch(0.99 0.01 80 / 0.8)",
    text: "oklch(0.28 0.03 60)",
    subtle: "oklch(0.5 0.03 60)",
    incoming: "oklch(1 0 0 / 0.92)",
    incomingText: "oklch(0.28 0.03 60)",
    border: "oklch(0.85 0.03 70 / 0.8)",
  },
  {
    id: "forest",
    label: "Moss Forest",
    surface: "oklch(0.18 0.04 155)",
    panel: "oklch(0.24 0.05 155 / 0.7)",
    text: "oklch(0.95 0.02 150)",
    subtle: "oklch(0.75 0.04 150)",
    incoming: "oklch(0.3 0.05 155 / 0.9)",
    incomingText: "oklch(0.95 0.02 150)",
    border: "oklch(0.36 0.05 155 / 0.6)",
  },
  {
    id: "mono",
    label: "Paper White",
    surface: "oklch(0.97 0 0)",
    panel: "oklch(1 0 0 / 0.85)",
    text: "oklch(0.22 0 0)",
    subtle: "oklch(0.5 0 0)",
    incoming: "oklch(0.93 0 0)",
    incomingText: "oklch(0.22 0 0)",
    border: "oklch(0.86 0 0)",
  },
];

export type ChatWallpaper = { id: string; label: string; css: string };

export const CHAT_WALLPAPERS: ChatWallpaper[] = [
  { id: "plain", label: "Plain", css: "none" },
  {
    id: "aurora",
    label: "Aurora",
    css: "radial-gradient(120% 80% at 10% 0%, color-mix(in oklab, var(--chat-accent) 26%, transparent) 0%, transparent 60%), radial-gradient(110% 80% at 95% 15%, color-mix(in oklab, var(--chat-accent-2) 24%, transparent) 0%, transparent 65%)",
  },
  {
    id: "glow",
    label: "Soft Glow",
    css: "radial-gradient(90% 60% at 50% 100%, color-mix(in oklab, var(--chat-accent) 28%, transparent) 0%, transparent 70%)",
  },
  {
    id: "hearts",
    label: "Hearts",
    css: "radial-gradient(circle at 20% 25%, color-mix(in oklab, var(--chat-accent) 22%, transparent) 0 6px, transparent 7px), radial-gradient(circle at 70% 65%, color-mix(in oklab, var(--chat-accent-2) 20%, transparent) 0 5px, transparent 6px)",
  },
  {
    id: "grid",
    label: "Fine Grid",
    css: "linear-gradient(color-mix(in oklab, var(--chat-accent) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--chat-accent) 12%, transparent) 1px, transparent 1px)",
  },
  {
    id: "silk",
    label: "Silk",
    css: "repeating-linear-gradient(135deg, color-mix(in oklab, var(--chat-accent) 9%, transparent) 0 14px, transparent 14px 34px)",
  },
];

export const WALLPAPER_SIZE: Record<string, string> = {
  hearts: "120px 120px",
  grid: "26px 26px, 26px 26px",
  plain: "auto",
  aurora: "auto",
  glow: "auto",
  silk: "auto",
};

export type ChatAccent = { id: string; label: string; from: string; to: string; on: string };

export const CHAT_ACCENTS: ChatAccent[] = [
  { id: "rose", label: "Rose Gold", from: "oklch(0.68 0.16 12)", to: "oklch(0.82 0.11 78)", on: "oklch(0.18 0.04 340)" },
  { id: "violet", label: "Violet", from: "oklch(0.62 0.19 300)", to: "oklch(0.66 0.16 340)", on: "oklch(0.15 0.03 300)" },
  { id: "azure", label: "Azure", from: "oklch(0.66 0.15 240)", to: "oklch(0.75 0.12 200)", on: "oklch(0.15 0.03 240)" },
  { id: "emerald", label: "Emerald", from: "oklch(0.68 0.14 160)", to: "oklch(0.78 0.12 130)", on: "oklch(0.16 0.03 160)" },
  { id: "sunset", label: "Sunset", from: "oklch(0.7 0.17 30)", to: "oklch(0.82 0.14 70)", on: "oklch(0.18 0.04 30)" },
  { id: "graphite", label: "Graphite", from: "oklch(0.42 0.01 280)", to: "oklch(0.58 0.01 280)", on: "oklch(0.98 0 0)" },
];

export type BubbleStyle = { id: string; label: string; mine: string; theirs: string; pad: string };

export const BUBBLE_STYLES: BubbleStyle[] = [
  { id: "rounded", label: "Rounded", mine: "1.25rem 1.25rem 0.35rem 1.25rem", theirs: "1.25rem 1.25rem 1.25rem 0.35rem", pad: "0.6rem 0.9rem" },
  { id: "pill", label: "Pill", mine: "999px", theirs: "999px", pad: "0.55rem 1.05rem" },
  { id: "soft", label: "Soft Square", mine: "0.6rem", theirs: "0.6rem", pad: "0.65rem 0.9rem" },
  { id: "sharp", label: "Sharp", mine: "0.15rem", theirs: "0.15rem", pad: "0.6rem 0.9rem" },
];

export function themeVars(prefs: ChatThemePrefs): Record<string, string> {
  const t = CHAT_THEMES.find((x) => x.id === prefs.theme) ?? CHAT_THEMES[0];
  const a = CHAT_ACCENTS.find((x) => x.id === prefs.accent) ?? CHAT_ACCENTS[0];
  const w = CHAT_WALLPAPERS.find((x) => x.id === prefs.wallpaper) ?? CHAT_WALLPAPERS[0];
  const b = BUBBLE_STYLES.find((x) => x.id === prefs.bubble) ?? BUBBLE_STYLES[0];
  return {
    "--chat-surface": t.surface,
    "--chat-panel": t.panel,
    "--chat-text": t.text,
    "--chat-subtle": t.subtle,
    "--chat-in": t.incoming,
    "--chat-in-text": t.incomingText,
    "--chat-border": t.border,
    "--chat-accent": a.from,
    "--chat-accent-2": a.to,
    "--chat-on-accent": a.on,
    "--chat-wallpaper": w.css,
    "--chat-wallpaper-size": WALLPAPER_SIZE[w.id] ?? "auto",
    "--bubble-mine": b.mine,
    "--bubble-theirs": b.theirs,
    "--bubble-pad": b.pad,
  };
}
