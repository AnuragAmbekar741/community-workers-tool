import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <Outlet />
    </div>
  );
}
