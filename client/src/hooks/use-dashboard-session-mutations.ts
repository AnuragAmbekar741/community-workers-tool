import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as adminApi from "@/api/admin-api";
import * as supervisorApi from "@/api/supervisor-api";
import type { CreateSessionRequest } from "@/types/session";

import { adminKeys } from "./use-admin-workers";
import { supervisorKeys } from "./use-supervisor-workers";

type DashboardRole = "admin" | "supervisor";

function getApi(role: DashboardRole) {
  return role === "admin" ? adminApi : supervisorApi;
}

function getKeys(role: DashboardRole) {
  return role === "admin" ? adminKeys : supervisorKeys;
}

export function useUpdateDashboardSession(
  role: DashboardRole,
  sessionId: string,
) {
  const queryClient = useQueryClient();
  const keys = getKeys(role);
  const api = getApi(role);

  return useMutation({
    mutationFn: (body: CreateSessionRequest) =>
      api.updateSession(sessionId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions() });
      void queryClient.invalidateQueries({
        queryKey: keys.session(sessionId),
      });
    },
  });
}

export function useDeleteDashboardSession(role: DashboardRole) {
  const queryClient = useQueryClient();
  const keys = getKeys(role);
  const api = getApi(role);

  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSession(sessionId),
    onSuccess: (_data, sessionId) => {
      void queryClient.invalidateQueries({ queryKey: keys.sessions() });
      queryClient.removeQueries({ queryKey: keys.session(sessionId) });
    },
  });
}
