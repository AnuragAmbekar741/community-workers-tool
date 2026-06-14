export function AdminSessionsPage() {
  return (
    <div className="space-y-4">
      <p className="text-base text-muted-foreground">
        View and manage sessions across all workers. This screen will connect to{" "}
        <code className="text-sm">GET /admin/sessions</code> in a follow-up.
      </p>
      <p className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground">
        All sessions — coming soon.
      </p>
    </div>
  );
}
