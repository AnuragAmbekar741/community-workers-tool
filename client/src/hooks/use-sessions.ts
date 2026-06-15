import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
} from "@/api/sessions-api";
import type { CreateSessionRequest } from "@/types/session";

export const sessionKeys = {
  all: ["sessions"] as const,
  detail: (id: string) => ["sessions", id] as const,
};

export function useSessions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: listSessions,
    enabled: options?.enabled ?? true,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionRequest) => createSession(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: (_data, sessionId) => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.removeQueries({ queryKey: sessionKeys.detail(sessionId) });
    },
  });
}
