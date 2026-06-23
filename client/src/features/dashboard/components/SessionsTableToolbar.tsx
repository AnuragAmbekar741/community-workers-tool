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
import type {
  SessionDistrictFilter,
  SessionTopicFilter,
  SessionWorkerFilter,
} from "@/types/session";

const DISTRICT_FILTER_OPTIONS: Array<{
  value: SessionDistrictFilter;
  label: string;
}> = [
  { value: "all", label: "All districts" },
  ...DISTRICT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

const TOPIC_FILTER_OPTIONS: Array<{
  value: SessionTopicFilter;
  label: string;
}> = [
  { value: "all", label: "All topics" },
  ...TOPIC_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

type SessionsTableToolbarProps = {
  districtFilter: SessionDistrictFilter;
  onDistrictFilterChange: (value: SessionDistrictFilter) => void;
  workerFilter: SessionWorkerFilter;
  onWorkerFilterChange: (value: SessionWorkerFilter) => void;
  workerOptions: string[];
  topicFilter: SessionTopicFilter;
  onTopicFilterChange: (value: SessionTopicFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function SessionsTableToolbar({
  districtFilter,
  onDistrictFilterChange,
  workerFilter,
  onWorkerFilterChange,
  workerOptions,
  topicFilter,
  onTopicFilterChange,
  searchQuery,
  onSearchQueryChange,
}: SessionsTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={districtFilter}
          onValueChange={(value) =>
            onDistrictFilterChange(value as SessionDistrictFilter)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All districts" />
          </SelectTrigger>
          <SelectContent>
            {DISTRICT_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={workerFilter}
          onValueChange={(value) =>
            onWorkerFilterChange(value as SessionWorkerFilter)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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
          value={topicFilter}
          onValueChange={(value) =>
            onTopicFilterChange(value as SessionTopicFilter)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            {TOPIC_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search session ID, worker ID, or topic"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
