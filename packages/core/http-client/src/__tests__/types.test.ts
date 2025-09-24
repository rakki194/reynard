/**
 * Types Tests
 * Tests for type definitions and constants
 */

import { describe, it, expect } from "vitest";
import { HTTP_PRESETS } from "../types";

describe("HTTP Types", () => {
  describe("HTTP_PRESETS", () => {
    it("should have default preset", () => {
      expect(HTTP_PRESETS.default).toBeDefined();
      expect(HTTP_PRESETS.default.config).toBeDefined();
      expect(HTTP_PRESETS.default.config.timeout).toBe(30000);
      expect(HTTP_PRESETS.default.config.retries).toBe(3);
      expect(HTTP_PRESETS.default.config.enableRetry).toBe(true);
      expect(HTTP_PRESETS.default.config.enableCircuitBreaker).toBe(true);
      expect(HTTP_PRESETS.default.config.enableMetrics).toBe(true);
    });

    it("should have api preset", () => {
      expect(HTTP_PRESETS.api).toBeDefined();
      expect(HTTP_PRESETS.api.config).toBeDefined();
      expect(HTTP_PRESETS.api.config.timeout).toBe(10000);
      expect(HTTP_PRESETS.api.config.retries).toBe(2);
    });

    it("should have upload preset", () => {
      expect(HTTP_PRESETS.upload).toBeDefined();
      expect(HTTP_PRESETS.upload.config).toBeDefined();
      expect(HTTP_PRESETS.upload.config.timeout).toBe(300000);
      expect(HTTP_PRESETS.upload.config.retries).toBe(1);
    });

    it("should have download preset", () => {
      expect(HTTP_PRESETS.download).toBeDefined();
      expect(HTTP_PRESETS.download.config).toBeDefined();
      expect(HTTP_PRESETS.download.config.timeout).toBe(600000);
      expect(HTTP_PRESETS.download.config.retries).toBe(2);
    });
  });
});
