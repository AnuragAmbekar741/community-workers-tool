import { useMemo } from "react";
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { formatSessionTopic } from "@/lib/session-format";
import type {
  SessionDistrictFilter,
  SessionDto,
  SessionTopicFilter,
  SessionWorkerFilter,
} from "@/types/session";

import { getSessionsColumns } from "./sessions-columns";
import { SessionsTableToolbar } from "./SessionsTableToolbar";

type SessionsDataTableProps = {
  sessions: SessionDto[];
  emptyMessage: string;
  districtFilter: SessionDistrictFilter;
  onDistrictFilterChange: (value: SessionDistrictFilter) => void;
  workerFilter: SessionWorkerFilter;
  onWorkerFilterChange: (value: SessionWorkerFilter) => void;
  topicFilter: SessionTopicFilter;
  onTopicFilterChange: (value: SessionTopicFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onSessionClick?: (sessionId: string) => void;
};

export function SessionsDataTable({
  sessions,
  emptyMessage,
  districtFilter,
  onDistrictFilterChange,
  workerFilter,
  onWorkerFilterChange,
  topicFilter,
  onTopicFilterChange,
  searchQuery,
  onSearchQueryChange,
  rowSelection,
  onRowSelectionChange,
  onSessionClick,
}: SessionsDataTableProps) {
  const columns = useMemo(
    () => getSessionsColumns({ enableSelection: true, onSessionClick }),
    [onSessionClick],
  );

  const workerOptions = useMemo(
    () => [...new Set(sessions.map((session) => session.workerId))].sort(),
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      if (districtFilter !== "all" && session.district !== districtFilter) {
        return false;
      }

      if (workerFilter !== "all" && session.workerId !== workerFilter) {
        return false;
      }

      if (topicFilter !== "all" && session.topic !== topicFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        session.sessionId.toLowerCase().includes(query) ||
        session.workerId.toLowerCase().includes(query) ||
        formatSessionTopic(session).toLowerCase().includes(query)
      );
    });
  }, [
    sessions,
    districtFilter,
    workerFilter,
    topicFilter,
    searchQuery,
  ]);

  return (
    <DataTable
      columns={columns}
      data={filteredSessions}
      emptyMessage={emptyMessage}
      enableRowSelection
      getRowId={(row) => row.sessionId}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      variant="flush"
      layout="sticky"
      toolbar={
        <SessionsTableToolbar
          districtFilter={districtFilter}
          onDistrictFilterChange={onDistrictFilterChange}
          workerFilter={workerFilter}
          onWorkerFilterChange={onWorkerFilterChange}
          workerOptions={workerOptions}
          topicFilter={topicFilter}
          onTopicFilterChange={onTopicFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      }
    />
  );
}
