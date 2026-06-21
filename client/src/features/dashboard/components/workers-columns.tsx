import type { ComponentType } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getDataTableRowSelectColumn } from "@/components/data-table/data-table-row-select-column";
import {
  DISTRICT_OPTIONS,
  ORGANISATION_OPTIONS,
  VILLAGE_OPTIONS,
  WORKER_ROLE_OPTIONS,
} from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import type { AdminWorkerListItem } from "@/types/admin";

type WorkerStatus = "pending" | "approved" | "rejected";

export type WorkerStatusCellProps = {
  workerId: string;
  status: WorkerStatus;
};

type GetWorkersColumnsOptions = {
  enableSelection: boolean;
  StatusCell: ComponentType<WorkerStatusCellProps>;
};

export function getWorkersColumns({
  enableSelection,
  StatusCell,
}: GetWorkersColumnsOptions): ColumnDef<AdminWorkerListItem>[] {
  const columns: ColumnDef<AdminWorkerListItem>[] = [];

  if (enableSelection) {
    columns.push(getDataTableRowSelectColumn<AdminWorkerListItem>());
  }

  columns.push(
    {
      id: "systemId",
      accessorFn: (row) => row.user.systemId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="System ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user.systemId}</span>
      ),
    },
    {
      id: "role",
      accessorFn: (row) =>
        getOptionLabel(WORKER_ROLE_OPTIONS, row.worker.workerRole),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) =>
        getOptionLabel(WORKER_ROLE_OPTIONS, row.original.worker.workerRole),
    },
    {
      id: "district",
      accessorFn: (row) =>
        getOptionLabel(DISTRICT_OPTIONS, row.worker.district),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="District" />
      ),
      cell: ({ row }) =>
        getOptionLabel(DISTRICT_OPTIONS, row.original.worker.district),
    },
    {
      id: "villages",
      accessorFn: (row) =>
        row.worker.villages
          .map((village) => getOptionLabel(VILLAGE_OPTIONS, village))
          .join(", "),
      header: "Villages",
      cell: ({ row }) => (
        <span className="whitespace-normal">
          {row.original.worker.villages
            .map((village) => getOptionLabel(VILLAGE_OPTIONS, village))
            .join(", ")}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "organisation",
      accessorFn: (row) =>
        getOptionLabel(ORGANISATION_OPTIONS, row.user.organisation),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organisation" />
      ),
      cell: ({ row }) =>
        getOptionLabel(ORGANISATION_OPTIONS, row.original.user.organisation),
    },
    {
      id: "status",
      accessorFn: (row) => row.worker.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StatusCell
          workerId={row.original.worker.systemId}
          status={row.original.worker.status}
        />
      ),
    },
  );

  return columns;
}
