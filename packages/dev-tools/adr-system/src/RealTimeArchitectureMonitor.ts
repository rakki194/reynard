/**
 * Real-Time Architecture Monitor - Advanced Real-Time Monitoring and Alerting System
 *
 * This module provides comprehensive real-time monitoring of architectural compliance,
 * dependency health, and performance patterns with intelligent alerting.
 */

import { readFile, readdir, watch, stat } from "fs/promises";
import { join, dirname, basename } from "path";
import { EventEmitter } from "events";
import { ModularityComplianceChecker } from "./ModularityComplianceChecker";
import { DependencyHealthAnalyzer } from "./DependencyHealthAnalyzer";
import { InterfaceConsistencyValidator } from "./InterfaceConsistencyValidator";
import { TypeSafetyCompliance } from "./TypeSafetyCompliance";
import { PerformancePatternDetector } from "./PerformancePatternDetector";

export interface MonitoringEvent {
  id: string;
  type: "violation" | "improvement" | "alert" | "metric" | "trend";
  severity: "info" | "warning" | "error" | "critical";
  timestamp: string;
  source: string;
  message: string;
  data: any;
  metadata: {
    filePath?: string;
    lineNumber?: number;
    category: string;
    tags: string[];
  };
}

export interface ArchitectureMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: "compliance" | "performance" | "quality" | "security";
  trend: "improving" | "declining" | "stable";
  threshold: {
    warning: number;
    critical: number;
  };
  metadata: {
    description: string;
    impact: string;
    recommendations: string[];
  };
}

export interface MonitoringAlert {
  id: string;
  type: "threshold" | "anomaly" | "violation" | "trend";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  data: any;
  actions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface MonitoringDashboard {
  overallHealth: number;
  metrics: ArchitectureMetric[];
  alerts: MonitoringAlert[];
  trends: {
    compliance: number[];
    performance: number[];
    quality: number[];
    security: number[];
  };
  topIssues: MonitoringEvent[];
  recommendations: string[];
  lastUpdated: string;
}

export class RealTimeArchitectureMonitor extends EventEmitter {
  private readonly codebasePath: string;
  private readonly monitoringInterval: number;
  private readonly alertThresholds: Map<string, { warning: number; critical: number }> = new Map();
  private readonly eventHistory: MonitoringEvent[] = [];
  private readonly metricsHistory: Map<string, ArchitectureMetric[]> = new Map();
  private readonly activeAlerts: Map<string, MonitoringAlert> = new Map();
  private readonly watchers: Map<string, any> = new Map();
  private monitoringActive: boolean = false;
  private monitoringTimer?: NodeJS.Timeout;

  // Compliance analyzers
  private modularityChecker: ModularityComplianceChecker;
  private dependencyAnalyzer: DependencyHealthAnalyzer;
  private interfaceValidator: InterfaceConsistencyValidator;
  private typeSafetyCompliance: TypeSafetyCompliance;
  private performanceDetector: PerformancePatternDetector;

  constructor(codebasePath: string, monitoringInterval: number = 30000) {
    super();
    this.codebasePath = codebasePath;
    this.monitoringInterval = monitoringInterval;

    // Initialize compliance analyzers
    this.modularityChecker = new ModularityComplianceChecker(codebasePath);
    this.dependencyAnalyzer = new DependencyHealthAnalyzer(codebasePath, "");
    this.interfaceValidator = new InterfaceConsistencyValidator(codebasePath);
    this.typeSafetyCompliance = new TypeSafetyCompliance(codebasePath, "");
    this.performanceDetector = new PerformancePatternDetector(codebasePath);

    this.initializeAlertThresholds();
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(): Promise<void> {
    console.log("🐺 Starting real-time architecture monitoring...");

    if (this.monitoringActive) {
      console.log("⚠️ Monitoring is already active");
      return;
    }

    this.monitoringActive = true;

    // Start file watching
    await this.startFileWatching();

    // Start periodic monitoring
    this.startPeriodicMonitoring();

    // Perform initial analysis
    await this.performInitialAnalysis();

    console.log("✅ Real-time monitoring started");
    this.emit("monitoring-started", { timestamp: new Date().toISOString() });
  }

  /**
   * Stop real-time monitoring
   */
  async stopMonitoring(): Promise<void> {
    console.log("🐺 Stopping real-time architecture monitoring...");

    this.monitoringActive = false;

    // Stop file watchers
    for (const [filePath, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();

    // Stop periodic monitoring
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    console.log("✅ Real-time monitoring stopped");
    this.emit("monitoring-stopped", { timestamp: new Date().toISOString() });
  }

  /**
   * Get current monitoring dashboard
   */
  async getDashboard(): Promise<MonitoringDashboard> {
    const metrics = await this.collectMetrics();
    const alerts = Array.from(this.activeAlerts.values());
    const trends = this.calculateTrends();
    const topIssues = this.getTopIssues();
    const recommendations = this.generateRecommendations();

    const overallHealth = this.calculateOverallHealth(metrics);

    return {
      overallHealth,
      metrics,
      alerts,
      trends,
      topIssues,
      recommendations,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get monitoring events in a time range
   */
  getEventsInRange(startDate: Date, endDate: Date): MonitoringEvent[] {
    return this.eventHistory.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): MonitoringAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;

      this.emit("alert-resolved", {
        alertId,
        resolvedBy,
        timestamp: alert.resolvedAt,
      });
    }
  }

  /**
   * Set alert threshold for a metric
   */
  setAlertThreshold(metricName: string, warning: number, critical: number): void {
    this.alertThresholds.set(metricName, { warning, critical });
  }

  /**
   * Get metric history
   */
  getMetricHistory(metricName: string, hours: number = 24): ArchitectureMetric[] {
    const history = this.metricsHistory.get(metricName) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return history.filter(metric => new Date(metric.timestamp) >= cutoffTime);
  }

  // Private methods
  private async startFileWatching(): Promise<void> {
    const files = await this.discoverFiles();

    for (const file of files) {
      try {
        const watcher = watch(file, async eventType => {
          if (eventType === "change") {
            await this.handleFileChange(file);
          }
        });

        this.watchers.set(file, watcher);
      } catch (error) {
        console.warn(`Could not watch file ${file}:`, error);
      }
    }
  }

  private startPeriodicMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      if (this.monitoringActive) {
        await this.performPeriodicAnalysis();
      }
    }, this.monitoringInterval);
  }

  private async performInitialAnalysis(): Promise<void> {
    console.log("🐺 Performing initial architecture analysis...");

    try {
      // Run all compliance checks
      const modularityReport = await this.modularityChecker.checkModularityCompliance();
      const dependencyReport = await this.dependencyAnalyzer.analyzeDependencyHealth();
      const interfaceReport = await this.interfaceValidator.validateInterfaceConsistency();
      const typeSafetyReport = await this.typeSafetyCompliance.analyzeTypeSafety();
      const performanceReport = await this.performanceDetector.analyzePerformancePatterns();

      // Create initial metrics
      await this.createInitialMetrics(
        modularityReport,
        dependencyReport,
        interfaceReport,
        typeSafetyReport,
        performanceReport
      );

      console.log("✅ Initial analysis complete");
    } catch (error) {
      console.error("Failed to perform initial analysis:", error);
      this.emit("analysis-error", {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async performPeriodicAnalysis(): Promise<void> {
    try {
      const metrics = await this.collectMetrics();

      // Check for threshold violations
      await this.checkThresholdViolations(metrics);

      // Update metrics history
      this.updateMetricsHistory(metrics);

      // Emit monitoring event
      this.emit("periodic-analysis", {
        metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to perform periodic analysis:", error);
      this.emit("analysis-error", {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async handleFileChange(filePath: string): Promise<void> {
    try {
      // Determine what type of analysis to run based on file type
      const fileType = this.getFileType(filePath);

      let analysisResult: any = null;
      let category = "";

      switch (fileType) {
        case "typescript":
        case "javascript":
          // Run modularity and performance analysis
          const modularityIssues = await this.modularityChecker.analyzeModule(filePath);
          const performanceIssues = await this.performanceDetector.analyzeFilePerformance(filePath);

          if (modularityIssues.violations.length > 0) {
            analysisResult = modularityIssues;
            category = "modularity";
          } else if (performanceIssues.length > 0) {
            analysisResult = performanceIssues;
            category = "performance";
          }
          break;

        case "package-json":
          // Run dependency analysis
          const dependencyReport = await this.dependencyAnalyzer.analyzeDependencyHealth();
          analysisResult = dependencyReport;
          category = "dependency";
          break;
      }

      if (analysisResult) {
        const event: MonitoringEvent = {
          id: this.generateEventId(),
          type: "violation",
          severity: this.determineSeverity(analysisResult),
          timestamp: new Date().toISOString(),
          source: filePath,
          message: `Architecture issue detected in ${basename(filePath)}`,
          data: analysisResult,
          metadata: {
            filePath,
            category,
            tags: [fileType, category],
          },
        };

        this.eventHistory.push(event);
        this.emit("file-change-detected", event);

        // Check if this creates an alert
        await this.checkForAlerts(event);
      }
    } catch (error) {
      console.error(`Failed to handle file change for ${filePath}:`, error);
    }
  }

  private async collectMetrics(): Promise<ArchitectureMetric[]> {
    const metrics: ArchitectureMetric[] = [];

    try {
      // Collect modularity metrics
      const modularityReport = await this.modularityChecker.checkModularityCompliance();
      metrics.push({
        name: "modularity-compliance",
        value: modularityReport.overallCompliance,
        unit: "percentage",
        timestamp: new Date().toISOString(),
        category: "compliance",
        trend: this.calculateTrend("modularity-compliance", modularityReport.overallCompliance),
        threshold: this.alertThresholds.get("modularity-compliance") || {
          warning: 70,
          critical: 50,
        },
        metadata: {
          description: "Overall modularity compliance score",
          impact: "Affects maintainability and code organization",
          recommendations: ["Split large files", "Reduce function complexity", "Improve module cohesion"],
        },
      });

      // Collect dependency health metrics
      const dependencyReport = await this.dependencyAnalyzer.analyzeDependencyHealth();
      metrics.push({
        name: "dependency-health",
        value: dependencyReport.overallHealth,
        unit: "percentage",
        timestamp: new Date().toISOString(),
        category: "security",
        trend: this.calculateTrend("dependency-health", dependencyReport.overallHealth),
        threshold: this.alertThresholds.get("dependency-health") || {
          warning: 80,
          critical: 60,
        },
        metadata: {
          description: "Overall dependency health score",
          impact: "Affects security and maintenance",
          recommendations: [
            "Update outdated dependencies",
            "Fix security vulnerabilities",
            "Remove unused dependencies",
          ],
        },
      });

      // Collect interface consistency metrics
      const interfaceReport = await this.interfaceValidator.validateInterfaceConsistency();
      metrics.push({
        name: "interface-consistency",
        value: interfaceReport.overallConsistency,
        unit: "percentage",
        timestamp: new Date().toISOString(),
        category: "quality",
        trend: this.calculateTrend("interface-consistency", interfaceReport.overallConsistency),
        threshold: this.alertThresholds.get("interface-consistency") || {
          warning: 85,
          critical: 70,
        },
        metadata: {
          description: "Interface consistency score",
          impact: "Affects API design and maintainability",
          recommendations: ["Follow naming conventions", "Add documentation", "Maintain consistent structure"],
        },
      });

      // Collect type safety metrics
      const typeSafetyReport = await this.typeSafetyCompliance.analyzeTypeSafety();
      metrics.push({
        name: "type-safety",
        value: typeSafetyReport.overallTypeSafety,
        unit: "percentage",
        timestamp: new Date().toISOString(),
        category: "quality",
        trend: this.calculateTrend("type-safety", typeSafetyReport.overallTypeSafety),
        threshold: this.alertThresholds.get("type-safety") || {
          warning: 90,
          critical: 75,
        },
        metadata: {
          description: "Type safety compliance score",
          impact: "Affects code reliability and maintainability",
          recommendations: ["Eliminate any types", "Add explicit type annotations", "Enable strict mode"],
        },
      });

      // Collect performance metrics
      const performanceReport = await this.performanceDetector.analyzePerformancePatterns();
      metrics.push({
        name: "performance-score",
        value: performanceReport.overallPerformance,
        unit: "percentage",
        timestamp: new Date().toISOString(),
        category: "performance",
        trend: this.calculateTrend("performance-score", performanceReport.overallPerformance),
        threshold: this.alertThresholds.get("performance-score") || {
          warning: 80,
          critical: 60,
        },
        metadata: {
          description: "Overall performance score",
          impact: "Affects application performance and user experience",
          recommendations: ["Optimize algorithms", "Fix memory leaks", "Use async operations"],
        },
      });
    } catch (error) {
      console.error("Failed to collect metrics:", error);
    }

    return metrics;
  }

  private async checkThresholdViolations(metrics: ArchitectureMetric[]): Promise<void> {
    for (const metric of metrics) {
      const threshold = this.alertThresholds.get(metric.name);
      if (!threshold) continue;

      let severity: "low" | "medium" | "high" | "critical" | null = null;

      if (metric.value <= threshold.critical) {
        severity = "critical";
      } else if (metric.value <= threshold.warning) {
        severity = "high";
      }

      if (severity) {
        const alert: MonitoringAlert = {
          id: this.generateAlertId(),
          type: "threshold",
          severity,
          title: `${metric.name} threshold violation`,
          description: `${metric.name} is ${metric.value}% (threshold: ${threshold.warning}% warning, ${threshold.critical}% critical)`,
          timestamp: new Date().toISOString(),
          source: "monitoring-system",
          data: metric,
          actions: {
            immediate: metric.metadata.recommendations.slice(0, 2),
            shortTerm: metric.metadata.recommendations.slice(2, 4),
            longTerm: ["Implement continuous monitoring", "Set up automated alerts"],
          },
          resolved: false,
        };

        this.activeAlerts.set(alert.id, alert);
        this.emit("threshold-violation", alert);
      }
    }
  }

  private async checkForAlerts(event: MonitoringEvent): Promise<void> {
    // Check if this event should trigger an alert
    if (event.severity === "critical" || event.severity === "error") {
      const alert: MonitoringAlert = {
        id: this.generateAlertId(),
        type: "violation",
        severity: event.severity === "critical" ? "critical" : "high",
        title: `Architecture violation detected`,
        description: event.message,
        timestamp: new Date().toISOString(),
        source: event.source,
        data: event.data,
        actions: {
          immediate: ["Review the violation", "Assess impact"],
          shortTerm: ["Fix the violation", "Update monitoring rules"],
          longTerm: ["Prevent similar violations", "Improve development process"],
        },
        resolved: false,
      };

      this.activeAlerts.set(alert.id, alert);
      this.emit("violation-alert", alert);
    }
  }

  private calculateTrend(metricName: string, currentValue: number): "improving" | "declining" | "stable" {
    const history = this.metricsHistory.get(metricName) || [];
    if (history.length < 2) return "stable";

    const recent = history.slice(-5); // Last 5 measurements
    const average = recent.reduce((sum, metric) => sum + metric.value, 0) / recent.length;

    const difference = currentValue - average;
    const threshold = 5; // 5% change threshold

    if (difference > threshold) return "improving";
    if (difference < -threshold) return "declining";
    return "stable";
  }

  private calculateTrends(): MonitoringDashboard["trends"] {
    const trends = {
      compliance: [] as number[],
      performance: [] as number[],
      quality: [] as number[],
      security: [] as number[],
    };

    // Calculate trends for each category
    for (const [metricName, history] of this.metricsHistory) {
      const recentHistory = history.slice(-24); // Last 24 measurements
      const values = recentHistory.map(metric => metric.value);

      if (metricName.includes("modularity") || metricName.includes("interface") || metricName.includes("type-safety")) {
        trends.compliance.push(...values);
      } else if (metricName.includes("performance")) {
        trends.performance.push(...values);
      } else if (metricName.includes("dependency")) {
        trends.security.push(...values);
      } else {
        trends.quality.push(...values);
      }
    }

    return trends;
  }

  private getTopIssues(): MonitoringEvent[] {
    return this.eventHistory
      .filter(event => event.severity === "critical" || event.severity === "error")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const activeAlerts = this.getActiveAlerts();

    if (activeAlerts.length > 0) {
      recommendations.push(`🚨 Address ${activeAlerts.length} active alerts`);
    }

    const criticalEvents = this.eventHistory.filter(event => event.severity === "critical").length;
    if (criticalEvents > 0) {
      recommendations.push(`⚠️ Fix ${criticalEvents} critical issues`);
    }

    recommendations.push("📊 Monitor trends and patterns");
    recommendations.push("🔍 Set up automated alerts");
    recommendations.push("📈 Track improvement over time");

    return recommendations;
  }

  private calculateOverallHealth(metrics: ArchitectureMetric[]): number {
    if (metrics.length === 0) return 0;

    const weights = {
      compliance: 0.3,
      performance: 0.25,
      quality: 0.25,
      security: 0.2,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const metric of metrics) {
      const weight = weights[metric.category] || 0.1;
      weightedScore += metric.value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  private updateMetricsHistory(metrics: ArchitectureMetric[]): void {
    for (const metric of metrics) {
      const history = this.metricsHistory.get(metric.name) || [];
      history.push(metric);

      // Keep only last 100 measurements
      if (history.length > 100) {
        history.shift();
      }

      this.metricsHistory.set(metric.name, history);
    }
  }

  private async createInitialMetrics(
    modularityReport: any,
    dependencyReport: any,
    interfaceReport: any,
    typeSafetyReport: any,
    performanceReport: any
  ): Promise<void> {
    const metrics = await this.collectMetrics();
    this.updateMetricsHistory(metrics);
  }

  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            if (!["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = fullPath.split(".").pop();
            if (["ts", "tsx", "js", "jsx", "json"].includes(ext || "")) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };

    await scanDirectory(this.codebasePath);
    return files;
  }

  private getFileType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "json":
        if (basename(filePath) === "package.json") {
          return "package-json";
        }
        return "json";
      default:
        return "unknown";
    }
  }

  private determineSeverity(analysisResult: any): "info" | "warning" | "error" | "critical" {
    if (analysisResult.violations) {
      const criticalViolations = analysisResult.violations.filter((v: any) => v.severity === "critical").length;
      const highViolations = analysisResult.violations.filter((v: any) => v.severity === "high").length;

      if (criticalViolations > 0) return "critical";
      if (highViolations > 0) return "error";
      if (analysisResult.violations.length > 0) return "warning";
    }

    if (Array.isArray(analysisResult)) {
      const criticalIssues = analysisResult.filter((issue: any) => issue.severity === "critical").length;
      const highIssues = analysisResult.filter((issue: any) => issue.severity === "high").length;

      if (criticalIssues > 0) return "critical";
      if (highIssues > 0) return "error";
      if (analysisResult.length > 0) return "warning";
    }

    return "info";
  }

  private initializeAlertThresholds(): void {
    this.alertThresholds.set("modularity-compliance", {
      warning: 70,
      critical: 50,
    });
    this.alertThresholds.set("dependency-health", {
      warning: 80,
      critical: 60,
    });
    this.alertThresholds.set("interface-consistency", {
      warning: 85,
      critical: 70,
    });
    this.alertThresholds.set("type-safety", { warning: 90, critical: 75 });
    this.alertThresholds.set("performance-score", {
      warning: 80,
      critical: 60,
    });
  }

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
