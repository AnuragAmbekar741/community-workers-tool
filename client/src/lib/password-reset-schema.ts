import { z } from "zod";

export const confirmPhoneSchema = z.object({
  phone: z.string().trim().min(1, "Phone number is required").max(32),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ConfirmPhoneValues = z.infer<typeof confirmPhoneSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
