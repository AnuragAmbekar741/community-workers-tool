import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/base/button";
import { SessionDetailFields } from "@/features/worker-sessions/components/SessionDetailFields";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useSupervisorSession } from "@/hooks/use-supervisor-session";
import { isApiError } from "@/lib/api-error";

type DashboardSessionDetailPageProps = {
  role: "supervisor" | "admin";
};

export function DashboardSessionDetailPage({
  role,
}: DashboardSessionDetailPageProps) {
  const { id = "" } = useParams();
  const sessionsPath =
    role === "supervisor" ? "/supervisor/sessions" : "/admin/sessions";

  const supervisorQuery = useSupervisorSession(id);
  const adminQuery = useAdminSession(id);
  const { data, isLoading, isError, error } =
    role === "supervisor" ? supervisorQuery : adminQuery;

  const session = data?.session;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-base text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          role="alert"
        >
          {isApiError(error)
            ? error.message
            : "Session not found or you do not have access."}
        </div>
        <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
          <Link to={sessionsPath}>Back to sessions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="space-y-4 rounded-lg border border-border bg-background p-4">
        <SessionDetailFields session={session} showWorkerId />
      </div>

      <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
        <Link to={sessionsPath}>Back to sessions</Link>
      </Button>
    </div>
  );
}
