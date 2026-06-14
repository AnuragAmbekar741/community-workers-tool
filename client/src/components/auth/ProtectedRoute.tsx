import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useMe } from "@/hooks/use-me";
import { isApiError } from "@/lib/api-error";
import { getRoleHomePath } from "@/lib/auth-routes";
import type { Role } from "@/types/user";

type ProtectedRouteProps = {
  role?: Role;
  children: ReactNode;
};

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isLoading, isError, error } = useMe();

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm items-center justify-center p-4">
        <p className="text-base text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const isUnauthorized =
    !user || (isError && isApiError(error) && error.status === 401);

  if (isUnauthorized) {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
}
