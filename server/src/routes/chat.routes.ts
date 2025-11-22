import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/error-handler";
import { ChatRequestSchema } from "../validation/schemas";

/**
 * Chat routes
 *
 * Handles AI chat interactions
 */
export function createChatRoutes(controller: ChatController): Router {
  const router = Router();

  // POST /api/chat - Stream chat completion
  router.post("/", validateBody(ChatRequestSchema), asyncHandler(controller.streamChat.bind(controller)));

  return router;
}
