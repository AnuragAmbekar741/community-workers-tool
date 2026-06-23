import { lazy, Suspense, useMemo, useState } from "react";

import { SessionsLoadError } from "@/features/dashboard/components/SessionsLoadError";
import { OverviewStatCard } from "@/features/dashboard/components/OverviewStatCard";
import { useSupervisorAnalytics } from "@/hooks/use-supervisor-analytics";
import { useSupervisorWorkers } from "@/hooks/use-supervisor-workers";
import type { AnalyticsFilters } from "@/types/analytics";

import { AnalyticsFiltersBar } from "../../components/analytics/AnalyticsFiltersBar";
import { RecentSubmissionsTable } from "../../components/analytics/RecentSubmissionsTable";
import { WorkerAnalyticsTable } from "../../components/analytics/WorkerAnalyticsTable";

const AnalyticsCharts = lazy(() =>
  import("../../components/analytics/AnalyticsCharts").then((module) => ({
    default: module.AnalyticsCharts,
  })),
);

function ChartSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[300px] animate-pulse rounded-lg border bg-muted/40"
        />
      ))}
    </div>
  );
}

export function SupervisorAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [workerMonth, setWorkerMonth] = useState("all");

  const queryFilters = useMemo<AnalyticsFilters>(
    () => ({
      ...filters,
      workerMonth: workerMonth === "all" ? undefined : workerMonth,
    }),
    [filters, workerMonth],
  );

  const { data, isLoading, isError, error, refetch } =
    useSupervisorAnalytics(queryFilters);
  const { data: workersData } = useSupervisorWorkers();

  const workerOptions = useMemo(
    () =>
      (workersData?.workers ?? [])
        .map((item) => item.user.systemId)
        .sort(),
    [workersData],
  );

  const monthOptions = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.sessionsByMonth.map((row) => row.month);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto">
        <div className="h-28 animate-pulse rounded-lg border bg-muted/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 overflow-y-auto">
        <SessionsLoadError error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <p className="text-base text-muted-foreground">
        Aggregated reach and attendance across your workers.
      </p>

      <AnalyticsFiltersBar
        filters={filters}
        workerOptions={workerOptions}
        onFiltersChange={setFilters}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard
          title="Sessions"
          value={data.topBox.totalSessions}
        />
        <OverviewStatCard
          title="People reached"
          value={data.topBox.totalReached}
        />
        <OverviewStatCard
          title="Active workers"
          value={`${data.topBox.activeWorkers} / ${data.topBox.totalWorkers}`}
          description="Logged a session in the last 30 days"
        />
        <OverviewStatCard
          title="Districts covered"
          value={data.topBox.districtsCovered}
        />
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsCharts data={data} />
      </Suspense>

      <RecentSubmissionsTable sessions={data.recentSubmissions} />

      <WorkerAnalyticsTable
        workers={data.workerTable}
        workerMonth={workerMonth}
        onWorkerMonthChange={setWorkerMonth}
        monthOptions={monthOptions}
      />
    </div>
  );
}
