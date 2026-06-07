import { z } from "zod";
import { registerWorkerBodySchema } from "../workers/workers.schema.js";

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(1),
    password: z.string().min(1),
  }),
});

export const registerSchema = z.object({
  body: registerWorkerBodySchema,
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RegisterBody = z.infer<typeof registerSchema>["body"];
