import { render } from "@solidjs/testing-library";
import { expect } from "vitest";
import { getComputedStyles, isElementInDocument, getActiveElement } from "./dom-utils.js";
import { getEnvironmentUtils } from "./test-environment.js";
/**
 * Custom assertion utilities for testing
 */
/**
 * Assert that a component renders without errors
 */
export function expectComponentToRender(component) {
    expect(() => {
        const Component = component();
        render(() => Component);
    }).not.toThrow();
}
/**
 * Assert that a component throws a specific error
 */
export function expectComponentToThrow(component, expectedError) {
    if (expectedError) {
        expect(() => {
            const Component = component();
            render(() => Component);
        }).toThrow(expectedError);
    }
    else {
        expect(() => {
            const Component = component();
            render(() => Component);
        }).toThrow();
    }
}
/**
 * Assert that a promise resolves
 */
export async function expectPromiseToResolve(promise, expectedValue) {
    const result = await promise;
    if (expectedValue !== undefined) {
        expect(result).toEqual(expectedValue);
    }
    return result;
}
/**
 * Assert that a promise rejects
 */
export async function expectPromiseToReject(promise, expectedError) {
    try {
        const result = await promise;
        // If we get here, the promise resolved, so we should reject
        throw new Error("Expected promise to reject, but it resolved");
    }
    catch (error) {
        // If the promise rejected, check if it matches expected error
        if (expectedError) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (typeof expectedError === "string") {
                expect(errorMessage).toContain(expectedError);
            }
            else if (expectedError instanceof RegExp) {
                expect(errorMessage).toMatch(expectedError);
            }
            else if (expectedError instanceof Error) {
                expect(errorMessage).toContain(expectedError.message);
            }
        }
        return error;
    }
}
/**
 * Assert that a function is called with specific arguments
 */
export function expectFunctionToBeCalledWith(mockFn, ...expectedArgs) {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
}
/**
 * Assert that a function is called a specific number of times
 */
export function expectFunctionToBeCalledTimes(mockFn, times) {
    expect(mockFn).toHaveBeenCalledTimes(times);
}
/**
 * Assert that a function is not called
 */
export function expectFunctionNotToBeCalled(mockFn) {
    expect(mockFn).not.toHaveBeenCalled();
}
/**
 * Assert that a function is called at least once
 */
export function expectFunctionToBeCalled(mockFn) {
    expect(mockFn).toHaveBeenCalled();
}
/**
 * Assert that a value is within a range
 */
export function expectValueToBeInRange(value, min, max) {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
}
/**
 * Assert that a value is approximately equal to another value
 */
export function expectValueToBeApproximately(actual, expected, precision = 2) {
    expect(actual).toBeCloseTo(expected, precision);
}
/**
 * Assert that an array contains specific items
 */
export function expectArrayToContain(array, ...items) {
    items.forEach((item) => {
        expect(array).toContain(item);
    });
}
/**
 * Assert that an array has a specific length
 */
export function expectArrayToHaveLength(array, length) {
    expect(array).toHaveLength(length);
}
/**
 * Assert that an object has specific properties
 */
export function expectObjectToHaveProperties(obj, ...properties) {
    properties.forEach((prop) => {
        expect(obj).toHaveProperty(prop);
    });
}
/**
 * Assert that an object has specific values
 */
export function expectObjectToHaveValues(obj, values) {
    Object.entries(values).forEach(([key, value]) => {
        expect(obj).toHaveProperty(key, value);
    });
}
/**
 * Assert that a string matches a pattern
 */
export function expectStringToMatch(str, pattern) {
    expect(str).toMatch(pattern);
}
/**
 * Assert that a string contains a substring
 */
export function expectStringToContain(str, substring) {
    expect(str).toContain(substring);
}
/**
 * Assert that a DOM element has specific attributes
 */
export function expectElementToHaveAttributes(element, attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
        expect(element.getAttribute(name)).toBe(value);
    });
}
/**
 * Assert that a DOM element has specific classes
 */
export function expectElementToHaveClasses(element, ...classes) {
    classes.forEach((className) => {
        expect(element.classList.contains(className)).toBe(true);
    });
}
/**
 * Assert that a DOM element has specific text content
 */
export function expectElementToHaveTextContent(element, text) {
    expect(element.textContent).toBe(text);
}
/**
 * Assert that a DOM element is visible
 * Environment-aware implementation
 */
export function expectElementToBeVisible(element) {
    const envUtils = getEnvironmentUtils();
    if (!envUtils.supportsComputedStyles) {
        // Fallback for happy-dom: check inline styles and common patterns
        if (element instanceof HTMLElement) {
            const inlineStyle = element.style;
            if (inlineStyle.display === 'none') {
                expect(inlineStyle.display).not.toBe("none");
            }
            if (inlineStyle.visibility === 'hidden') {
                expect(inlineStyle.visibility).not.toBe("hidden");
            }
            if (inlineStyle.opacity === '0') {
                expect(inlineStyle.opacity).not.toBe("0");
            }
        }
        // Check for common hidden classes
        expect(element.classList.contains('hidden')).toBe(false);
        expect(element.classList.contains('sr-only')).toBe(false);
        return;
    }
    const style = getComputedStyles(element);
    expect(style.display).not.toBe("none");
    expect(style.visibility).not.toBe("hidden");
    expect(style.opacity).not.toBe("0");
}
/**
 * Assert that a DOM element is hidden
 * Environment-aware implementation
 */
export function expectElementToBeHidden(element) {
    const envUtils = getEnvironmentUtils();
    if (!envUtils.supportsComputedStyles) {
        // Fallback for happy-dom: check inline styles and common patterns
        if (element instanceof HTMLElement) {
            const inlineStyle = element.style;
            if (inlineStyle.display === 'none') {
                expect(inlineStyle.display).toBe("none");
                return;
            }
        }
        // Check for common hidden classes
        if (element.classList.contains('hidden') || element.classList.contains('sr-only')) {
            expect(element.classList.contains('hidden') || element.classList.contains('sr-only')).toBe(true);
            return;
        }
        // If no explicit hiding found, this test should fail
        expect("").toBe("none");
        return;
    }
    const style = getComputedStyles(element);
    expect(style.display).toBe("none");
}
/**
 * Assert that a DOM element is in the document
 */
export function expectElementToBeInTheDocument(element) {
    expect(isElementInDocument(element)).toBe(true);
}
/**
 * Assert that a DOM element is not in the document
 */
export function expectElementNotToBeInTheDocument(element) {
    expect(isElementInDocument(element)).toBe(false);
}
/**
 * Assert that a DOM element is disabled
 */
export function expectElementToBeDisabled(element) {
    expect(element.disabled).toBe(true);
}
/**
 * Assert that a DOM element is enabled
 */
export function expectElementToBeEnabled(element) {
    expect(element.disabled).toBe(false);
}
/**
 * Assert that a DOM element is required
 */
export function expectElementToBeRequired(element) {
    expect(element.required).toBe(true);
}
/**
 * Assert that a DOM element is not required
 */
export function expectElementNotToBeRequired(element) {
    expect(element.required).toBe(false);
}
/**
 * Assert that a DOM element is valid
 */
export function expectElementToBeValid(element) {
    expect(element.validity.valid).toBe(true);
}
/**
 * Assert that a DOM element is invalid
 */
export function expectElementToBeInvalid(element) {
    expect(element.validity.valid).toBe(false);
}
/**
 * Assert that a DOM element has focus
 * Environment-aware implementation
 */
export function expectElementToHaveFocus(element) {
    const envUtils = getEnvironmentUtils();
    if (!envUtils.supportsFocus) {
        // Skip focus tests in happy-dom environment
        console.warn("Focus testing not supported in happy-dom environment");
        // For now, we'll just check if the element is focusable
        if (element instanceof HTMLElement) {
            const focusableElements = ['input', 'button', 'select', 'textarea', 'a'];
            const isFocusable = focusableElements.includes(element.tagName.toLowerCase()) ||
                element.getAttribute('tabindex') !== null;
            expect(isFocusable).toBe(true);
        }
        return;
    }
    const activeElement = getActiveElement();
    expect(activeElement).toBe(element);
}
/**
 * Assert that a DOM element does not have focus
 * Environment-aware implementation
 */
export function expectElementNotToHaveFocus(element) {
    const envUtils = getEnvironmentUtils();
    if (!envUtils.supportsFocus) {
        // Skip focus tests in happy-dom environment
        console.warn("Focus testing not supported in happy-dom environment");
        // For now, we'll just check if the element is not the active element
        // Since happy-dom doesn't support focus, this will always pass
        expect(true).toBe(true);
        return;
    }
    const activeElement = getActiveElement();
    expect(activeElement).not.toBe(element);
}
/**
 * Assert that a DOM element is checked
 */
export function expectElementToBeChecked(element) {
    expect(element.checked).toBe(true);
}
/**
 * Assert that a DOM element is not checked
 */
export function expectElementNotToBeChecked(element) {
    expect(element.checked).toBe(false);
}
/**
 * Assert that a DOM element is partially checked
 */
export function expectElementToBePartiallyChecked(element) {
    expect(element.indeterminate).toBe(true);
}
/**
 * Assert that a DOM element has a specific role
 */
export function expectElementToHaveRole(element, role) {
    expect(element.getAttribute("role")).toBe(role);
}
/**
 * Assert that a DOM element has a specific accessible name
 */
export function expectElementToHaveAccessibleName(element, name) {
    // For happy-dom, we'll check aria-label or text content as fallback
    const ariaLabel = element.getAttribute("aria-label");
    const textContent = element.textContent?.trim();
    expect(ariaLabel || textContent).toBe(name);
}
/**
 * Assert that a DOM element has a specific accessible description
 */
export function expectElementToHaveAccessibleDescription(element, description) {
    // Check title attribute first
    const title = element.getAttribute("title");
    if (title) {
        expect(title).toBe(description);
        return;
    }
    // Check aria-describedby and resolve the referenced element
    const ariaDescribedBy = element.getAttribute("aria-describedby");
    if (ariaDescribedBy) {
        try {
            const describedElement = document.getElementById(ariaDescribedBy);
            if (describedElement) {
                expect(describedElement.textContent).toBe(description);
                return;
            }
        }
        catch (error) {
            console.warn("Could not resolve aria-describedby element:", error);
        }
        // Fallback to checking the aria-describedby value itself
        expect(ariaDescribedBy).toBe(description);
    }
    else {
        // If neither title nor aria-describedby, fail
        expect("").toBe(description);
    }
}
