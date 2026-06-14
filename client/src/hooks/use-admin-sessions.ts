import { useQuery } from "@tanstack/react-query";

import { listSessions } from "@/api/admin-api";

import { adminKeys } from "./use-admin-workers";

export function useAdminSessions() {
  return useQuery({
    queryKey: adminKeys.sessions(),
    queryFn: listSessions,
  });
}
