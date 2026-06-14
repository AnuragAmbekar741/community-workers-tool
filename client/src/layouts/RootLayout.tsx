import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/base/sonner";

export function RootLayout() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <Outlet />
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}
