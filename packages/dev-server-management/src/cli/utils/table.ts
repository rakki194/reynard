/**
 * 🦊 Reynard Dev Server CLI Table Utilities
 * 
 * Rich terminal table formatting for CLI output.
 */

import chalk from 'chalk';
import type { ServerInfo, HealthStatus, ProjectConfig } from '../../types/index.js';
import { formatStatus, formatHealth, formatCategory } from './status-format.js';
import { formatUptime } from './time-format.js';

// ============================================================================
// Table Column Definition
// ============================================================================

export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: T) => string;
}

// ============================================================================
// Generic Table Creator
// ============================================================================

export function createTable<T>(data: T[], columns: TableColumn<T>[]): string {
  if (data.length === 0) {
    return chalk.yellow('No data available');
  }

  // Calculate column widths
  const widths = columns.map(col => {
    const headerWidth = col.header.length;
    const contentWidth = Math.max(
      ...data.map(row => {
        const value = col.formatter 
          ? col.formatter(row[col.key], row)
          : String(row[col.key] || '');
        return value.length;
      })
    );
    return Math.max(headerWidth, contentWidth, col.width || 0);
  });

  // Create header
  const header = columns
    .map((col, index) => {
      const headerText = col.header.padEnd(widths[index]);
      return chalk.blue.bold(headerText);
    })
    .join(' │ ');

  // Create separator
  const separator = widths
    .map(width => '─'.repeat(width))
    .join('─┼─');

  // Create rows
  const rows = data.map(row => {
    return columns
      .map((col, index) => {
        const value = col.formatter 
          ? col.formatter(row[col.key], row)
          : String(row[col.key] || '');
        
        const alignedValue = alignText(value, widths[index], col.align || 'left');
        return alignedValue;
      })
      .join(' │ ');
  });

  return [header, separator, ...rows].join('\n');
}

// ============================================================================
// Server Status Table
// ============================================================================

export function createStatusTable(servers: ServerInfo[]): string {
  const columns: TableColumn<ServerInfo>[] = [
    {
      key: 'name',
      header: 'Project',
      formatter: (value) => chalk.cyan(value),
    },
    {
      key: 'status',
      header: 'Status',
      formatter: (value) => formatStatus(value),
    },
    {
      key: 'health',
      header: 'Health',
      formatter: (value) => formatHealth(value),
    },
    {
      key: 'port',
      header: 'Port',
      formatter: (value) => chalk.yellow(value.toString()),
    },
    {
      key: 'pid',
      header: 'PID',
      formatter: (value) => value ? chalk.gray(value.toString()) : chalk.gray('N/A'),
    },
    {
      key: 'startTime',
      header: 'Uptime',
      formatter: (value, row) => {
        if (!value) return chalk.gray('N/A');
        const uptime = Date.now() - new Date(value).getTime();
        return formatUptime(uptime);
      },
    },
  ];

  return createTable(servers, columns);
}

// ============================================================================
// Health Status Table
// ============================================================================

export function createHealthTable(healthStatuses: HealthStatus[]): string {
  const columns: TableColumn<HealthStatus>[] = [
    {
      key: 'project',
      header: 'Project',
      formatter: (value) => chalk.cyan(value),
    },
    {
      key: 'health',
      header: 'Health',
      formatter: (value) => formatHealth(value),
    },
    {
      key: 'lastCheck',
      header: 'Last Check',
      formatter: (value) => {
        const now = Date.now();
        const checkTime = new Date(value).getTime();
        const diff = now - checkTime;
        
        if (diff < 60000) { // Less than 1 minute
          return chalk.green(`${Math.floor(diff / 1000)}s ago`);
        } else if (diff < 3600000) { // Less than 1 hour
          return chalk.yellow(`${Math.floor(diff / 60000)}m ago`);
        } else {
          return chalk.red(`${Math.floor(diff / 3600000)}h ago`);
        }
      },
    },
    {
      key: 'checkDuration',
      header: 'Duration',
      formatter: (value) => {
        if (value < 1000) {
          return chalk.green(`${value}ms`);
        } else if (value < 5000) {
          return chalk.yellow(`${(value / 1000).toFixed(1)}s`);
        } else {
          return chalk.red(`${(value / 1000).toFixed(1)}s`);
        }
      },
    },
    {
      key: 'responseTime',
      header: 'Response',
      formatter: (value) => {
        if (!value) return chalk.gray('N/A');
        if (value < 100) {
          return chalk.green(`${value}ms`);
        } else if (value < 1000) {
          return chalk.yellow(`${value}ms`);
        } else {
          return chalk.red(`${value}ms`);
        }
      },
    },
    {
      key: 'error',
      header: 'Error',
      formatter: (value) => value ? chalk.red(value) : chalk.gray('None'),
    },
  ];

  return createTable(healthStatuses, columns);
}

// ============================================================================
// Project List Table
// ============================================================================

export function createProjectTable(projects: ProjectConfig[]): string {
  const columns: TableColumn<ProjectConfig>[] = [
    {
      key: 'name',
      header: 'Project',
      formatter: (value) => chalk.cyan(value),
    },
    {
      key: 'port',
      header: 'Port',
      formatter: (value) => chalk.yellow(value.toString()),
    },
    {
      key: 'category',
      header: 'Category',
      formatter: (value) => formatCategory(value),
    },
    {
      key: 'description',
      header: 'Description',
      formatter: (value) => value || chalk.gray('No description'),
    },
    {
      key: 'autoReload',
      header: 'Auto Reload',
      formatter: (value) => value ? chalk.green('✅') : chalk.red('❌'),
    },
    {
      key: 'hotReload',
      header: 'Hot Reload',
      formatter: (value) => value ? chalk.green('✅') : chalk.red('❌'),
    },
  ];

  return createTable(projects, columns);
}


function alignText(text: string, width: number, align: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'left':
      return text.padEnd(width);
    case 'center':
      return text.padStart((width + text.length) / 2).padEnd(width);
    case 'right':
      return text.padStart(width);
    default:
      return text.padEnd(width);
  }
}

// ============================================================================
// Summary Functions
// ============================================================================

export function createSummary(servers: ServerInfo[]): string {
  const running = servers.filter(s => s.status === 'running').length;
  const total = servers.length;
  const healthy = servers.filter(s => s.health === 'healthy').length;
  
  const summary = [
    chalk.blue('🦊 Reynard Dev Server Summary'),
    '',
    `Total Projects: ${chalk.yellow(total)}`,
    `Running: ${chalk.green(running)}`,
    `Healthy: ${chalk.green(healthy)}`,
    `Unhealthy: ${chalk.red(servers.filter(s => s.health === 'unhealthy').length)}`,
  ];
  
  return summary.join('\n');
}

export function createHealthSummary(healthStatuses: HealthStatus[]): string {
  const total = healthStatuses.length;
  const healthy = healthStatuses.filter(h => h.health === 'healthy').length;
  const unhealthy = healthStatuses.filter(h => h.health === 'unhealthy').length;
  const unknown = healthStatuses.filter(h => h.health === 'unknown').length;
  
  const summary = [
    chalk.blue('🦊 Health Status Summary'),
    '',
    `Total: ${chalk.yellow(total)}`,
    `Healthy: ${chalk.green(healthy)}`,
    `Unhealthy: ${chalk.red(unhealthy)}`,
    `Unknown: ${chalk.gray(unknown)}`,
  ];
  
  return summary.join('\n');
}
