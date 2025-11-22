import path from "path";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Repositories & Services
import { ConfigRepository } from "./repositories/config.repository";
import { TriageService } from "./services/triage.service";
import { AIService } from "./services/ai.service";

// Controllers
import { ConfigController } from "./controllers/config.controller";
import { ChatController } from "./controllers/chat.controller";

// Routes
import { createConfigRoutes } from "./routes/config.routes";
import { createChatRoutes } from "./routes/chat.routes";

// Middleware
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./utils/logger";

/**
 * Bootstrap and configure Express application
 */
async function bootstrap() {
  // Validate required environment variables
  if (!process.env.OPENAI_API_KEY) {
    const errorMsg = "OPENAI_API_KEY environment variable is required";
    logger.error(errorMsg);
    console.error("\n❌ ERROR:", errorMsg);
    console.error("Please set OPENAI_API_KEY in your .env file\n");
    process.exit(1);
  }

  const app = express();
  const port = Number.parseInt(process.env.PORT ?? "8999", 10);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Request logging middleware
  app.use((req, _res, next) => {
    logger.debug("Incoming request", {
      method: req.method,
      path: req.path,
      query: req.query,
    });
    next();
  });

  // Dependency injection setup
  const configRepository = new ConfigRepository();
  const triageService = new TriageService(configRepository);
  const aiService = new AIService(process.env.OPENAI_API_KEY || "", process.env.OPENAI_BASE_URL);

  // Controllers
  const configController = new ConfigController(triageService);
  const chatController = new ChatController(triageService, aiService);

  // Routes
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/config", createConfigRoutes(configController));
  app.use("/api/chat", createChatRoutes(chatController));

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  app.listen(port, async () => {
    logger.info("Server started", {
      port,
      nodeEnv: process.env.NODE_ENV || "development",
    });

    console.log("");
    console.log("═".repeat(60));
    console.log(`  Legal Triage API Server`);
    console.log("═".repeat(60));
    console.log(`  Server URL:     http://localhost:${port}`);
    console.log(`  Health check:   http://localhost:${port}/health`);
    console.log(`  API endpoints:  http://localhost:${port}/api`);
    console.log("");
    console.log("  Environment:");
    console.log(`    NODE_ENV:           ${process.env.NODE_ENV || "development"}`);
    console.log(`    OPENAI_BASE_URL:    ${process.env.OPENAI_BASE_URL || "default"}`);
    console.log(`    OPENAI_API_KEY:     ${process.env.OPENAI_API_KEY ? "✓ configured" : "✗ missing"}`);
    console.log("═".repeat(60));
    console.log("");

    // Load and display configuration
    try {
      const config = await triageService.getConfig();
      logger.info("Triage configuration loaded", {
        requestTypes: config.requestTypes.length,
        conditionFields: config.conditionFields.length,
        rules: config.rules.length,
      });

      console.log("  Triage Configuration:");
      console.log(`    Request types:      ${config.requestTypes.length}`);
      console.log(`    Condition fields:   ${config.conditionFields.length}`);
      console.log(`    Triage rules:       ${config.rules.length}`);
      console.log("");
    } catch (error) {
      logger.error("Failed to load triage configuration on startup", error);
      console.error("  ⚠️  Failed to load triage configuration");
      console.log("");
    }
  });
}

// Start the application
bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
