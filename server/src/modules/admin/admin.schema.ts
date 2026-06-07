import { z } from "zod";

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
