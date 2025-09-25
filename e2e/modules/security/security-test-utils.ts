/**
 * 🦊 Security Test Utilities
 * ==========================
 *
 * Comprehensive utilities for security testing, including token generation,
 * validation, and security testing helpers.
 *
 * Author: Odonata-Oracle-6 (Dragonfly Specialist)
 * Version: 1.0.0
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface SecurityTestConfig {
  jwtSecret: string;
  jwtAlgorithm: string;
  tokenExpirationHours: number;
  rateLimitWindowMs: number;
  maxRequestsPerWindow: number;
}

export interface TokenValidationResult {
  valid: boolean;
  claims?: any;
  error?: string;
  expired?: boolean;
  malformed?: boolean;
}

export interface SecurityHeaders {
  "x-content-type-options"?: string;
  "x-frame-options"?: string;
  "x-xss-protection"?: string;
  "strict-transport-security"?: string;
  "content-security-policy"?: string;
  "referrer-policy"?: string;
}

export class SecurityTestUtils {
  private config: SecurityTestConfig;

  constructor(config?: Partial<SecurityTestConfig>) {
    this.config = {
      jwtSecret: process.env.MCP_TOKEN_SECRET || "reynard-mcp-secret-key-2025",
      jwtAlgorithm: process.env.MCP_TOKEN_ALGORITHM || "HS256",
      tokenExpirationHours: parseInt(process.env.MCP_TOKEN_EXPIRE_HOURS || "24"),
      rateLimitWindowMs: 60000, // 1 minute
      maxRequestsPerWindow: 100,
      ...config,
    };
  }

  /**
   * Generate a valid JWT token with specified claims
   */
  generateToken(claims: Record<string, any>, expiresInHours?: number): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = expiresInHours || this.config.tokenExpirationHours;

    const payload = {
      ...claims,
      iat: now,
      exp: now + expiresIn * 3600,
      iss: "reynard-mcp-server",
      aud: "reynard-mcp-clients",
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: this.config.jwtAlgorithm as jwt.Algorithm,
    });
  }

  /**
   * Generate an expired token
   */
  generateExpiredToken(claims: Record<string, any>): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      ...claims,
      iat: now - 86400, // 24 hours ago
      exp: now - 3600, // 1 hour ago
      iss: "reynard-mcp-server",
      aud: "reynard-mcp-clients",
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: this.config.jwtAlgorithm as jwt.Algorithm,
    });
  }

  /**
   * Generate a token that expires in specified seconds
   */
  generateExpiringToken(claims: Record<string, any>, expiresInSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      ...claims,
      iat: now,
      exp: now + expiresInSeconds,
      iss: "reynard-mcp-server",
      aud: "reynard-mcp-clients",
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: this.config.jwtAlgorithm as jwt.Algorithm,
    });
  }

  /**
   * Generate a token with invalid signature
   */
  generateTokenWithInvalidSignature(claims: Record<string, any>): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      ...claims,
      iat: now,
      exp: now + 3600,
      iss: "reynard-mcp-server",
      aud: "reynard-mcp-clients",
    };

    // Use wrong secret to create invalid signature
    const wrongSecret = "wrong-secret-key-" + crypto.randomBytes(16).toString("hex");
    return jwt.sign(payload, wrongSecret, {
      algorithm: this.config.jwtAlgorithm as jwt.Algorithm,
    });
  }

  /**
   * Generate a malformed token
   */
  generateMalformedToken(): string {
    const validToken = this.generateToken({ client_id: "test-client" });
    const parts = validToken.split(".");

    // Corrupt the payload
    parts[1] = "corrupted-payload";

    return parts.join(".");
  }

  /**
   * Generate a token with missing required claims
   */
  generateIncompleteToken(): string {
    const payload = {
      client_id: "test-client",
      // Missing required claims like exp, iat, etc.
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: this.config.jwtAlgorithm as jwt.Algorithm,
    });
  }

  /**
   * Validate token structure and claims
   */
  validateToken(token: string): TokenValidationResult {
    try {
      // Check if token is malformed
      const parts = token.split(".");
      if (parts.length !== 3) {
        return { valid: false, malformed: true, error: "Invalid token format" };
      }

      // Try to decode without verification first
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || typeof decoded === "string") {
        return { valid: false, malformed: true, error: "Invalid token structure" };
      }

      const payload = decoded.payload as any;

      // Check if token is expired
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return { valid: false, expired: true, error: "Token has expired" };
      }

      // Verify signature
      try {
        jwt.verify(token, this.config.jwtSecret, {
          algorithms: [this.config.jwtAlgorithm as jwt.Algorithm],
        });
      } catch (error) {
        return { valid: false, error: `Invalid signature: ${error}` };
      }

      return { valid: true, claims: payload };
    } catch (error) {
      return { valid: false, malformed: true, error: `Token validation error: ${error}` };
    }
  }

  /**
   * Generate random client ID for testing
   */
  generateRandomClientId(): string {
    return "test-client-" + crypto.randomBytes(8).toString("hex");
  }

  /**
   * Generate random secret for testing
   */
  generateRandomSecret(): string {
    return "test-secret-" + crypto.randomBytes(16).toString("hex");
  }

  /**
   * Generate test permissions
   */
  generateTestPermissions(count: number = 3): string[] {
    const basePermissions = [
      "mcp:read",
      "mcp:write",
      "mcp:admin",
      "mcp:tools:list",
      "mcp:tools:execute",
      "mcp:agents:create",
      "mcp:agents:read",
      "mcp:agents:update",
      "mcp:agents:delete",
    ];

    const shuffled = [...basePermissions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, basePermissions.length));
  }

  /**
   * Generate invalid permissions for testing
   */
  generateInvalidPermissions(): string[] {
    return ["invalid:permission", "mcp:invalid", "admin:all", "root:access", "system:bypass"];
  }

  /**
   * Check if security headers are present
   */
  validateSecurityHeaders(headers: Record<string, string>): { valid: boolean; missing: string[] } {
    const requiredHeaders: (keyof SecurityHeaders)[] = [
      "x-content-type-options",
      "x-frame-options",
      "x-xss-protection",
    ];

    const missing: string[] = [];

    for (const header of requiredHeaders) {
      if (!headers[header]) {
        missing.push(header);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Generate test data for rate limiting
   */
  generateRateLimitTestData(count: number = 10): Array<{ client_id: string; client_secret: string }> {
    const testData = [];

    for (let i = 0; i < count; i++) {
      testData.push({
        client_id: this.generateRandomClientId(),
        client_secret: this.generateRandomSecret(),
      });
    }

    return testData;
  }

  /**
   * Generate test data for brute force testing
   */
  generateBruteForceTestData(clientId: string, count: number = 5): Array<{ client_id: string; client_secret: string }> {
    const testData = [];

    for (let i = 0; i < count; i++) {
      testData.push({
        client_id: clientId,
        client_secret: this.generateRandomSecret(),
      });
    }

    return testData;
  }

  /**
   * Simulate network delay
   */
  async simulateNetworkDelay(minMs: number = 100, maxMs: number = 500): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate test payload for different attack vectors
   */
  generateAttackPayloads(): Record<string, any> {
    return {
      sqlInjection: {
        client_id: "'; DROP TABLE users; --",
        client_secret: "test-secret",
      },
      xss: {
        client_id: "<script>alert('xss')</script>",
        client_secret: "test-secret",
      },
      pathTraversal: {
        client_id: "../../../etc/passwd",
        client_secret: "test-secret",
      },
      commandInjection: {
        client_id: "test; rm -rf /",
        client_secret: "test-secret",
      },
      oversizedPayload: {
        client_id: "a".repeat(10000),
        client_secret: "b".repeat(10000),
      },
      nullBytes: {
        client_id: "test\x00client",
        client_secret: "test\x00secret",
      },
      unicode: {
        client_id: "测试客户端",
        client_secret: "测试密钥",
      },
    };
  }

  /**
   * Generate test data for concurrent requests
   */
  generateConcurrentTestData(count: number = 10): Array<{
    client_id: string;
    client_secret: string;
    permissions: string[];
  }> {
    const testData = [];

    for (let i = 0; i < count; i++) {
      testData.push({
        client_id: this.generateRandomClientId(),
        client_secret: this.generateRandomSecret(),
        permissions: this.generateTestPermissions(3),
      });
    }

    return testData;
  }

  /**
   * Validate response time is within acceptable limits
   */
  validateResponseTime(startTime: number, maxMs: number = 5000): { valid: boolean; duration: number } {
    const duration = Date.now() - startTime;
    return {
      valid: duration <= maxMs,
      duration,
    };
  }

  /**
   * Generate test data for session management
   */
  generateSessionTestData(): Array<{
    session_id: string;
    user_id: string;
    expires_at: number;
  }> {
    const testData = [];
    const now = Date.now();

    for (let i = 0; i < 5; i++) {
      testData.push({
        session_id: crypto.randomBytes(16).toString("hex"),
        user_id: `user-${i}`,
        expires_at: now + 3600 * 1000, // 1 hour from now
      });
    }

    return testData;
  }

  /**
   * Generate test data for CORS testing
   */
  generateCORSTestData(): Array<{
    origin: string;
    method: string;
    headers: string[];
  }> {
    return [
      {
        origin: "https://example.com",
        method: "GET",
        headers: ["Authorization", "Content-Type"],
      },
      {
        origin: "https://malicious-site.com",
        method: "POST",
        headers: ["Authorization", "X-Custom-Header"],
      },
      {
        origin: "http://localhost:3000",
        method: "PUT",
        headers: ["Authorization"],
      },
    ];
  }

  /**
   * Generate test data for content type validation
   */
  generateContentTypeTestData(): Array<{
    content_type: string;
    payload: any;
  }> {
    return [
      {
        content_type: "application/json",
        payload: { client_id: "test", client_secret: "secret" },
      },
      {
        content_type: "application/x-www-form-urlencoded",
        payload: "client_id=test&client_secret=secret",
      },
      {
        content_type: "text/plain",
        payload: "invalid payload",
      },
      {
        content_type: "application/xml",
        payload: "<xml>invalid</xml>",
      },
    ];
  }

  /**
   * Generate test data for encoding validation
   */
  generateEncodingTestData(): Array<{
    encoding: string;
    payload: string;
  }> {
    return [
      {
        encoding: "utf-8",
        payload: "test payload with unicode: 测试",
      },
      {
        encoding: "latin1",
        payload: "test payload with latin1: café",
      },
      {
        encoding: "ascii",
        payload: "test payload ascii only",
      },
    ];
  }

  /**
   * Validate that response contains expected security measures
   */
  validateSecurityResponse(response: any): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for sensitive information leakage
    if (response.body && typeof response.body === "string") {
      if (response.body.includes("password") || response.body.includes("secret")) {
        issues.push("Potential sensitive information leakage");
      }
    }

    // Check for stack traces in error responses
    if (response.status >= 400 && response.body) {
      if (response.body.includes("Traceback") || response.body.includes("at ")) {
        issues.push("Stack trace exposed in error response");
      }
    }

    // Check for proper error messages
    if (response.status === 401 && !response.body.includes("unauthorized")) {
      issues.push("Missing or improper unauthorized error message");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
