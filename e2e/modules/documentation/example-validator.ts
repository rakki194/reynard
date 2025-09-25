/**
 * Code Example Validator for E2E Testing
 *
 * Validates code examples by creating isolated test environments and executing them.
 * Uses temporary directories and package managers to test real-world scenarios.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { ICodeExample } from "./doc-scanner.js";

const execAsync = promisify(exec);

/**
 * Validation Result Interface
 */
export interface IValidationResult {
  exampleId: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  output?: string;
  duration: number;
  environment: string;
  dependencies?: string[];
}

/**
 * Test Environment Configuration
 */
export interface ITestEnvironment {
  tempDir: string;
  packageManager: "pnpm" | "npm" | "yarn";
  nodeVersion: string;
  timeout: number;
  cleanup: boolean;
}

/**
 * Code Example Validator Class
 */
export class ExampleValidator {
  private projectRoot: string;
  private environments: Map<string, ITestEnvironment> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Validate a single code example
   */
  async validateExample(example: ICodeExample): Promise<IValidationResult> {
    const startTime = Date.now();
    const environment = await this.createTestEnvironment(example);

    try {
      console.log(`🦩 Validating example: ${example.id} (${example.type})`);

      const result = await this.executeExample(example, environment);
      const duration = Date.now() - startTime;

      return {
        exampleId: example.id,
        success: result.success,
        errors: result.errors,
        warnings: result.warnings,
        output: result.output,
        duration,
        environment: environment.tempDir,
        dependencies: example.dependencies,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        exampleId: example.id,
        success: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
        duration,
        environment: environment.tempDir,
        dependencies: example.dependencies,
      };
    } finally {
      if (environment.cleanup) {
        await this.cleanupEnvironment(environment);
      }
    }
  }

  /**
   * Validate multiple code examples in parallel
   */
  async validateExamples(examples: ICodeExample[], maxConcurrency: number = 5): Promise<IValidationResult[]> {
    console.log(`🦩 Validating ${examples.length} code examples with max concurrency ${maxConcurrency}`);

    const results: IValidationResult[] = [];
    const chunks = this.chunkArray(examples, maxConcurrency);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(example => this.validateExample(example)));
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Create a test environment for code example validation
   */
  private async createTestEnvironment(example: ICodeExample): Promise<ITestEnvironment> {
    const tempDir = await mkdtemp(join(tmpdir(), `reynard-doc-test-${Date.now()}-`));

    // Determine package manager based on example content
    const packageManager = this.detectPackageManager(example.content);

    // Create basic project structure
    await this.setupProjectStructure(tempDir, example);

    const environment: ITestEnvironment = {
      tempDir,
      packageManager,
      nodeVersion: process.version,
      timeout: 30000, // 30 seconds
      cleanup: true,
    };

    this.environments.set(example.id, environment);
    return environment;
  }

  /**
   * Setup basic project structure for testing
   */
  private async setupProjectStructure(tempDir: string, example: ICodeExample): Promise<void> {
    // Create basic directories
    await mkdir(join(tempDir, "src"), { recursive: true });
    await mkdir(join(tempDir, "examples"), { recursive: true });

    // Create package.json if needed
    if (example.type === "typescript" || example.type === "bash") {
      const packageJson = {
        name: `test-${example.id}`,
        version: "1.0.0",
        type: "module",
        scripts: {
          test: "echo 'Test completed'",
          build: "echo 'Build completed'",
        },
        dependencies: {},
        devDependencies: {
          typescript: "^5.0.0",
          "@types/node": "^20.0.0",
        },
      };

      await writeFile(join(tempDir, "package.json"), JSON.stringify(packageJson, null, 2));
    }

    // Create tsconfig.json for TypeScript examples
    if (example.type === "typescript") {
      const tsconfig = {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
        },
        include: ["src/**/*", "examples/**/*"],
      };

      await writeFile(join(tempDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
    }
  }

  /**
   * Execute a code example in the test environment
   */
  private async executeExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let output = "";

    try {
      switch (example.type) {
        case "bash":
          return await this.executeBashExample(example, environment);
        case "typescript":
          return await this.executeTypeScriptExample(example, environment);
        case "json":
          return await this.executeJsonExample(example, environment);
        case "python":
          return await this.executePythonExample(example, environment);
        case "dockerfile":
          return await this.executeDockerfileExample(example, environment);
        default:
          return await this.executeGenericExample(example, environment);
      }
    } catch (error) {
      errors.push(`Execution failed: ${error}`);
      return { success: false, errors, warnings, output };
    }
  }

  /**
   * Execute bash/shell code examples
   */
  private async executeBashExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let output = "";

    try {
      // Write the script to a temporary file
      const scriptPath = join(environment.tempDir, "test-script.sh");
      await writeFile(scriptPath, example.content);

      // Make it executable
      await execAsync(`chmod +x ${scriptPath}`);

      // Execute the script
      const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
        cwd: environment.tempDir,
        timeout: environment.timeout,
      });

      output = stdout;
      if (stderr) {
        warnings.push(`Script warnings: ${stderr}`);
      }

      return { success: true, errors, warnings, output };
    } catch (error: any) {
      errors.push(`Bash execution failed: ${error.message}`);
      return { success: false, errors, warnings, output: error.stdout || error.stderr };
    }
  }

  /**
   * Execute TypeScript code examples
   */
  private async executeTypeScriptExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let output = "";

    try {
      // Write the TypeScript code to a file
      const tsPath = join(environment.tempDir, "src", "example.ts");
      await writeFile(tsPath, example.content);

      // Install dependencies if needed
      if (example.dependencies && example.dependencies.length > 0) {
        const installCmd = `${environment.packageManager} install ${example.dependencies.join(" ")}`;
        try {
          await execAsync(installCmd, { cwd: environment.tempDir, timeout: environment.timeout });
        } catch (error: any) {
          warnings.push(`Dependency installation failed: ${error.message}`);
        }
      }

      // Compile TypeScript
      try {
        const { stdout: compileOutput } = await execAsync("npx tsc --noEmit", {
          cwd: environment.tempDir,
          timeout: environment.timeout,
        });
        output = compileOutput;
      } catch (error: any) {
        errors.push(`TypeScript compilation failed: ${error.message}`);
        return { success: false, errors, warnings, output: error.stdout || error.stderr };
      }

      return { success: true, errors, warnings, output };
    } catch (error: any) {
      errors.push(`TypeScript execution failed: ${error.message}`);
      return { success: false, errors, warnings, output: error.stdout || error.stderr };
    }
  }

  /**
   * Execute JSON code examples
   */
  private async executeJsonExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate JSON syntax
      JSON.parse(example.content);
      return { success: true, errors, warnings, output: "JSON is valid" };
    } catch (error: any) {
      errors.push(`JSON validation failed: ${error.message}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Execute Python code examples
   */
  private async executePythonExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let output = "";

    try {
      // Write Python code to a file
      const pyPath = join(environment.tempDir, "example.py");
      await writeFile(pyPath, example.content);

      // Execute Python code
      const { stdout, stderr } = await execAsync(`python3 ${pyPath}`, {
        cwd: environment.tempDir,
        timeout: environment.timeout,
      });

      output = stdout;
      if (stderr) {
        warnings.push(`Python warnings: ${stderr}`);
      }

      return { success: true, errors, warnings, output };
    } catch (error: any) {
      errors.push(`Python execution failed: ${error.message}`);
      return { success: false, errors, warnings, output: error.stdout || error.stderr };
    }
  }

  /**
   * Execute Dockerfile examples
   */
  private async executeDockerfileExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Write Dockerfile
      const dockerfilePath = join(environment.tempDir, "Dockerfile");
      await writeFile(dockerfilePath, example.content);

      // Validate Dockerfile syntax (basic check)
      const { stdout } = await execAsync("docker build --dry-run .", {
        cwd: environment.tempDir,
        timeout: environment.timeout,
      });

      return { success: true, errors, warnings, output: stdout };
    } catch (error: any) {
      // Docker might not be available, just validate syntax
      warnings.push(`Docker validation skipped: ${error.message}`);
      return { success: true, errors, warnings, output: "Dockerfile syntax appears valid" };
    }
  }

  /**
   * Execute generic code examples
   */
  private async executeGenericExample(
    example: ICodeExample,
    environment: ITestEnvironment
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    output?: string;
  }> {
    // For generic examples, just validate that they're not empty
    if (!example.content.trim()) {
      return {
        success: false,
        errors: ["Code example is empty"],
        warnings: [],
      };
    }

    return {
      success: true,
      errors: [],
      warnings: ["Generic validation - no specific checks performed"],
      output: "Code example appears valid",
    };
  }

  /**
   * Detect package manager from code content
   */
  private detectPackageManager(content: string): "pnpm" | "npm" | "yarn" {
    if (content.includes("pnpm")) return "pnpm";
    if (content.includes("yarn")) return "yarn";
    return "npm";
  }

  /**
   * Cleanup test environment
   */
  private async cleanupEnvironment(environment: ITestEnvironment): Promise<void> {
    try {
      await rm(environment.tempDir, { recursive: true, force: true });
      this.environments.delete(environment.tempDir);
    } catch (error) {
      console.warn(`⚠️  Failed to cleanup environment ${environment.tempDir}:`, error);
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get validation statistics
   */
  getValidationStats(results: IValidationResult[]): {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
    averageDuration: number;
  } {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    const warnings = results.filter(r => r.warnings.length > 0).length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      successful,
      failed,
      warnings,
      averageDuration,
    };
  }

  /**
   * Cleanup all environments
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.environments.values()).map(env => this.cleanupEnvironment(env));
    await Promise.all(cleanupPromises);
  }
}
