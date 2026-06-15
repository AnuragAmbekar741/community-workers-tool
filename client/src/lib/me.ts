import type { MeResponse, WorkerMeResponse } from "@/types/user";

export function isWorkerMe(
  me: MeResponse | undefined,
): me is WorkerMeResponse {
  return (
    me !== undefined &&
    me.role === "worker" &&
    "worker" in me &&
    me.worker !== undefined
  );
}

export function isApprovedWorker(me: MeResponse | undefined): boolean {
  return isWorkerMe(me) && me.worker.status === "approved";
}
