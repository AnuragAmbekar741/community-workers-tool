import { WorkerPageShell } from "@/features/worker/layout/WorkerPageShell";
import { SessionForm } from "@/features/worker-sessions/components/SessionForm";
import { useMe } from "@/hooks/use-me";
import { isWorkerMe } from "@/lib/me";

export function NewSessionPage() {
  const { data: me } = useMe();

  if (!isWorkerMe(me)) {
    return (
      <WorkerPageShell title="New session" backTo="/worker">
        <p className="text-base text-destructive" role="alert">
          Could not load worker profile.
        </p>
      </WorkerPageShell>
    );
  }

  return (
    <WorkerPageShell title="New session" backTo="/worker">
      <SessionForm defaultDistrict={me.worker.district} />
    </WorkerPageShell>
  );
}
