import path from "path";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";
import { ConfigStore } from "./config-store";
import { buildTriageSystemPrompt } from "./prompt-builder";
import { TriageRule } from "./types";

// Load environment variables from the project root first, then allow local overrides in server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. Streaming requests will fail.");
}

const app = express();
const port = Number.parseInt(process.env.PORT ?? "5000", 10);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
const configStore = new ConfigStore();

type ChatCompletionMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type BasicRole = Extract<ChatCompletionMessageParam["role"], "system" | "user" | "assistant">;
type BasicMessage = { role: BasicRole; content: string };

const allowedRoles: ReadonlySet<BasicRole> = new Set<BasicRole>(["system", "user", "assistant"]);

const sanitizeMessages = (messages: unknown): BasicMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  const sanitized: BasicMessage[] = [];

  for (const raw of messages) {
    if (!raw || typeof raw !== "object") {
      continue;
    }

    const maybeMessage = raw as Record<string, unknown>;
    const role = maybeMessage.role;
    const content = maybeMessage.content;

    if (typeof role !== "string" || typeof content !== "string") {
      continue;
    }

    if (!allowedRoles.has(role as BasicRole)) {
      continue;
    }

    sanitized.push({ role: role as BasicRole, content });
  }

  return sanitized;
};

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Configuration endpoints
app.get("/api/config", async (_req: Request, res: Response) => {
  try {
    const config = await configStore.getConfig();
    res.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

app.put("/api/config", async (req: Request, res: Response) => {
  try {
    await configStore.saveConfig(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving config:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

app.post("/api/config/rules", async (req: Request, res: Response) => {
  try {
    const rule: TriageRule = req.body;
    if (!rule.id) {
      rule.id = `rule-${Date.now()}`;
    }
    const config = await configStore.addRule(rule);
    res.json(config);
  } catch (error) {
    console.error("Error adding rule:", error);
    res.status(500).json({ error: "Failed to add rule" });
  }
});

app.put("/api/config/rules/:id", async (req: Request, res: Response) => {
  try {
    const ruleId = req.params.id;
    const rule: TriageRule = req.body;
    const config = await configStore.updateRule(ruleId, rule);
    res.json(config);
  } catch (error) {
    console.error("Error updating rule:", error);
    res.status(500).json({ error: "Failed to update rule" });
  }
});

app.delete("/api/config/rules/:id", async (req: Request, res: Response) => {
  try {
    const ruleId = req.params.id;
    const config = await configStore.deleteRule(ruleId);
    res.json(config);
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ error: "Failed to delete rule" });
  }
});

app.post("/api/chat", async (req: Request, res: Response) => {
  console.log("[CHAT] Received chat request");
  console.log("[CHAT] Request body:", JSON.stringify(req.body).substring(0, 200));

  if (!process.env.OPENAI_API_KEY) {
    console.error("[CHAT] Missing OPENAI_API_KEY");
    res.status(500).json({ error: "Server missing OpenAI credentials" });
    return;
  }

  const basicMessages = sanitizeMessages(req.body?.messages);
  console.log("[CHAT] Sanitized messages:", basicMessages.length, "messages");

  if (basicMessages.length === 0) {
    console.error("[CHAT] No valid messages in request");
    res.status(400).json({ error: "messages array is empty or invalid" });
    return;
  }

  // Load triage configuration and build system prompt
  let systemPrompt = "";
  try {
    console.log("[CHAT] Loading configuration...");
    const config = await configStore.getConfig();
    console.log("[CHAT] Configuration loaded, building prompt...");
    systemPrompt = buildTriageSystemPrompt(config);
    console.log("[CHAT] System prompt generated:", systemPrompt.substring(0, 150) + "...");
  } catch (error) {
    console.error("[CHAT] Error loading config for chat:", error);
    res.status(500).json({ error: "Failed to load triage configuration" });
    return;
  }

  // Inject system message at the beginning
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...basicMessages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  console.log("[CHAT] Total messages (with system):", chatMessages.length);

  try {
    // Use chat completions API which works with both OpenAI and Groq
    console.log("[CHAT] Creating chat completion stream...");
    console.log("[CHAT] Using model: gpt-4o-mini");
    console.log("[CHAT] Base URL:", process.env.OPENAI_BASE_URL);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("[CHAT] Stream created successfully");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    (res as Response & { flushHeaders?: () => void }).flushHeaders?.();
    console.log("[CHAT] Response headers set, starting stream...");

    const abort = () => {
      try {
        console.log("[CHAT] Aborting stream...");
        stream.controller?.abort?.();
      } catch (abortError) {
        console.error("[CHAT] Error aborting OpenAI stream:", abortError);
      }
    };

    req.on("close", abort);
    req.on("error", abort);

    let chunkCount = 0;
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
        chunkCount++;
      }
    }

    console.log("[CHAT] Stream completed, sent", chunkCount, "chunks");
    res.end();
  } catch (error) {
    console.error("[CHAT] Streaming error:", error);
    console.error("[CHAT] Error details:", error instanceof Error ? error.message : "Unknown error");
    console.error("[CHAT] Error stack:", error instanceof Error ? error.stack : "No stack trace");

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream response" });
      return;
    }

    res.write("\n[Stream error]\n");
    res.end();
  }
});

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log("");
  console.log("Environment:");
  console.log("  OPENAI_BASE_URL:", process.env.OPENAI_BASE_URL);
  console.log(
    "  OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : "NOT SET"
  );
  console.log("");

  // Load and display configuration on startup
  try {
    const config = await configStore.getConfig();
    console.log("Triage configuration loaded:");
    console.log("  Request types:", config.requestTypes.length);
    console.log("  Condition fields:", config.conditionFields.length);
    console.log("  Rules:", config.rules.length);
    console.log("");
  } catch (error) {
    console.error("Failed to load triage configuration:", error);
  }
});
