/**
 * Comprehensive Backend API Tests
 * 
 * Tests all API endpoints for the comprehensive dashboard backend
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MockBackendServer } from '../mockServer';

// Test server instance
let testServer: MockBackendServer;

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `http://localhost:3003/api${endpoint}`;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
};

describe('Comprehensive Dashboard Backend API', () => {
  beforeAll(async () => {
    testServer = new MockBackendServer(3003);
    await testServer.start();
    console.log('Mock server started for testing');
  }, 30000);

  afterAll(async () => {
    if (testServer) {
      await testServer.stop();
      console.log('Mock server stopped');
    }
  }, 10000);

  beforeEach(() => {
    testServer.clearData();
  });

  describe('Authentication Endpoints', () => {
    it('should handle user registration', async () => {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data.user.email).toBe('test@example.com');
    });

    it('should handle user login', async () => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@reynard.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
    });

    it('should handle token refresh', async () => {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
    });

    it('should handle profile retrieval with valid token', async () => {
      // First login to get a token
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@reynard.com',
          password: 'password123',
        }),
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Get profile with token
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('user');
    });

    it('should reject invalid tokens', async () => {
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Dashboard Data Endpoints', () => {
    it('should return dashboard statistics', async () => {
      const response = await apiRequest('/dashboard/stats');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('stats');
      expect(data.stats).toHaveProperty('totalUsers');
      expect(data.stats).toHaveProperty('activeUsers');
      expect(data.stats).toHaveProperty('revenue');
      expect(data.stats).toHaveProperty('conversionRate');
      expect(data.stats).toHaveProperty('growth');
    });

    it('should return chart data', async () => {
      const response = await apiRequest('/dashboard/charts');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('charts');
      expect(data.charts).toHaveProperty('visitors');
      expect(data.charts).toHaveProperty('revenue');
      expect(data.charts).toHaveProperty('userTypes');
    });

    it('should return activity data', async () => {
      const response = await apiRequest('/dashboard/activity');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('activities');
      expect(Array.isArray(data.activities)).toBe(true);
    });
  });

  describe('File Management Endpoints', () => {
    it('should return file list', async () => {
      const response = await apiRequest('/files');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('files');
      expect(Array.isArray(data.files)).toBe(true);
    });

    it('should handle file upload', async () => {
      const response = await apiRequest('/files/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test-file.txt',
          type: 'document',
          size: 1024,
          url: '/uploads/test-file.txt',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('file');
      expect(data.file.name).toBe('test-file.txt');
    });

    it('should add uploaded files to file list', async () => {
      // Upload a file
      await apiRequest('/files/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: 'list-test.txt',
          type: 'document',
          size: 100,
          url: '/uploads/list-test.txt',
        }),
      });

      // Check it appears in the list
      const response = await apiRequest('/files');
      const data = await response.json();
      const uploadedFile = data.files.find((f: any) => f.name === 'list-test.txt');
      expect(uploadedFile).toBeDefined();
    });
  });

  describe('Settings Endpoints', () => {
    it('should return current settings', async () => {
      const response = await apiRequest('/settings');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('settings');
      expect(data.settings).toHaveProperty('theme');
      expect(data.settings).toHaveProperty('language');
      expect(data.settings).toHaveProperty('notifications');
      expect(data.settings).toHaveProperty('autoSave');
    });

    it('should update settings', async () => {
      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            language: 'es',
            notifications: false,
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Settings updated successfully');
    });

    it('should persist settings changes', async () => {
      // Update settings
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            language: 'fr',
          },
        }),
      });

      // Verify they were persisted
      const response = await apiRequest('/settings');
      const data = await response.json();
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('fr');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user workflow', async () => {
      // 1. Register a user
      const registerResponse = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'workflow@example.com',
          password: 'password123',
          name: 'Workflow User',
        }),
      });

      expect(registerResponse.status).toBe(201);
      const registerData = await registerResponse.json();
      const { accessToken, user } = registerData;

      // 2. Get profile
      const profileResponse = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(profileResponse.status).toBe(200);

      // 3. Access dashboard
      const [statsResponse, chartsResponse] = await Promise.all([
        apiRequest('/dashboard/stats'),
        apiRequest('/dashboard/charts'),
      ]);

      expect(statsResponse.status).toBe(200);
      expect(chartsResponse.status).toBe(200);

      // 4. Update settings
      const settingsResponse = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: { theme: 'dark' },
        }),
      });

      expect(settingsResponse.status).toBe(200);

      // 5. Upload a file
      const uploadResponse = await apiRequest('/files/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: 'workflow-test.txt',
          type: 'document',
          size: 512,
          url: '/uploads/workflow-test.txt',
        }),
      });

      expect(uploadResponse.status).toBe(201);

      // 6. Verify file in list
      const filesResponse = await apiRequest('/files');
      const filesData = await filesResponse.json();
      const uploadedFile = filesData.files.find((f: any) => f.name === 'workflow-test.txt');
      expect(uploadedFile).toBeDefined();
    });

    it('should handle concurrent requests', async () => {
      const requests = [
        apiRequest('/dashboard/stats'),
        apiRequest('/dashboard/charts'),
        apiRequest('/dashboard/activity'),
        apiRequest('/files'),
        apiRequest('/settings'),
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle error cases gracefully', async () => {
      // Test 404 for non-existent endpoint
      const response = await apiRequest('/nonexistent');
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Endpoint not found');
    });

    it('should maintain data consistency', async () => {
      // Get initial stats
      const initialResponse = await apiRequest('/dashboard/stats');
      const initialData = await initialResponse.json();
      const initialUserCount = initialData.stats.totalUsers;

      // Register a user
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'consistency@example.com',
          password: 'password123',
          name: 'Consistency User',
        }),
      });

      // Check user count increased
      const updatedResponse = await apiRequest('/dashboard/stats');
      const updatedData = await updatedResponse.json();
      expect(updatedData.stats.totalUsers).toBe(initialUserCount + 1);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid requests', async () => {
      const startTime = Date.now();
      
      const requests = Array(20).fill(null).map(() => 
        apiRequest('/dashboard/stats')
      );
      
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should complete 20 requests in reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should maintain response consistency under load', async () => {
      const requests = Array(10).fill(null).map(() => 
        apiRequest('/dashboard/charts')
      );
      
      const responses = await Promise.all(requests);
      const dataSets = await Promise.all(
        responses.map(response => response.json())
      );
      
      // All responses should be identical
      dataSets.forEach((data, index) => {
        if (index > 0) {
          expect(data.charts).toEqual(dataSets[0].charts);
        }
      });
    });
  });
});
