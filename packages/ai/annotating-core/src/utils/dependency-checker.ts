/**
 * Dependency Checker
 *
 * Utility for checking module availability and dependencies in Reynard's
 * caption generation system. Provides runtime dependency validation
 * without importing heavy modules.
 */

export interface DependencyInfo {
  name: string;
  available: boolean;
  version?: string;
  error?: string;
}

export interface DependencyCheckResult {
  allAvailable: boolean;
  dependencies: DependencyInfo[];
  missingDependencies: string[];
}

export class DependencyChecker {
  private static _cache = new Map<string, DependencyInfo>();

  /**
   * Check if a module is available without importing it.
   *
   * @param moduleName - Name of the module to check
   * @returns True if the module is available, False otherwise
   */
  static isModuleAvailable(moduleName: string): boolean {
    if (!moduleName || typeof moduleName !== "string") {
      return false;
    }

    // Check for invalid module name characters
    const invalidChars = [
      " ",
      "@",
      "#",
      "$",
      "%",
      "!",
      "&",
      "*",
      "(",
      ")",
      "+",
      "=",
      "[",
      "]",
      "{",
      "}",
      "|",
      "\\",
      ":",
      ";",
      '"',
      "'",
      "<",
      ">",
      ",",
      "?",
      "/",
    ];
    if (invalidChars.some(char => moduleName.includes(char))) {
      return false;
    }

    try {
      // In Node.js environment, we can use require.resolve
      if (typeof require !== "undefined") {
        require.resolve(moduleName);
        return true;
      }

      // In browser environment, we can't really check
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check multiple dependencies at once.
   *
   * @param moduleNames - Array of module names to check
   * @returns Result object with availability information
   */
  static checkDependencies(moduleNames: string[]): DependencyCheckResult {
    const dependencies: DependencyInfo[] = [];
    const missingDependencies: string[] = [];

    for (const moduleName of moduleNames) {
      const info = this.checkDependency(moduleName);
      dependencies.push(info);

      if (!info.available) {
        missingDependencies.push(moduleName);
      }
    }

    return {
      allAvailable: missingDependencies.length === 0,
      dependencies,
      missingDependencies,
    };
  }

  /**
   * Check a single dependency with caching.
   *
   * @param moduleName - Name of the module to check
   * @returns Dependency information object
   */
  static checkDependency(moduleName: string): DependencyInfo {
    if (this._cache.has(moduleName)) {
      return this._cache.get(moduleName)!;
    }

    const available = this.isModuleAvailable(moduleName);
    const info: DependencyInfo = {
      name: moduleName,
      available,
    };

    if (available) {
      try {
        // Try to get version information
        const module = require(moduleName);
        if (module && module.version) {
          info.version = module.version;
        }
      } catch (error) {
        info.error = error instanceof Error ? error.message : String(error);
      }
    }

    this._cache.set(moduleName, info);
    return info;
  }

  /**
   * Get cached dependency information.
   *
   * @param moduleName - Name of the module
   * @returns Cached dependency info or undefined
   */
  static getCachedDependency(moduleName: string): DependencyInfo | undefined {
    return this._cache.get(moduleName);
  }

  /**
   * Clear the dependency cache.
   */
  static clearCache(): void {
    this._cache.clear();
  }

  /**
   * Check common ML dependencies.
   *
   * @returns Result for common ML packages
   */
  static checkMLDependencies(): DependencyCheckResult {
    const commonMLPackages = [
      "torch",
      "transformers",
      "safetensors",
      "timm",
      "torchvision",
      "PIL",
      "numpy",
      "huggingface_hub",
    ];

    return this.checkDependencies(commonMLPackages);
  }

  /**
   * Check dependencies for a specific generator type.
   *
   * @param generatorType - Type of generator (jtp2, florence2, etc.)
   * @returns Result for generator-specific dependencies
   */
  static checkGeneratorDependencies(generatorType: string): DependencyCheckResult {
    const dependencies: Record<string, string[]> = {
      jtp2: ["torch", "timm", "safetensors", "PIL"],
      florence2: ["torch", "transformers", "PIL"],
      joycaption: ["torch", "transformers", "PIL"],
      wdv3: ["torch", "transformers", "PIL", "numpy"],
    };

    const requiredDeps = dependencies[generatorType] || [];
    return this.checkDependencies(requiredDeps);
  }

  /**
   * Validate that all required dependencies are available.
   *
   * @param requiredDeps - Array of required module names
   * @throws Error if any dependencies are missing
   */
  static validateDependencies(requiredDeps: string[]): void {
    const result = this.checkDependencies(requiredDeps);

    if (!result.allAvailable) {
      throw new Error(`Missing required dependencies: ${result.missingDependencies.join(", ")}`);
    }
  }
}
