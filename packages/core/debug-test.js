// Simple test to debug the validation issue
import { describe, it, expect } from 'vitest';

// Import the validateInput function directly from the source
import { validateInput } from './src/security/input-validation.js';

describe('Debug Validation', () => {
  it('should test each case individually', () => {
    const testCases = [
      { input: "valid@email.com", shouldPass: true },
      { input: '<script>alert("xss")</script>', shouldPass: false },
      { input: "'; DROP TABLE users; --", shouldPass: false },
      { input: "normalusername", shouldPass: true },
      { input: "../../../etc/passwd", shouldPass: false },
    ];

    testCases.forEach(({ input, shouldPass }, index) => {
      console.log(`\nTest ${index + 1}: "${input}" (expected: ${shouldPass})`);
      
      const result = validateInput(input, {
        maxLength: 100,
        allowHTML: false,
        allowSQL: false,
        allowXSS: false,
      });
      
      console.log(`  Result: ${result.isValid ? "VALID" : "INVALID"}`);
      if (result.errors) {
        console.log(`  Errors: [${result.errors.join(", ")}]`);
      }
      
      expect(result.isValid).toBe(shouldPass);
    });
  });
});
