import { describe, it, expect } from "vitest";
import { chatRequestSchema } from "../schemas/chat.schema";
import { conditionFieldSchema, conditionSchema, triageRuleSchema, triageConfigSchema } from "../schemas/config.schema";

describe("Chat Schemas", () => {
  describe("chatRequestSchema", () => {
    it("should validate a valid chat request", () => {
      const request = {
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi" },
        ],
      };
      const result = chatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const request = {
        messages: [{ role: "user", content: "" }],
      };
      const result = chatRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const request = {
        messages: [{ role: "invalid", content: "Hello" }],
      };
      const result = chatRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });
});

describe("Config Schemas", () => {
  describe("conditionFieldSchema", () => {
    it("should validate a valid text field", () => {
      const field = {
        name: "location",
        label: "Location",
        type: "text",
      };
      const result = conditionFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
    });

    it("should reject invalid field type", () => {
      const field = {
        name: "location",
        label: "Location",
        type: "invalid",
      };
      const result = conditionFieldSchema.safeParse(field);
      expect(result.success).toBe(false);
    });
  });

  describe("conditionSchema", () => {
    it("should validate condition with string value", () => {
      const condition = {
        field: "location",
        value: "Australia",
      };
      const result = conditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it("should validate condition with array value", () => {
      const condition = {
        field: "location",
        value: ["Australia", "Canada"],
      };
      const result = conditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it("should reject empty field name", () => {
      const condition = {
        field: "",
        value: "Australia",
      };
      const result = conditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });
  });

  describe("triageRuleSchema", () => {
    it("should validate a complete rule", () => {
      const rule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [{ field: "location", value: "Australia" }],
        assignee: "john@acme.corp",
        priority: 1,
      };
      const result = triageRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should validate rule with empty conditions", () => {
      const rule = {
        id: "rule-1",
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 1,
      };
      const result = triageRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const rule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "not-an-email",
        priority: 1,
      };
      const result = triageRuleSchema.safeParse(rule);
      expect(result.success).toBe(false);
    });

    it("should reject zero priority", () => {
      const rule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "test@acme.corp",
        priority: 0,
      };
      const result = triageRuleSchema.safeParse(rule);
      expect(result.success).toBe(false);
    });

    it("should reject negative priority", () => {
      const rule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "test@acme.corp",
        priority: -1,
      };
      const result = triageRuleSchema.safeParse(rule);
      expect(result.success).toBe(false);
    });
  });

  describe("triageConfigSchema", () => {
    it("should validate a complete configuration", () => {
      const config = {
        requestTypes: ["Sales Contract", "NDA"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [],
            assignee: "john@acme.corp",
            priority: 1,
          },
        ],
      };
      const result = triageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should validate config with empty arrays", () => {
      const config = {
        requestTypes: [],
        conditionFields: [],
        rules: [],
      };
      const result = triageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });
});
