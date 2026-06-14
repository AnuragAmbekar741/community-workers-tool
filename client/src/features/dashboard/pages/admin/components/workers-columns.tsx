import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DISTRICT_OPTIONS,
  ORGANISATION_OPTIONS,
  VILLAGE_OPTIONS,
  WORKER_ROLE_OPTIONS,
} from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import type { AdminWorkerListItem } from "@/types/admin";

import { WorkerApproveActions } from "./WorkerApproveActions";

type GetWorkersColumnsOptions = {
  showActions: boolean;
};

export function getWorkersColumns({
  showActions,
}: GetWorkersColumnsOptions): ColumnDef<AdminWorkerListItem>[] {
  const columns: ColumnDef<AdminWorkerListItem>[] = [
    {
      id: "systemId",
      accessorFn: (row) => row.user.systemId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="System ID" />
      ),
      cell: ({ row }) => row.original.user.systemId,
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
  ];

  if (showActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.worker.status !== "pending") {
          return null;
        }

        return (
          <WorkerApproveActions workerId={row.original.worker.systemId} />
        );
      },
      enableSorting: false,
    });
  }

  return columns;
}
