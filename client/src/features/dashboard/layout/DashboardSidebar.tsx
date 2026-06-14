import type { Role } from "@/types/user";

import { DashboardNavUser } from "./DashboardNavUser";
import { DashboardSidebarBrand } from "./DashboardSidebarBrand";
import { DashboardSidebarNav } from "./DashboardSidebarNav";

type DashboardSidebarContentProps = {
  role: Role;
  onLogout: () => void;
};

export function DashboardSidebarContent({
  role,
  onLogout,
}: DashboardSidebarContentProps) {
  return (
    <>
      <DashboardSidebarBrand role={role} />
      <DashboardSidebarNav role={role} />
      <DashboardNavUser onLogout={onLogout} />
    </>
  );
}
