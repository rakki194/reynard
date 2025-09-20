# Reynard Humility Parser

A TypeScript parser for humility detector output reports with validation, filtering, and analysis capabilities.

## Features

- **Type-safe parsing** of humility detector JSON output
- **Comprehensive validation** using Zod schemas
- **Advanced filtering** by severity, confidence, categories, and file patterns
- **Statistical analysis** with grouping and scoring
- **Multiple export formats** (JSON, CSV, Summary)
- **Utility functions** for formatting and analysis

## Installation

```bash
npm install reynard-humility-parser
```

## Quick Start

```typescript
import { HumilityParser, parseHumilityReport } from "reynard-humility-parser";

// Quick parsing
const report = parseHumilityReport("./humility-report.json");

// Or use the parser class for more control
const parser = new HumilityParser();
const parsedReport = parser.parseFromFile("./humility-report.json");

// Filter findings
const filteredReport = parser.filterReport(parsedReport, {
  minSeverity: "high",
  minConfidence: 0.8,
  categories: ["superlatives", "self_promotion"],
});

// Get summary
const summary = parser.getSummary(filteredReport);
console.log(`Found ${summary.totalFindings} issues in ${summary.totalFiles} files`);
```

## API Reference

### HumilityParser

Main parser class for processing humility detector output.

#### Methods

- `parseFromFile(filePath: string): ParsedHumilityReport`
- `parseFromString(jsonString: string, sourceFile?: string): ParsedHumilityReport`
- `filterReport(report: ParsedHumilityReport, options?: HumilityAnalysisOptions): FilteredHumilityReport`
- `getSummary(report: ParsedHumilityReport | FilteredHumilityReport)`
- `getFindingsByCategory(report: ParsedHumilityReport | FilteredHumilityReport)`
- `getFindingsBySeverity(report: ParsedHumilityReport | FilteredHumilityReport)`
- `getLowestScoringFiles(report: ParsedHumilityReport | FilteredHumilityReport, limit?: number)`
- `getHighestScoringFiles(report: ParsedHumilityReport | FilteredHumilityReport, limit?: number)`
- `exportToFormat(report: ParsedHumilityReport | FilteredHumilityReport, format: 'json' | 'csv' | 'summary'): string`

### Types

#### SeverityLevel

- `LOW` - Low severity findings
- `MEDIUM` - Medium severity findings
- `HIGH` - High severity findings
- `CRITICAL` - Critical severity findings

#### DetectionCategory

- `SUPERLATIVES` - Use of superlative language
- `EXAGGERATION` - Exaggerated claims
- `SELF_PROMOTION` - Self-promotional language
- `DISMISSIVENESS` - Dismissive language
- `ABSOLUTE_CLAIMS` - Absolute claims
- `HYPE_LANGUAGE` - Hype or marketing language

#### ConfidenceLevel

- `LOW` - Low confidence detection
- `MEDIUM` - Medium confidence detection
- `HIGH` - High confidence detection
- `VERY_HIGH` - Very high confidence detection

## Examples

### Basic Parsing

```typescript
import { HumilityParser } from "reynard-humility-parser";

const parser = new HumilityParser();
const report = parser.parseFromFile("humility-report.json");

console.log(`Analyzed ${report.summary.total_files} files`);
console.log(`Found ${report.summary.total_findings} issues`);
console.log(`Average humility score: ${report.summary.average_score}/100`);
```

### Filtering Results

```typescript
// Filter for high-severity issues only
const highSeverityReport = parser.filterReport(report, {
  minSeverity: "high",
});

// Filter for specific categories
const boastfulReport = parser.filterReport(report, {
  categories: ["superlatives", "self_promotion", "hype_language"],
});

// Filter by confidence and file patterns
const confidentReport = parser.filterReport(report, {
  minConfidence: 0.8,
  filePatterns: ["README", "docs"],
});
```

### Analysis and Statistics

```typescript
// Get findings grouped by category
const byCategory = parser.getFindingsByCategory(report);
console.log("Issues by category:", byCategory);

// Get findings grouped by severity
const bySeverity = parser.getFindingsBySeverity(report);
console.log("Issues by severity:", bySeverity);

// Get files with lowest humility scores
const problematicFiles = parser.getLowestScoringFiles(report, 5);
console.log("Files needing attention:", problematicFiles);
```

### Export Formats

```typescript
// Export to CSV for spreadsheet analysis
const csv = parser.exportToFormat(report, "csv");
fs.writeFileSync("humility-analysis.csv", csv);

// Export summary for quick review
const summary = parser.exportToFormat(report, "summary");
console.log(summary);
```

### Utility Functions

```typescript
import {
  formatHumilityScore,
  formatSeverity,
  getCategoryDescription,
  calculateImprovementScore,
} from "reynard-humility-parser";

// Format scores with emojis
console.log(formatHumilityScore(85)); // 🟡 85.0/100 (Good)
console.log(formatSeverity("high")); // 🟠 HIGH

// Get category descriptions
console.log(getCategoryDescription("superlatives"));
// "Use of superlative language (best, greatest, amazing)"

// Calculate improvement
const improvement = calculateImprovementScore(50, 75);
console.log(`Improved by ${improvement.improvement} points (${improvement.percentage}%)`);
```

## Error Handling

The parser includes comprehensive error handling:

```typescript
try {
  const report = parser.parseFromFile("report.json");
} catch (error) {
  if (error.message.includes("not found")) {
    console.error("Report file not found");
  } else if (error.message.includes("Invalid JSON")) {
    console.error("Invalid JSON format");
  } else {
    console.error("Parsing failed:", error.message);
  }
}
```

## Validation

All input data is validated using Zod schemas to ensure type safety:

```typescript
import { HumilityReportSchema } from "reynard-humility-parser";

// Validate raw data before parsing
const validationResult = HumilityReportSchema.safeParse(rawData);
if (!validationResult.success) {
  console.error("Validation errors:", validationResult.error.issues);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
