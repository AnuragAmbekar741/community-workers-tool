import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { meKeys } from "@/hooks/use-me";
import { clearAuthToken } from "@/lib/auth-token";
import { registerUnauthorizedHandler } from "@/lib/auth-unauthorized";
import { router } from "@/router";

import "./global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: false,
    },
  },
});

registerUnauthorizedHandler(() => {
  clearAuthToken();
  queryClient.removeQueries({ queryKey: meKeys.all });
  window.location.assign("/login");
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
