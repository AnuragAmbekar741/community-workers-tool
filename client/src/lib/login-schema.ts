import { z } from "zod";

import type { LoginRequest } from "@/types/auth";

export const loginFormSchema = z
  .object({
    identifierType: z.enum(["phone", "systemId"]),
    phone: z.string().optional(),
    systemId: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.identifierType === "phone") {
      if (!data.phone?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Phone is required",
          path: ["phone"],
        });
      }
      return;
    }

    if (!data.systemId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "System ID is required",
        path: ["systemId"],
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginFormDefaultValues: LoginFormValues = {
  identifierType: "phone",
  phone: "",
  systemId: "",
  password: "",
};

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  if (values.identifierType === "phone") {
    return {
      phone: values.phone!.trim(),
      password: values.password,
    };
  }

  return {
    systemId: values.systemId!.trim(),
    password: values.password,
  };
}
