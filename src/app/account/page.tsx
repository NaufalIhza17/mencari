import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnimatedGrid from "@/components/AnimatedGrid";
import FloatingSidebar from "@/components/FloatingSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import AccountActions from "@/components/AccountActions";
import { format } from "date-fns";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name || "User";
  const email = user.email || "";
  const joined = format(new Date(user.created_at), "MMMM yyyy");
  const initial = name.charAt(0).toUpperCase();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedGrid />
      <FloatingSidebar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">account</h1>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-3">
          {/* profile card */}
          <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center text-base font-semibold bg-muted shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          {/* joined date */}
          <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">{joined}</span>
          </div>

          {/* auth provider */}
          <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Signed in with
            </span>
            <span className="text-sm font-medium">Google</span>
          </div>

          {/* actions */}
          <AccountActions />
        </div>
      </div>
    </main>
  );
}
