import type { Gender, Role, WorkerStatus } from "../../constants/index.js";
import type { Worker } from "../../db/schema/workers.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../lib/errors.js";
import { nextWorkerIdFromMax } from "../../lib/id-generator.js";
import { hashPassword } from "../../lib/password.js";
import type { PublicUser } from "../users/users.service.js";
import { UsersRepository } from "../users/users.repository.js";
import { WorkersRepository } from "./workers.repository.js";
import type { RegisterWorkerBody } from "./workers.schema.js";

export type WorkerProfile = Worker;

export interface RegisterWorkerResult {
  user: PublicUser;
  worker: WorkerProfile;
}

export interface AdminWorkerListItem {
  user: PublicUser;
  worker: WorkerProfile;
}

function toPublicUser(user: {
  systemId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  organisation: string | null;
  role: string;
  createdAt: Date;
}): PublicUser {
  return {
    systemId: user.systemId,
    name: user.name,
    age: user.age,
    gender: user.gender as Gender,
    phone: user.phone,
    organisation: user.organisation as PublicUser["organisation"],
    role: user.role as Role,
    createdAt: user.createdAt,
  };
}

export class WorkersService {
  constructor(
    private workersRepo = new WorkersRepository(),
    private usersRepo = new UsersRepository(),
  ) {}

  async registerWorker(input: RegisterWorkerBody): Promise<RegisterWorkerResult> {
    if (!input.consentGiven) {
      throw new ValidationError("Consent is required to register");
    }

    const existing = await this.usersRepo.findByPhone(input.phone);
    if (existing) {
      throw new ConflictError("Phone already registered");
    }

    const systemId = nextWorkerIdFromMax(await this.workersRepo.getMaxWorkerId());
    const passwordHash = await hashPassword(input.password);

    const { user, worker } = await this.workersRepo.registerWorkerPair(
      {
        systemId,
        name: input.name,
        age: input.age,
        gender: input.gender,
        phone: input.phone,
        organisation: input.organisation,
        role: "worker",
        passwordHash,
      },
      {
        systemId,
        status: "pending",
        supervisorId: null,
        workerRole: input.workerRole,
        education: input.education,
        district: input.district,
        villages: [...input.villages],
        consentGiven: input.consentGiven,
      },
    );

    return {
      user: toPublicUser(user),
      worker,
    };
  }

  async findById(workerId: string): Promise<WorkerProfile> {
    const worker = await this.workersRepo.findById(workerId);
    if (!worker) {
      throw new NotFoundError("Worker not found");
    }
    return worker;
  }

  async approveWorker(
    workerId: string,
    approved: boolean,
  ): Promise<WorkerProfile> {
    const worker = await this.findById(workerId);
    const targetStatus = approved ? "approved" : "rejected";

    if (worker.status === targetStatus) {
      return worker;
    }

    return this.workersRepo.updateStatus(workerId, targetStatus);
  }

  async assignSupervisor(
    workerId: string,
    supervisorId: string,
  ): Promise<WorkerProfile> {
    const worker = await this.findById(workerId);

    if (worker.status !== "approved") {
      throw new ValidationError("Worker must be approved before assignment");
    }

    const workerUser = await this.usersRepo.findById(workerId);
    if (!workerUser) {
      throw new NotFoundError("Worker user not found");
    }

    const supervisor = await this.usersRepo.findById(supervisorId);
    if (!supervisor) {
      throw new NotFoundError("Supervisor not found");
    }

    if (supervisor.role !== "supervisor") {
      throw new ValidationError("Assignee must be a supervisor");
    }

    if (workerUser.organisation !== supervisor.organisation) {
      throw new ValidationError(
        "Worker and supervisor must belong to the same organisation",
      );
    }

    return this.workersRepo.assignSupervisor(workerId, supervisorId);
  }

  async listAllWorkerIds(): Promise<{ workers: string[] }> {
    const workers = await this.workersRepo.listAllIds();
    return { workers };
  }

  async listWorkersForAdmin(
    status?: WorkerStatus,
  ): Promise<{ workers: AdminWorkerListItem[] }> {
    const rows = await this.workersRepo.listAllWithUsers(status);
    return {
      workers: rows.map(({ user, worker }) => ({
        user: toPublicUser(user),
        worker,
      })),
    };
  }

  async listSupervisorWorkerIds(
    supervisorId: string,
  ): Promise<{ workers: string[] }> {
    const workers = await this.workersRepo.listIdsBySupervisor(supervisorId);
    return { workers };
  }

  async assertApproved(workerId: string): Promise<WorkerProfile> {
    const worker = await this.findById(workerId);
    if (worker.status !== "approved") {
      throw new ForbiddenError("Worker is not approved");
    }
    return worker;
  }

  async assertSupervisorOwnsWorker(
    supervisorId: string,
    workerId: string,
  ): Promise<WorkerProfile> {
    const worker = await this.findById(workerId);
    if (worker.supervisorId !== supervisorId) {
      throw new ForbiddenError("Worker is not assigned to this supervisor");
    }
    return worker;
  }
}
