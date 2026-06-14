import { z } from "zod";
import { registerWorkerBodySchema } from "../workers/workers.schema.js";

export const loginSchema = z.object({
  body: z
    .object({
      password: z.string().min(1),
      phone: z.string().min(1).optional(),
      systemId: z.string().min(1).optional(),
    })
    .refine(
      (data) => (data.phone ? 1 : 0) + (data.systemId ? 1 : 0) === 1,
      { message: "Provide exactly one of phone or systemId" },
    ),
});

export const registerSchema = z.object({
  body: registerWorkerBodySchema,
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RegisterBody = z.infer<typeof registerSchema>["body"];
