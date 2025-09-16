#!/usr/bin/env python3
"""
ECS Notification Handler
========================

Notification system for ECS events using notify-send and other methods.
Provides desktop notifications for breeding events and other important ECS activities.

Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from .event_system import ECSEvent, ECSEventType

logger = logging.getLogger(__name__)


class ECSNotificationHandler:
    """Handles notifications for ECS events."""

    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Notification settings
        self.enabled = True
        self.notification_timeout = 5000  # 5 seconds
        self.urgency_levels = {
            ECSEventType.AGENT_CREATED: "normal",
            ECSEventType.AGENT_DIED: "normal",
            ECSEventType.AGENT_MATURED: "low",
            ECSEventType.BREEDING_ATTEMPTED: "low",
            ECSEventType.BREEDING_SUCCESSFUL: "normal",
            ECSEventType.BREEDING_FAILED: "low",
            ECSEventType.OFFSPRING_CREATED: "normal",
            ECSEventType.LINEAGE_UPDATED: "low",
            ECSEventType.SIMULATION_UPDATED: "low",
            ECSEventType.TIME_ACCELERATED: "low",
            ECSEventType.WORLD_SAVED: "low",
            ECSEventType.WORLD_LOADED: "low",
        }

        # Notification history
        self.notification_history_file = self.data_dir / "notification_history.json"
        self.notification_history: List[Dict[str, Any]] = []
        self._load_notification_history()

        logger.info("ECS Notification Handler initialized")

    def _load_notification_history(self) -> None:
        """Load notification history from storage."""
        if self.notification_history_file.exists():
            try:
                with open(self.notification_history_file) as f:
                    self.notification_history = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load notification history: {e}")

    def _save_notification_history(self) -> None:
        """Save notification history to storage."""
        try:
            with open(self.notification_history_file, "w") as f:
                json.dump(self.notification_history, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save notification history: {e}")

    def _send_notification(
        self,
        title: str,
        message: str,
        urgency: str = "normal",
        icon: str = "dialog-information",
    ) -> bool:
        """Send desktop notification using notify-send."""
        if not self.enabled:
            return False

        try:
            cmd = [
                "notify-send",
                f"--urgency={urgency}",
                f"--expire-time={self.notification_timeout}",
                f"--icon={icon}",
                title,
                message,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)

            # Record notification
            notification_record = {
                "timestamp": datetime.now().isoformat(),
                "title": title,
                "message": message,
                "urgency": urgency,
                "icon": icon,
                "success": result.returncode == 0,
            }
            self.notification_history.append(notification_record)
            self._save_notification_history()

            if result.returncode == 0:
                logger.debug(f"Notification sent: {title}")
                return True
            else:
                logger.warning(f"Notification failed: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            logger.error("Notification command timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False

    def handle_event(self, event: ECSEvent) -> None:
        """Handle ECS event and send appropriate notification."""
        if not self.enabled:
            return

        # Get urgency level
        urgency = self.urgency_levels.get(event.event_type, "normal")

        # Generate notification based on event type
        if event.event_type == ECSEventType.AGENT_CREATED:
            self._handle_agent_created(event, urgency)
        elif event.event_type == ECSEventType.BREEDING_SUCCESSFUL:
            self._handle_breeding_successful(event, urgency)
        elif event.event_type == ECSEventType.OFFSPRING_CREATED:
            self._handle_offspring_created(event, urgency)
        elif event.event_type == ECSEventType.AGENT_DIED:
            self._handle_agent_died(event, urgency)
        elif event.event_type == ECSEventType.AGENT_MATURED:
            self._handle_agent_matured(event, urgency)
        elif event.event_type == ECSEventType.TIME_ACCELERATED:
            self._handle_time_accelerated(event, urgency)
        else:
            # Generic notification for other events
            self._send_notification(
                f"ECS Event: {event.event_type.value.replace('_', ' ').title()}",
                f"Event occurred for agent: {event.agent_id or 'System'}",
                urgency,
                "dialog-information",
            )

    def _handle_agent_created(self, event: ECSEvent, urgency: str) -> None:
        """Handle agent created event."""
        is_offspring = event.data and event.data.get("is_offspring", False)
        spirit = event.data.get("spirit", "unknown") if event.data else "unknown"
        name = event.data.get("name", event.agent_id) if event.data else event.agent_id

        if is_offspring:
            title = "🦊 New Offspring Created!"
            message = f"{name} ({spirit}) was born from parents {event.parent1_id} and {event.parent2_id}"
            icon = "emblem-favorite"
        else:
            title = "🦊 New Agent Created!"
            message = f"{name} ({spirit}) has joined the simulation"
            icon = "user-new"

        self._send_notification(title, message, urgency, icon)

    def _handle_breeding_successful(self, event: ECSEvent, urgency: str) -> None:
        """Handle successful breeding event."""
        title = "💕 Breeding Successful!"
        message = f"Agents {event.parent1_id} and {event.parent2_id} successfully bred"
        self._send_notification(title, message, urgency, "emblem-favorite")

    def _handle_offspring_created(self, event: ECSEvent, urgency: str) -> None:
        """Handle offspring created event."""
        title = "👶 New Offspring!"
        message = f"Offspring {event.offspring_id} created from {event.parent1_id} and {event.parent2_id}"
        self._send_notification(title, message, urgency, "emblem-favorite")

    def _handle_agent_died(self, event: ECSEvent, urgency: str) -> None:
        """Handle agent death event."""
        title = "💀 Agent Died"
        message = f"Agent {event.agent_id} has passed away"
        self._send_notification(title, message, urgency, "dialog-warning")

    def _handle_agent_matured(self, event: ECSEvent, urgency: str) -> None:
        """Handle agent maturation event."""
        title = "🎂 Agent Matured"
        message = f"Agent {event.agent_id} has reached maturity and can now breed"
        self._send_notification(title, message, urgency, "emblem-important")

    def _handle_time_accelerated(self, event: ECSEvent, urgency: str) -> None:
        """Handle time acceleration event."""
        if event.data:
            old_factor = event.data.get("old_factor", 1.0)
            new_factor = event.data.get("new_factor", 1.0)
            title = "⏰ Time Acceleration Changed"
            message = f"Simulation speed changed from {old_factor}x to {new_factor}x"
            self._send_notification(title, message, urgency, "preferences-system-time")

    def enable_notifications(self) -> None:
        """Enable notifications."""
        self.enabled = True
        logger.info("Notifications enabled")

    def disable_notifications(self) -> None:
        """Disable notifications."""
        self.enabled = False
        logger.info("Notifications disabled")

    def set_notification_timeout(self, timeout_ms: int) -> None:
        """Set notification timeout in milliseconds."""
        self.notification_timeout = timeout_ms
        logger.info(f"Notification timeout set to {timeout_ms}ms")

    def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics."""
        total_notifications = len(self.notification_history)
        successful_notifications = len(
            [n for n in self.notification_history if n.get("success", False)]
        )

        return {
            "enabled": self.enabled,
            "total_notifications": total_notifications,
            "successful_notifications": successful_notifications,
            "success_rate": successful_notifications / total_notifications
            if total_notifications > 0
            else 0,
            "timeout_ms": self.notification_timeout,
        }

    def clear_notification_history(self) -> None:
        """Clear notification history."""
        self.notification_history.clear()
        self._save_notification_history()
        logger.info("Notification history cleared")
