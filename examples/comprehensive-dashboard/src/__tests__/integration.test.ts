/**
 * Integration Tests for Comprehensive Dashboard Backend
 *
 * Tests the complete workflow and integration between different API endpoints
 */

import { describe, it, expect } from "vitest";
import { apiRequest, getTestServer } from "../../test-setup";

describe("Backend Integration Tests", () => {
  describe("Complete User Workflow", () => {
    it("should handle complete user registration and dashboard access", async () => {
      // 1. Register a new user
      const registerResponse = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "integration@example.com",
          password: "password123",
          name: "Integration Test User",
        }),
      });

      expect(registerResponse.status).toBe(201);
      const registerData = await registerResponse.json();
      const { accessToken, user } = registerData;

      // 2. Get user profile
      const profileResponse = await apiRequest("/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      const profileData = await profileResponse.json();
      expect(profileData.user.id).toBe(user.id);

      // 3. Access dashboard data
      const [statsResponse, chartsResponse, activityResponse] = await Promise.all([
        apiRequest("/dashboard/stats"),
        apiRequest("/dashboard/charts"),
        apiRequest("/dashboard/activity"),
      ]);

      expect(statsResponse.status).toBe(200);
      expect(chartsResponse.status).toBe(200);
      expect(activityResponse.status).toBe(200);

      // 4. Get and update settings
      const getSettingsResponse = await apiRequest("/settings");
      expect(getSettingsResponse.status).toBe(200);

      const updateSettingsResponse = await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: {
            theme: "dark",
            language: "en",
          },
        }),
      });

      expect(updateSettingsResponse.status).toBe(200);

      // 5. Upload a file
      const uploadResponse = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "integration-test.txt",
          type: "document",
          size: 1024,
          url: "/uploads/integration-test.txt",
        }),
      });

      expect(uploadResponse.status).toBe(201);

      // 6. Verify file appears in list
      const filesResponse = await apiRequest("/files");
      expect(filesResponse.status).toBe(200);
      const filesData = await filesResponse.json();
      const uploadedFile = filesData.files.find((f: any) => f.name === "integration-test.txt");
      expect(uploadedFile).toBeDefined();

      // 7. Verify activity was recorded
      const updatedActivityResponse = await apiRequest("/dashboard/activity");
      expect(updatedActivityResponse.status).toBe(200);
      const updatedActivityData = await updatedActivityResponse.json();
      const uploadActivity = updatedActivityData.activities.find(
        (a: any) => a.action === "Uploaded file" && a.details?.fileName === "integration-test.txt"
      );
      expect(uploadActivity).toBeDefined();
    });

    it("should handle multiple users with isolated data", async () => {
      // Register two users
      const user1Response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "user1@example.com",
          password: "password123",
          name: "User One",
        }),
      });

      const user2Response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "user2@example.com",
          password: "password123",
          name: "User Two",
        }),
      });

      expect(user1Response.status).toBe(201);
      expect(user2Response.status).toBe(201);

      const user1Data = await user1Response.json();
      const user2Data = await user2Response.json();

      // Each user should have different IDs
      expect(user1Data.user.id).not.toBe(user2Data.user.id);

      // Upload files for each user
      await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "user1-file.txt",
          type: "document",
          size: 100,
          url: "/uploads/user1-file.txt",
        }),
      });

      await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "user2-file.txt",
          type: "document",
          size: 200,
          url: "/uploads/user2-file.txt",
        }),
      });

      // Verify both files exist
      const filesResponse = await apiRequest("/files");
      const filesData = await filesResponse.json();

      const user1File = filesData.files.find((f: any) => f.name === "user1-file.txt");
      const user2File = filesData.files.find((f: any) => f.name === "user2-file.txt");

      expect(user1File).toBeDefined();
      expect(user2File).toBeDefined();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed JSON requests", async () => {
      const response = await fetch("http://localhost:15383/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      expect(response.status).toBe(500);
    });

    it("should handle missing endpoints gracefully", async () => {
      const response = await apiRequest("/nonexistent-endpoint");
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Endpoint not found");
    });

    it("should handle CORS preflight requests", async () => {
      const response = await fetch("http://localhost:15383/api/auth/login", {
        method: "OPTIONS",
        headers: {
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });

    it("should handle large request bodies", async () => {
      const largeSettings = {
        theme: "dark",
        largeData: "x".repeat(10000), // 10KB string
      };

      const response = await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: largeSettings,
        }),
      });

      expect(response.status).toBe(200);
    });

    it("should handle concurrent requests without data corruption", async () => {
      const concurrentRequests = Array(20)
        .fill(null)
        .map((_, index) =>
          apiRequest("/files/upload", {
            method: "POST",
            body: JSON.stringify({
              name: `concurrent-${index}.txt`,
              type: "document",
              size: 100,
              url: `/uploads/concurrent-${index}.txt`,
            }),
          })
        );

      const responses = await Promise.all(concurrentRequests);

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all files were created
      const filesResponse = await apiRequest("/files");
      const filesData = await filesResponse.json();

      for (let i = 0; i < 20; i++) {
        const file = filesData.files.find((f: any) => f.name === `concurrent-${i}.txt`);
        expect(file).toBeDefined();
      }
    });
  });

  describe("Performance and Load Testing", () => {
    it("should handle rapid sequential requests", async () => {
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const response = await apiRequest("/dashboard/stats");
        expect(response.status).toBe(200);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 50 requests in reasonable time (less than 10 seconds)
      expect(duration).toBeLessThan(10000);
    });

    it("should maintain response consistency under load", async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => apiRequest("/dashboard/charts"));

      const responses = await Promise.all(requests);
      const dataSets = await Promise.all(responses.map(response => response.json()));

      // All responses should be identical
      dataSets.forEach((data, index) => {
        if (index > 0) {
          expect(data.charts).toEqual(dataSets[0].charts);
        }
      });
    });

    it("should handle mixed request types efficiently", async () => {
      const mixedRequests = [
        apiRequest("/dashboard/stats"),
        apiRequest("/dashboard/charts"),
        apiRequest("/dashboard/activity"),
        apiRequest("/files"),
        apiRequest("/settings"),
        apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: "load-test@example.com",
            password: "password123",
          }),
        }),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(mixedRequests);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });

      // Should complete all requests quickly
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data consistency across operations", async () => {
      // Get initial state
      const [initialStats, initialFiles, initialSettings] = await Promise.all([
        apiRequest("/dashboard/stats").then(r => r.json()),
        apiRequest("/files").then(r => r.json()),
        apiRequest("/settings").then(r => r.json()),
      ]);

      // Perform operations
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "consistency@example.com",
          password: "password123",
          name: "Consistency Test",
        }),
      });

      await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "consistency-test.txt",
          type: "document",
          size: 100,
          url: "/uploads/consistency-test.txt",
        }),
      });

      await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: { theme: "dark" },
        }),
      });

      // Verify changes
      const [finalStats, finalFiles, finalSettings] = await Promise.all([
        apiRequest("/dashboard/stats").then(r => r.json()),
        apiRequest("/files").then(r => r.json()),
        apiRequest("/settings").then(r => r.json()),
      ]);

      // User count should have increased
      expect(finalStats.stats.totalUsers).toBe(initialStats.stats.totalUsers + 1);

      // File count should have increased
      expect(finalFiles.files.length).toBe(initialFiles.files.length + 1);

      // Settings should have changed
      expect(finalSettings.settings.theme).toBe("dark");
      expect(initialSettings.settings.theme).toBe("light");
    });

    it("should handle server restart simulation", async () => {
      // Set some data
      await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: {
            theme: "dark",
            language: "fr",
            customSetting: "test",
          },
        }),
      });

      await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "before-restart.txt",
          type: "document",
          size: 100,
          url: "/uploads/before-restart.txt",
        }),
      });

      // Simulate server restart
      const testServer = await getTestServer();
      testServer.clearData();

      // Verify data was reset
      const [settingsResponse, filesResponse] = await Promise.all([apiRequest("/settings"), apiRequest("/files")]);

      const settingsData = await settingsResponse.json();
      const filesData = await filesResponse.json();

      // Settings should be back to defaults
      expect(settingsData.settings.theme).toBe("light");
      expect(settingsData.settings.language).toBe("en");
      expect(settingsData.settings.customSetting).toBeUndefined();

      // Files should be back to defaults (no uploaded file)
      const uploadedFile = filesData.files.find((f: any) => f.name === "before-restart.txt");
      expect(uploadedFile).toBeUndefined();
    });
  });
});
