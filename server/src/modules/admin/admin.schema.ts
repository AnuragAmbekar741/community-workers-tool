import { z } from "zod";
import { zWorkerStatus } from "../../constants/index.js";

export const listWorkersQuerySchema = z.object({
  query: z.object({
    status: zWorkerStatus.optional(),
  }),
});

export const approveWorkerSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    approved: z.boolean(),
  }),
});

export const assignWorkerSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    supervisorId: z.string().min(1),
  }),
});

export type ApproveWorkerParams = z.infer<typeof approveWorkerSchema>["params"];
export type ApproveWorkerBody = z.infer<typeof approveWorkerSchema>["body"];
export type AssignWorkerParams = z.infer<typeof assignWorkerSchema>["params"];
export type AssignWorkerBody = z.infer<typeof assignWorkerSchema>["body"];
export type ListWorkersQuery = z.infer<typeof listWorkersQuerySchema>["query"];
