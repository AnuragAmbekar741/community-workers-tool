import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/api/auth-api";
import { clearAuthToken } from "@/lib/auth-token";

import { meKeys } from "./use-me";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: meKeys.all });
    },
  });
}
