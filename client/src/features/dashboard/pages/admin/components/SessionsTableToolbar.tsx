import { Search } from "lucide-react";

import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { VILLAGE_OPTIONS } from "@/lib/constants";
import type { SessionVillageFilter } from "@/types/session";

const VILLAGE_FILTER_OPTIONS: Array<{
  value: SessionVillageFilter;
  label: string;
}> = [
  { value: "all", label: "All villages" },
  ...VILLAGE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

type SessionsTableToolbarProps = {
  villageFilter: SessionVillageFilter;
  onVillageFilterChange: (value: SessionVillageFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function SessionsTableToolbar({
  villageFilter,
  onVillageFilterChange,
  searchQuery,
  onSearchQueryChange,
}: SessionsTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select
        value={villageFilter}
        onValueChange={(value) =>
          onVillageFilterChange(value as SessionVillageFilter)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All villages" />
        </SelectTrigger>
        <SelectContent>
          {VILLAGE_FILTER_OPTIONS.map((option) => (
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
          placeholder="Search session or worker ID"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
