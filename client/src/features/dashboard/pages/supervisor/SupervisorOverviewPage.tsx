import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { useSupervisorSessions } from "@/hooks/use-supervisor-sessions";
import { useSupervisorWorkers } from "@/hooks/use-supervisor-workers";
import { useMe } from "@/hooks/use-me";
import { ORGANISATION_OPTIONS } from "@/lib/constants";

import { OverviewStatCard } from "../../components/OverviewStatCard";

export function SupervisorOverviewPage() {
  const { data: user } = useMe();
  const { data: allWorkers } = useSupervisorWorkers();
  const { data: pendingWorkers } = useSupervisorWorkers("pending");
  const { data: allSessions } = useSupervisorSessions();

  const totalCount = allWorkers?.workers.length ?? 0;
  const pendingCount = pendingWorkers?.workers.length ?? 0;
  const sessionCount = allSessions?.sessions.length ?? 0;
  const organisationLabel = user?.organisation
    ? (ORGANISATION_OPTIONS.find((option) => option.value === user.organisation)
        ?.label ?? user.organisation)
    : "—";

  return (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">
          Monitor worker registrations and session activity in your
          organisation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewStatCard
          title="Pending approvals"
          value={pendingCount}
          description="Workers awaiting review"
        />
        <OverviewStatCard
          title="Organisation workers"
          value={totalCount}
          description="All registered workers in your org"
        />
        <OverviewStatCard
          title="Org sessions"
          value={sessionCount}
          description="Logged community sessions"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Organisation: {organisationLabel}
      </p>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="h-11">
          <Link to="/supervisor/workers">Review pending workers</Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link to="/supervisor/sessions">View sessions</Link>
        </Button>
      </div>
    </div>
  );
}
