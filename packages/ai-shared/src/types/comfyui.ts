/**
 * ComfyUI Types
 * 
 * Defines types for ComfyUI workflow management, job processing,
 * and node-based AI pipeline operations within the Reynard framework.
 */

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  position: { x: number; y: number }
  metadata: Record<string, any>
}

export interface WorkflowConnection {
  from: { nodeId: string; output: string }
  to: { nodeId: string; input: string }
}

export interface JobId {
  id: string
  timestamp: Date
}

export interface JobStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message?: string
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface JobResult {
  id: string
  status: 'completed' | 'failed'
  outputs: Record<string, any>
  error?: string
  completedAt: Date
}
