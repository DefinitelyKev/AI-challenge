import { Request, Response } from "express";
import { TriageService } from "../services/triage.service";
import { AIService, ChatMessage } from "../services/ai.service";

/**
 * ChatController handles HTTP requests for chat interactions
 *
 * Responsibilities:
 * - Extract data from HTTP requests
 * - Coordinate between TriageService and AIService
 * - Format responses for HTTP
 */
export class ChatController {
  constructor(private triageService: TriageService, private aiService: AIService) {}

  /**
   * POST /api/chat
   * Stream AI chat completion based on triage configuration
   */
  async streamChat(req: Request, res: Response): Promise<void> {
    // Build system prompt from triage configuration
    const systemPrompt = await this.triageService.buildSystemPrompt();

    // Construct full conversation with system prompt (req.body.messages already validated)
    const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...req.body.messages];

    // Stream response
    await this.aiService.streamChatCompletion(messages, res);
  }
}
