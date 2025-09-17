/**
 * Custom assertion utilities for testing
 */
/**
 * Assert that a component renders without errors
 */
export declare function expectComponentToRender(component: () => any): void;
/**
 * Assert that a component throws a specific error
 */
export declare function expectComponentToThrow(component: () => any, expectedError?: string | RegExp | Error): void;
/**
 * Assert that a promise resolves
 */
export declare function expectPromiseToResolve<T>(promise: Promise<T>, expectedValue?: T): Promise<T>;
/**
 * Assert that a promise rejects
 */
export declare function expectPromiseToReject(promise: Promise<any>, expectedError?: string | RegExp | Error): Promise<any>;
/**
 * Assert that a function is called with specific arguments
 */
export declare function expectFunctionToBeCalledWith(mockFn: any, ...expectedArgs: any[]): void;
/**
 * Assert that a function is called a specific number of times
 */
export declare function expectFunctionToBeCalledTimes(mockFn: any, times: number): void;
/**
 * Assert that a function is not called
 */
export declare function expectFunctionNotToBeCalled(mockFn: any): void;
/**
 * Assert that a function is called at least once
 */
export declare function expectFunctionToBeCalled(mockFn: any): void;
/**
 * Assert that a value is within a range
 */
export declare function expectValueToBeInRange(value: number, min: number, max: number): void;
/**
 * Assert that a value is approximately equal to another value
 */
export declare function expectValueToBeApproximately(actual: number, expected: number, precision?: number): void;
/**
 * Assert that an array contains specific items
 */
export declare function expectArrayToContain<T>(array: T[], ...items: T[]): void;
/**
 * Assert that an array has a specific length
 */
export declare function expectArrayToHaveLength<T>(array: T[], length: number): void;
/**
 * Assert that an object has specific properties
 */
export declare function expectObjectToHaveProperties(obj: any, ...properties: string[]): void;
/**
 * Assert that an object has specific values
 */
export declare function expectObjectToHaveValues(obj: unknown, values: Record<string, unknown>): void;
/**
 * Assert that a string matches a pattern
 */
export declare function expectStringToMatch(str: string, pattern: string | RegExp): void;
/**
 * Assert that a string contains a substring
 */
export declare function expectStringToContain(str: string, substring: string): void;
/**
 * Assert that a DOM element has specific attributes
 */
export declare function expectElementToHaveAttributes(element: Element, attributes: Record<string, string>): void;
/**
 * Assert that a DOM element has specific classes
 */
export declare function expectElementToHaveClasses(element: Element, ...classes: string[]): void;
/**
 * Assert that a DOM element has specific text content
 */
export declare function expectElementToHaveTextContent(element: Element, text: string): void;
/**
 * Assert that a DOM element is visible
 * Environment-aware implementation
 */
export declare function expectElementToBeVisible(element: Element): void;
/**
 * Assert that a DOM element is hidden
 * Environment-aware implementation
 */
export declare function expectElementToBeHidden(element: Element): void;
/**
 * Assert that a DOM element is in the document
 */
export declare function expectElementToBeInTheDocument(element: Element): void;
/**
 * Assert that a DOM element is not in the document
 */
export declare function expectElementNotToBeInTheDocument(element: Element): void;
/**
 * Assert that a DOM element is disabled
 */
export declare function expectElementToBeDisabled(element: Element): void;
/**
 * Assert that a DOM element is enabled
 */
export declare function expectElementToBeEnabled(element: Element): void;
/**
 * Assert that a DOM element is required
 */
export declare function expectElementToBeRequired(element: Element): void;
/**
 * Assert that a DOM element is not required
 */
export declare function expectElementNotToBeRequired(element: Element): void;
/**
 * Assert that a DOM element is valid
 */
export declare function expectElementToBeValid(element: Element): void;
/**
 * Assert that a DOM element is invalid
 */
export declare function expectElementToBeInvalid(element: Element): void;
/**
 * Assert that a DOM element has focus
 * Environment-aware implementation
 */
export declare function expectElementToHaveFocus(element: Element): void;
/**
 * Assert that a DOM element does not have focus
 * Environment-aware implementation
 */
export declare function expectElementNotToHaveFocus(element: Element): void;
/**
 * Assert that a DOM element is checked
 */
export declare function expectElementToBeChecked(element: Element): void;
/**
 * Assert that a DOM element is not checked
 */
export declare function expectElementNotToBeChecked(element: Element): void;
/**
 * Assert that a DOM element is partially checked
 */
export declare function expectElementToBePartiallyChecked(element: Element): void;
/**
 * Assert that a DOM element has a specific role
 */
export declare function expectElementToHaveRole(element: Element, role: string): void;
/**
 * Assert that a DOM element has a specific accessible name
 */
export declare function expectElementToHaveAccessibleName(element: Element, name: string): void;
/**
 * Assert that a DOM element has a specific accessible description
 */
export declare function expectElementToHaveAccessibleDescription(element: Element, description: string): void;
