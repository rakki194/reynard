/**
 * Violation Alert System - Advanced Architectural Violation Detection and Alerting
 *
 * This module provides comprehensive violation detection, intelligent alerting,
 * and automated response systems for architectural compliance monitoring.
 */
import { EventEmitter } from "events";
export class ViolationAlertSystem extends EventEmitter {
    constructor(codebasePath, architectureMonitor, circularDependencyDetector, interfaceContractValidator, performanceMonitor) {
        super();
        Object.defineProperty(this, "alertCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "alertRules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "notificationQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "alertHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "escalationTimers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // Monitoring components
        Object.defineProperty(this, "architectureMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "circularDependencyDetector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "interfaceContractValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "alertingActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "notificationInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.architectureMonitor = architectureMonitor;
        this.circularDependencyDetector = circularDependencyDetector;
        this.interfaceContractValidator = interfaceContractValidator;
        this.performanceMonitor = performanceMonitor;
        this.initializeDefaultRules();
        this.setupEventListeners();
    }
    /**
     * Start the violation alert system
     */
    async startAlerting() {
        console.log("🐺 Starting violation alert system...");
        if (this.alertingActive) {
            console.log("⚠️ Alert system is already active");
            return;
        }
        this.alertingActive = true;
        // Start notification processing
        this.startNotificationProcessing();
        console.log("✅ Violation alert system started");
        this.emit("alerting-started", { timestamp: new Date().toISOString() });
    }
    /**
     * Stop the violation alert system
     */
    async stopAlerting() {
        console.log("🐺 Stopping violation alert system...");
        this.alertingActive = false;
        // Stop notification processing
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = undefined;
        }
        // Clear escalation timers
        for (const timer of this.escalationTimers.values()) {
            clearTimeout(timer);
        }
        this.escalationTimers.clear();
        console.log("✅ Violation alert system stopped");
        this.emit("alerting-stopped", { timestamp: new Date().toISOString() });
    }
    /**
     * Create a new violation alert
     */
    createAlert(alertData) {
        const alert = {
            id: this.generateAlertId(),
            type: alertData.type || "compliance",
            severity: alertData.severity || "medium",
            category: alertData.category || "modularity",
            title: alertData.title || "Architectural violation detected",
            description: alertData.description || "An architectural violation has been detected",
            timestamp: new Date().toISOString(),
            source: alertData.source || "alert-system",
            location: alertData.location || {},
            data: alertData.data || {},
            impact: alertData.impact || {
                severity: 0.5,
                scope: "file",
                affectedUsers: 1,
                businessImpact: 0.3,
            },
            actions: alertData.actions || {
                immediate: ["Investigate the violation"],
                shortTerm: ["Fix the violation"],
                longTerm: ["Prevent similar violations"],
            },
            escalation: {
                level: 1,
                maxLevel: 3,
                escalationTime: 3600000, // 1 hour
                ...alertData.escalation,
            },
            status: "new",
            metadata: {
                tags: alertData.metadata?.tags || [],
                priority: alertData.metadata?.priority || 5,
                confidence: alertData.metadata?.confidence || 0.8,
                falsePositive: false,
                relatedAlerts: alertData.metadata?.relatedAlerts || [],
            },
        };
        this.alertCache.set(alert.id, alert);
        this.alertHistory.push(alert);
        // Check for alert rules
        this.evaluateAlertRules(alert);
        // Start escalation timer
        this.startEscalationTimer(alert);
        this.emit("alert-created", alert);
        return alert;
    }
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = this.alertCache.get(alertId);
        if (alert && alert.status === "new") {
            alert.status = "acknowledged";
            alert.assignedTo = acknowledgedBy;
            // Clear escalation timer
            const timer = this.escalationTimers.get(alertId);
            if (timer) {
                clearTimeout(timer);
                this.escalationTimers.delete(alertId);
            }
            this.emit("alert-acknowledged", {
                alertId,
                acknowledgedBy,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Resolve an alert
     */
    resolveAlert(alertId, resolvedBy, resolution) {
        const alert = this.alertCache.get(alertId);
        if (alert && alert.status !== "resolved") {
            alert.status = "resolved";
            alert.resolvedAt = new Date().toISOString();
            alert.resolvedBy = resolvedBy;
            alert.resolution = resolution;
            // Clear escalation timer
            const timer = this.escalationTimers.get(alertId);
            if (timer) {
                clearTimeout(timer);
                this.escalationTimers.delete(alertId);
            }
            this.emit("alert-resolved", {
                alertId,
                resolvedBy,
                resolution,
                timestamp: alert.resolvedAt,
            });
        }
    }
    /**
     * Dismiss an alert
     */
    dismissAlert(alertId, dismissedBy, reason) {
        const alert = this.alertCache.get(alertId);
        if (alert && alert.status !== "dismissed") {
            alert.status = "dismissed";
            alert.resolvedAt = new Date().toISOString();
            alert.resolvedBy = dismissedBy;
            alert.resolution = `Dismissed: ${reason}`;
            // Clear escalation timer
            const timer = this.escalationTimers.get(alertId);
            if (timer) {
                clearTimeout(timer);
                this.escalationTimers.delete(alertId);
            }
            this.emit("alert-dismissed", {
                alertId,
                dismissedBy,
                reason,
                timestamp: alert.resolvedAt,
            });
        }
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.alertCache.values()).filter((alert) => alert.status !== "resolved" && alert.status !== "dismissed");
    }
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity) {
        return Array.from(this.alertCache.values()).filter((alert) => alert.severity === severity);
    }
    /**
     * Get alerts by category
     */
    getAlertsByCategory(category) {
        return Array.from(this.alertCache.values()).filter((alert) => alert.category === category);
    }
    /**
     * Get violation alert report
     */
    getViolationAlertReport() {
        const allAlerts = Array.from(this.alertCache.values());
        const activeAlerts = this.getActiveAlerts();
        const resolvedAlerts = allAlerts.filter((alert) => alert.status === "resolved");
        // Group alerts by type, severity, and category
        const alertsByType = {};
        const alertsBySeverity = {};
        const alertsByCategory = {};
        for (const alert of allAlerts) {
            alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
            alertsBySeverity[alert.severity] =
                (alertsBySeverity[alert.severity] || 0) + 1;
            alertsByCategory[alert.category] =
                (alertsByCategory[alert.category] || 0) + 1;
        }
        // Get top alerts
        const topAlerts = allAlerts
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10);
        // Calculate trends
        const alertTrends = this.calculateAlertTrends();
        // Calculate response metrics
        const responseMetrics = this.calculateResponseMetrics();
        // Generate recommendations
        const recommendations = this.generateRecommendations();
        return {
            totalAlerts: allAlerts.length,
            activeAlerts: activeAlerts.length,
            resolvedAlerts: resolvedAlerts.length,
            alertsByType,
            alertsBySeverity,
            alertsByCategory,
            topAlerts,
            alertTrends,
            responseMetrics,
            recommendations,
            lastUpdated: new Date().toISOString(),
        };
    }
    /**
     * Add alert rule
     */
    addAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        this.emit("rule-added", rule);
    }
    /**
     * Update alert rule
     */
    updateAlertRule(ruleId, updates) {
        const rule = this.alertRules.get(ruleId);
        if (rule) {
            Object.assign(rule, updates);
            rule.metadata.lastModified = new Date().toISOString();
            this.emit("rule-updated", rule);
        }
    }
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId) {
        const rule = this.alertRules.get(ruleId);
        if (rule) {
            this.alertRules.delete(ruleId);
            this.emit("rule-removed", rule);
        }
    }
    // Private methods
    setupEventListeners() {
        // Listen to architecture monitor events
        this.architectureMonitor.on("threshold-violation", (alert) => {
            this.createAlert({
                type: "compliance",
                severity: alert.severity,
                category: "modularity",
                title: alert.title,
                description: alert.description,
                source: "architecture-monitor",
                data: alert.data,
                actions: alert.actions,
            });
        });
        // Listen to performance monitor events
        this.performanceMonitor.on("threshold-violation", (alert) => {
            this.createAlert({
                type: "performance",
                severity: alert.severity,
                category: "performance",
                title: alert.title,
                description: alert.description,
                source: "performance-monitor",
                data: alert.data,
                actions: alert.actions,
            });
        });
        this.performanceMonitor.on("performance-regression", (alert) => {
            this.createAlert({
                type: "performance",
                severity: "high",
                category: "performance",
                title: alert.title,
                description: alert.description,
                source: "performance-monitor",
                data: alert.data,
                actions: alert.actions,
            });
        });
    }
    evaluateAlertRules(alert) {
        for (const rule of this.alertRules.values()) {
            if (!rule.enabled || rule.category !== alert.category)
                continue;
            let matches = true;
            for (const condition of rule.conditions) {
                if (!this.evaluateCondition(alert, condition)) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                this.executeAlertRule(alert, rule);
            }
        }
    }
    evaluateCondition(alert, condition) {
        const value = this.extractMetricValue(alert, condition.metric);
        switch (condition.operator) {
            case ">":
                return value > condition.value;
            case "<":
                return value < condition.value;
            case ">=":
                return value >= condition.value;
            case "<=":
                return value <= condition.value;
            case "==":
                return value === condition.value;
            case "!=":
                return value !== condition.value;
            case "contains":
                return String(value).includes(String(condition.value));
            case "regex":
                return new RegExp(condition.value).test(String(value));
            default:
                return false;
        }
    }
    extractMetricValue(alert, metric) {
        // Extract metric value from alert data
        const metricPath = metric.split(".");
        let value = alert.data;
        for (const key of metricPath) {
            if (value && typeof value === "object" && key in value) {
                value = value[key];
            }
            else {
                return null;
            }
        }
        return value;
    }
    executeAlertRule(alert, rule) {
        // Update alert severity if rule specifies higher severity
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        if (severityOrder[rule.severity] > severityOrder[alert.severity]) {
            alert.severity = rule.severity;
        }
        // Add rule tags
        alert.metadata.tags.push(...rule.metadata.tags);
        // Execute rule actions
        if (rule.actions.notify.length > 0) {
            this.queueNotifications(alert, rule.actions.notify);
        }
        if (rule.actions.escalate) {
            this.escalateAlert(alert);
        }
        if (rule.actions.autoResolve) {
            this.autoResolveAlert(alert);
        }
        if (rule.actions.suppress) {
            this.suppressAlert(alert);
        }
    }
    queueNotifications(alert, recipients) {
        for (const recipient of recipients) {
            const notification = {
                id: this.generateNotificationId(),
                alertId: alert.id,
                type: this.determineNotificationType(recipient),
                recipient,
                message: this.generateNotificationMessage(alert),
                sentAt: new Date().toISOString(),
                status: "pending",
                retryCount: 0,
                metadata: {},
            };
            this.notificationQueue.push(notification);
        }
    }
    determineNotificationType(recipient) {
        if (recipient.includes("@"))
            return "email";
        if (recipient.startsWith("#"))
            return "slack";
        if (recipient.startsWith("http"))
            return "webhook";
        return "dashboard";
    }
    generateNotificationMessage(alert) {
        return (`🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.title}\n\n` +
            `Description: ${alert.description}\n` +
            `Category: ${alert.category}\n` +
            `Source: ${alert.source}\n` +
            `Timestamp: ${alert.timestamp}\n\n` +
            `Immediate Actions:\n${alert.actions.immediate.map((action) => `• ${action}`).join("\n")}`);
    }
    escalateAlert(alert) {
        if (alert.escalation.level < alert.escalation.maxLevel) {
            alert.escalation.level++;
            alert.escalation.escalatedAt = new Date().toISOString();
            // Restart escalation timer
            this.startEscalationTimer(alert);
            this.emit("alert-escalated", {
                alertId: alert.id,
                level: alert.escalation.level,
            });
        }
    }
    autoResolveAlert(alert) {
        // Auto-resolve if it's a known false positive or low-impact issue
        if (alert.metadata.falsePositive || alert.impact.severity < 0.3) {
            this.resolveAlert(alert.id, "system", "Auto-resolved by rule");
        }
    }
    suppressAlert(alert) {
        alert.status = "dismissed";
        alert.resolution = "Suppressed by rule";
        // Clear escalation timer
        const timer = this.escalationTimers.get(alert.id);
        if (timer) {
            clearTimeout(timer);
            this.escalationTimers.delete(alert.id);
        }
    }
    startEscalationTimer(alert) {
        const timer = setTimeout(() => {
            this.escalateAlert(alert);
        }, alert.escalation.escalationTime);
        this.escalationTimers.set(alert.id, timer);
    }
    startNotificationProcessing() {
        this.notificationInterval = setInterval(() => {
            this.processNotificationQueue();
        }, 5000); // Process every 5 seconds
    }
    async processNotificationQueue() {
        const pendingNotifications = this.notificationQueue.filter((n) => n.status === "pending");
        for (const notification of pendingNotifications) {
            try {
                await this.sendNotification(notification);
                notification.status = "sent";
            }
            catch (error) {
                notification.retryCount++;
                if (notification.retryCount >= 3) {
                    notification.status = "failed";
                }
            }
        }
        // Remove processed notifications
        this.notificationQueue.splice(0, this.notificationQueue.length, ...this.notificationQueue.filter((n) => n.status === "pending"));
    }
    async sendNotification(notification) {
        // In a real implementation, this would send actual notifications
        console.log(`📧 Sending ${notification.type} notification to ${notification.recipient}: ${notification.message}`);
        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    calculateAlertTrends() {
        const now = new Date();
        const daily = [];
        const weekly = [];
        const monthly = [];
        // Calculate daily trends (last 7 days)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            const dayAlerts = this.alertHistory.filter((alert) => {
                const alertDate = new Date(alert.timestamp);
                return alertDate >= dayStart && alertDate < dayEnd;
            }).length;
            daily.push(dayAlerts);
        }
        // Calculate weekly trends (last 4 weeks)
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const weekAlerts = this.alertHistory.filter((alert) => {
                const alertDate = new Date(alert.timestamp);
                return alertDate >= weekStart && alertDate < weekEnd;
            }).length;
            weekly.push(weekAlerts);
        }
        // Calculate monthly trends (last 6 months)
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const monthAlerts = this.alertHistory.filter((alert) => {
                const alertDate = new Date(alert.timestamp);
                return alertDate >= monthStart && alertDate < monthEnd;
            }).length;
            monthly.push(monthAlerts);
        }
        return { daily, weekly, monthly };
    }
    calculateResponseMetrics() {
        const resolvedAlerts = this.alertHistory.filter((alert) => alert.status === "resolved" && alert.resolvedAt);
        if (resolvedAlerts.length === 0) {
            return {
                averageResponseTime: 0,
                averageResolutionTime: 0,
                resolutionRate: 0,
                falsePositiveRate: 0,
            };
        }
        // Calculate average response time (time from creation to acknowledgment)
        const responseTimes = resolvedAlerts
            .filter((alert) => alert.assignedTo)
            .map((alert) => {
            const created = new Date(alert.timestamp);
            const acknowledged = new Date(alert.resolvedAt);
            return acknowledged.getTime() - created.getTime();
        });
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) /
                responseTimes.length
            : 0;
        // Calculate average resolution time
        const resolutionTimes = resolvedAlerts.map((alert) => {
            const created = new Date(alert.timestamp);
            const resolved = new Date(alert.resolvedAt);
            return resolved.getTime() - created.getTime();
        });
        const averageResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) /
            resolutionTimes.length;
        // Calculate resolution rate
        const resolutionRate = resolvedAlerts.length / this.alertHistory.length;
        // Calculate false positive rate
        const falsePositives = this.alertHistory.filter((alert) => alert.metadata.falsePositive).length;
        const falsePositiveRate = falsePositives / this.alertHistory.length;
        return {
            averageResponseTime,
            averageResolutionTime,
            resolutionRate,
            falsePositiveRate,
        };
    }
    generateRecommendations() {
        const recommendations = [];
        const activeAlerts = this.getActiveAlerts();
        if (activeAlerts.length > 0) {
            recommendations.push(`🚨 Address ${activeAlerts.length} active alerts`);
        }
        const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical").length;
        if (criticalAlerts > 0) {
            recommendations.push(`⚠️ Fix ${criticalAlerts} critical alerts immediately`);
        }
        const highAlerts = activeAlerts.filter((alert) => alert.severity === "high").length;
        if (highAlerts > 0) {
            recommendations.push(`🔧 Resolve ${highAlerts} high-severity alerts`);
        }
        recommendations.push("📊 Monitor alert trends and patterns");
        recommendations.push("🔍 Review and optimize alert rules");
        recommendations.push("📈 Track alert response and resolution metrics");
        recommendations.push("🎯 Implement proactive alert prevention");
        return recommendations;
    }
    initializeDefaultRules() {
        // Critical severity rule
        this.addAlertRule({
            id: "critical-severity-rule",
            name: "Critical Severity Alert",
            description: "Alert for critical severity violations",
            category: "modularity",
            conditions: [
                {
                    metric: "severity",
                    operator: "==",
                    value: "critical",
                },
            ],
            severity: "critical",
            enabled: true,
            actions: {
                notify: ["admin@company.com", "#alerts"],
                escalate: true,
                autoResolve: false,
                suppress: false,
            },
            metadata: {
                createdBy: "system",
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                tags: ["critical", "escalation"],
            },
        });
        // High severity rule
        this.addAlertRule({
            id: "high-severity-rule",
            name: "High Severity Alert",
            description: "Alert for high severity violations",
            category: "modularity",
            conditions: [
                {
                    metric: "severity",
                    operator: "==",
                    value: "high",
                },
            ],
            severity: "high",
            enabled: true,
            actions: {
                notify: ["team@company.com"],
                escalate: false,
                autoResolve: false,
                suppress: false,
            },
            metadata: {
                createdBy: "system",
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                tags: ["high", "notification"],
            },
        });
    }
    generateAlertId() {
        return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateNotificationId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
