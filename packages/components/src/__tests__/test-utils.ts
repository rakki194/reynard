/**
 * Test Utilities for Reynard Components
 * Provides jest-dom-like functionality using happy-dom and reynard-testing
 */

import { expect } from 'vitest';

/**
 * Custom matchers that replace jest-dom functionality
 */
export const customMatchers = {
  /**
   * Check if element is in the document
   */
  toBeInTheDocument: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be in the document, but it was null',
        pass: false,
      };
    }
    const pass = document.contains(element);
    return {
      message: () => pass 
        ? 'Expected element not to be in the document' 
        : 'Expected element to be in the document',
      pass,
    };
  },

  /**
   * Check if element has a specific class
   */
  toHaveClass: (element: Element | null, className: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have class "${className}", but element was null`,
        pass: false,
      };
    }
    const pass = element.classList.contains(className);
    return {
      message: () => pass 
        ? `Expected element not to have class "${className}"` 
        : `Expected element to have class "${className}"`,
      pass,
    };
  },

  /**
   * Check if element has a specific attribute
   */
  toHaveAttribute: (element: Element | null, attribute: string, value?: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have attribute "${attribute}", but element was null`,
        pass: false,
      };
    }
    const hasAttribute = element.hasAttribute(attribute);
    if (!hasAttribute) {
      return {
        message: () => `Expected element to have attribute "${attribute}"`,
        pass: false,
      };
    }
    if (value !== undefined) {
      const actualValue = element.getAttribute(attribute);
      const pass = actualValue === value;
      return {
        message: () => pass 
          ? `Expected element not to have attribute "${attribute}" with value "${value}"` 
          : `Expected element to have attribute "${attribute}" with value "${value}", but got "${actualValue}"`,
        pass,
      };
    }
    return {
      message: () => `Expected element not to have attribute "${attribute}"`,
      pass: true,
    };
  },

  /**
   * Check if element has a specific style property
   */
  toHaveStyle: (element: Element | null, styles: Record<string, string>) => {
    if (!element) {
      return {
        message: () => 'Expected element to have styles, but element was null',
        pass: false,
      };
    }
    
    const failedStyles: string[] = [];
    
    for (const [property, expectedValue] of Object.entries(styles)) {
      // First try to get from inline style attribute
      let actualValue = (element as HTMLElement).style.getPropertyValue(property);
      
      // If not found in inline styles, try computed style
      if (!actualValue) {
        const computedStyle = window.getComputedStyle(element);
        actualValue = computedStyle.getPropertyValue(property);
      }
      
      // For CSS custom properties, also check if they're set via style attribute
      if (!actualValue && property.startsWith('--')) {
        const styleAttr = element.getAttribute('style');
        if (styleAttr) {
          const match = styleAttr.match(new RegExp(`${property}\\s*:\\s*([^;]+)`));
          if (match) {
            actualValue = match[1].trim();
          }
        }
      }
      
      if (actualValue !== expectedValue) {
        failedStyles.push(`${property}: expected "${expectedValue}", got "${actualValue}"`);
      }
    }
    
    const pass = failedStyles.length === 0;
    return {
      message: () => pass 
        ? 'Expected element not to have these styles' 
        : `Expected element to have styles:\n${failedStyles.join('\n')}`,
      pass,
    };
  },

  /**
   * Check if element is disabled
   */
  toBeDisabled: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be disabled, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).disabled === true;
    return {
      message: () => pass 
        ? 'Expected element not to be disabled' 
        : 'Expected element to be disabled',
      pass,
    };
  },

  /**
   * Check if element is enabled
   */
  toBeEnabled: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be enabled, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).disabled === false;
    return {
      message: () => pass 
        ? 'Expected element not to be enabled' 
        : 'Expected element to be enabled',
      pass,
    };
  },

  /**
   * Check if element has focus
   */
  toHaveFocus: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to have focus, but element was null',
        pass: false,
      };
    }
    const pass = document.activeElement === element;
    return {
      message: () => pass 
        ? 'Expected element not to have focus' 
        : 'Expected element to have focus',
      pass,
    };
  },

  /**
   * Check if element is checked
   */
  toBeChecked: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be checked, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).checked === true;
    return {
      message: () => pass 
        ? 'Expected element not to be checked' 
        : 'Expected element to be checked',
      pass,
    };
  },

  /**
   * Check if element has a specific value
   */
  toHaveValue: (element: Element | null, value: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have value "${value}", but element was null`,
        pass: false,
      };
    }
    const actualValue = (element as HTMLInputElement).value;
    const pass = actualValue === value;
    return {
      message: () => pass 
        ? `Expected element not to have value "${value}"` 
        : `Expected element to have value "${value}", but got "${actualValue}"`,
      pass,
    };
  },

  /**
   * Check if element has a specific text content
   */
  toHaveTextContent: (element: Element | null, text: string | RegExp) => {
    if (!element) {
      return {
        message: () => `Expected element to have text content "${text}", but element was null`,
        pass: false,
      };
    }
    const actualText = element.textContent || '';
    const pass = typeof text === 'string' 
      ? actualText.includes(text)
      : text.test(actualText);
    return {
      message: () => pass 
        ? `Expected element not to have text content "${text}"` 
        : `Expected element to have text content "${text}", but got "${actualText}"`,
      pass,
    };
  },

  /**
   * Check if element has a specific display value
   */
  toHaveDisplayValue: (element: Element | null, value: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have display value "${value}", but element was null`,
        pass: false,
      };
    }
    const actualValue = (element as HTMLSelectElement).value;
    const pass = actualValue === value;
    return {
      message: () => pass 
        ? `Expected element not to have display value "${value}"` 
        : `Expected element to have display value "${value}", but got "${actualValue}"`,
      pass,
    };
  },

  /**
   * Check if element is partially checked (indeterminate)
   */
  toBePartiallyChecked: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be partially checked, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).indeterminate === true;
    return {
      message: () => pass 
        ? 'Expected element not to be partially checked' 
        : 'Expected element to be partially checked',
      pass,
    };
  },

  /**
   * Check if element is required
   */
  toBeRequired: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be required, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).required === true;
    return {
      message: () => pass 
        ? 'Expected element not to be required' 
        : 'Expected element to be required',
      pass,
    };
  },

  /**
   * Check if element is valid
   */
  toBeValid: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be valid, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).validity.valid === true;
    return {
      message: () => pass 
        ? 'Expected element not to be valid' 
        : 'Expected element to be valid',
      pass,
    };
  },

  /**
   * Check if element is invalid
   */
  toBeInvalid: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be invalid, but element was null',
        pass: false,
      };
    }
    const pass = (element as HTMLInputElement).validity.valid === false;
    return {
      message: () => pass 
        ? 'Expected element not to be invalid' 
        : 'Expected element to be invalid',
      pass,
    };
  },

  /**
   * Check if element is visible
   */
  toBeVisible: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be visible, but element was null',
        pass: false,
      };
    }
    const style = window.getComputedStyle(element);
    const pass = style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0';
    return {
      message: () => pass 
        ? 'Expected element not to be visible' 
        : 'Expected element to be visible',
      pass,
    };
  },

  /**
   * Check if element is empty
   */
  toBeEmptyDOMElement: (element: Element | null) => {
    if (!element) {
      return {
        message: () => 'Expected element to be empty, but element was null',
        pass: false,
      };
    }
    const pass = element.children.length === 0 && element.textContent?.trim() === '';
    return {
      message: () => pass 
        ? 'Expected element not to be empty' 
        : 'Expected element to be empty',
      pass,
    };
  },

  /**
   * Check if element has a specific form
   */
  toHaveFormValues: (element: Element | null, values: Record<string, unknown>) => {
    if (!element) {
      return {
        message: () => 'Expected element to have form values, but element was null',
        pass: false,
      };
    }
    const form = element.closest('form');
    if (!form) {
      return {
        message: () => 'Expected element to be inside a form',
        pass: false,
      };
    }
    
    const failedValues: string[] = [];
    for (const [name, expectedValue] of Object.entries(values)) {
      const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (!input) {
        failedValues.push(`No input found with name "${name}"`);
        continue;
      }
      const actualValue = input.value;
      if (actualValue !== expectedValue) {
        failedValues.push(`${name}: expected "${expectedValue}", got "${actualValue}"`);
      }
    }
    
    const pass = failedValues.length === 0;
    return {
      message: () => pass 
        ? 'Expected element not to have these form values' 
        : `Expected element to have form values:\n${failedValues.join('\n')}`,
      pass,
    };
  },

  /**
   * Check if element has a specific accessible name
   */
  toHaveAccessibleName: (element: Element | null, name: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have accessible name "${name}", but element was null`,
        pass: false,
      };
    }
    // Simple implementation - check aria-label or text content
    const ariaLabel = element.getAttribute('aria-label');
    const textContent = element.textContent?.trim();
    const actualName = ariaLabel || textContent || '';
    const pass = actualName === name;
    return {
      message: () => pass 
        ? `Expected element not to have accessible name "${name}"` 
        : `Expected element to have accessible name "${name}", but got "${actualName}"`,
      pass,
    };
  },

  /**
   * Check if element has a specific accessible description
   */
  toHaveAccessibleDescription: (element: Element | null, description: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have accessible description "${description}", but element was null`,
        pass: false,
      };
    }
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    const title = element.getAttribute('title');
    const actualDescription = ariaDescribedBy || title || '';
    const pass = actualDescription === description;
    return {
      message: () => pass 
        ? `Expected element not to have accessible description "${description}"` 
        : `Expected element to have accessible description "${description}", but got "${actualDescription}"`,
      pass,
    };
  },
};

/**
 * Extend expect with custom matchers
 */
export function extendExpect() {
  // Extend the expect function with our custom matchers
  Object.entries(customMatchers).forEach(([name, matcher]) => {
    (expect as any).extend({
      [name]: matcher,
    });
  });
}

/**
 * Helper function to check if element exists and is not null
 */
export function expectElementToExist(element: Element | null): asserts element is Element {
  expect(element).not.toBeNull();
  expect(element).toBeDefined();
}

/**
 * Helper function to get element by test id with better error messages
 */
export function getByTestId(container: Element, testId: string): Element {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Unable to find an element by: [data-testid="${testId}"]`);
  }
  return element;
}

/**
 * Helper function to get all elements by test id
 */
export function getAllByTestId(container: Element, testId: string): Element[] {
  const elements = Array.from(container.querySelectorAll(`[data-testid="${testId}"]`));
  if (elements.length === 0) {
    throw new Error(`Unable to find any elements by: [data-testid="${testId}"]`);
  }
  return elements;
}
