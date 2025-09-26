/**
 * MCP Git Tools Configuration
 *
 * Defines git-related tools that use the MCP server's consolidated git_tool.
 * This ensures all git operations go through the single source of truth.
 */

import type { NLWebTool } from "../types/index.js";

export const mcpGitTools: NLWebTool[] = [
  {
    name: "git_status",
    description: "Check the status of a git repository using MCP git_tool",
    category: "git",
    tags: ["git", "status", "repository", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "status",
          },
        },
      },
    ],
    examples: ["git status", "check repository status", "what files are changed"],
    enabled: true,
    priority: 80,
    timeout: 10000,
  },
  {
    name: "git_commit",
    description: "Commit changes to a git repository using MCP git_tool",
    category: "git",
    tags: ["git", "commit", "save", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "commit",
          },
          args: {
            type: "object",
            description: "Operation arguments",
            properties: {
              message: {
                type: "string",
                description: "Commit message",
                required: true,
              },
            },
          },
        },
      },
    ],
    examples: ["git commit -m 'fix bug'", "commit changes", "save changes"],
    enabled: true,
    priority: 80,
    timeout: 10000,
  },
  {
    name: "git_branch",
    description: "Get branch information using MCP git_tool",
    category: "git",
    tags: ["git", "branch", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "branch",
          },
        },
      },
    ],
    examples: ["git branch", "show branches", "current branch"],
    enabled: true,
    priority: 80,
    timeout: 10000,
  },
  {
    name: "git_add",
    description: "Add files to git using MCP git_tool",
    category: "git",
    tags: ["git", "add", "stage", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "add",
          },
          args: {
            type: "object",
            description: "Operation arguments",
            properties: {
              files: {
                type: "array",
                description: "Files to add",
                required: true,
                items: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    ],
    examples: ["git add file.txt", "stage files", "add to git"],
    enabled: true,
    priority: 80,
    timeout: 10000,
  },
  {
    name: "git_log",
    description: "Get git log using MCP git_tool",
    category: "git",
    tags: ["git", "log", "history", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "log",
          },
          args: {
            type: "object",
            description: "Operation arguments",
            properties: {
              limit: {
                type: "integer",
                description: "Number of commits to show",
                defaultValue: 10,
              },
            },
          },
        },
      },
    ],
    examples: ["git log", "show history", "recent commits"],
    enabled: true,
    priority: 80,
    timeout: 10000,
  },
  {
    name: "git_diff",
    description: "Get git diff using MCP git_tool with pagination",
    category: "git",
    tags: ["git", "diff", "changes", "mcp"],
    path: "/api/mcp-bridge/tools/call",
    method: "POST",
    parameters: [
      {
        name: "tool",
        type: "string",
        description: "Tool name",
        required: true,
        defaultValue: "git_tool",
      },
      {
        name: "arguments",
        type: "object",
        description: "Tool arguments",
        required: true,
        properties: {
          operation: {
            type: "string",
            description: "Git operation",
            defaultValue: "diff",
          },
          args: {
            type: "object",
            description: "Operation arguments",
            properties: {
              staged: {
                type: "boolean",
                description: "Show staged changes",
                defaultValue: false,
              },
              page: {
                type: "integer",
                description: "Page number for pagination",
                defaultValue: 1,
              },
              page_size: {
                type: "integer",
                description: "Lines per page",
                defaultValue: 1000,
              },
            },
          },
        },
      },
    ],
    examples: ["git diff", "show changes", "what changed"],
    enabled: true,
    priority: 80,
    timeout: 15000,
  },
];
