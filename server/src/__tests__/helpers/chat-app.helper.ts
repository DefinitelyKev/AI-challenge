import express, { Express } from 'express';
import { ConfigRepository } from '../../repositories/config.repository';
import { TriageService } from '../../services/triage.service';
import { AIService } from '../../services/ai.service';
import { ChatController } from '../../controllers/chat.controller';
import { createChatRoutes } from '../../routes/chat.routes';
import { errorHandler } from '../../middleware/error-handler';

/**
 * Creates a test Express app with chat routes
 * Uses mocked AI service for testing
 */
export function createChatTestApp(
  aiService: AIService,
  configRepository?: ConfigRepository
): Express {
  const app = express();

  app.use(express.json());

  // Set up dependencies
  const repository = configRepository || new ConfigRepository();
  const triageService = new TriageService(repository);
  const chatController = new ChatController(triageService, aiService);

  // Mount routes
  app.use('/api/chat', createChatRoutes(chatController));

  // Error handler
  app.use(errorHandler);

  return app;
}
