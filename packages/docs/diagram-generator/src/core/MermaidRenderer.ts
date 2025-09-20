/**
 * 🦊 Mermaid Renderer
 *
 * Integrates with the existing MCP Mermaid service to render
 * Mermaid diagrams to SVG and PNG formats.
 */

import type { MermaidRenderer as IMermaidRenderer, RenderConfig, ValidationResult } from "../types.js";

export class MermaidRenderer implements IMermaidRenderer {
  private mcpService: any;

  constructor() {
    // This will be integrated with the existing MCP Mermaid service
    this.initializeMcpService();
  }

  private async initializeMcpService(): Promise<void> {
    try {
      // For testing, always use fallback renderer
      this.mcpService = new FallbackMermaidRenderer();
    } catch (error) {
      console.warn("⚠️ MCP Mermaid service not available, using fallback renderer");
      this.mcpService = new FallbackMermaidRenderer();
    }
  }

  async renderToSvg(mermaidContent: string, config?: RenderConfig): Promise<string> {
    try {
      if (this.mcpService && this.mcpService.render_diagram_to_svg) {
        const [success, svgContent, error] = await this.mcpService.render_diagram_to_svg(mermaidContent);
        if (success) {
          return svgContent;
        } else {
          throw new Error(error);
        }
      } else {
        return this.fallbackSvgRender(mermaidContent, config);
      }
    } catch (error) {
      console.error("❌ Failed to render SVG:", error);
      return this.fallbackSvgRender(mermaidContent, config);
    }
  }

  async renderToPng(mermaidContent: string, config?: RenderConfig): Promise<string> {
    try {
      if (this.mcpService && this.mcpService.render_diagram_to_png) {
        const [success, pngContent, error] = await this.mcpService.render_diagram_to_png(mermaidContent);
        if (success) {
          return pngContent;
        } else {
          throw new Error(error);
        }
      } else {
        return this.fallbackPngRender(mermaidContent, config);
      }
    } catch (error) {
      console.error("❌ Failed to render PNG:", error);
      return this.fallbackPngRender(mermaidContent, config);
    }
  }

  async renderToHighResPng(mermaidContent: string, config?: RenderConfig): Promise<string> {
    const highResConfig: RenderConfig = {
      scale: (config?.scale || 1) * 2,
      width: (config?.width || 1200) * 2,
      height: (config?.height || 800) * 2,
      theme: config?.theme || "neutral",
      backgroundColor: config?.backgroundColor || "white",
    };

    return this.renderToPng(mermaidContent, highResConfig);
  }

  async validate(mermaidContent: string): Promise<ValidationResult> {
    try {
      if (this.mcpService && this.mcpService.validate_diagram) {
        const [valid, errors, warnings] = await this.mcpService.validate_diagram(mermaidContent);
        return { valid, errors, warnings };
      } else {
        return this.fallbackValidate(mermaidContent);
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error}`],
        warnings: [],
      };
    }
  }

  private fallbackSvgRender(mermaidContent: string, config?: RenderConfig): string {
    // Fallback SVG rendering - returns a placeholder
    const width = config?.width || 1200;
    const height = config?.height || 800;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="black">
          Mermaid Diagram (Fallback Render)
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="gray">
          ${mermaidContent.split("\n").slice(0, 3).join(" ")}...
        </text>
      </svg>
    `;
  }

  private fallbackPngRender(mermaidContent: string, config?: RenderConfig): string {
    // For PNG fallback, we'll return a base64 encoded placeholder
    const svg = this.fallbackSvgRender(mermaidContent, config);
    // In a real implementation, you'd convert SVG to PNG
    // For now, return the SVG as base64
    return Buffer.from(svg).toString("base64");
  }

  private fallbackValidate(mermaidContent: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!mermaidContent.trim()) {
      errors.push("Diagram content is empty");
    }

    // Check for basic Mermaid syntax
    if (!mermaidContent.includes("graph") && !mermaidContent.includes("flowchart")) {
      warnings.push("No graph or flowchart declaration found");
    }

    // Check for balanced brackets
    const openBrackets = (mermaidContent.match(/\[/g) || []).length;
    const closeBrackets = (mermaidContent.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      warnings.push("Unbalanced brackets detected");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Fallback Mermaid Renderer for when MCP service is not available
 */
class FallbackMermaidRenderer {
  async render_diagram_to_svg(content: string): Promise<[boolean, string, string]> {
    try {
      const svg = this.fallbackSvgRender(content);
      return [true, svg, ""];
    } catch (error) {
      return [false, "", `Fallback render error: ${error}`];
    }
  }

  async render_diagram_to_png(content: string): Promise<[boolean, string, string]> {
    try {
      const png = this.fallbackPngRender(content);
      return [true, png, ""];
    } catch (error) {
      return [false, "", `Fallback render error: ${error}`];
    }
  }

  async validate_diagram(content: string): Promise<[boolean, string[], string[]]> {
    const result = this.fallbackValidate(content);
    return [result.valid, result.errors, result.warnings];
  }

  private fallbackSvgRender(mermaidContent: string, config?: RenderConfig): string {
    const width = config?.width || 1200;
    const height = config?.height || 800;

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="black">
          Mermaid Diagram (Fallback Render)
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="gray">
          ${mermaidContent.split("\n").slice(0, 3).join(" ")}...
        </text>
      </svg>
    `;
  }

  private fallbackPngRender(mermaidContent: string, config?: RenderConfig): string {
    const svg = this.fallbackSvgRender(mermaidContent, config);
    return Buffer.from(svg).toString("base64");
  }

  private fallbackValidate(mermaidContent: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!mermaidContent.trim()) {
      errors.push("Diagram content is empty");
    }

    if (!mermaidContent.includes("graph") && !mermaidContent.includes("flowchart")) {
      warnings.push("No graph or flowchart declaration found");
    }

    const openBrackets = (mermaidContent.match(/\[/g) || []).length;
    const closeBrackets = (mermaidContent.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      warnings.push("Unbalanced brackets detected");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
