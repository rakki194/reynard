# JavaScript Node.js Environment Configuration for ESLint

Guide to configuring ESLint for Node.js environments in the Reynard project.

## Overview

This document explains how to properly configure ESLint to recognize Node.js globals like `console`, `process`, and
`Buffer` in JavaScript files. The Reynard project uses a sophisticated ESLint configuration that
provides different environments for different file types, ensuring proper linting across the entire codebase.

## The Problem

When ESLint encounters JavaScript files that use Node.js globals like `console.log()`, it may throw errors like:

```text
'console' is not defined.
```

This happens because ESLint doesn't automatically know which
environment your JavaScript files are running in - browser, Node.js, or other environments.

## The Solution: Environment-Specific Configuration

The Reynard project solves this by defining specific ESLint configurations for different file patterns,
each with appropriate globals for their intended environment.

### Configuration Structure

```javascript
// eslint.config.js
export default [
  // Base configuration for all files
  js.configs.recommended,

  // TypeScript files - Browser + Node.js globals
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        // Browser globals
        document: "readonly",
        window: "readonly",
        console: "readonly",
        // ... other browser globals

        // Node.js globals
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
      },
    },
  },

  // Config files - Node.js environment
  {
    files: ["**/*.config.js", "**/*.config.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // Script files - Full Node.js environment
  {
    files: ["scripts/**/*.js", ".vscode/**/*.js"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },
];
```

## File Pattern Matching

The configuration uses file patterns to determine which globals are available:

### TypeScript Files (`**/*.{ts,tsx}`)

- **Environment**: Browser + Node.js hybrid
- **Use Case**: React components, utilities that work in both environments
- **Globals**: Both browser (`document`, `window`) and Node.js (`process`, `console`) globals

### Configuration Files (`**/*.config.js`, `**/*.config.mjs`)

- **Environment**: Node.js
- **Use Case**: Build configuration files, ESLint configs, etc.
- **Globals**: Core Node.js globals (`process`, `require`, `module`, `exports`)

### Script Files (`scripts/**/*.js`, `.vscode/**/*.js`)

- **Environment**: Full Node.js
- **Use Case**: Build scripts, development tools, VS Code extensions
- **Globals**: Complete Node.js environment including `Buffer`, timers, and file system APIs

## Common Node.js Globals

### Core Globals

```javascript
// Process and environment
process: "readonly",        // Node.js process object
global: "readonly",         // Global object
NodeJS: "readonly",         // Node.js type definitions

// Module system
require: "readonly",        // CommonJS require function
module: "readonly",         // Current module object
exports: "readonly",        // Module exports object
__dirname: "readonly",      // Current directory path
__filename: "readonly",     // Current file path
```

### I/O and Utilities

```javascript
// Console and logging
console: "readonly",        // Console object for logging

// Buffers and data
Buffer: "readonly",         // Buffer class for binary data

// Timers
setTimeout: "readonly",     // Set timeout function
clearTimeout: "readonly",   // Clear timeout function
setInterval: "readonly",    // Set interval function
clearInterval: "readonly",  // Clear interval function
```

## Adding New File Patterns

When adding new file patterns that need Node.js globals, follow this pattern:

```javascript
{
  files: ["your-pattern/**/*.js"],
  languageOptions: {
    globals: {
      // Start with core Node.js globals
      console: "readonly",
      process: "readonly",
      global: "readonly",
      NodeJS: "readonly",
      require: "readonly",
      module: "readonly",
      exports: "readonly",
      __dirname: "readonly",
      __filename: "readonly",

      // Add additional globals as needed
      Buffer: "readonly",
      setTimeout: "readonly",
      clearTimeout: "readonly",
      setInterval: "readonly",
      clearInterval: "readonly",
    },
  },
},
```

## Best Practices

### 1. Use Specific File Patterns

Instead of broad patterns like `**/*.js`, use specific patterns that match your actual use cases:

```javascript
// Good: Specific patterns
files: ["scripts/**/*.js", ".vscode/**/*.js", "tools/**/*.js"];

// Avoid: Too broad
files: ["**/*.js"];
```

### 2. Match Environment to Use Case

Ensure the globals you provide match the actual runtime environment:

- **Build scripts**: Full Node.js environment
- **Config files**: Core Node.js globals only
- **Browser code**: Browser globals only
- **Universal code**: Both browser and Node.js globals

### 3. Use "readonly" for All Globals

Always mark globals as `"readonly"` to prevent accidental reassignment:

```javascript
// Good
console: "readonly",

// Avoid
console: "writable",
```

## Troubleshooting

### Issue: `'console' is not defined`

**Cause**: File pattern doesn't match any configuration with `console` global
**Solution**: Add the file pattern to an appropriate configuration block

### Issue: `'process' is not defined`

**Cause**: File is in a browser-only configuration
**Solution**: Move to a Node.js configuration or add Node.js globals

### Issue: `'require' is not defined`

**Cause**: File is using CommonJS but in ES module configuration
**Solution**: Add `require: "readonly"` to the appropriate configuration

## Example: Adding Support for New Directory

If you create a new directory that needs Node.js globals:

```javascript
// Add to eslint.config.js
{
  files: ["new-tools/**/*.js"],
  languageOptions: {
    globals: {
      console: "readonly",
      process: "readonly",
      global: "readonly",
      NodeJS: "readonly",
      require: "readonly",
      module: "readonly",
      exports: "readonly",
      __dirname: "readonly",
      __filename: "readonly",
      Buffer: "readonly",
      setTimeout: "readonly",
      clearTimeout: "readonly",
      setInterval: "readonly",
      clearInterval: "readonly",
    },
  },
},
```

## Conclusion

Proper ESLint configuration for Node.js environments ensures that
your JavaScript files can use Node.js globals without linting errors. The Reynard project's approach of
environment-specific configurations provides flexibility while maintaining strict linting standards.

Key takeaways:

- Use specific file patterns to match your actual use cases
- Provide appropriate globals for each environment
- Mark all globals as `"readonly"` to prevent accidental modification
- Test your configuration with actual files to ensure it works correctly

_Strategic ESLint configuration is like a fox's den - every entrance serves a purpose, and
the structure adapts to the environment while maintaining security and functionality._ 🦊
