import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveWorker } from "@/api/admin-api";

import { adminKeys } from "./use-admin-workers";

export function useApproveWorker() {
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
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
