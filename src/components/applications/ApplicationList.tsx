"use client";

import { useEffect, useCallback } from "react";
import { useApplicationStore } from "@/store/useApplicationStore";
import { Status } from "@/types";
import ApplicationCard from "./ApplicationCard";
import { useRouter } from "next/navigation";

const FILTERS: { label: string; value: Status | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "Applied" },
  { label: "Interview", value: "Interview" },
  { label: "Offer", value: "Offer" },
  { label: "Rejected", value: "Rejected" },
];

export default function ApplicationList() {
  const {
    applications,
    isLoading,
    filter,
    search,
    setApplications,
    setFilter,
    setSearch,
  } = useApplicationStore();
  const router = useRouter();

  const fetchApplications = useCallback(async () => {
    const res = await fetch("/api/applications");
    if (res.ok) {
      const data = await res.json();
      setApplications(data);
    }
  }, [setApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications
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
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? applications.length
              : applications.filter((a) => a.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === f.value
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-border bg-white dark:bg-neutral-800"
              }`}
            >
              {f.label}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
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
        </div>
      )}
    </div>
  );
}
