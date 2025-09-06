/**
 * Core types for the Reynard tools system
 */

export enum ParameterType {
  STRING = "string",
  INTEGER = "integer",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}

export interface ToolParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface ToolExecutionContext {
  userId?: string;
  sessionId?: string;
  permissions: string[];
  metadata: Record<string, any>;
  timeout?: number;
  retryCount?: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: string;
  tags: string[];
  permissions?: string[];
  timeout?: number;
  retryCount?: number;
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  callId: string;
  timestamp: Date;
}

export interface ToolCallResult {
  callId: string;
  result: ToolResult;
  timestamp: Date;
}

export interface ToolError extends Error {
  toolName: string;
  callId?: string;
  code: string;
  details?: any;
}

export interface ToolValidationError extends ToolError {
  parameter: string;
  value: any;
  expected: any;
}

export interface ToolExecutionError extends ToolError {
  executionTime: number;
  retryCount: number;
}

export interface ToolPermissionError extends ToolError {
  requiredPermission: string;
  userPermissions: string[];
}

export interface ToolTimeoutError extends ToolError {
  timeout: number;
  executionTime: number;
}

export interface ToolResourceError extends ToolError {
  resource: string;
  operation: string;
}

export interface ToolMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  lastCalled: Date;
  errorRate: number;
}

export interface ToolRegistryStats {
  totalTools: number;
  activeTools: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  errorRate: number;
  topTools: Array<{
    name: string;
    calls: number;
    successRate: number;
  }>;
}
