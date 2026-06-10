import { createBrowserRouter } from "react-router-dom";
import { AuthLoginStubPage } from "@/features/auth-login/AuthLoginStubPage";
import { AuthRegisterStubPage } from "@/features/auth-register/AuthRegisterStubPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { RootLayout } from "@/layouts/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "register", element: <AuthRegisterStubPage /> },
      { path: "login", element: <AuthLoginStubPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
