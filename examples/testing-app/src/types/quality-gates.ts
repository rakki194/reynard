/**
 * Quality Gates Types
 * 
 * 🦊 *whiskers twitch with quality gate precision* Type definitions for
 * quality gates management in the testing dashboard.
 */

export interface QualityGateCondition {
  metric: string;
  operator: "GT" | "LT" | "EQ" | "NE" | "GTE" | "LTE";
  threshold: number | string;
  errorThreshold?: number | string;
  warningThreshold?: number | string;
  description?: string;
  enabled: boolean;
}

export interface QualityGate {
  id: string;
  gateId: string;
  name: string;
  description?: string;
  environment: "development" | "staging" | "production" | "all";
  enabled: boolean;
  isDefault: boolean;
  conditions: QualityGateCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface QualityGateResult {
  gateId: string;
  gateName: string;
  status: "PASSED" | "FAILED" | "WARN";
  conditions: QualityGateConditionResult[];
  overallScore: number;
  passedConditions: number;
  totalConditions: number;
  failedConditions: number;
  warningConditions: number;
  evaluationId?: string;
}

export interface QualityGateConditionResult {
  condition: QualityGateCondition;
  status: "PASSED" | "FAILED" | "WARN";
  actualValue: number | string;
  threshold: number | string;
  message: string;
}

export interface QualityGateEvaluationRequest {
  metrics: Record<string, any>;
  environment: "development" | "staging" | "production" | "all";
  evaluationId?: string;
}

export interface QualityGateEvaluationHistory {
  id: string;
  evaluationId: string;
  gateId: string;
  gateName: string;
  environment: string;
  status: "PASSED" | "FAILED" | "WARN";
  overallScore: number;
  passedConditions: number;
  totalConditions: number;
  failedConditions: number;
  warningConditions: number;
  evaluatedAt: string;
}

export interface QualityGateStats {
  totalGates: number;
  enabledGates: number;
  totalEvaluations: number;
  passedEvaluations: number;
  failedEvaluations: number;
  warningEvaluations: number;
  averageScore: number;
  lastEvaluation?: string;
}

export interface CreateQualityGateRequest {
  gateId: string;
  name: string;
  description?: string;
  environment: "development" | "staging" | "production" | "all";
  enabled?: boolean;
  isDefault?: boolean;
  conditions: Omit<QualityGateCondition, 'enabled'>[];
}

export interface UpdateQualityGateRequest {
  name?: string;
  description?: string;
  environment?: "development" | "staging" | "production" | "all";
  enabled?: boolean;
  isDefault?: boolean;
  conditions?: Omit<QualityGateCondition, 'enabled'>[];
}
