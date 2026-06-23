import { useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import { DataTablePage } from "@/components/data-table/data-table-page";
import { SessionsDataTable } from "@/features/dashboard/components/SessionsDataTable";
import { useSupervisorSessions } from "@/hooks/use-supervisor-sessions";
import { DISTRICT_OPTIONS } from "@/lib/constants";
import { isApiError } from "@/lib/api-error";
import { getOptionLabel } from "@/lib/option-label";
import type { SessionDistrictFilter } from "@/types/session";

export function SupervisorSessionsPage() {
  const [districtFilter, setDistrictFilter] =
    useState<SessionDistrictFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading, isError, error } = useSupervisorSessions();
  const sessions = data?.sessions ?? [];

  const emptyMessage = useMemo(() => {
    if (districtFilter === "all") {
      return "No sessions found for workers in your organisation.";
    }

    const districtLabel = getOptionLabel(DISTRICT_OPTIONS, districtFilter);
    return `No sessions in ${districtLabel}.`;
  }, [districtFilter]);

  function handleDistrictFilterChange(value: SessionDistrictFilter) {
    setDistrictFilter(value);
    setRowSelection({});
    setSearchQuery("");
  }

  if (isLoading) {
    return (
      <DataTablePage bleed>
        <p className="px-4 text-base text-muted-foreground md:px-6">
          Loading sessions…
        </p>
      </DataTablePage>
    );
  }

  if (isError) {
    return (
      <DataTablePage bleed>
        <div
          className="mx-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive md:mx-6"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Could not load sessions. Please try again."}
        </div>
      </DataTablePage>
    );
  }

  return (
    <DataTablePage bleed>
      <SessionsDataTable
        sessions={sessions}
        emptyMessage={emptyMessage}
        districtFilter={districtFilter}
        onDistrictFilterChange={handleDistrictFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </DataTablePage>
  );
}
