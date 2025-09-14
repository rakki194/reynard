/** @jsxImportSource solid-js */
import { Component } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  expectComponentToRender,
  expectComponentToThrow,
  } from "../utils/assertion-utils.js";

describe("Component Assertions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("expectComponentToRender", () => {
    it("should not throw when component renders successfully", () => {
      const TestComponent: Component = () => <div>Hello World</div>;

      expectComponentToRender(() => TestComponent);
    });

    it("should throw when component throws an error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Component error");
      };

      expect(() => {
        expectComponentToRender(() => ErrorComponent);
      }).toThrow();
    });
  });

  describe("expectComponentToThrow", () => {
    it("should not throw when component throws expected error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Expected error");
      };

      expectComponentToThrow(() => ErrorComponent, "Expected error");
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

      expectComponentToThrow(() => ErrorComponent, /Expected error/);
    });

    it("should work without expected error", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Any error");
      };

      expectComponentToThrow(() => ErrorComponent);
    });
  });
});
