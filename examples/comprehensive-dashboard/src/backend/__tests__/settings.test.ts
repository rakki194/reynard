/**
 * Settings API Tests
 * 
 * Tests settings management endpoints:
 * - GET /api/settings (get settings)
 * - PUT /api/settings (update settings)
 */

import { describe, it, expect } from 'vitest';
import { apiRequest, getTestServer } from '../test-setup';

describe('Settings API', () => {
  describe('GET /api/settings', () => {
    it('should return current settings', async () => {
      const response = await apiRequest('/settings');

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('settings');
      expect(typeof data.settings).toBe('object');
    });

    it('should return default settings', async () => {
      const response = await apiRequest('/settings');
      const data = await response.json();
      const settings = data.settings;
      
      // Check for default settings
      expect(settings).toHaveProperty('theme');
      expect(settings).toHaveProperty('language');
      expect(settings).toHaveProperty('notifications');
      expect(settings).toHaveProperty('autoSave');
      
      // Check default values
      expect(settings.theme).toBe('light');
      expect(settings.language).toBe('en');
      expect(settings.notifications).toBe(true);
      expect(settings.autoSave).toBe(true);
    });

    it('should return consistent settings', async () => {
      const response1 = await apiRequest('/settings');
      const response2 = await apiRequest('/settings');
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.settings).toEqual(data2.settings);
    });

    it('should return settings with correct data types', async () => {
      const response = await apiRequest('/settings');
      const data = await response.json();
      const settings = data.settings;
      
      expect(typeof settings.theme).toBe('string');
      expect(typeof settings.language).toBe('string');
      expect(typeof settings.notifications).toBe('boolean');
      expect(typeof settings.autoSave).toBe('boolean');
    });
  });

  describe('PUT /api/settings', () => {
    it('should update settings with valid data', async () => {
      const newSettings = {
        theme: 'dark',
        language: 'es',
        notifications: false,
        autoSave: false,
      };

      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: newSettings,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('settings');
      expect(data.message).toBe('Settings updated successfully');
      
      // Check that settings were updated
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('es');
      expect(data.settings.notifications).toBe(false);
      expect(data.settings.autoSave).toBe(false);
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

      // Get settings and verify they were persisted
      const response = await apiRequest('/settings');
      const data = await response.json();
      
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('fr');
    });

    it('should update partial settings', async () => {
      // Update only theme
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'high-contrast',
          },
        }),
      });

      // Get settings and verify only theme was updated
      const response = await apiRequest('/settings');
      const data = await response.json();
      
      expect(data.settings.theme).toBe('high-contrast');
      // Other settings should remain unchanged
      expect(data.settings.language).toBe('en');
      expect(data.settings.notifications).toBe(true);
      expect(data.settings.autoSave).toBe(true);
    });

    it('should handle multiple settings updates', async () => {
      // First update
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            notifications: false,
          },
        }),
      });

      // Second update
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            language: 'de',
            autoSave: false,
          },
        }),
      });

      // Verify both updates were applied
      const response = await apiRequest('/settings');
      const data = await response.json();
      
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('de');
      expect(data.settings.notifications).toBe(false);
      expect(data.settings.autoSave).toBe(false);
    });

    it('should return 400 for invalid request body', async () => {
      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Settings object is required');
    });

    it('should return 400 for non-object settings', async () => {
      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: 'invalid',
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Settings object is required');
    });

    it('should handle empty settings object', async () => {
      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {},
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Settings updated successfully');
    });

    it('should handle new settings properties', async () => {
      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            newProperty: 'newValue',
            anotherProperty: 123,
          },
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.newProperty).toBe('newValue');
      expect(data.settings.anotherProperty).toBe(123);
    });
  });

  describe('Settings Integration', () => {
    it('should maintain settings across multiple operations', async () => {
      // Set initial settings
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            language: 'es',
            notifications: false,
          },
        }),
      });

      // Perform other operations (register user, upload file)
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'settings-test@example.com',
          password: 'password123',
          name: 'Settings Test User',
        }),
      });

      await apiRequest('/files/upload', {
        method: 'POST',
        body: JSON.stringify({
          name: 'settings-test.txt',
          type: 'document',
          size: 100,
          url: '/uploads/settings-test.txt',
        }),
      });

      // Verify settings are still intact
      const response = await apiRequest('/settings');
      const data = await response.json();
      
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('es');
      expect(data.settings.notifications).toBe(false);
    });

    it('should handle concurrent settings updates', async () => {
      const updates = [
        { theme: 'dark' },
        { language: 'fr' },
        { notifications: false },
        { autoSave: false },
      ];

      const updatePromises = updates.map(settings =>
        apiRequest('/settings', {
          method: 'PUT',
          body: JSON.stringify({ settings }),
        })
      );

      const responses = await Promise.all(updatePromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify final state
      const finalResponse = await apiRequest('/settings');
      const finalData = await finalResponse.json();
      
      expect(finalData.settings.theme).toBe('dark');
      expect(finalData.settings.language).toBe('fr');
      expect(finalData.settings.notifications).toBe(false);
      expect(finalData.settings.autoSave).toBe(false);
    });

    it('should handle settings with various data types', async () => {
      const complexSettings = {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoSave: false,
        numericSetting: 42,
        arraySetting: ['item1', 'item2', 'item3'],
        objectSetting: {
          nested: 'value',
          number: 123,
        },
        booleanSetting: true,
        stringSetting: 'test string',
      };

      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: complexSettings,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Verify all settings were stored correctly
      expect(data.settings.theme).toBe('dark');
      expect(data.settings.language).toBe('en');
      expect(data.settings.notifications).toBe(true);
      expect(data.settings.autoSave).toBe(false);
      expect(data.settings.numericSetting).toBe(42);
      expect(data.settings.arraySetting).toEqual(['item1', 'item2', 'item3']);
      expect(data.settings.objectSetting).toEqual({
        nested: 'value',
        number: 123,
      });
      expect(data.settings.booleanSetting).toBe(true);
      expect(data.settings.stringSetting).toBe('test string');
    });

    it('should reset to defaults when server restarts', async () => {
      // Update settings
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            theme: 'dark',
            language: 'fr',
            notifications: false,
          },
        }),
      });

      // Simulate server restart by clearing data
      const testServer = getTestServer();
      testServer.clearData();

      // Get settings after "restart"
      const response = await apiRequest('/settings');
      const data = await response.json();
      
      // Should be back to defaults
      expect(data.settings.theme).toBe('light');
      expect(data.settings.language).toBe('en');
      expect(data.settings.notifications).toBe(true);
      expect(data.settings.autoSave).toBe(true);
    });
  });
});
