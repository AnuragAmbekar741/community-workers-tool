import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types/user";

export type DashboardNavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
};

const supervisorNav: DashboardNavItem[] = [
  {
    label: "Overview",
    path: "/supervisor",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Workers",
    path: "/supervisor/workers",
    icon: Users,
  },
  {
    label: "Sessions",
    path: "/supervisor/sessions",
    icon: Calendar,
  },
  {
    label: "Analytics",
    path: "/supervisor/analytics",
    icon: BarChart3,
  },
];

const adminNav: DashboardNavItem[] = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Workers",
    path: "/admin/workers",
    icon: Users,
  },
  {
    label: "Sessions",
    path: "/admin/sessions",
    icon: Calendar,
  },
];

export function getDashboardNav(role: Role): DashboardNavItem[] {
  switch (role) {
    case "supervisor":
      return supervisorNav;
    case "admin":
      return adminNav;
    case "worker":
      return [];
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "supervisor":
      return "Supervisor";
    case "admin":
      return "Admin";
    case "worker":
      return "Worker";
  }
}

export function getDashboardHomePath(role: Role): string {
  switch (role) {
    case "supervisor":
      return "/supervisor";
    case "admin":
      return "/admin";
    case "worker":
      return "/worker";
  }
}
