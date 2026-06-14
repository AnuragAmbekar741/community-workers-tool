import type { Role } from "@/types/user";

export function getRoleHomePath(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "supervisor":
      return "/supervisor";
    case "worker":
      return "/worker";
  }
}
