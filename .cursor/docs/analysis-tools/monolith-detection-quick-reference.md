# Monolith Detection Tools - Quick Reference

🦊 Quick reference guide for the Reynard monolith detection tools.

## MCP Tool Commands

### Detect Monoliths

```bash
mcp_reynard-mcp_detect_monoliths \
  --max_lines 140 \
  --top_n 10 \
  --directories '["../../packages/", "../../backend/"]' \
  --file_types '[".ts", ".tsx", ".py"]' \
  --exclude_comments true \
  --include_metrics true
```

### Analyze File Complexity

```bash
mcp_reynard-mcp_analyze_file_complexity \
  --file_path "packages/adr-system/src/PerformancePatternDetector.ts" \
  --include_ast_analysis true
```

### Get Codebase Summary

```bash
mcp_reynard-mcp_get_code_metrics_summary \
  --directories '["../../packages/", "../../backend/", "../../scripts/"]' \
  --file_types '[".ts", ".tsx", ".py", ".js", ".jsx"]'
```

## Common Use Cases

### Find All Monoliths in Project

```bash
mcp_reynard-mcp_detect_monoliths \
  --max_lines 140 \
  --top_n 20 \
  --directories '["../../"]' \
  --file_types '[".ts", ".tsx", ".py", ".js", ".jsx"]'
```

### Analyze Specific Package

```bash
mcp_reynard-mcp_detect_monoliths \
  --max_lines 100 \
  --top_n 5 \
  --directories '["../../packages/adr-system/"]' \
  --file_types '[".ts", ".tsx"]'
```

### Get Project Statistics

```bash
mcp_reynard-mcp_get_code_metrics_summary \
  --directories '["../../packages/", "../../backend/", "../../scripts/"]'
```

## Parameters Reference

| Parameter          | Type    | Default                                 | Description                       |
| ------------------ | ------- | --------------------------------------- | --------------------------------- |
| `max_lines`        | integer | 140                                     | Maximum lines of code threshold   |
| `top_n`            | integer | 20                                      | Number of largest files to return |
| `directories`      | array   | `["../../"]`                            | Directories to scan               |
| `file_types`       | array   | `[".py", ".ts", ".tsx", ".js", ".jsx"]` | File extensions to analyze        |
| `exclude_comments` | boolean | true                                    | Exclude comments from line count  |
| `include_metrics`  | boolean | true                                    | Include complexity metrics        |

## Excluded Patterns

**Directories**: `.git`, `node_modules`, `__pycache__`, `dist`, `build`, `coverage`, `third_party`, `generated`

**Files**: `*.d.ts`, `*.log`, `*.pid`, `coverage.xml`, `.env*`, `agent-names.json`

## Complexity Scoring

- **Functions**: +1 complexity
- **Classes**: +2 complexity
- **Control Structures**: +1 complexity (`if`, `for`, `while`, `switch`, `try`, `catch`)

## Threshold Guidelines

- **140 lines**: Standard modularity threshold
- **200 lines**: Acceptable for complex algorithms
- **300+ lines**: Should be refactored

## Recent Results (Reynard Codebase)

- **Total Files**: 3,752 source files
- **Total LOC**: 371,574 (excluding comments)
- **Comment Ratio**: 29.2%
- **Large Files**: 881 files > 140 lines

**Top Monoliths**:

1. `robot_name_generator.py` - 1,446 LOC
2. `PerformancePatternDetector.ts` - 1,005 LOC
3. `InterfaceContractValidator.ts` - 921 LOC
