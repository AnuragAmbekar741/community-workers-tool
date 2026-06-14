import { useMutation } from "@tanstack/react-query";

import { register } from "@/api/auth-api";
import type { RegisterRequest } from "@/types/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
  });
}
