"""Health Check Automation System for Reynard Backend

This module provides automated health check scheduling, alerting,
and response mechanisms for proactive service monitoring.
"""

import asyncio
import logging
import time
from collections.abc import Callable
from dataclasses import dataclass
from enum import Enum
from typing import Any

from .health_checks import HealthCheckManager, HealthStatus, get_health_check_manager

logger = logging.getLogger(__name__)


class AlertLevel(Enum):
    """Alert severity levels."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AutomationAction(Enum):
    """Automated response actions."""

    RESTART_SERVICE = "restart_service"
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    NOTIFY_ADMIN = "notify_admin"
    SWITCH_TO_BACKUP = "switch_to_backup"
    ISOLATE_SERVICE = "isolate_service"


@dataclass
class HealthAlert:
    """Health alert configuration."""

    service_name: str
    condition: str
    threshold: float
    duration: float  # seconds
    alert_level: AlertLevel
    action: AutomationAction
    enabled: bool = True
    last_triggered: float = 0.0
    trigger_count: int = 0


@dataclass
class AutomationRule:
    """Automation rule configuration."""

    name: str
    description: str
    conditions: list[str]
    actions: list[AutomationAction]
    cooldown: float = 300.0  # 5 minutes
    enabled: bool = True
    last_executed: float = 0.0
    execution_count: int = 0


class HealthCheckAutomation:
    """Automated health check monitoring and response system.

    Provides:
    - Automated health check scheduling
    - Intelligent alerting based on patterns
    - Automated response actions
    - Health trend analysis
    - Predictive failure prevention
    """

    def __init__(self, health_manager: HealthCheckManager | None = None):
        self.health_manager = health_manager or get_health_check_manager()

        # Automation configuration
        self.alerts: dict[str, HealthAlert] = {}
        self.rules: dict[str, AutomationRule] = {}
        self.action_handlers: dict[AutomationAction, Callable] = {}

        # Automation state
        self.automation_tasks: dict[str, asyncio.Task] = {}
        self.alert_history: list[dict[str, Any]] = []
        self.rule_history: list[dict[str, Any]] = []

        # Configuration
        self.check_interval = 30.0  # seconds
        self.alert_cooldown = 60.0  # seconds
        self.max_history_size = 1000

        # Initialize default alerts and rules
        self._setup_default_alerts()
        self._setup_default_rules()
        self._setup_action_handlers()

        logger.info("HealthCheckAutomation initialized with comprehensive monitoring")

    def _setup_default_alerts(self) -> None:
        """Setup default health alerts."""
        # High error rate alert
        self.add_alert(
            HealthAlert(
                service_name="*",  # All services
                condition="error_count > 10",
                threshold=10.0,
                duration=60.0,
                alert_level=AlertLevel.WARNING,
                action=AutomationAction.NOTIFY_ADMIN,
            ),
        )

        # High response time alert
        self.add_alert(
            HealthAlert(
                service_name="*",
                condition="response_time > 5.0",
                threshold=5.0,
                duration=120.0,
                alert_level=AlertLevel.WARNING,
                action=AutomationAction.NOTIFY_ADMIN,
            ),
        )

        # Service down alert
        self.add_alert(
            HealthAlert(
                service_name="*",
                condition="status == 'unhealthy'",
                threshold=1.0,
                duration=30.0,
                alert_level=AlertLevel.CRITICAL,
                action=AutomationAction.RESTART_SERVICE,
            ),
        )

        # High memory usage alert
        self.add_alert(
            HealthAlert(
                service_name="*",
                condition="memory_usage > 0.8",
                threshold=0.8,
                duration=180.0,
                alert_level=AlertLevel.WARNING,
                action=AutomationAction.SCALE_UP,
            ),
        )

        # High CPU usage alert
        self.add_alert(
            HealthAlert(
                service_name="*",
                condition="cpu_usage > 0.9",
                threshold=0.9,
                duration=120.0,
                alert_level=AlertLevel.ERROR,
                action=AutomationAction.SCALE_UP,
            ),
        )

    def _setup_default_rules(self) -> None:
        """Setup default automation rules."""
        # Service recovery rule
        self.add_rule(
            AutomationRule(
                name="service_recovery",
                description="Automatically restart failed services",
                conditions=["status == 'unhealthy'", "error_count > 5"],
                actions=[
                    AutomationAction.RESTART_SERVICE,
                    AutomationAction.NOTIFY_ADMIN,
                ],
                cooldown=300.0,
            ),
        )

        # Performance degradation rule
        self.add_rule(
            AutomationRule(
                name="performance_degradation",
                description="Scale up services with performance issues",
                conditions=["response_time > 3.0", "memory_usage > 0.7"],
                actions=[AutomationAction.SCALE_UP, AutomationAction.NOTIFY_ADMIN],
                cooldown=600.0,
            ),
        )

        # Resource optimization rule
        self.add_rule(
            AutomationRule(
                name="resource_optimization",
                description="Scale down underutilized services",
                conditions=[
                    "cpu_usage < 0.2",
                    "memory_usage < 0.3",
                    "response_time < 1.0",
                ],
                actions=[AutomationAction.SCALE_DOWN],
                cooldown=1800.0,  # 30 minutes
            ),
        )

    def _setup_action_handlers(self) -> None:
        """Setup action handlers for automation."""
        self.action_handlers[AutomationAction.RESTART_SERVICE] = (
            self._handle_restart_service
        )
        self.action_handlers[AutomationAction.SCALE_UP] = self._handle_scale_up
        self.action_handlers[AutomationAction.SCALE_DOWN] = self._handle_scale_down
        self.action_handlers[AutomationAction.NOTIFY_ADMIN] = self._handle_notify_admin
        self.action_handlers[AutomationAction.SWITCH_TO_BACKUP] = (
            self._handle_switch_to_backup
        )
        self.action_handlers[AutomationAction.ISOLATE_SERVICE] = (
            self._handle_isolate_service
        )

    async def start_automation(self) -> None:
        """Start health check automation."""
        logger.info("🤖 Starting health check automation...")

        # Start alert monitoring
        self.automation_tasks["alert_monitor"] = asyncio.create_task(
            self._alert_monitoring_loop(),
        )

        # Start rule evaluation
        self.automation_tasks["rule_evaluator"] = asyncio.create_task(
            self._rule_evaluation_loop(),
        )

        # Start trend analysis
        self.automation_tasks["trend_analyzer"] = asyncio.create_task(
            self._trend_analysis_loop(),
        )

        logger.info("✅ Health check automation started")

    async def stop_automation(self) -> None:
        """Stop health check automation."""
        logger.info("🛑 Stopping health check automation...")

        # Cancel all automation tasks
        for task in self.automation_tasks.values():
            task.cancel()

        # Wait for tasks to complete
        if self.automation_tasks:
            await asyncio.gather(
                *self.automation_tasks.values(),
                return_exceptions=True,
            )

        self.automation_tasks.clear()
        logger.info("✅ Health check automation stopped")

    async def _alert_monitoring_loop(self) -> None:
        """Monitor health alerts continuously."""
        while True:
            try:
                await self._check_alerts()
                await asyncio.sleep(self.check_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Alert monitoring error: {e}")
                await asyncio.sleep(self.check_interval)

    async def _rule_evaluation_loop(self) -> None:
        """Evaluate automation rules continuously."""
        while True:
            try:
                await self._evaluate_rules()
                await asyncio.sleep(
                    self.check_interval * 2,
                )  # Check rules less frequently
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Rule evaluation error: {e}")
                await asyncio.sleep(self.check_interval * 2)

    async def _trend_analysis_loop(self) -> None:
        """Analyze health trends continuously."""
        while True:
            try:
                await self._analyze_health_trends()
                await asyncio.sleep(
                    self.check_interval * 5,
                )  # Analyze trends less frequently
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Trend analysis error: {e}")
                await asyncio.sleep(self.check_interval * 5)

    async def _check_alerts(self) -> None:
        """Check all configured alerts."""
        current_time = time.time()
        all_health = self.health_manager.get_all_health_status()

        for alert_id, alert in self.alerts.items():
            if not alert.enabled:
                continue

            # Check cooldown
            if current_time - alert.last_triggered < self.alert_cooldown:
                continue

            # Check alert condition for each service
            for service_name, health_result in all_health.items():
                if alert.service_name != "*" and alert.service_name != service_name:
                    continue

                if self._evaluate_alert_condition(alert, health_result):
                    await self._trigger_alert(
                        alert_id,
                        alert,
                        service_name,
                        health_result,
                    )

    def _evaluate_alert_condition(self, alert: HealthAlert, health_result: Any) -> bool:
        """Evaluate if an alert condition is met."""
        try:
            # Simple condition evaluation (can be extended with more complex logic)
            if alert.condition == "error_count > 10":
                return len(health_result.errors) > alert.threshold
            if alert.condition == "response_time > 5.0":
                return health_result.response_time > alert.threshold
            if alert.condition == "status == 'unhealthy'":
                return health_result.status == HealthStatus.UNHEALTHY
            if alert.condition == "memory_usage > 0.8":
                metrics = health_result.metrics
                return metrics.get("memory_usage", 0) > alert.threshold
            if alert.condition == "cpu_usage > 0.9":
                metrics = health_result.metrics
                return metrics.get("cpu_usage", 0) > alert.threshold

            return False
        except Exception as e:
            logger.error(f"Error evaluating alert condition: {e}")
            return False

    async def _trigger_alert(
        self,
        alert_id: str,
        alert: HealthAlert,
        service_name: str,
        health_result: Any,
    ) -> None:
        """Trigger an alert and execute associated action."""
        current_time = time.time()

        # Update alert state
        alert.last_triggered = current_time
        alert.trigger_count += 1

        # Log alert
        alert_data = {
            "alert_id": alert_id,
            "service_name": service_name,
            "condition": alert.condition,
            "threshold": alert.threshold,
            "alert_level": alert.alert_level.value,
            "action": alert.action.value,
            "timestamp": current_time,
            "health_status": health_result.status.value,
            "trigger_count": alert.trigger_count,
        }

        self.alert_history.append(alert_data)
        self._trim_history(self.alert_history)

        # Log alert
        log_level = {
            AlertLevel.INFO: logger.info,
            AlertLevel.WARNING: logger.warning,
            AlertLevel.ERROR: logger.error,
            AlertLevel.CRITICAL: logger.critical,
        }

        log_level[alert.alert_level](
            f"🚨 Alert triggered: {alert.condition} for service {service_name} "
            f"(level: {alert.alert_level.value}, action: {alert.action.value})",
        )

        # Execute action
        await self._execute_action(alert.action, service_name, health_result)

    async def _evaluate_rules(self) -> None:
        """Evaluate all automation rules."""
        current_time = time.time()
        all_health = self.health_manager.get_all_health_status()

        for rule_id, rule in self.rules.items():
            if not rule.enabled:
                continue

            # Check cooldown
            if current_time - rule.last_executed < rule.cooldown:
                continue

            # Evaluate rule conditions
            if self._evaluate_rule_conditions(rule, all_health):
                await self._execute_rule(rule_id, rule, all_health)

    def _evaluate_rule_conditions(
        self,
        rule: AutomationRule,
        all_health: dict[str, Any],
    ) -> bool:
        """Evaluate if all rule conditions are met."""
        try:
            for condition in rule.conditions:
                if not self._evaluate_condition(condition, all_health):
                    return False
            return True
        except Exception as e:
            logger.error(f"Error evaluating rule conditions: {e}")
            return False

    def _evaluate_condition(self, condition: str, all_health: dict[str, Any]) -> bool:
        """Evaluate a single condition against all health data."""
        try:
            # Simple condition evaluation (can be extended)
            if "status == 'unhealthy'" in condition:
                return any(
                    h.status == HealthStatus.UNHEALTHY for h in all_health.values()
                )
            if "error_count > 5" in condition:
                return any(len(h.errors) > 5 for h in all_health.values())
            if "response_time > 3.0" in condition:
                return any(h.response_time > 3.0 for h in all_health.values())
            if "memory_usage > 0.7" in condition:
                return any(
                    h.metrics.get("memory_usage", 0) > 0.7 for h in all_health.values()
                )
            if "cpu_usage < 0.2" in condition:
                return all(
                    h.metrics.get("cpu_usage", 0) < 0.2 for h in all_health.values()
                )
            if "memory_usage < 0.3" in condition:
                return all(
                    h.metrics.get("memory_usage", 0) < 0.3 for h in all_health.values()
                )
            if "response_time < 1.0" in condition:
                return all(h.response_time < 1.0 for h in all_health.values())

            return False
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False

    async def _execute_rule(
        self,
        rule_id: str,
        rule: AutomationRule,
        all_health: dict[str, Any],
    ) -> None:
        """Execute a rule and its associated actions."""
        current_time = time.time()

        # Update rule state
        rule.last_executed = current_time
        rule.execution_count += 1

        # Log rule execution
        rule_data = {
            "rule_id": rule_id,
            "rule_name": rule.name,
            "description": rule.description,
            "conditions": rule.conditions,
            "actions": [action.value for action in rule.actions],
            "timestamp": current_time,
            "execution_count": rule.execution_count,
        }

        self.rule_history.append(rule_data)
        self._trim_history(self.rule_history)

        logger.info(
            f"🤖 Rule executed: {rule.name} (execution #{rule.execution_count})",
        )

        # Execute all actions
        for action in rule.actions:
            await self._execute_action(action, "*", None)  # Global action

    async def _execute_action(
        self,
        action: AutomationAction,
        service_name: str,
        health_result: Any,
    ) -> None:
        """Execute an automation action."""
        try:
            handler = self.action_handlers.get(action)
            if handler:
                await handler(service_name, health_result)
            else:
                logger.warning(f"No handler found for action: {action.value}")
        except Exception as e:
            logger.error(f"Error executing action {action.value}: {e}")

    async def _handle_restart_service(
        self,
        service_name: str,
        health_result: Any,
    ) -> None:
        """Handle service restart action."""
        if service_name == "*":
            logger.info("🔄 Restarting all unhealthy services...")
            # Restart all unhealthy services
            all_health = self.health_manager.get_all_health_status()
            for name, result in all_health.items():
                if result.status == HealthStatus.UNHEALTHY:
                    logger.info(f"🔄 Restarting service: {name}")
                    # Implementation would restart the service
        else:
            logger.info(f"🔄 Restarting service: {service_name}")
            # Implementation would restart the specific service

    async def _handle_scale_up(self, service_name: str, health_result: Any) -> None:
        """Handle service scale up action."""
        if service_name == "*":
            logger.info("📈 Scaling up services with performance issues...")
        else:
            logger.info(f"📈 Scaling up service: {service_name}")

    async def _handle_scale_down(self, service_name: str, health_result: Any) -> None:
        """Handle service scale down action."""
        if service_name == "*":
            logger.info("📉 Scaling down underutilized services...")
        else:
            logger.info(f"📉 Scaling down service: {service_name}")

    async def _handle_notify_admin(self, service_name: str, health_result: Any) -> None:
        """Handle admin notification action."""
        logger.info(f"📧 Notifying admin about service: {service_name}")

    async def _handle_switch_to_backup(
        self,
        service_name: str,
        health_result: Any,
    ) -> None:
        """Handle switch to backup action."""
        logger.info(f"🔄 Switching to backup for service: {service_name}")

    async def _handle_isolate_service(
        self,
        service_name: str,
        health_result: Any,
    ) -> None:
        """Handle service isolation action."""
        logger.info(f"🔒 Isolating service: {service_name}")

    async def _analyze_health_trends(self) -> None:
        """Analyze health trends and predict potential issues."""
        try:
            # Get health history
            health_history = self.health_manager.health_history

            for service_name, history in health_history.items():
                if len(history) < 10:  # Need sufficient data
                    continue

                # Analyze trends
                recent_statuses = [h.status for h in history[-10:]]
                recent_response_times = [h.response_time for h in history[-10:]]

                # Check for degrading trends
                degraded_count = recent_statuses.count(HealthStatus.DEGRADED)
                if degraded_count >= 5:
                    logger.warning(
                        f"📊 Trend analysis: Service {service_name} showing degrading trend",
                    )

                # Check for increasing response times
                if len(recent_response_times) >= 5:
                    avg_early = sum(recent_response_times[:5]) / 5
                    avg_late = sum(recent_response_times[-5:]) / 5
                    if avg_late > avg_early * 1.5:
                        logger.warning(
                            f"📊 Trend analysis: Service {service_name} response time increasing",
                        )

        except Exception as e:
            logger.error(f"Error in trend analysis: {e}")

    def _trim_history(self, history: list[dict[str, Any]]) -> None:
        """Trim history to maximum size."""
        if len(history) > self.max_history_size:
            history[:] = history[-self.max_history_size :]

    def add_alert(self, alert: HealthAlert) -> str:
        """Add a new health alert."""
        alert_id = f"alert_{len(self.alerts) + 1}"
        self.alerts[alert_id] = alert
        logger.info(f"Added alert: {alert.condition} for service {alert.service_name}")
        return alert_id

    def add_rule(self, rule: AutomationRule) -> str:
        """Add a new automation rule."""
        rule_id = f"rule_{len(self.rules) + 1}"
        self.rules[rule_id] = rule
        logger.info(f"Added rule: {rule.name}")
        return rule_id

    def remove_alert(self, alert_id: str) -> bool:
        """Remove a health alert."""
        if alert_id in self.alerts:
            del self.alerts[alert_id]
            logger.info(f"Removed alert: {alert_id}")
            return True
        return False

    def remove_rule(self, rule_id: str) -> bool:
        """Remove an automation rule."""
        if rule_id in self.rules:
            del self.rules[rule_id]
            logger.info(f"Removed rule: {rule_id}")
            return True
        return False

    def get_automation_status(self) -> dict[str, Any]:
        """Get automation system status."""
        return {
            "automation_running": len(self.automation_tasks) > 0,
            "active_tasks": list(self.automation_tasks.keys()),
            "alerts": {
                "total": len(self.alerts),
                "enabled": len([a for a in self.alerts.values() if a.enabled]),
                "triggered": len(
                    [a for a in self.alerts.values() if a.trigger_count > 0],
                ),
            },
            "rules": {
                "total": len(self.rules),
                "enabled": len([r for r in self.rules.values() if r.enabled]),
                "executed": len(
                    [r for r in self.rules.values() if r.execution_count > 0],
                ),
            },
            "history": {
                "alerts": len(self.alert_history),
                "rules": len(self.rule_history),
            },
        }


# Global automation instance
_automation: HealthCheckAutomation | None = None


def get_health_automation() -> HealthCheckAutomation:
    """Get the global health check automation instance."""
    global _automation
    if _automation is None:
        _automation = HealthCheckAutomation()
    return _automation


async def start_health_automation() -> None:
    """Start health check automation."""
    automation = get_health_automation()
    await automation.start_automation()


async def stop_health_automation() -> None:
    """Stop health check automation."""
    automation = get_health_automation()
    await automation.stop_automation()
