/**
 * Test Run Card Component
 * 
 * 🦦 *splashes with component enthusiasm* Displays individual test run
 * information in a beautiful, structured card format.
 */

import { Component, Show } from 'solid-js';
import type { TestRun } from '../types/testing';

interface TestRunCardProps {
  testRun: TestRun;
  onClick?: () => void;
  showDetails?: boolean;
}

const TestRunCard: Component<TestRunCardProps> = (props) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--color-success)';
      case 'failed': return 'var(--color-error)';
      case 'running': return 'var(--color-info)';
      case 'cancelled': return 'var(--color-warning)';
      default: return 'var(--color-secondary)';
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'pytest': return '🐍';
      case 'vitest': return '⚡';
      case 'e2e': return '🎭';
      case 'benchmark': return '📊';
      case 'performance': return '⚡';
      case 'coverage': return '📈';
      case 'tracing': return '🔍';
      default: return '🧪';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div 
      class="test-run-card"
      onClick={props.onClick}
      style={{ cursor: props.onClick ? 'pointer' : 'default' }}
    >
      <div class="test-run-header">
        <div class="test-type">
          <span class="test-type-icon">{getTestTypeIcon(props.testRun.test_type)}</span>
          <span class="test-type-name">{props.testRun.test_type}</span>
        </div>
        <div 
          class="test-status"
          style={{ 'background-color': getStatusColor(props.testRun.status) }}
        >
          {props.testRun.status}
        </div>
      </div>

      <div class="test-run-content">
        <h3 class="test-suite">{props.testRun.test_suite}</h3>
        <p class="test-run-id">Run ID: {props.testRun.run_id}</p>
        
        <div class="test-stats">
          <div class="stat">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{props.testRun.total_tests}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Passed:</span>
            <span class="stat-value success">{props.testRun.passed_tests}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Failed:</span>
            <span class="stat-value error">{props.testRun.failed_tests}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Skipped:</span>
            <span class="stat-value warning">{props.testRun.skipped_tests}</span>
          </div>
        </div>

        <Show when={props.testRun.success_rate !== null}>
          <div class="success-rate">
            <span class="success-rate-label">Success Rate:</span>
            <span 
              class="success-rate-value"
              style={{ 
                color: (props.testRun.success_rate || 0) >= 80 ? 'var(--color-success)' : 
                       (props.testRun.success_rate || 0) >= 60 ? 'var(--color-warning)' : 'var(--color-error)'
              }}
            >
              {(props.testRun.success_rate || 0).toFixed(1)}%
            </span>
          </div>
        </Show>

        <div class="test-meta">
          <div class="meta-item">
            <span class="meta-label">Environment:</span>
            <span class="meta-value">{props.testRun.environment}</span>
          </div>
          <Show when={props.testRun.branch}>
            <div class="meta-item">
              <span class="meta-label">Branch:</span>
              <span class="meta-value">{props.testRun.branch}</span>
            </div>
          </Show>
          <div class="meta-item">
            <span class="meta-label">Duration:</span>
            <span class="meta-value">{formatDuration(props.testRun.duration_seconds)}</span>
          </div>
        </div>

        <div class="test-timestamps">
          <div class="timestamp">
            <span class="timestamp-label">Started:</span>
            <span class="timestamp-value">{formatDate(props.testRun.started_at)}</span>
          </div>
          <Show when={props.testRun.completed_at}>
            <div class="timestamp">
              <span class="timestamp-label">Completed:</span>
              <span class="timestamp-value">{formatDate(props.testRun.completed_at!)}</span>
            </div>
          </Show>
        </div>
      </div>

      <Show when={props.showDetails && props.testRun.metadata}>
        <div class="test-metadata">
          <details>
            <summary>Metadata</summary>
            <pre class="metadata-content">
              {JSON.stringify(props.testRun.metadata, null, 2)}
            </pre>
          </details>
        </div>
      </Show>
    </div>
  );
};

export default TestRunCard;
