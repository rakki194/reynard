/**
 * Tests for DocstringAnalyzer
 */

import { describe, it, expect, beforeEach } from "vitest";
import { DocstringAnalyzer } from "../DocstringAnalyzer";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

describe("DocstringAnalyzer", () => {
  let analyzer: DocstringAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new DocstringAnalyzer();
    tempDir = join(process.cwd(), "temp-test-files");
  });

  describe("Python File Analysis", () => {
    it("should analyze a Python file with good documentation", async () => {
      const pythonContent = `"""
Test module with good documentation.
"""

def documented_function(param1: str, param2: int) -> str:
    """
    This is a well-documented function.
    
    Args:
        param1: A string parameter
        param2: An integer parameter
        
    Returns:
        A formatted string
        
    Example:
        >>> result = documented_function("hello", 42)
    """
    return f"{param1}-{param2}"

class DocumentedClass:
    """
    A well-documented class.
    """
    
    def __init__(self, value: int):
        """Initialize with a value."""
        self.value = value
`;

      const tempFile = join(tempDir, "test_good.py");
      writeFileSync(tempFile, pythonContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.language).toBe("python");
      expect(analysis.metrics.totalFunctions).toBe(2); // documented_function + __init__
      expect(analysis.metrics.documentedFunctions).toBe(2); // both have docstrings
      expect(analysis.metrics.totalClasses).toBe(1);
      expect(analysis.metrics.documentedClasses).toBe(1);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(1);
      expect(analysis.issues).toHaveLength(1); // __init__ method has poor quality docstring

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });

    it("should detect missing docstrings in Python", async () => {
      const pythonContent = `def undocumented_function():
    return "no docstring"

class UndocumentedClass:
    def __init__(self):
        self.value = 0
`;

      const tempFile = join(tempDir, "test_missing.py");
      writeFileSync(tempFile, pythonContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.language).toBe("python");
      expect(analysis.metrics.totalFunctions).toBe(2); // undocumented_function + __init__
      expect(analysis.metrics.documentedFunctions).toBe(0); // neither has docstrings
      expect(analysis.metrics.totalClasses).toBe(1);
      expect(analysis.metrics.documentedClasses).toBe(0);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(0);
      expect(analysis.issues.length).toBeGreaterThan(0);

      // Check for missing docstring issues
      const missingIssues = analysis.issues.filter(issue => 
        issue.rule === "docstring-missing"
      );
      expect(missingIssues.length).toBeGreaterThan(0);

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });

    it("should detect poor quality docstrings in Python", async () => {
      const pythonContent = `def poor_function():
    """short"""
    return "poor docstring"

class PoorClass:
    """bad"""
    pass
`;

      const tempFile = join(tempDir, "test_poor.py");
      writeFileSync(tempFile, pythonContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.language).toBe("python");
      expect(analysis.issues.length).toBeGreaterThan(0);

      // Check for poor quality issues
      const qualityIssues = analysis.issues.filter(issue => 
        issue.rule === "docstring-quality"
      );
      expect(qualityIssues.length).toBeGreaterThan(0);

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });
  });

  describe("TypeScript File Analysis", () => {
    it("should analyze a TypeScript file with good JSDoc", async () => {
      const tsContent = `/**
 * Test module with good JSDoc documentation.
 * 
 * This module demonstrates proper documentation practices.
 */

/**
 * A well-documented function with proper JSDoc.
 * 
 * @param param1 - A string parameter
 * @param param2 - A number parameter
 * @returns A formatted string combining both parameters
 * 
 * @example
 * \`\`\`typescript
 * const result = documentedFunction("hello", 42);
 * console.log(result); // "hello-42"
 * \`\`\`
 */
export function documentedFunction(param1: string, param2: number): string {
  return \`\${param1}-\${param2}\`;
}

/**
 * A well-documented class with proper JSDoc.
 * 
 * This class demonstrates proper documentation practices.
 */
export class DocumentedClass {
  private value: number;

  /**
   * Initialize the class with a value.
   * 
   * @param value - The initial value
   */
  constructor(value: number) {
    this.value = value;
  }
}
`;

      const tempFile = join(tempDir, "test_good.ts");
      writeFileSync(tempFile, tsContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.language).toBe("typescript");
      expect(analysis.metrics.totalFunctions).toBe(2); // documentedFunction + constructor
      expect(analysis.metrics.documentedFunctions).toBe(2); // both have JSDoc
      expect(analysis.metrics.totalClasses).toBe(1);
      expect(analysis.metrics.documentedClasses).toBe(1);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(1);
      expect(analysis.issues).toHaveLength(0);

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });

    it("should detect missing JSDoc in TypeScript", async () => {
      const tsContent = `export function undocumentedFunction(): string {
  return "no JSDoc";
}

export class UndocumentedClass {
  private value: number = 0;
}
`;

      const tempFile = join(tempDir, "test_missing.ts");
      writeFileSync(tempFile, tsContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.language).toBe("typescript");
      expect(analysis.metrics.totalFunctions).toBe(1);
      expect(analysis.metrics.documentedFunctions).toBe(0);
      expect(analysis.metrics.totalClasses).toBe(1);
      expect(analysis.metrics.documentedClasses).toBe(0);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(0);
      expect(analysis.issues.length).toBeGreaterThan(0);

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });
  });

  describe("Multiple File Analysis", () => {
    it("should analyze multiple files and calculate overall metrics", async () => {
      const pythonContent = `"""
Good Python module.
"""

def documented_function():
    """Well documented function."""
    return "hello"

def undocumented_function():
    return "no docstring"
`;

      const tsContent = `/**
 * Good TypeScript module.
 */

/**
 * Well documented function.
 */
export function documentedFunction(): string {
  return "hello";
}

export function undocumentedFunction(): string {
  return "no JSDoc";
}
`;

      const pythonFile = join(tempDir, "test_multi.py");
      const tsFile = join(tempDir, "test_multi.ts");
      
      writeFileSync(pythonFile, pythonContent);
      writeFileSync(tsFile, tsContent);

      const analyses = await analyzer.analyzeFiles([pythonFile, tsFile]);
      const overallMetrics = analyzer.getOverallMetrics(analyses);

      expect(analyses).toHaveLength(2);
      expect(overallMetrics.totalFunctions).toBe(4); // 2 Python + 2 TypeScript functions
      expect(overallMetrics.documentedFunctions).toBe(2); // 1 Python + 1 TypeScript documented
      expect(overallMetrics.totalClasses).toBe(0);
      expect(overallMetrics.totalModules).toBe(2);
      expect(overallMetrics.documentedModules).toBe(2);
      expect(overallMetrics.coveragePercentage).toBe(66.67); // 4/6 total documented (functions + modules)

      // Clean up
      if (existsSync(pythonFile)) unlinkSync(pythonFile);
      if (existsSync(tsFile)) unlinkSync(tsFile);
    });
  });

  describe("Error Handling", () => {
    it("should throw error for non-existent file", async () => {
      const nonExistentFile = join(tempDir, "non_existent.py");
      
      await expect(analyzer.analyzeFile(nonExistentFile))
        .rejects.toThrow("File not found");
    });

    it("should throw error for unsupported language", async () => {
      const unsupportedFile = join(tempDir, "test.txt");
      writeFileSync(unsupportedFile, "This is a text file");

      await expect(analyzer.analyzeFile(unsupportedFile))
        .rejects.toThrow("Cannot detect language for file");

      // Clean up
      if (existsSync(unsupportedFile)) unlinkSync(unsupportedFile);
    });

    it("should handle empty files gracefully", async () => {
      const emptyFile = join(tempDir, "empty.py");
      writeFileSync(emptyFile, "");

      const analysis = await analyzer.analyzeFile(emptyFile);

      expect(analysis.metrics.totalFunctions).toBe(0);
      expect(analysis.metrics.totalClasses).toBe(0);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(0);

      // Clean up
      if (existsSync(emptyFile)) unlinkSync(emptyFile);
    });
  });

  describe("Quality Assessment", () => {
    it("should correctly assess docstring quality levels", async () => {
      const pythonContent = `def excellent_function():
    """
    This is an excellent docstring with comprehensive documentation.
    
    Args:
        param1: Description of parameter 1
        param2: Description of parameter 2
        
    Returns:
        Description of return value
        
    Example:
        >>> result = excellent_function()
    """
    return "excellent"

def good_function():
    """
    This is a good docstring with basic documentation.
    
    Args:
        param: Description of parameter
    """
    return "good"

def poor_function():
    """short"""
    return "poor"

def missing_function():
    return "missing"
`;

      const tempFile = join(tempDir, "test_quality.py");
      writeFileSync(tempFile, pythonContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.functions).toHaveLength(4);
      
      const excellentFunc = analysis.functions.find(f => f.name === "excellent_function");
      const goodFunc = analysis.functions.find(f => f.name === "good_function");
      const poorFunc = analysis.functions.find(f => f.name === "poor_function");
      const missingFunc = analysis.functions.find(f => f.name === "missing_function");

      expect(excellentFunc?.quality).toBe("excellent");
      expect(goodFunc?.quality).toBe("good");
      expect(poorFunc?.quality).toBe("poor");
      expect(missingFunc?.quality).toBe("missing");

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with only comments", async () => {
      const commentOnlyContent = `# This is a comment-only file
# No actual code here
`;

      const tempFile = join(tempDir, "comments_only.py");
      writeFileSync(tempFile, commentOnlyContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      expect(analysis.metrics.totalFunctions).toBe(0);
      expect(analysis.metrics.totalClasses).toBe(0);
      expect(analysis.metrics.totalModules).toBe(1);
      expect(analysis.metrics.documentedModules).toBe(0);

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });

    it("should handle nested functions and classes", async () => {
      const nestedContent = `"""
Module with nested structures.
"""

def outer_function():
    """
    Outer function with nested function.
    """
    def inner_function():
        """Inner function docstring."""
        return "inner"
    
    class InnerClass:
        """Inner class docstring."""
        pass
    
    return inner_function()
`;

      const tempFile = join(tempDir, "nested.py");
      writeFileSync(tempFile, nestedContent);

      const analysis = await analyzer.analyzeFile(tempFile);

      // Currently counts all functions (including nested ones)
      expect(analysis.metrics.totalFunctions).toBe(2); // outer_function + inner_function
      expect(analysis.metrics.totalClasses).toBe(1); // InnerClass
      expect(analysis.metrics.documentedFunctions).toBe(2); // both have docstrings

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });
  });
});
