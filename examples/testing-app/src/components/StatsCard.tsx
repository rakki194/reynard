/**
 * Stats Card Component
 * 
 * 🦊 *whiskers twitch with data visualization cunning* Displays key statistics
 * in an attractive card format with trend indicators.
 */

import { Component, Show } from 'solid-js';
import type { DashboardStats } from '../types/testing';

interface StatsCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  icon?: string;
  color?: string;
  description?: string;
}

const StatsCard: Component<StatsCardProps> = (props) => {
  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (value < 1 && value > 0) {
      return value.toFixed(2);
    } else {
      return value.toFixed(0);
    }
  };

  const getTrendColor = (trend?: number) => {
    if (trend === undefined) return 'var(--color-secondary)';
    if (trend > 0) return 'var(--color-success)';
    if (trend < 0) return 'var(--color-error)';
    return 'var(--color-secondary)';
  };

  const getTrendIcon = (trend?: number) => {
    if (trend === undefined) return '➖';
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➖';
  };

  return (
    <div class="stats-card" style={{ '--card-color': props.color || 'var(--color-primary)' }}>
      <div class="stats-header">
        <div class="stats-title">
          <Show when={props.icon}>
            <span class="stats-icon">{props.icon}</span>
          </Show>
          <span class="stats-title-text">{props.title}</span>
        </div>
        <Show when={props.trend !== undefined}>
          <div 
            class="stats-trend"
            style={{ color: getTrendColor(props.trend) }}
          >
            <span class="trend-icon">{getTrendIcon(props.trend)}</span>
            <span class="trend-value">{Math.abs(props.trend || 0).toFixed(1)}%</span>
          </div>
        </Show>
      </div>

      <div class="stats-content">
        <div class="stats-value">
          <span class="value-number">{formatValue(props.value)}</span>
          <Show when={props.unit}>
            <span class="value-unit">{props.unit}</span>
          </Show>
        </div>
        
        <Show when={props.description}>
          <div class="stats-description">
            {props.description}
          </div>
        </Show>
      </div>
    </div>
  );
};

export default StatsCard;
