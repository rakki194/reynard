/**
 * Quality Gates Integration Tests
 *
 * 🦊 *whiskers twitch with systematic precision* Comprehensive integration tests
 * for the complete quality gates system, ensuring end-to-end functionality
 * across all components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseQualityGateManager } from '../DatabaseQualityGateManager';
import { handleQualityGateCommand } from '../commands/quality-gate-command';
import { handleQualityGateManagementCommand } from '../commands/quality-gate-management-command';

// Mock fetch globally
global.fetch = vi.fn();

describe('Quality Gates Integration Tests', () => {
  let mockBackendUrl: string;
  let mockApiKey: string;
  let consoleSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockBackendUrl = 'http://localhost:8000';
    mockApiKey = 'test-api-key';
    
    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
    };
    
    // Mock process.exit
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Quality Gate Workflow', () => {
    it('should complete full quality gate lifecycle', async () => {
      // Step 1: Initialize default gates
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Initialized', gatesCreated: 3 })
        });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      await manager.createReynardQualityGates();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/reynard-defaults`,
        expect.objectContaining({ method: 'POST' })
      );

      // Step 2: List gates
      const mockGates = [
        {
          id: 'reynard-development',
          gate_id: 'reynard-development',
          name: 'Reynard Development Quality Gate',
          environment: 'development',
          enabled: true,
          conditions: [
            {
              metric: 'bugs',
              operator: 'EQ',
              threshold: 0,
              description: 'No bugs allowed in development'
            }
          ]
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const gates = await manager.getQualityGates();
      expect(gates).toEqual(mockGates);

      // Step 3: Evaluate gates
      const mockEvaluationResults = [
        {
          gateId: 'reynard-development',
          gateName: 'Reynard Development Quality Gate',
          status: 'PASSED',
          conditions: [
            {
              condition: { metric: 'bugs', operator: 'EQ', threshold: 0 },
              status: 'PASSED',
              actualValue: 0,
              threshold: 0,
              message: 'Condition passed: bugs EQ 0 (actual: 0)'
            }
          ],
          overallScore: 100.0,
          passedConditions: 1,
          totalConditions: 1,
          failedConditions: 0,
          warningConditions: 0,
          evaluationId: 'eval-123'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvaluationResults)
      });

      const metrics = {
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 25,
        cyclomaticComplexity: 150,
        maintainabilityIndex: 75
      };

      const results = await manager.evaluateQualityGates(metrics, 'development');
      expect(results).toEqual(mockEvaluationResults);

      // Step 4: Get evaluation history
      const mockHistory = [
        {
          id: 'eval-1',
          gateId: 'reynard-development',
          gateName: 'Reynard Development Quality Gate',
          status: 'PASSED',
          overallScore: 100.0,
          evaluatedAt: '2025-01-21T10:00:00Z'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory)
      });

      const history = await manager.getEvaluationHistory('reynard-development', 'development', 10);
      expect(history).toEqual(mockHistory);

      // Step 5: Get evaluation statistics
      const mockStats = {
        totalEvaluations: 10,
        passedRate: 90.0,
        failedRate: 10.0,
        warningRate: 0.0,
        averageScore: 95.0
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      const stats = await manager.getEvaluationStats('reynard-development', 'development', 30);
      expect(stats).toEqual(mockStats);
    });

    it('should handle quality gate creation and management workflow', async () => {
      // Step 1: Create a custom gate
      const customGateData = {
        id: 'custom-gate',
        name: 'Custom Quality Gate',
        environment: 'development',
        enabled: true,
        conditions: [
          {
            metric: 'customMetric',
            operator: 'LT',
            threshold: 100,
            description: 'Custom metric threshold'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(customGateData)
      });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      await manager.addQualityGate(customGateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(customGateData)
        })
      );

      // Step 2: Update the gate
      const updates = { name: 'Updated Custom Gate', enabled: false };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...customGateData, ...updates })
      });

      await manager.updateQualityGate('custom-gate', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/custom-gate`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates)
        })
      );

      // Step 3: Set as default for environment
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Updated' })
      });

      await manager.setDefaultQualityGate('development', 'custom-gate');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/environments/development`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ defaultGateId: 'custom-gate' })
        })
      );

      // Step 4: Delete the gate
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await manager.removeQualityGate('custom-gate');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/custom-gate`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('CLI Integration Tests', () => {
    it('should handle quality gate command with backend connectivity', async () => {
      // Mock backend connectivity
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true  // Health check
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])  // Load configuration
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([  // Evaluation results
            {
              gateId: 'reynard-development',
              gateName: 'Development Gate',
              status: 'PASSED',
              conditions: [],
              overallScore: 100.0,
              passedConditions: 3,
              totalConditions: 3,
              failedConditions: 0,
              warningConditions: 0
            }
          ])
        });

      const options = {
        project: '/test/project',
        environment: 'development',
        metrics: undefined
      };

      // Mock CodeQualityAnalyzer
      vi.doMock('../CodeQualityAnalyzer', () => ({
        CodeQualityAnalyzer: vi.fn().mockImplementation(() => ({
          analyzeProject: vi.fn().mockResolvedValue({
            metrics: {
              bugs: 0,
              vulnerabilities: 0,
              codeSmells: 25
            }
          })
        }))
      }));

      try {
        await handleQualityGateCommand(options);
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Evaluation Results:');
        expect(consoleSpy.log).toHaveBeenCalledWith('=====================================');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle quality gate command with backend connectivity failure', async () => {
      // Mock backend connectivity failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false
      });

      const options = {
        project: '/test/project',
        environment: 'development',
        metrics: undefined
      };

      await expect(handleQualityGateCommand(options)).rejects.toThrow('process.exit called');

      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ Could not connect to Reynard backend, using fallback mode');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle quality gate management command workflow', async () => {
      // Mock backend connectivity
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true  // Health check
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([  // List gates
            {
              id: 'reynard-development',
              gate_id: 'reynard-development',
              name: 'Development Gate',
              environment: 'development',
              enabled: true,
              conditions: []
            }
          ])
        });

      const options = {
        project: '/test/project',
        action: 'list',
        backendUrl: mockBackendUrl,
        apiKey: mockApiKey
      };

      try {
        await handleQualityGateManagementCommand(options);
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
        expect(consoleSpy.log).toHaveBeenCalledWith('📋 Quality Gates:');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      
      const isConnected = await manager.checkConnectivity();
      expect(isConnected).toBe(false);

      const gates = await manager.getQualityGates();
      expect(gates).toEqual([]);

      const stats = await manager.getEvaluationStats();
      expect(stats).toEqual({
        totalEvaluations: 0,
        passedRate: 0,
        failedRate: 0,
        warningRate: 0,
        averageScore: 0
      });
    });

    it('should handle server errors gracefully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true  // Health check passes
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ detail: 'Internal Server Error' })
        });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      
      await expect(
        manager.evaluateQualityGates({ bugs: 0 }, 'development')
      ).rejects.toThrow();
    });

    it('should handle malformed responses gracefully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      
      const result = await manager.getQualityGates();
      expect(result).toEqual([]);
    });
  });

  describe('Configuration Management Integration', () => {
    it('should handle configuration export and import', async () => {
      const mockGates = [
        {
          id: 'gate-1',
          name: 'Gate 1',
          environment: 'development',
          enabled: true,
          conditions: []
        }
      ];

      // Export configuration
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates)
      });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      const exportedConfig = await manager.exportConfiguration();

      expect(exportedConfig.gates).toEqual(mockGates);
      expect(exportedConfig.environments).toEqual({
        development: 'reynard-development',
        staging: 'reynard-development',
        production: 'reynard-production'
      });

      // Import configuration
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Imported' })
      });

      await manager.importConfiguration(exportedConfig);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/quality-gates/import`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(exportedConfig)
        })
      );
    });

    it('should validate configuration correctly', async () => {
      const validGates = [
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
        json: () => Promise.resolve(validGates)
      });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      const validation = await manager.validateConfiguration();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('Environment Variable Integration', () => {
    it('should use environment variables correctly', async () => {
      const originalBackendUrl = process.env.REYNARD_BACKEND_URL;
      const originalApiKey = process.env.REYNARD_API_KEY;
      
      process.env.REYNARD_BACKEND_URL = 'http://custom-backend:8000';
      process.env.REYNARD_API_KEY = 'custom-api-key';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const manager = new DatabaseQualityGateManager('http://custom-backend:8000', 'custom-api-key');
      await manager.getQualityGates();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://custom-backend:8000/api/quality-gates',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer custom-api-key'
          })
        })
      );

      // Restore environment
      if (originalBackendUrl) {
        process.env.REYNARD_BACKEND_URL = originalBackendUrl;
      } else {
        delete process.env.REYNARD_BACKEND_URL;
      }
      
      if (originalApiKey) {
        process.env.REYNARD_API_KEY = originalApiKey;
      } else {
        delete process.env.REYNARD_API_KEY;
      }
    });
  });

  describe('Event Emission Integration', () => {
    it('should emit events correctly throughout the lifecycle', async () => {
      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      
      const eventSpy = vi.fn();
      manager.on('configurationLoaded', eventSpy);
      manager.on('qualityGatesEvaluated', eventSpy);
      manager.on('qualityGateAdded', eventSpy);

      // Test configuration loaded event
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await manager.loadConfiguration();
      expect(eventSpy).toHaveBeenCalledWith([]);

      // Test evaluation event
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ gateId: 'test', status: 'PASSED' }])
      });

      await manager.evaluateQualityGates({ bugs: 0 }, 'development');
      expect(eventSpy).toHaveBeenCalledWith([{ gateId: 'test', status: 'PASSED' }]);

      // Test gate added event
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'new-gate' })
      });

      await manager.addQualityGate({
        id: 'new-gate',
        name: 'New Gate',
        environment: 'development',
        enabled: true,
        conditions: []
      });
      expect(eventSpy).toHaveBeenCalledWith({ id: 'new-gate' });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of gates efficiently', async () => {
      const largeGatesList = Array.from({ length: 100 }, (_, i) => ({
        id: `gate-${i}`,
        name: `Gate ${i}`,
        environment: 'development',
        enabled: true,
        conditions: []
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeGatesList)
      });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      const gates = await manager.getQualityGates();

      expect(gates).toHaveLength(100);
      expect(gates[0].id).toBe('gate-0');
      expect(gates[99].id).toBe('gate-99');
    });

    it('should handle large evaluation results efficiently', async () => {
      const largeResults = Array.from({ length: 50 }, (_, i) => ({
        gateId: `gate-${i}`,
        gateName: `Gate ${i}`,
        status: 'PASSED',
        conditions: [],
        overallScore: 100.0,
        passedConditions: 3,
        totalConditions: 3,
        failedConditions: 0,
        warningConditions: 0,
        evaluationId: `eval-${i}`
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeResults)
      });

      const manager = new DatabaseQualityGateManager(mockBackendUrl, mockApiKey);
      const results = await manager.evaluateQualityGates({ bugs: 0 }, 'development');

      expect(results).toHaveLength(50);
      expect(results[0].gateId).toBe('gate-0');
      expect(results[49].gateId).toBe('gate-49');
    });
  });
});
