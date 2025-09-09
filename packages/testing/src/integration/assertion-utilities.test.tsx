import { describe, it, expect, vi } from "vitest";
import { Component } from "solid-js";
import {
  expectComponentToRender,
  expectComponentToThrow,
  expectPromiseToResolve,
  expectPromiseToReject,
  expectFunctionToBeCalledWith,
  expectFunctionToBeCalledTimes,
  expectFunctionToBeCalled,
  expectValueToBeInRange,
  expectValueToBeApproximately,
  expectArrayToContain,
  expectArrayToHaveLength,
  expectObjectToHaveProperties,
  expectObjectToHaveValues,
  expectStringToMatch,
  expectStringToContain,
  expectElementToHaveAttributes,
  expectElementToHaveClasses,
  expectElementToHaveTextContent,
  expectElementToBeInTheDocument,
  expectElementToBeVisible,
} from "../index";

describe("Assertion Utilities Integration", () => {
  it("should work with component testing", () => {
    const TestComponent: Component = () => <div>Hello World</div>;
    const ErrorComponent: Component = () => {
      throw new Error("Component error");
    };

    expectComponentToRender(() => TestComponent);
    expectComponentToThrow(() => ErrorComponent, "Component error");
  });

  it("should work with promise testing", async () => {
    const successPromise = Promise.resolve("success");
    const errorPromise = Promise.reject(new Error("error"));

    await expectPromiseToResolve(successPromise, "success");
    await expectPromiseToReject(errorPromise, "error");
  });

  it("should work with function testing", () => {
    const mockFn = vi.fn();
    mockFn("arg1", "arg2");

    expectFunctionToBeCalledWith(mockFn, "arg1", "arg2");
    expectFunctionToBeCalledTimes(mockFn, 1);
    expectFunctionToBeCalled(mockFn);
  });

  it("should work with value testing", () => {
    expectValueToBeInRange(5, 1, 10);
    expectValueToBeApproximately(1.234, 1.235, 2);
  });

  it("should work with array testing", () => {
    const array = [1, 2, 3, 4, 5];
    expectArrayToContain(array, 2, 4);
    expectArrayToHaveLength(array, 5);
  });

  it("should work with object testing", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expectObjectToHaveProperties(obj, "a", "b");
    expectObjectToHaveValues(obj, { a: 1, b: 2 });
  });

  it("should work with string testing", () => {
    const str = "Hello World";
    expectStringToMatch(str, "Hello");
    expectStringToContain(str, "World");
  });

  it("should work with DOM element testing", () => {
    const element = document.createElement("div");
    element.setAttribute("id", "test");
    element.className = "test-class";
    element.textContent = "Hello World";
    document.body.appendChild(element);

    expectElementToHaveAttributes(element, { id: "test" });
    expectElementToHaveClasses(element, "test-class");
    expectElementToHaveTextContent(element, "Hello World");
    expectElementToBeInTheDocument(element);
    expectElementToBeVisible(element);
  });
});
