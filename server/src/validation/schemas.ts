import { z } from "zod";

// Condition schema
export const ConditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum(["equals", "contains", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});

// TriageRule schema
export const TriageRuleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  requestType: z.string().min(1, "Request type is required"),
  conditions: z.array(ConditionSchema),
  assignee: z.string().email("Invalid email format for assignee"),
  priority: z.number().int().positive("Priority must be a positive integer"),
});

// ConditionField schema
export const ConditionFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["select", "text"]),
  options: z.array(z.string()).optional(),
});

// TriageConfig schema
export const TriageConfigSchema = z.object({
  rules: z.array(TriageRuleSchema),
  requestTypes: z.array(z.string().min(1)),
  conditionFields: z.array(ConditionFieldSchema),
});

// Chat message schema
export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

// Chat request schema
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, "At least one message is required"),
});

// Partial rule for creation (id is optional)
export const CreateRuleSchema = TriageRuleSchema.partial({ id: true });

// Update rule schema
export const UpdateRuleSchema = TriageRuleSchema;

// Export types inferred from schemas
export type Condition = z.infer<typeof ConditionSchema>;
export type TriageRule = z.infer<typeof TriageRuleSchema>;
export type ConditionField = z.infer<typeof ConditionFieldSchema>;
export type TriageConfig = z.infer<typeof TriageConfigSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
