/**
 * Dashboard Data API Tests
 * 
 * Tests dashboard data endpoints:
 * - GET /api/dashboard/stats (dashboard statistics)
 * - GET /api/dashboard/charts (chart data)
 * - GET /api/dashboard/activity (recent activity)
 */

import { describe, it, expect } from 'vitest';
import { apiRequest } from '../test-setup';

describe('Dashboard Data API', () => {
  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await apiRequest('/dashboard/stats');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('stats');
      
      const stats = data.stats;
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('revenue');
      expect(stats).toHaveProperty('conversionRate');
      expect(stats).toHaveProperty('growth');
    });

    it('should return stats with correct data types', async () => {
      const response = await apiRequest('/dashboard/stats');
      const data = await response.json();
      const stats = data.stats;
      
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.activeUsers).toBe('number');
      expect(typeof stats.revenue).toBe('number');
      expect(typeof stats.conversionRate).toBe('number');
      expect(typeof stats.growth).toBe('number');
      
      // Validate ranges
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(0);
      expect(stats.revenue).toBeGreaterThanOrEqual(0);
      expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
      expect(stats.growth).toBeGreaterThanOrEqual(0);
    });

    it('should return different stats on multiple requests (simulated real-time)', async () => {
      const response1 = await apiRequest('/dashboard/stats');
      const response2 = await apiRequest('/dashboard/stats');
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Revenue should be different due to random variation
      expect(data1.stats.revenue).not.toBe(data2.stats.revenue);
      
      // But other stats should be consistent
      expect(data1.stats.totalUsers).toBe(data2.stats.totalUsers);
      expect(data1.stats.activeUsers).toBe(data2.stats.activeUsers);
    });

    it('should reflect user count changes', async () => {
      // Get initial stats
      const initialResponse = await apiRequest('/dashboard/stats');
      const initialData = await initialResponse.json();
      const initialUserCount = initialData.stats.totalUsers;

      // Register a new user (this should increase user count)
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'stats-test@example.com',
          password: 'password123',
          name: 'Stats Test User',
        }),
      });

      // Get updated stats
      const updatedResponse = await apiRequest('/dashboard/stats');
      const updatedData = await updatedResponse.json();
      
      expect(updatedData.stats.totalUsers).toBe(initialUserCount + 1);
    });
  });

  describe('GET /api/dashboard/charts', () => {
    it('should return chart data', async () => {
      const response = await apiRequest('/dashboard/charts');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('charts');
      
      const charts = data.charts;
      expect(charts).toHaveProperty('visitors');
      expect(charts).toHaveProperty('revenue');
      expect(charts).toHaveProperty('userTypes');
    });

    it('should return visitors chart with correct structure', async () => {
      const response = await apiRequest('/dashboard/charts');
      const data = await response.json();
      const visitors = data.charts.visitors;
      
      expect(visitors).toHaveProperty('labels');
      expect(visitors).toHaveProperty('datasets');
      
      expect(Array.isArray(visitors.labels)).toBe(true);
      expect(Array.isArray(visitors.datasets)).toBe(true);
      expect(visitors.datasets.length).toBeGreaterThan(0);
      
      const dataset = visitors.datasets[0];
      expect(dataset).toHaveProperty('label');
      expect(dataset).toHaveProperty('data');
      expect(dataset).toHaveProperty('borderColor');
      expect(dataset).toHaveProperty('backgroundColor');
      
      expect(Array.isArray(dataset.data)).toBe(true);
      expect(dataset.data.length).toBe(visitors.labels.length);
    });

    it('should return revenue chart with correct structure', async () => {
      const response = await apiRequest('/dashboard/charts');
      const data = await response.json();
      const revenue = data.charts.revenue;
      
      expect(revenue).toHaveProperty('labels');
      expect(revenue).toHaveProperty('datasets');
      
      const dataset = revenue.datasets[0];
      expect(dataset).toHaveProperty('label');
      expect(dataset).toHaveProperty('data');
      expect(dataset).toHaveProperty('backgroundColor');
      
      expect(dataset.label).toBe('Revenue ($)');
      expect(Array.isArray(dataset.data)).toBe(true);
    });

    it('should return user types chart with correct structure', async () => {
      const response = await apiRequest('/dashboard/charts');
      const data = await response.json();
      const userTypes = data.charts.userTypes;
      
      expect(userTypes).toHaveProperty('labels');
      expect(userTypes).toHaveProperty('datasets');
      
      const dataset = userTypes.datasets[0];
      expect(dataset).toHaveProperty('data');
      expect(dataset).toHaveProperty('backgroundColor');
      
      expect(Array.isArray(dataset.data)).toBe(true);
      expect(Array.isArray(dataset.backgroundColor)).toBe(true);
      expect(dataset.data.length).toBe(dataset.backgroundColor.length);
      expect(dataset.data.length).toBe(userTypes.labels.length);
    });

    it('should return consistent chart data', async () => {
      const response1 = await apiRequest('/dashboard/charts');
      const response2 = await apiRequest('/dashboard/charts');
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.charts).toEqual(data2.charts);
    });

    it('should have valid chart data values', async () => {
      const response = await apiRequest('/dashboard/charts');
      const data = await response.json();
      const charts = data.charts;
      
      // Check visitors data
      charts.visitors.datasets[0].data.forEach((value: number) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
      
      // Check revenue data
      charts.revenue.datasets[0].data.forEach((value: number) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
      
      // Check user types data
      charts.userTypes.datasets[0].data.forEach((value: number) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return recent activity', async () => {
      const response = await apiRequest('/dashboard/activity');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('activities');
      expect(Array.isArray(data.activities)).toBe(true);
    });

    it('should return activities with correct structure', async () => {
      const response = await apiRequest('/dashboard/activity');
      const data = await response.json();
      
      data.activities.forEach((activity: any) => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('user');
        expect(activity).toHaveProperty('action');
        expect(activity).toHaveProperty('time');
        
        expect(typeof activity.id).toBe('string');
        expect(typeof activity.user).toBe('string');
        expect(typeof activity.action).toBe('string');
        expect(typeof activity.time).toBe('string');
      });
    });

    it('should return consistent activity list', async () => {
      const response1 = await apiRequest('/dashboard/activity');
      const response2 = await apiRequest('/dashboard/activity');
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.activities).toEqual(data2.activities);
    });

    it('should include new activities after file upload', async () => {
      // Get initial activity count
      const initialResponse = await apiRequest('/dashboard/activity');
      const initialData = await initialResponse.json();
      const initialCount = initialData.activities.length;

      // Upload a file to generate activity
      await apiRequest('/files/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: 'activity-test.txt',
          type: 'document',
          size: 512,
          url: '/uploads/activity-test.txt',
        }),
      });

      // Check that activity was added
      const updatedResponse = await apiRequest('/dashboard/activity');
      const updatedData = await updatedResponse.json();
      
      expect(updatedData.activities.length).toBe(initialCount + 1);
      
      // New activity should be at the beginning (most recent)
      const newActivity = updatedData.activities[0];
      expect(newActivity.action).toBe('Uploaded file');
      expect(newActivity.user).toBe('Current User');
    });

    it('should maintain activity order (newest first)', async () => {
      // Upload multiple files to generate activities
      for (let i = 0; i < 3; i++) {
        await apiRequest('/files/upload', {
          method: 'POST',
          body: JSON.stringify({
            name: `order-test-${i}.txt`,
            type: 'document',
            size: 100,
            url: `/uploads/order-test-${i}.txt`,
          }),
        });
      }

      const response = await apiRequest('/dashboard/activity');
      const data = await response.json();
      
      // Find upload activities
      const uploadActivities = data.activities.filter((a: any) => 
        a.action === 'Uploaded file' && a.details?.fileName?.startsWith('order-test-')
      );
      
      expect(uploadActivities.length).toBe(3);
      
      // Activities should be in reverse chronological order
      // (newest first, so order-test-2, order-test-1, order-test-0)
      expect(uploadActivities[0].details.fileName).toBe('order-test-2.txt');
      expect(uploadActivities[1].details.fileName).toBe('order-test-1.txt');
      expect(uploadActivities[2].details.fileName).toBe('order-test-0.txt');
    });
  });

  describe('Dashboard Data Integration', () => {
    it('should provide consistent data across all endpoints', async () => {
      const [statsResponse, chartsResponse, activityResponse] = await Promise.all([
        apiRequest('/dashboard/stats'),
        apiRequest('/dashboard/charts'),
        apiRequest('/dashboard/activity'),
      ]);

      expect(statsResponse.status).toBe(200);
      expect(chartsResponse.status).toBe(200);
      expect(activityResponse.status).toBe(200);

      const [statsData, chartsData, activityData] = await Promise.all([
        statsResponse.json(),
        chartsResponse.json(),
        activityResponse.json(),
      ]);

      // All endpoints should return valid data
      expect(statsData.stats).toBeDefined();
      expect(chartsData.charts).toBeDefined();
      expect(activityData.activities).toBeDefined();
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        Promise.all([
          apiRequest('/dashboard/stats'),
          apiRequest('/dashboard/charts'),
          apiRequest('/dashboard/activity'),
        ])
      );

      const results = await Promise.all(requests);
      
      results.forEach(([statsRes, chartsRes, activityRes]) => {
        expect(statsRes.status).toBe(200);
        expect(chartsRes.status).toBe(200);
        expect(activityRes.status).toBe(200);
      });
    });

    it('should maintain data consistency under load', async () => {
      // Make multiple requests to each endpoint
      const statsRequests = Array(5).fill(null).map(() => apiRequest('/dashboard/stats'));
      const chartsRequests = Array(5).fill(null).map(() => apiRequest('/dashboard/charts'));
      const activityRequests = Array(5).fill(null).map(() => apiRequest('/dashboard/activity'));

      const [statsResults, chartsResults, activityResults] = await Promise.all([
        Promise.all(statsRequests),
        Promise.all(chartsRequests),
        Promise.all(activityRequests),
      ]);

      // Parse all responses
      const statsData = await Promise.all(statsResults.map(r => r.json()));
      const chartsData = await Promise.all(chartsResults.map(r => r.json()));
      const activityData = await Promise.all(activityResults.map(r => r.json()));

      // Charts and activity should be identical across requests
      chartsData.forEach((data, index) => {
        if (index > 0) {
          expect(data.charts).toEqual(chartsData[0].charts);
        }
      });

      activityData.forEach((data, index) => {
        if (index > 0) {
          expect(data.activities).toEqual(activityData[0].activities);
        }
      });

      // Stats should have same structure but may vary due to random elements
      statsData.forEach(data => {
        expect(data.stats).toHaveProperty('totalUsers');
        expect(data.stats).toHaveProperty('activeUsers');
        expect(data.stats).toHaveProperty('revenue');
        expect(data.stats).toHaveProperty('conversionRate');
        expect(data.stats).toHaveProperty('growth');
      });
    });
  });
});
