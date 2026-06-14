import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/base/sidebar";
import type { Role } from "@/types/user";

import { getCurrentNavItem } from "../config/nav";

type DashboardHeaderProps = {
  role: Role;
};

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const location = useLocation();
  const currentNavItem = getCurrentNavItem(role, location.pathname);
  const pageTitle = currentNavItem?.label ?? "Dashboard";
  const PageIcon = currentNavItem?.icon;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {PageIcon ? (
          <PageIcon className="size-5 shrink-0 text-muted-foreground" />
        ) : null}
        <h1 className="truncate text-xl font-semibold">{pageTitle}</h1>
      </div>
    </header>
  );
}
