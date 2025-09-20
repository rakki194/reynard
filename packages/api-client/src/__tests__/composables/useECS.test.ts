/**
 * Tests for the useECS composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useECS } from '../../composables/useECS';
import type { ReynardApiClient } from '../../client';

// Mock the client
const mockClient = {
  config: {
    basePath: 'http://localhost:8000',
  },
} as ReynardApiClient;

describe('useECS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorldStatus', () => {
    it('should get ECS world status', async () => {
      const mockResponse = {
        status: 'active',
        entity_count: 100,
        system_count: 5,
        agent_count: 25,
        mature_agents: 20,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.getWorldStatus();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/status'
      );
    });
  });

  describe('getAgents', () => {
    it('should get all agents', async () => {
      const mockResponse = [
        {
          agent_id: 'agent-1',
          name: 'Test Agent',
          spirit: 'fox',
          style: 'foundation',
          active: true,
        },
        {
          agent_id: 'agent-2',
          name: 'Another Agent',
          spirit: 'wolf',
          style: 'exo',
          active: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.getAgents();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/agents'
      );
    });
  });

  describe('createAgent', () => {
    it('should create a new agent', async () => {
      const mockRequest = {
        agent_id: 'new-agent-123',
        spirit: 'otter',
        style: 'hybrid',
        name: 'New Agent',
      };

      const mockResponse = {
        agent_id: 'new-agent-123',
        name: 'New Agent',
        spirit: 'otter',
        style: 'hybrid',
        active: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.createAgent(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/agents',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        })
      );
    });
  });

  describe('getAgentPosition', () => {
    it('should get agent position', async () => {
      const agentId = 'agent-123';
      const mockResponse = {
        agent_id: agentId,
        x: 100.5,
        y: 200.3,
        target_x: 150.0,
        target_y: 250.0,
        velocity_x: 5.0,
        velocity_y: 3.0,
        movement_speed: 10.0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.getAgentPosition(agentId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/agents/${agentId}/position`
      );
    });
  });

  describe('moveAgent', () => {
    it('should move an agent to specific coordinates', async () => {
      const agentId = 'agent-123';
      const moveRequest = { x: 300.0, y: 400.0 };
      const mockResponse = {
        agent_id: agentId,
        x: 100.0,
        y: 200.0,
        target_x: 300.0,
        target_y: 400.0,
        velocity_x: 5.0,
        velocity_y: 3.0,
        movement_speed: 10.0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.moveAgent(agentId, moveRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/agents/${agentId}/move`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        })
      );
    });
  });

  describe('sendChatMessage', () => {
    it('should send a chat message between agents', async () => {
      const agentId = 'agent-1';
      const chatRequest = {
        receiver_id: 'agent-2',
        message: 'Hello from the ECS world!',
        interaction_type: 'communication',
      };

      const mockResponse = {
        success: true,
        message_id: 'msg-123',
        timestamp: '2025-01-15T10:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.sendChatMessage(agentId, chatRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/agents/${agentId}/chat`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatRequest),
        })
      );
    });
  });

  describe('getNearbyAgents', () => {
    it('should get nearby agents within radius', async () => {
      const agentId = 'agent-123';
      const radius = 150.0;
      const mockResponse = {
        nearby_agents: [
          {
            agent_id: 'agent-456',
            name: 'Nearby Agent',
            spirit: 'eagle',
            x: 200.0,
            y: 250.0,
            distance: 100.0,
          },
        ],
        radius: 150.0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      const result = await ecsService.getNearbyAgents(agentId, radius);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/agents/${agentId}/nearby?radius=${radius}`
      );
    });

    it('should use default radius when not specified', async () => {
      const agentId = 'agent-123';
      const mockResponse = {
        nearby_agents: [],
        radius: 100.0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ecsService = useECS(mockClient);
      await ecsService.getNearbyAgents(agentId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/agents/${agentId}/nearby?radius=100`
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const ecsService = useECS(mockClient);
      
      await expect(ecsService.getWorldStatus()).rejects.toThrow('HTTP error! status: 404');
    });

    it('should set error state on failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const ecsService = useECS(mockClient);
      
      try {
        await ecsService.getWorldStatus();
      } catch (error) {
        // Expected to throw
      }

      expect(ecsService.error()).toBe('Network error');
    });
  });
});
