import type { ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

export function AppRouter(): ReactNode {
  return <RouterProvider router={router} />;
}
