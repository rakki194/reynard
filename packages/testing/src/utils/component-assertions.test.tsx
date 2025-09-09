import { describe, it, expect, vi, beforeEach } from "vitest";
import { Component } from "solid-js";
import {
  expectComponentToRender,
  expectComponentToThrow,
} from "./assertion-utils";

describe("Component Assertions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("expectComponentToRender", () => {
    it("should not throw when component renders successfully", () => {
      const TestComponent: Component = () => <div>Hello World</div>;

      expect(() => {
        expectComponentToRender(() => TestComponent);
      }).not.toThrow();
    });

    it("should throw when component throws an error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Component error");
      };

      expect(() => {
        expectComponentToRender(() => ErrorComponent);
      }).toThrow("Component error");
    });
  });

  describe("expectComponentToThrow", () => {
    it("should not throw when component throws expected error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Expected error");
      };

      expect(() => {
        expectComponentToThrow(() => ErrorComponent, "Expected error");
      }).not.toThrow();
    });

    it("should throw when component does not throw", () => {
      const TestComponent: Component = () => <div>Hello World</div>;

      expect(() => {
        expectComponentToThrow(() => TestComponent, "Expected error");
      }).toThrow();
    });

    it("should work with regex patterns", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Expected error message");
      };

      expect(() => {
        expectComponentToThrow(() => ErrorComponent, /Expected error/);
      }).not.toThrow();
    });

    it("should work without expected error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Any error");
      };

      expect(() => {
        expectComponentToThrow(() => ErrorComponent);
      }).not.toThrow();
    });
  });
});
