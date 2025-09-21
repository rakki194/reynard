/**
 * Test file for docstring analyzer - this module has good documentation.
 * 
 * This module demonstrates proper JSDoc documentation practices
 * for TypeScript code analysis.
 */

/**
 * A well-documented function with proper JSDoc.
 * 
 * @param param1 - A string parameter
 * @param param2 - A number parameter
 * @returns A formatted string combining both parameters
 * 
 * @example
 * ```typescript
 * const result = documentedFunction("hello", 42);
 * console.log(result); // "hello-42"
 * ```
 */
export function documentedFunction(param1: string, param2: number): string {
  return `${param1}-${param2}`;
}

/**
 * Function with minimal documentation
 */
export function minimalFunction(): string {
  return "minimal docstring";
}

export function undocumentedFunction(): string {
  return "no docstring";
}

/**
 * A well-documented class with proper JSDoc.
 * 
 * This class demonstrates proper documentation practices
 * with detailed explanations of its purpose and usage.
 */
export class DocumentedClass {
  private value: number;

  /**
   * Initialize the class with a value.
   * 
   * @param value - The initial value
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Get the current value.
   * 
   * @returns The current value
   */
  getValue(): number {
    return this.value;
  }

  methodWithoutDocstring(): number {
    return this.value * 2;
  }
}

export class UndocumentedClass {
  private value: number = 0;

  constructor() {
    this.value = 0;
  }
}
