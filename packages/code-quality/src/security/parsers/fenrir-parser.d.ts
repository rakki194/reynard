/**
 * 🐺 Fenrir Fuzzing Parser
 *
 * *snarls with predatory intelligence* Parses Fenrir fuzzing analysis output
 * and converts it to standardized vulnerability format.
 */
import type { SecurityVulnerability } from "../types";
/**
 * 🦊 Parse Fenrir fuzzing output
 */
export declare function parseFenrirOutput(output: string): SecurityVulnerability[];
