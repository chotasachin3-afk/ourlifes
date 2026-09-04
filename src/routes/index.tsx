import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Images, StickyNote, MessageCircle, Music2, Gamepad2, Cake, Lock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/lib/couple";
import { unlockCoupleSession } from "@/lib/couple-session.functions";

import { PinLock } from "@/components/couple/PinLock";
import { Header } from "@/components/couple/Header";
import { Gallery } from "@/components/couple/Gallery";
import { NotesTab } from "@/components/couple/NotesTab";
import { ChatTab } from "@/components/couple/ChatTab";
import { MusicTab } from "@/components/couple/MusicTab";
import { GamesTab } from "@/components/couple/GamesTab";
import { BirthdayTab } from "@/components/couple/BirthdayTab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Only Us — Our Private Little World" },
      {
        name: "description",
        content:
          "A private space for two: shared photo gallery, love notes, our playlist, couple games and a birthday surprise, synced live between both phones.",
      },
      { property: "og:title", content: "Only Us — Our Private Little World" },
      {
        property: "og:description",
        content:
          "Photos, love notes, our playlist, couple games and a birthday surprise — locked behind our own PIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Index,
});

type Tab = "photos" | "notes" | "chat" | "music" | "games" | "birthday";

const TABS: [Tab, string, typeof Images][] = [
  ["photos", "Photos", Images],
  ["notes", "Notes", StickyNote],
  ["chat", "Chat", MessageCircle],
  ["music", "Music", Music2],
  ["games", "Games", Gamepad2],
  ["birthday", "Birthday", Cake],
];

function Index() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [welcome, setWelcome] = useState(false);
  const [tab, setTab] = useState<Tab>("photos");

  const load = useCallback(async () => {
    const { data } = await supabase.from("settings").select("*").eq("id", "main").maybeSingle();
    if (data) setSettings(data as Settings);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && sessionStorage.getItem("only-us-unlocked") === "1") {
        await load();
        setUnlocked(true);
      }
      setChecking(false);
    })();
  }, [load]);

  const verify = useCallback(async (pin: string) => {
    const res = await unlockCoupleSession({ data: { pin } });
    if (!res.ok) return false;
    const { error } = await supabase.auth.setSession({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
    });
    return !error;
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Lock className="size-5 animate-pulse text-muted-foreground" />
      </main>
    );
  }

  if (!unlocked || !settings) {
    return (
      <main>
        <PinLock
          verify={verify}
          onUnlock={async () => {
            sessionStorage.setItem("only-us-unlocked", "1");
            await load();
            setUnlocked(true);
            setWelcome(true);
            window.setTimeout(() => setWelcome(false), 2200);
          }}
        />
      </main>
    );
  }


  return (
    <main className="mx-auto min-h-screen w-full max-w-md pb-28">
      {welcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="rounded-3xl border border-border/70 bg-card/80 px-10 py-8 text-center">
            <Heart className="heart-pulse mx-auto size-8 fill-primary text-primary" />
            <p className="mt-4 text-2xl font-light text-romance">Welcome back</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings.names}</p>
          </div>
        </div>
      )}
      <Header settings={settings} reload={load} />


      <div className="px-4">
        {tab === "photos" && <Gallery />}
        {tab === "notes" && <NotesTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "music" && <MusicTab />}
        {tab === "games" && <GamesTab />}
        {tab === "birthday" && <BirthdayTab settings={settings} reload={load} />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border/70 bg-background/85 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl">
        <ul className="flex">
          {TABS.map(([key, label, Icon]) => (
            <li key={key} className="flex-1">
              <button
                onClick={() => setTab(key)}
                className={`flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[10px] tracking-wide transition-colors ${
                  tab === key ? "text-primary" : "text-muted-foreground"
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
  );
}
