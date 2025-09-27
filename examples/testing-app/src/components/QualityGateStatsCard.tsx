/**
 * Quality Gate Statistics Card Component
 * 
 * 🦊 *whiskers twitch with stats precision* Displays comprehensive
 * quality gates statistics in a visual card format.
 */

import { Component } from 'solid-js';
import type { QualityGateStats } from '../types/quality-gates';

interface QualityGateStatsCardProps {
  stats: QualityGateStats;
}

export const QualityGateStatsCard: Component<QualityGateStatsCardProps> = (props) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'var(--color-success)';
      case 'failed': return 'var(--color-error)';
      case 'warning': return 'var(--color-warning)';
      default: return 'var(--color-neutral)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'warning': return '⚠️';
      default: return '📊';
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div class="quality-gate-stats-card">
      <div class="stats-header">
        <h3>📊 Quality Gates Statistics</h3>
        <div class="last-updated">
          Last Updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🦊</div>
          <div class="stat-content">
            <div class="stat-value">{props.stats.totalGates}</div>
            <div class="stat-label">Total Gates</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{props.stats.enabledGates}</div>
            <div class="stat-label">Enabled Gates</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{props.stats.totalEvaluations}</div>
            <div class="stat-label">Total Evaluations</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{formatPercentage(props.stats.averageScore)}</div>
            <div class="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div class="evaluation-breakdown">
        <h4>Evaluation Results</h4>
        <div class="breakdown-grid">
          <div class="breakdown-item passed">
            <div class="breakdown-icon">✅</div>
            <div class="breakdown-content">
              <div class="breakdown-value">{props.stats.passedEvaluations}</div>
              <div class="breakdown-label">Passed</div>
              <div class="breakdown-percentage">
                {props.stats.totalEvaluations > 0 
                  ? formatPercentage((props.stats.passedEvaluations / props.stats.totalEvaluations) * 100)
                  : '0%'
                }
              </div>
            </div>
          </div>

          <div class="breakdown-item warning">
            <div class="breakdown-icon">⚠️</div>
            <div class="breakdown-content">
              <div class="breakdown-value">{props.stats.warningEvaluations}</div>
              <div class="breakdown-label">Warnings</div>
              <div class="breakdown-percentage">
                {props.stats.totalEvaluations > 0 
                  ? formatPercentage((props.stats.warningEvaluations / props.stats.totalEvaluations) * 100)
                  : '0%'
                }
              </div>
            </div>
          </div>

          <div class="breakdown-item failed">
            <div class="breakdown-icon">❌</div>
            <div class="breakdown-content">
              <div class="breakdown-value">{props.stats.failedEvaluations}</div>
              <div class="breakdown-label">Failed</div>
              <div class="breakdown-percentage">
                {props.stats.totalEvaluations > 0 
                  ? formatPercentage((props.stats.failedEvaluations / props.stats.totalEvaluations) * 100)
                  : '0%'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="last-evaluation">
        <h4>Last Evaluation</h4>
        <div class="last-evaluation-info">
          <div class="last-evaluation-time">
            {formatDate(props.stats.lastEvaluation)}
          </div>
          <Show when={props.stats.lastEvaluation}>
            <div class="last-evaluation-status">
              <span class="status-indicator">
                {getStatusIcon('passed')} Active
              </span>
            </div>
          </Show>
        </div>
      </div>

      <div class="stats-summary">
        <div class="summary-item">
          <span class="summary-label">Success Rate:</span>
          <span class="summary-value">
            {props.stats.totalEvaluations > 0 
              ? formatPercentage((props.stats.passedEvaluations / props.stats.totalEvaluations) * 100)
              : 'N/A'
            }
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Gate Coverage:</span>
          <span class="summary-value">
            {props.stats.totalGates > 0 
              ? formatPercentage((props.stats.enabledGates / props.stats.totalGates) * 100)
              : 'N/A'
            }
          </span>
        </div>
      </div>
    </div>
  );
};
