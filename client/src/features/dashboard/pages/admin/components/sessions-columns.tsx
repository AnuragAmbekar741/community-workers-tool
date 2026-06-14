import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getDataTableRowSelectColumn } from "@/components/data-table/data-table-row-select-column";
import { TOPIC_OPTIONS, VILLAGE_OPTIONS } from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import type { SessionDto } from "@/types/session";

type GetSessionsColumnsOptions = {
  enableSelection: boolean;
};

function formatSessionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTopic(session: SessionDto): string {
  if (session.topic === "other" && session.topicOther?.trim()) {
    return session.topicOther.trim();
  }

  return getOptionLabel(TOPIC_OPTIONS, session.topic);
}

export function getSessionsColumns({
  enableSelection,
}: GetSessionsColumnsOptions): ColumnDef<SessionDto>[] {
  const columns: ColumnDef<SessionDto>[] = [];

  if (enableSelection) {
    columns.push(getDataTableRowSelectColumn<SessionDto>());
  }

  columns.push(
    {
      id: "sessionId",
      accessorKey: "sessionId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Session ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.sessionId}</span>
      ),
    },
    {
      id: "workerId",
      accessorKey: "workerId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Worker ID" />
      ),
      cell: ({ row }) => row.original.workerId,
    },
    {
      id: "sessionDate",
      accessorKey: "sessionDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatSessionDate(row.original.sessionDate),
    },
    {
      id: "village",
      accessorFn: (row) => getOptionLabel(VILLAGE_OPTIONS, row.village),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Village" />
      ),
      cell: ({ row }) =>
        getOptionLabel(VILLAGE_OPTIONS, row.original.village),
    },
    {
      id: "topic",
      accessorFn: (row) => formatTopic(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Topic" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-normal">{formatTopic(row.original)}</span>
      ),
    },
    {
      id: "totalReached",
      accessorKey: "totalReached",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total reached" />
      ),
      cell: ({ row }) => row.original.totalReached,
    },
    {
      id: "durationMin",
      accessorKey: "durationMin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => `${row.original.durationMin} min`,
    },
  );

  return columns;
}
