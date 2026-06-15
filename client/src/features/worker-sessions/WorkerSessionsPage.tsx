import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { WorkerPageShell } from "@/features/worker/layout/WorkerPageShell";
import { SessionCard } from "@/features/worker-sessions/components/SessionCard";
import { useMe } from "@/hooks/use-me";
import { useSessions } from "@/hooks/use-sessions";
import { isApiError } from "@/lib/api-error";
import { isApprovedWorker, isWorkerMe } from "@/lib/me";

export function WorkerSessionsPage() {
  const { data: me } = useMe();
  const approved = isApprovedWorker(me);
  const workerPending = isWorkerMe(me) && me.worker.status === "pending";
  const { data, isLoading, isError, error } = useSessions({
    enabled: approved,
  });

  const sessions = data?.sessions ?? [];

  return (
    <WorkerPageShell title="Sessions" backTo="/worker">
      {workerPending ? (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-950"
          role="status"
        >
          Awaiting admin approval — you cannot log sessions yet.
        </div>
      ) : null}

      {approved ? (
        <Button asChild className="h-11 w-full">
          <Link to="/worker/sessions/new">Add session</Link>
        </Button>
      ) : null}

      {!approved && !workerPending ? (
        <p className="text-base text-muted-foreground">
          Sessions are unavailable for your account status.
        </p>
      ) : null}

      {approved && isLoading ? (
        <p className="text-base text-muted-foreground">Loading sessions…</p>
      ) : null}

      {approved && isError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Could not load sessions. Please try again."}
        </div>
      ) : null}

      {approved && !isLoading && !isError && sessions.length === 0 ? (
        <div className="space-y-3 rounded-md border border-border px-4 py-6 text-center">
          <p className="text-base text-muted-foreground">No sessions yet.</p>
          {approved ? (
            <Button asChild className="h-11">
              <Link to="/worker/sessions/new">Add your first session</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {approved && !isLoading && !isError && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      ) : null}
    </WorkerPageShell>
  );
}
