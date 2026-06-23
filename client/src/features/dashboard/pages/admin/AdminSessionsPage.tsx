import { useState } from "react";

import { DataTablePage } from "@/components/data-table/data-table-page";
import { SessionDetailSheet } from "@/features/dashboard/components/SessionDetailSheet";
import { SessionsDataTable } from "@/features/dashboard/components/SessionsDataTable";
import { SessionsLoadError } from "@/features/dashboard/components/SessionsLoadError";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useSessionTableFilters } from "@/hooks/use-session-table-filters";

export function AdminSessionsPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminSessions();
  const sessions = data?.sessions ?? [];

  const {
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
  } = useSessionTableFilters({
    sessions,
    defaultEmptyMessage: "No sessions found.",
  });

  function handleSessionOpen(sessionId: string) {
    setSelectedSessionId(sessionId);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open);
    if (!open) {
      setSelectedSessionId(null);
    }
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
        <SessionsLoadError error={error} onRetry={() => void refetch()} />
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
        workerFilter={workerFilter}
        onWorkerFilterChange={handleWorkerFilterChange}
        topicFilter={topicFilter}
        onTopicFilterChange={handleTopicFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onSessionClick={handleSessionOpen}
      />
      <SessionDetailSheet
        role="admin"
        sessionId={selectedSessionId}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
      />
    </DataTablePage>
  );
}
