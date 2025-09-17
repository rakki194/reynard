/**
 * 🐺 Reynard Issue Detector
 *
 * *snarls with predatory focus* Detects quality issues using existing
 * tools with wolf-like relentless determination.
 */
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export class IssueDetector {
    /**
     * 🐺 Detect quality issues using existing tools
     */
    async detectIssues(files) {
        const issues = [];
        // Run existing linting tools
        const lintingResults = await this.runLintingTools(files);
        issues.push(...lintingResults);
        // Run security analysis
        const securityResults = await this.runSecurityAnalysis(files);
        issues.push(...securityResults);
        return issues;
    }
    async runLintingTools(files) {
        const issues = [];
        try {
            // Run ESLint for TypeScript/JavaScript
            const tsFiles = files.filter(f => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx"));
            if (tsFiles.length > 0) {
                const eslintResult = await this.runESLint(tsFiles);
                issues.push(...eslintResult);
            }
            // Run Python linting
            const pyFiles = files.filter(f => f.endsWith(".py"));
            if (pyFiles.length > 0) {
                const pythonResult = await this.runPythonLinting(pyFiles);
                issues.push(...pythonResult);
            }
        }
        catch (error) {
            console.warn("⚠️ Linting tools failed:", error);
        }
        return issues;
    }
    async runESLint(files) {
        try {
            const { stdout } = await execAsync(`pnpm lint --format json ${files.join(" ")}`);
            const results = JSON.parse(stdout);
            const issues = [];
            for (const result of results) {
                for (const message of result.messages) {
                    issues.push({
                        id: `${result.filePath}:${message.line}:${message.column}`,
                        type: this.mapESLintSeverityToType(message.severity),
                        severity: this.mapESLintSeverityToSeverity(message.severity),
                        message: message.message,
                        file: result.filePath,
                        line: message.line,
                        column: message.column,
                        rule: message.ruleId || "unknown",
                        effort: this.estimateEffort(message.severity),
                        tags: ["eslint"],
                        createdAt: new Date(),
                    });
                }
            }
            return issues;
        }
        catch {
            return [];
        }
    }
    async runPythonLinting(files) {
        try {
            const { stdout } = await execAsync(`python -m flake8 --format=%(path)s:%(row)d:%(col)d: %(code)s %(text)s ${files.join(" ")}`);
            const lines = stdout.split("\n").filter(line => line.trim());
            const issues = [];
            for (const line of lines) {
                const match = line.match(/^(.+):(\d+):(\d+): ([A-Z]\d+) (.+)$/);
                if (match) {
                    const [, file, lineNum, col, code, message] = match;
                    issues.push({
                        id: `${file}:${lineNum}:${col}`,
                        type: "CODE_SMELL",
                        severity: this.mapFlake8Severity(code),
                        message,
                        file,
                        line: parseInt(lineNum),
                        column: parseInt(col),
                        rule: code,
                        effort: this.estimateEffort(this.mapFlake8Severity(code)),
                        tags: ["flake8", "python"],
                        createdAt: new Date(),
                    });
                }
            }
            return issues;
        }
        catch {
            return [];
        }
    }
    async runSecurityAnalysis(_files) {
        // This would integrate with your existing Fenrir security tools
        const issues = [];
        // Placeholder for security analysis integration
        // In a real implementation, this would call your Fenrir tools
        return issues;
    }
    mapESLintSeverityToType(severity) {
        switch (severity) {
            case 2:
                return "BUG";
            case 1:
                return "CODE_SMELL";
            default:
                return "CODE_SMELL";
        }
    }
    mapESLintSeverityToSeverity(severity) {
        switch (severity) {
            case 2:
                return "MAJOR";
            case 1:
                return "MINOR";
            default:
                return "INFO";
        }
    }
    mapFlake8Severity(code) {
        if (code.startsWith("E"))
            return "MAJOR";
        if (code.startsWith("W"))
            return "MINOR";
        if (code.startsWith("F"))
            return "CRITICAL";
        return "INFO";
    }
    estimateEffort(severity) {
        if (typeof severity === "number") {
            return severity * 30; // minutes
        }
        switch (severity) {
            case "BLOCKER":
            case "CRITICAL":
                return 120;
            case "MAJOR":
                return 60;
            case "MINOR":
                return 30;
            default:
                return 15;
        }
    }
}
