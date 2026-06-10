import { useMutation, useQueryClient } from "@tanstack/react-query";

import { register } from "@/api/auth-api";
import type { RegisterRequest } from "@/types/auth";

import { meKeys } from "./use-me";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: (data) => {
      queryClient.setQueryData(meKeys.all, data.user);
    },
  });
}
