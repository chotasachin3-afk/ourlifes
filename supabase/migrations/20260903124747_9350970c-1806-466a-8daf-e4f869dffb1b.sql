-- 1. Couple / shared space
CREATE TABLE IF NOT EXISTS public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'A & A',
  join_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT 'Love',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.couples TO authenticated;
GRANT SELECT, UPDATE ON public.couple_members TO authenticated;
GRANT ALL ON public.couples TO service_role;
GRANT ALL ON public.couple_members TO service_role;

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

-- Seed the single existing space (fixed id so backfill is deterministic)
INSERT INTO public.couples (id, name, join_code)
VALUES ('11111111-1111-4111-8111-111111111111', 'A & A', 'AANDA-2026')
ON CONFLICT (id) DO NOTHING;

-- 2. Helper functions (security definer -> no RLS recursion)
CREATE OR REPLACE FUNCTION public.current_couple_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.join_couple(_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cid uuid; _existing uuid; _count int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT couple_id INTO _existing FROM public.couple_members WHERE user_id = auth.uid();
  IF _existing IS NOT NULL THEN RETURN _existing; END IF;

  SELECT id INTO _cid FROM public.couples WHERE upper(join_code) = upper(btrim(_code));
  IF _cid IS NULL THEN RAISE EXCEPTION 'Invalid code'; END IF;

  SELECT count(*) INTO _count FROM public.couple_members WHERE couple_id = _cid;
  IF _count >= 2 THEN RAISE EXCEPTION 'This space already has two people'; END IF;

  INSERT INTO public.couple_members (couple_id, user_id, display_name)
  VALUES (_cid, auth.uid(),
    COALESCE(NULLIF(split_part((SELECT email FROM auth.users WHERE id = auth.uid()), '@', 1), ''), 'Love'));

  RETURN _cid;
END $$;

GRANT EXECUTE ON FUNCTION public.current_couple_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_couple(text) TO authenticated;

CREATE POLICY "members read their couple" ON public.couples
  FOR SELECT TO authenticated USING (id = public.current_couple_id());
CREATE POLICY "members read couple members" ON public.couple_members
  FOR SELECT TO authenticated USING (couple_id = public.current_couple_id());
CREATE POLICY "member updates own nickname" ON public.couple_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Additive couple_id on every existing table + backfill + couple-scoped RLS
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['settings','photos','notes','music','quiz','truth_or_dare','tictactoe','messages','bingo','doodle_strokes','moods']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS couple_id uuid', t);
    EXECUTE format('UPDATE public.%I SET couple_id = %L WHERE couple_id IS NULL', t, '11111111-1111-4111-8111-111111111111');
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN couple_id SET DEFAULT public.current_couple_id()', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN couple_id SET NOT NULL', t);
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE RESTRICT', t, t || '_couple_id_fkey');
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (couple_id)', t || '_couple_id_idx', t);

    -- drop the old wide-open policies (data untouched)
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'open ' || t, t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (couple_id = public.current_couple_id()) WITH CHECK (couple_id = public.current_couple_id())', t || ' couple only', t);
  END LOOP;
END $$;

-- legacy policy names that don't follow the "open <table>" pattern
DROP POLICY IF EXISTS "open ttt" ON public.tictactoe;
DROP POLICY IF EXISTS "open tod" ON public.truth_or_dare;
DROP POLICY IF EXISTS "open doodle" ON public.doodle_strokes;
DROP POLICY IF EXISTS "open bingo" ON public.bingo;
DROP POLICY IF EXISTS "open messages" ON public.messages;
DROP POLICY IF EXISTS "open moods" ON public.moods;

-- 4. Trustworthy chat sender identity (old text column preserved)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "messages couple only" ON public.messages;
CREATE POLICY "messages read" ON public.messages
  FOR SELECT TO authenticated USING (couple_id = public.current_couple_id());
CREATE POLICY "messages insert as self" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (couple_id = public.current_couple_id() AND sender_id = auth.uid());
CREATE POLICY "messages update" ON public.messages
  FOR UPDATE TO authenticated USING (couple_id = public.current_couple_id())
  WITH CHECK (couple_id = public.current_couple_id());
CREATE POLICY "messages delete" ON public.messages
  FOR DELETE TO authenticated USING (couple_id = public.current_couple_id());

-- 5. Private chat media: only members of the space
DROP POLICY IF EXISTS "chat media members read" ON storage.objects;
DROP POLICY IF EXISTS "chat media members write" ON storage.objects;
DROP POLICY IF EXISTS "chat media members delete" ON storage.objects;
CREATE POLICY "chat media members read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'chat-media' AND public.current_couple_id() IS NOT NULL);
CREATE POLICY "chat media members write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-media' AND public.current_couple_id() IS NOT NULL);
CREATE POLICY "chat media members delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-media' AND public.current_couple_id() IS NOT NULL);