import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Palette, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable } from "@/lib/couple";
import {
  DEFAULT_CHAT_PREFS,
  themeVars,
  type ChatThemePrefs,
} from "@/lib/chat-themes";
import { ChatThemeSheet } from "@/components/couple/ChatThemeSheet";

type Message = {
  id: string;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  sender: string;
  created_at: string;
};

const PERSONAL_KEY = "only-us-chat-theme-personal";
const LOCAL_PREFS_KEY = "only-us-chat-theme";
const ME_KEY = "only-us-chat-me";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ChatTab() {
  const { rows } = useLiveTable<Message>("messages", true);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [personal, setPersonal] = useState(false);
  const [prefs, setPrefs] = useState<ChatThemePrefs>(DEFAULT_CHAT_PREFS);
  const [me, setMe] = useState("me");
  const endRef = useRef<HTMLDivElement>(null);
  // Timestamp of the last local theme edit, so the realtime echo of our own
  // save doesn't revert a newer in-flight selection.
  const localChangeAt = useRef(0);

  // Load remembered choices (personal first, then the shared couple theme).
  useEffect(() => {
    setMe(localStorage.getItem(ME_KEY) || "me");
    const isPersonal = localStorage.getItem(PERSONAL_KEY) === "1";
    setPersonal(isPersonal);
    if (isPersonal) {
      setPrefs(readLocal<ChatThemePrefs>(LOCAL_PREFS_KEY, DEFAULT_CHAT_PREFS));
      return;
    }
    void loadShared().then((p) => p && setPrefs(p));
  }, []);

  // Keep the shared theme in sync between both phones.
  useEffect(() => {
    if (personal) return;
    const channel = supabase
      .channel("live-chat-theme")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_theme" },
        () => {
          if (Date.now() - localChangeAt.current < 2000) return;
          void loadShared().then((p) => p && setPrefs(p));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [personal]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [rows.length]);

  const vars = useMemo(() => themeVars(prefs), [prefs]);

  const applyChange = useCallback(
    async (patch: Partial<ChatThemePrefs>) => {
      localChangeAt.current = Date.now();
      const next = { ...prefs, ...patch };
      setPrefs(next);
      if (personal) {
        localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(next));
        return;
      }
      await saveShared(next);
    },
    [prefs, personal],
  );

  const togglePersonal = useCallback(
    async (value: boolean) => {
      setPersonal(value);
      localStorage.setItem(PERSONAL_KEY, value ? "1" : "0");
      if (value) {
        localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
      } else {
        const shared = await loadShared();
        if (shared) setPrefs(shared);
      }
    },
    [prefs],
  );

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    await supabase.from("messages").insert({ body, sender: me });
  };

  const remove = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
  };

  return (
    <section
      style={vars as React.CSSProperties}
      className="overflow-hidden rounded-3xl border transition-colors duration-500"
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{
          borderColor: "var(--chat-border)",
          background: "var(--chat-panel)",
          color: "var(--chat-text)",
        }}
      >
        <div className="flex items-center gap-2">
          <input
            value={me}
            onChange={(e) => {
              setMe(e.target.value);
              localStorage.setItem(ME_KEY, e.target.value);
            }}
            aria-label="Your name in chat"
            className="w-24 rounded-lg border bg-transparent px-2 py-1 text-xs outline-none"
            style={{ borderColor: "var(--chat-border)", color: "var(--chat-text)" }}
          />
          <span className="text-[11px]" style={{ color: "var(--chat-subtle)" }}>
            you
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-transform duration-200 active:scale-95"
          style={{
            backgroundImage: "linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2))",
            color: "var(--chat-on-accent)",
          }}
        >
          <Palette className="size-3.5" />
          Theme
        </button>
      </div>

      <div
        className="h-[58vh] space-y-2 overflow-y-auto px-3 py-4 transition-all duration-500"
        style={{
          backgroundColor: "var(--chat-surface)",
          backgroundImage: "var(--chat-wallpaper)",
          backgroundSize: "var(--chat-wallpaper-size)",
          color: "var(--chat-text)",
        }}
      >
        {rows.length === 0 && (
          <p className="pt-16 text-center text-sm" style={{ color: "var(--chat-subtle)" }}>
            Say something sweet…
          </p>
        )}
        {rows.map((m) => {
          const mine = m.sender === me;
          return (
            <div key={m.id} className={`float-in flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="group max-w-[78%]">
                <div
                  className="text-sm leading-relaxed transition-all duration-300"
                  style={{
                    borderRadius: mine ? "var(--bubble-mine)" : "var(--bubble-theirs)",
                    padding: "var(--bubble-pad)",
                    backgroundImage: mine
                      ? "linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2))"
                      : "none",
                    backgroundColor: mine ? "transparent" : "var(--chat-in)",
                    color: mine ? "var(--chat-on-accent)" : "var(--chat-in-text)",
                  }}
                >
                  {m.media_url && (
                    <img
                      src={m.media_url}
                      alt={m.body ?? "Shared moment"}
                      className="mb-1 max-h-60 rounded-xl object-cover"
                      loading="lazy"
                    />
                  )}
                  {m.body}
                </div>
                <div
                  className={`mt-0.5 flex items-center gap-2 px-1 text-[10px] ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                  style={{ color: "var(--chat-subtle)" }}
                >
                  <span>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => remove(m.id)}
                    aria-label="Delete message"
                    className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div
        className="flex items-center gap-2 border-t px-3 py-3"
        style={{ borderColor: "var(--chat-border)", background: "var(--chat-panel)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 rounded-full border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors duration-300"
          style={{ borderColor: "var(--chat-border)", color: "var(--chat-text)" }}
        />
        <button
          onClick={send}
          aria-label="Send message"
          className="flex size-10 items-center justify-center rounded-full transition-transform duration-200 active:scale-95"
          style={{
            backgroundImage: "linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2))",
            color: "var(--chat-on-accent)",
          }}
        >
          <Send className="size-4" />
        </button>
      </div>

      <ChatThemeSheet
        open={open}
        prefs={prefs}
        personal={personal}
        onClose={() => setOpen(false)}
        onChange={applyChange}
        onTogglePersonal={togglePersonal}
      />
    </section>
  );
}

async function loadShared(): Promise<ChatThemePrefs | null> {
  const client = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        maybeSingle: () => Promise<{ data: Record<string, string> | null }>;
      };
    };
  };
  const { data } = await client.from("chat_theme").select("*").maybeSingle();
  if (!data) return null;
  return {
    theme: data["theme"] ?? DEFAULT_CHAT_PREFS.theme,
    wallpaper: data["wallpaper"] ?? DEFAULT_CHAT_PREFS.wallpaper,
    bubble: data["bubble"] ?? DEFAULT_CHAT_PREFS.bubble,
    accent: data["accent"] ?? DEFAULT_CHAT_PREFS.accent,
  };
}

async function saveShared(prefs: ChatThemePrefs) {
  const client = supabase as unknown as {
    from: (t: string) => {
      upsert: (v: Record<string, unknown>, o: { onConflict: string }) => Promise<{ error: unknown }>;
    };
  };
  await client
    .from("chat_theme")
    .upsert({ id: "main", ...prefs, updated_at: new Date().toISOString() }, { onConflict: "couple_id,id" });
}
