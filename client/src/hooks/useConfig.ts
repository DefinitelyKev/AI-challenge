import { useQuery } from "@tanstack/react-query";
import { configService } from "../services";

/**
 * Query keys for config-related queries
 * Centralizes cache keys for consistency
 */
export const configKeys = {
  all: ["config"] as const,
  detail: () => [...configKeys.all, "detail"] as const,
};

/**
 * useConfig - Fetches and caches triage configuration
 *
 * @returns Query result with data, loading, and error states
 *
 * Usage:
 * const { data, isLoading, error } = useConfig();
 */
export function useConfig() {
  return useQuery({
    queryKey: configKeys.detail(),
    queryFn: configService.getConfig,
  });
}
