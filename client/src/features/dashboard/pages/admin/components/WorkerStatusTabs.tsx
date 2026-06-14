import type { WorkerStatusFilter } from "@/types/admin";

import { cn } from "@/lib/utils";

const TABS: Array<{ value: WorkerStatusFilter | "all"; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type WorkerStatusTabsProps = {
  value: WorkerStatusFilter | "all";
  onChange: (value: WorkerStatusFilter | "all") => void;
};

export function WorkerStatusTabs({ value, onChange }: WorkerStatusTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Worker status filter"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
