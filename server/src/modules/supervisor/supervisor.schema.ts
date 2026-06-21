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

export type ApproveWorkerParams = z.infer<typeof approveWorkerSchema>["params"];
export type ApproveWorkerBody = z.infer<typeof approveWorkerSchema>["body"];
export type ListWorkersQuery = z.infer<typeof listWorkersQuerySchema>["query"];
