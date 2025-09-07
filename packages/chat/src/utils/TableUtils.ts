/**
 * Table Utilities for Reynard Chat System
 *
 * Helper functions for table validation and formatting.
 */

import type { StreamingParserState, ParserError } from "../types";

export class TableUtils {
  /**
   * Validate table structure
   */
  static validateTable(state: StreamingParserState, addError: (error: ParserError) => void, addWarning: (warning: string) => void): boolean {
    if (!state.inTable) {
      return true;
    }

    const headerCount = state.tableHeaders.length;
    if (headerCount === 0) {
      addError({
        type: "table_error",
        message: "Table has no headers",
        line: state.currentLine,
        recoverable: true,
      });
      return false;
    }

    // Check if all rows have the same number of cells as headers
    for (let i = 0; i < state.tableRows.length; i++) {
      const row = state.tableRows[i];
      if (row.length !== headerCount) {
        addWarning(`Row ${i + 1} has ${row.length} cells, expected ${headerCount}`);
      }
    }

    return true;
  }

  /**
   * Format table for output
   */
  static formatTable(state: StreamingParserState): string {
    if (!state.inTable) {
      return "";
    }

    let html = "<table>\n";

    // Add headers
    if (state.tableHeaders.length > 0) {
      html += "  <thead>\n    <tr>\n";
      for (const header of state.tableHeaders) {
        const align = header.alignment ? ` style="text-align: ${header.alignment}"` : "";
        html += `      <th${align}>${header.content}</th>\n`;
      }
      html += "    </tr>\n  </thead>\n";
    }

    // Add rows
    if (state.tableRows.length > 0) {
      html += "  <tbody>\n";
      for (const row of state.tableRows) {
        html += "    <tr>\n";
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          const header = state.tableHeaders[i];
          const align = header?.alignment ? ` style="text-align: ${header.alignment}"` : "";
          html += `      <td${align}>${cell.content}</td>\n`;
        }
        html += "    </tr>\n";
      }
      html += "  </tbody>\n";
    }

    html += "</table>";
    return html;
  }
}
