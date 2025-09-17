/**
 * 🦊 Reynard Dev Server CLI Time Formatting Utilities
 * 
 * Time-related formatting functions for CLI output.
 */

import chalk from 'chalk';

// ============================================================================
// Duration Formatting
// ============================================================================

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatUptime(milliseconds: number): string {
  const duration = formatDuration(milliseconds);

  // Color code based on uptime
  if (milliseconds < 60000) { // Less than 1 minute
    return chalk.yellow(duration);
  } else if (milliseconds < 3600000) { // Less than 1 hour
    return chalk.green(duration);
  } else if (milliseconds < 86400000) { // Less than 1 day
    return chalk.blue(duration);
  } else {
    return chalk.magenta(duration);
  }
}

// ============================================================================
// Timestamp Formatting
// ============================================================================

export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) { // Less than 1 minute
    return chalk.green(`${Math.floor(diff / 1000)}s ago`);
  } else if (diff < 3600000) { // Less than 1 hour
    return chalk.yellow(`${Math.floor(diff / 60000)}m ago`);
  } else if (diff < 86400000) { // Less than 1 day
    return chalk.blue(`${Math.floor(diff / 3600000)}h ago`);
  } else {
    return chalk.gray(date.toLocaleDateString());
  }
}

export function formatRelativeTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 0) {
    return chalk.blue('in the future');
  }

  if (diff < 60000) { // Less than 1 minute
    return chalk.green('just now');
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return chalk.yellow(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return chalk.blue(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
  } else {
    const days = Math.floor(diff / 86400000);
    return chalk.gray(`${days} day${days !== 1 ? 's' : ''} ago`);
  }
}

// ============================================================================
// Time Range Formatting
// ============================================================================

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const duration = endDate.getTime() - startDate.getTime();

  return `${formatTimestamp(start)} - ${formatTimestamp(end)} (${formatDuration(duration)})`;
}

export function formatElapsedTime(start: Date | string): string {
  const startDate = new Date(start);
  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();

  return formatDuration(elapsed);
}
