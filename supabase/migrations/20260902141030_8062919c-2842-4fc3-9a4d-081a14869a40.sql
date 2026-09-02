
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid primary key default gen_random_uuid(),
  body text,
  media_url text,
  media_type text,
  sender text not null default 'me',
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon, authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.bingo (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bingo TO anon, authenticated;
GRANT ALL ON public.bingo TO service_role;
ALTER TABLE public.bingo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open bingo" ON public.bingo FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.bingo (label) VALUES
 ('Cooked together'),('First date'),('Watched a sunrise'),('Danced in the kitchen'),
 ('Road trip'),('Matching outfits'),('Rain walk'),('Wrote a letter'),
 ('Movie marathon'),('Star gazing'),('Beach day'),('Baked a cake'),
 ('Long call till 3am'),('Surprise gift'),('Picnic'),('Sang together');

CREATE TABLE IF NOT EXISTS public.doodle_strokes (
  id uuid primary key default gen_random_uuid(),
  points jsonb not null,
  color text not null default '#f3f0df',
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doodle_strokes TO anon, authenticated;
GRANT ALL ON public.doodle_strokes TO service_role;
ALTER TABLE public.doodle_strokes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open doodle" ON public.doodle_strokes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.moods (
  id text primary key,
  emoji text not null default '💖',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moods TO anon, authenticated;
GRANT ALL ON public.moods TO service_role;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open moods" ON public.moods FOR ALL USING (true) WITH CHECK (true);
INSERT INTO public.moods (id, emoji) VALUES ('her','💖'),('him','😊') ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bingo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doodle_strokes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;

CREATE POLICY "chat media read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
CREATE POLICY "chat media write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media');
CREATE POLICY "chat media delete" ON storage.objects FOR DELETE USING (bucket_id = 'chat-media');
