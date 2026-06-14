import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/base/sidebar";
import type { Role } from "@/types/user";

import { getDashboardNav } from "../config/nav";

type DashboardHeaderProps = {
  role: Role;
};

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const location = useLocation();

  const navItems = getDashboardNav(role);
  const currentPage =
    navItems.find((item) =>
      item.end
        ? location.pathname === item.path
        : location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`),
    )?.label ?? "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 md:h-16 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">{currentPage}</h1>
      </div>
    </header>
  );
}
