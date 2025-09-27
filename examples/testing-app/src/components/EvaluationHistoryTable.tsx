/**
 * Evaluation History Table Component
 * 
 * 🦊 *whiskers twitch with table precision* Displays quality gate
 * evaluation history in a sortable, filterable table format.
 */

import { Component, For, Show } from 'solid-js';
import type { QualityGateEvaluationHistory } from '../types/quality-gates';

interface EvaluationHistoryTableProps {
  history: QualityGateEvaluationHistory[];
  loading: boolean;
}

export const EvaluationHistoryTable: Component<EvaluationHistoryTableProps> = (props) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return '✅';
      case 'FAILED': return '❌';
      case 'WARN': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'var(--color-success)';
      case 'FAILED': return 'var(--color-error)';
      case 'WARN': return 'var(--color-warning)';
      default: return 'var(--color-neutral)';
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatScore = (score: number) => {
    return `${score.toFixed(1)}%`;
  };

  return (
    <div class="evaluation-history-table">
      <Show when={props.loading}>
        <div class="loading-state">
          <div class="loading-spinner">⏳ Loading evaluation history...</div>
        </div>
      </Show>

      <Show when={!props.loading && props.history.length === 0}>
        <div class="empty-state">
          <h3>📭 No Evaluation History</h3>
          <p>No quality gate evaluations have been recorded yet.</p>
        </div>
      </Show>

      <Show when={!props.loading && props.history.length > 0}>
        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Gate</th>
                <th>Environment</th>
                <th>Score</th>
                <th>Conditions</th>
                <th>Evaluated At</th>
                <th>Evaluation ID</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.history}>
                {(evaluation) => (
                  <tr class="history-row">
                    <td class="status-cell">
                      <span 
                        class="status-badge"
                        style={{ 'background-color': getStatusColor(evaluation.status) }}
                      >
                        {getStatusIcon(evaluation.status)}
                        {evaluation.status}
                      </span>
                    </td>
                    <td class="gate-cell">
                      <div class="gate-info">
                        <div class="gate-name">{evaluation.gateName}</div>
                        <div class="gate-id">ID: {evaluation.gateId}</div>
                      </div>
                    </td>
                    <td class="environment-cell">
                      <span 
                        class="environment-badge"
                        style={{ 'background-color': getEnvironmentColor(evaluation.environment) }}
                      >
                        {evaluation.environment}
                      </span>
                    </td>
                    <td class="score-cell">
                      <div class="score-info">
                        <div class="score-value">{formatScore(evaluation.overallScore)}</div>
                        <div class="score-breakdown">
                          {evaluation.passedConditions}/{evaluation.totalConditions} passed
                        </div>
                      </div>
                    </td>
                    <td class="conditions-cell">
                      <div class="conditions-summary">
                        <div class="condition-counts">
                          <span class="passed-count">✅ {evaluation.passedConditions}</span>
                          <Show when={evaluation.warningConditions > 0}>
                            <span class="warning-count">⚠️ {evaluation.warningConditions}</span>
                          </Show>
                          <Show when={evaluation.failedConditions > 0}>
                            <span class="failed-count">❌ {evaluation.failedConditions}</span>
                          </Show>
                        </div>
                        <div class="total-conditions">
                          Total: {evaluation.totalConditions}
                        </div>
                      </div>
                    </td>
                    <td class="date-cell">
                      <div class="date-info">
                        <div class="date-time">{formatDate(evaluation.evaluatedAt)}</div>
                        <div class="date-relative">
                          {getRelativeTime(evaluation.evaluatedAt)}
                        </div>
                      </div>
                    </td>
                    <td class="evaluation-id-cell">
                      <code class="evaluation-id">{evaluation.evaluationId}</code>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="table-info">
            Showing {props.history.length} evaluation{props.history.length !== 1 ? 's' : ''}
          </div>
          <div class="table-actions">
            <button class="action-button secondary">
              📥 Export History
            </button>
            <button class="action-button secondary">
              🔄 Refresh
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}
