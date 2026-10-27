import { createRouter } from "@tanstack/react-router";

import { NotFound } from "./components/not-found";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () =>
  createRouter({
    defaultNotFoundComponent: NotFound,
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });
