import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getDataTableRowSelectColumn } from "@/components/data-table/data-table-row-select-column";
import { DISTRICT_OPTIONS } from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import {
  formatSessionDate,
  formatSessionTopic,
} from "@/lib/session-format";
import type { SessionDto } from "@/types/session";

type GetSessionsColumnsOptions = {
  enableSelection: boolean;
};

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
      id: "district",
      accessorFn: (row) => getOptionLabel(DISTRICT_OPTIONS, row.district),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="District" />
      ),
      cell: ({ row }) =>
        getOptionLabel(DISTRICT_OPTIONS, row.original.district),
    },
    {
      id: "topic",
      accessorFn: (row) => formatSessionTopic(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Topic" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-normal">
          {formatSessionTopic(row.original)}
        </span>
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
