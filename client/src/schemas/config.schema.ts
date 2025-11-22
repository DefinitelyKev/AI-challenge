import { z } from "zod";

/**
 * Condition field type
 */
export const conditionFieldTypeSchema = z.enum(["text", "select"]);

/**
 * Condition schema
 */
export const conditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  value: z.union([z.string(), z.array(z.string())]),
});

/**
 * Condition field metadata schema
 */
export const conditionFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: conditionFieldTypeSchema,
  options: z.array(z.string()).optional(),
});

/**
 * Triage rule schema with validation
 */
export const triageRuleSchema = z.object({
  id: z.string(),
  requestType: z.string().min(1, "Request type is required"),
  conditions: z.array(conditionSchema),
  assignee: z.string().email("Invalid email address"),
  priority: z.number().int().positive("Priority must be a positive number"),
});

/**
 * Form schema for creating/editing rules
 * Omits 'id' for new rules
 */
export const triageRuleFormSchema = triageRuleSchema.omit({ id: true });

/**
 * Triage configuration schema
 */
export const triageConfigSchema = z.object({
  rules: z.array(triageRuleSchema),
  requestTypes: z.array(z.string()),
  conditionFields: z.array(conditionFieldSchema),
});

/**
 * Inferred TypeScript types from schemas
 */
export type ConditionFieldType = z.infer<typeof conditionFieldTypeSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type ConditionField = z.infer<typeof conditionFieldSchema>;
export type TriageRule = z.infer<typeof triageRuleSchema>;
export type TriageRuleForm = z.infer<typeof triageRuleFormSchema>;
export type TriageConfig = z.infer<typeof triageConfigSchema>;
