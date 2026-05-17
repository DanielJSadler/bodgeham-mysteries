import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing VITE_CONVEX_URL in your environment");
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: { queryClient },
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}
