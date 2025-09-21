/**
 * 🦊 Reynard VS Code Task Generator
 *
 * Generates VS Code task configurations using the project architecture.
 */

import {
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  getLintableDirectories,
} from "./architecture.js";

/**
 * Generate VS Code task configuration for queue watcher
 */
export function generateQueueWatcherTask(): any {
  const watchDirectories = getWatchableDirectories();

  return {
    label: "🔄 Start Queue-Based Watcher",
    type: "shell",
    command: "pnpm",
    args: ["--filter", "reynard-queue-watcher", "watch", "-d", ...watchDirectories.map(dir => `../../${dir}`)],
    group: "build",
    presentation: {
      echo: true,
      reveal: "always",
      focus: false,
      panel: "new",
      showReuseMessage: true,
      clear: false,
    },
    isBackground: true,
    problemMatcher: [],
    detail:
      "Start queue-based watcher with perfect file processing sequencing - includes all project directories from architecture",
  };
}

/**
 * Generate VS Code task configuration for auto-start queue watcher
 */
export function generateAutoStartQueueWatcherTask(): any {
  const watchDirectories = getWatchableDirectories();

  return {
    label: "🔄 Auto-Start Queue-Based Watcher",
    type: "shell",
    command: "pnpm",
    args: ["--filter", "reynard-queue-watcher", "watch", "-d", ...watchDirectories.map(dir => `../../${dir}`)],
    group: "build",
    presentation: {
      echo: true,
      reveal: "never",
      focus: false,
      panel: "dedicated",
      showReuseMessage: false,
      clear: false,
    },
    isBackground: true,
    runOptions: {
      runOn: "folderOpen",
    },
    problemMatcher: [],
    detail:
      "Automatically start queue-based watcher when workspace opens - includes all project directories from architecture",
  };
}

/**
 * Generate VS Code task configuration for build tasks
 */
export function generateBuildTasks(): any[] {
  const buildableDirectories = getBuildableDirectories();

  return buildableDirectories
    .map(dir => {
      // Handle Python services differently
      if (dir.startsWith("services/")) {
        const baseTask = {
          label: `🔨 Build ${dir}`,
          type: "shell",
          command: "bash",
          args: ["-c", `cd ${dir} && pip install -e .`],
          group: "build",
          presentation: {
            echo: true,
            reveal: "always",
            focus: false,
            panel: "shared",
            showReuseMessage: true,
            clear: false,
          },
          problemMatcher: ["$python"],
          detail: `Build ${dir} Python service`,
        };

        return [baseTask];
      }

      // Handle TypeScript/JavaScript packages
      const baseTask = {
        label: `🔨 Build ${dir}`,
        type: "shell",
        command: "pnpm",
        args: ["--filter", `reynard-${dir}`, "build"],
        group: "build",
        presentation: {
          echo: true,
          reveal: "always",
          focus: false,
          panel: "shared",
          showReuseMessage: true,
          clear: false,
        },
        problemMatcher: ["$tsc"],
        detail: `Build ${dir} package`,
      };

      // Add watch variant
      const watchTask = {
        ...baseTask,
        label: `🔨 Build ${dir} (Watch)`,
        args: ["--filter", `reynard-${dir}`, "dev"],
        isBackground: true,
        detail: `Build ${dir} package in watch mode`,
      };

      // Add clean variant
      const cleanTask = {
        ...baseTask,
        label: `🧹 Clean ${dir}`,
        args: ["--filter", `reynard-${dir}`, "clean"],
        detail: `Clean ${dir} package`,
      };

      return [baseTask, watchTask, cleanTask];
    })
    .flat();
}

/**
 * Generate VS Code task configuration for test tasks
 */
export function generateTestTasks(): any[] {
  const testableDirectories = getTestableDirectories();

  return testableDirectories.map(dir => {
    // Handle Python services differently
    if (dir.startsWith("services/")) {
      return {
        label: `🧪 Test ${dir}`,
        type: "shell",
        command: "bash",
        args: ["-c", `cd ${dir} && python -m pytest tests/ -v --cov`],
        group: "test",
        presentation: {
          echo: true,
          reveal: "always",
          focus: false,
          panel: "shared",
          showReuseMessage: true,
          clear: false,
        },
        problemMatcher: ["$python"],
        detail: `Test ${dir} Python service`,
      };
    }

    // Handle TypeScript/JavaScript packages
    return {
      label: `🧪 Test ${dir}`,
      type: "shell",
      command: "pnpm",
      args: ["--filter", `reynard-${dir}`, "test"],
      group: "test",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: [],
      detail: `Test ${dir} package`,
    };
  });
}

/**
 * Generate VS Code task configuration for lint tasks
 */
export function generateLintTasks(): any[] {
  const lintableDirectories = getLintableDirectories();

  return lintableDirectories.map(dir => {
    // Handle Python services differently
    if (dir.startsWith("services/")) {
      return {
        label: `🔍 Lint ${dir}`,
        type: "shell",
        command: "bash",
        args: ["-c", `cd ${dir} && python -m ruff check . --fix`],
        group: "build",
        presentation: {
          echo: true,
          reveal: "always",
          focus: false,
          panel: "shared",
          showReuseMessage: true,
          clear: false,
        },
        problemMatcher: ["$python"],
        detail: `Lint ${dir} Python service`,
      };
    }

    // Handle TypeScript/JavaScript packages
    return {
      label: `🔍 Lint ${dir}`,
      type: "shell",
      command: "pnpm",
      args: ["--filter", `reynard-${dir}`, "lint"],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$eslint-stylish"],
      detail: `Lint ${dir} package`,
    };
  });
}

/**
 * Generate advanced VS Code tasks configuration
 */
export function generateAdvancedTasks(): any[] {
  return [
    {
      label: "🚀 Full Project Build",
      type: "shell",
      command: "pnpm",
      args: ["build"],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$tsc"],
      detail: "Build all packages in the monorepo",
    },
    {
      label: "🧪 Run All Tests",
      type: "shell",
      command: "pnpm",
      args: ["test"],
      group: "test",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: [],
      detail: "Run tests for all packages",
    },
    {
      label: "🔍 Lint All Packages",
      type: "shell",
      command: "pnpm",
      args: ["lint"],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$eslint-stylish"],
      detail: "Lint all packages in the monorepo",
    },
    {
      label: "📊 Generate Project Report",
      type: "shell",
      command: "pnpm",
      args: ["--filter", "reynard-project-architecture", "run", "report"],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: [],
      detail: "Generate comprehensive project structure report",
    },
    {
      label: "🐍 Install All Services",
      type: "shell",
      command: "bash",
      args: [
        "-c",
        "cd services/agent-naming && pip install -e . && cd ../gatekeeper && pip install -e . && cd ../mcp-server && pip install -e .",
      ],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$python"],
      detail: "Install all Python services in development mode",
    },
    {
      label: "🧪 Test All Services",
      type: "shell",
      command: "bash",
      args: [
        "-c",
        "cd services/agent-naming && python -m pytest tests/ -v && cd ../gatekeeper && python -m pytest tests/ -v && cd ../mcp-server && python -m pytest tests/ -v",
      ],
      group: "test",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$python"],
      detail: "Run tests for all Python services",
    },
    {
      label: "🔍 Lint All Services",
      type: "shell",
      command: "bash",
      args: [
        "-c",
        "cd services/agent-naming && python -m ruff check . --fix && cd ../gatekeeper && python -m ruff check . --fix && cd ../mcp-server && python -m ruff check . --fix",
      ],
      group: "build",
      presentation: {
        echo: true,
        reveal: "always",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: ["$python"],
      detail: "Lint all Python services with auto-fix",
    },
  ];
}

/**
 * Generate complete VS Code tasks configuration
 */
export function generateVSCodeTasksConfig(): any {
  return {
    version: "2.0.0",
    tasks: [
      generateQueueWatcherTask(),
      generateAutoStartQueueWatcherTask(),
      ...generateAdvancedTasks(),
      ...generateBuildTasks(),
      ...generateTestTasks(),
      ...generateLintTasks(),
    ],
  };
}

/**
 * Generate VS Code workspace configuration
 */
export function generateVSCodeWorkspaceConfig(): any {
  const watchDirectories = getWatchableDirectories();

  return {
    folders: [
      {
        name: "Reynard",
        path: ".",
      },
    ],
    settings: {
      "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/dist/**": true,
        "**/build/**": true,
        "**/.git/**": true,
        "**/third_party/**": true,
      },
    },
    tasks: {
      version: "2.0.0",
      tasks: [
        {
          label: "🔄 Auto-Start Queue-Based Watcher",
          type: "shell",
          command: "pnpm",
          args: ["--filter", "reynard-queue-watcher", "watch", "-d", ...watchDirectories.map(dir => `../../${dir}`)],
          group: "build",
          presentation: {
            echo: true,
            reveal: "never",
            focus: false,
            panel: "dedicated",
            showReuseMessage: false,
            clear: false,
          },
          isBackground: true,
          runOptions: {
            runOn: "folderOpen",
          },
          problemMatcher: [],
          detail:
            "Automatically start queue-based watcher when workspace opens - includes all project directories from architecture",
        },
      ],
    },
  };
}
