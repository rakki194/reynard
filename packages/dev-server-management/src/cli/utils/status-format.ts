/**
 * 🦊 Dev Server Management CLI Status Formatting Utilities
 * 
 * Status and health-related formatting functions for CLI output.
 */

import chalk from 'chalk';

// ============================================================================
// Status Formatting
// ============================================================================

export function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
    case 'active':
    case 'healthy':
      return chalk.green('✅ Running');
    case 'starting':
    case 'pending':
      return chalk.yellow('🟡 Starting');
    case 'stopping':
      return chalk.yellow('🟡 Stopping');
    case 'stopped':
    case 'inactive':
      return chalk.gray('⚫ Stopped');
    case 'error':
    case 'failed':
    case 'unhealthy':
      return chalk.red('❌ Error');
    case 'warning':
      return chalk.yellow('⚠️ Warning');
    default:
      return chalk.gray(`❓ ${status}`);
  }
}

export function formatHealth(health: string): string {
  switch (health.toLowerCase()) {
    case 'healthy':
      return chalk.green('💚 Healthy');
    case 'degraded':
      return chalk.yellow('💛 Degraded');
    case 'unhealthy':
      return chalk.red('❤️ Unhealthy');
    case 'unknown':
      return chalk.gray('❓ Unknown');
    default:
      return chalk.gray(`❓ ${health}`);
  }
}

// ============================================================================
// Port Formatting
// ============================================================================

export function formatPort(port: number): string {
  // Color code based on port ranges
  if (port >= 3000 && port < 4000) {
    return chalk.blue(port.toString()); // Development ports
  } else if (port >= 8000 && port < 9000) {
    return chalk.red(port.toString()); // Backend ports
  } else if (port >= 80 && port < 100) {
    return chalk.green(port.toString()); // Standard HTTP ports
  } else {
    return chalk.yellow(port.toString()); // Other ports
  }
}

// ============================================================================
// Error Formatting
// ============================================================================

export function formatError(error: Error | string): string {
  const message = error instanceof Error ? error.message : error;

  // Truncate long error messages
  if (message.length > 100) {
    return chalk.red(`${message.substring(0, 97)}...`);
  }

  return chalk.red(message);
}

export function formatErrorStack(error: Error): string {
  if (!error.stack) {
    return formatError(error);
  }

  const lines = error.stack.split('\n');
  const firstLine = lines[0];
  const stackLines = lines.slice(1).map(line => chalk.gray(line));

  return [chalk.red(firstLine), ...stackLines].join('\n');
}

// ============================================================================
// Category Formatting
// ============================================================================

export function formatCategory(category: string): string {
  switch (category.toLowerCase()) {
    case 'package':
      return chalk.blue('📦 Package');
    case 'example':
      return chalk.green('📚 Example');
    case 'backend':
      return chalk.red('🔧 Backend');
    case 'e2e':
      return chalk.magenta('🧪 E2E');
    case 'template':
      return chalk.cyan('📋 Template');
    default:
      return chalk.gray('❓ Unknown');
  }
}

// ============================================================================
// Boolean Formatting
// ============================================================================

export function formatBoolean(value: boolean, trueText: string = '✅', falseText: string = '❌'): string {
  return value ? chalk.green(trueText) : chalk.red(falseText);
}

export function formatEnabled(value: boolean): string {
  return formatBoolean(value, 'Enabled', 'Disabled');
}

export function formatAutoReload(value: boolean): string {
  return formatBoolean(value, '✅', '❌');
}

export function formatHotReload(value: boolean): string {
  return formatBoolean(value, '✅', '❌');
}
