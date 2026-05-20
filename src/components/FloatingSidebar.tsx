"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

const spring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export default function FloatingSidebar() {
  const pathname = usePathname();
  const activeIndex = NAV.findIndex((item) => item.href === pathname);

  return (
    <>
      {/* desktop — floating left sidebar */}
      <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col p-1.5 rounded-2xl border bg-white dark:bg-neutral-800 shadow-sm">
        {NAV.map((item, i) => {
          const active = activeIndex === i;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="relative w-9 h-9 flex items-center justify-center"
            >
              {active && (
                <motion.div
                  layoutId="desktop-indicator"
                  className="absolute inset-0 rounded-xl bg-foreground"
                  transition={spring}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  active
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>

      {/* mobile — floating bottom pill */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-2xl border bg-white dark:bg-neutral-800 shadow-sm">
        {NAV.map((item, i) => {
          const active = activeIndex === i;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative w-12 h-10 flex items-center justify-center"
            >
              {active && (
                <motion.div
                  layoutId="mobile-indicator"
                  className="absolute inset-0 rounded-xl bg-muted"
                  transition={spring}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>

      {/* mobile bottom padding */}
      <div className="md:hidden h-5" />
    </>
  );
}
