/**
 * 🦊 Dev Server Management CLI Size Formatting Utilities
 * 
 * Size and memory-related formatting functions for CLI output.
 */

import chalk from 'chalk';

// ============================================================================
// Byte Formatting
// ============================================================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = (bytes / Math.pow(k, i)).toFixed(1);
  return `${size} ${sizes[i]}`;
}

export function formatMemoryUsage(bytes: number): string {
  const formatted = formatBytes(bytes);

  // Color code based on memory usage
  if (bytes < 1024 * 1024) { // Less than 1MB
    return chalk.green(formatted);
  } else if (bytes < 1024 * 1024 * 100) { // Less than 100MB
    return chalk.yellow(formatted);
  } else {
    return chalk.red(formatted);
  }
}

export function formatDiskUsage(bytes: number): string {
  const formatted = formatBytes(bytes);

  // Color code based on disk usage
  if (bytes < 1024 * 1024 * 1024) { // Less than 1GB
    return chalk.green(formatted);
  } else if (bytes < 1024 * 1024 * 1024 * 10) { // Less than 10GB
    return chalk.yellow(formatted);
  } else {
    return chalk.red(formatted);
  }
}

// ============================================================================
// Number Formatting
// ============================================================================

export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';

  const percentage = (value / total) * 100;
  const formatted = `${percentage.toFixed(1)}%`;

  // Color code based on percentage
  if (percentage >= 90) {
    return chalk.red(formatted);
  } else if (percentage >= 70) {
    return chalk.yellow(formatted);
  } else {
    return chalk.green(formatted);
  }
}

// ============================================================================
// Rate Formatting
// ============================================================================

export function formatRate(bytes: number, durationMs: number): string {
  if (durationMs === 0) return '0 B/s';

  const rate = bytes / (durationMs / 1000);
  return `${formatBytes(rate)}/s`;
}

export function formatThroughput(operations: number, durationMs: number): string {
  if (durationMs === 0) return '0 ops/s';

  const rate = operations / (durationMs / 1000);
  return `${formatNumber(rate)} ops/s`;
}

// ============================================================================
// Capacity Formatting
// ============================================================================

export function formatCapacity(used: number, total: number): string {
  const usedFormatted = formatBytes(used);
  const totalFormatted = formatBytes(total);
  const percentage = formatPercentage(used, total);

  return `${usedFormatted} / ${totalFormatted} (${percentage})`;
}

export function formatCapacityBar(used: number, total: number, width: number = 20): string {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const filledLength = Math.round((percentage / 100) * width);

  const bar = '█'.repeat(filledLength) + '░'.repeat(width - filledLength);
  const percentageText = `${percentage.toFixed(1)}%`;

  return `[${bar}] ${percentageText}`;
}