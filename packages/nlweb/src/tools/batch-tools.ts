/**
 * Batch Operations Tools Configuration
 * 
 * Defines batch processing tools for the NLWeb service.
 */

import type { NLWebTool } from "../types/index.js";

export const batchTools: NLWebTool[] = [
  {
    name: "batch_process",
    description: "Process multiple files in batch",
    category: "batch-operations",
    tags: ["batch", "process", "multiple", "files"],
    path: "/api/batch/process",
    method: "POST",
    parameters: [
      {
        name: "files",
        type: "array",
        description: "List of files to process",
        required: true,
      },
      {
        name: "operation",
        type: "string",
        description: "Operation to perform on files",
        required: true,
        constraints: {
          enum: ["caption", "resize", "convert", "analyze"],
        },
      },
    ],
    examples: [
      "batch process files",
      "process multiple images",
      "bulk operation",
    ],
    enabled: true,
    priority: 60,
    timeout: 60000,
  },
];
