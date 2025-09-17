# 🦊 CHANGELOG.md Codebase Scanner Setup

_whiskers twitch with cunning_ This guide explains how to set up automatic codebase scanning when you save the CHANGELOG.md file, using the strategic fox specialist approach to development tooling.

## Overview

The CHANGELOG.md Codebase Scanner is a sophisticated system that automatically triggers comprehensive codebase analysis whenever you save changes to the CHANGELOG.md file. It uses the Reynard MCP server tools to provide deep insights into your development ecosystem.

## Features

### 🔍 Comprehensive Scanning

- **Monolith Detection**: Identifies files exceeding the 140-line axiom
- **Development Tools Discovery**: Finds all development utilities and scripts
- **MCP Tools Analysis**: Scans the MCP server ecosystem
- **Validation Tools Inventory**: Catalogs all linting and testing tools
- **Code Metrics Summary**: Provides overall codebase health metrics

### 🛠️ Available Tools

The scanner leverages these MCP tools:

1. **`detect_monoliths`** - Identifies large files that need refactoring
2. **`search_enhanced`** - Hybrid semantic and text search for tools
3. **`get_code_metrics_summary`** - Comprehensive codebase health analysis

## Setup Instructions

### 1. VS Code Tasks

The system provides several VS Code tasks:

#### Manual Tasks

- **🦊 CHANGELOG.md Codebase Scanner** - Run a one-time comprehensive scan
- **🦊 CHANGELOG.md Queue Watcher** - Use the queue-based validation system
- **🦊 Start CHANGELOG.md File Watcher** - Start the file watcher manually

#### Automatic Tasks

- **🦊 Auto-Start CHANGELOG.md Watcher** - Automatically starts when VS Code opens

### 2. File Watcher Script

The `scripts/changelog-watcher.sh` script provides:

- **Real-time monitoring** of CHANGELOG.md changes
- **Debounced processing** to avoid excessive scans
- **Comprehensive logging** with timestamps and colors
- **Error handling** and graceful shutdown

### 3. Scanner Script

The `scripts/changelog-scanner.py` script provides:

- **Async MCP tool integration** for maximum performance
- **Parallel processing** of multiple scan types
- **Detailed reporting** with summaries and metrics
- **JSON output** for programmatic consumption

## Usage

### Automatic Usage

1. **Enable Auto-Start**: The system can automatically start when VS Code opens
2. **Save CHANGELOG.md**: Simply save the file and the scan will trigger automatically
3. **View Results**: Check the VS Code terminal for comprehensive scan results

### Manual Usage

1. **Run Scanner Task**: Use `Ctrl+Shift+P` → "Tasks: Run Task" → "🦊 CHANGELOG.md Codebase Scanner"
2. **Start File Watcher**: Use the "🦊 Start CHANGELOG.md File Watcher" task
3. **Queue-Based Validation**: Use the "🦊 CHANGELOG.md Queue Watcher" task

### Command Line Usage

```bash
# Run a one-time scan
python3 scripts/changelog-scanner.py

# Start the file watcher
./scripts/changelog-watcher.sh

# Run queue-based validation
pnpm --filter reynard-queue-watcher start CHANGELOG.md
```

## Output Examples

### Scan Summary

```
🦊 CODEBASE SCAN COMPLETE!
============================================================

📋 SUMMARY:
  • Monolithic files: 3
  • Development tools: 15
  • MCP tools: 8
  • Validation tools: 12

🏗️  TOP MONOLITHS (>140 lines):
  1. packages/core/src/index.ts (245 lines)
  2. backend/app/main.py (189 lines)
  3. scripts/validation/markdown/validator.py (156 lines)

🛠️  KEY DEVELOPMENT TOOLS:
  1. scripts/changelog-scanner.py
  2. scripts/changelog-watcher.sh
  3. packages/queue-watcher/src/cli.ts
  4. scripts/mcp/main.py
  5. packages/code-quality/src/security/
```

### File Watcher Logs

```
[2025-01-15 14:30:25] 🦊 CHANGELOG.md changed - triggering codebase scan...
[2025-01-15 14:30:25] 🐍 Virtual environment activated
[2025-01-15 14:30:28] ✅ Codebase scan completed successfully
```

## Configuration

### Scanner Configuration

Edit `scripts/changelog-scanner.py` to customize:

- **Scan directories**: Modify the `directories` parameter
- **File types**: Adjust the `file_types` parameter
- **Monolith threshold**: Change the `max_lines` parameter
- **Result limits**: Modify the `top_k` and `top_n` parameters

### Watcher Configuration

Edit `scripts/changelog-watcher.sh` to customize:

- **Debounce delay**: Change the `DEBOUNCE_DELAY` variable
- **Project root**: Modify the `PROJECT_ROOT` variable
- **Logging level**: Adjust the log functions

### VS Code Configuration

Edit `.vscode/settings.json` to customize:

- **Auto-start behavior**: Modify the `runOptions.runOn` setting
- **Panel behavior**: Adjust the `presentation` settings
- **File associations**: Customize the `files.associations` setting

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**

   ```
   ❌ Failed to import MCP server: No module named 'main'
   ```

   **Solution**: Ensure you're running from the Reynard project root

2. **Virtual Environment Not Found**

   ```
   ⚠️ Virtual environment not found, running without it
   ```

   **Solution**: Create a virtual environment or install dependencies globally

3. **inotifywait Not Found**

   ```
   ❌ inotifywait not found. Please install inotify-tools
   ```

   **Solution**: Install inotify-tools for your system

### Debug Mode

Enable debug logging by modifying the scripts:

```python
# In changelog-scanner.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

```bash
# In changelog-watcher.sh
set -x  # Enable bash debug mode
```

## Integration with Other Tools

### Queue Watcher Integration

The scanner integrates with the Reynard queue watcher system:

```bash
# Use queue-based processing
pnpm --filter reynard-queue-watcher start CHANGELOG.md
```

### MCP Server Integration

The scanner uses the full MCP server ecosystem:

- **47 comprehensive tools** across 8 major categories
- **Async processing** for maximum performance
- **Error handling** and graceful fallbacks

### VS Code Integration

The system integrates seamlessly with VS Code:

- **Task automation** for easy access
- **Background processing** for non-blocking operation
- **Terminal integration** for real-time feedback

## Best Practices

### Performance Optimization

1. **Use debouncing** to avoid excessive scans
2. **Run scans in parallel** for faster results
3. **Cache results** when possible
4. **Monitor resource usage** during scans

### Maintenance

1. **Regular updates** to scan parameters
2. **Monitor scan results** for trends
3. **Update tool configurations** as needed
4. **Clean up old result files** periodically

### Security

1. **Validate file paths** before processing
2. **Sanitize output** to prevent injection
3. **Use proper permissions** for file access
4. **Monitor for suspicious activity**

## Advanced Usage

### Custom Scan Types

Add custom scan types by extending the `ChangelogScanner` class:

```python
async def search_custom_tools(self) -> Dict[str, Any]:
    """Search for custom tools"""
    result = await self.server.call_tool('search_enhanced', {
        'query': 'your custom search query',
        'search_type': 'hybrid',
        'top_k': 10,
        'file_types': ['.py', '.ts'],
        'directories': ['../../custom/']
    })
    return result
```

### Integration with CI/CD

Use the scanner in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run CHANGELOG Scanner
  run: |
    python3 scripts/changelog-scanner.py
    # Process results for CI/CD decisions
```

### Custom Output Formats

Extend the scanner to output in different formats:

```python
def export_to_markdown(self, output_file: str):
    """Export results to markdown format"""
    with open(output_file, 'w') as f:
        f.write("# Codebase Scan Results\n\n")
        # Add markdown formatting
```

## Conclusion

🦊 _red fur gleams with satisfaction_ The CHANGELOG.md Codebase Scanner provides a strategic approach to understanding your development ecosystem. By automatically scanning when you update the changelog, it ensures you always have current insights into your codebase health and tool inventory.

_whiskers twitch with cunning_ This system embodies the fox specialist approach - elegant, efficient, and always one step ahead of complexity. Use it to maintain awareness of your development tools and keep your codebase in optimal condition.

---

**Created by**: Kit-Strategist-7
**Date**: 2025-01-15
**Specialist**: Strategic Fox Developer
**Mission**: Outfox complexity with elegant automation
