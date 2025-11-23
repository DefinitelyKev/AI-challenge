import { Request, Response } from "express";
import { TriageService } from "../services/triage.service";

/**
 * ConfigController handles HTTP requests for triage configuration
 *
 * Thin layer that:
 * - Extracts data from requests
 * - Calls service layer
 * - Formats responses
 */
export class ConfigController {
  constructor(private triageService: TriageService) {}

  /**
   * GET /api/config
   * Retrieve complete triage configuration
   */
  async getConfig(_req: Request, res: Response): Promise<void> {
    const config = await this.triageService.getConfig();
    res.json(config);
  }

  /**
   * PUT /api/config
   * Update complete triage configuration
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    await this.triageService.saveConfig(req.body);
    const config = await this.triageService.getConfig();
    res.json(config);
  }

  /**
   * POST /api/config/rules
   * Add a new triage rule
   */
  async addRule(req: Request, res: Response): Promise<void> {
    const rule = req.body;

    // Generate ID if not provided
    if (!rule.id) {
      rule.id = `rule-${Date.now()}`;
    }

    const config = await this.triageService.addRule(rule);
    res.status(201).json(config);
  }

  /**
   * PUT /api/config/rules/:id
   * Update an existing triage rule
   */
  async updateRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const rule = req.body;

    const config = await this.triageService.updateRule(id, rule);
    res.json(config);
  }

  /**
   * DELETE /api/config/rules/:id
   * Delete a triage rule
   */
  async deleteRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const config = await this.triageService.deleteRule(id);
    res.json(config);
  }
}
