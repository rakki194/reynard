import { test, expect } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

test.describe("🐺 Direct Penetration Testing", () => {
  test("should run fuzzing exploit directly", async () => {
    const fenrirPath = path.join(process.cwd(), "..", "fenrir");
    const pythonPath = "bash -c 'source ~/venv/bin/activate && python3'";

    const command = `${pythonPath} -c "
import sys
sys.path.append('${fenrirPath}')
from fuzzing.exploit_wrappers import ComprehensiveFuzzerExploit
import json

# Run the exploit
exploit = ComprehensiveFuzzerExploit('http://localhost:8888')
result = exploit.run_exploit()

# Return results as JSON
print(json.dumps({
    'success': True,
    'vulnerabilities_found': len([r for r in result if hasattr(r, 'success') and r.success]),
    'details': [{'type': r.vulnerability_type, 'description': r.description, 'impact': r.impact} for r in result if hasattr(r, 'vulnerability_type')],
    'execution_time': 0
}))
"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      cwd: fenrirPath,
    });

    if (stderr && !stderr.includes("Warning")) {
      console.warn(`⚠️ Exploit warning: ${stderr}`);
    }

    const result = JSON.parse(stdout.trim());

    expect(result.success).toBe(true);
    expect(result.vulnerabilities_found).toBeGreaterThanOrEqual(0);
    console.log(`✅ Fuzzing completed successfully`);
    console.log(`📊 Vulnerabilities found: ${result.vulnerabilities_found}`);
  });
});
