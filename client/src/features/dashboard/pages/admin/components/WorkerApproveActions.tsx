import { useState } from "react";

import { Button } from "@/components/base/button";
import { useApproveWorker } from "@/hooks/use-approve-worker";
import { isApiError } from "@/lib/api-error";

type WorkerApproveActionsProps = {
  workerId: string;
};

export function WorkerApproveActions({ workerId }: WorkerApproveActionsProps) {
  const approveMutation = useApproveWorker();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleApprove() {
    setActionError(null);
    try {
      await approveMutation.mutateAsync({ workerId, approved: true });
    } catch (error) {
      setActionError(
        isApiError(error) ? error.message : "Could not approve worker.",
      );
    }
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Reject this worker registration? They will not be able to log in.",
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    try {
      await approveMutation.mutateAsync({ workerId, approved: false });
    } catch (error) {
      setActionError(
        isApiError(error) ? error.message : "Could not reject worker.",
      );
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          disabled={approveMutation.isPending}
          onClick={handleApprove}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={approveMutation.isPending}
          onClick={handleReject}
        >
          Reject
        </Button>
      </div>

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
