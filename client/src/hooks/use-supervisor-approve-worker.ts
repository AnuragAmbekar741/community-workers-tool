import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveWorker } from "@/api/supervisor-api";

import { supervisorKeys } from "./use-supervisor-workers";

export function useSupervisorApproveWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workerId,
      approved,
    }: {
      workerId: string;
      approved: boolean;
    }) => approveWorker(workerId, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.all });
    },
  });
}
