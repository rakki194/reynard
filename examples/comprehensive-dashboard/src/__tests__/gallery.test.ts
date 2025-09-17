/**
 * Gallery/File Management API Tests
 *
 * Tests file management endpoints:
 * - GET /api/files (list files)
 * - POST /api/files/upload (upload file)
 */

import { describe, it, expect } from "vitest";
import { apiRequest } from "../../test-setup";

describe("Gallery/File Management API", () => {
  describe("GET /api/files", () => {
    it("should return list of files", async () => {
      const response = await apiRequest("/files");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("files");
      expect(Array.isArray(data.files)).toBe(true);

      // Check that files have required properties
      if (data.files.length > 0) {
        const file = data.files[0];
        expect(file).toHaveProperty("id");
        expect(file).toHaveProperty("name");
        expect(file).toHaveProperty("type");
        expect(file).toHaveProperty("size");
        expect(file).toHaveProperty("url");
        expect(file).toHaveProperty("uploadedAt");
        expect(file).toHaveProperty("uploadedBy");
      }
    });

    it("should return files with correct structure", async () => {
      const response = await apiRequest("/files");
      const data = await response.json();

      data.files.forEach((file: any) => {
        expect(typeof file.id).toBe("string");
        expect(typeof file.name).toBe("string");
        expect(typeof file.type).toBe("string");
        expect(typeof file.size).toBe("number");
        expect(typeof file.url).toBe("string");
        expect(typeof file.uploadedAt).toBe("string");
        expect(typeof file.uploadedBy).toBe("string");

        // Validate file type
        expect(["image", "document", "video", "audio", "other"]).toContain(file.type);

        // Validate size is non-negative
        expect(file.size).toBeGreaterThanOrEqual(0);

        // Validate date format
        expect(() => new Date(file.uploadedAt)).not.toThrow();
      });
    });

    it("should return consistent file list", async () => {
      const response1 = await apiRequest("/files");
      const response2 = await apiRequest("/files");

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.files.length).toBe(data2.files.length);
      expect(data1.files).toEqual(data2.files);
    });
  });

  describe("POST /api/files/upload", () => {
    it("should upload a file with minimal data", async () => {
      const response = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "test-file.txt",
          type: "document",
          size: 1024,
          url: "/uploads/test-file.txt",
        }),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty("file");

      const file = data.file;
      expect(file).toHaveProperty("id");
      expect(file.name).toBe("test-file.txt");
      expect(file.type).toBe("document");
      expect(file.size).toBe(1024);
      expect(file.url).toBe("/uploads/test-file.txt");
      expect(file).toHaveProperty("uploadedAt");
      expect(file).toHaveProperty("uploadedBy");
    });

    it("should upload a file with all properties", async () => {
      const response = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "image.jpg",
          type: "image",
          size: 2048000,
          url: "/uploads/image.jpg",
          thumbnail: "/uploads/thumbs/image.jpg",
        }),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      const file = data.file;

      expect(file.name).toBe("image.jpg");
      expect(file.type).toBe("image");
      expect(file.size).toBe(2048000);
      expect(file.url).toBe("/uploads/image.jpg");
      expect(file.thumbnail).toBe("/uploads/thumbs/image.jpg");
    });

    it("should handle upload with default values", async () => {
      const response = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      const file = data.file;

      expect(file.name).toBe("uploaded-file");
      expect(file.type).toBe("other");
      expect(file.size).toBe(0);
      expect(file.url).toBe("/uploads/uploaded-file");
    });

    it("should create activity when file is uploaded", async () => {
      // Get initial activity count
      const initialResponse = await apiRequest("/dashboard/activity");
      const initialData = await initialResponse.json();
      const initialCount = initialData.activities.length;

      // Upload a file
      await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "activity-test.txt",
          type: "document",
          size: 512,
          url: "/uploads/activity-test.txt",
        }),
      });

      // Check that activity was added
      const activityResponse = await apiRequest("/dashboard/activity");
      const activityData = await activityResponse.json();

      expect(activityData.activities.length).toBe(initialCount + 1);

      const newActivity = activityData.activities[0]; // Should be most recent
      expect(newActivity.action).toBe("Uploaded file");
      expect(newActivity.user).toBe("Current User");
      expect(newActivity.details).toHaveProperty("fileName");
      expect(newActivity.details.fileName).toBe("activity-test.txt");
    });

    it("should generate unique IDs for uploaded files", async () => {
      const response1 = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "file1.txt",
          type: "document",
          size: 100,
          url: "/uploads/file1.txt",
        }),
      });

      const response2 = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "file2.txt",
          type: "document",
          size: 200,
          url: "/uploads/file2.txt",
        }),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.file.id).not.toBe(data2.file.id);
    });

    it("should add uploaded files to file list", async () => {
      // Get initial file count
      const initialResponse = await apiRequest("/files");
      const initialData = await initialResponse.json();
      const initialCount = initialData.files.length;

      // Upload a file
      const uploadResponse = await apiRequest("/files/upload", {
        method: "POST",
        body: JSON.stringify({
          name: "list-test.txt",
          type: "document",
          size: 256,
          url: "/uploads/list-test.txt",
        }),
      });

      const uploadData = await uploadResponse.json();
      const uploadedFileId = uploadData.file.id;

      // Check that file appears in list
      const listResponse = await apiRequest("/files");
      const listData = await listResponse.json();

      expect(listData.files.length).toBe(initialCount + 1);

      const uploadedFile = listData.files.find((f: any) => f.id === uploadedFileId);
      expect(uploadedFile).toBeDefined();
      expect(uploadedFile.name).toBe("list-test.txt");
    });
  });

  describe("File Management Integration", () => {
    it("should handle multiple file uploads", async () => {
      const files = [
        { name: "doc1.pdf", type: "document", size: 1024000 },
        { name: "img1.jpg", type: "image", size: 2048000 },
        { name: "vid1.mp4", type: "video", size: 10240000 },
        { name: "aud1.mp3", type: "audio", size: 512000 },
      ];

      const uploadPromises = files.map(file =>
        apiRequest("/files/upload", {
          method: "POST",
          body: JSON.stringify({
            ...file,
            url: `/uploads/${file.name}`,
          }),
        })
      );

      const responses = await Promise.all(uploadPromises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all files are in the list
      const listResponse = await apiRequest("/files");
      const listData = await listResponse.json();

      files.forEach(file => {
        const foundFile = listData.files.find((f: any) => f.name === file.name);
        expect(foundFile).toBeDefined();
        expect(foundFile.type).toBe(file.type);
        expect(foundFile.size).toBe(file.size);
      });
    });

    it("should maintain file list consistency", async () => {
      // Upload several files
      for (let i = 0; i < 5; i++) {
        await apiRequest("/files/upload", {
          method: "POST",
          body: JSON.stringify({
            name: `consistency-test-${i}.txt`,
            type: "document",
            size: 100 + i * 100,
            url: `/uploads/consistency-test-${i}.txt`,
          }),
        });
      }

      // Get file list multiple times
      const responses = await Promise.all([apiRequest("/files"), apiRequest("/files"), apiRequest("/files")]);

      const dataSets = await Promise.all(responses.map(response => response.json()));

      // All responses should be identical
      dataSets.forEach((data, index) => {
        if (index > 0) {
          expect(data.files).toEqual(dataSets[0].files);
        }
      });
    });
  });
});
