import { describe, it, expect } from "vitest";
import {
  ConditionSchema,
  TriageRuleSchema,
  ConditionFieldSchema,
  TriageConfigSchema,
  ChatMessageSchema,
  ChatRequestSchema,
} from "../validation/schemas";

describe("Validation Schemas", () => {
  describe("ConditionSchema", () => {
    it("should validate a valid condition with string value", () => {
      const validCondition = {
        field: "location",
        value: "Australia",
      };

      const result = ConditionSchema.safeParse(validCondition);
      expect(result.success).toBe(true);
    });

    it("should validate a valid condition with array value", () => {
      const validCondition = {
        field: "location",
        value: ["Australia", "United States", "Canada"],
      };

      const result = ConditionSchema.safeParse(validCondition);
      expect(result.success).toBe(true);
    });

    it("should reject condition with empty field", () => {
      const invalidCondition = {
        field: "",
        value: "Australia",
      };

      const result = ConditionSchema.safeParse(invalidCondition);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Field is required");
      }
    });

    it("should reject condition missing field", () => {
      const invalidCondition = {
        value: "Australia",
      };

      const result = ConditionSchema.safeParse(invalidCondition);
      expect(result.success).toBe(false);
    });

    it("should reject condition missing value", () => {
      const invalidCondition = {
        field: "location",
      };

      const result = ConditionSchema.safeParse(invalidCondition);
      expect(result.success).toBe(false);
    });
  });

  describe("TriageRuleSchema", () => {
    it("should validate a complete valid rule", () => {
      const validRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [
          { field: "location", value: "Australia" },
          { field: "department", value: "Sales" },
        ],
        assignee: "john@acme.corp",
        priority: 1,
      };

      const result = TriageRuleSchema.safeParse(validRule);
      expect(result.success).toBe(true);
    });

    it("should validate a rule with empty conditions", () => {
      const validRule = {
        id: "rule-1",
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 1,
      };

      const result = TriageRuleSchema.safeParse(validRule);
      expect(result.success).toBe(true);
    });

    it("should reject rule with invalid email", () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "not-an-email",
        priority: 1,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email");
      }
    });

    it("should reject rule with empty ID", () => {
      const invalidRule = {
        id: "",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "john@acme.corp",
        priority: 1,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
    });

    it("should reject rule with empty request type", () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "",
        conditions: [],
        assignee: "john@acme.corp",
        priority: 1,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
    });

    it("should reject rule with zero priority", () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "john@acme.corp",
        priority: 0,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("positive");
      }
    });

    it("should reject rule with negative priority", () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "john@acme.corp",
        priority: -1,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
    });

    it("should reject rule with decimal priority", () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "john@acme.corp",
        priority: 1.5,
      };

      const result = TriageRuleSchema.safeParse(invalidRule);
      expect(result.success).toBe(false);
    });
  });

  describe("ConditionFieldSchema", () => {
    it("should validate a text field", () => {
      const validField = {
        name: "location",
        label: "Location",
        type: "text",
      };

      const result = ConditionFieldSchema.safeParse(validField);
      expect(result.success).toBe(true);
    });

    it("should validate a select field with options", () => {
      const validField = {
        name: "location",
        label: "Location",
        type: "select",
        options: ["Australia", "United States", "Canada"],
      };

      const result = ConditionFieldSchema.safeParse(validField);
      expect(result.success).toBe(true);
    });

    it("should reject field with invalid type", () => {
      const invalidField = {
        name: "location",
        label: "Location",
        type: "invalid-type",
      };

      const result = ConditionFieldSchema.safeParse(invalidField);
      expect(result.success).toBe(false);
    });

    it("should reject field with empty name", () => {
      const invalidField = {
        name: "",
        label: "Location",
        type: "text",
      };

      const result = ConditionFieldSchema.safeParse(invalidField);
      expect(result.success).toBe(false);
    });

    it("should reject field with empty label", () => {
      const invalidField = {
        name: "location",
        label: "",
        type: "text",
      };

      const result = ConditionFieldSchema.safeParse(invalidField);
      expect(result.success).toBe(false);
    });
  });

  describe("TriageConfigSchema", () => {
    it("should validate a complete configuration", () => {
      const validConfig = {
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "Australia" }],
            assignee: "john@acme.corp",
            priority: 1,
          },
        ],
        requestTypes: ["Sales Contract", "Employment Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
      };

      const result = TriageConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("should validate configuration with empty rules", () => {
      const validConfig = {
        rules: [],
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
      };

      const result = TriageConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("should reject configuration with invalid rule", () => {
      const invalidConfig = {
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [],
            assignee: "not-an-email",
            priority: 1,
          },
        ],
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
      };

      const result = TriageConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe("ChatMessageSchema", () => {
    it("should validate a user message", () => {
      const validMessage = {
        role: "user",
        content: "I need help with a sales contract",
      };

      const result = ChatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it("should validate an assistant message", () => {
      const validMessage = {
        role: "assistant",
        content: "Where are you based?",
      };

      const result = ChatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it("should validate a system message", () => {
      const validMessage = {
        role: "system",
        content: "You are a helpful assistant",
      };

      const result = ChatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it("should reject message with invalid role", () => {
      const invalidMessage = {
        role: "invalid",
        content: "Hello",
      };

      const result = ChatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it("should reject message missing content", () => {
      const invalidMessage = {
        role: "user",
      };

      const result = ChatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });
  });

  describe("ChatRequestSchema", () => {
    it("should validate a valid chat request", () => {
      const validRequest = {
        messages: [
          { role: "user", content: "I need help" },
          { role: "assistant", content: "How can I help?" },
        ],
      };

      const result = ChatRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should validate request with single message", () => {
      const validRequest = {
        messages: [{ role: "user", content: "Hello" }],
      };

      const result = ChatRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject request with empty messages array", () => {
      const invalidRequest = {
        messages: [],
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("At least one message");
      }
    });

    it("should reject request missing messages", () => {
      const invalidRequest = {};

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject request with invalid message", () => {
      const invalidRequest = {
        messages: [{ role: "invalid", content: "Hello" }],
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
