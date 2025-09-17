/**
 * 🐺 Bandit Security Parser
 *
 * *snarls with predatory intelligence* Parses Bandit security analysis output
 * and converts it to standardized vulnerability format.
 */
import type { SecurityVulnerability } from "../types";
/**
 * 🦊 Parse Bandit output
 */
export declare function parseBanditOutput(output: string): SecurityVulnerability[];
