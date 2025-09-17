/**
 * Code Example Parser
 *
 * Extracts and parses code examples from markdown documentation
 */
import { readFileSync } from "fs";
/**
 * Extract code examples from markdown documentation
 */
export function extractCodeExamples(docPath) {
    const content = readFileSync(docPath, "utf-8");
    const lines = content.split("\n");
    const examples = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeBlockStart = 0;
    let currentLanguage = "";
    let currentContext = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Track context (headers, descriptions)
        if (line.startsWith("#")) {
            currentContext = line.replace(/^#+\s*/, "").trim();
        }
        // Start of code block
        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockStart = i + 1;
                currentLanguage = line.replace("```", "").trim();
                codeBlockContent = [];
            }
            else {
                // End of code block
                inCodeBlock = false;
                if (codeBlockContent.length > 0) {
                    const code = codeBlockContent.join("\n");
                    const isTypeScript = ["tsx", "ts", "typescript"].includes(currentLanguage);
                    const isComponent = code.includes("function") &&
                        code.includes("return") &&
                        code.includes("<");
                    examples.push({
                        code,
                        lineNumber: codeBlockStart,
                        description: `${currentContext} - ${currentLanguage} example`,
                        isTypeScript,
                        isComponent,
                    });
                }
            }
        }
        else if (inCodeBlock) {
            codeBlockContent.push(line);
        }
    }
    return examples;
}
