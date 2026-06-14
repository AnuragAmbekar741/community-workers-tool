import type { WorkerDto } from "./auth";
import type { UserDto } from "./user";

export type WorkerStatusFilter = "pending" | "approved" | "rejected";

export type AdminWorkerListItem = {
  user: UserDto;
  worker: WorkerDto;
};

export type ListWorkersResponse = {
  workers: AdminWorkerListItem[];
};

export type ApproveWorkerResponse = {
  worker: WorkerDto;
};
