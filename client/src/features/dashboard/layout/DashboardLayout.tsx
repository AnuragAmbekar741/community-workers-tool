import { Outlet, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/base/sidebar";
import { TooltipProvider } from "@/components/base/tooltip";
import { useLogout } from "@/hooks/use-logout";
import type { Role } from "@/types/user";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebarContent } from "./DashboardSidebar";

type DashboardLayoutProps = {
  role: Role;
};

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r">
          <DashboardSidebarContent role={role} onLogout={handleLogout} />
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex h-svh flex-col overflow-hidden">
          <DashboardHeader role={role} />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/30 p-4 md:p-6">
            <div className="mx-auto flex min-h-0 w-full flex-1 flex-col">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
