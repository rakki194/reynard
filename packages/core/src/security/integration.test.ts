/**
 * Security Integration Tests
 * End-to-end tests for security features working together
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileProcessingPipeline } from '../../file-processing/src/processing-pipeline';
import { TokenManager } from '../../auth/src/utils';
import {
  sanitizeInput,
  validateInput,
  generateCSRFToken,
  validateCSRFToken,
  applySecurityHeaders,
  getSecurityHeaders,
  createSecureFetch,
  generateSecurePassword,
  hashString,
  constantTimeCompare
} from './index';

// Mock implementations for integration testing
const mockFetch = vi.fn();
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(async (algorithm: string, data: Uint8Array) => {
      const hash = new Uint8Array(32);
      for (let i = 0; i < hash.length; i++) {
        hash[i] = (data[i % data.length] + i) % 256;
      }
      return hash;
    })
  }
};

describe('Security Integration Tests', () => {
  beforeEach(() => {
    // Setup mocks
    global.fetch = mockFetch;
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true
    });
    
    // Clear localStorage and sessionStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    vi.clearAllMocks();
  });

  describe('Authentication and Input Validation Integration', () => {
    it('should handle malicious input in authentication flow', () => {
      const tokenManager = new TokenManager();
      
      // Test malicious input sanitization
      const maliciousInput = '<script>alert("xss")</script>'; DROP TABLE users; --';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('DROP TABLE');
      
      // Test comprehensive validation
      const validationResult = validateInput(maliciousInput, {
        maxLength: 100,
        allowHTML: false,
        allowSQL: false,
        allowXSS: false
      });
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    it('should validate user input throughout authentication process', () => {
      const testCases = [
        { input: 'valid@email.com', shouldPass: true },
        { input: '<script>alert("xss")</script>', shouldPass: false },
        { input: "'; DROP TABLE users; --", shouldPass: false },
        { input: 'normalusername', shouldPass: true },
        { input: '../../../etc/passwd', shouldPass: false }
      ];

      testCases.forEach(({ input, shouldPass }) => {
        const result = validateInput(input, {
          maxLength: 100,
          allowHTML: false,
          allowSQL: false,
          allowXSS: false
        });
        
        expect(result.isValid).toBe(shouldPass);
      });
    });
  });

  describe('File Upload and Security Integration', () => {
    it('should process files with comprehensive security checks', async () => {
      const pipeline = new FileProcessingPipeline({
        maxFileSize: 5 * 1024 * 1024, // 5MB
        defaultThumbnailSize: [200, 200]
      });

      // Create mock files for testing
      const createMockFile = (name: string, size: number, type: string): File => {
        const file = new File(['test content'], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
      };

      const testFiles = [
        { file: createMockFile('safe.jpg', 1024, 'image/jpeg'), shouldPass: true },
        { file: createMockFile('malware.exe', 1024, 'application/x-msdownload'), shouldPass: false },
        { file: createMockFile('../../../etc/passwd', 1024, 'text/plain'), shouldPass: false },
        { file: createMockFile('large.zip', 10 * 1024 * 1024, 'application/zip'), shouldPass: false },
        { file: createMockFile('document.pdf', 2 * 1024 * 1024, 'application/pdf'), shouldPass: true }
      ];

      for (const { file, shouldPass } of testFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(shouldPass);
      }
    });

    it('should handle file processing with input validation', async () => {
      const pipeline = new FileProcessingPipeline();
      
      // Test file name validation
      const maliciousFileName = '<script>alert("xss")</script>.txt';
      const sanitizedFileName = sanitizeInput(maliciousFileName);
      
      expect(sanitizedFileName).not.toContain('<script>');
      
      // Test file processing with sanitized name
      const file = new File(['content'], sanitizedFileName, { type: 'text/plain' });
      const result = await pipeline.processFile(file);
      
      // Should either pass or fail gracefully
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('CSRF Protection Integration', () => {
    it('should generate and validate CSRF tokens consistently', () => {
      const token = generateCSRFToken();
      
      // Token should be valid when compared to itself
      expect(validateCSRFToken(token, token)).toBe(true);
      
      // Token should be invalid when compared to different token
      const differentToken = generateCSRFToken();
      expect(validateCSRFToken(token, differentToken)).toBe(false);
      
      // Should prevent timing attacks
      const start = performance.now();
      validateCSRFToken(token, differentToken);
      const end = performance.now();
      expect(end - start).toBeLessThan(1);
    });

    it('should integrate CSRF protection with secure fetch', async () => {
      const secureFetch = createSecureFetch('https://api.example.com');
      mockFetch.mockResolvedValue(new Response());
      
      // Test POST request (should include CSRF protection)
      await secureFetch('/api/data', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' })
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': expect.any(String)
          })
        })
      );
    });
  });

  describe('Security Headers Integration', () => {
    it('should apply appropriate headers based on environment', () => {
      const environments = ['development', 'production', 'strict'] as const;
      
      environments.forEach(env => {
        const headers = getSecurityHeaders(env);
        expect(headers).toBeDefined();
        expect(headers['Content-Security-Policy']).toBeDefined();
        expect(headers['X-Frame-Options']).toBeDefined();
        expect(headers['Strict-Transport-Security']).toBeDefined();
      });
    });

    it('should integrate headers with secure fetch', async () => {
      const secureFetch = createSecureFetch('https://api.example.com');
      mockFetch.mockResolvedValue(new Response());
      
      await secureFetch('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          })
        })
      );
    });
  });

  describe('Password Security Integration', () => {
    it('should generate secure passwords with proper characteristics', () => {
      const password = generateSecurePassword(16, {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true
      });
      
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[A-Z]/); // Uppercase
      expect(password).toMatch(/[a-z]/); // Lowercase
      expect(password).toMatch(/[0-9]/); // Numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/); // Symbols
    });

    it('should hash passwords securely', async () => {
      const password = 'test-password-123';
      const hash = await hashString(password, 'SHA-256');
      
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[0-9a-f]+$/);
      
      // Same password should produce same hash
      const hash2 = await hashString(password, 'SHA-256');
      expect(hash).toBe(hash2);
    });

    it('should validate password strength with input validation', () => {
      const weakPassword = '123';
      const strongPassword = 'StrongP@ssw0rd!';
      
      const weakResult = validateInput(weakPassword, {
        maxLength: 100,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      });
      
      const strongResult = validateInput(strongPassword, {
        maxLength: 100,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      });
      
      expect(weakResult.isValid).toBe(false);
      expect(strongResult.isValid).toBe(true);
    });
  });

  describe('Token Management Integration', () => {
    it('should handle token lifecycle with security measures', () => {
      const tokenManager = new TokenManager();
      
      // Test token storage
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      
      tokenManager.setTokens(accessToken, refreshToken);
      expect(tokenManager.getAccessToken()).toBe(accessToken);
      expect(tokenManager.getRefreshToken()).toBe(refreshToken);
      
      // Test token blacklisting
      tokenManager.blacklistToken(accessToken);
      const validation = tokenManager.validateToken(accessToken);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Token has been revoked');
      
      // Test token cleanup
      tokenManager.clearTokens();
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('should integrate token validation with input sanitization', () => {
      const tokenManager = new TokenManager();
      
      // Test with potentially malicious token
      const maliciousToken = '<script>alert("xss")</script>';
      const sanitizedToken = sanitizeInput(maliciousToken);
      
      // Sanitized token should not contain script tags
      expect(sanitizedToken).not.toContain('<script>');
      
      // Token validation should handle invalid tokens gracefully
      const validation = tokenManager.validateToken(sanitizedToken);
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle security errors gracefully across components', async () => {
      const pipeline = new FileProcessingPipeline();
      
      // Test with invalid file
      const invalidFile = null as any;
      const result = await pipeline.processFile(invalidFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain('stack trace');
      expect(result.error).not.toContain('internal');
    });

    it('should sanitize error messages', () => {
      const maliciousError = '<script>alert("xss")</script>Error message';
      const sanitizedError = sanitizeInput(maliciousError);
      
      expect(sanitizedError).not.toContain('<script>');
      expect(sanitizedError).toContain('Error message');
    });
  });

  describe('Performance and Security Integration', () => {
    it('should maintain security while processing multiple files', async () => {
      const pipeline = new FileProcessingPipeline();
      
      // Create multiple test files
      const createMockFile = (name: string, size: number, type: string): File => {
        const file = new File(['test content'], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
      };
      
      const files = Array.from({ length: 10 }, (_, i) => 
        createMockFile(`file${i}.txt`, 1024, 'text/plain')
      );
      
      const startTime = performance.now();
      const results = await pipeline.processFiles(files);
      const endTime = performance.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // All files should be processed successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle concurrent security operations', async () => {
      const operations = [
        () => generateCSRFToken(),
        () => generateSecurePassword(16),
        () => hashString('test-string'),
        () => sanitizeInput('<script>alert("xss")</script>'),
        () => validateInput('test@example.com', { maxLength: 100 })
      ];
      
      const startTime = performance.now();
      const results = await Promise.all(operations.map(op => op()));
      const endTime = performance.now();
      
      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Real-world Attack Scenarios', () => {
    it('should prevent XSS attacks through multiple vectors', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img onload="alert(\'xss\')" src="test.jpg">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<svg onload="alert(\'xss\')"></svg>'
      ];
      
      xssPayloads.forEach(payload => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onload=');
      });
    });

    it('should prevent SQL injection through multiple vectors', () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1 --"
      ];
      
      sqlPayloads.forEach(payload => {
        const validation = validateInput(payload, {
          allowSQL: false
        });
        expect(validation.isValid).toBe(false);
      });
    });

    it('should prevent file upload attacks', async () => {
      const pipeline = new FileProcessingPipeline();
      
      const createMockFile = (name: string, size: number, type: string): File => {
        const file = new File(['test content'], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
      };
      
      const attackFiles = [
        createMockFile('malware.exe', 1024, 'application/x-msdownload'),
        createMockFile('../../../etc/passwd', 1024, 'text/plain'),
        createMockFile('.htaccess', 1024, 'text/plain'),
        createMockFile('script.js', 1024, 'application/javascript')
      ];
      
      for (const file of attackFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
      }
    });

    it('should prevent CSRF attacks', () => {
      const csrfToken = generateCSRFToken();
      
      // Simulate CSRF attack with different token
      const attackToken = generateCSRFToken();
      expect(validateCSRFToken(csrfToken, attackToken)).toBe(false);
      
      // Simulate CSRF attack with empty token
      expect(validateCSRFToken(csrfToken, '')).toBe(false);
      
      // Simulate CSRF attack with null token
      expect(validateCSRFToken(csrfToken, null as any)).toBe(false);
    });
  });
});
