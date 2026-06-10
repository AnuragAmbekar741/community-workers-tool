import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/features/home/HomePage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { RootLayout } from "@/layouts/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
