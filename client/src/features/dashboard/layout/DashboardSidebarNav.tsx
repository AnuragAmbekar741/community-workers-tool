import { NavLink, useLocation } from "react-router-dom";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/base/sidebar";
import type { Role } from "@/types/user";

import { getDashboardNav, type DashboardNavItem } from "../config/nav";

type DashboardSidebarNavProps = {
  role: Role;
};

function isNavItemActive(item: DashboardNavItem, pathname: string): boolean {
  if (item.end) {
    return pathname === item.path;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export function DashboardSidebarNav({ role }: DashboardSidebarNavProps) {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const navItems = getDashboardNav(role);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(item, location.pathname)}
                  tooltip={item.label}
                  className="my-0.5 py-0.5"
                >
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => setOpenMobile(false)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
