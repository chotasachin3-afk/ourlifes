import { useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signOut, type CoupleMember } from "@/lib/auth";

/** Nickname is display-only and lives apart from the real account id. */
export function NameSettings({
  member,
  reload,
}: {
  member: CoupleMember;
  reload: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member.display_name);

  const save = async () => {
    const value = name.trim() || "Love";
    const { error } = await supabase
      .from("couple_members")
      .update({ display_name: value })
      .eq("user_id", member.user_id);
    if (error) return toast.error("Couldn't save that name");
    toast.success("Saved 💙");
    setOpen(false);
    reload();
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          <Pencil className="size-3" /> {member.display_name}
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          <LogOut className="size-3" /> Sign out
        </button>
      </div>

      {open && (
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Baby, Love, …"
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={save}
            className="rounded-xl romance-gradient px-4 text-sm text-primary-foreground"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
