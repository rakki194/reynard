/**
 * 🦦 Reynard Docstring Quality Gates
 *
 * *splashes with thoroughness* Predefined quality gates for docstring
 * coverage and quality enforcement.
 */

import { QualityGate } from "../types";

export const DOCSTRING_QUALITY_GATES: QualityGate[] = [
  {
    id: "docstring-coverage-minimum",
    name: "Minimum Docstring Coverage",
    enabled: true,
    conditions: [
      {
        metric: "docstringCoverage",
        operator: "GT",
        threshold: 80,
        errorThreshold: 70,
      },
    ],
  },
  {
    id: "docstring-quality-minimum",
    name: "Minimum Docstring Quality Score",
    enabled: true,
    conditions: [
      {
        metric: "docstringQualityScore",
        operator: "GT",
        threshold: 70,
        errorThreshold: 60,
      },
    ],
  },
  {
    id: "function-documentation-coverage",
    name: "Function Documentation Coverage",
    enabled: true,
    conditions: [
      {
        metric: "documentedFunctions",
        operator: "GT",
        threshold: 0.8, // 80% of functions documented
        errorThreshold: 0.7, // 70% minimum
      },
    ],
  },
  {
    id: "class-documentation-coverage",
    name: "Class Documentation Coverage",
    enabled: true,
    conditions: [
      {
        metric: "documentedClasses",
        operator: "GT",
        threshold: 0.9, // 90% of classes documented
        errorThreshold: 0.8, // 80% minimum
      },
    ],
  },
  {
    id: "module-documentation-coverage",
    name: "Module Documentation Coverage",
    enabled: true,
    conditions: [
      {
        metric: "documentedModules",
        operator: "GT",
        threshold: 0.95, // 95% of modules documented
        errorThreshold: 0.9, // 90% minimum
      },
    ],
  },
];

export const STRICT_DOCSTRING_QUALITY_GATES: QualityGate[] = [
  {
    id: "strict-docstring-coverage",
    name: "Strict Docstring Coverage",
    enabled: true,
    conditions: [
      {
        metric: "docstringCoverage",
        operator: "GT",
        threshold: 95,
        errorThreshold: 90,
      },
    ],
  },
  {
    id: "strict-docstring-quality",
    name: "Strict Docstring Quality Score",
    enabled: true,
    conditions: [
      {
        metric: "docstringQualityScore",
        operator: "GT",
        threshold: 85,
        errorThreshold: 80,
      },
    ],
  },
  {
    id: "strict-function-documentation",
    name: "Strict Function Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedFunctions",
        operator: "GT",
        threshold: 0.95, // 95% of functions documented
        errorThreshold: 0.9, // 90% minimum
      },
    ],
  },
  {
    id: "strict-class-documentation",
    name: "Strict Class Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedClasses",
        operator: "GT",
        threshold: 1.0, // 100% of classes documented
        errorThreshold: 0.95, // 95% minimum
      },
    ],
  },
  {
    id: "strict-module-documentation",
    name: "Strict Module Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedModules",
        operator: "GT",
        threshold: 1.0, // 100% of modules documented
        errorThreshold: 0.98, // 98% minimum
      },
    ],
  },
];

export const RELAXED_DOCSTRING_QUALITY_GATES: QualityGate[] = [
  {
    id: "relaxed-docstring-coverage",
    name: "Relaxed Docstring Coverage",
    enabled: true,
    conditions: [
      {
        metric: "docstringCoverage",
        operator: "GT",
        threshold: 60,
        errorThreshold: 50,
      },
    ],
  },
  {
    id: "relaxed-docstring-quality",
    name: "Relaxed Docstring Quality Score",
    enabled: true,
    conditions: [
      {
        metric: "docstringQualityScore",
        operator: "GT",
        threshold: 50,
        errorThreshold: 40,
      },
    ],
  },
  {
    id: "relaxed-function-documentation",
    name: "Relaxed Function Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedFunctions",
        operator: "GT",
        threshold: 0.6, // 60% of functions documented
        errorThreshold: 0.5, // 50% minimum
      },
    ],
  },
  {
    id: "relaxed-class-documentation",
    name: "Relaxed Class Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedClasses",
        operator: "GT",
        threshold: 0.7, // 70% of classes documented
        errorThreshold: 0.6, // 60% minimum
      },
    ],
  },
  {
    id: "relaxed-module-documentation",
    name: "Relaxed Module Documentation",
    enabled: true,
    conditions: [
      {
        metric: "documentedModules",
        operator: "GT",
        threshold: 0.8, // 80% of modules documented
        errorThreshold: 0.7, // 70% minimum
      },
    ],
  },
];

/**
 * 🦦 Get docstring quality gates by preset
 */
export function getDocstringQualityGates(preset: "strict" | "standard" | "relaxed" = "standard"): QualityGate[] {
  switch (preset) {
    case "strict":
      return STRICT_DOCSTRING_QUALITY_GATES;
    case "relaxed":
      return RELAXED_DOCSTRING_QUALITY_GATES;
    case "standard":
    default:
      return DOCSTRING_QUALITY_GATES;
  }
}

/**
 * 🦦 Create custom docstring quality gate
 */
export function createCustomDocstringGate(
  id: string,
  name: string,
  coverageThreshold: number,
  qualityThreshold: number,
  functionThreshold: number,
  classThreshold: number,
  moduleThreshold: number
): QualityGate {
  return {
    id,
    name,
    enabled: true,
    conditions: [
      {
        metric: "docstringCoverage",
        operator: "GT",
        threshold: coverageThreshold,
        errorThreshold: coverageThreshold * 0.9,
      },
      {
        metric: "docstringQualityScore",
        operator: "GT",
        threshold: qualityThreshold,
        errorThreshold: qualityThreshold * 0.9,
      },
      {
        metric: "documentedFunctions",
        operator: "GT",
        threshold: functionThreshold,
        errorThreshold: functionThreshold * 0.9,
      },
      {
        metric: "documentedClasses",
        operator: "GT",
        threshold: classThreshold,
        errorThreshold: classThreshold * 0.9,
      },
      {
        metric: "documentedModules",
        operator: "GT",
        threshold: moduleThreshold,
        errorThreshold: moduleThreshold * 0.9,
      },
    ],
  };
}
