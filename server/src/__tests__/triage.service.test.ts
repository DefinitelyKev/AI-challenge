import { describe, it, expect, beforeEach, vi } from "vitest";
import { TriageService } from "../services/triage.service";
import { ConfigRepository } from "../repositories/config.repository";
import { TriageConfig, TriageRule } from "../validation/schemas";

vi.mock("../repositories/config.repository");

describe("TriageService", () => {
  let triageService: TriageService;
  let mockConfigRepository: ConfigRepository;

  const mockConfig: TriageConfig = {
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
    ],
  };

  beforeEach(() => {
    mockConfigRepository = new ConfigRepository();
    triageService = new TriageService(mockConfigRepository);
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    it("should return the triage configuration", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockResolvedValue(mockConfig);

      const result = await triageService.getConfig();

      expect(result).toEqual(mockConfig);
      expect(mockConfigRepository.getConfig).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if repository fails", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockRejectedValue(new Error("File read error"));

      await expect(triageService.getConfig()).rejects.toThrow("Failed to load triage configuration");
    });
  });

  describe("saveConfig", () => {
    it("should save the configuration successfully", async () => {
      vi.spyOn(mockConfigRepository, "saveConfig").mockResolvedValue();

      await triageService.saveConfig(mockConfig);

      expect(mockConfigRepository.saveConfig).toHaveBeenCalledWith(mockConfig);
      expect(mockConfigRepository.saveConfig).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if save fails", async () => {
      vi.spyOn(mockConfigRepository, "saveConfig").mockRejectedValue(new Error("Write error"));

      await expect(triageService.saveConfig(mockConfig)).rejects.toThrow("Failed to save triage configuration");
    });
  });

  describe("addRule", () => {
    it("should add a new rule successfully", async () => {
      const newRule: TriageRule = {
        id: "rule-3",
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 3,
      };

      const updatedConfig = {
        ...mockConfig,
        rules: [...mockConfig.rules, newRule],
      };

      vi.spyOn(mockConfigRepository, "addRule").mockResolvedValue(updatedConfig);

      const result = await triageService.addRule(newRule);

      expect(result.rules).toHaveLength(3);
      expect(result.rules[2]).toEqual(newRule);
      expect(mockConfigRepository.addRule).toHaveBeenCalledWith(newRule);
    });

    it("should generate an ID if not provided", async () => {
      const ruleWithoutId: TriageRule = {
        id: "",
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 3,
      };

      const updatedConfig = { ...mockConfig, rules: [...mockConfig.rules] };
      vi.spyOn(mockConfigRepository, "addRule").mockResolvedValue(updatedConfig);

      await triageService.addRule(ruleWithoutId);

      // Verify that addRule was called with a rule that has an ID
      const calledWith = vi.mocked(mockConfigRepository.addRule).mock.calls[0][0];
      expect(calledWith.id).toMatch(/^rule-\d+$/);
    });

    it("should throw an error if add fails", async () => {
      const newRule: TriageRule = {
        id: "rule-3",
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 3,
      };

      vi.spyOn(mockConfigRepository, "addRule").mockRejectedValue(new Error("Add error"));

      await expect(triageService.addRule(newRule)).rejects.toThrow("Failed to add triage rule");
    });
  });

  describe("updateRule", () => {
    it("should update an existing rule successfully", async () => {
      const updatedRule: TriageRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [{ field: "location", value: "Canada" }],
        assignee: "canada@acme.corp",
        priority: 1,
      };

      const updatedConfig = {
        ...mockConfig,
        rules: [updatedRule, mockConfig.rules[1]],
      };

      vi.spyOn(mockConfigRepository, "updateRule").mockResolvedValue(updatedConfig);

      const result = await triageService.updateRule("rule-1", updatedRule);

      expect(result.rules[0]).toEqual(updatedRule);
      expect(mockConfigRepository.updateRule).toHaveBeenCalledWith("rule-1", updatedRule);
    });

    it("should throw 404 error if rule not found", async () => {
      const updatedRule: TriageRule = {
        id: "rule-999",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "test@acme.corp",
        priority: 1,
      };

      vi.spyOn(mockConfigRepository, "updateRule").mockRejectedValue(new Error("Rule with id rule-999 not found"));

      await expect(triageService.updateRule("rule-999", updatedRule)).rejects.toThrow(
        "Rule with id rule-999 not found"
      );
    });
  });

  describe("deleteRule", () => {
    it("should delete a rule successfully", async () => {
      const updatedConfig = {
        ...mockConfig,
        rules: [mockConfig.rules[1]], // Only second rule remains
      };

      vi.spyOn(mockConfigRepository, "deleteRule").mockResolvedValue(updatedConfig);

      const result = await triageService.deleteRule("rule-1");

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].id).toBe("rule-2");
      expect(mockConfigRepository.deleteRule).toHaveBeenCalledWith("rule-1");
    });

    it("should throw an error if delete fails", async () => {
      vi.spyOn(mockConfigRepository, "deleteRule").mockRejectedValue(new Error("Delete error"));

      await expect(triageService.deleteRule("rule-1")).rejects.toThrow("Failed to delete triage rule");
    });
  });

  describe("buildSystemPrompt", () => {
    it("should build a system prompt from current configuration", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockResolvedValue(mockConfig);

      const result = await triageService.buildSystemPrompt();

      expect(result).toContain("legal request triage assistant");
      expect(result).toContain("Sales Contract");
      expect(result).toContain("john@acme.corp");
      expect(result.length).toBeGreaterThan(100);
    });

    it("should throw an error if getConfig fails", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockRejectedValue(new Error("Config error"));

      await expect(triageService.buildSystemPrompt()).rejects.toThrow("Failed to build system prompt");
    });
  });
});
