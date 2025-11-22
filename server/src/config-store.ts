import fs from 'fs/promises';
import path from 'path';
import { TriageConfig, TriageRule } from './types';

export class ConfigStore {
  private configPath: string;
  private config: TriageConfig | null = null;

  constructor() {
    this.configPath = path.join(__dirname, '../data/triage-config.json');
  }

  async getConfig(): Promise<TriageConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data) as TriageConfig;
      return this.config;
    } catch (error) {
      console.error('Error reading config file:', error);
      throw new Error('Failed to load triage configuration');
    }
  }

  async saveConfig(config: TriageConfig): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      this.config = config;
    } catch (error) {
      console.error('Error saving config file:', error);
      throw new Error('Failed to save triage configuration');
    }
  }

  async addRule(rule: TriageRule): Promise<TriageConfig> {
    const config = await this.getConfig();
    config.rules.push(rule);
    await this.saveConfig(config);
    return config;
  }

  async updateRule(ruleId: string, updatedRule: TriageRule): Promise<TriageConfig> {
    const config = await this.getConfig();
    const index = config.rules.findIndex((r) => r.id === ruleId);

    if (index === -1) {
      throw new Error(`Rule with id ${ruleId} not found`);
    }

    config.rules[index] = updatedRule;
    await this.saveConfig(config);
    return config;
  }

  async deleteRule(ruleId: string): Promise<TriageConfig> {
    const config = await this.getConfig();
    config.rules = config.rules.filter((r) => r.id !== ruleId);
    await this.saveConfig(config);
    return config;
  }

  invalidateCache(): void {
    this.config = null;
  }
}
