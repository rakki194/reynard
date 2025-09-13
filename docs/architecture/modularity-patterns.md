# 🦊 Reynard Modularity Patterns

_Strategic architecture patterns for maintainable, scalable code_

## Overview

Reynard follows the **140-line axiom** - a strategic approach to code organization that emphasizes modularity,
maintainability, and clarity. This document outlines the proven patterns and
refactoring strategies used throughout the Reynard codebase.

## Core Principles

### The 140-Line Axiom

Every source file should be under 140 lines (excluding blank lines and comments). This constraint forces:

- **Clear Separation of Concerns**: Each file has a single, well-defined responsibility
- **Improved Readability**: Files are small enough to understand at a glance
- **Better Testability**: Smaller modules are easier to test comprehensively
- **Enhanced Maintainability**: Changes are localized and predictable

### Modularity Standards

| File Type     | Max Lines | Max Function Lines | Purpose                 |
| ------------- | --------- | ------------------ | ----------------------- |
| Source Files  | 140       | 50                 | Core business logic     |
| Test Files    | 200       | 100                | Comprehensive testing   |
| Configuration | 50        | 25                 | Setup and configuration |
| Documentation | 200       | N/A                | Guides and references   |

## Proven Refactoring Patterns

### 1. Factory Pattern

**Use Case**: When a single class handles multiple types or variants

**Before** (631 lines):

```typescript
// geometry.ts - Monolithic geometry operations
export class GeometryOps {
  // Point operations
  static createPoint(x: number, y: number) {
    /* ... */
  }
  static addPoints(a: Point, b: Point) {
    /* ... */
  }

  // Vector operations
  static createVector(x: number, y: number) {
    /* ... */
  }
  static dotProduct(a: Vector, b: Vector) {
    /* ... */
  }

  // Line operations
  static createLine(start: Point, end: Point) {
    /* ... */
  }
  static lineIntersection(a: Line, b: Line) {
    /* ... */
  }

  // ... 600+ more lines
}
```

**After** (Modular):

```typescript
// vector-algorithms.ts (150 lines)
export class PointOps {
  /* ... */
}
export class VectorOps {
  /* ... */
}

// collision-algorithms.ts (150 lines)
export class LineOps {
  /* ... */
}
export class RectangleOps {
  /* ... */
}

// transformation-algorithms.ts (150 lines)
export class TransformOps {
  /* ... */
}

// geometry.ts (24 lines) - Orchestrator
export { PointOps, VectorOps } from "./vector-algorithms";
export { LineOps, RectangleOps } from "./collision-algorithms";
export { TransformOps } from "./transformation-algorithms";
```

**Benefits**:

- 93% reduction in main file size
- Specialized modules for different concerns
- Easier to test and maintain
- Clear import structure

### 2. Composable Pattern

**Use Case**: When a single composable handles multiple related concerns

**Before** (980 lines):

```typescript
// useP2PChat.ts - Monolithic chat composable
export function useP2PChat() {
  // WebSocket connection logic (200 lines)
  // Message handling (200 lines)
  // Room management (200 lines)
  // File upload (200 lines)
  // State management (180 lines)
}
```

**After** (Modular):

```typescript
// useP2PConnection.ts (200 lines)
export function useP2PConnection() {
  /* ... */
}

// useP2PMessages.ts (200 lines)
export function useP2PMessages() {
  /* ... */
}

// useP2PRooms.ts (150 lines)
export function useP2PRooms() {
  /* ... */
}

// useP2PFileUpload.ts (150 lines)
export function useP2PFileUpload() {
  /* ... */
}

// useP2PChat.ts (370 lines) - Orchestrator
export function useP2PChat() {
  const connection = useP2PConnection();
  const messages = useP2PMessages();
  const rooms = useP2PRooms();
  const fileUpload = useP2PFileUpload();

  return { connection, messages, rooms, fileUpload };
}
```

**Benefits**:

- 62% reduction in main file size
- Focused composables for specific concerns
- Better reusability across components
- Enhanced testability

### 3. Test Orchestrator Pattern

**Use Case**: When test files become too large and complex

**Before** (775 lines):

```typescript
// i18n-core.test.ts - Monolithic test suite
describe("i18n-core", () => {
  describe("core functionality", () => {
    /* 200 lines */
  });
  describe("translation logic", () => {
    /* 200 lines */
  });
  describe("pluralization", () => {
    /* 200 lines */
  });
  describe("integration tests", () => {
    /* 175 lines */
  });
});
```

**After** (Modular):

```typescript
// i18n-core.test.ts (150 lines)
describe("i18n-core", () => {
  /* core functionality */
});

// i18n-translations.test.ts (150 lines)
describe("i18n-translations", () => {
  /* translation logic */
});

// i18n-pluralization.test.ts (150 lines)
describe("i18n-pluralization", () => {
  /* pluralization */
});

// i18n-integration.test.ts (150 lines)
describe("i18n-integration", () => {
  /* integration tests */
});
```

**Benefits**:

- 81% reduction in main test file size
- Focused test suites for specific functionality
- Better test organization and maintainability
- Faster test execution with parallel runs

### 4. Category-Specific Modules Pattern

**Use Case**: When configuration files become too large

**Before** (673 lines):

```typescript
// file-types.ts - Monolithic configuration
export const IMAGE_TYPES = {
  /* 100 lines */
};
export const VIDEO_TYPES = {
  /* 100 lines */
};
export const AUDIO_TYPES = {
  /* 100 lines */
};
export const DOCUMENT_TYPES = {
  /* 100 lines */
};
export const CODE_TYPES = {
  /* 100 lines */
};
export const TEXT_TYPES = {
  /* 100 lines */
};
export const ARCHIVE_TYPES = {
  /* 73 lines */
};
```

**After** (Modular):

```typescript
// image-types.ts (150 lines)
export const IMAGE_TYPES = {
  /* ... */
};

// video-types.ts (150 lines)
export const VIDEO_TYPES = {
  /* ... */
};

// audio-types.ts (100 lines)
export const AUDIO_TYPES = {
  /* ... */
};

// document-types.ts (150 lines)
export const DOCUMENT_TYPES = {
  /* ... */
};

// code-types.ts (100 lines)
export const CODE_TYPES = {
  /* ... */
};

// text-types.ts (100 lines)
export const TEXT_TYPES = {
  /* ... */
};

// archive-types.ts (100 lines)
export const ARCHIVE_TYPES = {
  /* ... */
};

// file-types.ts (50 lines) - Aggregator
export { IMAGE_TYPES } from "./image-types";
export { VIDEO_TYPES } from "./video-types";
// ... other exports
```

**Benefits**:

- 93% reduction in main config file size
- Category-specific modules for different file types
- Easier to maintain and extend
- Clear separation of concerns

## Refactoring Guidelines

### Step-by-Step Refactoring Process

1. **Analyze the Current File**
   - Identify distinct responsibilities
   - Look for natural boundaries
   - Count lines and functions

2. **Plan the Split**
   - Determine module boundaries
   - Design the orchestrator pattern
   - Plan import/export structure

3. **Create Specialized Modules**
   - Extract related functionality
   - Maintain single responsibility
   - Keep modules under 150 lines

4. **Create the Orchestrator**
   - Re-export from specialized modules
   - Maintain backward compatibility
   - Keep orchestrator under 140 lines

5. **Update Tests**
   - Split test files accordingly
   - Maintain test coverage
   - Update imports

6. **Verify Functionality**
   - Run all tests
   - Check for breaking changes
   - Update documentation

### Common Refactoring Strategies

#### Strategy 1: Extract by Functionality

```typescript
// Before: Single large class
class FileProcessor {
  processImage() {
    /* ... */
  }
  processVideo() {
    /* ... */
  }
  processAudio() {
    /* ... */
  }
  processDocument() {
    /* ... */
  }
}

// After: Specialized processors
class ImageProcessor {
  /* ... */
}
class VideoProcessor {
  /* ... */
}
class AudioProcessor {
  /* ... */
}
class DocumentProcessor {
  /* ... */
}
```

#### Strategy 2: Extract by Layer

```typescript
// Before: Mixed concerns
class UserService {
  validateUser() {
    /* validation logic */
  }
  hashPassword() {
    /* security logic */
  }
  saveUser() {
    /* persistence logic */
  }
  sendEmail() {
    /* notification logic */
  }
}

// After: Separated concerns
class UserValidator {
  /* ... */
}
class PasswordUtils {
  /* ... */
}
class UserRepository {
  /* ... */
}
class EmailService {
  /* ... */
}
```

#### Strategy 3: Extract by Type

```typescript
// Before: Mixed types
const CONFIG = {
  imageTypes: {
    /* ... */
  },
  videoTypes: {
    /* ... */
  },
  audioTypes: {
    /* ... */
  },
  documentTypes: {
    /* ... */
  },
};

// After: Type-specific modules
// image-types.ts
// video-types.ts
// audio-types.ts
// document-types.ts
```

## Enforcement Mechanisms

### ESLint Rules

```javascript
// eslint.config.js
rules: {
  "max-lines": ["error", {
    max: 140,
    skipBlankLines: true,
    skipComments: true
  }],
  "max-lines-per-function": ["error", {
    max: 50,
    skipBlankLines: true,
    skipComments: true
  }],
}
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
echo "📏 Checking file line counts..."
# Automated line count validation
# Prevents commits with violations
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Check modularity standards
  run: npm run lint
  # Fails build on violations
```

## Best Practices

### Do's ✅

- **Split by Responsibility**: Each module should have a single, clear purpose
- **Use Orchestrators**: Create main files that re-export from specialized modules
- **Maintain Backward Compatibility**: Don't break existing imports
- **Test Thoroughly**: Ensure all functionality works after refactoring
- **Document Changes**: Update README and documentation

### Don'ts ❌

- **Don't Split Arbitrarily**: Ensure logical boundaries exist
- **Don't Create Circular Dependencies**: Keep imports clean and simple
- **Don't Break Public APIs**: Maintain existing interfaces
- **Don't Skip Tests**: Always verify functionality after refactoring
- **Don't Ignore Performance**: Consider impact on bundle size

## Success Metrics

### Quantitative Metrics

- **File Size Reduction**: Target 60-90% reduction in main file size
- **Module Count**: Increase in focused, single-purpose modules
- **Test Coverage**: Maintain or improve test coverage
- **Build Time**: No significant increase in build time

### Qualitative Metrics

- **Code Readability**: Easier to understand and navigate
- **Maintainability**: Simpler to modify and extend
- **Testability**: More focused and comprehensive tests
- **Developer Experience**: Faster development and debugging

## Case Studies

### Case Study 1: Thumbnail Generator (1009 → 370 lines)

- **Strategy**: Factory pattern with specialized generators
- **Result**: 63% reduction, improved maintainability
- **Modules**: ImageThumbnailGenerator, VideoThumbnailGenerator, etc.

### Case Study 2: P2P Chat (980 → 370 lines)

- **Strategy**: Composable pattern with focused concerns
- **Result**: 62% reduction, better reusability
- **Modules**: useP2PConnection, useP2PMessages, etc.

### Case Study 3: File Types Config (673 → 50 lines)

- **Strategy**: Category-specific modules
- **Result**: 93% reduction, clearer organization
- **Modules**: image-types, video-types, audio-types, etc.

## Conclusion

The 140-line axiom and modularity patterns in Reynard create a codebase that is:

- **Maintainable**: Easy to understand and modify
- **Scalable**: Can grow without becoming unwieldy
- **Testable**: Focused modules are easier to test
- **Collaborative**: Multiple developers can work efficiently

By following these patterns and guidelines, teams can create code that stands the test of time and
scales with the project's growth.

---

_"The cunning fox knows that small, focused modules are the key to outfoxing complexity."_ 🦊
