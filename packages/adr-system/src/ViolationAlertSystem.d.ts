/**
 * Violation Alert System - Advanced Architectural Violation Detection and Alerting
 *
 * This module provides comprehensive violation detection, intelligent alerting,
 * and automated response systems for architectural compliance monitoring.
 */
import { EventEmitter } from "events";
import { RealTimeArchitectureMonitor } from "./RealTimeArchitectureMonitor";
import { CircularDependencyDetector } from "./CircularDependencyDetector";
import { InterfaceContractValidator } from "./InterfaceContractValidator";
import { PerformancePatternMonitor } from "./PerformancePatternMonitor";
export interface ViolationAlert {
    id: string;
    type: "compliance" | "performance" | "security" | "quality" | "dependency" | "contract";
    severity: "low" | "medium" | "high" | "critical";
    category: "modularity" | "type-safety" | "interface-consistency" | "dependency-health" | "performance" | "circular-dependency" | "contract-violation";
    title: string;
    description: string;
    timestamp: string;
    source: string;
    location: {
        filePath?: string;
        lineNumber?: number;
        functionName?: string;
        component?: string;
    };
    data: any;
    impact: {
        severity: number;
        scope: "file" | "module" | "component" | "system";
        affectedUsers: number;
        businessImpact: number;
    };
    actions: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    escalation: {
        level: number;
        maxLevel: number;
        escalationTime: number;
        escalatedAt?: string;
        escalatedBy?: string;
    };
    status: "new" | "acknowledged" | "investigating" | "resolving" | "resolved" | "dismissed";
    assignedTo?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    resolution?: string;
    metadata: {
        tags: string[];
        priority: number;
        confidence: number;
        falsePositive: boolean;
        relatedAlerts: string[];
    };
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    category: ViolationAlert["category"];
    conditions: {
        metric: string;
        operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "contains" | "regex";
        value: any;
        timeWindow?: number;
    }[];
    severity: ViolationAlert["severity"];
    enabled: boolean;
    actions: {
        notify: string[];
        escalate: boolean;
        autoResolve: boolean;
        suppress: boolean;
    };
    metadata: {
        createdBy: string;
        createdAt: string;
        lastModified: string;
        tags: string[];
    };
}
export interface AlertNotification {
    id: string;
    alertId: string;
    type: "email" | "slack" | "webhook" | "dashboard" | "sms";
    recipient: string;
    message: string;
    sentAt: string;
    status: "pending" | "sent" | "delivered" | "failed";
    retryCount: number;
    metadata: any;
}
export interface ViolationAlertReport {
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    alertsByCategory: Record<string, number>;
    topAlerts: ViolationAlert[];
    alertTrends: {
        daily: number[];
        weekly: number[];
        monthly: number[];
    };
    responseMetrics: {
        averageResponseTime: number;
        averageResolutionTime: number;
        resolutionRate: number;
        falsePositiveRate: number;
    };
    recommendations: string[];
    lastUpdated: string;
}
export declare class ViolationAlertSystem extends EventEmitter {
    private readonly alertCache;
    private readonly alertRules;
    private readonly notificationQueue;
    private readonly alertHistory;
    private readonly escalationTimers;
    private architectureMonitor;
    private circularDependencyDetector;
    private interfaceContractValidator;
    private performanceMonitor;
    private alertingActive;
    private notificationInterval?;
    constructor(codebasePath: string, architectureMonitor: RealTimeArchitectureMonitor, circularDependencyDetector: CircularDependencyDetector, interfaceContractValidator: InterfaceContractValidator, performanceMonitor: PerformancePatternMonitor);
    /**
     * Start the violation alert system
     */
    startAlerting(): Promise<void>;
    /**
     * Stop the violation alert system
     */
    stopAlerting(): Promise<void>;
    /**
     * Create a new violation alert
     */
    createAlert(alertData: Partial<ViolationAlert>): ViolationAlert;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): void;
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string, resolvedBy: string, resolution: string): void;
    /**
     * Dismiss an alert
     */
    dismissAlert(alertId: string, dismissedBy: string, reason: string): void;
    /**
     * Get active alerts
     */
    getActiveAlerts(): ViolationAlert[];
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity: ViolationAlert["severity"]): ViolationAlert[];
    /**
     * Get alerts by category
     */
    getAlertsByCategory(category: ViolationAlert["category"]): ViolationAlert[];
    /**
     * Get violation alert report
     */
    getViolationAlertReport(): ViolationAlertReport;
    /**
     * Add alert rule
     */
    addAlertRule(rule: AlertRule): void;
    /**
     * Update alert rule
     */
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void;
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId: string): void;
    private setupEventListeners;
    private evaluateAlertRules;
    private evaluateCondition;
    private extractMetricValue;
    private executeAlertRule;
    private queueNotifications;
    private determineNotificationType;
    private generateNotificationMessage;
    private escalateAlert;
    private autoResolveAlert;
    private suppressAlert;
    private startEscalationTimer;
    private startNotificationProcessing;
    private processNotificationQueue;
    private sendNotification;
    private calculateAlertTrends;
    private calculateResponseMetrics;
    private generateRecommendations;
    private initializeDefaultRules;
    private generateAlertId;
    private generateNotificationId;
}
