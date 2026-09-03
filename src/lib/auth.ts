import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type CoupleMember = {
  id: string;
  couple_id: string;
  user_id: string;
  display_name: string;
};

/**
 * Real authentication state for the shared A&A space.
 * `member` is the row that links this account to the couple — it is the only
 * trustworthy identity source (never localStorage).
 */
export function useCoupleAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<CoupleMember | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMember = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setMember(null);
      return;
    }
    const { data } = await supabase
      .from("couple_members")
      .select("id, couple_id, user_id, display_name")
      .eq("user_id", userId)
      .maybeSingle();
    setMember((data as CoupleMember) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      void loadMember(next?.user.id).then(() => active && setLoading(false));
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void loadMember(data.session?.user.id).then(() => active && setLoading(false));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadMember]);

  const refreshMember = useCallback(
    () => loadMember(session?.user.id),
    [loadMember, session],
  );

  return { session, member, loading, refreshMember };
}

export async function signOut() {
  sessionStorage.removeItem("only-us-unlocked");
  sessionStorage.removeItem("only-us-greeted");
  await supabase.auth.signOut();
}
