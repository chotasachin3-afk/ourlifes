REVOKE ALL ON FUNCTION public.current_couple_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_couple(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_couple_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_couple(text) TO authenticated;