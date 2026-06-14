import { Search } from "lucide-react";

import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import type { WorkerStatusFilter } from "@/types/admin";

const STATUS_OPTIONS: Array<{
  value: WorkerStatusFilter | "all";
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type WorkersTableToolbarProps = {
  statusFilter: WorkerStatusFilter | "all";
  onStatusFilterChange: (value: WorkerStatusFilter | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function WorkersTableToolbar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
}: WorkersTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          onStatusFilterChange(value as WorkerStatusFilter | "all")
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search system ID"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
