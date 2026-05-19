"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/applications/new",
    label: "Add",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* desktop — floating left sidebar */}
      <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-1 p-1.5 rounded-2xl border bg-background/70 backdrop-blur-md shadow-sm">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>

      {/* mobile — fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-3 w-fit rounded-2xl flex items-center justify-around gap-4 px-6 py-3 border bg-background/70 backdrop-blur-md">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${active ? "bg-muted" : ""}`}
              >
                {item.icon}
              </div>
            </Link>
          );
        })}
      </div>

      {/* mobile bottom padding so content isn't hidden behind the bar */}
      <div className="md:hidden h-6" />
    </>
  );
}
