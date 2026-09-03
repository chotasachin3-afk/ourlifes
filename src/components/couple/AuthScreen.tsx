import { useState } from "react";
import { Heart, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real sign-in for the two people who share this space.
 * Signing in is step one; the secret code links the account to our couple row,
 * and the existing PIN screen still guards the entry afterwards.
 */
export function AuthScreen({
  needsJoin,
  onJoined,
}: {
  needsJoin: boolean;
  onJoined: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      toast.error("Enter an email and a password of at least 6 characters");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success("Account created — check your email if it asks you to confirm");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  const join = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("join_couple", { _code: code.trim() });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "That code isn't right" : error.message);
      return;
    }
    toast.success("You're in our space 💙");
    onJoined();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Heart className="heart-pulse size-9 fill-primary text-primary" />
      <h1 className="mt-4 text-3xl font-light tracking-wide text-romance">Only Us</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {needsJoin ? "Enter our secret space code" : "Sign in to our world"}
      </p>

      <div className="panel mt-7 w-full max-w-sm space-y-3 p-5">
        {needsJoin ? (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
              <KeyRound className="size-4 text-muted-foreground" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Space code"
                autoCapitalize="characters"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <button
              onClick={join}
              disabled={busy}
              className="w-full rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Join our space
            </button>
          </>
        ) : (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="w-full rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {mode === "signup" ? "I already have an account" : "Create an account"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
