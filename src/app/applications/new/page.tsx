import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnimatedGrid from "@/components/AnimatedGrid";
import FloatingSidebar from "@/components/FloatingSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import ApplicationForm from "@/components/applications/ApplicationForm";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedGrid />
      <FloatingSidebar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">new application <span className="text-yellow-500">{"*"}</span></h1>
          <ThemeToggle />
        </div>
        <ApplicationForm />
      </div>
    </main>
  );
}
