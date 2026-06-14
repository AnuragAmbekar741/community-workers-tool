import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/layout/DashboardLayout";
import { AdminOverviewPage } from "@/features/dashboard/pages/admin/AdminOverviewPage";
import { AdminSessionsPage } from "@/features/dashboard/pages/admin/AdminSessionsPage";
import { AdminWorkersPage } from "@/features/dashboard/pages/admin/AdminWorkersPage";
import { SupervisorAnalyticsPage } from "@/features/dashboard/pages/supervisor/SupervisorAnalyticsPage";
import { SupervisorOverviewPage } from "@/features/dashboard/pages/supervisor/SupervisorOverviewPage";
import { SupervisorSessionsPage } from "@/features/dashboard/pages/supervisor/SupervisorSessionsPage";
import { SupervisorWorkersPage } from "@/features/dashboard/pages/supervisor/SupervisorWorkersPage";
import { AuthLoginStubPage } from "@/features/auth-login/AuthLoginStubPage";
import { RegisterPage } from "@/features/auth-register/RegisterPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { WorkerHomeStubPage } from "@/features/worker-home/WorkerHomeStubPage";
import { RootLayout } from "@/layouts/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "login", element: <AuthLoginStubPage /> },
      {
        path: "worker",
        element: (
          <ProtectedRoute role="worker">
            <WorkerHomeStubPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "supervisor",
        element: (
          <ProtectedRoute role="supervisor">
            <DashboardLayout role="supervisor" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <SupervisorOverviewPage /> },
          { path: "workers", element: <SupervisorWorkersPage /> },
          { path: "sessions", element: <SupervisorSessionsPage /> },
          { path: "analytics", element: <SupervisorAnalyticsPage /> },
        ],
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute role="admin">
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: "workers", element: <AdminWorkersPage /> },
          { path: "sessions", element: <AdminSessionsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
