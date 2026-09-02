import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Images, StickyNote, Music2, Gamepad2, Cake, Lock, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/lib/couple";
import { PinLock } from "@/components/couple/PinLock";
import { Header } from "@/components/couple/Header";
import { Gallery } from "@/components/couple/Gallery";
import { NotesTab } from "@/components/couple/NotesTab";
import { MusicTab } from "@/components/couple/MusicTab";
import { GamesTab } from "@/components/couple/GamesTab";
import { BirthdayTab } from "@/components/couple/BirthdayTab";
import { PinSettings } from "@/components/couple/PinSettings";
import { ChatTab } from "@/components/couple/ChatTab";
import { MoodTracker } from "@/components/couple/MoodTracker";
import { WelcomePopup } from "@/components/couple/WelcomePopup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Universe — A Private World for Two" },
      {
        name: "description",
        content:
          "A private romantic space for two: live chat with photos and videos, shared gallery, love notes, playlist, couple games and a birthday surprise.",
      },
      { property: "og:title", content: "Our Universe — A Private World for Two" },
      {
        property: "og:description",
        content:
          "Live chat, photos, love notes, our playlist, couple games and a birthday surprise — locked behind our own PIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Index,
});

type Tab = "photos" | "chat" | "notes" | "music" | "games" | "birthday";

const TABS: [Tab, string, typeof Images][] = [
  ["photos", "Photos", Images],
  ["chat", "Chat", MessageCircle],
  ["notes", "Notes", StickyNote],
  ["music", "Music", Music2],
  ["games", "Games", Gamepad2],
  ["birthday", "Birthday", Cake],
];

function Index() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>("photos");

  const load = useCallback(async () => {
    const { data } = await supabase.from("settings").select("*").eq("id", "main").maybeSingle();
    if (data) setSettings(data as Settings);
  }, []);

  useEffect(() => {
    load();
    if (sessionStorage.getItem("only-us-unlocked") === "1") setUnlocked(true);
  }, [load]);

  if (!settings) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Lock className="size-5 animate-pulse text-muted-foreground" />
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="relative">
        <div className="relative z-10">
          <PinLock
            pin={settings.pin}
            onUnlock={() => {
              sessionStorage.setItem("only-us-unlocked", "1");
              setUnlocked(true);
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <WelcomePopup name="Laiba" />

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-md pb-28">
        {/* Her name stays present on every tab without touching the open page */}
        <div className="pointer-events-none fixed left-1/2 top-2 z-30 -translate-x-1/2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
          Laiba 💙
        </div>

        <Header settings={settings} reload={load} />

        <div className="mb-4 flex flex-col gap-3">
          <MoodTracker />
          <PinSettings settings={settings} reload={load} />
        </div>

        <div className="px-4">
          {tab === "photos" && <Gallery />}
          {tab === "chat" && <ChatTab />}
          {tab === "notes" && <NotesTab />}
          {tab === "music" && <MusicTab />}
          {tab === "games" && <GamesTab />}
          {tab === "birthday" && <BirthdayTab settings={settings} reload={load} />}
        </div>

        <nav className="fixed inset-x-0 bottom-3 z-20 mx-auto w-full max-w-md px-3 pb-[env(safe-area-inset-bottom)]">
          <ul className="flex items-center justify-between gap-1 rounded-3xl border border-border/50 bg-card/75 p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
            {TABS.map(([key, label, Icon]) => (
              <li key={key} className="flex-1">
                <button
                  onClick={() => setTab(key)}
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[9px] tracking-wide transition-all duration-200 ${
                    tab === key
                      ? "romance-gradient text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
