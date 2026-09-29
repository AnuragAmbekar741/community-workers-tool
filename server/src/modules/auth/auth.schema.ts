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

export const forgotPasswordSchema = z.object({
  body: z.object({
    phone: z.string().trim().min(1, "Phone number is required").max(32),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>["body"];
