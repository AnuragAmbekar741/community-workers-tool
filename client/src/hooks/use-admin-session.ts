import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/api/admin-api";

import { adminKeys } from "./use-admin-workers";

export function useAdminSession(sessionId: string) {
  return useQuery({
    queryKey: adminKeys.session(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: Boolean(sessionId),
  });
}
