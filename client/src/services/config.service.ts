import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/constants";
import { triageConfigSchema, triageRuleSchema } from "../schemas";
import type { TriageConfig, TriageRule } from "../schemas";

/**
 * Config service
 */
export const configService = {
  /**
   * Fetches triage configuration
   */
  async getConfig(): Promise<TriageConfig> {
    const data = await apiClient.get<TriageConfig>(API_ENDPOINTS.CONFIG);

    // Validate response against schema
    return triageConfigSchema.parse(data);
  },

  /**
   * Creates a new triage rule
   */
  async createRule(rule: Omit<TriageRule, "id">): Promise<TriageConfig> {
    // Validate rule before sending
    const validatedRule = triageRuleSchema.omit({ id: true }).parse(rule);

    const data = await apiClient.post<Omit<TriageRule, "id">, TriageConfig>(API_ENDPOINTS.RULES, validatedRule);

    // Validate response
    return triageConfigSchema.parse(data);
  },

  /**
   * Updates an existing triage rule
   */
  async updateRule(id: string, rule: TriageRule): Promise<TriageConfig> {
    // Validate rule before sending
    const validatedRule = triageRuleSchema.parse(rule);

    const data = await apiClient.put<TriageRule, TriageConfig>(`${API_ENDPOINTS.RULES}/${id}`, validatedRule);

    // Validate response
    return triageConfigSchema.parse(data);
  },

  /**
   * Deletes a triage rule
   */
  async deleteRule(id: string): Promise<TriageConfig> {
    const data = await apiClient.delete<TriageConfig>(`${API_ENDPOINTS.RULES}/${id}`);

    // Validate response
    return triageConfigSchema.parse(data);
  },
};
