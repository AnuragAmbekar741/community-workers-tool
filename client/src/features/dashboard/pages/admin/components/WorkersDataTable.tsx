import { useMemo } from "react";

import { DataTable } from "@/components/data-table/data-table";
import type { AdminWorkerListItem } from "@/types/admin";

import { getWorkersColumns } from "./workers-columns";

type WorkersDataTableProps = {
  workers: AdminWorkerListItem[];
  emptyMessage: string;
  showActions: boolean;
};

export function WorkersDataTable({
  workers,
  emptyMessage,
  showActions,
}: WorkersDataTableProps) {
  const columns = useMemo(
    () => getWorkersColumns({ showActions }),
    [showActions],
  );

  return (
    <DataTable columns={columns} data={workers} emptyMessage={emptyMessage} />
  );
}
