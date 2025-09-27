/**
 * Quality Gates Management Page
 * 
 * 🦊 *whiskers twitch with quality gate management precision* Comprehensive
 * quality gates management interface with full CRUD operations, evaluation
 * history, and statistics.
 */

import { Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import { useI18n } from 'reynard-themes';
import { qualityGatesApi, QualityGatesApiError } from '../utils/quality-gates-api';
import type { 
  QualityGate, 
  QualityGateStats, 
  QualityGateEvaluationHistory,
  CreateQualityGateRequest,
  UpdateQualityGateRequest 
} from '../types/quality-gates';
import { QualityGateCard } from '../components/QualityGateCard';
import { QualityGateForm } from '../components/QualityGateForm';
import { QualityGateStatsCard } from '../components/QualityGateStatsCard';
import { EvaluationHistoryTable } from '../components/EvaluationHistoryTable';

type ViewMode = 'list' | 'create' | 'edit' | 'history' | 'stats';

const QualityGates: Component = () => {
  const { locale, isRTL } = useI18n();
  
  // State management
  const [qualityGates, setQualityGates] = createSignal<QualityGate[]>([]);
  const [stats, setStats] = createSignal<QualityGateStats | null>(null);
  const [evaluationHistory, setEvaluationHistory] = createSignal<QualityGateEvaluationHistory[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [apiAvailable, setApiAvailable] = createSignal(false);
  const [viewMode, setViewMode] = createSignal<ViewMode>('list');
  const [selectedGate, setSelectedGate] = createSignal<QualityGate | null>(null);
  const [environmentFilter, setEnvironmentFilter] = createSignal<string>('all');

  onMount(async () => {
    await checkApiAvailability();
    if (apiAvailable()) {
      await loadQualityGates();
      await loadStats();
    }
  });

  const checkApiAvailability = async () => {
    try {
      const available = await qualityGatesApi.isApiAvailable();
      setApiAvailable(available);
      if (!available) {
        setError('Quality Gates API is not available. Please ensure the backend server is running on http://localhost:8000');
      }
    } catch (err) {
      setApiAvailable(false);
      setError('Failed to connect to Quality Gates API');
    }
  };

  const loadQualityGates = async () => {
    if (!apiAvailable()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const gates = await qualityGatesApi.getQualityGates();
      setQualityGates(gates);
    } catch (err) {
      if (err instanceof QualityGatesApiError) {
        setError(`API Error: ${err.message}`);
      } else {
        setError('Failed to load quality gates');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!apiAvailable()) return;
    
    try {
      const statsData = await qualityGatesApi.getQualityGatesStats();
      setStats(statsData);
    } catch (err) {
      console.warn('Failed to load quality gates stats:', err);
    }
  };

  const loadEvaluationHistory = async () => {
    if (!apiAvailable()) return;
    
    try {
      const history = await qualityGatesApi.getEvaluationHistory({
        environment: environmentFilter() !== 'all' ? environmentFilter() : undefined,
        limit: 50
      });
      setEvaluationHistory(history);
    } catch (err) {
      console.warn('Failed to load evaluation history:', err);
    }
  };

  const handleCreateGate = async (data: CreateQualityGateRequest) => {
    try {
      const newGate = await qualityGatesApi.createQualityGate(data);
      setQualityGates(prev => [...prev, newGate]);
      setViewMode('list');
      await loadStats();
    } catch (err) {
      if (err instanceof QualityGatesApiError) {
        setError(`Failed to create quality gate: ${err.message}`);
      } else {
        setError('Failed to create quality gate');
      }
    }
  };

  const handleUpdateGate = async (gateId: string, data: UpdateQualityGateRequest) => {
    try {
      const updatedGate = await qualityGatesApi.updateQualityGate(gateId, data);
      setQualityGates(prev => prev.map(gate => 
        gate.gateId === gateId ? updatedGate : gate
      ));
      setViewMode('list');
      setSelectedGate(null);
      await loadStats();
    } catch (err) {
      if (err instanceof QualityGatesApiError) {
        setError(`Failed to update quality gate: ${err.message}`);
      } else {
        setError('Failed to update quality gate');
      }
    }
  };

  const handleDeleteGate = async (gateId: string) => {
    if (!confirm('Are you sure you want to delete this quality gate?')) {
      return;
    }

    try {
      await qualityGatesApi.deleteQualityGate(gateId);
      setQualityGates(prev => prev.filter(gate => gate.gateId !== gateId));
      await loadStats();
    } catch (err) {
      if (err instanceof QualityGatesApiError) {
        setError(`Failed to delete quality gate: ${err.message}`);
      } else {
        setError('Failed to delete quality gate');
      }
    }
  };

  const handleInitializeDefaultGates = async () => {
    try {
      const defaultGates = await qualityGatesApi.initializeDefaultGates();
      setQualityGates(prev => [...prev, ...defaultGates]);
      await loadStats();
    } catch (err) {
      if (err instanceof QualityGatesApiError) {
        setError(`Failed to initialize default gates: ${err.message}`);
      } else {
        setError('Failed to initialize default gates');
      }
    }
  };

  const handleEditGate = (gate: QualityGate) => {
    setSelectedGate(gate);
    setViewMode('edit');
  };

  const handleViewHistory = async () => {
    setViewMode('history');
    await loadEvaluationHistory();
  };

  const filteredGates = () => {
    const gates = qualityGates();
    const env = environmentFilter();
    if (env === 'all') return gates;
    return gates.filter(gate => gate.environment === env);
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'var(--color-info)';
      case 'staging': return 'var(--color-warning)';
      case 'production': return 'var(--color-error)';
      case 'all': return 'var(--color-primary)';
      default: return 'var(--color-neutral)';
    }
  };

  return (
    <div class="quality-gates-page" dir={isRTL() ? "rtl" : "ltr"}>
      <header class="page-header">
        <h1>🦊 Quality Gates Management</h1>
        <p>Configure and manage quality gates for different environments</p>
      </header>

      <Show when={!apiAvailable()}>
        <div class="api-error">
          <div class="error-content">
            <h2>🚫 API Not Available</h2>
            <p>{error()}</p>
            <button class="retry-button" onClick={checkApiAvailability}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </Show>

      <Show when={apiAvailable()}>
        <div class="page-controls">
          <div class="view-controls">
            <button 
              class={`view-button ${viewMode() === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button 
              class={`view-button ${viewMode() === 'stats' ? 'active' : ''}`}
              onClick={() => setViewMode('stats')}
            >
              📊 Stats
            </button>
            <button 
              class={`view-button ${viewMode() === 'history' ? 'active' : ''}`}
              onClick={handleViewHistory}
            >
              📈 History
            </button>
          </div>

          <div class="action-controls">
            <select 
              value={environmentFilter()} 
              onChange={(e) => setEnvironmentFilter(e.currentTarget.value)}
              class="environment-filter"
            >
              <option value="all">All Environments</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>

            <button 
              class="action-button primary"
              onClick={() => setViewMode('create')}
            >
              ➕ Create Gate
            </button>
            <button 
              class="action-button secondary"
              onClick={handleInitializeDefaultGates}
            >
              🚀 Initialize Defaults
            </button>
          </div>
        </div>

        <Show when={error()}>
          <div class="error-message">
            <h3>❌ Error</h3>
            <p>{error()}</p>
            <button class="retry-button" onClick={() => setError(null)}>
              ✕ Dismiss
            </button>
          </div>
        </Show>

        <main class="page-content">
          <Show when={viewMode() === 'list'}>
            <div class="quality-gates-list">
              <div class="section-header">
                <h2>Quality Gates ({filteredGates().length})</h2>
                <Show when={loading()}>
                  <div class="loading-spinner">⏳ Loading...</div>
                </Show>
              </div>

              <Show when={!loading() && !error()}>
                <div class="gates-grid">
                  <For each={filteredGates()}>
                    {(gate) => (
                      <QualityGateCard
                        gate={gate}
                        onEdit={() => handleEditGate(gate)}
                        onDelete={() => handleDeleteGate(gate.gateId)}
                        environmentColor={getEnvironmentColor(gate.environment)}
                      />
                    )}
                  </For>
                </div>

                <Show when={filteredGates().length === 0}>
                  <div class="empty-state">
                    <h3>📭 No Quality Gates Found</h3>
                    <p>No quality gates match your current filters. Create a new gate or adjust your filters.</p>
                    <button 
                      class="action-button primary"
                      onClick={() => setViewMode('create')}
                    >
                      ➕ Create First Gate
                    </button>
                  </div>
                </Show>
              </Show>
            </div>
          </Show>

          <Show when={viewMode() === 'create'}>
            <div class="quality-gate-form-section">
              <div class="section-header">
                <h2>Create Quality Gate</h2>
                <button 
                  class="back-button"
                  onClick={() => setViewMode('list')}
                >
                  ← Back to List
                </button>
              </div>
              <QualityGateForm
                onSubmit={handleCreateGate}
                onCancel={() => setViewMode('list')}
              />
            </div>
          </Show>

          <Show when={viewMode() === 'edit' && selectedGate()}>
            <div class="quality-gate-form-section">
              <div class="section-header">
                <h2>Edit Quality Gate</h2>
                <button 
                  class="back-button"
                  onClick={() => {
                    setViewMode('list');
                    setSelectedGate(null);
                  }}
                >
                  ← Back to List
                </button>
              </div>
              <QualityGateForm
                gate={selectedGate()!}
                onSubmit={(data) => handleUpdateGate(selectedGate()!.gateId, data)}
                onCancel={() => {
                  setViewMode('list');
                  setSelectedGate(null);
                }}
              />
            </div>
          </Show>

          <Show when={viewMode() === 'stats'}>
            <div class="quality-gates-stats">
              <div class="section-header">
                <h2>Quality Gates Statistics</h2>
                <button 
                  class="refresh-button"
                  onClick={loadStats}
                >
                  🔄 Refresh
                </button>
              </div>
              <Show when={stats()}>
                <QualityGateStatsCard stats={stats()!} />
              </Show>
            </div>
          </Show>

          <Show when={viewMode() === 'history'}>
            <div class="evaluation-history">
              <div class="section-header">
                <h2>Evaluation History</h2>
                <button 
                  class="back-button"
                  onClick={() => setViewMode('list')}
                >
                  ← Back to List
                </button>
              </div>
              <EvaluationHistoryTable 
                history={evaluationHistory()}
                loading={loading()}
              />
            </div>
          </Show>
        </main>
      </Show>
    </div>
  );
};

export default QualityGates;
