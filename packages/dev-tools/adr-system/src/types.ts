/**
 * Type definitions for the Reynard ADR System
 */

export type ADRStatus = "proposed" | "accepted" | "rejected" | "superseded" | "deprecated";

export type ADRCategory = "security" | "performance" | "scalability" | "integration" | "maintainability" | "general";

export interface ADRDocument {
  id: string;
  title: string;
  status: ADRStatus;
  category: ADRCategory;
  date: string;
  authors: string[];
  stakeholders: string[];
  context: string;
  decision: string;
  consequences: {
    positive: string[];
    negative: string[];
    risks: Array<{
      risk: string;
      impact: "low" | "medium" | "high";
      probability: "low" | "medium" | "high";
      mitigation: string;
    }>;
  };
  compliance: string;
  references: string[];
  relatedADRs: string[];
  supersededBy?: string;
  supersedes?: string[];
}

export interface ADRTemplate {
  name: string;
  category: ADRCategory;
  sections: string[];
  requiredFields: string[];
  optionalFields: string[];
}

export interface ADRValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ADRRelationship {
  source: string;
  target: string;
  type: "supersedes" | "related" | "conflicts" | "depends_on";
  strength: number; // 0-1
  description: string;
}

export interface ComplianceViolation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  file?: string;
  line?: number;
  location?: string;
  suggestion?: string;
}

export interface ConsistencyViolation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface CircularDependency {
  path: string[];
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  files: string[];
}

export interface DependencyHealthScore {
  dependency: string;
  overallScore: number;
  categoryScores: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  issues: string[];
  lastUpdated: string;
}

