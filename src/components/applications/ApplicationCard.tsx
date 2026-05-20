"use client";

import { Application, Status } from "@/types";
import { useApplicationStore } from "@/store/useApplicationStore";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const STATUS_STYLES: Record<Status, string> = {
  Applied: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Interview: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Offer: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  Rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const PRIORITY_DOT: Record<string, string> = {
  High: "bg-red-400",
  Medium: "bg-amber-400",
  Low: "bg-green-400",
};

interface Props {
  app: Application;
}

export default function ApplicationCard({ app }: Props) {
  const { updateApplication, removeApplication } = useApplicationStore();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleReject = async () => {
    const prev = app.status;
    updateApplication(app.id, { status: "Rejected" });
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" }),
    });
    if (!res.ok) {
      updateApplication(app.id, { status: prev });
      toast.error("Failed to update status");
      return;
    }
    toast("Mark as rejected.", {
      action: {
        label: "Undo",
        onClick: async () => {
          updateApplication(app.id, { status: prev });
          await fetch(`/api/application/${app.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: prev }),
          });
        },
      },
    });
  };

  const handleDelete = () => {
    setDeleting(true);
  };

  const handleDeleteComplete = async () => {
    removeApplication(app.id);

    const res = await fetch(`/api/applications/${app.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete. Please try again.");
    } else {
      toast("Application deleted.");
    }
  };

  const formatSalary = () => {
    if (!app.salary) return null;
    const { mode, amount, min, max, currency = "IDR" } = app.salary;
    const fmt = (n: number) => n.toLocaleString("id-ID");
    if (mode === "Negotiable") return "Negotiable";
    if (mode === "Exact" && amount) return `${currency} ${fmt(amount)}`;
    if (mode === "Range" && min && max)
      return `${currency} ${fmt(min)} – ${fmt(max)}`;
    return null;
  };

  const salary = formatSalary();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="relative overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0 bg-red-500/10 rounded-xl flex items-center justify-end pr-5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <motion.div
            animate={deleting ? { x: "-100%" } : { x: 0 }}
            transition={
              deleting
                ? { type: "spring" as const, stiffness: 300, damping: 28 }
                : { type: "spring" as const, stiffness: 400, damping: 30 }
            }
            onAnimationComplete={() => {
              if (deleting) {
                setVisible(false);
                handleDeleteComplete();
              }
            }}
            className="group relative flex items-center gap-4 rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-4 py-3.5 hover:border-foreground/20 transition-colors"
          >
            {/* priority dot */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${PRIORITY_DOT[app.priority]}`}
            />

            {/* company initial */}
            <div className="shrink-0 w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground font-mono">
              {app.company.substring(0, 2).toUpperCase()}
            </div>

            {/* main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{app.role}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[app.status]}`}
                >
                  {app.status}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground flex-wrap">
                <span>{app.company}</span>
                {app.location && (
                  <>
                    <span>·</span>
                    <span>{app.location}</span>
                  </>
                )}
                <span>·</span>
                <span>{app.work_type}</span>
                <span>·</span>
                <span>
                  {format(new Date(app.date_submitted), "d MMM yyyy")}
                </span>
                {salary && (
                  <>
                    <span>·</span>
                    <span>{salary}</span>
                  </>
                )}
              </div>
            </div>

            {/* three dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-20 group-hover:opacity-100">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="currentColor"
                  >
                    <circle cx="7.5" cy="2.5" r="1.5" />
                    <circle cx="7.5" cy="7.5" r="1.5" />
                    <circle cx="7.5" cy="12.5" r="1.5" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => router.push(`/applications/${app.id}/edit`)}
                >
                  Edit
                </DropdownMenuItem>
                {app.status !== "Rejected" && (
                  <DropdownMenuItem onClick={handleReject}>
                    Mark as Rejected
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
