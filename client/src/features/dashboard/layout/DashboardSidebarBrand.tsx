import { LayoutDashboard } from "lucide-react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/base/sidebar";
import type { Role } from "@/types/user";

import { getRoleLabel } from "../config/nav";

type DashboardSidebarBrandProps = {
  role: Role;
};

export function DashboardSidebarBrand({ role }: DashboardSidebarBrandProps) {
  return (
    <SidebarHeader className="p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboard className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">M&amp;E Tool</span>
              <span className="truncate text-xs text-muted-foreground">
                {getRoleLabel(role)}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
