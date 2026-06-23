import { createBrowserRouter, Outlet } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/layout/DashboardLayout";
import { AdminOverviewPage } from "@/features/dashboard/pages/admin/AdminOverviewPage";
import { AdminSessionDetailPage } from "@/features/dashboard/pages/admin/AdminSessionDetailPage";
import { AdminSessionsPage } from "@/features/dashboard/pages/admin/AdminSessionsPage";
import { AdminWorkersPage } from "@/features/dashboard/pages/admin/AdminWorkersPage";
import { SupervisorAnalyticsPage } from "@/features/dashboard/pages/supervisor/SupervisorAnalyticsPage";
import { SupervisorOverviewPage } from "@/features/dashboard/pages/supervisor/SupervisorOverviewPage";
import { SupervisorSessionDetailPage } from "@/features/dashboard/pages/supervisor/SupervisorSessionDetailPage";
import { SupervisorSessionsPage } from "@/features/dashboard/pages/supervisor/SupervisorSessionsPage";
import { SupervisorWorkersPage } from "@/features/dashboard/pages/supervisor/SupervisorWorkersPage";
import { AuthLoginStubPage } from "@/features/auth-login/AuthLoginStubPage";
import { RegisterPage } from "@/features/auth-register/RegisterPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { ApprovedWorkerGuard } from "@/features/worker/components/ApprovedWorkerGuard";
import { WorkerHomePage } from "@/features/worker-home/WorkerHomePage";
import { WorkerProfilePage } from "@/features/worker-profile/WorkerProfilePage";
import { NewSessionPage } from "@/features/worker-sessions/NewSessionPage";
import { SessionDetailPage } from "@/features/worker-sessions/SessionDetailPage";
import { WorkerSessionsPage } from "@/features/worker-sessions/WorkerSessionsPage";
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
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <WorkerHomePage /> },
          { path: "profile", element: <WorkerProfilePage /> },
          { path: "sessions", element: <WorkerSessionsPage /> },
          {
            path: "sessions/new",
            element: (
              <ApprovedWorkerGuard>
                <NewSessionPage />
              </ApprovedWorkerGuard>
            ),
          },
          { path: "sessions/:id", element: <SessionDetailPage /> },
        ],
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
          { path: "sessions/:id", element: <SupervisorSessionDetailPage /> },
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
          { path: "sessions/:id", element: <AdminSessionDetailPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
