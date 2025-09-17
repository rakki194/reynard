/**
 * 🐺 Security Tool Executor
 *
 * *snarls with predatory intelligence* Utility for executing security tools
 * and processing their output.
 */
import { exec } from "child_process";
import { promisify } from "util";
import { extractHotspotsFromOutput } from "./analysis-utils";
const execAsync = promisify(exec);
/**
 * 🐺 Run a specific security tool
 */
export async function runSecurityTool(tool, files, projectRoot) {
    const command = `${tool.command} ${tool.args.join(" ")} ${files.join(" ")}`;
    try {
        const { stdout } = await execAsync(command, {
            cwd: projectRoot,
            timeout: 300000, // 5 minutes timeout
        });
        const vulnerabilities = tool.outputParser(stdout);
        const hotspots = extractHotspotsFromOutput(stdout, tool.name);
        return { vulnerabilities, hotspots };
    }
    catch (error) {
        // Some tools return non-zero exit codes even on successful analysis
        if (error.stdout) {
            const vulnerabilities = tool.outputParser(error.stdout);
            const hotspots = extractHotspotsFromOutput(error.stdout, tool.name);
            return { vulnerabilities, hotspots };
        }
        throw error;
    }
}
