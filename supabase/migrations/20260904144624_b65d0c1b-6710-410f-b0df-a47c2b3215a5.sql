CREATE TABLE public.chat_theme (
  id text NOT NULL DEFAULT 'main'::text,
  couple_id uuid NOT NULL DEFAULT current_couple_id() REFERENCES public.couples(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'midnight',
  wallpaper text NOT NULL DEFAULT 'aurora',
  bubble text NOT NULL DEFAULT 'rounded',
  accent text NOT NULL DEFAULT 'rose',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (couple_id, id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_theme TO authenticated;
GRANT ALL ON public.chat_theme TO service_role;
ALTER TABLE public.chat_theme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_theme couple only" ON public.chat_theme FOR ALL TO authenticated USING (couple_id = current_couple_id()) WITH CHECK (couple_id = current_couple_id());
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_theme;
ALTER TABLE public.chat_theme REPLICA IDENTITY FULL;