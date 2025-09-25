/**
 * 🦊 Reynard VS Code Status Bar
 * ==============================
 *
 * Status bar integration for the Reynard linting system.
 */

import * as vscode from "vscode";

export type StatusType = "active" | "inactive" | "working" | "error";

/**
 * VS Code status bar for linting
 */
export class LintingStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private currentStatus: StatusType = "inactive";

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = "reynard-linting.toggle";
    this.statusBarItem.show();
  }

  /**
   * Update status bar
   */
  updateStatus(status: StatusType, message: string): void {
    this.currentStatus = status;

    const icon = this.getStatusIcon(status);
    const color = this.getStatusColor(status);

    this.statusBarItem.text = `${icon} ${message}`;
    this.statusBarItem.color = color;
    this.statusBarItem.tooltip = this.getStatusTooltip(status, message);
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: StatusType): string {
    switch (status) {
      case "active":
        return "🦊";
      case "inactive":
        return "⏸️";
      case "working":
        return "⚙️";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: StatusType): string | undefined {
    switch (status) {
      case "active":
        return undefined; // Default color
      case "inactive":
        return "gray";
      case "working":
        return "orange";
      case "error":
        return "red";
      default:
        return undefined;
    }
  }

  /**
   * Get status tooltip
   */
  private getStatusTooltip(status: StatusType, message: string): string {
    const baseTooltip = "Reynard Incremental Linting";

    switch (status) {
      case "active":
        return `${baseTooltip} - Active\nClick to stop`;
      case "inactive":
        return `${baseTooltip} - Inactive\nClick to start`;
      case "working":
        return `${baseTooltip} - Working\n${message}`;
      case "error":
        return `${baseTooltip} - Error\n${message}`;
      default:
        return baseTooltip;
    }
  }

  /**
   * Get current status
   */
  getCurrentStatus(): StatusType {
    return this.currentStatus;
  }

  /**
   * Dispose the status bar
   */
  dispose(): void {
    this.statusBarItem.dispose();
  }
}
