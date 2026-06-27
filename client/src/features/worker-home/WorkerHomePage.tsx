import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { isApprovedWorker, isWorkerMe } from "@/lib/me";
import { useMe } from "@/hooks/use-me";
import { useSessions } from "@/hooks/use-sessions";
import { isApiError } from "@/lib/api-error";

import { WorkerPageShell } from "@/features/worker/layout/WorkerPageShell";
import { WorkerSystemIdCallout } from "@/features/auth/components/WorkerSystemIdCallout";
import { SessionCard } from "@/features/worker-sessions/components/SessionCard";

const RECENT_SESSIONS_LIMIT = 5;

export function WorkerHomePage() {
  const { data: me, isLoading: isMeLoading } = useMe();
  const approved = isApprovedWorker(me);
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isError,
    error,
  } = useSessions({ enabled: approved });

  if (isMeLoading) {
    return (
      <WorkerPageShell title="Welcome">
        <p className="text-base text-muted-foreground">Loading…</p>
      </WorkerPageShell>
    );
  }

  const worker = isWorkerMe(me) ? me.worker : null;
  const sessions = sessionsData?.sessions ?? [];
  const recentSessions = sessions.slice(0, RECENT_SESSIONS_LIMIT);

  return (
    <WorkerPageShell title="Welcome">
      {me?.name ? (
        <p className="text-base text-muted-foreground">Hello, {me.name}</p>
      ) : null}

      {isWorkerMe(me) ? (
        <WorkerSystemIdCallout systemId={me.systemId} />
      ) : null}

      {worker?.status === "pending" ? (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-950"
          role="status"
        >
          Awaiting admin approval — you cannot log sessions yet.
        </div>
      ) : null}

      {worker?.status === "rejected" ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          role="alert"
        >
          Your account has been rejected. Contact your administrator.
        </div>
      ) : null}

      {approved ? (
        <Button asChild className="h-11 w-full">
          <Link to="/worker/sessions/new">Add new session</Link>
        </Button>
      ) : null}

      {approved ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Previous sessions</h2>
            {sessions.length > 0 ? (
              <Link
                to="/worker/sessions"
                className="text-base text-primary"
              >
                View all
              </Link>
            ) : null}
          </div>

          {isSessionsLoading ? (
            <p className="text-base text-muted-foreground">Loading sessions…</p>
          ) : null}

          {isError ? (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
              role="alert"
            >
              {isApiError(error)
                ? error.message
                : "Could not load sessions. Please try again."}
            </div>
          ) : null}

          {!isSessionsLoading && !isError && sessions.length === 0 ? (
            <div className="space-y-3 rounded-md border border-border px-4 py-6 text-center">
              <p className="text-base text-muted-foreground">
                No sessions yet.
              </p>
              <Button asChild className="h-11">
                <Link to="/worker/sessions/new">Add your first session</Link>
              </Button>
            </div>
          ) : null}

          {!isSessionsLoading && !isError && recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <SessionCard key={session.sessionId} session={session} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <Button asChild variant="outline" className="h-11 w-full">
        <Link to="/worker/profile">View profile</Link>
      </Button>
    </WorkerPageShell>
  );
}
