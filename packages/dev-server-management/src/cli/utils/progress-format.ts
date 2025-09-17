/**
 * 🦊 Dev Server Management CLI Progress Formatting Utilities
 * 
 * Progress bar and list formatting functions for CLI output.
 */

import chalk from 'chalk';

// ============================================================================
// Progress Bar Formatting
// ============================================================================

export function formatProgress(current: number, total: number): string {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const barLength = 20;
  const filledLength = Math.round((percentage / 100) * barLength);

  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  const percentageText = `${percentage.toFixed(1)}%`;

  return `${bar} ${percentageText} (${current}/${total})`;
}

export function formatProgressBar(current: number, total: number, width: number = 30): string {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const filledLength = Math.round((percentage / 100) * width);

  const bar = '█'.repeat(filledLength) + '░'.repeat(width - filledLength);
  const percentageText = `${percentage.toFixed(1)}%`;

  return `[${bar}] ${percentageText}`;
}

export function formatProgressWithColor(current: number, total: number, width: number = 30): string {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const filledLength = Math.round((percentage / 100) * width);

  const bar = '█'.repeat(filledLength) + '░'.repeat(width - filledLength);
  const percentageText = `${percentage.toFixed(1)}%`;

  // Color code based on progress
  let coloredBar: string;
  if (percentage >= 100) {
    coloredBar = chalk.green(bar);
  } else if (percentage >= 75) {
    coloredBar = chalk.blue(bar);
  } else if (percentage >= 50) {
    coloredBar = chalk.yellow(bar);
  } else {
    coloredBar = chalk.red(bar);
  }

  return `[${coloredBar}] ${percentageText}`;
}

// ============================================================================
// List Formatting
// ============================================================================

export function formatList(items: string[], maxItems: number = 10): string {
  if (items.length === 0) {
    return chalk.gray('(empty)');
  }

  if (items.length <= maxItems) {
    return items.map(item => `  • ${item}`).join('\n');
  }

  const visibleItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return [
    ...visibleItems.map(item => `  • ${item}`),
    `  ... and ${remainingCount} more`
  ].join('\n');
}

export function formatNumberedList(items: string[], maxItems: number = 10): string {
  if (items.length === 0) {
    return chalk.gray('(empty)');
  }

  if (items.length <= maxItems) {
    return items.map((item, index) => `  ${index + 1}. ${item}`).join('\n');
  }

  const visibleItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return [
    ...visibleItems.map((item, index) => `  ${index + 1}. ${item}`),
    `  ... and ${remainingCount} more`
  ].join('\n');
}

// ============================================================================
// JSON Formatting
// ============================================================================

export function formatJSON(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    return chalk.red('Invalid JSON object');
  }
}

export function formatJSONCompact(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return chalk.red('Invalid JSON object');
  }
}

// ============================================================================
// Spinner Formatting
// ============================================================================

export function formatSpinner(text: string, frame: number = 0): string {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const spinner = frames[frame % frames.length];
  return `${spinner} ${text}`;
}

export function formatLoading(text: string, dots: number = 0): string {
  const dotCount = (dots % 4) + 1;
  const dotsStr = '.'.repeat(dotCount);
  return `${text}${dotsStr}`;
}
