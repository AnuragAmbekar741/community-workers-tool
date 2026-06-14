import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useAdminWorkers } from "@/hooks/use-admin-workers";
import { useMe } from "@/hooks/use-me";
import { ORGANISATION_OPTIONS } from "@/lib/constants";

import { OverviewStatCard } from "../../components/OverviewStatCard";

export function AdminOverviewPage() {
  const { data: user } = useMe();
  const { data: allWorkers } = useAdminWorkers();
  const { data: pendingWorkers } = useAdminWorkers("pending");
  const { data: allSessions } = useAdminSessions();

  const totalCount = allWorkers?.workers.length ?? 0;
  const pendingCount = pendingWorkers?.workers.length ?? 0;
  const sessionCount = allSessions?.sessions.length ?? 0;
  const organisationLabel = user?.organisation
    ? (ORGANISATION_OPTIONS.find((option) => option.value === user.organisation)
        ?.label ?? user.organisation)
    : null;

  return (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">
          Monitor worker registrations and session activity across the
          programme.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewStatCard
          title="Pending approvals"
          value={pendingCount}
          description="Workers awaiting review"
        />
        <OverviewStatCard
          title="Total workers"
          value={totalCount}
          description="All registered workers"
        />
        <OverviewStatCard
          title="All sessions"
          value={sessionCount}
          description="Logged community sessions"
        />
      </div>

      {organisationLabel ? (
        <p className="text-sm text-muted-foreground">
          Organisation context: {organisationLabel}
        </p>
      ) : null}

      <Button asChild className="h-11">
        <Link to="/admin/workers">Review pending workers</Link>
      </Button>
    </div>
  );
}
