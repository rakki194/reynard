# 🦊 Reynard Queue Watcher

Queue-based file processing system for Reynard development workflow

## Overview

The Reynard Queue Watcher is a sophisticated file processing system that ensures all validators and formatters run in
perfect sequence for each file, eliminating race conditions and ensuring consistent results. Built with TypeScript and
designed for the Reynard framework, it provides a robust foundation for development workflows.

## Features

### 🦊 Strategic File Processing

- **Queue-based processing** - Ensures files are processed in sequence
- **Race condition prevention** - No more conflicts between processors
- **Intelligent cooldown** - Prevents excessive processing of the same file
- **Configurable file types** - Support for Markdown, Python, TypeScript, and JavaScript

### 🦦 Quality Assurance

- **Comprehensive validation** - Built-in processors for common file types
- **Automatic formatting** - Prettier and ESLint integration
- **Error resilience** - Continues processing even if individual steps fail
- **Extensible architecture** - Easy to add new file types and processors

### 🐺 Robust Architecture

- **Type safety** - Full TypeScript coverage with strict type checking
- **Modular design** - Clean separation of concerns
- **CLI interface** - Command-line tool for easy integration
- **Programmatic API** - Use as a library in other projects

## Installation

```bash
# Install as a dependency
pnpm install reynard-queue-watcher

# Or install globally for CLI usage
pnpm install -g reynard-queue-watcher
```

## Quick Start

### CLI Usage

```bash
# Basic usage
reynard-queue-watcher

# Custom directories
reynard-queue-watcher --directories src docs examples

# Custom cooldown and reporting interval
reynard-queue-watcher --cooldown 1000 --interval 5000

# Disable specific file types
reynard-queue-watcher --no-markdown --no-python
```

### Programmatic Usage

```typescript
import { queueManager, Processors } from "reynard-queue-watcher";

// Add a file to the processing queue
queueManager.enqueueFile(
  "path/to/file.md",
  [Processors.waitForStable, Processors.validateSentenceLength, Processors.validateLinks],
  {
    fileType: "markdown",
    priority: "normal",
  }
);

// Get queue status
const status = queueManager.getStatus();
console.log(`Processing ${status.processingFiles.length} files`);
```

## API Reference

### QueueManager

The main class for managing file processing queues.

#### Methods

- **`enqueueFile(filePath, processors, options)`** - Add a file to the processing queue
- **`getStatus()`** - Get current queue status and statistics
- **`cleanup()`** - Clean up completed queues

#### Example

```typescript
import { createQueueManager } from "reynard-queue-watcher";

const manager = createQueueManager();
manager.enqueueFile("file.ts", [Processors.formatWithPrettier]);
```

### Processors

Predefined processor functions for common file processing tasks.

#### Available Processors

- **`waitForStable`** - Wait for file to be stable (not being written to)
- **`validateSentenceLength`** - Validate markdown sentence length
- **`validateLinks`** - Validate markdown links
- **`validateToC`** - Validate markdown table of contents
- **`formatWithPrettier`** - Format code with Prettier
- **`fixWithESLint`** - Fix code with ESLint
- **`validatePython`** - Validate Python syntax

#### Example

```typescript
import { Processors } from "reynard-queue-watcher";

// Use individual processors
await Processors.formatWithPrettier("file.ts");
await Processors.validatePython("script.py");

// Chain processors
const processors = [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint];
```

### Types

Comprehensive TypeScript definitions for all interfaces and types.

#### Core Types

```typescript
interface FileProcessor {
  (filePath: string, options?: ProcessingOptions): Promise<void>;
}

interface ProcessingOptions {
  fileType?: FileType;
  priority?: Priority;
  delay?: number;
  [key: string]: unknown;
}

type FileType = "markdown" | "python" | "typescript" | "javascript";
type Priority = "low" | "normal" | "high";
```

## Configuration

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  watchDirectories: ["docs", "packages", "examples", "templates", ".cursor/docs"],
  excludePatterns: [
    /\/dist\//, // dist folders
    /\/node_modules\//, // node_modules
    /\/\.git\//, // .git folder
    /\/\.vscode\//, // .vscode folder
    /\/build\//, // build folders
    /\/coverage\//, // coverage folders
    /\/\.nyc_output\//, // nyc output
    /\/\.cache\//, // cache folders
    /\/tmp\//, // temporary folders
  ],
  processingCooldown: 2000, // 2 seconds
  statusReportInterval: 10000, // 10 seconds
};
```

### CLI Options

- **`--directories <dirs...>`** - Directories to watch (default: docs, packages, examples, templates, .cursor/docs)
- **`--cooldown <ms>`** - Processing cooldown in milliseconds (default: 2000)
- **`--interval <ms>`** - Status report interval in milliseconds (default: 10000)
- **`--no-markdown`** - Disable markdown processing
- **`--no-python`** - Disable Python processing
- **`--no-typescript`** - Disable TypeScript/JavaScript processing

## File Type Support

### Markdown Files (`.md`, `.markdown`)

- Sentence length validation
- Link validation
- Table of contents validation

### Python Files (`.py`)

- Python syntax validation
- Code quality checks

### TypeScript/JavaScript Files (`.ts`, `.tsx`, `.js`, `.jsx`)

- Prettier formatting
- ESLint fixes
- Type checking (TypeScript files)

## Development

### Adding New File Types

1. **Define the file type** in the `FileType` union:

```typescript
type FileType = "markdown" | "python" | "typescript" | "javascript" | "your-new-type";
```

2. **Create a processor function**:

```typescript
function processYourNewFileType(filePath: string): void {
  // Your processing logic here
}
```

3. **Add to the switch statement** in the CLI:

```typescript
case ".your-extension":
  processYourNewFileType(filePath, cooldown);
  break;
```

### Adding New Processors

1. **Define the processor function**:

```typescript
async function yourNewProcessor(filePath: string, options: ProcessingOptions = {}): Promise<void> {
  // Your processor logic here
}
```

2. **Add to the Processors object**:

```typescript
export const Processors = {
  // ... existing processors
  yourNewProcessor,
} as const;
```

3. **Use in processing chains**:

```typescript
const processors: FileProcessor[] = [
  Processors.waitForStable,
  Processors.yourNewProcessor,
  // ... other processors
];
```

## Performance

### Optimizations

- **Cooldown system** - Prevents excessive processing of the same file
- **Queue management** - Efficient processing with proper sequencing
- **Memory cleanup** - Automatic cleanup of completed queues
- **Error isolation** - Failed processors don't stop the entire chain

### Monitoring

The watcher provides real-time status updates:

```
📊 Queue Status: 2 files processing, 5 total queues
```

## Troubleshooting

### Common Issues

1. **TypeScript compilation errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript configuration in `tsconfig.json`

2. **File watching not working**
   - Verify directories exist and are accessible
   - Check exclusion patterns aren't too broad

3. **Processors failing**
   - Ensure required tools are installed (Prettier, ESLint, Python)
   - Check file permissions and paths

### Debug Mode

Enable verbose logging by modifying the console.log statements or adding debug flags.

## Integration

### With Reynard Framework

The queue watcher integrates seamlessly with the Reynard framework:

```typescript
import { queueManager } from "reynard-queue-watcher";
import { Processors } from "reynard-queue-watcher";

// Use in Reynard development workflow
queueManager.enqueueFile("src/component.tsx", [
  Processors.waitForStable,
  Processors.formatWithPrettier,
  Processors.fixWithESLint,
]);
```

### With Other Tools

The queue watcher can be integrated with any Node.js project:

```typescript
import { createQueueManager } from "reynard-queue-watcher";

const manager = createQueueManager();
// Use manager in your application
```

## Contributing

When contributing to this package:

1. **Follow TypeScript best practices** - Use strict typing
2. **Add proper error handling** - Handle all error cases
3. **Write comprehensive tests** - Ensure reliability
4. **Update documentation** - Keep this README current

## License

MIT License - see LICENSE file for details.

---

_Built with the cunning of a fox, the thoroughness of an otter, and the determination of a wolf._ 🦊🦦🐺
