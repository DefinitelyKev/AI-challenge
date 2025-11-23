import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { Express, Response } from "express";
import { createChatTestApp } from "./helpers/chat-app.helper";
import { AIService, ChatMessage } from "../services/ai.service";
import { ConfigRepository } from "../repositories/config.repository";
import { TriageConfig } from "../validation/schemas";

vi.mock("../repositories/config.repository");
vi.mock("../services/ai.service");

describe("Chat API Routes", () => {
  let app: Express;
  let mockAIService: AIService;
  let mockConfigRepository: ConfigRepository;

  const mockConfig: TriageConfig = {
    requestTypes: ["Sales Contract", "Employment Contract"],
    conditionFields: [{ name: "location", label: "Location", type: "text" }],
    rules: [
      {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [{ field: "location", value: "Australia" }],
        assignee: "john@acme.corp",
        priority: 1,
      },
    ],
  };

  beforeEach(() => {
    mockConfigRepository = new ConfigRepository();
    mockAIService = new AIService("test-api-key", "https://api.test.com");
    app = createChatTestApp(mockAIService, mockConfigRepository);
    vi.clearAllMocks();

    // Mock config repository to return test config
    vi.spyOn(mockConfigRepository, "getConfig").mockResolvedValue(mockConfig);
  });

  describe("POST /api/chat", () => {
    it("should stream a chat completion successfully", async () => {
      const testMessages = [{ role: "user", content: "I need help with a sales contract" }];

      // Mock the AI service to simulate streaming response
      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (messages: ChatMessage[], res: Response) => {
          // Verify system prompt was added
          expect(messages[0].role).toBe("system");
          expect(messages[0].content).toContain("legal request triage assistant");

          // Simulate streaming text response
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Where are you based?");
          res.end();
        }
      );

      const response = await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      expect(response.text).toContain("Where are you based?");
      expect(mockAIService.streamChatCompletion).toHaveBeenCalled();
    });

    it("should include system prompt in messages", async () => {
      const testMessages = [{ role: "user", content: "Hello" }];

      let capturedMessages: ChatMessage[] = [];

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (messages: ChatMessage[], res: Response) => {
          capturedMessages = messages;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Response");
          res.end();
        }
      );

      await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      // First message should be system prompt
      expect(capturedMessages[0].role).toBe("system");
      expect(capturedMessages[0].content).toContain("Acme Corp");

      // Second message should be user message
      expect(capturedMessages[1]).toEqual(testMessages[0]);
    });

    it("should handle multiple messages in conversation", async () => {
      const testMessages = [
        { role: "user", content: "I need help with a contract" },
        { role: "assistant", content: "What type of contract?" },
        { role: "user", content: "Sales contract" },
      ];

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (_messages: ChatMessage[], res: Response) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Where are you located?");
          res.end();
        }
      );

      const response = await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      expect(response.text).toContain("Where are you located?");
    });

    it("should reject request with empty messages array", async () => {
      await request(app).post("/api/chat").send({ messages: [] }).expect(400);
    });

    it("should reject request with invalid message role", async () => {
      const invalidMessages = [{ role: "invalid-role", content: "Hello" }];

      await request(app).post("/api/chat").send({ messages: invalidMessages }).expect(400);
    });

    it("should reject request missing messages field", async () => {
      await request(app).post("/api/chat").send({}).expect(400);
    });

    it("should reject request with messages not being an array", async () => {
      await request(app).post("/api/chat").send({ messages: "not-an-array" }).expect(400);
    });

    it("should reject messages missing content", async () => {
      const invalidMessages = [{ role: "user" }];

      await request(app).post("/api/chat").send({ messages: invalidMessages }).expect(400);
    });

    it("should handle AI service errors gracefully", async () => {
      const testMessages = [{ role: "user", content: "Hello" }];

      vi.spyOn(mockAIService, "streamChatCompletion").mockRejectedValue(new Error("OpenAI API error"));

      await request(app).post("/api/chat").send({ messages: testMessages }).expect(500);
    });

    it("should handle configuration loading errors", async () => {
      const testMessages = [{ role: "user", content: "Hello" }];

      // Make getConfig fail
      vi.spyOn(mockConfigRepository, "getConfig").mockRejectedValue(new Error("Config load error"));

      await request(app).post("/api/chat").send({ messages: testMessages }).expect(500);
    });

    it("should reject malformed JSON", async () => {
      await request(app).post("/api/chat").set("Content-Type", "application/json").send("{ invalid json }").expect(400);
    });

    it("should accept only valid message roles", async () => {
      const validMessages = [
        { role: "user", content: "User message" },
        { role: "assistant", content: "Assistant message" },
        { role: "system", content: "System message" },
      ];

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (_messages: ChatMessage[], res: Response) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("OK");
          res.end();
        }
      );

      await request(app).post("/api/chat").send({ messages: validMessages }).expect(200);
    });

    it("should stream response with correct content type", async () => {
      const testMessages = [{ role: "user", content: "Hello" }];

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (_messages: ChatMessage[], res: Response) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Test response");
          res.end();
        }
      );

      const response = await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      expect(response.headers["content-type"]).toContain("text/plain");
    });
  });

  describe("Error handling", () => {
    it("should return proper error format on validation failure", async () => {
      const response = await request(app).post("/api/chat").send({ messages: [] }).expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle streaming errors during response", async () => {
      const testMessages = [{ role: "user", content: "Hello" }];

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (_messages: ChatMessage[], res: Response) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Start of response");
          // Simulate error during streaming
          throw new Error("Stream error");
        }
      );

      // Once streaming starts (res.write called), status code is already 200
      // We can't change it to 500 after headers are sent
      const response = await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      // Verify partial response was received before error
      expect(response.text).toContain("Start of response");
    });
  });

  describe("Integration with triage config", () => {
    it("should build system prompt from current triage rules", async () => {
      const testMessages = [{ role: "user", content: "I need help" }];

      let capturedSystemPrompt = "";

      vi.spyOn(mockAIService, "streamChatCompletion").mockImplementation(
        async (messages: ChatMessage[], res: Response) => {
          capturedSystemPrompt = messages[0].content;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.write("Response");
          res.end();
        }
      );

      await request(app).post("/api/chat").send({ messages: testMessages }).expect(200);

      // Verify system prompt contains config details
      expect(capturedSystemPrompt).toContain("Sales Contract");
      expect(capturedSystemPrompt).toContain("john@acme.corp");
      expect(capturedSystemPrompt).toContain("location");
    });
  });
});
