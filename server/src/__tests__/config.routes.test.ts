import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { Express } from "express";
import { createTestApp } from "./helpers/app.helper";
import { ConfigRepository } from "../repositories/config.repository";
import { TriageConfig } from "../validation/schemas";

vi.mock("../repositories/config.repository");

describe("Config API Routes", () => {
  let app: Express;
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
    app = createTestApp(mockConfigRepository);
    vi.clearAllMocks();
  });

  describe("GET /api/config", () => {
    it("should return the configuration", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockResolvedValue(mockConfig);

      const response = await request(app).get("/api/config").expect(200);

      expect(response.body).toEqual(mockConfig);
    });

    it("should return 500 if repository fails", async () => {
      vi.spyOn(mockConfigRepository, "getConfig").mockRejectedValue(new Error("Repository error"));

      const response = await request(app).get("/api/config").expect(500);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/config", () => {
    it("should update the entire configuration", async () => {
      const updatedConfig = {
        ...mockConfig,
        requestTypes: [...mockConfig.requestTypes, "New Type"],
      };

      vi.spyOn(mockConfigRepository, "saveConfig").mockResolvedValue();
      vi.spyOn(mockConfigRepository, "getConfig").mockResolvedValue(updatedConfig);

      const response = await request(app).put("/api/config").send(updatedConfig).expect(200);

      expect(response.body.requestTypes).toContain("New Type");
    });

    it("should reject invalid configuration", async () => {
      const invalidConfig = {
        rules: "not-an-array", // Invalid type
        requestTypes: [],
        conditionFields: [],
      };

      await request(app).put("/api/config").send(invalidConfig).expect(400);
    });

    it("should reject configuration with invalid email", async () => {
      const invalidConfig = {
        ...mockConfig,
        rules: [
          {
            id: "rule-1",
            requestType: "Sales Contract",
            conditions: [],
            assignee: "not-an-email",
            priority: 1,
          },
        ],
      };

      await request(app).put("/api/config").send(invalidConfig).expect(400);
    });
  });

  describe("POST /api/config/rules", () => {
    it("should create a new rule", async () => {
      const newRule = {
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 3,
      };

      const createdRule = {
        id: "rule-3",
        ...newRule,
      };

      const updatedConfig = {
        ...mockConfig,
        rules: [...mockConfig.rules, createdRule],
      };

      vi.spyOn(mockConfigRepository, "addRule").mockResolvedValue(updatedConfig);

      const response = await request(app).post("/api/config/rules").send(newRule).expect(201);

      expect(response.body.rules).toHaveLength(3);
      expect(response.body.rules[2].assignee).toBe("legal@acme.corp");
    });

    it("should reject rule with invalid email", async () => {
      const invalidRule = {
        requestType: "NDA",
        conditions: [],
        assignee: "not-an-email",
        priority: 1,
      };

      await request(app).post("/api/config/rules").send(invalidRule).expect(400);
    });

    it("should reject rule with zero priority", async () => {
      const invalidRule = {
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: 0,
      };

      await request(app).post("/api/config/rules").send(invalidRule).expect(400);
    });

    it("should reject rule with negative priority", async () => {
      const invalidRule = {
        requestType: "NDA",
        conditions: [],
        assignee: "legal@acme.corp",
        priority: -1,
      };

      await request(app).post("/api/config/rules").send(invalidRule).expect(400);
    });

    it("should reject rule with missing required fields", async () => {
      const invalidRule = {
        requestType: "NDA",
        // Missing assignee and priority
        conditions: [],
      };

      await request(app).post("/api/config/rules").send(invalidRule).expect(400);
    });
  });

  describe("PUT /api/config/rules/:id", () => {
    it("should update an existing rule", async () => {
      const updatedRule = {
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

      const response = await request(app).put("/api/config/rules/rule-1").send(updatedRule).expect(200);

      expect(response.body.rules[0].assignee).toBe("canada@acme.corp");
    });

    it("should return 404 if rule not found", async () => {
      const updatedRule = {
        id: "rule-999",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "test@acme.corp",
        priority: 1,
      };

      vi.spyOn(mockConfigRepository, "updateRule").mockRejectedValue(new Error("Rule with id rule-999 not found"));

      await request(app).put("/api/config/rules/rule-999").send(updatedRule).expect(404);
    });

    it("should reject update with invalid email", async () => {
      const invalidRule = {
        id: "rule-1",
        requestType: "Sales Contract",
        conditions: [],
        assignee: "not-an-email",
        priority: 1,
      };

      await request(app).put("/api/config/rules/rule-1").send(invalidRule).expect(400);
    });
  });

  describe("DELETE /api/config/rules/:id", () => {
    it("should delete a rule", async () => {
      const updatedConfig = {
        ...mockConfig,
        rules: [mockConfig.rules[1]], // Only second rule remains
      };

      vi.spyOn(mockConfigRepository, "deleteRule").mockResolvedValue(updatedConfig);

      const response = await request(app).delete("/api/config/rules/rule-1").expect(200);

      expect(response.body.rules).toHaveLength(1);
      expect(response.body.rules[0].id).toBe("rule-2");
    });

    it("should return 404 if rule not found", async () => {
      vi.spyOn(mockConfigRepository, "deleteRule").mockRejectedValue(new Error("Rule not found"));

      await request(app).delete("/api/config/rules/rule-999").expect(404);
    });
  });

  describe("Request validation", () => {
    it("should reject malformed JSON", async () => {
      await request(app)
        .post("/api/config/rules")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);
    });

    it("should reject empty request body for POST", async () => {
      await request(app).post("/api/config/rules").send({}).expect(400);
    });

    it("should reject empty request body for PUT config", async () => {
      await request(app).put("/api/config").send({}).expect(400);
    });
  });
});
