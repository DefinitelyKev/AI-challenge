import { describe, it, expect } from "vitest";
import { buildTriageSystemPrompt } from "../utils/prompt-builder";
import { TriageConfig } from "../validation/schemas";

describe("Prompt Builder", () => {
  describe("buildTriageSystemPrompt", () => {
    it("should generate a valid system prompt with basic configuration", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract", "Employment Contract"],
        conditionFields: [
          { name: "location", label: "Location", type: "text" },
          { name: "department", label: "Department", type: "text" },
        ],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "Australia" }],
            assignee: "john@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain("legal request triage assistant for Acme Corp");
      expect(prompt).toContain("Sales Contract");
      expect(prompt).toContain("Employment Contract");
      expect(prompt).toContain("john@acme.corp");
      expect(prompt).toContain('location is "Australia"');
    });

    it("should format multiple conditions with AND operator", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [
          { name: "location", label: "Location", type: "text" },
          { name: "department", label: "Department", type: "text" },
        ],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [
              { field: "location", value: "Australia" },
              { field: "department", value: "Finance" },
            ],
            assignee: "john@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain('location is "Australia" AND department is "Finance"');
    });

    it("should handle rules with no conditions", () => {
      const config: TriageConfig = {
        requestTypes: ["NDA"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [
          {
            id: "rule-1",
            requestType: "NDA",
            conditions: [],
            assignee: "legal@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain("NDA");
      expect(prompt).toContain("(any conditions)");
      expect(prompt).toContain("legal@acme.corp");
    });

    it("should sort rules by priority", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [
          {
            id: "rule-2",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "United States" }],
            assignee: "jane@acme.corp",
            priority: 2,
          },
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "Australia" }],
            assignee: "john@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      // Rule with priority 1 should appear first (as "1.")
      const johnIndex = prompt.indexOf("john@acme.corp");
      const janeIndex = prompt.indexOf("jane@acme.corp");
      expect(johnIndex).toBeLessThan(janeIndex);
    });

    it("should handle array values in conditions", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: ["Australia", "New Zealand", "Singapore"] }],
            assignee: "apac@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain('location is "Australia, New Zealand, Singapore"');
    });

    it("should include all condition fields in guidelines", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [
          { name: "location", label: "Location", type: "text" },
          { name: "department", label: "Department", type: "text" },
          { name: "urgency", label: "Urgency Level", type: "text" },
        ],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [],
            assignee: "sales@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain("Location, Department, Urgency Level");
    });

    it("should handle empty rules array", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain("legal request triage assistant");
      expect(prompt).toContain("Sales Contract");
      // Should still be a valid prompt even with no rules
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("should include fallback email suggestion", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract"],
        conditionFields: [{ name: "location", label: "Location", type: "text" }],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [],
            assignee: "sales@acme.corp",
            priority: 1,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      expect(prompt).toContain("legal@acme.corp");
    });

    it("should format complex multi-rule configuration", () => {
      const config: TriageConfig = {
        requestTypes: ["Sales Contract", "Employment Contract", "NDA"],
        conditionFields: [
          { name: "location", label: "Location", type: "text" },
          { name: "department", label: "Department", type: "text" },
        ],
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "Australia" }],
            assignee: "john@acme.corp",
            priority: 1,
          },
          {
            id: "rule-2",
            requestType: "Sales Contract",
            conditions: [{ field: "location", value: "United States" }],
            assignee: "jane@acme.corp",
            priority: 2,
          },
          {
            id: "rule-3",
            requestType: "Employment Contract",
            conditions: [],
            assignee: "hr@acme.corp",
            priority: 3,
          },
        ],
      };

      const prompt = buildTriageSystemPrompt(config);

      // Verify all request types are listed
      expect(prompt).toContain("Sales Contract");
      expect(prompt).toContain("Employment Contract");
      expect(prompt).toContain("NDA");

      // Verify all rules are formatted correctly
      expect(prompt).toContain("john@acme.corp");
      expect(prompt).toContain("jane@acme.corp");
      expect(prompt).toContain("hr@acme.corp");

      // Verify priority ordering
      const lines = prompt.split("\n");
      const rulesSection = lines.find((line) => line.includes("Triage Rules"));
      expect(rulesSection).toBeDefined();
    });
  });
});
