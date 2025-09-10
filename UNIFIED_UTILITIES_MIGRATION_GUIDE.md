# Reynard Unified Utilities Migration Guide

🦊> *sharpens claws with determination* This guide will help you migrate existing Reynard packages to use the newly unified utilities, eliminating duplication and improving maintainability.

## 🎯 Overview

We've unified the following duplicated patterns across Reynard packages:

1. **HTTP Client Patterns** → `reynard-connection` package
2. **Error Handling Patterns** → `reynard-connection` package  
3. **Validation Logic** → `reynard-connection` package
4. **Configuration Constants** → `reynard-config` package
5. **Testing Infrastructure** → Enhanced `reynard-testing` package with unified utilities

## 📦 Package Updates

### 1. HTTP Client Unification

**Before (Duplicated across packages):**

```typescript
// packages/core/src/clients/http-client.ts
export class HttpClient {
  async request<T>(options: RequestOptions): Promise<T> {
    // Duplicated retry logic, error handling, etc.
  }
}

// packages/api-client/src/client.ts  
export function createReynardApiClient(config) {
  // Duplicated HTTP client setup
}
```

**After (Unified):**

```typescript
// Use unified HTTP client from reynard-connection
import { HTTPClient, HTTPClientConfig } from "reynard-connection";

const httpClient = new HTTPClient({
  baseUrl: "https://api.example.com",
  timeout: 30000,
  retries: 3,
  enableRetry: true,
  enableCircuitBreaker: true,
  enableMetrics: true,
});

// Use convenience methods
const response = await httpClient.get("/api/users");
const result = await httpClient.post("/api/users", userData);
```

### 2. Error Handling Unification

**Before (Duplicated across packages):**

```typescript
// packages/ai-shared/src/utils/index.ts
export class ErrorUtils {
  static async retry<T>(fn: () => Promise<T>): Promise<T> {
    // Duplicated retry logic
  }
}

// packages/tools/src/core/BaseTool.ts
export class BaseTool {
  protected validateParameterType(param: ToolParameter, value: any): void {
    // Duplicated validation error handling
  }
}
```

**After (Unified):**

```typescript
// Use unified error handling from reynard-connection
import { 
  ReynardError, 
  ValidationError, 
  NetworkError,
  errorHandler,
  retry,
  wrapAsync 
} from "reynard-connection";

// Standardized error creation
const error = new ValidationError("Invalid input", {
  timestamp: Date.now(),
  source: "my-package",
  field: "email",
  value: "invalid-email",
});

// Retry with exponential backoff
const result = await retry(
  () => riskyOperation(),
  { maxRetries: 3, baseDelay: 1000 }
);

// Wrap async operations
const result = await wrapAsync(
  () => asyncOperation(),
  "Operation failed",
  { timestamp: Date.now(), source: "my-package" }
);
```

### 3. Validation Logic Unification

**Before (Duplicated across packages):**

```typescript
// packages/settings/src/utils/index.ts
export function validateSetting(definition: SettingDefinition, value: any): ValidationResult {
  // Duplicated validation logic
}

// packages/ai-shared/src/utils/index.ts
export class ValidationUtils {
  static validateValue(value: any, schema: any): ValidationResult {
    // Duplicated validation logic
  }
}
```

**After (Unified):**

```typescript
// Use unified validation from reynard-connection
import { 
  ValidationUtils, 
  ValidationSchema, 
  validateValue,
  validateEmail,
  validatePassword,
  CommonSchemas 
} from "reynard-connection";

// Standardized validation
const schema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 3,
  maxLength: 30,
  pattern: /^[a-zA-Z0-9_-]+$/,
};

const result = validateValue("username", schema, { fieldName: "username" });

// Use common schemas
const emailResult = validateEmail("user@example.com");
const passwordResult = validatePassword("SecurePass123!");
```

### 4. Configuration Constants Unification

**Before (Duplicated across packages):**

```typescript
// packages/connection/src/config.ts
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;

// packages/ai-shared/src/types/configuration.ts
const DEFAULT_BATCH_SIZE = 32;
const DEFAULT_CACHE_SIZE = 1000;
```

**After (Unified):**

```typescript
// Use unified constants from reynard-config
import { 
  HTTP_CONSTANTS,
  VALIDATION_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  SECURITY_CONSTANTS,
  REYNARD_DEFAULTS 
} from "reynard-config";

// Use standardized constants
const timeout = HTTP_CONSTANTS.DEFAULT_TIMEOUT;
const retries = HTTP_CONSTANTS.DEFAULT_RETRIES;
const passwordMinLength = VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH;

// Use default configurations
const httpConfig = REYNARD_DEFAULTS.http;
const validationConfig = REYNARD_DEFAULTS.validation;
```

### 5. Testing Infrastructure Unification

**Before (Duplicated across packages):**

```typescript
// packages/components/src/__tests__/Button.test.tsx
import { render, screen } from "@solidjs/testing-library";
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// Duplicated test setup in every test file
```

**After (Unified):**

```typescript
// Use unified testing utilities from reynard-testing
import { 
  setupStandardTest,
  testComponentRendering,
  testAPIClient,
  testValidation,
  createMockFunction 
} from "reynard-testing";

// One-line test setup
setupStandardTest();

// Test component rendering
test("renders button correctly", async () => {
  await testComponentRendering(Button, {
    props: { variant: "primary", children: "Click me" }
  });
});

// Test API calls
test("handles API response", async () => {
  await testAPIClient(() => api.getUsers(), {
    mockResponse: { users: [] }
  });
});

// Test validation
test("validates email correctly", () => {
  testValidation(validateEmail, {
    validValues: ["user@example.com"],
    invalidValues: ["invalid-email"],
    errorMessages: ["must be a valid email address"]
  });
});
```

## ✅ Completed Migrations

The following packages have been successfully migrated to use unified utilities:

### 1. **reynard-core** ✅

- **HTTP Client**: Migrated to use `HTTPClient` from `reynard-connection`
- **Backward Compatibility**: Legacy interfaces maintained with deprecation warnings
- **Dependencies**: Added `reynard-connection` dependency

### 2. **reynard-ai-shared** ✅

- **Validation**: Re-exports unified `ValidationUtils` from `reynard-connection`
- **Error Handling**: Re-exports unified error handling utilities
- **Backward Compatibility**: Legacy classes marked as deprecated
- **Dependencies**: Added `reynard-connection` dependency

### 3. **reynard-settings** ✅

- **Validation**: Migrated to use unified validation types and utilities
- **Backward Compatibility**: Legacy interfaces maintained for existing code
- **Dependencies**: Added `reynard-connection` dependency

### 4. **reynard-testing** ✅

- **Test Utilities**: Renamed `consolidated-utils.ts` to `unified-test-utils.ts`
- **Function Names**: Updated `setupConsolidatedTest` to `setupStandardTest`
- **Documentation**: Updated all references to use "unified" terminology

## 🔄 Migration Steps

### Step 1: Update Package Dependencies

Add the consolidated packages to your `package.json`:

```json
{
  "dependencies": {
    "reynard-connection": "workspace:*",
    "reynard-config": "workspace:*"
  },
  "devDependencies": {
    "reynard-testing": "workspace:*"
  }
}
```

### Step 2: Replace HTTP Client Usage

**Find and replace patterns:**

```bash
# Search for HTTP client usage
grep -r "class.*Client" packages/
grep -r "fetch(" packages/
grep -r "axios" packages/
```

**Replace with:**

```typescript
import { HTTPClient } from "reynard-connection";
```

### Step 3: Replace Error Handling

**Find and replace patterns:**

```bash
# Search for error handling
grep -r "ErrorUtils" packages/
grep -r "retry.*async" packages/
grep -r "wrapAsync" packages/
```

**Replace with:**

```typescript
import { errorHandler, retry, wrapAsync } from "reynard-connection";
```

### Step 4: Replace Validation Logic

**Find and replace patterns:**

```bash
# Search for validation
grep -r "ValidationResult" packages/
grep -r "validateValue" packages/
grep -r "validateSetting" packages/
```

**Replace with:**

```typescript
import { ValidationUtils, validateValue } from "reynard-connection";
```

### Step 5: Replace Configuration Constants

**Find and replace patterns:**

```bash
# Search for constants
grep -r "DEFAULT_TIMEOUT" packages/
grep -r "DEFAULT_RETRIES" packages/
grep -r "MIN_LENGTH" packages/
```

**Replace with:**

```typescript
import { HTTP_CONSTANTS, VALIDATION_CONSTANTS } from "reynard-config";
```

### Step 6: Update Testing Infrastructure

**Find and replace patterns:**

```bash
# Search for test setup
grep -r "beforeEach.*clearAllMocks" packages/
grep -r "afterEach.*cleanup" packages/
```

**Replace with:**

```typescript
import { setupStandardTest } from "reynard-testing";
setupStandardTest();
```

## 🧪 Testing the Migration

### 1. Run Tests

```bash
# Test individual packages
cd packages/your-package
npm test

# Test all packages
npm run test:all
```

### 2. Check for Linting Errors

```bash
# Check for TypeScript errors
npm run typecheck

# Check for linting issues
npm run lint
```

### 3. Verify Functionality

```bash
# Build packages
npm run build

# Test in development
npm run dev
```

## 🎯 Benefits of Unification

### 1. **Reduced Duplication**

- Eliminated 6+ duplicated validation implementations
- Unified 4+ HTTP client patterns
- Unified error handling across all packages

### 2. **Improved Maintainability**

- Single source of truth for common utilities
- Easier to update and fix bugs
- Consistent behavior across packages

### 3. **Better Testing**

- Standardized test setup and utilities
- Reduced test boilerplate
- More comprehensive test coverage

### 4. **Enhanced Type Safety**

- Unified TypeScript interfaces
- Better IntelliSense support
- Consistent error types

### 5. **Performance Improvements**

- Shared utilities reduce bundle size
- Optimized retry and error handling
- Better caching strategies

## 🚨 Common Migration Issues

### 1. **Import Path Changes**

```typescript
// ❌ Old
import { ValidationResult } from "./utils";

// ✅ New  
import { ValidationResult } from "reynard-connection";
```

### 2. **API Changes**

```typescript
// ❌ Old
const result = ValidationUtils.validateValue(value, schema);

// ✅ New
const result = validateValue(value, schema, { fieldName: "field" });
```

### 3. **Error Handling Changes**

```typescript
// ❌ Old
try {
  await operation();
} catch (error) {
  // Custom error handling
}

// ✅ New
const result = await wrapAsync(
  () => operation(),
  "Operation failed",
  { timestamp: Date.now(), source: "my-package" }
);
```

## 📚 Additional Resources

- [Reynard Connection Package Documentation](./packages/connection/README.md)
- [Reynard Config Package Documentation](./packages/config/README.md)
- [Reynard Testing Package Documentation](./packages/testing/README.md)
- [TypeScript Migration Guide](./docs/typescript-migration.md)

## 🦊 Need Help?

If you encounter issues during migration:

1. Check the package documentation
2. Review the consolidated utility examples
3. Run tests to verify functionality
4. Check for linting errors
5. Ask for help in the Reynard development channel

*Happy hunting! The unification will make your codebase more maintainable and efficient.* 🦊
