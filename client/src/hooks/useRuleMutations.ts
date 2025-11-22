import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configService } from "../services";
import { configKeys } from "./useConfig";
import type { TriageRule } from "../schemas";

/**
 * useCreateRule - Mutation hook for creating a new triage rule
 *
 * @returns Mutation object with mutate function and state
 *
 * Usage:
 * const createRule = useCreateRule();
 * createRule.mutate(newRule, {
 *   onSuccess: () => console.log('Rule created'),
 * });
 */
export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<TriageRule, "id">) => configService.createRule(rule),
    onSuccess: () => {
      // Invalidate and refetch config after successful creation
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
  });
}

/**
 * useUpdateRule - Mutation hook for updating an existing triage rule
 *
 * @returns Mutation object with mutate function and state
 *
 * Usage:
 * const updateRule = useUpdateRule();
 * updateRule.mutate({ id: '123', ...ruleData }, {
 *   onSuccess: () => console.log('Rule updated'),
 * });
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rule }: { id: string; rule: TriageRule }) => configService.updateRule(id, rule),
    onSuccess: () => {
      // Invalidate and refetch config after successful update
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
  });
}

/**
 * useDeleteRule - Mutation hook for deleting a triage rule
 *
 * @returns Mutation object with mutate function and state
 *
 * Usage:
 * const deleteRule = useDeleteRule();
 * deleteRule.mutate('rule-id', {
 *   onSuccess: () => console.log('Rule deleted'),
 * });
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => configService.deleteRule(id),
    onSuccess: () => {
      // Invalidate and refetch config after successful deletion
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
  });
}
