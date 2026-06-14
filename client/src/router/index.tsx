import { createBrowserRouter } from "react-router-dom";
import { AuthLoginStubPage } from "@/features/auth-login/AuthLoginStubPage";
import { RegisterPage } from "@/features/auth-register/RegisterPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { WorkerHomeStubPage } from "@/features/worker-home/WorkerHomeStubPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { RootLayout } from "@/layouts/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "login", element: <AuthLoginStubPage /> },
      { path: "worker", element: <WorkerHomeStubPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
