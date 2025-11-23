import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configService } from '../services/config.service';
import { apiClient } from '../lib/api-client';

// Mock the API client
vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Config Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should fetch configuration', async () => {
      const mockConfig = {
        requestTypes: ['Sales Contract'],
        conditionFields: [],
        rules: [],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockConfig);

      const result = await configService.getConfig();

      expect(apiClient.get).toHaveBeenCalledWith('/api/config');
      expect(result).toEqual(mockConfig);
    });
  });

  describe('createRule', () => {
    it('should create a new rule', async () => {
      const newRule = {
        requestType: 'NDA',
        conditions: [],
        assignee: 'legal@acme.corp',
        priority: 1,
      };

      const mockResponse = {
        requestTypes: [],
        conditionFields: [],
        rules: [{ ...newRule, id: 'rule-1' }],
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await configService.createRule(newRule);

      expect(apiClient.post).toHaveBeenCalledWith('/api/config/rules', newRule);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRule', () => {
    it('should update an existing rule', async () => {
      const ruleId = 'rule-1';
      const updatedRule = {
        id: ruleId,
        requestType: 'Sales Contract',
        conditions: [],
        assignee: 'john@acme.corp',
        priority: 1,
      };

      const mockResponse = {
        requestTypes: [],
        conditionFields: [],
        rules: [updatedRule],
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await configService.updateRule(ruleId, updatedRule);

      expect(apiClient.put).toHaveBeenCalledWith(`/api/config/rules/${ruleId}`, updatedRule);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteRule', () => {
    it('should delete a rule', async () => {
      const ruleId = 'rule-1';
      const mockResponse = {
        requestTypes: [],
        conditionFields: [],
        rules: [],
      };

      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      const result = await configService.deleteRule(ruleId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/api/config/rules/${ruleId}`);
      expect(result).toEqual(mockResponse);
    });
  });
});
