/**
 * Quality Gates API Utilities
 * 
 * 🦊 *whiskers twitch with API precision* API client for quality gates
 * management, connecting to the Reynard backend quality gates service.
 */

import type {
  QualityGate,
  QualityGateResult,
  QualityGateEvaluationRequest,
  QualityGateEvaluationHistory,
  QualityGateStats,
  CreateQualityGateRequest,
  UpdateQualityGateRequest,
} from '../types/quality-gates';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

class QualityGatesApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'QualityGatesApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Use default error message if response is not JSON
    }
    throw new QualityGatesApiError(errorMessage, response.status);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

export const qualityGatesApi = {
  /**
   * Check if the quality gates API is available
   */
  async isApiAvailable(): Promise<boolean> {
    try {
      await makeRequest('/api/quality-gates/health');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get all quality gates
   */
  async getQualityGates(): Promise<QualityGate[]> {
    return makeRequest<QualityGate[]>('/api/quality-gates/');
  },

  /**
   * Get a specific quality gate by ID
   */
  async getQualityGate(gateId: string): Promise<QualityGate> {
    return makeRequest<QualityGate>(`/api/quality-gates/${gateId}`);
  },

  /**
   * Get quality gates for a specific environment
   */
  async getQualityGatesForEnvironment(environment: string): Promise<QualityGate[]> {
    return makeRequest<QualityGate[]>(`/api/quality-gates/?environment=${environment}`);
  },

  /**
   * Create a new quality gate
   */
  async createQualityGate(data: CreateQualityGateRequest): Promise<QualityGate> {
    return makeRequest<QualityGate>('/api/quality-gates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing quality gate
   */
  async updateQualityGate(gateId: string, data: UpdateQualityGateRequest): Promise<QualityGate> {
    return makeRequest<QualityGate>(`/api/quality-gates/${gateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a quality gate
   */
  async deleteQualityGate(gateId: string): Promise<void> {
    await makeRequest(`/api/quality-gates/${gateId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Evaluate quality gates against metrics
   */
  async evaluateQualityGates(request: QualityGateEvaluationRequest): Promise<QualityGateResult[]> {
    return makeRequest<QualityGateResult[]>('/api/quality-gates/evaluate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get evaluation history
   */
  async getEvaluationHistory(params: {
    gateId?: string;
    environment?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<QualityGateEvaluationHistory[]> {
    const searchParams = new URLSearchParams();
    if (params.gateId) searchParams.set('gateId', params.gateId);
    if (params.environment) searchParams.set('environment', params.environment);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/quality-gates/evaluations?${queryString}` : '/api/quality-gates/evaluations';
    
    return makeRequest<QualityGateEvaluationHistory[]>(endpoint);
  },

  /**
   * Get quality gates statistics
   */
  async getQualityGatesStats(): Promise<QualityGateStats> {
    return makeRequest<QualityGateStats>('/api/quality-gates/stats');
  },

  /**
   * Initialize default quality gates
   */
  async initializeDefaultGates(): Promise<QualityGate[]> {
    return makeRequest<QualityGate[]>('/api/quality-gates/init', {
      method: 'POST',
    });
  },

  /**
   * Set default quality gate for environment
   */
  async setDefaultQualityGate(gateId: string, environment: string): Promise<QualityGate> {
    return makeRequest<QualityGate>(`/api/quality-gates/${gateId}/set-default`, {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
  },

  /**
   * Export quality gates configuration
   */
  async exportConfiguration(): Promise<any> {
    return makeRequest('/api/quality-gates/export');
  },

  /**
   * Import quality gates configuration
   */
  async importConfiguration(config: any): Promise<QualityGate[]> {
    return makeRequest<QualityGate[]>('/api/quality-gates/import', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

export { QualityGatesApiError };
