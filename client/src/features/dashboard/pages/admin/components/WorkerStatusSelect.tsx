import { useState } from "react";
import { toast } from "sonner";

import { badgeVariants } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/base/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { useApproveWorker } from "@/hooks/use-approve-worker";
import { isApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type WorkerStatus = "pending" | "approved" | "rejected";

type WorkerStatusSelectProps = {
  workerId: string;
  status: WorkerStatus;
};

const STATUS_OPTIONS: Array<{ value: WorkerStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusBadgeVariant(
  status: WorkerStatus,
): "pending" | "approved" | "rejected" {
  return status;
}

export function WorkerStatusSelect({
  workerId,
  status,
}: WorkerStatusSelectProps) {
  const approveMutation = useApproveWorker();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  async function updateStatus(nextStatus: WorkerStatus) {
    setRejectDialogOpen(false);

    try {
      await approveMutation.mutateAsync({
        workerId,
        approved: nextStatus === "approved",
      });
      toast.success(
        nextStatus === "approved" ? "Worker approved" : "Worker rejected",
      );
    } catch (error) {
      toast.error(
        isApiError(error) ? error.message : "Could not update worker status.",
      );
    }
  }

  function handleStatusChange(nextStatus: WorkerStatus) {
    if (nextStatus === status || nextStatus === "pending") {
      return;
    }

    if (nextStatus === "rejected") {
      setRejectDialogOpen(true);
      return;
    }

    void updateStatus(nextStatus);
  }

  return (
    <>
      <Select
        value={status}
        onValueChange={(value) => handleStatusChange(value as WorkerStatus)}
        disabled={approveMutation.isPending}
      >
        <SelectTrigger
          size="sm"
          className={cn(
            badgeVariants({ variant: statusBadgeVariant(status) }),
            "h-auto w-fit gap-1 rounded-full px-2 py-0.5 text-xs font-medium shadow-none",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {STATUS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.value === "pending" && status !== "pending"}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Reject worker?</DialogTitle>
            <DialogDescription>
              They will not be able to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void updateStatus("rejected")}
              disabled={approveMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
