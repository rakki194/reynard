/**
 * Error Analyzer Tests
 * Test suite for error analysis and classification utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeError, createErrorContext } from './ErrorAnalyzer';
import { ErrorCategory, ErrorSeverity } from '../types/ErrorTypes';

describe('ErrorAnalyzer', () => {
  beforeEach(() => {
    // Mock window and navigator for tests
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/test' },
      writable: true
    });
    
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Test Browser)' },
      writable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn().mockReturnValue('test-session-id'),
        setItem: vi.fn()
      },
      writable: true
    });
  });

  describe('analyzeError', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      
      const result = analyzeError(networkError, {});
      
      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.recoverable).toBe(true);
    });

    it('should classify authentication errors correctly', () => {
      const authError = new Error('Unauthorized access');
      authError.name = 'AuthError';
      
      const result = analyzeError(authError, {});
      
      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Invalid input format');
      validationError.name = 'ValidationError';
      
      const result = analyzeError(validationError, {});
      
      expect(result.category).toBe(ErrorCategory.VALIDATION);
      expect(result.recoverable).toBe(true);
    });

    it('should classify rendering errors correctly', () => {
      const renderingError = new Error('Component render failed');
      renderingError.name = 'RenderError';
      
      const result = analyzeError(renderingError, {});
      
      expect(result.category).toBe(ErrorCategory.RENDERING);
      expect(result.recoverable).toBe(true);
    });

    it('should classify resource errors correctly', () => {
      const resourceError = new Error('File not found');
      resourceError.name = 'ResourceError';
      
      const result = analyzeError(resourceError, {});
      
      expect(result.category).toBe(ErrorCategory.RESOURCE);
      expect(result.recoverable).toBe(true);
    });

    it('should classify timeout errors correctly', () => {
      const timeoutError = new Error('Operation timed out');
      timeoutError.name = 'TimeoutError';
      
      const result = analyzeError(timeoutError, {});
      
      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.recoverable).toBe(true);
    });

    it('should classify unknown errors correctly', () => {
      const unknownError = new Error('Some random error');
      unknownError.name = 'RandomError';
      
      const result = analyzeError(unknownError, {});
      
      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.severity).toBe(ErrorSeverity.LOW);
    });

    it('should determine severity based on error characteristics', () => {
      const criticalError = new Error('Critical system failure');
      criticalError.name = 'CriticalError';
      
      const result = analyzeError(criticalError, {});
      
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should extract metadata from error stack', () => {
      const error = new Error('Test error');
      error.stack = `
        at TestComponent (test.tsx:10:5)
        at AnotherComponent (test.tsx:15:3)
        at (index.js:1:1)
      `;
      
      const result = analyzeError(error, {});
      
      expect(result.metadata.components).toContain('TestComponent');
      expect(result.metadata.components).toContain('AnotherComponent');
      expect(result.metadata.files).toContain('test.tsx');
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Test error');
      error.stack = undefined;
      
      const result = analyzeError(error, {});
      
      expect(result.metadata.components).toBeUndefined();
      expect(result.metadata.files).toBeUndefined();
    });

    it('should include browser information in metadata', () => {
      const error = new Error('Test error');
      
      const result = analyzeError(error, {});
      
      expect(result.metadata.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(result.metadata.url).toBe('http://localhost:3000/test');
      expect(result.metadata.timestamp).toBeTypeOf('number');
    });
  });

  describe('createErrorContext', () => {
    it('should create error context with all required fields', () => {
      const error = new Error('Test error');
      const errorInfo = {
        componentStack: 'TestComponent\nAnotherComponent',
        errorBoundary: 'TestBoundary'
      };
      
      const context = createErrorContext(error, errorInfo);
      
      expect(context.componentStack).toEqual(['TestComponent', 'AnotherComponent']);
      expect(context.errorBoundaryId).toMatch(/^error-boundary-/);
      expect(context.timestamp).toBeTypeOf('number');
      expect(context.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(context.url).toBe('http://localhost:3000/test');
      expect(context.sessionId).toBe('test-session-id');
      expect(context.severity).toBeDefined();
      expect(context.category).toBeDefined();
      expect(context.recoverable).toBeDefined();
      expect(context.metadata).toBeDefined();
    });

    it('should handle missing error info', () => {
      const error = new Error('Test error');
      
      const context = createErrorContext(error, null);
      
      expect(context.componentStack).toEqual([]);
      expect(context.errorBoundaryId).toMatch(/^error-boundary-/);
    });

    it('should include additional context when provided', () => {
      const error = new Error('Test error');
      const errorInfo = {};
      const additionalContext = {
        userId: 'user-123',
        customField: 'custom-value'
      };
      
      const context = createErrorContext(error, errorInfo, additionalContext);
      
      expect(context.userId).toBe('user-123');
      expect(context.metadata.customField).toBe('custom-value');
    });

    it('should generate unique error boundary IDs', () => {
      const error = new Error('Test error');
      const errorInfo = {};
      
      const context1 = createErrorContext(error, errorInfo);
      const context2 = createErrorContext(error, errorInfo);
      
      expect(context1.errorBoundaryId).not.toBe(context2.errorBoundaryId);
    });

    it('should handle server-side rendering', () => {
      // Mock server environment
      const originalWindow = global.window;
      delete (global as any).window;
      
      const error = new Error('Test error');
      const errorInfo = {};
      
      const context = createErrorContext(error, errorInfo);
      
      expect(context.userAgent).toBe('');
      expect(context.url).toBe('');
      expect(context.sessionId).toBe('server-session');
      
      // Restore window
      global.window = originalWindow;
    });
  });
});
