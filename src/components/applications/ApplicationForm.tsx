"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApplicationStore } from "@/store/useApplicationStore";
import { Application } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// ── schema ──────────────────────────────────────────────
const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["Applied", "Interview", "Offer", "Rejected"]),
  date_submitted: z.string().min(1, "Date is required"),
  job_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  work_type: z.enum(["Remote", "Hybrid", "On-site"]),
  employment_type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  priority: z.enum(["Low", "Medium", "High"]),
  source: z.string().optional(),
  notes: z.string().optional(),
  salary_mode: z.enum(["Exact", "Range", "Negotiable"]),
  salary_amount: z.string().optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  salary_currency: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── location autocomplete ───────────────────────────────
interface LocationSuggestion {
  display_name: string;
  place_id: number;
}

function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = await res.json();
        setSuggestions(
          data.map((item: { display_name: string; place_id: number }) => ({
            display_name: formatLocation(item.display_name),
            place_id: item.place_id,
          })),
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  return { query, setQuery, suggestions, setSuggestions, loading };
}

function formatLocation(displayName: string): string {
  const parts = displayName.split(", ");
  if (parts.length <= 2) return displayName;
  // return "City, Country" or "City, State, Country"
  return parts.length >= 3
    ? `${parts[0]}, ${parts[parts.length - 1]}`
    : displayName;
}

// ── reusable field wrapper ──────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ── pill group (radio-style buttons) ───────────────────
function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            value === opt
              ? "bg-foreground text-background border-foreground"
              : "bg-background/60 text-muted-foreground border-border hover:border-foreground/30"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── input style ─────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 rounded-xl border bg-background/60 backdrop-blur-sm text-sm outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground";

// ── main component ──────────────────────────────────────
interface Props {
  defaultValues?: Partial<Application>;
  isEdit?: boolean;
  applicationId?: string;
}

function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${inputCls} flex items-center justify-between text-left`}
        >
          <span className={date ? "" : "text-muted-foreground"}>
            {date ? format(date, "d MMMM yyyy") : "Pick a date"}
          </span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground shrink-0"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl overflow-clip min-h-fit" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          className="min-w-52 h-fit"
        />
      </PopoverContent>
    </Popover>
  );
}

export default function ApplicationForm({
  defaultValues,
  isEdit,
  applicationId,
}: Props) {
  const router = useRouter();
  const { addApplication, updateApplication } = useApplicationStore();
  const [submitting, setSubmitting] = useState(false);
  const location = useLocationSearch();
  const [locationValue, setLocationValue] = useState(
    defaultValues?.location || "",
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: defaultValues?.company || "",
      role: defaultValues?.role || "",
      status: defaultValues?.status || "Applied",
      date_submitted: defaultValues?.date_submitted || today,
      job_url: defaultValues?.job_url || "",
      work_type: defaultValues?.work_type || "On-site",
      employment_type: defaultValues?.employment_type || "Full-time",
      priority: defaultValues?.priority || "Medium",
      source: defaultValues?.source || "",
      notes: defaultValues?.notes || "",
      salary_mode: defaultValues?.salary?.mode || "Negotiable",
      salary_amount: defaultValues?.salary?.amount?.toString() || "",
      salary_min: defaultValues?.salary?.min?.toString() || "",
      salary_max: defaultValues?.salary?.max?.toString() || "",
      salary_currency: defaultValues?.salary?.currency || "IDR",
    },
  });

  const salaryMode = watch("salary_mode");
  const workType = watch("work_type");

  // close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);

    const salary =
      values.salary_mode === "Negotiable"
        ? { mode: "Negotiable" as const }
        : values.salary_mode === "Exact"
          ? {
              mode: "Exact" as const,
              amount: Number(values.salary_amount),
              currency: values.salary_currency,
            }
          : {
              mode: "Range" as const,
              min: Number(values.salary_min),
              max: Number(values.salary_max),
              currency: values.salary_currency,
            };

    const payload = {
      company: values.company,
      role: values.role,
      status: values.status,
      date_submitted: values.date_submitted,
      job_url: values.job_url || null,
      work_type: values.work_type,
      employment_type: values.employment_type,
      priority: values.priority,
      source: values.source || null,
      notes: values.notes || null,
      location: locationValue || null,
      salary,
    };

    const url = isEdit
      ? `/api/applications/${applicationId}`
      : "/api/applications";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data: Application = await res.json();
      if (isEdit) {
        updateApplication(data.id, data);
        toast("Application updated.");
      } else {
        addApplication(data);
        toast("Application added.");
      }
      router.push("/");
    } else {
      toast.error("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 overflow-visible"
    >
      {/* company + role */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex flex-col gap-4">
        <Field label="Company" error={errors.company?.message}>
          <input
            {...register("company")}
            placeholder="e.g. Tokopedia"
            className={inputCls}
          />
        </Field>
        <Field label="Role" error={errors.role?.message}>
          <input
            {...register("role")}
            placeholder="e.g. Product Manager"
            className={inputCls}
          />
        </Field>
      </div>

      {/* status + priority */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex flex-col gap-4">
        <Field label="Status">
          <PillGroup
            options={["Applied", "Interview", "Offer", "Rejected"]}
            value={watch("status")}
            onChange={(v) => setValue("status", v)}
          />
        </Field>
        <Field label="Priority">
          <PillGroup
            options={["Low", "Medium", "High"]}
            value={watch("priority")}
            onChange={(v) => setValue("priority", v)}
          />
        </Field>
      </div>

      {/* work details */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex flex-col gap-4 overflow-visible relative">
        <Field label="Work type">
          <PillGroup
            options={["Remote", "Hybrid", "On-site"]}
            value={watch("work_type")}
            onChange={(v) => setValue("work_type", v)}
          />
        </Field>
        <Field label="Employment type">
          <PillGroup
            options={["Full-time", "Part-time", "Contract", "Internship"]}
            value={watch("employment_type")}
            onChange={(v) => setValue("employment_type", v)}
          />
        </Field>

        {/* location */}
        <Field
          label={workType === "Remote" ? "Company base location" : "Location"}
        >
          {workType === "Remote" && (
            <p className="text-xs text-muted-foreground -mt-1 mb-1">
              Where is the company headquartered?
            </p>
          )}
          <Popover open={showSuggestions && location.suggestions.length > 0}>
            <PopoverTrigger asChild>
              <div className="relative" ref={locationRef}>
                <input
                  value={location.query || locationValue}
                  onChange={(e) => {
                    location.setQuery(e.target.value);
                    setLocationValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g. Jakarta, Indonesia"
                  className={inputCls}
                />
                {location.loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    searching...
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-[--radix-popover-trigger-width]"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {location.suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type="button"
                  onClick={() => {
                    setLocationValue(s.display_name);
                    location.setQuery("");
                    location.setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b last:border-0"
                >
                  {s.display_name}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </Field>
      </div>

      {/* salary */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex flex-col gap-4">
        <Field label="Salary">
          <PillGroup
            options={["Negotiable", "Exact", "Range"]}
            value={watch("salary_mode")}
            onChange={(v) =>
              setValue("salary_mode", v as "Negotiable" | "Exact" | "Range")
            }
          />
        </Field>

        {salaryMode !== "Negotiable" && (
          <div className="flex gap-2">
            <select
              {...register("salary_currency")}
              className={`${inputCls} max-w-24`}
            >
              <option>IDR</option>
              <option>USD</option>
              <option>SGD</option>
              <option>MYR</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            {salaryMode === "Exact" && (
              <input
                {...register("salary_amount")}
                type="number"
                placeholder="Amount"
                className={`${inputCls} flex-1`}
              />
            )}
            {salaryMode === "Range" && (
              <>
                <input
                  {...register("salary_min")}
                  type="number"
                  placeholder="Min"
                  className={`${inputCls} flex-1`}
                />
                <input
                  {...register("salary_max")}
                  type="number"
                  placeholder="Max"
                  className={`${inputCls} flex-1`}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* date + source + url */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4 flex flex-col gap-4">
        <Field label="Date submitted" error={errors.date_submitted?.message}>
          <DatePicker
            value={watch("date_submitted")}
            onChange={(val) => setValue("date_submitted", val)}
          />
        </Field>
        <Field label="Source">
          <select {...register("source")} className={inputCls}>
            <option value="">Select source</option>
            {[
              "LinkedIn",
              "JobStreet",
              "Glassdoor",
              "Referral",
              "Company website",
              "Other",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job listing URL" error={errors.job_url?.message}>
          <input
            {...register("job_url")}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
      </div>

      {/* notes */}
      <div className="rounded-xl border bg-white dark:bg-neutral-800 backdrop-blur-sm px-5 py-4">
        <Field label="Notes">
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Recruiter name, referral, anything to remember..."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      {/* actions */}
      <div className="flex items-center justify-end gap-3 pb-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Add application"}
        </button>
      </div>
    </form>
  );
}
