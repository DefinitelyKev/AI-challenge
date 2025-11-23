import { ConfigRepository } from "../repositories/config.repository";
import { buildTriageSystemPrompt } from "../utils/prompt-builder";
import { TriageConfig, TriageRule } from "../validation/schemas";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error-handler";

/**
 * TriageService handles business logic for triage configuration
 *
 * Responsibilities:
 * - Load and manage triage configuration
 * - Build system prompts for AI
 * - CRUD operations for triage rules
 */
export class TriageService {
  constructor(private configRepository: ConfigRepository) {}

  /**
   * Get complete triage configuration
   */
  async getConfig(): Promise<TriageConfig> {
    try {
      logger.debug("Fetching triage configuration");
      const config = await this.configRepository.getConfig();
      logger.debug("Configuration fetched successfully", {
        rulesCount: config.rules.length,
        requestTypesCount: config.requestTypes.length,
      });
      return config;
    } catch (error) {
      logger.error("Failed to fetch configuration", error);
      throw new AppError(500, "Failed to load triage configuration");
    }
  }

  /**
   * Save complete triage configuration
   */
  async saveConfig(config: TriageConfig): Promise<void> {
    try {
      logger.info("Saving triage configuration", {
        rulesCount: config.rules.length,
      });
      await this.configRepository.saveConfig(config);
      logger.configChange("config_updated", undefined, {
        rulesCount: config.rules.length,
      });
    } catch (error) {
      logger.error("Failed to save configuration", error);
      throw new AppError(500, "Failed to save triage configuration");
    }
  }

  /**
   * Add a new triage rule
   */
  async addRule(rule: TriageRule): Promise<TriageConfig> {
    try {
      // Generate ID if not provided
      if (!rule.id) {
        rule.id = `rule-${Date.now()}`;
      }

      logger.info("Adding new triage rule", {
        ruleId: rule.id,
        requestType: rule.requestType,
        priority: rule.priority,
      });

      const config = await this.configRepository.addRule(rule);

      logger.configChange("rule_added", rule.id, {
        requestType: rule.requestType,
        assignee: rule.assignee,
      });

      return config;
    } catch (error) {
      logger.error("Failed to add rule", error, { ruleId: rule.id });
      throw new AppError(500, "Failed to add triage rule");
    }
  }

  /**
   * Update an existing triage rule
   */
  async updateRule(ruleId: string, rule: TriageRule): Promise<TriageConfig> {
    try {
      logger.info("Updating triage rule", {
        ruleId,
        requestType: rule.requestType,
      });

      const config = await this.configRepository.updateRule(ruleId, rule);

      logger.configChange("rule_updated", ruleId, {
        requestType: rule.requestType,
        assignee: rule.assignee,
      });

      return config;
    } catch (error) {
      logger.error("Failed to update rule", error, { ruleId });

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, `Rule with id ${ruleId} not found`);
      }

      throw new AppError(500, "Failed to update triage rule");
    }
  }

  /**
   * Delete a triage rule
   */
  async deleteRule(ruleId: string): Promise<TriageConfig> {
    try {
      logger.info("Deleting triage rule", { ruleId });

      const config = await this.configRepository.deleteRule(ruleId);

      logger.configChange("rule_deleted", ruleId);

      return config;
    } catch (error) {
      logger.error("Failed to delete rule", error, { ruleId });

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, `Rule with id ${ruleId} not found`);
      }

      throw new AppError(500, "Failed to delete triage rule");
    }
  }

  /**
   * Build system prompt for AI based on current configuration
   */
  async buildSystemPrompt(): Promise<string> {
    try {
      const config = await this.getConfig();
      const prompt = buildTriageSystemPrompt(config);

      logger.debug("System prompt built", {
        promptLength: prompt.length,
        rulesCount: config.rules.length,
      });

      return prompt;
    } catch (error) {
      logger.error("Failed to build system prompt", error);
      throw new AppError(500, "Failed to build system prompt");
    }
  }
}
