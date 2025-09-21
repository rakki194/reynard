/**
 * 🐺 Fix Generator Module
 * Generates specific fixes for different shellcheck issues
 */

import type { ScriptFix } from "./types.js";

export class FixGenerator {
  static generateFixesForLine(line: string): ScriptFix[] {
    const fixes: ScriptFix[] = [];

    if (line.includes("SC2292")) {
      fixes.push(...this.createBracketFixes());
    }

    if (line.includes("SC2250")) {
      fixes.push(this.createVariableBraceFix());
    }

    if (line.includes("SC2154")) {
      fixes.push(this.createGithubOutputFix());
    }

    return fixes;
  }

  private static createBracketFixes(): ScriptFix[] {
    return [
      {
        type: "replace",
        pattern: /if \[ /g,
        replacement: "if [[ ",
        description: "Replace [ ] with [[ ]] for bash tests",
        priority: 1,
        safe: true,
      },
      {
        type: "replace",
        pattern: /\] /g,
        replacement: "]] ",
        description: "Replace [ ] with [[ ]] for bash tests",
        priority: 1,
        safe: true,
      },
    ];
  }

  private static createVariableBraceFix(): ScriptFix {
    return {
      type: "replace",
      pattern: /\$([A-Za-z_][A-Za-z0-9_]*)/g,
      replacement: "${$1}",
      description: "Add braces around variable references",
      priority: 2,
      safe: true,
    };
  }

  private static createGithubOutputFix(): ScriptFix {
    return {
      type: "replace",
      pattern: /\$GITHUB_OUTPUT/g,
      replacement: "${GITHUB_OUTPUT}",
      description: "Add braces around GITHUB_OUTPUT variable",
      priority: 1,
      safe: true,
    };
  }
}
