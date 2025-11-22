import { QueryClient } from "@tanstack/react-query";

/**
 * Query client instance with default configuration
 *
 * Configuration options:
 * - defaultOptions: Sets default behavior for all queries and mutations
 * - retry: Number of retry attempts for failed requests (1 = one retry)
 * - staleTime: Time in ms before data is considered stale (5 minutes)
 * - refetchOnWindowFocus: Auto-refetch when window regains focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests once before showing error
      retry: 1,

      // Data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Don't refetch on window focus (can be annoying during development)
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data exists and isn't stale
      refetchOnMount: false,

      // Refetch on reconnect in case data changed while offline
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
