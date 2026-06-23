import { useEffect, useMemo, useState } from "react";
import {
  ClockIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/base/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/base/sheet";
import { Skeleton } from "@/components/base/skeleton";
import { SessionDetailSections } from "@/features/dashboard/components/SessionDetailSections";
import { SessionForm } from "@/features/worker-sessions/components/SessionForm";
import {
  useDeleteDashboardSession,
  useUpdateDashboardSession,
} from "@/hooks/use-dashboard-session-mutations";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useSupervisorSession } from "@/hooks/use-supervisor-session";
import { isApiError } from "@/lib/api-error";
import { formatSessionDate } from "@/lib/session-format";
import { toSessionFormValues } from "@/lib/session-schema";

type SheetMode = "view" | "edit";

type SessionDetailSheetProps = {
  role: "supervisor" | "admin";
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function SessionDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function SessionDetailSheet({
  role,
  sessionId,
  open,
  onOpenChange,
}: SessionDetailSheetProps) {
  const id = sessionId ?? "";
  const [mode, setMode] = useState<SheetMode>("view");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const supervisorQuery = useSupervisorSession(id);
  const adminQuery = useAdminSession(id);
  const { data, isLoading, isError, error, refetch } =
    role === "supervisor" ? supervisorQuery : adminQuery;

  const updateMutation = useUpdateDashboardSession(role, id);
  const deleteMutation = useDeleteDashboardSession(role);

  const session = data?.session;

  const formInitialValues = useMemo(
    () => (session ? toSessionFormValues(session) : undefined),
    [session],
  );

  useEffect(() => {
    if (open) {
      setMode("view");
      setIsFormDirty(false);
      setDeleteError(null);
    }
  }, [open, sessionId]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mode === "edit" && isFormDirty) {
      setDiscardOpen(true);
      return;
    }

    if (!nextOpen) {
      setMode("view");
      setIsFormDirty(false);
    }

    onOpenChange(nextOpen);
  }

  function handleEdit() {
    setMode("edit");
    setIsFormDirty(false);
  }

  function handleCancelEdit() {
    setMode("view");
    setIsFormDirty(false);
  }

  function handleSaveSuccess() {
    setMode("view");
    setIsFormDirty(false);
    void refetch();
  }

  function handleDiscardConfirm() {
    setDiscardOpen(false);
    setMode("view");
    setIsFormDirty(false);
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!sessionId) {
      return;
    }

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(sessionId);
      setDeleteOpen(false);
      setMode("view");
      onOpenChange(false);
    } catch (err) {
      if (isApiError(err)) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Could not delete session. Please try again.");
      }
    }
  }

  const isEditMode = mode === "edit";
  const displayId = session?.sessionId ?? sessionId ?? "—";

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className={`flex h-full w-full flex-col gap-0 overflow-hidden p-0 ${
            isEditMode ? "sm:max-w-lg" : "sm:max-w-md"
          }`}
        >
          <SheetHeader className="shrink-0 border-b border-border px-4 py-4">
            {isEditMode ? (
              <>
                <SheetTitle>Edit session</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {displayId}
                </SheetDescription>
              </>
            ) : session ? (
              <>
                <SheetTitle className="text-lg">
                  {formatSessionDate(session.sessionDate)}
                </SheetTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="font-mono text-xs">{session.sessionId}</Badge>
                  <Badge variant="outline">Worker {session.workerId}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="size-3.5" aria-hidden />
                    {session.durationMin} min
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon className="size-3.5" aria-hidden />
                    {session.totalReached} reached
                  </span>
                  <Badge
                    variant={session.referralsMade ? "approved" : "outline"}
                    className="text-xs"
                  >
                    {session.referralsMade ? "Referrals made" : "No referrals"}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <SheetTitle>Session details</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {displayId}
                </SheetDescription>
              </>
            )}
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? <SessionDetailSkeleton /> : null}

            {isError || (!isLoading && !session) ? (
              <div
                className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
                role="alert"
              >
                {isApiError(error)
                  ? error.message
                  : "Session not found or you do not have access."}
              </div>
            ) : null}

            {session && !isEditMode ? (
              <SessionDetailSections session={session} />
            ) : null}

            {session && isEditMode && formInitialValues ? (
              <SessionForm
                mode="edit"
                initialValues={formInitialValues}
                onSubmitRequest={(body) => updateMutation.mutateAsync(body)}
                isSubmitting={updateMutation.isPending}
                onSubmitSuccess={handleSaveSuccess}
                onCancel={handleCancelEdit}
                onDirtyChange={setIsFormDirty}
              />
            ) : null}
          </div>

          {session && !isEditMode ? (
            <SheetFooter className="shrink-0 border-t border-border px-4 py-4">
              <div className="flex w-full flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className="h-11"
                    onClick={handleEdit}
                  >
                    <PencilIcon aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2Icon aria-hidden />
                    Delete
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete session?</DialogTitle>
            <DialogDescription>
              {session ? (
                <>
                  This will permanently remove the session from{" "}
                  {formatSessionDate(session.sessionDate)}. This action cannot be
                  undone.
                </>
              ) : (
                "This will permanently remove this session. This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError ? (
            <p className="text-base text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete session"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved edits. If you close now, your changes will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              onClick={handleDiscardConfirm}
            >
              Discard changes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setDiscardOpen(false)}
            >
              Keep editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
