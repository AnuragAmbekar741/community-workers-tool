export function SupervisorSessionsPage() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      <p className="text-base text-muted-foreground">
        Sessions logged by your assigned workers. This screen will connect to{" "}
        <code className="text-sm">GET /supervisor/sessions</code>.
      </p>
      <p className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground">
        Worker sessions — coming soon.
      </p>
    </div>
  );
}
