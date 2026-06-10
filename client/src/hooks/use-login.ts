import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "@/api/auth-api";
import type { LoginRequest } from "@/types/auth";

import { meKeys } from "./use-me";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: (data) => {
      queryClient.setQueryData(meKeys.all, data.user);
    },
  });
}
