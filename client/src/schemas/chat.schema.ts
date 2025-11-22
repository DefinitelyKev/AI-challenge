import { z } from "zod";

/**
 * Message role - restricted to valid values
 */
export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  id: z.uuid(),
  role: messageRoleSchema,
  content: z.string(),
});

/**
 * Chat request payload schema
 */
export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: messageRoleSchema,
      content: z.string().min(1, "Message content cannot be empty"),
    })
  ),
});

/**
 * Inferred TypeScript types from schemas
 * These provide type safety and autocomplete
 */
export type MessageRole = z.infer<typeof messageRoleSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
