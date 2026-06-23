import { useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import { DISTRICT_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import type {
  SessionDistrictFilter,
  SessionDto,
  SessionTopicFilter,
  SessionWorkerFilter,
} from "@/types/session";

type UseSessionTableFiltersOptions = {
  sessions: SessionDto[];
  defaultEmptyMessage: string;
};

export function useSessionTableFilters({
  sessions,
  defaultEmptyMessage,
}: UseSessionTableFiltersOptions) {
  const [districtFilter, setDistrictFilter] =
    useState<SessionDistrictFilter>("all");
  const [workerFilter, setWorkerFilter] = useState<SessionWorkerFilter>("all");
  const [topicFilter, setTopicFilter] = useState<SessionTopicFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const emptyMessage = useMemo(() => {
    const hasActiveFilter =
      districtFilter !== "all" ||
      workerFilter !== "all" ||
      topicFilter !== "all" ||
      searchQuery.trim().length > 0;

    if (!hasActiveFilter) {
      return defaultEmptyMessage;
    }

    if (sessions.length === 0) {
      return defaultEmptyMessage;
    }

    const parts: string[] = [];

    if (districtFilter !== "all") {
      parts.push(
        getOptionLabel(DISTRICT_OPTIONS, districtFilter),
      );
    }

    if (workerFilter !== "all") {
      parts.push(`worker ${workerFilter}`);
    }

    if (topicFilter !== "all") {
      parts.push(getOptionLabel(TOPIC_OPTIONS, topicFilter));
    }

    if (parts.length > 0) {
      return `No sessions match ${parts.join(", ")}.`;
    }

    return "No sessions match your search.";
  }, [
    defaultEmptyMessage,
    districtFilter,
    workerFilter,
    topicFilter,
    searchQuery,
    sessions.length,
  ]);

  function clearRowSelection() {
    setRowSelection({});
  }

  function handleDistrictFilterChange(value: SessionDistrictFilter) {
    setDistrictFilter(value);
    clearRowSelection();
  }

  function handleWorkerFilterChange(value: SessionWorkerFilter) {
    setWorkerFilter(value);
    clearRowSelection();
  }

  function handleTopicFilterChange(value: SessionTopicFilter) {
    setTopicFilter(value);
    clearRowSelection();
  }

  return {
    districtFilter,
    workerFilter,
    topicFilter,
    searchQuery,
    rowSelection,
    emptyMessage,
    setSearchQuery,
    setRowSelection,
    handleDistrictFilterChange,
    handleWorkerFilterChange,
    handleTopicFilterChange,
  };
}
