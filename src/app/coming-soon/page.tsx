import AnimatedGrid from "@/components/AnimatedGrid";

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 overflow-hidden">
      <AnimatedGrid />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className="text-5xl font-bold tracking-tight">mencari <span className="text-yellow-500">{"*"}</span></h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          A job application tracker for fresh graduates. Currently under active
          development.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded-full px-4 py-1.5 bg-background/60 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Under development
        </div>
      </div>
    </main>
  );
}
