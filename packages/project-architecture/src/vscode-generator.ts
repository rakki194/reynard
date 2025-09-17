/**
 * 🦊 Reynard VS Code Task Generator
 *
 * Generates VS Code task configurations using the project architecture.
 */

import { getWatchableDirectories, getBuildableDirectories, getTestableDirectories, getLintableDirectories } from "./architecture.js";

/**
 * Generate VS Code task configuration for queue watcher
 */
export function generateQueueWatcherTask(): any {
  const watchDirectories = getWatchableDirectories();
  
  return {
    "label": "🔄 Start Queue-Based Watcher",
    "type": "shell",
    "command": "pnpm",
    "args": [
      "--filter",
      "reynard-queue-watcher",
      "watch",
      "-d",
      ...watchDirectories.map(dir => `../../${dir}`)
    ],
    "group": "build",
    "presentation": {
      "echo": true,
      "reveal": "always",
      "focus": false,
      "panel": "new",
      "showReuseMessage": true,
      "clear": false
    },
    "isBackground": true,
    "problemMatcher": [],
    "detail": "Start queue-based watcher with perfect file processing sequencing - includes all project directories from architecture"
  };
}

/**
 * Generate VS Code task configuration for auto-start queue watcher
 */
export function generateAutoStartQueueWatcherTask(): any {
  const watchDirectories = getWatchableDirectories();
  
  return {
    "label": "🔄 Auto-Start Queue-Based Watcher",
    "type": "shell",
    "command": "pnpm",
    "args": [
      "--filter",
      "reynard-queue-watcher",
      "watch",
      "-d",
      ...watchDirectories.map(dir => `../../${dir}`)
    ],
    "group": "build",
    "presentation": {
      "echo": true,
      "reveal": "never",
      "focus": false,
      "panel": "dedicated",
      "showReuseMessage": false,
      "clear": false
    },
    "isBackground": true,
    "runOptions": {
      "runOn": "folderOpen"
    },
    "problemMatcher": [],
    "detail": "Automatically start queue-based watcher when workspace opens - includes all project directories from architecture"
  };
}

/**
 * Generate VS Code task configuration for build tasks
 */
export function generateBuildTasks(): any[] {
  const buildableDirectories = getBuildableDirectories();
  
  return buildableDirectories.map(dir => ({
    "label": `🔨 Build ${dir}`,
    "type": "shell",
    "command": "pnpm",
    "args": [
      "--filter",
      `reynard-${dir}`,
      "build"
    ],
    "group": "build",
    "presentation": {
      "echo": true,
      "reveal": "always",
      "focus": false,
      "panel": "shared",
      "showReuseMessage": true,
      "clear": false
    },
    "problemMatcher": ["$tsc"],
    "detail": `Build ${dir} package`
  }));
}

/**
 * Generate VS Code task configuration for test tasks
 */
export function generateTestTasks(): any[] {
  const testableDirectories = getTestableDirectories();
  
  return testableDirectories.map(dir => ({
    "label": `🧪 Test ${dir}`,
    "type": "shell",
    "command": "pnpm",
    "args": [
      "--filter",
      `reynard-${dir}`,
      "test"
    ],
    "group": "test",
    "presentation": {
      "echo": true,
      "reveal": "always",
      "focus": false,
      "panel": "shared",
      "showReuseMessage": true,
      "clear": false
    },
    "problemMatcher": [],
    "detail": `Test ${dir} package`
  }));
}

/**
 * Generate VS Code task configuration for lint tasks
 */
export function generateLintTasks(): any[] {
  const lintableDirectories = getLintableDirectories();
  
  return lintableDirectories.map(dir => ({
    "label": `🔍 Lint ${dir}`,
    "type": "shell",
    "command": "pnpm",
    "args": [
      "--filter",
      `reynard-${dir}`,
      "lint"
    ],
    "group": "build",
    "presentation": {
      "echo": true,
      "reveal": "always",
      "focus": false,
      "panel": "shared",
      "showReuseMessage": true,
      "clear": false
    },
    "problemMatcher": ["$eslint-stylish"],
    "detail": `Lint ${dir} package`
  }));
}

/**
 * Generate complete VS Code tasks configuration
 */
export function generateVSCodeTasksConfig(): any {
  return {
    "version": "2.0.0",
    "tasks": [
      generateQueueWatcherTask(),
      generateAutoStartQueueWatcherTask(),
      ...generateBuildTasks(),
      ...generateTestTasks(),
      ...generateLintTasks()
    ]
  };
}

/**
 * Generate VS Code workspace configuration
 */
export function generateVSCodeWorkspaceConfig(): any {
  const watchDirectories = getWatchableDirectories();
  
  return {
    "folders": [
      {
        "name": "Reynard",
        "path": "."
      }
    ],
    "settings": {
      "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/dist/**": true,
        "**/build/**": true,
        "**/.git/**": true,
        "**/third_party/**": true
      }
    },
    "tasks": {
      "version": "2.0.0",
      "tasks": [
        {
          "label": "🔄 Auto-Start Queue-Based Watcher",
          "type": "shell",
          "command": "pnpm",
          "args": [
            "--filter",
            "reynard-queue-watcher",
            "watch",
            "-d",
            ...watchDirectories.map(dir => `../../${dir}`)
          ],
          "group": "build",
          "presentation": {
            "echo": true,
            "reveal": "never",
            "focus": false,
            "panel": "dedicated",
            "showReuseMessage": false,
            "clear": false
          },
          "isBackground": true,
          "runOptions": {
            "runOn": "folderOpen"
          },
          "problemMatcher": [],
          "detail": "Automatically start queue-based watcher when workspace opens - includes all project directories from architecture"
        }
      ]
    }
  };
}
