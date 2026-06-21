import { useApproveWorker } from "@/hooks/use-approve-worker";

import { WorkerStatusSelect } from "../../../components/WorkerStatusSelect";
import type { WorkerStatusCellProps } from "../../../components/workers-columns";

export function AdminWorkerStatusSelect({
  workerId,
  status,
}: WorkerStatusCellProps) {
  const approveMutation = useApproveWorker();

  return (
    <WorkerStatusSelect
      workerId={workerId}
      status={status}
      onApprove={approveMutation.mutateAsync}
      isPending={approveMutation.isPending}
    />
  );
}
