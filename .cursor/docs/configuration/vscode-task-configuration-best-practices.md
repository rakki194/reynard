# VS Code Task Configuration Best Practices

## Overview

This document outlines best practices for configuring VS Code tasks to avoid duplicate executions and maintain clean, maintainable workspace configurations.

## Problem: Duplicate Auto-Start Tasks

### Issue Description

When VS Code tasks are configured with `"runOn": "folderOpen"` in multiple locations, it can lead to duplicate executions of the same task. This commonly occurs when tasks are defined in both:

- `.vscode/tasks.json` (folder-level)
- `.code-workspace` (workspace-level)

### Symptoms

- Multiple instances of the same task starting automatically
- Resource conflicts and performance issues
- Confusing task execution logs
- Unpredictable behavior

## Solution: Task Location Strategy

### Recommended Approach

**Use `.vscode/tasks.json` for folder-specific tasks** and avoid duplicating them in workspace files.

### Rationale

1. **Standard Location**: `.vscode/tasks.json` is the conventional location for folder-specific tasks
2. **VS Code Best Practices**: Aligns with official VS Code documentation and community standards
3. **Maintainability**: Easier to manage and debug when tasks are in one location
4. **Conflict Prevention**: Eliminates duplicate execution issues

## Task Configuration Hierarchy

### Folder-Level Tasks (`.vscode/tasks.json`)

**Use for:**

- Tasks specific to the current project/folder
- Development workflows (build, test, lint)
- Auto-start tasks with `"runOn": "folderOpen"`
- Background processes and watchers

**Example:**

```json
{
  "label": "🔄 Auto-Start Queue-Based Watcher",
  "type": "shell",
  "command": "pnpm",
  "args": ["--filter", "reynard-queue-watcher", "watch"],
  "isBackground": true,
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

### Workspace-Level Tasks (`.code-workspace`)

**Use for:**

- Tasks that span multiple folders/projects
- Cross-project coordination tasks
- Workspace-wide utilities
- **Avoid auto-start tasks** to prevent conflicts

**Example:**

```json
{
  "label": "🌐 Build All Projects",
  "type": "shell",
  "command": "pnpm",
  "args": ["-r", "build"],
  "group": "build"
}
```

## Implementation Guidelines

### 1. Consolidate Auto-Start Tasks

- Define auto-start tasks in `.vscode/tasks.json` only
- Remove duplicate auto-start tasks from workspace files
- Use descriptive labels with emojis for easy identification

### 2. Task Organization

- Group related tasks logically
- Use consistent naming conventions
- Include detailed descriptions in the `"detail"` field
- Set appropriate `"group"` values for task organization

### 3. Background Task Configuration

For background tasks (watchers, servers, etc.):

```json
{
  "isBackground": true,
  "presentation": {
    "echo": true,
    "reveal": "never",
    "focus": false,
    "panel": "dedicated",
    "showReuseMessage": false,
    "clear": false
  },
  "problemMatcher": []
}
```

### 4. Auto-Start Configuration

For tasks that should start automatically:

```json
{
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

## Common Patterns

### Development Server Auto-Start

```json
{
  "label": "🐍 Auto-Start Backend Server",
  "type": "shell",
  "command": "bash",
  "args": ["-c", "source ~/venv/bin/activate && cd backend && python scripts/dev-server.py"],
  "group": "build",
  "isBackground": true,
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

### File Watcher Auto-Start

```json
{
  "label": "🦊 Auto-Start CHANGELOG.md Watcher",
  "type": "shell",
  "command": "./scripts/changelog-watcher.sh",
  "group": "build",
  "isBackground": true,
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

### Queue-Based Watcher

```json
{
  "label": "🔄 Auto-Start Queue-Based Watcher",
  "type": "shell",
  "command": "pnpm",
  "args": ["--filter", "reynard-queue-watcher", "watch", "-d", "../../packages", "../../backend", "../../services"],
  "group": "build",
  "isBackground": true,
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

## Troubleshooting

### Identifying Duplicate Tasks

1. Search for `"runOn": "folderOpen"` in both:
   - `.vscode/tasks.json`
   - `*.code-workspace` files

2. Look for tasks with identical labels or functionality

3. Check VS Code's Task Runner output for duplicate executions

### Resolution Steps

1. **Identify the duplicate**: Find tasks with the same purpose in multiple locations
2. **Choose the standard location**: Keep the task in `.vscode/tasks.json`
3. **Remove duplicates**: Delete the duplicate from workspace files
4. **Test**: Restart VS Code to verify only one instance starts

### Verification

After removing duplicates:

1. Close and reopen VS Code
2. Check the Task Runner panel for expected task count
3. Verify no duplicate processes are running
4. Confirm tasks start as expected

## Best Practices Summary

1. **Single Source of Truth**: Define each task in only one location
2. **Folder-Specific Tasks**: Use `.vscode/tasks.json` for project-specific tasks
3. **Workspace Tasks**: Use `.code-workspace` only for cross-project coordination
4. **Avoid Auto-Start Duplicates**: Never have the same auto-start task in multiple locations
5. **Descriptive Labels**: Use clear, emoji-prefixed labels for easy identification
6. **Proper Configuration**: Set appropriate `isBackground`, `presentation`, and `runOptions`
7. **Documentation**: Include detailed descriptions for complex tasks

## References

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [VS Code Workspace Configuration](https://code.visualstudio.com/docs/editor/workspaces)
- [Task Configuration Schema](https://code.visualstudio.com/docs/editor/tasks#_task-automation)

---

_Documented by: Strategic Fox Specialist_
_Date: 2025-01-27_
_Context: Resolved duplicate auto-start queue-based watcher issue in Reynard workspace_
