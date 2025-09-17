/**
 * Git Tools Configuration
 *
 * Defines git-related tools for the NLWeb service.
 */

import type { NLWebTool } from "../types/index.js";

export const gitTools: NLWebTool[] = [
  {
    name: "git_status",
    description: "Check the status of a git repository",
    category: "git",
    tags: ["git", "status", "repository"],
    path: "/api/tools/git_status",
    method: "POST",
    parameters: [
      {
        name: "dataset_path",
        type: "string",
        description: "Directory path to inspect",
        required: true,
      },
    ],
    examples: ["git status", "check repository status", "what files are changed"],
    enabled: true,
    priority: 80,
    timeout: 5000,
  },
  {
    name: "git_commit",
    description: "Commit changes to a git repository",
    category: "git",
    tags: ["git", "commit", "save"],
    path: "/api/tools/git_commit",
    method: "POST",
    parameters: [
      {
        name: "dataset_path",
        type: "string",
        description: "Directory path",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Commit message",
        required: true,
        constraints: {
          minLength: 1,
          maxLength: 500,
        },
      },
    ],
    examples: ["commit changes", "save changes", "commit with message"],
    enabled: true,
    priority: 75,
    timeout: 10000,
  },
  {
    name: "git_create_branch",
    description: "Create a new git branch",
    category: "git",
    tags: ["git", "branch", "create"],
    path: "/api/tools/git_create_branch",
    method: "POST",
    parameters: [
      {
        name: "dataset_path",
        type: "string",
        description: "Directory path",
        required: true,
      },
      {
        name: "branch_name",
        type: "string",
        description: "Name of the new branch",
        required: true,
        constraints: {
          minLength: 1,
          maxLength: 100,
          pattern: "^[a-zA-Z0-9\\-_./]+$",
        },
      },
    ],
    examples: ["create new branch", "make branch", "new branch"],
    enabled: true,
    priority: 65,
    timeout: 5000,
  },
];
