CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL DEFAULT current_couple_id() REFERENCES public.couples(id),
  storage_path text NOT NULL,
  thumb_url text,
  caption text,
  uploader text,
  uploader_id uuid DEFAULT auth.uid(),
  duration numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos couple only" ON public.videos FOR ALL TO authenticated
USING (couple_id = current_couple_id())
WITH CHECK (couple_id = current_couple_id());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;

CREATE POLICY "couple videos read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'couple-videos' AND (storage.foldername(name))[1] = current_couple_id()::text);

CREATE POLICY "couple videos insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'couple-videos' AND (storage.foldername(name))[1] = current_couple_id()::text);

CREATE POLICY "couple videos update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'couple-videos' AND (storage.foldername(name))[1] = current_couple_id()::text)
WITH CHECK (bucket_id = 'couple-videos' AND (storage.foldername(name))[1] = current_couple_id()::text);

CREATE POLICY "couple videos delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'couple-videos' AND (storage.foldername(name))[1] = current_couple_id()::text);