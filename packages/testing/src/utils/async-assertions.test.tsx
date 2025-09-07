import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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
} from './assertion-utils';

describe('Async and Value Assertions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
