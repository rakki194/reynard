/**
 * Security Utilities Tests
 * Tests for authentication security functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TokenManager,
  decodeToken,
  isTokenExpired,
  sanitizeInput,
  generateSecureString,
  generateCSRFToken,
  validateCSRFToken,
  validateEmail,
  validateUsername,
  RateLimiter
} from './index';

// Mock JWT token for testing
const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzA0MDk2MDAwfQ.test';
const mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNjAwMDAwMDAwfQ.expired';
const mockInvalidToken = 'invalid.token.here';

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    tokenManager = new TokenManager('test_token', 'test_refresh');
  });

  describe('Token Storage', () => {
    it('should store tokens securely', () => {
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_456';

      tokenManager.setTokens(accessToken, refreshToken);

      expect(tokenManager.getAccessToken()).toBe(accessToken);
      expect(tokenManager.getRefreshToken()).toBe(refreshToken);
    });

    it('should handle missing tokens gracefully', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('should clear tokens properly', () => {
      tokenManager.setTokens('access', 'refresh');
      tokenManager.clearTokens();

      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should validate token format correctly', () => {
      const result = tokenManager.validateToken(mockValidToken);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid token format', () => {
      const result = tokenManager.validateToken(mockInvalidToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should detect expired tokens', () => {
      const result = tokenManager.validateToken(mockExpiredToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should detect blacklisted tokens', () => {
      tokenManager.blacklistToken(mockValidToken);
      const result = tokenManager.validateToken(mockValidToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token has been revoked');
    });
  });

  describe('Token Information', () => {
    it('should get token expiration time', () => {
      const expiration = tokenManager.getTokenExpiration(mockValidToken);
      expect(expiration).toBeInstanceOf(Date);
    });

    it('should detect tokens expiring soon', () => {
      // Create a token that expires in 1 minute
      const soonExpiringToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJ1c2VyIiwiZXhwIjo' + 
        Math.floor((Date.now() + 30000) / 1000) + 'fQ.test';
      
      const isExpiringSoon = tokenManager.isTokenExpiringSoon(soonExpiringToken, 5);
      expect(isExpiringSoon).toBe(true);
    });
  });
});

describe('Token Utilities', () => {
  describe('decodeToken', () => {
    it('should decode valid tokens', () => {
      const decoded = decodeToken(mockValidToken);
      expect(decoded).toBeTruthy();
      expect(decoded?.sub).toBe('testuser');
      expect(decoded?.role).toBe('user');
    });

    it('should return null for invalid tokens', () => {
      const decoded = decodeToken(mockInvalidToken);
      expect(decoded).toBeNull();
    });

    it('should return null for empty tokens', () => {
      const decoded = decodeToken('');
      expect(decoded).toBeNull();
    });

    it('should validate token format', () => {
      const invalidFormatToken = 'not.a.valid.jwt';
      const decoded = decodeToken(invalidFormatToken);
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should detect expired tokens', () => {
      expect(isTokenExpired(mockExpiredToken)).toBe(true);
    });

    it('should detect valid tokens', () => {
      expect(isTokenExpired(mockValidToken)).toBe(false);
    });

    it('should handle invalid tokens', () => {
      expect(isTokenExpired(mockInvalidToken)).toBe(true);
    });
  });
});

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should remove dangerous protocols', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('');
    });

    it('should remove event handlers', () => {
      const input = '<img onload="alert(\'xss\')" src="test.jpg">';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe(' src="test.jpg"');
    });

    it('should remove script and style tags', () => {
      const input = '<script>alert("xss")</script><style>body{color:red}</style>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello');
    });

    it('should remove dangerous characters', () => {
      const input = 'Hello<>"\'&World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('HelloWorld');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(15000);
      const sanitized = sanitizeInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(10000);
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should preserve safe content', () => {
      const input = 'Hello World 123';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World 123');
    });
  });
});

describe('Cryptographic Functions', () => {
  describe('generateSecureString', () => {
    it('should generate strings of correct length', () => {
      const result = generateSecureString(16);
      expect(result).toHaveLength(16);
    });

    it('should generate different strings each time', () => {
      const result1 = generateSecureString(32);
      const result2 = generateSecureString(32);
      expect(result1).not.toBe(result2);
    });

    it('should use default length when not specified', () => {
      const result = generateSecureString();
      expect(result).toHaveLength(32);
    });
  });

  describe('CSRF Token Functions', () => {
    it('should generate CSRF tokens', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64); // 32 bytes as hex = 64 characters
    });

    it('should validate CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different')).toBe(false);
    });

    it('should prevent timing attacks', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      // Test that different length tokens are rejected quickly
      const start = performance.now();
      validateCSRFToken(token1, token2.substring(0, 10));
      const end = performance.now();
      
      // Should be fast (less than 1ms for timing attack prevention)
      expect(end - start).toBeLessThan(1);
    });
  });
});

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('testuser')).toBe(true);
      expect(validateUsername('user_123')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // Too short
      expect(validateUsername('a'.repeat(21))).toBe(false); // Too long
      expect(validateUsername('user@name')).toBe(false); // Invalid character
      expect(validateUsername('')).toBe(false); // Empty
    });
  });
});

describe('Rate Limiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
  });

  it('should allow requests within limit', () => {
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    // Make 3 requests (should all be allowed)
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    
    // 4th request should be blocked
    expect(rateLimiter.isAllowed('user1')).toBe(false);
  });

  it('should allow requests for different users independently', () => {
    // User1 makes 3 requests
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    
    // User2 should still be allowed
    expect(rateLimiter.isAllowed('user2')).toBe(true);
  });

  it('should reset limits after time window', async () => {
    // Make 3 requests
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    
    // Should be blocked
    expect(rateLimiter.isAllowed('user1')).toBe(false);
    
    // Wait for time window to reset
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Should be allowed again
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  it('should cleanup expired entries', () => {
    rateLimiter.isAllowed('user1');
    rateLimiter.cleanup();
    
    // Should still work after cleanup
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });
});

describe('Security Edge Cases', () => {
  it('should handle malformed JWT tokens gracefully', () => {
    const malformedTokens = [
      'not.a.jwt',
      'too.many.parts.here.extra',
      'only.two',
      '',
      null as any,
      undefined as any
    ];

    malformedTokens.forEach(token => {
      expect(() => decodeToken(token)).not.toThrow();
      expect(decodeToken(token)).toBeNull();
    });
  });

  it('should handle extremely long inputs', () => {
    const longInput = 'a'.repeat(100000);
    const sanitized = sanitizeInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(10000);
  });

  it('should handle unicode and special characters', () => {
    const unicodeInput = 'Hello 世界 🌍 <script>alert("xss")</script>';
    const sanitized = sanitizeInput(unicodeInput);
    expect(sanitized).toBe('Hello 世界 🌍 ');
  });

  it('should handle null and undefined inputs safely', () => {
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
    expect(validateEmail(null as any)).toBe(false);
    expect(validateUsername(undefined as any)).toBe(false);
  });
});
