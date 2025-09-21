# 🦦 Docstring Validation System

_splashes with thoroughness_ Comprehensive docstring coverage and quality analysis for Python and TypeScript code.

## Overview

The Reynard Docstring Validation System extends the existing code quality framework to detect and analyze docstring coverage and quality across your codebase. It provides:

- **Coverage Analysis**: Detects missing docstrings for functions, classes, and modules
- **Quality Assessment**: Evaluates docstring completeness and quality
- **Quality Gates**: Enforces documentation standards through configurable thresholds
- **CLI Integration**: Command-line tools for easy analysis and reporting
- **Multi-language Support**: Python (docstrings) and TypeScript (JSDoc)

## Features

### 🦦 DocstringAnalyzer

The core analyzer that examines individual files and extracts:

- **Function Documentation**: Detects missing or poor function docstrings
- **Class Documentation**: Analyzes class-level documentation
- **Module Documentation**: Checks for module-level docstrings
- **Quality Metrics**: Calculates coverage percentages and quality scores

### 📊 Quality Metrics

The system tracks comprehensive documentation metrics:

- `docstringCoverage`: Overall coverage percentage
- `docstringQualityScore`: Quality score (0-100)
- `documentedFunctions`: Number of documented functions
- `totalFunctions`: Total number of functions
- `documentedClasses`: Number of documented classes
- `totalClasses`: Total number of classes
- `documentedModules`: Number of documented modules
- `totalModules`: Total number of modules

### 🚪 Quality Gates

Predefined quality gate presets:

- **Standard**: 80% coverage, 70% quality score
- **Strict**: 95% coverage, 85% quality score
- **Relaxed**: 60% coverage, 50% quality score

## Usage

### CLI Commands

#### Basic Analysis

```bash
# Analyze current directory
pnpm run code-quality docstring

# Analyze specific path
pnpm run code-quality docstring --path ./src

# Output in different formats
pnpm run code-quality docstring --format json
pnpm run code-quality docstring --format summary
pnpm run code-quality docstring --format table
```

#### Quality Gate Enforcement

```bash
# Set custom thresholds
pnpm run code-quality docstring --min-coverage 90 --min-quality 80

# The command will exit with code 1 if thresholds are not met
```

#### File Filtering

```bash
# Include specific file patterns
pnpm run code-quality docstring --include-files "**/*.py"

# Exclude specific directories
pnpm run code-quality docstring --exclude-files "**/tests/**,**/node_modules/**"
```

### Programmatic Usage

#### Basic Analysis

```typescript
import { DocstringAnalyzer } from "@reynard/code-quality";

const analyzer = new DocstringAnalyzer();

// Analyze a single file
const analysis = await analyzer.analyzeFile("./src/utils.py");

// Analyze multiple files
const analyses = await analyzer.analyzeFiles(["./src/utils.py", "./src/components.ts"]);

// Get overall metrics
const metrics = analyzer.getOverallMetrics(analyses);
console.log(`Coverage: ${metrics.coveragePercentage}%`);
console.log(`Quality Score: ${metrics.qualityScore}/100`);
```

#### Integration with Code Quality System

```typescript
import { CodeQualityAnalyzer } from "@reynard/code-quality";

const analyzer = new CodeQualityAnalyzer("./src");

// Docstring analysis is automatically included
const result = await analyzer.analyzeProject();

console.log("Docstring Coverage:", result.metrics.docstringCoverage);
console.log("Quality Score:", result.metrics.docstringQualityScore);
```

#### Quality Gates

```typescript
import { getDocstringQualityGates, createCustomDocstringGate } from "@reynard/code-quality";

// Use predefined gates
const standardGates = getDocstringQualityGates("standard");
const strictGates = getDocstringQualityGates("strict");

// Create custom gates
const customGate = createCustomDocstringGate(
  "my-custom-gate",
  "Custom Documentation Standards",
  85, // coverage threshold
  75, // quality threshold
  0.9, // function coverage
  0.95, // class coverage
  1.0 // module coverage
);
```

## Quality Assessment

### Docstring Quality Levels

The system assesses docstring quality on a scale:

- **Excellent**: Comprehensive documentation with parameters, returns, and examples
- **Good**: Adequate documentation with most required elements
- **Poor**: Minimal documentation missing key elements
- **Missing**: No documentation present

### Quality Indicators

The analyzer looks for:

- **Length**: Minimum character requirements
- **Parameters**: `@param` tags or parameter documentation
- **Returns**: `@return` or `@returns` documentation
- **Examples**: `@example` tags or usage examples
- **Descriptions**: Meaningful descriptions of functionality

### Minimum Requirements

Default minimum lengths:

- **Functions**: 10 characters
- **Classes**: 15 characters
- **Modules**: 30 characters

## Issue Detection

### Issue Types

The system detects and reports:

- **Missing Docstrings**: Functions, classes, or modules without documentation
- **Poor Quality**: Documentation that doesn't meet quality standards
- **Incomplete Documentation**: Missing parameter or return documentation

### Issue Severity

- **MAJOR**: Missing docstrings (15 minutes to fix)
- **MINOR**: Poor quality docstrings (10 minutes to fix)

## Configuration

### Custom Quality Gates

```typescript
import { createCustomDocstringGate } from "@reynard/code-quality";

const customGate = createCustomDocstringGate(
  "enterprise-standards",
  "Enterprise Documentation Standards",
  95, // 95% coverage required
  85, // 85% quality score required
  0.95, // 95% of functions documented
  1.0, // 100% of classes documented
  1.0 // 100% of modules documented
);
```

### File Filtering

```typescript
// Custom file discovery
const files = await fileDiscovery.discoverFiles("./src", {
  include: ["**/*.py", "**/*.ts", "**/*.tsx"],
  exclude: ["**/tests/**", "**/node_modules/**", "**/dist/**"],
});
```

## Integration Examples

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Check Documentation Coverage
  run: |
    pnpm run code-quality docstring --min-coverage 80 --min-quality 70
    if [ $? -ne 0 ]; then
      echo "Documentation coverage below threshold"
      exit 1
    fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🦦 Checking documentation coverage..."
pnpm run code-quality docstring --min-coverage 70

if [ $? -ne 0 ]; then
  echo "❌ Documentation coverage check failed"
  echo "Please add or improve docstrings before committing"
  exit 1
fi
```

### VS Code Integration

```json
// .vscode/tasks.json
{
  "label": "Check Documentation",
  "type": "shell",
  "command": "pnpm",
  "args": ["run", "code-quality", "docstring", "--format", "table"],
  "group": "test",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "focus": false,
    "panel": "shared"
  }
}
```

## Best Practices

### Python Docstrings

```python
def calculate_total(items: List[Item], tax_rate: float) -> float:
    """
    Calculate the total cost including tax for a list of items.

    Args:
        items: List of items to calculate total for
        tax_rate: Tax rate as a decimal (e.g., 0.08 for 8%)

    Returns:
        Total cost including tax

    Raises:
        ValueError: If tax_rate is negative

    Example:
        >>> items = [Item(price=10.0), Item(price=20.0)]
        >>> total = calculate_total(items, 0.08)
        >>> print(f"Total: ${total:.2f}")
        Total: $32.40
    """
    if tax_rate < 0:
        raise ValueError("Tax rate cannot be negative")

    subtotal = sum(item.price for item in items)
    return subtotal * (1 + tax_rate)
```

### TypeScript JSDoc

````typescript
/**
 * Calculate the total cost including tax for a list of items.
 *
 * @param items - List of items to calculate total for
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns Total cost including tax
 * @throws {Error} If taxRate is negative
 *
 * @example
 * ```typescript
 * const items = [new Item(10.0), new Item(20.0)];
 * const total = calculateTotal(items, 0.08);
 * console.log(`Total: $${total.toFixed(2)}`);
 * // Output: Total: $32.40
 * ```
 */
export function calculateTotal(items: Item[], taxRate: number): number {
  if (taxRate < 0) {
    throw new Error("Tax rate cannot be negative");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}
````

## Troubleshooting

### Common Issues

1. **"No Python or TypeScript files found"**
   - Check file paths and extensions
   - Verify include/exclude patterns

2. **"Analysis failed"**
   - Check file permissions
   - Ensure files are valid Python/TypeScript

3. **"Quality gates failed"**
   - Review coverage and quality scores
   - Adjust thresholds or improve documentation

### Debug Mode

```bash
# Enable verbose output
DEBUG=reynard:docstring pnpm run code-quality docstring
```

## Contributing

To extend the docstring validation system:

1. **Add new languages**: Extend `DocstringAnalyzer` with new language parsers
2. **Custom quality rules**: Create new quality assessment criteria
3. **Additional metrics**: Add new metrics to the analysis results
4. **Integration tools**: Create plugins for IDEs or CI systems

## License

Part of the Reynard framework - see main project license.
