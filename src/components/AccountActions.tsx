"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AccountActions() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast("Signed out successfully.");
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      await supabase.auth.signOut();
      router.push("/login");
      toast("Account deleted.");
    } else {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border dark:bg-white bg-neutral-800 text-white dark:text-neutral-800 backdrop-blur-sm px-5 py-3 text-sm font-medium hover:bg-red-900 dark:hover:bg-red-900 dark:hover:text-white transition-colors text-left"
      >
        Sign out
      </button>

      {/* delete */}
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-background/60 backdrop-blur-sm px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Delete account
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently removes your account and all applications.
          </p>
        </div>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
