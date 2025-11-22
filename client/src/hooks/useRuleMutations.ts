import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configService } from "../services";
import { logger } from "../lib/logger";
import { configKeys } from "./useConfig";
import type { TriageRule } from "../schemas";

/**
 * useCreateRule - Mutation hook for creating a new triage rule
 */
export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<TriageRule, "id">) => {
      logger.userInteraction("create_rule", "config_page", {
        requestType: rule.requestType,
        conditionCount: rule.conditions.length,
        priority: rule.priority,
      });
      return configService.createRule(rule);
    },
    onSuccess: (data) => {
      logger.info("Rule created successfully", {
        rulesCount: data.rules.length,
      });
      logger.cacheEvent("invalidate", configKeys.detail().join("/"));
      // Invalidate and refetch config after successful creation
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
    onError: (error) => {
      logger.error("Failed to create rule", error);
    },
  });
}

/**
 * useUpdateRule - Mutation hook for updating an existing triage rule
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rule }: { id: string; rule: TriageRule }) => {
      logger.userInteraction("update_rule", "config_page", {
        ruleId: id,
        requestType: rule.requestType,
        conditionCount: rule.conditions.length,
        priority: rule.priority,
      });
      return configService.updateRule(id, rule);
    },
    onSuccess: (data, variables) => {
      logger.info("Rule updated successfully", {
        ruleId: variables.id,
        rulesCount: data.rules.length,
      });
      logger.cacheEvent("invalidate", configKeys.detail().join("/"));
      // Invalidate and refetch config after successful update
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
    onError: (error, variables) => {
      logger.error("Failed to update rule", error, {
        ruleId: variables.id,
      });
    },
  });
}

/**
 * useDeleteRule - Mutation hook for deleting a triage rule
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      logger.userInteraction("delete_rule", "config_page", {
        ruleId: id,
      });
      return configService.deleteRule(id);
    },
    onSuccess: (data, id) => {
      logger.info("Rule deleted successfully", {
        ruleId: id,
        rulesCount: data.rules.length,
      });
      logger.cacheEvent("invalidate", configKeys.detail().join("/"));
      // Invalidate and refetch config after successful deletion
      queryClient.invalidateQueries({ queryKey: configKeys.detail() });
    },
    onError: (error, id) => {
      logger.error("Failed to delete rule", error, {
        ruleId: id,
      });
    },
  });
}
