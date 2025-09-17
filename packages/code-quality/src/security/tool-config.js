/**
 * 🐺 Security Tool Configuration
 *
 * *snarls with predatory intelligence* Configuration and initialization
 * of security analysis tools.
 */
import { parseBanditOutput } from "./parsers/bandit-parser";
import { parseESLintSecurityOutput } from "./parsers/eslint-parser";
import { parseFenrirLLMOutput } from "./parsers/fenrir-llm-parser";
import { parseFenrirOutput } from "./parsers/fenrir-parser";
/**
 * 🦊 Initialize security analysis tools
 */
export function createSecurityTools() {
    return [
        {
            name: "bandit",
            enabled: true,
            command: "bandit",
            args: ["-r", "-f", "json", "-ll"],
            outputParser: parseBanditOutput,
            supportedLanguages: ["python"],
        },
        {
            name: "eslint-security",
            enabled: true,
            command: "pnpm",
            args: ["run", "lint:security"],
            outputParser: parseESLintSecurityOutput,
            supportedLanguages: ["typescript", "javascript"],
        },
        {
            name: "fenrir-fuzzing",
            enabled: true,
            command: "python",
            args: ["fenrir/run_all_exploits.py"],
            outputParser: parseFenrirOutput,
            supportedLanguages: ["python", "typescript", "javascript"],
        },
        {
            name: "fenrir-llm-exploits",
            enabled: true,
            command: "python",
            args: ["fenrir/run_llm_exploits.py"],
            outputParser: parseFenrirLLMOutput,
            supportedLanguages: ["python"],
        },
    ];
}
/**
 * 🦊 Get security tool by name
 */
export function getSecurityTool(tools, name) {
    return tools.find(tool => tool.name === name);
}
/**
 * 🦊 Enable/disable security tool
 */
export function configureSecurityTool(tools, toolName, enabled) {
    return tools.map(tool => (tool.name === toolName ? { ...tool, enabled } : tool));
}
/**
 * 🦊 Get enabled security tools
 */
export function getEnabledSecurityTools(tools) {
    return tools.filter(tool => tool.enabled);
}
