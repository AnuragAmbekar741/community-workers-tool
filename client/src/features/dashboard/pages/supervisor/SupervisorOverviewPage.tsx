import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { useMe } from "@/hooks/use-me";
import { ORGANISATION_OPTIONS } from "@/lib/constants";

import { OverviewStatCard } from "../../components/OverviewStatCard";

export function SupervisorOverviewPage() {
  const { data: user } = useMe();

  const organisationLabel = user?.organisation
    ? (ORGANISATION_OPTIONS.find((option) => option.value === user.organisation)
        ?.label ?? user.organisation)
    : "—";

  return (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">
          Track your assigned workers and their community sessions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewStatCard
          title="Assigned workers"
          value="—"
          description="From GET /supervisor/workers"
        />
        <OverviewStatCard
          title="Sessions this month"
          value="—"
          description="From analytics API"
        />
        <OverviewStatCard
          title="Organisation"
          value={organisationLabel}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default" className="h-11">
          <Link to="/supervisor/workers">View workers</Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link to="/supervisor/sessions">View sessions</Link>
        </Button>
        <Button type="button" variant="outline" className="h-11" disabled>
          Export PDF
        </Button>
      </div>
    </div>
  );
}
