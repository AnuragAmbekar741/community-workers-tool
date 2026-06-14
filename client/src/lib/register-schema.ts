import { z } from "zod";

import type { RegisterRequest } from "@/types/auth";

import {
  DISTRICT,
  EDUCATION,
  GENDER,
  ORGANISATION,
  VILLAGE,
  WORKER_ROLE,
  type District,
  type Education,
  type Gender,
  type Organisation,
  type Village,
  type WorkerRole,
} from "./constants";

function requiredEnum<const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) {
  return z
    .union([z.literal(""), z.enum(values)])
    .transform((value, ctx) => {
      if (value === "") {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return value;
    });
}

export const registerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .positive("Age must be greater than 0"),
  gender: requiredEnum(GENDER, "Gender is required"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organisation: requiredEnum(ORGANISATION, "Organisation is required"),
  workerRole: requiredEnum(WORKER_ROLE, "Worker role is required"),
  education: requiredEnum(EDUCATION, "Education is required"),
  district: requiredEnum(DISTRICT, "District is required"),
  villages: z.array(z.enum(VILLAGE)).min(1, "Select at least one village"),
  consentGiven: z
    .boolean()
    .refine((val) => val === true, { message: "You must accept to register" }),
});

export type RegisterFormValues = {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  password: string;
  organisation: Organisation;
  workerRole: WorkerRole;
  education: Education;
  district: District;
  villages: Village[];
  consentGiven: boolean;
};
export type RegisterFormInput = z.input<typeof registerFormSchema>;

export function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return {
    name: values.name,
    age: values.age,
    gender: values.gender,
    phone: values.phone,
    password: values.password,
    organisation: values.organisation,
    workerRole: values.workerRole,
    education: values.education,
    district: values.district,
    villages: values.villages,
    consentGiven: true,
  };
}

export const registerFormDefaultValues: RegisterFormInput = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  password: "",
  organisation: "",
  workerRole: "",
  education: "",
  district: "",
  villages: [],
  consentGiven: false,
};
