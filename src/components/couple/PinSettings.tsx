import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/lib/couple";
import { toast } from "sonner";

export function PinSettings({ settings, reload }: { settings: Settings; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (current !== settings.pin) {
      toast.error("Current PIN is wrong");
      return;
    }
    if (!/^\d{4}$/.test(next)) {
      toast.error("New PIN must be 4 digits");
      return;
    }
    if (next !== confirm) {
      toast.error("PINs don't match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("settings").update({ pin: next }).eq("id", "main");
    setBusy(false);
    if (error) {
      toast.error("Couldn't save the new PIN");
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setOpen(false);
    reload();
    toast.success("Our secret code is updated");
  };

  const field = (
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    label: string,
  ) => (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-primary"
      />
    </div>
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Change our PIN"
        className="mx-auto mt-2 flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground"
      >
        <KeyRound className="size-3.5" /> Change PIN
      </button>
    );
  }

  return (
    <section className="panel relative mx-4 space-y-3 p-4">
      <button
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-3 top-3 text-muted-foreground"
      >
        <X className="size-4" />
      </button>
      {field(current, setCurrent, "••••", "Current PIN")}
      {field(next, setNext, "••••", "New PIN")}
      {field(confirm, setConfirm, "••••", "Confirm new PIN")}
      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save new PIN"}
      </button>
    </section>
  );
}
