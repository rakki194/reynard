/**
 * Progress Tracker Component
 *
 * Displays download progress with detailed statistics and visual indicators.
 */
import { Component, Show } from "solid-js";
import { Card, Icon } from "reynard-components-core";

export interface ProgressTrackerProps {
  progress: number;
  totalFiles?: number;
  downloadedFiles?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  speed?: number;
  eta?: number;
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'paused';
  message?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSecond: number): string => {
  return formatBytes(bytesPerSecond) + '/s';
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'success';
    case 'error': return 'error';
    case 'downloading': return 'primary';
    case 'paused': return 'warning';
    default: return 'muted';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'completed': return 'CheckCircle';
    case 'error': return 'AlertCircle';
    case 'downloading': return 'Clock';
    case 'paused': return 'Pause';
    default: return 'Circle';
  }
};

export const ProgressTracker: Component<ProgressTrackerProps> = (props) => {
  const statusColor = () => getStatusColor(props.status);
  const statusIcon = () => getStatusIcon(props.status);

  return (
    <Card class="progress-tracker">
      <div class="progress-header">
        <div class="progress-title">
          <Icon name={statusIcon()} class={`status-icon ${statusColor()}`} />
          <span class="status-text">
            {props.status === 'downloading' ? 'Downloading...' :
             props.status === 'completed' ? 'Completed' :
             props.status === 'error' ? 'Error' :
             props.status === 'paused' ? 'Paused' :
             'Ready'}
          </span>
        </div>
        
        <Show when={props.message}>
          <div class="progress-message">
            <span>{props.message}</span>
          </div>
        </Show>
      </div>

      <div class="progress-content">
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style={{ width: `${Math.min(100, Math.max(0, props.progress))}%` }}
            />
          </div>
          <span class="progress-percentage">{Math.round(props.progress)}%</span>
        </div>

        <div class="progress-stats">
          <div class="stat-group">
            <div class="stat-item">
              <span class="stat-label">Files:</span>
              <span class="stat-value">
                {props.downloadedFiles || 0} / {props.totalFiles || 0}
              </span>
            </div>
            
            <div class="stat-item">
              <span class="stat-label">Size:</span>
              <span class="stat-value">
                {formatBytes(props.downloadedBytes || 0)} / {formatBytes(props.totalBytes || 0)}
              </span>
            </div>
          </div>

          <Show when={props.status === 'downloading'}>
            <div class="stat-group">
              <div class="stat-item">
                <span class="stat-label">Speed:</span>
                <span class="stat-value">{formatSpeed(props.speed || 0)}</span>
              </div>
              
              <div class="stat-item">
                <span class="stat-label">ETA:</span>
                <span class="stat-value">{formatTime(props.eta || 0)}</span>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Card>
  );
};