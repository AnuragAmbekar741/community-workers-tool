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
import { isApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

import type { WorkerStatusCellProps } from "./workers-columns";

type WorkerStatusSelectProps = WorkerStatusCellProps & {
  onApprove: (args: {
    workerId: string;
    approved: boolean;
  }) => Promise<unknown>;
  isPending: boolean;
};

const STATUS_OPTIONS: Array<{
  value: WorkerStatusCellProps["status"];
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusBadgeVariant(
  status: WorkerStatusCellProps["status"],
): "pending" | "approved" | "rejected" {
  return status;
}

export function WorkerStatusSelect({
  workerId,
  status,
  onApprove,
  isPending,
}: WorkerStatusSelectProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  async function updateStatus(nextStatus: WorkerStatusCellProps["status"]) {
    setRejectDialogOpen(false);

    try {
      await onApprove({
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

  function handleStatusChange(nextStatus: WorkerStatusCellProps["status"]) {
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
        onValueChange={(value) =>
          handleStatusChange(value as WorkerStatusCellProps["status"])
        }
        disabled={isPending}
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void updateStatus("rejected")}
              disabled={isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
