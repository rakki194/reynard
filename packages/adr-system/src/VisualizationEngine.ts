/**
 * ADR Relationship Visualization Engine
 *
 * This module provides comprehensive visualization capabilities for ADR relationships,
 * including interactive graphs, network diagrams, and relationship maps.
 */

import {
  KnowledgeNode,
  KnowledgeEdge,
  GraphPath,
  GraphMetrics,
} from "./KnowledgeGraph";
import { writeFile } from "fs/promises";
import { join } from "path";

export interface VisualizationConfig {
  width: number;
  height: number;
  theme: "light" | "dark" | "colorful";
  layout: "force" | "hierarchical" | "circular" | "grid";
  nodeSize: "fixed" | "degree" | "importance";
  edgeThickness: "fixed" | "weight" | "type";
  showLabels: boolean;
  showTooltips: boolean;
  animation: boolean;
}

export interface VisualizationOutput {
  format: "svg" | "png" | "html" | "json";
  content: string;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    generatedAt: string;
    version: string;
  };
}

export class ADRVisualizationEngine {
  private config: VisualizationConfig;

  constructor(config: Partial<VisualizationConfig> = {}) {
    this.config = {
      width: 1200,
      height: 800,
      theme: "colorful",
      layout: "force",
      nodeSize: "importance",
      edgeThickness: "weight",
      showLabels: true,
      showTooltips: true,
      animation: true,
      ...config,
    };
  }

  /**
   * Generate interactive HTML visualization
   */
  async generateInteractiveVisualization(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    outputPath: string,
  ): Promise<VisualizationOutput> {
    const html = this.createInteractiveHTML(nodes, edges);

    await writeFile(outputPath, html, "utf-8");

    return {
      format: "html",
      content: html,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  /**
   * Generate SVG visualization
   */
  async generateSVGVisualization(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    outputPath: string,
  ): Promise<VisualizationOutput> {
    const svg = this.createSVG(nodes, edges);

    await writeFile(outputPath, svg, "utf-8");

    return {
      format: "svg",
      content: svg,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  /**
   * Generate Mermaid diagram
   */
  generateMermaidDiagram(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
  ): string {
    let mermaid = "graph TD\n";

    // Add nodes
    for (const node of nodes) {
      const nodeId = this.sanitizeId(node.id);
      const label = this.config.showLabels ? node.label : nodeId;
      const shape = this.getNodeShape(node.type);

      mermaid += `    ${nodeId}${shape}"${label}"\n`;
    }

    // Add edges
    for (const edge of edges) {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      const edgeLabel = this.getEdgeLabel(edge);

      mermaid += `    ${sourceId} -->|"${edgeLabel}"| ${targetId}\n`;
    }

    return mermaid;
  }

  /**
   * Generate relationship matrix
   */
  generateRelationshipMatrix(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
  ): string {
    const matrix: string[][] = [];
    const nodeIds = nodes.map((n) => n.id);

    // Initialize matrix
    matrix.push(["", ...nodeIds]);

    for (const sourceNode of nodes) {
      const row = [sourceNode.label];

      for (const targetNode of nodes) {
        const edge = edges.find(
          (e) => e.source === sourceNode.id && e.target === targetNode.id,
        );
        if (edge) {
          row.push(edge.type);
        } else {
          row.push("");
        }
      }

      matrix.push(row);
    }

    // Convert to markdown table
    let markdown = "| " + matrix[0].join(" | ") + " |\n";
    markdown += "|" + matrix[0].map(() => "---").join("|") + "|\n";

    for (let i = 1; i < matrix.length; i++) {
      markdown += "| " + matrix[i].join(" | ") + " |\n";
    }

    return markdown;
  }

  /**
   * Generate network statistics
   */
  generateNetworkStatistics(metrics: GraphMetrics): string {
    let stats = "# ADR Network Statistics\n\n";

    stats += `## Overview\n`;
    stats += `- **Total Nodes**: ${metrics.totalNodes}\n`;
    stats += `- **Total Edges**: ${metrics.totalEdges}\n`;
    stats += `- **Average Degree**: ${metrics.averageDegree.toFixed(2)}\n`;
    stats += `- **Clustering Coefficient**: ${metrics.clusteringCoefficient.toFixed(3)}\n`;
    stats += `- **Connected Components**: ${metrics.connectedComponents}\n\n`;

    stats += `## Node Types\n`;
    for (const [type, count] of Object.entries(metrics.nodeTypes)) {
      stats += `- **${type}**: ${count}\n`;
    }
    stats += "\n";

    stats += `## Edge Types\n`;
    for (const [type, count] of Object.entries(metrics.edgeTypes)) {
      stats += `- **${type}**: ${count}\n`;
    }

    return stats;
  }

  /**
   * Generate path visualization
   */
  generatePathVisualization(path: GraphPath): string {
    let visualization = `# Path: ${path.nodes[0].label} → ${path.nodes[path.nodes.length - 1].label}\n\n`;

    visualization += `**Length**: ${path.length} steps\n`;
    visualization += `**Weight**: ${path.weight.toFixed(2)}\n\n`;

    visualization += `## Path Details\n\n`;

    for (let i = 0; i < path.nodes.length; i++) {
      const node = path.nodes[i];
      visualization += `${i + 1}. **${node.label}** (${node.type})\n`;

      if (i < path.edges.length) {
        const edge = path.edges[i];
        visualization += `   → *${edge.type}* (weight: ${edge.weight.toFixed(2)})\n`;
      }
    }

    return visualization;
  }

  /**
   * Create interactive HTML visualization
   */
  private createInteractiveHTML(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
  ): string {
    const nodeData = nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      properties: node.properties,
      metadata: node.metadata,
    }));

    const edgeData = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      weight: edge.weight,
      properties: edge.properties,
    }));

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADR Knowledge Graph Visualization</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: ${this.getBackgroundColor()};
            color: ${this.getTextColor()};
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: ${this.getPrimaryColor()};
            margin-bottom: 10px;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .stat {
            background: ${this.getCardBackground()};
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: ${this.getPrimaryColor()};
        }
        
        .stat-label {
            font-size: 14px;
            color: ${this.getSecondaryColor()};
            margin-top: 5px;
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .control-btn {
            background: ${this.getPrimaryColor()};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .control-btn:hover {
            background: ${this.getPrimaryHoverColor()};
        }
        
        .control-btn.active {
            background: ${this.getAccentColor()};
        }
        
        #visualization {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .node {
            cursor: pointer;
            stroke: #fff;
            stroke-width: 2px;
        }
        
        .node:hover {
            stroke-width: 3px;
        }
        
        .link {
            stroke: #999;
            stroke-opacity: 0.6;
            stroke-width: 2px;
        }
        
        .link:hover {
            stroke-opacity: 1;
            stroke-width: 3px;
        }
        
        .tooltip {
            position: absolute;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
        }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
        
        .legend-text {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦊 ADR Knowledge Graph</h1>
            <p>Interactive visualization of Architecture Decision Record relationships</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${nodes.length}</div>
                <div class="stat-label">Nodes</div>
            </div>
            <div class="stat">
                <div class="stat-value">${edges.length}</div>
                <div class="stat-label">Relationships</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.calculateAverageDegree(nodes, edges).toFixed(1)}</div>
                <div class="stat-label">Avg. Degree</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="control-btn active" onclick="setLayout('force')">Force Layout</button>
            <button class="control-btn" onclick="setLayout('hierarchical')">Hierarchical</button>
            <button class="control-btn" onclick="setLayout('circular')">Circular</button>
            <button class="control-btn" onclick="resetZoom()">Reset Zoom</button>
        </div>
        
        <div id="visualization"></div>
        
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #ff6b6b;"></div>
                <div class="legend-text">ADR</div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #4ecdc4;"></div>
                <div class="legend-text">Pattern</div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #45b7d1;"></div>
                <div class="legend-text">Component</div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #96ceb4;"></div>
                <div class="legend-text">Dependency</div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #feca57;"></div>
                <div class="legend-text">Stakeholder</div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff9ff3;"></div>
                <div class="legend-text">Technology</div>
            </div>
        </div>
    </div>
    
    <div class="tooltip" id="tooltip"></div>
    
    <script>
        const nodes = ${JSON.stringify(nodeData)};
        const edges = ${JSON.stringify(edgeData)};
        
        const width = ${this.config.width};
        const height = ${this.config.height};
        
        const svg = d3.select('#visualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svg.append('g');
        
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        
        svg.call(zoom);
        
        const tooltip = d3.select('#tooltip');
        
        const colorScale = d3.scaleOrdinal()
            .domain(['adr', 'pattern', 'component', 'dependency', 'stakeholder', 'technology'])
            .range(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']);
        
        const sizeScale = d3.scaleLinear()
            .domain([1, d3.max(nodes, d => d.properties.importance || 1)])
            .range([8, 30]);
        
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(20));
        
        const link = g.append('g')
            .selectAll('line')
            .data(edges)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', d => Math.sqrt(d.weight * 5));
        
        const node = g.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', d => sizeScale(d.properties.importance || 1))
            .attr('fill', d => colorScale(d.type))
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip);
        
        const label = g.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .text(d => d.label)
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#333');
        
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            
            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        function showTooltip(event, d) {
            tooltip
                .style('opacity', 1)
                .html(\`
                    <strong>\${d.label}</strong><br/>
                    Type: \${d.type}<br/>
                    ID: \${d.id}<br/>
                    \${d.properties.description || ''}
                \`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        }
        
        function hideTooltip() {
            tooltip.style('opacity', 0);
        }
        
        function setLayout(layoutType) {
            // Update active button
            d3.selectAll('.control-btn').classed('active', false);
            d3.select(event.target).classed('active', true);
            
            // Update simulation based on layout type
            if (layoutType === 'hierarchical') {
                simulation
                    .force('x', d3.forceX(d => d.type === 'adr' ? width * 0.2 : width * 0.8))
                    .force('y', d3.forceY(height / 2));
            } else if (layoutType === 'circular') {
                simulation
                    .force('x', null)
                    .force('y', null)
                    .force('radial', d3.forceRadial(200, width / 2, height / 2));
            } else {
                simulation
                    .force('x', null)
                    .force('y', null)
                    .force('radial', null);
            }
            
            simulation.alpha(0.3).restart();
        }
        
        function resetZoom() {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
            );
        }
    </script>
</body>
</html>`;
  }

  /**
   * Create SVG visualization
   */
  private createSVG(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): string {
    const width = this.config.width;
    const height = this.config.height;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
        <style>
            .node { cursor: pointer; }
            .link { stroke: #999; stroke-opacity: 0.6; }
            .label { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; }
        </style>
    </defs>`;

    // Add edges
    for (const edge of edges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const x1 = this.getNodeX(sourceNode, nodes, width);
        const y1 = this.getNodeY(sourceNode, nodes, height);
        const x2 = this.getNodeX(targetNode, nodes, width);
        const y2 = this.getNodeY(targetNode, nodes, height);

        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="link" stroke-width="${edge.weight * 3}"/>`;
      }
    }

    // Add nodes
    for (const node of nodes) {
      const x = this.getNodeX(node, nodes, width);
      const y = this.getNodeY(node, nodes, height);
      const radius = this.getNodeRadius(node);
      const color = this.getNodeColor(node.type);

      svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" class="node"/>`;

      if (this.config.showLabels) {
        svg += `<text x="${x}" y="${y + 5}" class="label">${node.label}</text>`;
      }
    }

    svg += "</svg>";
    return svg;
  }

  // Helper methods
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }

  private getNodeShape(type: string): string {
    const shapes = {
      adr: "[",
      pattern: "{{",
      component: "[[",
      dependency: "((",
      stakeholder: "{{",
      technology: "[[",
    };
    return shapes[type as keyof typeof shapes] || "[";
  }

  private getEdgeLabel(edge: KnowledgeEdge): string {
    return edge.type.replace("_", " ");
  }

  private calculateAverageDegree(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
  ): number {
    const degreeMap = new Map<string, number>();

    for (const node of nodes) {
      degreeMap.set(node.id, 0);
    }

    for (const edge of edges) {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    }

    const totalDegree = Array.from(degreeMap.values()).reduce(
      (sum, degree) => sum + degree,
      0,
    );
    return totalDegree / nodes.length;
  }

  private getNodeX(
    node: KnowledgeNode,
    allNodes: KnowledgeNode[],
    width: number,
  ): number {
    const index = allNodes.indexOf(node);
    return (index / allNodes.length) * width;
  }

  private getNodeY(
    node: KnowledgeNode,
    allNodes: KnowledgeNode[],
    height: number,
  ): number {
    const index = allNodes.indexOf(node);
    return (index / allNodes.length) * height;
  }

  private getNodeRadius(node: KnowledgeNode): number {
    const importance = node.properties.importance || 1;
    return Math.max(5, Math.min(20, importance * 10));
  }

  private getNodeColor(type: string): string {
    const colors = {
      adr: "#ff6b6b",
      pattern: "#4ecdc4",
      component: "#45b7d1",
      dependency: "#96ceb4",
      stakeholder: "#feca57",
      technology: "#ff9ff3",
    };
    return colors[type as keyof typeof colors] || "#999";
  }

  private getBackgroundColor(): string {
    return this.config.theme === "dark" ? "#1a1a1a" : "#f5f5f5";
  }

  private getTextColor(): string {
    return this.config.theme === "dark" ? "#ffffff" : "#333333";
  }

  private getPrimaryColor(): string {
    return this.config.theme === "dark" ? "#4ecdc4" : "#2c3e50";
  }

  private getPrimaryHoverColor(): string {
    return this.config.theme === "dark" ? "#45b7d1" : "#34495e";
  }

  private getSecondaryColor(): string {
    return this.config.theme === "dark" ? "#bdc3c7" : "#7f8c8d";
  }

  private getAccentColor(): string {
    return this.config.theme === "dark" ? "#e74c3c" : "#e67e22";
  }

  private getCardBackground(): string {
    return this.config.theme === "dark" ? "#2c2c2c" : "#ffffff";
  }
}
