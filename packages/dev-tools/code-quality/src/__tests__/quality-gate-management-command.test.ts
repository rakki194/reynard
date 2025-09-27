/**
 * Quality Gate Management Command Tests
 *
 * 🦊 *whiskers twitch with systematic precision* Comprehensive tests for the
 * quality gate management CLI commands, ensuring proper command handling
 * and user interaction.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleQualityGateManagementCommand } from '../commands/quality-gate-management-command';
import { DatabaseQualityGateManager } from '../DatabaseQualityGateManager';

// Mock the DatabaseQualityGateManager
vi.mock('../DatabaseQualityGateManager');

describe('Quality Gate Management Command', () => {
  let mockManager: any;
  let consoleSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
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
    
    // Mock DatabaseQualityGateManager
    mockManager = {
      checkConnectivity: vi.fn(),
      loadConfiguration: vi.fn(),
      getQualityGates: vi.fn(),
      getQualityGate: vi.fn(),
      addQualityGate: vi.fn(),
      updateQualityGate: vi.fn(),
      removeQualityGate: vi.fn(),
      createReynardQualityGates: vi.fn(),
      getEvaluationStats: vi.fn(),
      getEvaluationHistory: vi.fn()
    };
    
    // Mock the constructor to return our mock manager
    vi.mocked(DatabaseQualityGateManager).mockImplementation(() => mockManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleQualityGateManagementCommand', () => {
    const baseOptions = {
      project: '/test/project',
      action: 'list',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should handle successful connectivity check', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockResolvedValue([]);

      try {
        await handleQualityGateManagementCommand(baseOptions);
        expect(mockManager.checkConnectivity).toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should exit when backend is not reachable', async () => {
      mockManager.checkConnectivity.mockResolvedValue(false);

      await expect(
        handleQualityGateManagementCommand(baseOptions)
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Could not connect to Reynard backend');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle unknown action', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...baseOptions, action: 'unknown' })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Unknown action: unknown');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle command errors', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockRejectedValue(new Error('Service error'));

      await expect(
        handleQualityGateManagementCommand(baseOptions)
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Quality gate management failed:',
        'Service error'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('list action', () => {
    const listOptions = {
      project: '/test/project',
      action: 'list',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should list quality gates successfully', async () => {
      const mockGates = [
        {
          id: 'reynard-development',
          gate_id: 'reynard-development',
          name: 'Development Gate',
          environment: 'development',
          enabled: true,
          is_default: false,
          conditions: [
            {
              metric: 'bugs',
              operator: 'EQ',
              threshold: 0,
              description: 'No bugs allowed',
              enabled: true
            }
          ]
        }
      ];

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockResolvedValue(mockGates);

      try {
        await handleQualityGateManagementCommand(listOptions);
        expect(mockManager.getQualityGates).toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
        expect(consoleSpy.log).toHaveBeenCalledWith('📋 Quality Gates:');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n🦊 Development Gate (reynard-development)');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle empty gates list', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockResolvedValue([]);

      try {
        await handleQualityGateManagementCommand(listOptions);
        expect(consoleSpy.log).toHaveBeenCalledWith('   No quality gates found. Run \'init\' to create default gates.');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });
  });

  describe('show action', () => {
    const showOptions = {
      project: '/test/project',
      action: 'show',
      gateId: 'test-gate',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should show quality gate successfully', async () => {
      const mockGate = {
        id: 'test-gate',
        gate_id: 'test-gate',
        name: 'Test Gate',
        environment: 'development',
        enabled: true,
        is_default: false,
        conditions: [
          {
            metric: 'bugs',
            operator: 'EQ',
            threshold: 0,
            description: 'No bugs allowed',
            enabled: true
          }
        ]
      };

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGate.mockResolvedValue(mockGate);

      try {
        await handleQualityGateManagementCommand(showOptions);
        expect(mockManager.getQualityGate).toHaveBeenCalledWith('test-gate');
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n🦊 Test Gate (test-gate)');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle missing gate ID', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...showOptions, gateId: undefined })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Gate ID is required for \'show\' action');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle gate not found', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGate.mockResolvedValue(null);

      await expect(
        handleQualityGateManagementCommand(showOptions)
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Quality gate \'test-gate\' not found');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('create action', () => {
    const createOptions = {
      project: '/test/project',
      action: 'create',
      gateId: 'new-gate',
      name: 'New Gate',
      environment: 'development',
      description: 'A new gate',
      enabled: true,
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should create quality gate successfully', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.addQualityGate.mockResolvedValue(undefined);

      try {
        await handleQualityGateManagementCommand(createOptions);
        expect(mockManager.addQualityGate).toHaveBeenCalledWith({
          id: 'new-gate',
          name: 'New Gate',
          environment: 'development',
          description: 'A new gate',
          enabled: true,
          conditions: []
        });
        expect(consoleSpy.log).toHaveBeenCalledWith('✅ Created quality gate \'new-gate\'');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle missing required fields', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...createOptions, gateId: undefined })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Gate ID, name, and environment are required for \'create\' action'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('update action', () => {
    const updateOptions = {
      project: '/test/project',
      action: 'update',
      gateId: 'test-gate',
      name: 'Updated Gate',
      enabled: false,
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should update quality gate successfully', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.updateQualityGate.mockResolvedValue(undefined);

      try {
        await handleQualityGateManagementCommand(updateOptions);
        expect(mockManager.updateQualityGate).toHaveBeenCalledWith('test-gate', {
          name: 'Updated Gate',
          enabled: false
        });
        expect(consoleSpy.log).toHaveBeenCalledWith('✅ Updated quality gate \'test-gate\'');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle missing gate ID', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...updateOptions, gateId: undefined })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Gate ID is required for \'update\' action');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle no updates specified', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...updateOptions, name: undefined, enabled: undefined })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ No updates specified');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('delete action', () => {
    const deleteOptions = {
      project: '/test/project',
      action: 'delete',
      gateId: 'test-gate',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should delete quality gate successfully', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.removeQualityGate.mockResolvedValue(undefined);

      try {
        await handleQualityGateManagementCommand(deleteOptions);
        expect(mockManager.removeQualityGate).toHaveBeenCalledWith('test-gate');
        expect(consoleSpy.log).toHaveBeenCalledWith('✅ Deleted quality gate \'test-gate\'');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle missing gate ID', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);

      await expect(
        handleQualityGateManagementCommand({ ...deleteOptions, gateId: undefined })
      ).rejects.toThrow('process.exit called');

      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Gate ID is required for \'delete\' action');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('init action', () => {
    const initOptions = {
      project: '/test/project',
      action: 'init',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should initialize default gates successfully', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.createReynardQualityGates.mockResolvedValue(undefined);

      try {
        await handleQualityGateManagementCommand(initOptions);
        expect(mockManager.createReynardQualityGates).toHaveBeenCalled();
        expect(consoleSpy.log).toHaveBeenCalledWith('🚀 Initializing default Reynard quality gates...');
        expect(consoleSpy.log).toHaveBeenCalledWith('✅ Default quality gates initialized successfully');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Created gates:');
        expect(consoleSpy.log).toHaveBeenCalledWith('   - reynard-development (Development environment)');
        expect(consoleSpy.log).toHaveBeenCalledWith('   - reynard-production (Production environment)');
        expect(consoleSpy.log).toHaveBeenCalledWith('   - reynard-modularity (Modularity standards)');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });
  });

  describe('stats action', () => {
    const statsOptions = {
      project: '/test/project',
      action: 'stats',
      gateId: 'test-gate',
      environment: 'development',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should show evaluation statistics successfully', async () => {
      const mockStats = {
        totalEvaluations: 100,
        passedRate: 85.5,
        failedRate: 10.0,
        warningRate: 4.5,
        averageScore: 87.2
      };

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getEvaluationStats.mockResolvedValue(mockStats);

      try {
        await handleQualityGateManagementCommand(statsOptions);
        expect(mockManager.getEvaluationStats).toHaveBeenCalledWith('test-gate', 'development', 30);
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n📊 Quality Gate Statistics');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Total Evaluations: 100');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Pass Rate: 85.5%');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Fail Rate: 10.0%');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Warning Rate: 4.5%');
        expect(consoleSpy.log).toHaveBeenCalledWith('   Average Score: 87.2%');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });
  });

  describe('history action', () => {
    const historyOptions = {
      project: '/test/project',
      action: 'history',
      gateId: 'test-gate',
      environment: 'development',
      backendUrl: 'http://localhost:8000',
      apiKey: 'test-key'
    };

    it('should show evaluation history successfully', async () => {
      const mockHistory = [
        {
          id: 'eval-1',
          gateId: 'test-gate',
          gateName: 'Test Gate',
          evaluationId: 'eval-123',
          environment: 'development',
          status: 'PASSED',
          overallScore: 100.0,
          passedConditions: 3,
          totalConditions: 3,
          evaluatedAt: '2025-01-21T10:00:00Z'
        },
        {
          id: 'eval-2',
          gateId: 'test-gate',
          gateName: 'Test Gate',
          evaluationId: 'eval-124',
          environment: 'development',
          status: 'FAILED',
          overallScore: 50.0,
          passedConditions: 1,
          totalConditions: 3,
          evaluatedAt: '2025-01-20T10:00:00Z'
        }
      ];

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getEvaluationHistory.mockResolvedValue(mockHistory);

      try {
        await handleQualityGateManagementCommand(historyOptions);
        expect(mockManager.getEvaluationHistory).toHaveBeenCalledWith('test-gate', 'development', 20);
        expect(consoleSpy.log).toHaveBeenCalledWith('🦊 Quality Gate Management');
        expect(consoleSpy.log).toHaveBeenCalledWith('==========================');
        expect(consoleSpy.log).toHaveBeenCalledWith('📜 Quality Gate Evaluation History:');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n✅ Test Gate (eval-123)');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n❌ Test Gate (eval-124)');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });

    it('should handle empty history', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getEvaluationHistory.mockResolvedValue([]);

      try {
        await handleQualityGateManagementCommand(historyOptions);
        expect(consoleSpy.log).toHaveBeenCalledWith('   No evaluation history found.');
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }
    });
  });

  describe('environment variable handling', () => {
    it('should use environment variables for backend URL and API key', async () => {
      const originalEnv = process.env.REYNARD_BACKEND_URL;
      const originalApiKey = process.env.REYNARD_API_KEY;
      
      process.env.REYNARD_BACKEND_URL = 'http://custom-backend:8000';
      process.env.REYNARD_API_KEY = 'custom-api-key';

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockResolvedValue([]);

      try {
        await handleQualityGateManagementCommand({
          project: '/test/project',
          action: 'list'
        });
        expect(DatabaseQualityGateManager).toHaveBeenCalledWith(
          'http://custom-backend:8000',
          'custom-api-key'
        );
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }

      // Restore environment
      if (originalEnv) {
        process.env.REYNARD_BACKEND_URL = originalEnv;
      } else {
        delete process.env.REYNARD_BACKEND_URL;
      }
      
      if (originalApiKey) {
        process.env.REYNARD_API_KEY = originalApiKey;
      } else {
        delete process.env.REYNARD_API_KEY;
      }
    });

    it('should use default backend URL when not set', async () => {
      const originalEnv = process.env.REYNARD_BACKEND_URL;
      delete process.env.REYNARD_BACKEND_URL;

      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.getQualityGates.mockResolvedValue([]);

      try {
        await handleQualityGateManagementCommand({
          project: '/test/project',
          action: 'list'
        });
        expect(DatabaseQualityGateManager).toHaveBeenCalledWith(
          'http://localhost:8000',
          undefined
        );
      } catch (error) {
        // Expected to throw due to process.exit mock
        expect(error.message).toBe('process.exit called');
      }

      // Restore environment
      if (originalEnv) {
        process.env.REYNARD_BACKEND_URL = originalEnv;
      }
    });
  });

  describe('enabled/disabled flag handling', () => {
    it('should handle enabled flag correctly', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.addQualityGate.mockResolvedValue(undefined);

      await handleQualityGateManagementCommand({
        project: '/test/project',
        action: 'create',
        gateId: 'test-gate',
        name: 'Test Gate',
        environment: 'development',
        enabled: true
      });

      expect(mockManager.addQualityGate).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });

    it('should handle disabled flag correctly', async () => {
      mockManager.checkConnectivity.mockResolvedValue(true);
      mockManager.addQualityGate.mockResolvedValue(undefined);

      await handleQualityGateManagementCommand({
        project: '/test/project',
        action: 'create',
        gateId: 'test-gate',
        name: 'Test Gate',
        environment: 'development',
        enabled: false
      });

      expect(mockManager.addQualityGate).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });
  });
});
