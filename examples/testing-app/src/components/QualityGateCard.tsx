/**
 * Quality Gate Card Component
 * 
 * 🦊 *whiskers twitch with card precision* Displays a quality gate
 * with its key information and action buttons.
 */

import { Component, For } from 'solid-js';
import type { QualityGate } from '../types/quality-gates';

interface QualityGateCardProps {
  gate: QualityGate;
  onEdit: () => void;
  onDelete: () => void;
  environmentColor: string;
}

export const QualityGateCard: Component<QualityGateCardProps> = (props) => {
  const getStatusIcon = (enabled: boolean, isDefault: boolean) => {
    if (!enabled) return '⏸️';
    if (isDefault) return '⭐';
    return '✅';
  };

  const getStatusText = (enabled: boolean, isDefault: boolean) => {
    if (!enabled) return 'Disabled';
    if (isDefault) return 'Default';
    return 'Enabled';
  };

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'GT': return '>';
      case 'LT': return '<';
      case 'EQ': return '=';
      case 'NE': return '≠';
      case 'GTE': return '≥';
      case 'LTE': return '≤';
      default: return operator;
    }
  };

  return (
    <div class="quality-gate-card">
      <div class="card-header">
        <div class="gate-info">
          <h3 class="gate-name">{props.gate.name}</h3>
          <div class="gate-meta">
            <span class="gate-id">ID: {props.gate.gateId}</span>
            <span 
              class="environment-badge"
              style={{ 'background-color': props.environmentColor }}
            >
              {props.gate.environment}
            </span>
          </div>
        </div>
        <div class="gate-status">
          <span class={`status-indicator ${props.gate.enabled ? 'enabled' : 'disabled'}`}>
            {getStatusIcon(props.gate.enabled, props.gate.isDefault)}
            {getStatusText(props.gate.enabled, props.gate.isDefault)}
          </span>
        </div>
      </div>

      <div class="card-content">
        <Show when={props.gate.description}>
          <p class="gate-description">{props.gate.description}</p>
        </Show>

        <div class="conditions-section">
          <h4>Conditions ({props.gate.conditions.length})</h4>
          <div class="conditions-list">
            <For each={props.gate.conditions.slice(0, 3)}>
              {(condition) => (
                <div class="condition-item">
                  <span class="condition-metric">{condition.metric}</span>
                  <span class="condition-operator">
                    {getOperatorSymbol(condition.operator)}
                  </span>
                  <span class="condition-threshold">{condition.threshold}</span>
                  <Show when={!condition.enabled}>
                    <span class="condition-disabled">⏸️</span>
                  </Show>
                </div>
              )}
            </For>
            <Show when={props.gate.conditions.length > 3}>
              <div class="more-conditions">
                +{props.gate.conditions.length - 3} more conditions
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="gate-timestamps">
          <span class="created-at">
            Created: {new Date(props.gate.createdAt).toLocaleDateString()}
          </span>
          <span class="updated-at">
            Updated: {new Date(props.gate.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div class="card-actions">
          <button 
            class="action-button edit"
            onClick={props.onEdit}
            title="Edit quality gate"
          >
            ✏️ Edit
          </button>
          <button 
            class="action-button delete"
            onClick={props.onDelete}
            title="Delete quality gate"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};
