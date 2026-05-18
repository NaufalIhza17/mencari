import AnimatedGrid from "@/components/AnimatedGrid";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 overflow-hidden">
      <AnimatedGrid />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <span className="text-8xl font-bold tracking-tighter text-muted-foreground/20">
          404
        </span>
        <h1 className="text-2xl font-bold tracking-tight -mt-4">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          This page doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground border rounded-full px-4 py-1.5 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
        >
          ← Go home
        </Link>
      </div>
    </main>
  );
}
