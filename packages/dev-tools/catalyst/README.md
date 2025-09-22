# ⚗️ Catalyst - Shared Dev-Tools Utilities

> **The alchemical base that transforms your dev-tools ecosystem into something even more powerful and maintainable!**

Catalyst provides unified utilities and base classes for all Reynard dev-tools, eliminating code duplication and ensuring consistent behavior across the entire ecosystem.

## 🎯 **Features**

- **🖥️ Unified CLI System**: Base classes and utilities for consistent command-line interfaces
- **📝 Unified Logging**: Consistent color schemes and formatting across all tools
- **📁 File Utilities**: Common file operations, type detection, and exclusion patterns
- **🔧 Type Definitions**: Shared interfaces and type definitions
- **⚡ Performance**: Optimized for speed and memory efficiency
- **🧪 Well Tested**: Comprehensive test coverage

## 📦 **Installation**

```bash
# Add to your dev-tools package
npm install @reynard/dev-tools-catalyst
```

## 🚀 **Quick Start**

### CLI Base Class

```typescript
import { BaseCLI } from '@reynard/dev-tools-catalyst';

class MyToolCLI extends BaseCLI {
  constructor() {
    super({
      name: 'my-tool',
      description: '🦊 My awesome dev tool',
      version: '1.0.0'
    });
  }

  protected setupCommands(): void {
    this.addCommand({
      name: 'generate',
      description: 'Generate something awesome',
      action: async (options) => {
        this.logStartup();
        // Your logic here
        this.logCompletion(true, 'Generation completed!');
      }
    });
  }
}

// Usage
const cli = new MyToolCLI();
cli.parse();
```

### Unified Logger

```typescript
import { ReynardLogger } from '@reynard/dev-tools-catalyst';

const logger = new ReynardLogger({ verbose: true });

logger.info('Processing files...');
logger.success('All files processed successfully!');
logger.warn('Some files had warnings');
logger.error('Failed to process file');
logger.section('Summary');
logger.summary({ files: 42, errors: 0, warnings: 3 });
```

### File Utilities

```typescript
import { FileTypeDetector, FileExclusionManager, FileManager } from '@reynard/dev-tools-catalyst';

// File type detection
const fileType = FileTypeDetector.getFileType('src/index.ts'); // 'typescript'

// File exclusion
const shouldExclude = FileExclusionManager.shouldExcludeFile('node_modules/package/index.js'); // true

// File operations
const fileManager = new FileManager({ verbose: true });
const files = fileManager.scanDirectory('./src', { extensions: ['.ts', '.js'] });
```

## 📚 **API Reference**

### CLI Module

#### `BaseCLI`

Base class for consistent CLI implementations.

**Methods:**

- `addCommand(command: CLICommand)`: Add a command to the CLI
- `handleBackup(filePath: string, backupDir?: string)`: Handle file backup
- `handleValidation(data: any, requiredFields: string[])`: Handle validation
- `handleError(error: Error)`: Handle errors consistently
- `setupGracefulShutdown(cleanup?: () => void)`: Setup graceful shutdown

#### `CLIUtils`

Utility functions for CLI operations.

**Methods:**

- `createBackup(options: BackupOptions)`: Create file backups
- `validateConfig(config: any, requiredFields: string[])`: Validate configurations
- `parseCommonOptions(args: string[])`: Parse common CLI options
- `handleError(error: Error, verbose?: boolean)`: Handle errors

### Logger Module

#### `ReynardLogger`

Unified logging system with consistent colors and formatting.

**Methods:**

- `info(message: string)`: Log info messages
- `warn(message: string)`: Log warning messages
- `error(message: string)`: Log error messages
- `success(message: string)`: Log success messages
- `debug(message: string)`: Log debug messages (verbose only)
- `section(title: string)`: Create section headers
- `header(title: string)`: Create main headers
- `summary(stats: Record<string, number>)`: Display statistics

### File Utils Module

#### `FileTypeDetector`

Detect file types from extensions.

**Methods:**

- `getFileType(filePath: string)`: Get file type from path
- `getSupportedExtensions()`: Get all supported extensions
- `isSupportedExtension(extension: string)`: Check if extension is supported

#### `FileExclusionManager`

Manage file exclusion patterns.

**Methods:**

- `shouldExcludeFile(filePath: string)`: Check if file should be excluded
- `getExclusionPatterns()`: Get all exclusion patterns
- `wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)`: Check recent processing

#### `FileManager`

Common file operations and directory scanning.

**Methods:**

- `scanDirectory(dirPath: string, options?: ScanOptions)`: Scan directory for files
- `readFile(filePath: string)`: Safely read file content
- `writeFile(filePath: string, content: string)`: Safely write file content
- `createBackup(filePath: string, backupDir?: string)`: Create file backup
- `shouldExcludeFile(filePath: string)`: Check file exclusion
- `getFileType(filePath: string)`: Get file type

## 🎨 **Color Scheme**

Catalyst uses a consistent color scheme across all tools:

- **🔵 Blue**: Info messages
- **🟡 Yellow**: Warning messages  
- **🔴 Red**: Error messages
- **🟢 Green**: Success messages
- **🟣 Magenta**: Debug messages and sections
- **🔵 Cyan**: Statistics and data

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 **Development**

```bash
# Build the package
npm run build

# Build in watch mode
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📋 **Migration Guide**

### From Custom CLI Implementations

**Before:**

```typescript
import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';

const program = new Command();
program
  .name('my-tool')
  .description('My tool')
  .version('1.0.0')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    // Custom implementation
  });
```

**After:**

```typescript
import { BaseCLI } from '@reynard/dev-tools-catalyst';

class MyToolCLI extends BaseCLI {
  constructor() {
    super({
      name: 'my-tool',
      description: 'My tool',
      version: '1.0.0'
    });
  }

  protected setupCommands(): void {
    // Commands setup
  }
}
```

### From Custom Logger Implementations

**Before:**

```typescript
class CustomLogger {
  private colors = { red: '\x1b[31m', green: '\x1b[32m' };
  
  info(message: string) {
    console.log(`${this.colors.blue}${message}`);
  }
  // ... more methods
}
```

**After:**

```typescript
import { ReynardLogger } from '@reynard/dev-tools-catalyst';

const logger = new ReynardLogger({ verbose: true });
logger.info('Message');
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](../../../LICENSE) for details.

## 🦊 **Reynard Ecosystem**

Catalyst is part of the Reynard ecosystem of dev-tools. Learn more at [reynard.dev](https://reynard.dev).

---

*Made with ⚗️ by the Reynard team*
