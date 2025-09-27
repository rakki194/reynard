/**
 * Database Quality Gate Manager Tests
 *
 * 🦊 *whiskers twitch with systematic precision* Comprehensive tests for the
 * database-backed quality gate manager, ensuring proper integration with
 * the Reynard backend API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseQualityGateManager } from '../DatabaseQualityGateManager';

// Mock fetch globally
global.fetch = vi.fn();

describe('DatabaseQualityGateManager', () => {
  let manager: DatabaseQualityGateManager;
  const mockBackendUrl = 'http://localhost:8000';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default backend URL', () => {
      const defaultManager = new DatabaseQualityGateManager();
      expect(defaultManager).toBeInstanceOf(DatabaseQualityGateManager);
    });

    it('should initialize with custom backend URL and API key', () => {
      expect(manager).toBeInstanceOf(DatabaseQualityGateManager);
    });
  });

  describe('loadConfiguration', () => {
    it('should load configuration successfully', async () => {
      const mockGates = [
        {
          id: 'reynard-development',
          name: 'Development Gate',
          environment: 'development',
          enabled: true,
          conditions: []
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      await manager.loadConfiguration();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    it('should initialize default gates when configuration fails', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Not Found'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Initialized' })
        });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await manager.loadConfiguration();

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ Could not load quality gate configuration from database'
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/initialize`,
        expect.any(Object)
      );
    });
  });

  describe('evaluateQualityGates', () => {
    it('should evaluate quality gates successfully', async () => {
      const mockMetrics = {
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 25
      };

      const mockResults = [
        {
          gateId: 'reynard-development',
          gateName: 'Development Gate',
          status: 'PASSED',
          conditions: [],
          overallScore: 100,
          passedConditions: 3,
          totalConditions: 3,
          failedConditions: 0,
          warningConditions: 0,
          evaluationId: 'eval-123'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      const results = await manager.evaluateQualityGates(mockMetrics, 'development');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/evaluate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            metrics: mockMetrics,
            environment: 'development'
          })
        })
      );

      expect(results).toEqual(mockResults);
    });

    it('should handle evaluation errors', async () => {
      const mockMetrics = { bugs: 0 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        manager.evaluateQualityGates(mockMetrics, 'development')
      ).rejects.toThrow('Evaluation failed: Internal Server Error');

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Quality gate evaluation failed:',
        expect.any(Error)
      );
    });
  });

  describe('addQualityGate', () => {
    it('should add a quality gate successfully', async () => {
      const mockGate = {
        id: 'test-gate',
        name: 'Test Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGate)
      });

      await manager.addQualityGate(mockGate);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockGate)
        })
      );
    });

    it('should handle add gate errors', async () => {
      const mockGate = {
        id: 'test-gate',
        name: 'Test Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(manager.addQualityGate(mockGate)).rejects.toThrow(
        'Failed to add quality gate: Bad Request'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to add quality gate:',
        expect.any(Error)
      );
    });
  });

  describe('updateQualityGate', () => {
    it('should update a quality gate successfully', async () => {
      const gateId = 'test-gate';
      const updates = { name: 'Updated Gate' };
      const mockUpdatedGate = {
        id: gateId,
        name: 'Updated Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedGate)
      });

      await manager.updateQualityGate(gateId, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/${gateId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates)
        })
      );
    });
  });

  describe('removeQualityGate', () => {
    it('should remove a quality gate successfully', async () => {
      const gateId = 'test-gate';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await manager.removeQualityGate(gateId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/${gateId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('getQualityGates', () => {
    it('should get all quality gates successfully', async () => {
      const mockGates = [
        {
          id: 'gate-1',
          name: 'Gate 1',
          environment: 'development',
          enabled: true,
          conditions: []
        },
        {
          id: 'gate-2',
          name: 'Gate 2',
          environment: 'production',
          enabled: true,
          conditions: []
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const gates = await manager.getQualityGates();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates`,
        expect.any(Object)
      );
      expect(gates).toEqual(mockGates);
    });

    it('should return empty array on error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const gates = await manager.getQualityGates();

      expect(gates).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to get quality gates:',
        expect.any(Error)
      );
    });
  });

  describe('getQualityGate', () => {
    it('should get a specific quality gate successfully', async () => {
      const gateId = 'test-gate';
      const mockGate = {
        id: gateId,
        name: 'Test Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGate)
      });

      const gate = await manager.getQualityGate(gateId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/${gateId}`,
        expect.any(Object)
      );
      expect(gate).toEqual(mockGate);
    });

    it('should return null for non-existent gate', async () => {
      const gateId = 'non-existent';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const gate = await manager.getQualityGate(gateId);

      expect(gate).toBeNull();
    });
  });

  describe('getQualityGatesForEnvironment', () => {
    it('should get quality gates for specific environment', async () => {
      const environment = 'development';
      const mockGates = [
        {
          id: 'dev-gate',
          name: 'Development Gate',
          environment: 'development',
          enabled: true,
          conditions: []
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const gates = await manager.getQualityGatesForEnvironment(environment);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates?environment=${environment}`,
        expect.any(Object)
      );
      expect(gates).toEqual(mockGates);
    });
  });

  describe('setDefaultQualityGate', () => {
    it('should set default quality gate for environment', async () => {
      const environment = 'development';
      const gateId = 'reynard-development';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Updated' })
      });

      await manager.setDefaultQualityGate(environment, gateId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/environments/${environment}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ defaultGateId: gateId })
        })
      );
    });
  });

  describe('getDefaultQualityGate', () => {
    it('should get default quality gate for environment', async () => {
      const environment = 'development';
      const mockEnvConfig = {
        environment: 'development',
        defaultGateId: 'reynard-development'
      };
      const mockGate = {
        id: 'reynard-development',
        name: 'Development Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEnvConfig)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGate)
        });

      const gate = await manager.getDefaultQualityGate(environment);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/environments/${environment}`,
        expect.any(Object)
      );
      expect(gate).toEqual(mockGate);
    });

    it('should return null when no default gate is set', async () => {
      const environment = 'development';
      const mockEnvConfig = {
        environment: 'development',
        defaultGateId: null
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnvConfig)
      });

      const gate = await manager.getDefaultQualityGate(environment);

      expect(gate).toBeNull();
    });
  });

  describe('getEvaluationHistory', () => {
    it('should get evaluation history successfully', async () => {
      const mockHistory = [
        {
          id: 'eval-1',
          gateId: 'reynard-development',
          gateName: 'Development Gate',
          status: 'PASSED',
          overallScore: 100,
          evaluatedAt: '2025-01-21T10:00:00Z'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory)
      });

      const history = await manager.getEvaluationHistory('reynard-development', 'development', 50);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/evaluations?gateId=reynard-development&environment=development&limit=50`,
        expect.any(Object)
      );
      expect(history).toEqual(mockHistory);
    });

    it('should return empty array on error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const history = await manager.getEvaluationHistory();

      expect(history).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to get evaluation history:',
        expect.any(Error)
      );
    });
  });

  describe('getEvaluationStats', () => {
    it('should get evaluation statistics successfully', async () => {
      const mockStats = {
        totalEvaluations: 100,
        passedRate: 85.5,
        failedRate: 10.0,
        warningRate: 4.5,
        averageScore: 87.2
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      const stats = await manager.getEvaluationStats('reynard-development', 'development', 30);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/stats?gateId=reynard-development&environment=development&days=30`,
        expect.any(Object)
      );
      expect(stats).toEqual(mockStats);
    });

    it('should return default stats on error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const stats = await manager.getEvaluationStats();

      expect(stats).toEqual({
        totalEvaluations: 0,
        passedRate: 0,
        failedRate: 0,
        warningRate: 0,
        averageScore: 0
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to get evaluation stats:',
        expect.any(Error)
      );
    });
  });

  describe('createReynardQualityGates', () => {
    it('should create Reynard quality gates successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Created' })
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await manager.createReynardQualityGates();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/reynard-defaults`,
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith('✅ Created Reynard quality gates');
    });
  });

  describe('exportConfiguration', () => {
    it('should export configuration successfully', async () => {
      const mockGates = [
        {
          id: 'reynard-development',
          name: 'Development Gate',
          environment: 'development',
          enabled: true,
          conditions: []
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const config = await manager.exportConfiguration();

      expect(config).toEqual({
        gates: mockGates,
        defaultGate: '',
        environments: {
          development: 'reynard-development',
          staging: 'reynard-development',
          production: 'reynard-production'
        }
      });
    });

    it('should return default config on error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const config = await manager.exportConfiguration();

      expect(config).toEqual({
        gates: [],
        defaultGate: '',
        environments: {
          development: 'reynard-development',
          staging: 'reynard-development',
          production: 'reynard-production'
        }
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to get quality gates:',
        expect.any(Error)
      );
    });
  });

  describe('importConfiguration', () => {
    it('should import configuration successfully', async () => {
      const mockConfig = {
        gates: [],
        defaultGate: '',
        environments: {
          development: 'reynard-development',
          staging: 'reynard-development',
          production: 'reynard-production'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Imported' })
      });

      await manager.importConfiguration(mockConfig);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/import`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockConfig)
        })
      );
    });
  });

  describe('validateConfiguration', () => {
    it('should validate configuration successfully', async () => {
      const mockGates = [
        {
          id: 'valid-gate',
          name: 'Valid Gate',
          environment: 'development',
          enabled: true,
          conditions: [
            {
              metric: 'bugs',
              operator: 'EQ',
              threshold: 0,
              description: 'No bugs'
            }
          ]
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const validation = await manager.validateConfiguration();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect validation errors', async () => {
      const mockGates = [
        {
          id: 'invalid-gate',
          name: '', // Missing name
          environment: 'development',
          enabled: true,
          conditions: [] // No conditions
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const validation = await manager.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Quality gate missing required fields: invalid-gate'
      );
      expect(validation.errors).toContain(
        "Quality gate 'invalid-gate' has no conditions"
      );
    });
  });

  describe('checkConnectivity', () => {
    it('should return true when backend is reachable', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const isConnected = await manager.checkConnectivity();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/health`,
        expect.any(Object)
      );
      expect(isConnected).toBe(true);
    });

    it('should return false when backend is unreachable', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const isConnected = await manager.checkConnectivity();

      expect(isConnected).toBe(false);
    });
  });

  describe('getBackendStatus', () => {
    it('should get backend status successfully', async () => {
      const mockStatus = {
        status: 'healthy',
        service: 'quality-gates',
        timestamp: '2025-01-21T10:00:00Z'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus)
      });

      const status = await manager.getBackendStatus();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/health`,
        expect.any(Object)
      );
      expect(status).toEqual(mockStatus);
    });

    it('should handle backend status errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable'
      });

      await expect(manager.getBackendStatus()).rejects.toThrow(
        'Backend health check failed: Service Unavailable'
      );
    });
  });

  describe('EventEmitter functionality', () => {
    it('should emit events for configuration loaded', async () => {
      const mockGates = [{ id: 'test-gate', name: 'Test Gate' }];
      const eventSpy = vi.fn();

      manager.on('configurationLoaded', eventSpy);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      await manager.loadConfiguration();

      expect(eventSpy).toHaveBeenCalledWith(mockGates);
    });

    it('should emit events for quality gates evaluated', async () => {
      const mockResults = [{ gateId: 'test-gate', status: 'PASSED' }];
      const eventSpy = vi.fn();

      manager.on('qualityGatesEvaluated', eventSpy);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      await manager.evaluateQualityGates({ bugs: 0 }, 'development');

      expect(eventSpy).toHaveBeenCalledWith(mockResults);
    });
  });
});
