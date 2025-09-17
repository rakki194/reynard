/**
 * 🐺 Fenrir LLM Exploits Parser
 *
 * *snarls with predatory intelligence* Parses Fenrir LLM exploits analysis output
 * and converts it to standardized vulnerability format.
 */
import type { SecurityVulnerability } from "../types";
/**
 * 🦊 Parse Fenrir LLM exploits output
 */
export declare function parseFenrirLLMOutput(output: string): SecurityVulnerability[];
