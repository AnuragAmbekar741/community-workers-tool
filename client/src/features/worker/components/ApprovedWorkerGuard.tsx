import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import { isApprovedWorker, isWorkerMe } from "@/lib/me";
import { useMe } from "@/hooks/use-me";

import { WorkerPageShell } from "../layout/WorkerPageShell";

type ApprovedWorkerGuardProps = {
  children: React.ReactNode;
};

export function ApprovedWorkerGuard({ children }: ApprovedWorkerGuardProps) {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <WorkerPageShell title="New session">
        <p className="text-base text-muted-foreground">Loading…</p>
      </WorkerPageShell>
    );
  }

  if (!isWorkerMe(me) || !isApprovedWorker(me)) {
    return (
      <WorkerPageShell title="New session" backTo="/worker">
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-950"
          role="status"
        >
          Awaiting admin approval — you cannot log sessions yet.
        </div>
        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/worker">Back to home</Link>
        </Button>
      </WorkerPageShell>
    );
  }

  return children;
}
