import { useSupervisorApproveWorker } from "@/hooks/use-supervisor-approve-worker";

import { WorkerStatusSelect } from "../../../components/WorkerStatusSelect";
import type { WorkerStatusCellProps } from "../../../components/workers-columns";

export function SupervisorWorkerStatusSelect({
  workerId,
  status,
}: WorkerStatusCellProps) {
  const approveMutation = useSupervisorApproveWorker();

  return (
    <WorkerStatusSelect
      workerId={workerId}
      status={status}
      onApprove={approveMutation.mutateAsync}
      isPending={approveMutation.isPending}
    />
  );
}
