import { Search } from "lucide-react";

import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { DISTRICT_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import type { AnalyticsFilters } from "@/types/analytics";
import type { District, Topic } from "@/lib/constants";

type AnalyticsFiltersBarProps = {
  filters: AnalyticsFilters;
  workerOptions: string[];
  onFiltersChange: (filters: AnalyticsFilters) => void;
};

export function AnalyticsFiltersBar({
  filters,
  workerOptions,
  onFiltersChange,
}: AnalyticsFiltersBarProps) {
  function update(partial: Partial<AnalyticsFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <p className="text-sm font-medium">Filters</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Select
          value={filters.district ?? "all"}
          onValueChange={(value) =>
            update({
              district: value === "all" ? undefined : (value as District),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {DISTRICT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.workerId ?? "all"}
          onValueChange={(value) =>
            update({ workerId: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All workers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workers</SelectItem>
            {workerOptions.map((workerId) => (
              <SelectItem key={workerId} value={workerId}>
                {workerId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.topic ?? "all"}
          onValueChange={(value) =>
            update({
              topic: value === "all" ? undefined : (value as Topic),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {TOPIC_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.from ?? ""}
          onChange={(event) =>
            update({ from: event.target.value || undefined })
          }
          aria-label="From date"
        />

        <Input
          type="date"
          value={filters.to ?? ""}
          onChange={(event) => update({ to: event.target.value || undefined })}
          aria-label="To date"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="size-4 shrink-0" />
        <span>Date range filters apply to all charts and tables below.</span>
      </div>
    </div>
  );
}
