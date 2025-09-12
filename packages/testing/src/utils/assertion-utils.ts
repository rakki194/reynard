import { render } from "@solidjs/testing-library";
import { expect } from "vitest";

/**
 * Custom assertion utilities for testing
 */

/**
 * Assert that a component renders without errors
 */
export function expectComponentToRender(component: () => any) {
  expect(() => component()).not.toThrow();
}

/**
 * Assert that a component throws a specific error
 */
export function expectComponentToThrow(
  component: () => any,
  expectedError?: string | RegExp | Error,
) {
  if (expectedError) {
    expect(() => render(component)).toThrow(expectedError);
  } else {
    expect(() => render(component)).toThrow();
  }
}

/**
 * Assert that a promise resolves
 */
export async function expectPromiseToResolve<T>(
  promise: Promise<T>,
  expectedValue?: T,
): Promise<T> {
  const result = await expect(promise).resolves;
  if (expectedValue !== undefined) {
    expect(result).toEqual(expectedValue);
  }
  return result as T;
}

/**
 * Assert that a promise rejects
 */
export async function expectPromiseToReject(
  promise: Promise<any>,
  expectedError?: string | RegExp | Error,
): Promise<any> {
  if (expectedError) {
    return expect(promise).rejects.toThrow(expectedError);
  } else {
    return expect(promise).rejects;
  }
}

/**
 * Assert that a function is called with specific arguments
 */
export function expectFunctionToBeCalledWith(
  mockFn: any,
  ...expectedArgs: any[]
) {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
}

/**
 * Assert that a function is called a specific number of times
 */
export function expectFunctionToBeCalledTimes(mockFn: any, times: number) {
  expect(mockFn).toHaveBeenCalledTimes(times);
}

/**
 * Assert that a function is not called
 */
export function expectFunctionNotToBeCalled(mockFn: any) {
  expect(mockFn).not.toHaveBeenCalled();
}

/**
 * Assert that a function is called at least once
 */
export function expectFunctionToBeCalled(mockFn: any) {
  expect(mockFn).toHaveBeenCalled();
}

/**
 * Assert that a value is within a range
 */
export function expectValueToBeInRange(
  value: number,
  min: number,
  max: number,
) {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/**
 * Assert that a value is approximately equal to another value
 */
export function expectValueToBeApproximately(
  actual: number,
  expected: number,
  precision: number = 2,
) {
  expect(actual).toBeCloseTo(expected, precision);
}

/**
 * Assert that an array contains specific items
 */
export function expectArrayToContain<T>(array: T[], ...items: T[]) {
  items.forEach((item) => {
    expect(array).toContain(item);
  });
}

/**
 * Assert that an array has a specific length
 */
export function expectArrayToHaveLength<T>(array: T[], length: number) {
  expect(array).toHaveLength(length);
}

/**
 * Assert that an object has specific properties
 */
export function expectObjectToHaveProperties(
  obj: any,
  ...properties: string[]
) {
  properties.forEach((prop) => {
    expect(obj).toHaveProperty(prop);
  });
}

/**
 * Assert that an object has specific values
 */
export function expectObjectToHaveValues(
  obj: any,
  values: Record<string, any>,
) {
  Object.entries(values).forEach(([key, value]) => {
    expect(obj).toHaveProperty(key, value);
  });
}

/**
 * Assert that a string matches a pattern
 */
export function expectStringToMatch(str: string, pattern: string | RegExp) {
  expect(str).toMatch(pattern);
}

/**
 * Assert that a string contains a substring
 */
export function expectStringToContain(str: string, substring: string) {
  expect(str).toContain(substring);
}

/**
 * Assert that a DOM element has specific attributes
 */
export function expectElementToHaveAttributes(
  element: Element,
  attributes: Record<string, string>,
) {
  Object.entries(attributes).forEach(([name, value]) => {
    expect(element.getAttribute(name)).toBe(value);
  });
}

/**
 * Assert that a DOM element has specific classes
 */
export function expectElementToHaveClasses(
  element: Element,
  ...classes: string[]
) {
  classes.forEach((className) => {
    expect(element.classList.contains(className)).toBe(true);
  });
}

/**
 * Assert that a DOM element has specific text content
 */
export function expectElementToHaveTextContent(element: Element, text: string) {
  expect(element.textContent).toBe(text);
}

/**
 * Assert that a DOM element is visible
 */
export function expectElementToBeVisible(element: Element) {
  const style = window.getComputedStyle(element);
  expect(style.display).not.toBe("none");
  expect(style.visibility).not.toBe("hidden");
  expect(style.opacity).not.toBe("0");
}

/**
 * Assert that a DOM element is hidden
 */
export function expectElementToBeHidden(element: Element) {
  const style = window.getComputedStyle(element);
  expect(style.display).toBe("none");
}

/**
 * Assert that a DOM element is in the document
 */
export function expectElementToBeInTheDocument(element: Element) {
  expect(document.contains(element)).toBe(true);
}

/**
 * Assert that a DOM element is not in the document
 */
export function expectElementNotToBeInTheDocument(element: Element) {
  expect(document.contains(element)).toBe(false);
}

/**
 * Assert that a DOM element is disabled
 */
export function expectElementToBeDisabled(element: Element) {
  expect((element as HTMLInputElement).disabled).toBe(true);
}

/**
 * Assert that a DOM element is enabled
 */
export function expectElementToBeEnabled(element: Element) {
  expect((element as HTMLInputElement).disabled).toBe(false);
}

/**
 * Assert that a DOM element is required
 */
export function expectElementToBeRequired(element: Element) {
  expect((element as HTMLInputElement).required).toBe(true);
}

/**
 * Assert that a DOM element is not required
 */
export function expectElementNotToBeRequired(element: Element) {
  expect((element as HTMLInputElement).required).toBe(false);
}

/**
 * Assert that a DOM element is valid
 */
export function expectElementToBeValid(element: Element) {
  expect((element as HTMLInputElement).validity.valid).toBe(true);
}

/**
 * Assert that a DOM element is invalid
 */
export function expectElementToBeInvalid(element: Element) {
  expect((element as HTMLInputElement).validity.valid).toBe(false);
}

/**
 * Assert that a DOM element has focus
 */
export function expectElementToHaveFocus(element: Element) {
  expect(document.activeElement).toBe(element);
}

/**
 * Assert that a DOM element does not have focus
 */
export function expectElementNotToHaveFocus(element: Element) {
  expect(document.activeElement).not.toBe(element);
}

/**
 * Assert that a DOM element is checked
 */
export function expectElementToBeChecked(element: Element) {
  expect((element as HTMLInputElement).checked).toBe(true);
}

/**
 * Assert that a DOM element is not checked
 */
export function expectElementNotToBeChecked(element: Element) {
  expect((element as HTMLInputElement).checked).toBe(false);
}

/**
 * Assert that a DOM element is partially checked
 */
export function expectElementToBePartiallyChecked(element: Element) {
  expect((element as HTMLInputElement).indeterminate).toBe(true);
}

/**
 * Assert that a DOM element has a specific role
 */
export function expectElementToHaveRole(element: Element, role: string) {
  expect(element.getAttribute("role")).toBe(role);
}

/**
 * Assert that a DOM element has a specific accessible name
 */
export function expectElementToHaveAccessibleName(
  element: Element,
  name: string,
) {
  // For happy-dom, we'll check aria-label or text content as fallback
  const ariaLabel = element.getAttribute("aria-label");
  const textContent = element.textContent?.trim();
  expect(ariaLabel || textContent).toBe(name);
}

/**
 * Assert that a DOM element has a specific accessible description
 */
export function expectElementToHaveAccessibleDescription(
  element: Element,
  description: string,
) {
  // For happy-dom, we'll check aria-describedby or title attribute
  const ariaDescribedBy = element.getAttribute("aria-describedby");
  const title = element.getAttribute("title");
  expect(ariaDescribedBy || title).toBe(description);
}
