/**
 * Thinking Section Validation Utilities
 *
 * Contains validation and formatting functions for thinking sections
 */

export class ThinkingValidation {
  /**
   * Validate thinking section structure
   */
  public static validateThinkingSections(
    inThinking: boolean,
    thinkingSections: string[],
    addWarning: (message: string) => void,
  ): boolean {
    if (inThinking) {
      addWarning("Unclosed thinking section detected");
      return false;
    }

    // Check for empty thinking sections
    for (let i = 0; i < thinkingSections.length; i++) {
      const section = thinkingSections[i];
      if (!section.trim()) {
        addWarning(`Empty thinking section at index ${i}`);
      }
    }

    return true;
  }

  /**
   * Format thinking sections for output
   */
  public static formatThinkingSections(thinkingSections: string[]): string {
    if (thinkingSections.length === 0) {
      return "";
    }

    let html = '<div class="thinking-sections">\n';

    for (const section of thinkingSections) {
      html += '  <div class="thinking-section">\n';
      html += `    <div class="thinking-content">${section}</div>\n`;
      html += "  </div>\n";
    }

    html += "</div>";
    return html;
  }
}
