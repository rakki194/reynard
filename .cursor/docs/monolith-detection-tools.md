# Monolith Detection Tools

🦊 **Strategic-Cipher-42** has created a sophisticated monolith detection system for the Reynard MCP server that
uses AST-based line counting to identify large files based on precise code modularity rules.

## Overview

The monolith detection tools provide comprehensive analysis of codebase structure,
identifying files that exceed modularity thresholds while excluding comments, docstrings, and
generated code. The system uses advanced AST parsing for accurate line counting and complexity analysis.

## Available Tools

### 1. `detect_monoliths`

**Purpose**: Identify large monolithic files across the codebase

**Features**:

- Configurable line count thresholds (default: 140 lines)
- Excludes comments and docstrings from line counts
- Filters out generated files and build artifacts
- Provides detailed complexity metrics
- Returns top N largest files

**Usage**:

```json
{
  "name": "detect_monoliths",
  "arguments": {
    "max_lines": 140,
    "top_n": 10,
    "directories": ["../../packages/", "../../backend/", "../../scripts/"],
    "file_types": [".ts", ".tsx", ".py", ".js", ".jsx"],
    "exclude_comments": true,
    "include_metrics": true
  }
}
```

**Parameters**:

- `max_lines` (integer): Maximum lines of code threshold (default: 140)
- `top_n` (integer): Number of largest files to return (default: 20)
- `directories` (array): Directories to scan (default: `["../../"]` for entire project)
- `file_types` (array): File extensions to analyze (default: `[".py", ".ts", ".tsx", ".js", ".jsx"]`)
- `exclude_comments` (boolean): Exclude comments and docstrings from line count (default: true)
- `include_metrics` (boolean): Include detailed code metrics (default: true)

### 2. `analyze_file_complexity`

**Purpose**: Deep analysis of individual files

**Features**:

- AST-based complexity scoring
- Function, class, and import counting
- Comment/docstring ratio analysis
- Detailed metrics breakdown

**Usage**:

```json
{
  "name": "analyze_file_complexity",
  "arguments": {
    "file_path": "packages/adr-system/src/PerformancePatternDetector.ts",
    "include_ast_analysis": true
  }
}
```

**Parameters**:

- `file_path` (string): Path to the file to analyze (required)
- `include_ast_analysis` (boolean): Include detailed AST analysis (default: true)

### 3. `get_code_metrics_summary`

**Purpose**: Comprehensive codebase overview

**Features**:

- Overall statistics across directories
- Language breakdown
- Large file counts
- Comment ratio analysis

**Usage**:

```json
{
  "name": "get_code_metrics_summary",
  "arguments": {
    "directories": ["../../packages/", "../../backend/", "../../scripts/"],
    "file_types": [".ts", ".tsx", ".py", ".js", ".jsx"]
  }
}
```

**Parameters**:

- `directories` (array): Directories to analyze (default: `["../../"]` for entire project)
- `file_types` (array): File extensions to include (default: `[".py", ".ts", ".tsx", ".js", ".jsx"]`)

## Advanced Features

### AST-Based Line Counting

The system uses Python's `ast` module for accurate Python code analysis and
sophisticated regex patterns for TypeScript/JavaScript files:

- **Python**: Uses `ast.parse()` to identify actual code lines
- **TypeScript/JavaScript**: Uses regex patterns to identify functions, classes, and control structures
- **Comments**: Automatically excluded from line counts
- **Docstrings**: Excluded from Python line counts
- **Multiline strings**: Properly handled in both languages

### Smart File Filtering

The tool automatically excludes:

**Directories**:

- `.git`, `node_modules`, `__pycache__`, `.venv`, `venv`
- `dist`, `build`, `lib`, `out`, `.next`, `.nuxt`
- `coverage`, `htmlcov`, `.vitest-reports`
- `third_party`, `generated`, `unsloth_compiled_cache`
- `*-report`, `*-results`, `*.backup`, `*.bak`

**Files**:

- `*.tsbuildinfo`, `*.d.ts`, `*.d.ts.map`
- `*.log`, `*.pid`, `*.seed`, `*.pid.lock`
- `coverage.xml`, `*.lcov`, `*.tgz`
- `.env*`, `*.backup`, `*.bak`
- `agent-names.json`, `.agent-name`, `.jwt_secret`

### Complexity Scoring

The system calculates complexity scores based on:

- **Functions**: +1 complexity per function
- **Classes**: +2 complexity per class
- **Control Structures**: +1 complexity per `if`, `for`, `while`, `switch`, `try`, `catch`
- **Imports**: Counted separately for dependency analysis

## Real-World Results

### Reynard Codebase Analysis

The tool successfully analyzed the Reynard codebase and identified:

**Overall Statistics**:

- **Total Files**: 3,752 source files
- **Total Lines of Code**: 371,574 LOC (excluding comments)
- **Comment Ratio**: 29.2% (excellent documentation!)
- **Large Files**: 881 files exceeding 140 lines

**Language Breakdown**:

- **TypeScript**: 2,410 files (186,980 LOC)
- **Python**: 574 files (86,950 LOC)
- **TSX**: 666 files (82,628 LOC)
- **JavaScript**: 84 files (11,276 LOC)
- **JSX**: 18 files (3,740 LOC)

**Top Monoliths Identified**:

1. `robot_name_generator.py` - 1,446 LOC (39 complexity)
2. `PerformancePatternDetector.ts` - 1,005 LOC (99 complexity)
3. `InterfaceContractValidator.ts` - 921 LOC (100 complexity)
4. `universal_encoding_exploits.py` - 913 LOC (145 complexity)
5. `ComplianceScorer.ts` - 894 LOC (102 complexity)

## Usage Examples

### MCP Tool Calls

```bash
# Detect monoliths in specific directories
mcp_reynard-mcp_detect_monoliths \
  --max_lines 140 \
  --top_n 10 \
  --directories '["../../packages/", "../../backend/"]' \
  --file_types '[".ts", ".tsx", ".py"]' \
  --exclude_comments true \
  --include_metrics true

# Analyze specific file
mcp_reynard-mcp_analyze_file_complexity \
  --file_path "packages/adr-system/src/PerformancePatternDetector.ts" \
  --include_ast_analysis true

# Get codebase summary
mcp_reynard-mcp_get_code_metrics_summary \
  --directories '["../../packages/", "../../backend/", "../../scripts/"]' \
  --file_types '[".ts", ".tsx", ".py", ".js", ".jsx"]'
```

### Python API Usage

```python
from tools.monolith_detection_tools import MonolithDetectionTools

tools = MonolithDetectionTools()

# Detect monoliths
result = tools.call_tool('detect_monoliths', {
    'max_lines': 140,
    'top_n': 10,
    'directories': ['../../packages/', '../../backend/'],
    'file_types': ['.ts', '.tsx', '.py'],
    'exclude_comments': True,
    'include_metrics': True
})

# Analyze file complexity
result = tools.call_tool('analyze_file_complexity', {
    'file_path': 'packages/adr-system/src/PerformancePatternDetector.ts',
    'include_ast_analysis': True
})

# Get codebase summary
result = tools.call_tool('get_code_metrics_summary', {
    'directories': ['../../packages/', '../../backend/', '../../scripts/'],
    'file_types': ['.ts', '.tsx', '.py', '.js', '.jsx']
})
```

## Technical Implementation

### File Structure

```
scripts/mcp/
├── tools/
│   ├── monolith_detection_tools.py      # Main tool implementation
│   └── monolith_detection_definitions.py # MCP tool definitions
├── services/
│   └── file_analysis_service.py         # File analysis utilities
└── protocol/
    ├── tool_router.py                   # Updated with monolith routing
    └── mcp_handler.py                   # Updated with monolith integration
```

### Key Components

1. **MonolithDetectionTools**: Main tool class with three primary methods
2. **FileAnalysisService**: Utility service for file operations
3. **AST Analysis**: Python AST parsing and TypeScript regex analysis
4. **Smart Filtering**: Comprehensive exclusion patterns based on .gitignore
5. **Path Resolution**: Automatic path resolution from MCP server working directory

### Integration

The tools are fully integrated into the Reynard MCP server and
available through the standard MCP protocol. They follow the same patterns as other Reynard tools with
proper error handling, logging, and response formatting.

## Best Practices

### Threshold Guidelines

- **140 lines**: Standard modularity threshold for most projects
- **200 lines**: Acceptable for complex algorithms or data processing
- **300+ lines**: Should be refactored into smaller modules

### Refactoring Priorities

1. **High Complexity + High LOC**: Immediate refactoring needed
2. **High LOC + Low Complexity**: Consider splitting by functionality
3. **Low LOC + High Complexity**: Optimize algorithms and reduce nesting

### Regular Monitoring

- Run monolith detection weekly during development
- Set up CI/CD integration for automated monitoring
- Track trends over time to prevent technical debt accumulation

## Troubleshooting

### Common Issues

**No files found**:

- Check directory paths are correct relative to MCP server working directory
- Verify file types are supported (`.ts`, `.tsx`, `.py`, `.js`, `.jsx`)
- Ensure directories exist and contain source files

**Path resolution errors**:

- Use `../../` prefix for project root relative paths
- Check MCP server working directory is `scripts/mcp/`
- Verify file permissions and accessibility

**Performance issues**:

- Limit `top_n` parameter for large codebases
- Use specific directories instead of scanning entire project
- Consider excluding large generated files manually

## Future Enhancements

### Planned Features

- **Cyclomatic Complexity**: More sophisticated complexity analysis
- **Dependency Analysis**: Import/export relationship mapping
- **Refactoring Suggestions**: Automated recommendations for splitting files
- **Historical Tracking**: Monitor monolith growth over time
- **Language-Specific Rules**: Custom thresholds per language

### Integration Opportunities

- **VS Code Extension**: Real-time monolith detection in editor
- **Git Hooks**: Prevent new monoliths from being committed
- **CI/CD Pipeline**: Automated monolith detection in build process
- **Dashboard**: Web interface for codebase health monitoring

## Conclusion

The monolith detection tools provide powerful insights into codebase structure and
help maintain the Reynard way of clean, modular architecture. By using AST-based analysis and
intelligent filtering, the tools deliver accurate, actionable information for refactoring efforts and
technical debt management.

The system successfully identified key areas for improvement in the Reynard codebase,
particularly in the `adr-system` package and
agent naming utilities, providing a clear roadmap for maintaining code quality and modularity standards.
