# 🦊 CHANGELOG.md Codebase Scanner - Usage Guide

_whiskers twitch with cunning_ This guide explains how to use the CHANGELOG.md codebase scanner system that automatically scans your development ecosystem when you save the CHANGELOG.md file.

## 🎯 What It Does

The scanner provides comprehensive insights into your codebase:

- **📊 Monolith Detection**: Finds files exceeding 140 lines (configurable)
- **🛠️ Development Tools**: Discovers all development utilities and scripts
- **🔧 MCP Tools**: Catalogs the MCP server ecosystem
- **✅ Validation Tools**: Identifies linting, testing, and formatting tools
- **⚙️ VS Code Config**: Scans VS Code/Cursor configuration
- **📦 Packages**: Analyzes package.json files and dependencies

## 🚀 How to Use

### Method 1: VS Code/Cursor Tasks (Recommended)

1. **Open Command Palette**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Type**: "Tasks: Run Task"
3. **Select one of these tasks**:
   - `🦊 CHANGELOG.md Codebase Scanner` - Full comprehensive scan
   - `🦊 Quick CHANGELOG.md Scan` - Quick trigger script
   - `🦊 CHANGELOG.md Queue Watcher` - Queue-based validation

### Method 2: Command Line

```bash
# Run the efficient scanner directly
cd /home/kade/runeset/reynard
python3 scripts/efficient-changelog-scanner.py

# Or use the quick trigger script
./scripts/trigger-changelog-scan.sh
```

### Method 3: File Watcher (Background)

```bash
# Start the file watcher (runs in background)
./scripts/changelog-watcher.sh

# Or use the auto-start task in VS Code
# This will automatically start when you open the workspace
```

## 📊 Sample Output

```
🦊 Starting comprehensive codebase scan...
============================================================

📊 Detecting monolithic files...
  Scanning packages/...
  Scanning backend/...
  Scanning scripts/...
Found 210 monolithic files

🔍 Searching for development tools...
  Searching scripts/...
  Searching packages/...
Found 124 tool-related files

🛠️  Scanning MCP tools...
  Scanning scripts/mcp/...
Found 96 MCP tool files

✅ Scanning validation tools...
  Searching scripts/validation/...
  Searching packages/...
Found 91 validation tool files

⚙️  Scanning VS Code configuration...
  Scanning .vscode/...
Found 9 VS Code configuration files

📦 Analyzing package structure...
Found 23 packages

============================================================
🦊 CODEBASE SCAN COMPLETE!
============================================================

📋 SUMMARY:
  • Monolithic files: 210
  • Development tools: 124
  • MCP tools: 96
  • Validation tools: 91
  • VS Code configs: 9
  • Packages: 23

🏗️  TOP MONOLITHS (>17551 lines):
  1. packages/caption-core/dist/index.js (17551 lines)
  2. packages/games/dist/index.js (7087 lines)
  3. packages/core/dist/index.js (2476 lines)
  4. packages/file-processing/dist/index.js (2171 lines)
  5. packages/boundingbox/dist/index.js (1861 lines)

🛠️  KEY DEVELOPMENT TOOLS:
  1. scripts/mcp/test_restart_tool_safe.py
  2. scripts/mcp/test_agent_tools.py
  3. scripts/mcp/test_restart_tool.py
  4. scripts/mcp/test_restart_tool_errors.py
  5. scripts/mcp/protocol/tool_config.py

🔧 MCP TOOLS:
  1. scripts/mcp/debug_server.py
  2. scripts/mcp/show_banner.py
  3. scripts/mcp/startup_banner.py
  4. scripts/mcp/main.py
  5. scripts/mcp/test_restart_tool_safe.py

📦 PACKAGES:
  1. reynard v0.6.0
  2. reynard-queue-watcher v0.1.0
  3. reynard-algorithms v0.3.0
  4. reynard-auth v0.2.0
  5. reynard-docs-generator v0.1.2

🦊 *whiskers twitch with satisfaction* Scan complete!
💡 Use this information to understand your development ecosystem

💾 Results saved to: /home/kade/runeset/reynard/scripts/changelog-scan-results.json
```

## 🔧 Available Scripts

### Core Scripts

1. **`scripts/efficient-changelog-scanner.py`** - Main scanner (efficient, fast)
2. **`scripts/trigger-changelog-scan.sh`** - Quick trigger script
3. **`scripts/changelog-watcher.sh`** - File watcher for automatic scanning
4. **`scripts/debug-scanner.py`** - Debug version for troubleshooting

### Legacy Scripts (for reference)

- `scripts/changelog-scanner.py` - Original MCP-based scanner
- `scripts/simple-changelog-scanner.py` - Simplified MCP scanner
- `scripts/basic-changelog-scanner.py` - Basic file-based scanner

## ⚙️ Configuration

### Scanner Settings

Edit `scripts/efficient-changelog-scanner.py` to customize:

```python
# Monolith detection threshold
max_lines = 140  # Change this value

# File limits to prevent hanging
files_per_pattern = 100  # Limit files per glob pattern
files_per_extension = 50  # Limit files per extension
```

### VS Code Tasks

Edit `.vscode/tasks.json` to customize task behavior:

```json
{
  "label": "🦊 CHANGELOG.md Codebase Scanner",
  "type": "shell",
  "command": "bash",
  "args": ["-c", "cd /home/kade/runeset/reynard && python3 scripts/efficient-changelog-scanner.py"],
  "presentation": {
    "reveal": "always", // Change to "never" for background
    "panel": "shared" // Change to "new" for separate panel
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Script Hangs**: The original scripts hung because they tried to process too many files. The efficient scanner limits file processing to prevent this.

2. **Permission Errors**: Make sure scripts are executable:

   ```bash
   chmod +x scripts/*.sh
   ```

3. **Python Path Issues**: Ensure you're running from the project root:

   ```bash
   cd /home/kade/runeset/reynard
   python3 scripts/efficient-changelog-scanner.py
   ```

4. **VS Code vs Cursor**: The `code` command launches VS Code, not Cursor. Use the VS Code tasks instead.

### Debug Mode

Run the debug scanner to identify issues:

```bash
python3 scripts/debug-scanner.py
```

This will show:

- Directory structure
- File counts
- Basic file operations
- Any errors

## 📁 Output Files

### Results File

The scanner saves results to:

```
scripts/changelog-scan-results.json
```

This file contains:

- Complete scan results
- File paths and metadata
- Error information
- Timestamps

### Log Files

The file watcher creates logs in the terminal with timestamps and colored output.

## 🎯 Use Cases

### Development Workflow

1. **Before Major Changes**: Run a scan to understand current state
2. **After Adding Tools**: Scan to see new tools in the ecosystem
3. **Code Review**: Use monolith detection to identify refactoring opportunities
4. **Documentation**: Use results to document your development tools

### CI/CD Integration

```bash
# Add to your CI pipeline
python3 scripts/efficient-changelog-scanner.py
# Process results for automated decisions
```

### Team Onboarding

Share scan results to help new team members understand:

- Available development tools
- Codebase structure
- Package dependencies
- Configuration files

## 🔮 Future Enhancements

Potential improvements:

- **Real-time Monitoring**: Continuous background scanning
- **Trend Analysis**: Track changes over time
- **Integration**: Connect with other development tools
- **Customization**: More configurable scan parameters
- **Reporting**: Generate HTML/PDF reports

## 🦊 Conclusion

_red fur gleams with satisfaction_ The CHANGELOG.md codebase scanner provides strategic insights into your development ecosystem. Use it to maintain awareness of your tools, identify refactoring opportunities, and keep your codebase in optimal condition.

_whiskers twitch with cunning_ This system embodies the fox specialist approach - elegant, efficient, and always one step ahead of complexity. Use it to outfox any development challenge!

---

**Created by**: Kit-Strategist-7
**Date**: 2025-01-15
**Specialist**: Strategic Fox Developer
**Mission**: Outfox complexity with elegant automation
