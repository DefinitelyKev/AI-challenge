import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/constants";
import { triageConfigSchema, triageRuleSchema } from "../schemas";
import type { TriageConfig, TriageRule } from "../schemas";

/**
 * Config service - Encapsulates all configuration-related API operations
 */
export const configService = {
  /**
   * Fetches triage configuration
   *
   * @returns Promise resolving to validated triage configuration
   * @throws {Error} If API request fails or validation fails
   */
  async getConfig(): Promise<TriageConfig> {
    const data = await apiClient.get<TriageConfig>(API_ENDPOINTS.CONFIG);

    // Validate response against schema
    return triageConfigSchema.parse(data);
  },

  /**
   * Creates a new triage rule
   *
   * @param rule - Rule data to create (without id)
   * @returns Promise resolving to updated configuration
   * @throws {Error} If validation fails or API request fails
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
   *
   * @param id - Rule ID to update
   * @param rule - Updated rule data
   * @returns Promise resolving to updated configuration
   * @throws {Error} If validation fails or API request fails
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
   *
   * @param id - Rule ID to delete
   * @returns Promise resolving to updated configuration
   * @throws {Error} If API request fails or validation fails
   */
  async deleteRule(id: string): Promise<TriageConfig> {
    const data = await apiClient.delete<TriageConfig>(`${API_ENDPOINTS.RULES}/${id}`);

    // Validate response
    return triageConfigSchema.parse(data);
  },
};
