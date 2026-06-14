export function SupervisorWorkersPage() {
  return (
    <div className="space-y-4">
      <p className="text-base text-muted-foreground">
        Workers assigned to you by an admin. This screen will list worker
        profiles from <code className="text-sm">GET /supervisor/workers</code>.
      </p>
      <p className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground">
        Assigned workers — coming soon.
      </p>
    </div>
  );
}
