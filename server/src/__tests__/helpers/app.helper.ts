import express, { Express } from 'express';
import { ConfigRepository } from '../../repositories/config.repository';
import { TriageService } from '../../services/triage.service';
import { ConfigController } from '../../controllers/config.controller';
import { createConfigRoutes } from '../../routes/config.routes';
import { errorHandler } from '../../middleware/error-handler';

/**
 * Creates a test Express app with config routes
 * Uses in-memory mock repository for testing
 */
export function createTestApp(configRepository?: ConfigRepository): Express {
  const app = express();

  app.use(express.json());

  // Set up dependencies
  const repository = configRepository || new ConfigRepository();
  const triageService = new TriageService(repository);
  const configController = new ConfigController(triageService);

  // Mount routes
  app.use('/api/config', createConfigRoutes(configController));

  // Error handler
  app.use(errorHandler);

  return app;
}
