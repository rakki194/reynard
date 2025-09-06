import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component } from 'solid-js';
import { render, screen } from '@solidjs/testing-library';
import {
  expectComponentToRender,
  expectComponentToThrow,
  expectPromiseToResolve,
  expectPromiseToReject,
  expectFunctionToBeCalledWith,
  expectFunctionToBeCalledTimes,
  expectFunctionNotToBeCalled,
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
  expectElementToBeVisible,
  expectElementToBeHidden,
  expectElementToBeInTheDocument,
  expectElementNotToBeInTheDocument,
  expectElementToBeDisabled,
  expectElementToBeEnabled,
  expectElementToBeRequired,
  expectElementNotToBeRequired,
  expectElementToBeValid,
  expectElementToBeInvalid,
  expectElementToHaveFocus,
  expectElementNotToHaveFocus,
  expectElementToBeChecked,
  expectElementNotToBeChecked,
  expectElementToBePartiallyChecked,
  expectElementToHaveRole,
  expectElementToHaveAccessibleName,
  expectElementToHaveAccessibleDescription,
} from './assertion-utils';

describe('Assertion Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Assertions', () => {
    describe('expectComponentToRender', () => {
      it('should not throw when component renders successfully', () => {
        const TestComponent: Component = () => <div>Hello World</div>;
        
        expect(() => {
          expectComponentToRender(TestComponent);
        }).not.toThrow();
      });

      it('should throw when component throws an error', () => {
        const ErrorComponent: Component = () => {
          throw new Error('Component error');
        };
        
        expect(() => {
          expectComponentToRender(ErrorComponent);
        }).toThrow('Component error');
      });
    });

    describe('expectComponentToThrow', () => {
      it('should not throw when component throws expected error', () => {
        const ErrorComponent: Component = () => {
          throw new Error('Expected error');
        };
        
        expect(() => {
          expectComponentToThrow(ErrorComponent, 'Expected error');
        }).not.toThrow();
      });

      it('should throw when component does not throw', () => {
        const TestComponent: Component = () => <div>Hello World</div>;
        
        expect(() => {
          expectComponentToThrow(TestComponent, 'Expected error');
        }).toThrow();
      });

      it('should work with regex patterns', () => {
        const ErrorComponent: Component = () => {
          throw new Error('Expected error message');
        };
        
        expect(() => {
          expectComponentToThrow(ErrorComponent, /Expected error/);
        }).not.toThrow();
      });

      it('should work without expected error', () => {
        const ErrorComponent: Component = () => {
          throw new Error('Any error');
        };
        
        expect(() => {
          expectComponentToThrow(ErrorComponent);
        }).not.toThrow();
      });
    });
  });

  describe('Promise Assertions', () => {
    describe('expectPromiseToResolve', () => {
      it('should resolve successfully', async () => {
        const promise = Promise.resolve('test value');
        
        const result = await expectPromiseToResolve(promise);
        expect(result).toBe('test value');
      });

      it('should resolve with expected value', async () => {
        const promise = Promise.resolve('expected');
        
        await expectPromiseToResolve(promise, 'expected');
      });

      it('should throw when promise rejects', async () => {
        const promise = Promise.reject(new Error('Rejected'));
        
        await expect(() => expectPromiseToResolve(promise)).rejects.toThrow();
      });
    });

    describe('expectPromiseToReject', () => {
      it('should reject successfully', async () => {
        const promise = Promise.reject(new Error('Expected error'));
        
        await expectPromiseToReject(promise);
      });

      it('should reject with expected error', async () => {
        const promise = Promise.reject(new Error('Expected error'));
        
        await expectPromiseToReject(promise, 'Expected error');
      });

      it('should throw when promise resolves', async () => {
        const promise = Promise.resolve('value');
        
        await expect(() => expectPromiseToReject(promise)).rejects.toThrow();
      });
    });
  });

  describe('Function Assertions', () => {
    describe('expectFunctionToBeCalledWith', () => {
      it('should pass when function is called with expected arguments', () => {
        const mockFn = vi.fn();
        mockFn('arg1', 'arg2');
        
        expectFunctionToBeCalledWith(mockFn, 'arg1', 'arg2');
      });

      it('should fail when function is not called with expected arguments', () => {
        const mockFn = vi.fn();
        mockFn('different', 'args');
        
        expect(() => {
          expectFunctionToBeCalledWith(mockFn, 'arg1', 'arg2');
        }).toThrow();
      });
    });

    describe('expectFunctionToBeCalledTimes', () => {
      it('should pass when function is called expected number of times', () => {
        const mockFn = vi.fn();
        mockFn();
        mockFn();
        
        expectFunctionToBeCalledTimes(mockFn, 2);
      });

      it('should fail when function is called wrong number of times', () => {
        const mockFn = vi.fn();
        mockFn();
        
        expect(() => {
          expectFunctionToBeCalledTimes(mockFn, 2);
        }).toThrow();
      });
    });

    describe('expectFunctionNotToBeCalled', () => {
      it('should pass when function is not called', () => {
        const mockFn = vi.fn();
        
        expectFunctionNotToBeCalled(mockFn);
      });

      it('should fail when function is called', () => {
        const mockFn = vi.fn();
        mockFn();
        
        expect(() => {
          expectFunctionNotToBeCalled(mockFn);
        }).toThrow();
      });
    });

    describe('expectFunctionToBeCalled', () => {
      it('should pass when function is called', () => {
        const mockFn = vi.fn();
        mockFn();
        
        expectFunctionToBeCalled(mockFn);
      });

      it('should fail when function is not called', () => {
        const mockFn = vi.fn();
        
        expect(() => {
          expectFunctionToBeCalled(mockFn);
        }).toThrow();
      });
    });
  });

  describe('Value Assertions', () => {
    describe('expectValueToBeInRange', () => {
      it('should pass when value is within range', () => {
        expectValueToBeInRange(5, 1, 10);
      });

      it('should pass when value is at range boundaries', () => {
        expectValueToBeInRange(1, 1, 10);
        expectValueToBeInRange(10, 1, 10);
      });

      it('should fail when value is below range', () => {
        expect(() => {
          expectValueToBeInRange(0, 1, 10);
        }).toThrow();
      });

      it('should fail when value is above range', () => {
        expect(() => {
          expectValueToBeInRange(11, 1, 10);
        }).toThrow();
      });
    });

    describe('expectValueToBeApproximately', () => {
      it('should pass when values are approximately equal', () => {
        expectValueToBeApproximately(1.234, 1.235, 2);
      });

      it('should fail when values are not approximately equal', () => {
        expect(() => {
          expectValueToBeApproximately(1.2, 1.3, 2);
        }).toThrow();
      });

      it('should use default precision', () => {
        expectValueToBeApproximately(1.23, 1.24, 2);
      });
    });
  });

  describe('Array Assertions', () => {
    describe('expectArrayToContain', () => {
      it('should pass when array contains all items', () => {
        const array = [1, 2, 3, 4, 5];
        expectArrayToContain(array, 2, 4);
      });

      it('should fail when array does not contain an item', () => {
        const array = [1, 2, 3];
        
        expect(() => {
          expectArrayToContain(array, 2, 4);
        }).toThrow();
      });
    });

    describe('expectArrayToHaveLength', () => {
      it('should pass when array has expected length', () => {
        const array = [1, 2, 3];
        expectArrayToHaveLength(array, 3);
      });

      it('should fail when array has wrong length', () => {
        const array = [1, 2, 3];
        
        expect(() => {
          expectArrayToHaveLength(array, 2);
        }).toThrow();
      });
    });
  });

  describe('Object Assertions', () => {
    describe('expectObjectToHaveProperties', () => {
      it('should pass when object has all properties', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expectObjectToHaveProperties(obj, 'a', 'b');
      });

      it('should fail when object is missing a property', () => {
        const obj = { a: 1, b: 2 };
        
        expect(() => {
          expectObjectToHaveProperties(obj, 'a', 'c');
        }).toThrow();
      });
    });

    describe('expectObjectToHaveValues', () => {
      it('should pass when object has expected values', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expectObjectToHaveValues(obj, { a: 1, b: 2 });
      });

      it('should fail when object has wrong values', () => {
        const obj = { a: 1, b: 2 };
        
        expect(() => {
          expectObjectToHaveValues(obj, { a: 1, b: 3 });
        }).toThrow();
      });
    });
  });

  describe('String Assertions', () => {
    describe('expectStringToMatch', () => {
      it('should pass when string matches pattern', () => {
        expectStringToMatch('Hello World', 'Hello');
        expectStringToMatch('Hello World', /Hello/);
      });

      it('should fail when string does not match pattern', () => {
        expect(() => {
          expectStringToMatch('Hello World', 'Goodbye');
        }).toThrow();
      });
    });

    describe('expectStringToContain', () => {
      it('should pass when string contains substring', () => {
        expectStringToContain('Hello World', 'World');
      });

      it('should fail when string does not contain substring', () => {
        expect(() => {
          expectStringToContain('Hello World', 'Goodbye');
        }).toThrow();
      });
    });
  });

  describe('DOM Element Assertions', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    describe('expectElementToHaveAttributes', () => {
      it('should pass when element has expected attributes', () => {
        const element = document.createElement('div');
        element.setAttribute('id', 'test');
        element.setAttribute('class', 'test-class');
        
        expectElementToHaveAttributes(element, { id: 'test', class: 'test-class' });
      });

      it('should fail when element is missing attributes', () => {
        const element = document.createElement('div');
        element.setAttribute('id', 'test');
        
        expect(() => {
          expectElementToHaveAttributes(element, { id: 'test', class: 'missing' });
        }).toThrow();
      });
    });

    describe('expectElementToHaveClasses', () => {
      it('should pass when element has expected classes', () => {
        const element = document.createElement('div');
        element.className = 'class1 class2 class3';
        
        expectElementToHaveClasses(element, 'class1', 'class2');
      });

      it('should fail when element is missing classes', () => {
        const element = document.createElement('div');
        element.className = 'class1 class2';
        
        expect(() => {
          expectElementToHaveClasses(element, 'class1', 'class3');
        }).toThrow();
      });
    });

    describe('expectElementToHaveTextContent', () => {
      it('should pass when element has expected text content', () => {
        const element = document.createElement('div');
        element.textContent = 'Hello World';
        
        expectElementToHaveTextContent(element, 'Hello World');
      });

      it('should fail when element has different text content', () => {
        const element = document.createElement('div');
        element.textContent = 'Hello World';
        
        expect(() => {
          expectElementToHaveTextContent(element, 'Goodbye World');
        }).toThrow();
      });
    });

    describe('expectElementToBeVisible', () => {
      it('should pass when element is visible', () => {
        const element = document.createElement('div');
        element.style.display = 'block';
        document.body.appendChild(element);
        
        expectElementToBeVisible(element);
      });

      it('should fail when element is hidden', () => {
        const element = document.createElement('div');
        element.style.display = 'none';
        document.body.appendChild(element);
        
        expect(() => {
          expectElementToBeVisible(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeHidden', () => {
      it('should pass when element is hidden', () => {
        const element = document.createElement('div');
        element.style.display = 'none';
        document.body.appendChild(element);
        
        expectElementToBeHidden(element);
      });

      it('should fail when element is visible', () => {
        const element = document.createElement('div');
        element.style.display = 'block';
        document.body.appendChild(element);
        
        expect(() => {
          expectElementToBeHidden(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeInTheDocument', () => {
      it('should pass when element is in the document', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        
        expectElementToBeInTheDocument(element);
      });

      it('should fail when element is not in the document', () => {
        const element = document.createElement('div');
        
        expect(() => {
          expectElementToBeInTheDocument(element);
        }).toThrow();
      });
    });

    describe('expectElementNotToBeInTheDocument', () => {
      it('should pass when element is not in the document', () => {
        const element = document.createElement('div');
        
        expectElementNotToBeInTheDocument(element);
      });

      it('should fail when element is in the document', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        
        expect(() => {
          expectElementNotToBeInTheDocument(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeDisabled', () => {
      it('should pass when element is disabled', () => {
        const element = document.createElement('input');
        element.disabled = true;
        
        expectElementToBeDisabled(element);
      });

      it('should fail when element is enabled', () => {
        const element = document.createElement('input');
        element.disabled = false;
        
        expect(() => {
          expectElementToBeDisabled(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeEnabled', () => {
      it('should pass when element is enabled', () => {
        const element = document.createElement('input');
        element.disabled = false;
        
        expectElementToBeEnabled(element);
      });

      it('should fail when element is disabled', () => {
        const element = document.createElement('input');
        element.disabled = true;
        
        expect(() => {
          expectElementToBeEnabled(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeRequired', () => {
      it('should pass when element is required', () => {
        const element = document.createElement('input');
        element.required = true;
        
        expectElementToBeRequired(element);
      });

      it('should fail when element is not required', () => {
        const element = document.createElement('input');
        element.required = false;
        
        expect(() => {
          expectElementToBeRequired(element);
        }).toThrow();
      });
    });

    describe('expectElementNotToBeRequired', () => {
      it('should pass when element is not required', () => {
        const element = document.createElement('input');
        element.required = false;
        
        expectElementNotToBeRequired(element);
      });

      it('should fail when element is required', () => {
        const element = document.createElement('input');
        element.required = true;
        
        expect(() => {
          expectElementNotToBeRequired(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeValid', () => {
      it('should pass when element is valid', () => {
        const element = document.createElement('input');
        element.setCustomValidity('');
        
        expectElementToBeValid(element);
      });

      it('should fail when element is invalid', () => {
        const element = document.createElement('input');
        element.setCustomValidity('Invalid');
        
        expect(() => {
          expectElementToBeValid(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeInvalid', () => {
      it('should pass when element is invalid', () => {
        const element = document.createElement('input');
        element.setCustomValidity('Invalid');
        
        expectElementToBeInvalid(element);
      });

      it('should fail when element is valid', () => {
        const element = document.createElement('input');
        element.setCustomValidity('');
        
        expect(() => {
          expectElementToBeInvalid(element);
        }).toThrow();
      });
    });

    describe('expectElementToHaveFocus', () => {
      it('should pass when element has focus', () => {
        const element = document.createElement('input');
        document.body.appendChild(element);
        element.focus();
        
        expectElementToHaveFocus(element);
      });

      it('should fail when element does not have focus', () => {
        const element = document.createElement('input');
        document.body.appendChild(element);
        
        expect(() => {
          expectElementToHaveFocus(element);
        }).toThrow();
      });
    });

    describe('expectElementNotToHaveFocus', () => {
      it('should pass when element does not have focus', () => {
        const element = document.createElement('input');
        document.body.appendChild(element);
        
        expectElementNotToHaveFocus(element);
      });

      it('should fail when element has focus', () => {
        const element = document.createElement('input');
        document.body.appendChild(element);
        element.focus();
        
        expect(() => {
          expectElementNotToHaveFocus(element);
        }).toThrow();
      });
    });

    describe('expectElementToBeChecked', () => {
      it('should pass when checkbox is checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.checked = true;
        
        expectElementToBeChecked(element);
      });

      it('should fail when checkbox is not checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.checked = false;
        
        expect(() => {
          expectElementToBeChecked(element);
        }).toThrow();
      });
    });

    describe('expectElementNotToBeChecked', () => {
      it('should pass when checkbox is not checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.checked = false;
        
        expectElementNotToBeChecked(element);
      });

      it('should fail when checkbox is checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.checked = true;
        
        expect(() => {
          expectElementNotToBeChecked(element);
        }).toThrow();
      });
    });

    describe('expectElementToBePartiallyChecked', () => {
      it('should pass when checkbox is partially checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.indeterminate = true;
        
        expectElementToBePartiallyChecked(element);
      });

      it('should fail when checkbox is not partially checked', () => {
        const element = document.createElement('input');
        element.type = 'checkbox';
        element.indeterminate = false;
        
        expect(() => {
          expectElementToBePartiallyChecked(element);
        }).toThrow();
      });
    });

    describe('expectElementToHaveRole', () => {
      it('should pass when element has expected role', () => {
        const element = document.createElement('button');
        
        expectElementToHaveRole(element, 'button');
      });

      it('should fail when element has different role', () => {
        const element = document.createElement('div');
        
        expect(() => {
          expectElementToHaveRole(element, 'button');
        }).toThrow();
      });
    });

    describe('expectElementToHaveAccessibleName', () => {
      it('should pass when element has expected accessible name', () => {
        const element = document.createElement('button');
        element.textContent = 'Submit';
        
        expectElementToHaveAccessibleName(element, 'Submit');
      });

      it('should fail when element has different accessible name', () => {
        const element = document.createElement('button');
        element.textContent = 'Submit';
        
        expect(() => {
          expectElementToHaveAccessibleName(element, 'Cancel');
        }).toThrow();
      });
    });

    describe('expectElementToHaveAccessibleDescription', () => {
      it('should pass when element has expected accessible description', () => {
        const element = document.createElement('input');
        element.setAttribute('aria-describedby', 'description');
        const description = document.createElement('div');
        description.id = 'description';
        description.textContent = 'Enter your email address';
        document.body.appendChild(description);
        
        expectElementToHaveAccessibleDescription(element, 'Enter your email address');
      });

      it('should fail when element has different accessible description', () => {
        const element = document.createElement('input');
        element.setAttribute('aria-describedby', 'description');
        const description = document.createElement('div');
        description.id = 'description';
        description.textContent = 'Enter your email address';
        document.body.appendChild(description);
        
        expect(() => {
          expectElementToHaveAccessibleDescription(element, 'Enter your password');
        }).toThrow();
      });
    });
  });
});
