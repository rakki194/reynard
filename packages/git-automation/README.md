# 🦊 Reynard Git Automation

Modular Git workflow automation tools for the Reynard ecosystem. Provides clean, composable components for managing Git operations, versioning, changelog management, and more.

## Features

- **🔍 Junk File Detection**: Automatically detect and clean development artifacts
- **📊 Change Analysis**: Analyze Git changes and determine impact and categorization
- **📝 Commit Generation**: Generate conventional commit messages from change analysis
- **📚 Changelog Management**: Manage CHANGELOG.md with proper version promotion
- **📦 Version Management**: Handle semantic versioning and Git tags
- **🦊 Workflow Orchestration**: Complete automation workflow with user interaction
- **🔌 MCP Integration**: Programmatic access via Model Context Protocol
- **⚡ CLI Interface**: Command-line tools for all operations

## Installation

```bash
npm install reynard-git-automation
```

## Quick Start

### CLI Usage

```bash
# Execute complete workflow
npx reynard-git workflow

# Quick workflow with auto-confirm
npx reynard-git quick

# Detect junk files
npx reynard-git junk --cleanup

# Analyze changes
npx reynard-git analyze

# Generate commit message
npx reynard-git commit

# Manage versions
npx reynard-git version --bump minor --tag --push
```

### Programmatic Usage

```typescript
import {
  JunkFileDetector,
  ChangeAnalyzer,
  CommitMessageGenerator,
  ChangelogManager,
  VersionManager,
  GitWorkflowOrchestrator,
} from "reynard-git-automation";

// Detect junk files
const detector = new JunkFileDetector();
const junkResult = await detector.detectJunkFiles();

// Analyze changes
const analyzer = new ChangeAnalyzer();
const analysis = await analyzer.analyzeChanges();

// Generate commit message
const generator = new CommitMessageGenerator();
const commitMessage = generator.generateCommitMessage(analysis);

// Execute complete workflow
const orchestrator = new GitWorkflowOrchestrator();
const result = await orchestrator.executeWorkflow({
  autoConfirm: true,
  dryRun: false,
});
```

### MCP Integration

```typescript
import { MCPGitAutomationTools } from "reynard-git-automation/mcp-tools";

const tools = new MCPGitAutomationTools();

// Get workflow status
const status = await tools.getWorkflowStatus();

// Execute workflow
const result = await tools.executeWorkflow({
  autoConfirm: true,
});

// Manage versions
const currentVersion = await tools.getCurrentVersion();
const nextVersion = tools.calculateNextVersion(currentVersion, "minor");
await tools.updateVersion(nextVersion);
```

## Components

### 🔍 Junk File Detector

Detects and manages development artifacts that shouldn't be committed:

```typescript
const detector = new JunkFileDetector();
const result = await detector.detectJunkFiles();

// Display results
detector.displayResults(result);

// Clean up junk files
await detector.cleanupJunkFiles(result, false);
```

**Supported Patterns:**

- Python artifacts (`__pycache__`, `*.pyc`, `venv/`, etc.)
- TypeScript/JavaScript artifacts (`dist/`, `*.d.ts`, `node_modules/`, etc.)
- Reynard-specific artifacts (`*.mcp.log`, `ecs-*.json`, etc.)
- System files (`.DS_Store`, `Thumbs.db`, etc.)

### 📊 Change Analyzer

Analyzes Git changes and determines their impact:

```typescript
const analyzer = new ChangeAnalyzer();
const analysis = await analyzer.analyzeChanges();

// Display results
analyzer.displayResults(analysis);

// Access categorized changes
for (const category of analysis.categories) {
  console.log(`${category.type}: ${category.description}`);
}
```

**Analysis Features:**

- File change categorization (feature, fix, docs, test, etc.)
- Impact assessment (low, medium, high)
- Version bump type determination
- Breaking change detection
- Security and performance change detection

### 📝 Commit Message Generator

Generates conventional commit messages from change analysis:

```typescript
const generator = new CommitMessageGenerator();
const commitMessage = generator.generateCommitMessage(analysis, {
  includeBody: true,
  includeFooter: true,
});

// Display generated message
generator.displayCommitMessage(commitMessage);
```

**Message Features:**

- Conventional commit format
- Automatic scope detection
- Detailed body with change summaries
- Footer with breaking changes and version info
- Customizable options

### 📚 Changelog Manager

Manages CHANGELOG.md with proper structure and version promotion:

```typescript
const manager = new ChangelogManager();

// Promote unreleased changes to versioned release
await manager.promoteUnreleasedToRelease("1.2.0", "2025-01-15");

// Add new entry to unreleased section
await manager.addUnreleasedEntry("added", "New feature for better performance");

// Validate changelog structure
const validation = await manager.validateChangelog();
```

**Changelog Features:**

- Keep a Changelog format compliance
- Automatic version promotion
- Entry categorization
- Structure validation
- Date management

### 📦 Version Manager

Handles semantic versioning and Git tags:

```typescript
const manager = new VersionManager();

// Get current version
const currentVersion = await manager.getCurrentVersion();

// Calculate next version
const nextVersion = manager.calculateNextVersion(currentVersion, "minor");

// Update version
await manager.updateVersion(nextVersion);

// Create and push Git tag
await manager.createGitTag(nextVersion, "Release notes");
await manager.pushGitTag(nextVersion);
```

**Version Features:**

- Semantic versioning support
- Git tag management
- Monorepo version handling
- Release notes generation
- Version comparison and validation

### 🦊 Workflow Orchestrator

Coordinates all components for complete automation:

```typescript
const orchestrator = new GitWorkflowOrchestrator();

const result = await orchestrator.executeWorkflow({
  skipJunkDetection: false,
  skipChangeAnalysis: false,
  skipCommitGeneration: false,
  skipVersionBump: false,
  skipChangelogUpdate: false,
  skipGitTag: false,
  dryRun: false,
  autoConfirm: false,
});

// Display workflow summary
orchestrator.displayWorkflowSummary(result);
```

**Workflow Steps:**

1. **Junk File Detection** - Scan for development artifacts
2. **Change Analysis** - Analyze and categorize Git changes
3. **Commit Generation** - Generate conventional commit message
4. **Version Bump** - Calculate and update package version
5. **Changelog Update** - Promote unreleased changes to versioned release
6. **Git Operations** - Commit, tag, and push changes

## CLI Commands

### `reynard-git workflow`

Execute the complete Git workflow automation:

```bash
# Full workflow with prompts
reynard-git workflow

# Dry run to see what would happen
reynard-git workflow --dry-run

# Auto-confirm all prompts
reynard-git workflow --auto-confirm

# Skip specific steps
reynard-git workflow --skip-junk --skip-version

# Custom commit message and version bump
reynard-git workflow -m "Custom message" -b minor
```

### `reynard-git quick`

Quick workflow with minimal prompts:

```bash
reynard-git quick
```

### `reynard-git junk`

Detect and manage junk files:

```bash
# Detect junk files
reynard-git junk

# Clean up junk files
reynard-git junk --cleanup

# Force cleanup without confirmation
reynard-git junk --cleanup --force

# Dry run to see what would be cleaned
reynard-git junk --cleanup --dry-run
```

### `reynard-git analyze`

Analyze Git changes:

```bash
reynard-git analyze
```

### `reynard-git commit`

Generate commit message:

```bash
# Basic commit message
reynard-git commit

# Include detailed body and footer
reynard-git commit --body --footer
```

### `reynard-git changelog`

Manage CHANGELOG.md:

```bash
# Show changelog structure
reynard-git changelog

# Promote unreleased changes to version
reynard-git changelog --version 1.2.0

# Validate changelog structure
reynard-git changelog --validate
```

### `reynard-git version`

Manage versions and Git tags:

```bash
# Show current version and tags
reynard-git version

# Bump version
reynard-git version --bump minor

# Bump version and create tag
reynard-git version --bump minor --tag

# Bump version, create tag, and push
reynard-git version --bump minor --tag --push

# Update all packages in monorepo
reynard-git version --bump patch --monorepo
```

## Configuration

### Environment Variables

- `REYNARD_GIT_WORKING_DIR` - Working directory for Git operations (default: current directory)
- `REYNARD_GIT_AUTO_CONFIRM` - Auto-confirm all prompts (default: false)
- `REYNARD_GIT_DRY_RUN` - Show what would be done without executing (default: false)

### Package.json Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "git:workflow": "reynard-git workflow",
    "git:quick": "reynard-git quick",
    "git:junk": "reynard-git junk --cleanup",
    "git:analyze": "reynard-git analyze",
    "git:commit": "reynard-git commit",
    "git:version": "reynard-git version --bump patch --tag --push"
  }
}
```

## Integration with Reynard Ecosystem

### MCP Server Integration

The Git automation tools are designed to integrate with the Reynard MCP server:

```typescript
// In your MCP server
import { MCPGitAutomationTools } from "reynard-git-automation/mcp-tools";

const gitTools = new MCPGitAutomationTools();

// Register MCP tools
mcpServer.registerTool("git_workflow", async () => {
  return await gitTools.executeWorkflow({ autoConfirm: true });
});

mcpServer.registerTool("git_analyze", async () => {
  return await gitTools.analyzeChanges();
});
```

### Husky Integration

Use with Husky pre-commit hooks:

```bash
# .husky/pre-commit
#!/bin/sh
npx reynard-git junk --cleanup
npx reynard-git analyze
```

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Git Workflow",
      "type": "shell",
      "command": "npx",
      "args": ["reynard-git", "workflow"],
      "group": "build"
    },
    {
      "label": "Git Quick",
      "type": "shell",
      "command": "npx",
      "args": ["reynard-git", "quick"],
      "group": "build"
    }
  ]
}
```

## Best Practices

### 1. Use the Workflow Orchestrator

For most use cases, use the `GitWorkflowOrchestrator` which coordinates all components:

```typescript
const orchestrator = new GitWorkflowOrchestrator();
const result = await orchestrator.executeWorkflow();
```

### 2. Handle Errors Gracefully

Always wrap operations in try-catch blocks:

```typescript
try {
  const result = await orchestrator.executeWorkflow();
  if (!result.success) {
    console.error("Workflow failed:", result.errors);
  }
} catch (error) {
  console.error("Unexpected error:", error);
}
```

### 3. Use Dry Run for Testing

Test your workflow with dry run before executing:

```typescript
const result = await orchestrator.executeWorkflow({ dryRun: true });
```

### 4. Customize Commit Messages

Use the commit message generator with custom options:

```typescript
const commitMessage = generator.generateCommitMessage(analysis, {
  includeBody: true,
  includeFooter: true,
  maxBodyLength: 200,
});
```

### 5. Validate Before Operations

Always validate changelog and versions before operations:

```typescript
const changelogValidation = await changelogManager.validateChangelog();
if (!changelogValidation.valid) {
  throw new Error("Invalid changelog structure");
}
```

## Troubleshooting

### Common Issues

**1. Junk files detected**

```bash
# Clean up junk files
reynard-git junk --cleanup

# Add patterns to .gitignore
echo "*.pyc" >> .gitignore
```

**2. No changes detected**

```bash
# Check git status
git status

# Stage changes
git add .
```

**3. Version conflicts**

```bash
# Check current version
reynard-git version

# Validate version format
reynard-git version --validate
```

**4. Changelog validation errors**

```bash
# Validate changelog
reynard-git changelog --validate

# Fix structure issues
reynard-git changelog --fix
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=reynard-git:* reynard-git workflow
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

_Built with the cunning of a fox, the thoroughness of an otter, and the determination of a wolf._ 🦊🦦🐺
