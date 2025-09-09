/**
 * Table Parser for Reynard Chat System
 *
 * This module handles markdown table parsing with support for alignment,
 * headers, and complex table structures.
 */

import { BaseMarkdownParser } from "./BaseMarkdownParser";
import { MARKDOWN_PATTERNS } from "./patterns";
import { matches, parseTableCells, parseTableAlignment } from "./parsing-utils";
import { TableUtils } from "./TableUtils";
import type { ParseResult } from "../types";

export class TableParser extends BaseMarkdownParser {
  /**
   * Parse a single line for table elements
   */
  parseLine(line: string): boolean {
    this.incrementLine();

    // Handle empty lines - they break tables
    if (line.trim() === "") {
      if (this.state.inTable) {
        this.flushCurrentNode();
      }
      return false;
    }

    // Handle table rows
    if (this.handleTableRow(line)) {
      return true;
    }

    // Handle table separators
    if (this.handleTableSeparator(line)) {
      return true;
    }

    // If we're in a table and this line doesn't match table patterns, end the table
    if (this.state.inTable) {
      this.flushCurrentNode();
    }

    return false;
  }

  /**
   * Finalize parsing and return result
   */
  finalize(): ParseResult {
    if (this.state.inTable) {
      this.flushCurrentNode();
    }

    return {
      html: "",
      nodes: this.state.nodes,
      isComplete: true,
      hasThinking: false,
      thinking: [],
      errors: this.state.errors,
      warnings: this.state.warnings,
      duration: this.getDuration(),
      stats: {
        totalNodes: this.state.nodes.length,
        processedChars: 0,
        parsingTime: this.getDuration(),
        lineCount: this.state.currentLine,
      },
    };
  }

  /**
   * Handle table rows
   */
  private handleTableRow(line: string): boolean {
    const match = matches(line, MARKDOWN_PATTERNS.tableRow);
    if (!match) {
      return false;
    }

    const cells = parseTableCells(match[1]);

    if (!this.state.inTable) {
      // Start a new table
      this.state.inTable = true;
      this.state.tableHeaders = cells;
      this.state.tableRows = [];
    } else {
      // Add row to existing table
      this.state.tableRows.push(cells);
    }

    return true;
  }

  /**
   * Handle table separators
   */
  private handleTableSeparator(line: string): boolean {
    const match = matches(line, MARKDOWN_PATTERNS.tableSeparator);
    if (!match) {
      return false;
    }

    // Parse alignment from separator
    const alignment = parseTableAlignment(match[1]);

    // If we have headers, apply alignment
    if (this.state.tableHeaders.length > 0) {
      this.state.tableHeaders = this.state.tableHeaders.map(
        (header, index) => ({
          ...header,
          alignment: alignment[index] || "left",
        }),
      );
    }

    return true;
  }

  /**
   * Flush the current table
   */
  protected flushCurrentNode(): void {
    if (this.state.inTable) {
      this.addNode(
        this.createNode({
          type: "table",
          content: "",
          headers: this.state.tableHeaders,
          rows: this.state.tableRows,
          line: this.state.currentLine,
        }),
      );

      this.state.inTable = false;
      this.state.tableHeaders = [];
      this.state.tableRows = [];
    }
  }

  /**
   * Validate table structure
   */
  private validateTable(): boolean {
    return TableUtils.validateTable(
      this.state,
      this.addError.bind(this),
      this.addWarning.bind(this),
    );
  }

  /**
   * Format table for output
   */
  private formatTable(): string {
    return TableUtils.formatTable(this.state);
  }
}
