/**
 * Tools Configuration Barrel Export
 *
 * Centralized export for all tool configurations.
 */

export { mcpGitTools } from "./mcp-git-tools.js";
export { fileTools } from "./file-tools.js";
export { aiTools } from "./ai-tools.js";
export { batchTools } from "./batch-tools.js";

// Aggregate all tools
import { mcpGitTools } from "./mcp-git-tools.js";
import { fileTools } from "./file-tools.js";
import { aiTools } from "./ai-tools.js";
import { batchTools } from "./batch-tools.js";

export const allDefaultTools = [...mcpGitTools, ...fileTools, ...aiTools, ...batchTools];
