import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/base/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/base/dialog";
import { WorkerPageShell } from "@/features/worker/layout/WorkerPageShell";
import { useDeleteSession, useSession } from "@/hooks/use-sessions";
import { isApiError } from "@/lib/api-error";
import {
  formatSessionDate,
  formatSessionTopic,
  formatSessionDistrict,
} from "@/lib/session-format";

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  );
}

export function SessionDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useSession(id);
  const deleteSessionMutation = useDeleteSession();

  const session = data?.session;

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteSessionMutation.mutateAsync(id);
      setDeleteOpen(false);
      navigate("/worker", { replace: true });
    } catch (err) {
      if (isApiError(err)) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Could not delete session. Please try again.");
      }
    }
  }

  if (isLoading) {
    return (
      <WorkerPageShell title="Session details" backTo="/worker/sessions">
        <p className="text-base text-muted-foreground">Loading…</p>
      </WorkerPageShell>
    );
  }

  if (isError || !session) {
    return (
      <WorkerPageShell title="Session details" backTo="/worker/sessions">
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Session not found or you do not have access."}
        </div>
        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/worker/sessions">Back to sessions</Link>
        </Button>
      </WorkerPageShell>
    );
  }

  return (
    <WorkerPageShell title="Session details" backTo="/worker/sessions">
      <div className="space-y-4 rounded-lg border border-border p-4">
        <DetailField
          label="Date"
          value={formatSessionDate(session.sessionDate)}
        />
        <DetailField label="District" value={formatSessionDistrict(session)} />
        <DetailField label="Topic" value={formatSessionTopic(session)} />
        <DetailField
          label="Duration"
          value={`${session.durationMin} minutes`}
        />
        <DetailField label="Women" value={String(session.nWomen)} />
        <DetailField label="Men" value={String(session.nMen)} />
        <DetailField label="Girls" value={String(session.nGirls)} />
        <DetailField label="Boys" value={String(session.nBoys)} />
        <DetailField label="Elders" value={String(session.nElders)} />
        <DetailField label="Others" value={String(session.nOthers)} />
        <DetailField
          label="Total reached"
          value={String(session.totalReached)}
        />
        <DetailField
          label="Referrals made"
          value={session.referralsMade ? "Yes" : "No"}
        />
        {session.referralsMade ? (
          <>
            <DetailField
              label="Number of referrals"
              value={String(session.nReferrals)}
            />
            <DetailField
              label="Reason for referral"
              value={session.referralReason?.trim() || "—"}
            />
          </>
        ) : null}
        <DetailField
          label="Notes"
          value={session.keyIssues?.trim() || "—"}
        />
      </div>

      <Button
        type="button"
        variant="destructive"
        className="h-11 w-full"
        onClick={() => setDeleteOpen(true)}
      >
        Delete session
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete session?</DialogTitle>
            <DialogDescription>
              This will permanently remove the session from{" "}
              {formatSessionDate(session.sessionDate)}. This action cannot be
              undone.
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
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteSessionMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkerPageShell>
  );
}
