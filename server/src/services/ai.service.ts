import OpenAI from "openai";
import { Response } from "express";
import { logger } from "../utils/logger";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * AIService encapsulates all OpenAI interactions
 *
 * Responsibilities:
 * - Stream chat completions from OpenAI
 * - Handle OpenAI API errors
 * - Track AI request metrics
 */
export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL?: string, model = "gpt-4o-mini") {
    this.openai = new OpenAI({ apiKey, baseURL });
    this.model = model;
  }

  /**
   * Stream chat completion to HTTP response
   *
   * @param messages - Conversation history including system prompt
   * @param res - Express response object to stream to
   * @returns Promise that resolves when streaming completes
   */
  async streamChatCompletion(messages: ChatMessage[], res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info("Creating AI chat completion", {
        model: this.model,
        messageCount: messages.length,
      });

      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Set response headers for streaming
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      if ("flushHeaders" in res && typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      logger.debug("Stream created, starting to read chunks");

      // Stream chunks to response
      let chunkCount = 0;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
          chunkCount++;
        }
      }

      const duration = Date.now() - startTime;
      logger.aiRequest(this.model, messages.length, duration, true, { chunkCount });

      res.end();
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("AI streaming error", error, {
        model: this.model,
        messageCount: messages.length,
        durationMs: duration,
      });

      logger.aiRequest(this.model, messages.length, duration, false);

      // Only write error if headers haven't been sent
      if (!res.headersSent) {
        throw error;
      } else {
        res.write("\n[Stream error]\n");
        res.end();
      }
    }
  }

}
