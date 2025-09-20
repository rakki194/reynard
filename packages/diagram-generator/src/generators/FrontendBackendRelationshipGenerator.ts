/**
 * 🦊 Frontend-Backend Relationship Diagram Generator
 *
 * Generates comprehensive diagrams showing relationships between
 * frontend packages and backend services, including API connections,
 * data flow, and dependency mappings.
 */

import type {
  DiagramGenerator,
  DiagramOutput,
  DiagramMetadata,
  CodebaseAnalysis,
  DiagramGenerationConfig,
} from "../types.js";

export interface FrontendBackendAnalysis {
  /** Frontend packages that connect to backend */
  frontendPackages: FrontendPackageAnalysis[];
  /** Backend services and endpoints */
  backendServices: BackendServiceAnalysis[];
  /** API connections between frontend and backend */
  apiConnections: APIConnectionAnalysis[];
  /** Data flow patterns */
  dataFlows: DataFlowAnalysis[];
  /** Dependency relationships */
  dependencies: DependencyRelationshipAnalysis[];
}

export interface FrontendPackageAnalysis {
  /** Package name */
  name: string;
  /** Package path */
  path: string;
  /** Package type (UI, API client, etc.) */
  type: "ui" | "api-client" | "connection" | "composable" | "service" | "utility";
  /** Backend connections */
  backendConnections: string[];
  /** API endpoints used */
  apiEndpoints: string[];
  /** Data models consumed */
  dataModels: string[];
  /** Authentication requirements */
  authRequired: boolean;
  /** Real-time features */
  realtimeFeatures: string[];
}

export interface BackendServiceAnalysis {
  /** Service name */
  name: string;
  /** Service path */
  path: string;
  /** API endpoints */
  endpoints: BackendEndpointAnalysis[];
  /** Data models */
  dataModels: string[];
  /** Authentication type */
  authType: "none" | "jwt" | "api-key" | "oauth";
  /** Real-time capabilities */
  realtimeCapabilities: string[];
}

export interface BackendEndpointAnalysis {
  /** Endpoint path */
  path: string;
  /** HTTP method */
  method: string;
  /** Endpoint purpose */
  purpose: string;
  /** Frontend packages using this endpoint */
  frontendUsers: string[];
}

export interface APIConnectionAnalysis {
  /** Source frontend package */
  source: string;
  /** Target backend service */
  target: string;
  /** Connection type */
  type: "http" | "websocket" | "sse" | "graphql";
  /** Endpoints used */
  endpoints: string[];
  /** Data flow direction */
  direction: "request" | "response" | "bidirectional";
  /** Authentication required */
  authRequired: boolean;
}

export interface DataFlowAnalysis {
  /** Source */
  source: string;
  /** Target */
  target: string;
  /** Data type */
  dataType: string;
  /** Flow pattern */
  pattern: "request-response" | "streaming" | "batch" | "real-time";
  /** Frequency */
  frequency: "on-demand" | "periodic" | "continuous";
}

export interface DependencyRelationshipAnalysis {
  /** Source package */
  source: string;
  /** Target package */
  target: string;
  /** Relationship type */
  type: "depends" | "uses" | "extends" | "implements";
  /** Strength of relationship */
  strength: number;
}

export class FrontendBackendRelationshipGenerator implements DiagramGenerator {
  name = "Frontend-Backend Relationship Generator";
  type = "frontend-backend-relationships" as const;
  description = "Generates comprehensive frontend-backend relationship diagrams";

  async generate(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const frontendBackendAnalysis = await this.analyzeFrontendBackendRelationships(analysis);
    const mermaidContent = this.generateMermaidContent(frontendBackendAnalysis, config);

    const metadata: DiagramMetadata = {
      type: this.type,
      title: "Reynard Frontend-Backend Relationships",
      description: "Comprehensive view of frontend packages and backend service relationships",
      nodeCount: frontendBackendAnalysis.frontendPackages.length + frontendBackendAnalysis.backendServices.length,
      edgeCount: frontendBackendAnalysis.apiConnections.length + frontendBackendAnalysis.dependencies.length,
      complexityScore: this.calculateComplexity(frontendBackendAnalysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: [
        ...frontendBackendAnalysis.frontendPackages.map(pkg => pkg.path),
        ...frontendBackendAnalysis.backendServices.map(svc => svc.path),
      ],
      dependencies: frontendBackendAnalysis.apiConnections.map(conn => `${conn.source}->${conn.target}`),
    };

    return {
      mermaidContent,
      metadata,
      outputPaths: {},
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return analysis.packages.length > 0;
  }

  private async analyzeFrontendBackendRelationships(analysis: CodebaseAnalysis): Promise<FrontendBackendAnalysis> {
    const frontendPackages = this.analyzeFrontendPackages(analysis);
    const backendServices = this.analyzeBackendServices(analysis);
    const apiConnections = this.analyzeAPIConnections(frontendPackages, backendServices);
    const dataFlows = this.analyzeDataFlows(frontendPackages, backendServices);
    const dependencies = this.analyzeDependencies(analysis);

    return {
      frontendPackages,
      backendServices,
      apiConnections,
      dataFlows,
      dependencies,
    };
  }

  private analyzeFrontendPackages(analysis: CodebaseAnalysis): FrontendPackageAnalysis[] {
    const frontendPackages: FrontendPackageAnalysis[] = [];

    for (const pkg of analysis.packages) {
      if (pkg.path.startsWith("packages/")) {
        const packageType = this.determinePackageType(pkg);
        const backendConnections = this.extractBackendConnections(pkg);
        const apiEndpoints = this.extractAPIEndpoints(pkg);
        const dataModels = this.extractDataModels(pkg);
        const authRequired = this.requiresAuthentication(pkg);
        const realtimeFeatures = this.extractRealtimeFeatures(pkg);

        frontendPackages.push({
          name: pkg.name,
          path: pkg.path,
          type: packageType,
          backendConnections,
          apiEndpoints,
          dataModels,
          authRequired,
          realtimeFeatures,
        });
      }
    }

    return frontendPackages;
  }

  private analyzeBackendServices(analysis: CodebaseAnalysis): BackendServiceAnalysis[] {
    const backendServices: BackendServiceAnalysis[] = [];

    // Analyze backend directory structure
    const backendPackages = analysis.packages.filter(pkg => pkg.path.startsWith("backend/"));
    
    for (const pkg of backendPackages) {
      const endpoints = this.extractBackendEndpoints(pkg);
      const dataModels = this.extractBackendDataModels(pkg);
      const authType = this.determineAuthType(pkg);
      const realtimeCapabilities = this.extractRealtimeCapabilities(pkg);

      backendServices.push({
        name: pkg.name || "backend",
        path: pkg.path,
        endpoints,
        dataModels,
        authType,
        realtimeCapabilities,
      });
    }

    return backendServices;
  }

  private analyzeAPIConnections(
    frontendPackages: FrontendPackageAnalysis[],
    backendServices: BackendServiceAnalysis[]
  ): APIConnectionAnalysis[] {
    const connections: APIConnectionAnalysis[] = [];

    for (const frontendPkg of frontendPackages) {
      for (const backendSvc of backendServices) {
        if (frontendPkg.backendConnections.includes(backendSvc.name)) {
          const connectionType = this.determineConnectionType(frontendPkg, backendSvc);
          const endpoints = this.findMatchingEndpoints(frontendPkg, backendSvc);
          const direction = this.determineDataDirection(frontendPkg, backendSvc);
          const authRequired = frontendPkg.authRequired || backendSvc.authType !== "none";

          connections.push({
            source: frontendPkg.name,
            target: backendSvc.name,
            type: connectionType,
            endpoints,
            direction,
            authRequired,
          });
        }
      }
    }

    return connections;
  }

  private analyzeDataFlows(
    frontendPackages: FrontendPackageAnalysis[],
    backendServices: BackendServiceAnalysis[]
  ): DataFlowAnalysis[] {
    const dataFlows: DataFlowAnalysis[] = [];

    for (const frontendPkg of frontendPackages) {
      for (const dataModel of frontendPkg.dataModels) {
        for (const backendSvc of backendServices) {
          if (backendSvc.dataModels.includes(dataModel)) {
            const pattern = this.determineDataFlowPattern(frontendPkg, backendSvc);
            const frequency = this.determineDataFrequency(frontendPkg, backendSvc);

            dataFlows.push({
              source: frontendPkg.name,
              target: backendSvc.name,
              dataType: dataModel,
              pattern,
              frequency,
            });
          }
        }
      }
    }

    return dataFlows;
  }

  private analyzeDependencies(analysis: CodebaseAnalysis): DependencyRelationshipAnalysis[] {
    const dependencies: DependencyRelationshipAnalysis[] = [];

    for (const pkg of analysis.packages) {
      for (const dep of pkg.dependencies) {
        // Include both internal and external dependencies for better visualization
        dependencies.push({
          source: pkg.name,
          target: dep,
          type: "depends",
          strength: dep.startsWith("reynard-") ? 1 : 0.5, // Higher strength for internal deps
        });
      }
    }

    return dependencies;
  }

  private generateMermaidContent(analysis: FrontendBackendAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      "%%{init: {'theme': 'neutral'}}%%",
      "graph TB",
      '    subgraph "🦊 Reynard Frontend-Backend Architecture"',
      "        direction TB",
      "",
    ];

    // Add frontend packages section
    lines.push('        subgraph frontend["🖥️ Frontend Packages"]');
    lines.push("            direction TB");

    // Group frontend packages by type
    const packagesByType = this.groupPackagesByType(analysis.frontendPackages);
    
    for (const [type, packages] of Object.entries(packagesByType)) {
      if (packages.length === 0) continue;

      const typeIcon = this.getTypeIcon(type);
      lines.push(`            subgraph ${this.sanitizeId(type)}["${typeIcon} ${type}"]`);
      lines.push("                direction LR");

      for (const pkg of packages) {
        const pkgId = this.sanitizeId(pkg.name);
        const authIcon = pkg.authRequired ? "🔐" : "";
        const realtimeIcon = pkg.realtimeFeatures.length > 0 ? "⚡" : "";
        const pkgLabel = `${authIcon}${realtimeIcon} ${pkg.name}`;

        lines.push(`                ${pkgId}["${pkgLabel}"]`);
      }

      lines.push("            end");
    }

    lines.push("        end");
    lines.push("");

    // Add backend services section
    lines.push('        subgraph backend["⚙️ Backend Services"]');
    lines.push("            direction TB");

    for (const service of analysis.backendServices) {
      const serviceId = this.sanitizeId(service.name);
      const authIcon = service.authType !== "none" ? "🔐" : "";
      const realtimeIcon = service.realtimeCapabilities.length > 0 ? "⚡" : "";
      const serviceLabel = `${authIcon}${realtimeIcon} ${service.name}`;

      lines.push(`            ${serviceId}["${serviceLabel}"]`);

      // Add endpoint details if configured
      if (config.includeRelationships && service.endpoints.length > 0) {
        const endpointId = this.sanitizeId(`${service.name}_endpoints`);
        lines.push(`            ${serviceId} --> ${endpointId}["${service.endpoints.length} endpoints"]`);
      }
    }

    lines.push("        end");
    lines.push("");

    // Add API connections
    lines.push("        %% API Connections");
    for (const connection of analysis.apiConnections) {
      const sourceId = this.sanitizeId(connection.source);
      const targetId = this.sanitizeId(connection.target);
      const connectionStyle = this.getConnectionStyle(connection);

      lines.push(`        ${sourceId} ${connectionStyle} ${targetId}`);
    }

    lines.push("");

    // Add data flows
    if (config.includeRelationships && analysis.dataFlows.length > 0) {
      lines.push("        %% Data Flows");
      for (const flow of analysis.dataFlows.slice(0, 10)) { // Limit to prevent clutter
        const sourceId = this.sanitizeId(flow.source);
        const targetId = this.sanitizeId(flow.target);
        const flowStyle = this.getDataFlowStyle(flow);

        lines.push(`        ${sourceId} ${flowStyle} ${targetId}`);
      }
      lines.push("");
    }

    // Add dependency relationships
    lines.push("        %% Internal Dependencies");
    for (const dep of analysis.dependencies) {
      if (dep.strength > 0.5) {
        const sourceId = this.sanitizeId(dep.source);
        const targetId = this.sanitizeId(dep.target);
        lines.push(`        ${sourceId} -.-> ${targetId}`);
      }
    }

    lines.push("    end");
    lines.push("");

    // Add legend
    lines.push('    subgraph legend["📋 Legend"]');
    lines.push("        direction LR");
    lines.push('        legend_auth["🔐 Authentication Required"]');
    lines.push('        legend_realtime["⚡ Real-time Features"]');
    lines.push('        legend_http["--> HTTP API"]');
    lines.push('        legend_ws["<--> WebSocket"]');
    lines.push('        legend_sse["--> Server-Sent Events"]');
    lines.push('        legend_dep["-.-> Internal Dependency"]');
    lines.push("    end");

    return lines.join("\n");
  }

  // Helper methods

  private determinePackageType(pkg: any): FrontendPackageAnalysis["type"] {
    const name = pkg.name.toLowerCase();
    const path = pkg.path.toLowerCase();

    if (name.includes("api-client") || path.includes("api-client")) return "api-client";
    if (name.includes("connection") || path.includes("connection")) return "connection";
    if (name.includes("composable") || path.includes("composable")) return "composable";
    if (name.includes("service") || path.includes("service")) return "service";
    if (name.includes("ui") || name.includes("component") || path.includes("ui")) return "ui";
    
    return "utility";
  }

  private extractBackendConnections(pkg: any): string[] {
    const connections: string[] = [];
    
    // Check for API client usage
    if (pkg.dependencies.includes("reynard-api-client")) {
      connections.push("backend");
    }
    
    // Check for connection package usage
    if (pkg.dependencies.includes("reynard-connection")) {
      connections.push("backend");
    }

    return connections;
  }

  private extractAPIEndpoints(pkg: any): string[] {
    const endpoints: string[] = [];
    
    // This would be enhanced by analyzing actual API calls in the code
    // For now, we'll use heuristics based on package names and dependencies
    
    if (pkg.name.includes("caption")) {
      endpoints.push("/api/caption", "/api/caption/upload", "/api/caption/monitoring");
    }
    
    if (pkg.name.includes("chat")) {
      endpoints.push("/api/chat", "/api/ollama");
    }
    
    if (pkg.name.includes("rag")) {
      endpoints.push("/api/rag", "/api/search");
    }
    
    if (pkg.name.includes("gallery")) {
      endpoints.push("/api/gallery");
    }

    return endpoints;
  }

  private extractDataModels(pkg: any): string[] {
    const models: string[] = [];
    
    // Extract data models based on package purpose
    if (pkg.name.includes("caption")) {
      models.push("Caption", "CaptionRequest", "CaptionResponse");
    }
    
    if (pkg.name.includes("chat")) {
      models.push("ChatMessage", "ChatRequest", "ChatResponse");
    }
    
    if (pkg.name.includes("rag")) {
      models.push("SearchResult", "QueryRequest", "QueryResponse");
    }
    
    if (pkg.name.includes("gallery")) {
      models.push("GalleryItem", "ImageMetadata");
    }

    return models;
  }

  private requiresAuthentication(pkg: any): boolean {
    // Check if package requires authentication
    return pkg.dependencies.includes("reynard-auth") || 
           pkg.name.includes("auth") ||
           pkg.name.includes("secure");
  }

  private extractRealtimeFeatures(pkg: any): string[] {
    const features: string[] = [];
    
    if (pkg.dependencies.includes("reynard-connection")) {
      features.push("WebSocket", "SSE");
    }
    
    if (pkg.name.includes("chat")) {
      features.push("Real-time Chat");
    }
    
    if (pkg.name.includes("monitoring")) {
      features.push("Live Monitoring");
    }

    return features;
  }

  private extractBackendEndpoints(pkg: any): BackendEndpointAnalysis[] {
    const endpoints: BackendEndpointAnalysis[] = [];
    
    // Analyze backend API structure based on actual backend directory
    if (pkg.path === "backend" || pkg.name === "reynard-backend") {
      // Add comprehensive backend endpoints based on actual backend structure
      endpoints.push(
        { path: "/api/caption", method: "POST", purpose: "Generate captions", frontendUsers: ["reynard-caption", "reynard-api-client"] },
        { path: "/api/caption/upload", method: "POST", purpose: "Upload images", frontendUsers: ["reynard-caption"] },
        { path: "/api/caption/monitoring", method: "GET", purpose: "Monitor progress", frontendUsers: ["reynard-caption"] },
        { path: "/api/chat", method: "POST", purpose: "Chat completion", frontendUsers: ["reynard-chat", "reynard-api-client"] },
        { path: "/api/ollama", method: "POST", purpose: "Ollama integration", frontendUsers: ["reynard-chat"] },
        { path: "/api/rag", method: "POST", purpose: "RAG queries", frontendUsers: ["reynard-rag", "reynard-api-client"] },
        { path: "/api/search", method: "GET", purpose: "Semantic search", frontendUsers: ["reynard-rag"] },
        { path: "/api/gallery", method: "GET", purpose: "Gallery management", frontendUsers: ["reynard-gallery"] },
        { path: "/api/auth", method: "POST", purpose: "Authentication", frontendUsers: ["reynard-auth", "reynard-api-client"] },
        { path: "/api/health", method: "GET", purpose: "Health check", frontendUsers: ["reynard-connection"] },
        { path: "/api/ecs", method: "GET", purpose: "ECS world simulation", frontendUsers: ["reynard-ecs-world"] },
        { path: "/api/mcp", method: "POST", purpose: "MCP tools", frontendUsers: ["reynard-mcp-server"] }
      );
    }

    return endpoints;
  }

  private extractBackendDataModels(pkg: any): string[] {
    const models: string[] = [];
    
    if (pkg.path === "backend" || pkg.name === "reynard-backend") {
      // Add comprehensive backend data models
      models.push(
        "Caption", "CaptionRequest", "CaptionResponse",
        "ChatMessage", "ChatRequest", "ChatResponse",
        "SearchResult", "QueryRequest", "QueryResponse",
        "GalleryItem", "ImageMetadata", "UserProfile",
        "AuthToken", "AuthRequest", "AuthResponse",
        "ECSWorld", "Agent", "Trait", "Persona",
        "MCPTool", "MCPRequest", "MCPResponse"
      );
    }

    return models;
  }

  private determineAuthType(pkg: any): BackendServiceAnalysis["authType"] {
    if (pkg.path.includes("secure") || pkg.name.includes("secure")) {
      return "jwt";
    }
    
    if (pkg.path.includes("auth")) {
      return "jwt";
    }
    
    return "none";
  }

  private extractRealtimeCapabilities(pkg: any): string[] {
    const capabilities: string[] = [];
    
    if (pkg.path === "backend" || pkg.name === "reynard-backend") {
      capabilities.push(
        "WebSocket", "Real-time streaming", "SSE", "Live updates",
        "Real-time chat", "Live monitoring", "ECS world simulation"
      );
    }

    return capabilities;
  }

  private determineConnectionType(frontend: FrontendPackageAnalysis, backend: BackendServiceAnalysis): APIConnectionAnalysis["type"] {
    if (frontend.realtimeFeatures.length > 0 && backend.realtimeCapabilities.length > 0) {
      return "websocket";
    }
    
    if (frontend.realtimeFeatures.includes("SSE") || backend.realtimeCapabilities.includes("SSE")) {
      return "sse";
    }
    
    return "http";
  }

  private findMatchingEndpoints(frontend: FrontendPackageAnalysis, backend: BackendServiceAnalysis): string[] {
    return frontend.apiEndpoints.filter(endpoint => 
      backend.endpoints.some(be => be.path === endpoint)
    );
  }

  private determineDataDirection(frontend: FrontendPackageAnalysis, backend: BackendServiceAnalysis): APIConnectionAnalysis["direction"] {
    if (frontend.realtimeFeatures.length > 0) {
      return "bidirectional";
    }
    
    return "request";
  }

  private determineDataFlowPattern(frontend: FrontendPackageAnalysis, backend: BackendServiceAnalysis): DataFlowAnalysis["pattern"] {
    if (frontend.realtimeFeatures.length > 0) {
      return "real-time";
    }
    
    if (frontend.name.includes("batch") || backend.name.includes("batch")) {
      return "batch";
    }
    
    return "request-response";
  }

  private determineDataFrequency(frontend: FrontendPackageAnalysis, backend: BackendServiceAnalysis): DataFlowAnalysis["frequency"] {
    if (frontend.realtimeFeatures.length > 0) {
      return "continuous";
    }
    
    if (frontend.name.includes("monitoring") || frontend.name.includes("watch")) {
      return "periodic";
    }
    
    return "on-demand";
  }

  private groupPackagesByType(packages: FrontendPackageAnalysis[]): Record<string, FrontendPackageAnalysis[]> {
    const grouped: Record<string, FrontendPackageAnalysis[]> = {};
    
    for (const pkg of packages) {
      if (!grouped[pkg.type]) {
        grouped[pkg.type] = [];
      }
      grouped[pkg.type].push(pkg);
    }
    
    return grouped;
  }

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      "ui": "🎨",
      "api-client": "🔌",
      "connection": "🌐",
      "composable": "🧩",
      "service": "⚙️",
      "utility": "🛠️",
    };
    
    return icons[type] || "📦";
  }

  private getConnectionStyle(connection: APIConnectionAnalysis): string {
    const styles: Record<string, string> = {
      "http": "-->",
      "websocket": "<-->",
      "sse": "-->",
      "graphql": "-->",
    };
    
    return styles[connection.type] || "-->";
  }

  private getDataFlowStyle(flow: DataFlowAnalysis): string {
    const styles: Record<string, string> = {
      "request-response": "-->",
      "streaming": "-->",
      "batch": "-->",
      "real-time": "<-->",
    };
    
    return styles[flow.pattern] || "-->";
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
  }

  private calculateComplexity(analysis: FrontendBackendAnalysis): number {
    return (
      analysis.frontendPackages.length +
      analysis.backendServices.length +
      analysis.apiConnections.length +
      analysis.dataFlows.length +
      analysis.dependencies.length
    );
  }
}
