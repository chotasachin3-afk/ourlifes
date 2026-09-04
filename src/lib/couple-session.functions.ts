import { createServerFn } from "@tanstack/react-start";

/**
 * PIN-gated session mint.
 *
 * The 4-digit PIN never leaves the server unverified, and no credential,
 * service key or password ever reaches the browser. On a correct PIN the
 * server mints a short-lived Supabase session for the couple's own member
 * account, so every later read/write still goes through the existing
 * member-only RLS policies.
 */
export const unlockCoupleSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const pin = (data as { pin?: unknown })?.pin;
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) throw new Error("Invalid code");
    return { pin };
  })
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("id, pin, couple_id")
      .limit(1)
      .maybeSingle();

    if (!settings || settings.pin !== data.pin) {
      return { ok: false as const };
    }

    const email = `space-${settings.couple_id}@only-us.app`;

    // Find (or create) the couple's own account. Its password is random and
    // discarded — sign-in only ever happens through this PIN-gated flow.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let userId = list?.users.find((u) => u.email === email)?.id;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: `${crypto.randomUUID()}${crypto.randomUUID()}`,
      });
      if (error || !created.user) throw new Error(error?.message ?? "Could not open the space");
      userId = created.user.id;
    }

    const { data: member } = await supabaseAdmin
      .from("couple_members")
      .select("id")
      .eq("couple_id", settings.couple_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!member) {
      const { error } = await supabaseAdmin
        .from("couple_members")
        .insert({ couple_id: settings.couple_id, user_id: userId, display_name: "Us" });
      if (error) throw new Error(error.message);
    }

    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkError || !tokenHash) throw new Error(linkError?.message ?? "Could not open the space");

    const publicClient = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: verified, error: verifyError } = await publicClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });
    if (verifyError || !verified.session) {
      throw new Error(verifyError?.message ?? "Could not open the space");
    }

    return {
      ok: true as const,
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    };
  });
