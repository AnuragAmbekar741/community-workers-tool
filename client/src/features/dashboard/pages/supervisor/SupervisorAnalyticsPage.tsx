export function SupervisorAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      <p className="text-base text-muted-foreground">
        Aggregated reach and attendance across your workers. This screen will
        connect to <code className="text-sm">GET /supervisor/analytics</code>.
      </p>
      <p className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground">
        Analytics — coming soon.
      </p>
    </div>
  );
}
