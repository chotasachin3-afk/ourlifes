import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Settings = {
  id: string;
  photo_url: string | null;
  start_date: string;
  pin: string;
  names: string;
  birthday_date: string | null;
  birthday_letter: string | null;
};

export type Photo = { id: string; url: string; caption: string | null; created_at: string };
export type Note = { id: string; body: string; author: string | null; created_at: string };
export type Track = { id: string; title: string | null; url: string; created_at: string };
export type TodItem = { id: string; kind: string; prompt: string };
export type QuizItem = { id: string; question: string; options: string[]; answer: string };
export type Board = { id: string; board: string[]; turn: string };

/** Subscribe to a table and keep a local list in sync across both phones. */
export function useLiveTable<T>(table: string, ascending = false) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending });
    setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table, ascending]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`live-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, load]);

  return { rows, loading, reload: load };
}

/** Shrink a picked image so it stays small enough to sync instantly. */
export function resizeImage(file: File, max = 1100, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not open that image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function daysBetween(from: string) {
  const start = new Date(`${from}T00:00:00`);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

export function spotifyEmbed(url: string) {
  const match = url.match(/(track|album|playlist|episode|artist)[/:]([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
}
