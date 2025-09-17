/**
 * 🐺 ESLint Security Parser
 *
 * *snarls with predatory intelligence* Parses ESLint security analysis output
 * and converts it to standardized vulnerability format.
 */
import type { SecurityVulnerability } from "../types";
/**
 * 🦊 Parse ESLint security output
 */
export declare function parseESLintSecurityOutput(output: string): SecurityVulnerability[];
