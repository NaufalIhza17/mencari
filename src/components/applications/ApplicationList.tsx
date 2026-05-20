"use client";

import { useState, useEffect, useCallback } from "react";
import { SortOption, useApplicationStore } from "@/store/useApplicationStore";
import { Status } from "@/types";
import ApplicationCard from "./ApplicationCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS: { label: string; value: Status | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "Applied" },
  { label: "Interview", value: "Interview" },
  { label: "Offer", value: "Offer" },
  { label: "Rejected", value: "Rejected" },
];

const SORTS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "date" },
  { label: "Priority", value: "priority" },
  { label: "Salary", value: "salary" },
  { label: "Name", value: "name" },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const spring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="h-16 rounded-xl border bg-white dark:bg-neutral-800 overflow-hidden"
    >
      <div className="h-full w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/60 to-transparent animate-[shimmer_1.5s_infinite]" />
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-32 rounded-full bg-muted" />
            <div className="h-2.5 w-48 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationList() {
  const {
    applications,
    isLoading,
    filter,
    search,
    sort,
    setApplications,
    setFilter,
    setSearch,
    setSort,
  } = useApplicationStore();
  const router = useRouter();
  const [sortOpen, setSortOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    useApplicationStore.setState({ isLoading: true });
    const res = await fetch("/api/applications");
    if (res.ok) {
      const data = await res.json();
      setApplications(data);
    }
    useApplicationStore.setState({ isLoading: false });
  }, [setApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getSalaryValue = (app: (typeof applications)[0]): number => {
    if (!app.salary) return -1;
    const { mode, amount, min, max } = app.salary;
    if (mode === "Negotiable") return 0;
    if (mode === "Exact" && amount) return amount;
    if (mode === "Range" && min && max) return (min + max) / 2;
    return -1;
  };

  const sorted = [...applications].sort((a, b) => {
    switch (sort) {
      case "date":
        return (
          new Date(b.date_submitted).getTime() -
          new Date(a.date_submitted).getTime()
        );
      case "priority":
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "salary":
        return getSalaryValue(b) - getSalaryValue(a);
      case "name":
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });

  const filtered = sorted
    .filter((app) => (filter === "all" ? true : app.status === filter))
    .filter((app) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q)
      );
    });

  const activeSort = SORTS.find((s) => s.value === sort);

  return (
    <div className="flex flex-col gap-4">
      {/* search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by company, role, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm text-sm outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* filters */}
      <div className="flex items-center max-md:justify-center gap-2 scrollbar-none md:overflow-hidden">
        {/* sort pill + inline options */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* sort trigger pill */}
          <button
            onClick={() => setSortOpen((o) => !o)}
            className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/10 transition-colors shrink-0 ${
              sortOpen
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            <span>Sort: {activeSort?.label}</span>
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              animate={{ rotate: sortOpen ? 180 : 0 }}
              transition={spring}
            >
              <polyline points="9 18 15 12 9 6" />
            </motion.svg>
          </button>

          {/* sliding options */}
          <AnimatePresence initial={false}>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{
                  type: "tween" as const,
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                className="flex items-center gap-1.5 overflow-hidden"
                style={{ whiteSpace: "nowrap" }}
              >
                <div className="flex items-center gap-1 pl-0.5">
                  {SORTS.map((s) => {
                    const active = sort === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => {
                          setSort(s.value);
                          setSortOpen(false);
                        }}
                        className="relative flex items-center px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/10 transition-colors shrink-0"
                      >
                        {active && (
                          <motion.div
                            layoutId="sort-option-indicator"
                            className="absolute inset-0 rounded-full bg-foreground"
                            transition={spring}
                          />
                        )}
                        <span
                          className={`relative z-10 transition-colors duration-150 ${active ? "text-background" : "text-muted-foreground"}`}
                        >
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* divider */}
        <div className="w-px h-5 bg-black/10 dark:bg-white/10 shrink-0" />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none md:overflow-hidden">
          {FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? applications.length
                : applications.filter((a) => a.status === f.value).length;
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/10 transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="filter-indicator"
                    className="absolute inset-0 rounded-full bg-foreground border-foreground"
                    transition={spring}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-150 ${active ? "text-background" : "text-muted-foreground"}`}
                >
                  {f.label}
                </span>
                <span
                  className={`relative z-10 opacity-60 transition-colors duration-150 ${active ? "text-background" : "text-muted-foreground"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} delay={i * 0.07} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          className="flex flex-col gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 py-24 text-center"
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="text-muted-foreground/20"
          >
            <rect
              x="10"
              y="20"
              width="60"
              height="48"
              rx="6"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path d="M10 32h60" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M24 20V14a4 4 0 018 0v6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M48 20V14a4 4 0 018 0v6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M28 50h24M34 58h12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="font-medium text-sm">No applications yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Start tracking your job search.
            </p>
          </div>
          <button
            onClick={() => router.push("/applications/new")}
            className="px-4 py-2 rounded-full border text-xs font-medium hover:bg-muted transition-colors"
          >
            + Add your first application
          </button>
        </motion.div>
      )}
    </div>
  );
}
