
CREATE TABLE public.settings (
  id text PRIMARY KEY DEFAULT 'main',
  photo_url text,
  start_date date NOT NULL DEFAULT current_date,
  pin text NOT NULL DEFAULT '1234',
  names text NOT NULL DEFAULT 'Us',
  birthday_date timestamptz,
  birthday_letter text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO anon, authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open photos" ON public.photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body text NOT NULL,
  author text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO anon, authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open notes" ON public.notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music TO anon, authenticated;
GRANT ALL ON public.music TO service_role;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open music" ON public.music FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.truth_or_dare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'truth',
  prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.truth_or_dare TO anon, authenticated;
GRANT ALL ON public.truth_or_dare TO service_role;
ALTER TABLE public.truth_or_dare ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open tod" ON public.truth_or_dare FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.quiz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL DEFAULT '{}',
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz TO anon, authenticated;
GRANT ALL ON public.quiz TO service_role;
ALTER TABLE public.quiz ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open quiz" ON public.quiz FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tictactoe (
  id text PRIMARY KEY DEFAULT 'main',
  board text[] NOT NULL DEFAULT ARRAY['','','','','','','','',''],
  turn text NOT NULL DEFAULT 'X',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tictactoe TO anon, authenticated;
GRANT ALL ON public.tictactoe TO service_role;
ALTER TABLE public.tictactoe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open ttt" ON public.tictactoe FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.settings (id, start_date, pin, names, birthday_date, birthday_letter)
VALUES ('main', current_date - 365, '1234', 'Us',
  (date_trunc('year', now()) + interval '1 year')::timestamptz,
  'Happy Birthday, my love. Every day with you feels like the first one all over again. Thank you for being my home, my safest place, and my favourite story. Here''s to many more years of us.');

INSERT INTO public.tictactoe (id) VALUES ('main');

INSERT INTO public.truth_or_dare (kind, prompt) VALUES
 ('truth','What was the exact moment you knew you liked me?'),
 ('truth','What is one thing about me you have never told anyone?'),
 ('truth','What is your favourite memory of us so far?'),
 ('truth','What is something you want us to do together this year?'),
 ('truth','When did you last cry because of me, happy or sad?'),
 ('truth','What is the first thing you noticed about me?'),
 ('truth','What song reminds you of me the most?'),
 ('truth','What is one thing you wish I did more often?'),
 ('dare','Send me a voice note singing our song.'),
 ('dare','Text me the cheesiest pickup line you can think of.'),
 ('dare','Change your wallpaper to a photo of us for a week.'),
 ('dare','Give me a 30 second compliment marathon.'),
 ('dare','Recreate our first date pose and send the photo.'),
 ('dare','Write me a 4 line poem right now.'),
 ('dare','Post a photo of us on your story.'),
 ('dare','Do your best impression of me.');

INSERT INTO public.quiz (question, options, answer) VALUES
 ('What is my comfort food?', ARRAY['Pizza','Ice cream','Noodles','Chocolate'], 'Ice cream'),
 ('What is my dream travel destination?', ARRAY['Paris','Japan','Maldives','Iceland'], 'Japan'),
 ('What is my go-to way to relax?', ARRAY['Music','Sleeping','Long walks','Movies'], 'Music'),
 ('Which do I love more?', ARRAY['Sunrise','Sunset','Rain','Snow'], 'Rain');

ALTER PUBLICATION supabase_realtime ADD TABLE public.tictactoe;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.music;
ALTER PUBLICATION supabase_realtime ADD TABLE public.truth_or_dare;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
