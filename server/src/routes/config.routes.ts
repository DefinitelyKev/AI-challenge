import { Router } from "express";
import { ConfigController } from "../controllers/config.controller";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/error-handler";
import { TriageConfigSchema, CreateRuleSchema, UpdateRuleSchema } from "../validation/schemas";

/**
 * Configuration routes
 *
 * All routes are protected by validation middleware
 * All handlers are wrapped in asyncHandler to catch async errors
 */
export function createConfigRoutes(controller: ConfigController): Router {
  const router = Router();

  // GET /api/config - Get complete configuration
  router.get("/", asyncHandler(controller.getConfig.bind(controller)));

  // PUT /api/config - Update complete configuration
  router.put("/", validateBody(TriageConfigSchema), asyncHandler(controller.updateConfig.bind(controller)));

  // POST /api/config/rules - Add new rule
  router.post("/rules", validateBody(CreateRuleSchema), asyncHandler(controller.addRule.bind(controller)));

  // PUT /api/config/rules/:id - Update rule
  router.put("/rules/:id", validateBody(UpdateRuleSchema), asyncHandler(controller.updateRule.bind(controller)));

  // DELETE /api/config/rules/:id - Delete rule
  router.delete("/rules/:id", asyncHandler(controller.deleteRule.bind(controller)));

  return router;
}
