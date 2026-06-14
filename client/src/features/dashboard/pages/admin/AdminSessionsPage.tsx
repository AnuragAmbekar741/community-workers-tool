import { useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import { DataTablePage } from "@/components/data-table/data-table-page";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { VILLAGE_OPTIONS } from "@/lib/constants";
import { isApiError } from "@/lib/api-error";
import { getOptionLabel } from "@/lib/option-label";
import type { SessionVillageFilter } from "@/types/session";

import { SessionsDataTable } from "./components/SessionsDataTable";

export function AdminSessionsPage() {
  const [villageFilter, setVillageFilter] = useState<SessionVillageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading, isError, error } = useAdminSessions();
  const sessions = data?.sessions ?? [];

  const emptyMessage = useMemo(() => {
    if (villageFilter === "all") {
      return "No sessions found.";
    }

    const villageLabel = getOptionLabel(VILLAGE_OPTIONS, villageFilter);
    return `No sessions in ${villageLabel}.`;
  }, [villageFilter]);

  function handleVillageFilterChange(value: SessionVillageFilter) {
    setVillageFilter(value);
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
        villageFilter={villageFilter}
        onVillageFilterChange={handleVillageFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </DataTablePage>
  );
}
