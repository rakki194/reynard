# Trace Analyzer CLI - Modular Architecture

🦦 _splashes with enthusiasm_ Welcome to the beautifully organized Trace Analyzer CLI! This modular architecture follows the Reynard 140-line axiom and otter principles of thorough organization.

## Architecture Overview

The CLI has been refactored from a single 237-line monolith into focused, maintainable modules:

```
e2e/scripts/cli/
├── index.ts                    # Barrel exports (10 lines)
├── types.ts                    # Type definitions (60 lines)
├── trace-analyzer-cli.ts       # Main CLI orchestrator (95 lines)
├── options-parser.ts           # Argument parsing (55 lines)
├── help.ts                     # Help system (45 lines)
├── comparison.ts               # Trace comparison logic (85 lines)
└── output/                     # Output format handlers
    ├── index.ts                # Output barrel exports (8 lines)
    ├── console-output.ts       # Console formatting (95 lines)
    ├── json-output.ts          # JSON formatting (75 lines)
    └── markdown-output.ts      # Markdown formatting (85 lines)
```

## Key Benefits

### 🦦 Otter-Style Organization

- **Single Responsibility**: Each module handles one specific concern
- **Clear Separation**: Options, output, comparison, and help are isolated
- **Easy Testing**: Small, focused modules are easier to test comprehensively
- **Maintainable**: Changes are localized and predictable

### 🦊 Fox-Style Strategy

- **Escape Hatches**: Multiple output formats provide flexibility
- **Elegant Design**: Clean interfaces and proper TypeScript typing
- **Strategic Architecture**: Barrel exports enable easy integration

### 🐺 Wolf-Style Reliability

- **Error Handling**: Comprehensive error management with helpful messages
- **Input Validation**: Robust argument parsing with validation
- **Type Safety**: Full TypeScript coverage with strict interfaces

## Module Descriptions

### Core Components

#### `trace-analyzer-cli.ts` (95 lines)

The main orchestrator that coordinates the analysis workflow. Handles the high-level flow while delegating specific tasks to specialized modules.

#### `types.ts` (60 lines)

Comprehensive TypeScript interfaces and types. Provides type safety across all modules and enables better IDE support.

#### `options-parser.ts` (55 lines)

Handles command-line argument parsing with validation. Includes custom error types for help requests and invalid options.

#### `help.ts` (45 lines)

Centralized help system with formatted output, error help, and version information.

#### `comparison.ts` (85 lines)

Dedicated comparison logic with change calculation, improvement detection, and summary generation.

### Output Handlers

#### `console-output.ts` (95 lines)

Human-readable console output with emoji formatting, performance metrics, and verbose resource listings.

#### `json-output.ts` (75 lines)

Machine-readable JSON output with structured data and comparison results.

#### `markdown-output.ts` (85 lines)

Markdown report generation with tables, formatting, and comprehensive comparison reports.

## Usage Examples

### Basic Analysis

```bash
tsx trace-analyzer-cli.ts -i trace.zip
```

### Markdown Report

```bash
tsx trace-analyzer-cli.ts -i trace.zip -f markdown -o report.md
```

### Comparison with JSON Output

```bash
tsx trace-analyzer-cli.ts -i trace1.zip -c trace2.zip -f json
```

### Verbose Console Output

```bash
tsx trace-analyzer-cli.ts -i trace.zip -v
```

## Integration

### Importing the CLI

```typescript
import { TraceAnalyzerCLI } from "./cli";

const cli = new TraceAnalyzerCLI();
await cli.run(process.argv.slice(2));
```

### Using Individual Components

```typescript
import { OptionsParser, ConsoleOutputHandler, TraceComparison } from "./cli";

// Parse options
const options = OptionsParser.parseArgs(args);

// Output results
ConsoleOutputHandler.output(analysis, options);

// Compare traces
const comparison = TraceComparison.compare(analysis1, analysis2);
```

## Development Principles

### The 140-Line Axiom

Every source file is under 140 lines, forcing clear separation of concerns and improved readability.

### Modular Design

- Each module has a single, well-defined responsibility
- Clear interfaces between modules
- Easy to test, maintain, and extend

### TypeScript Excellence

- Strict typing throughout
- Comprehensive interfaces
- No `any` types (except where absolutely necessary)

### Error Handling

- Graceful error handling with helpful messages
- Custom error types for different scenarios
- Proper exit codes and error reporting

## Testing Strategy

Each module can be tested independently:

```typescript
// Test options parsing
import { OptionsParser } from "./options-parser";
const options = OptionsParser.parseArgs(["-i", "test.zip"]);

// Test output formatting
import { ConsoleOutputHandler } from "./output";
ConsoleOutputHandler.output(mockAnalysis, mockOptions);

// Test comparison logic
import { TraceComparison } from "./comparison";
const result = TraceComparison.compare(analysis1, analysis2);
```

## Future Enhancements

The modular architecture makes it easy to add:

- New output formats (CSV, HTML, etc.)
- Additional comparison metrics
- Plugin system for custom analyzers
- Configuration file support
- Interactive mode

## Migration Notes

The original `trace-analyzer-cli.ts` file now serves as a compatibility layer that imports the new modular implementation. All existing functionality is preserved while benefiting from the improved architecture.

---

_This modular architecture embodies the Reynard way: strategic thinking (fox), thorough organization (otter), and reliable execution (wolf). Every module is crafted with the precision of an otter grooming its fur!_ 🦦
