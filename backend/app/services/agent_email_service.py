"""
Agent Email Service for Reynard Backend.

This module provides agent-specific email functionality including
agent-to-agent communication, automated email generation, and
integration with the ECS world simulation.
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from ..models.agent_email_models import (
    AgentEmailConfig,
    AgentEmailInteraction,
    AgentEmailMessage,
    AgentEmailNotification,
    AgentEmailSettings,
    AgentEmailStats,
    AgentEmailTemplate,
    EventType,
)
from ..services.email_service import EmailAttachment, EmailMessage, email_service

logger = logging.getLogger(__name__)


class AgentEmailService:
    """Service for managing agent email functionality."""

    def __init__(self, data_dir: str = "data/agent_emails"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # File paths
        self.configs_file = self.data_dir / "configs.json"
        self.stats_file = self.data_dir / "stats.json"
        self.templates_file = self.data_dir / "templates.json"
        self.interactions_file = self.data_dir / "interactions.json"
        self.messages_file = self.data_dir / "messages.json"
        self.notifications_file = self.data_dir / "notifications.json"
        self.settings_file = self.data_dir / "settings.json"

        # In-memory caches
        self._configs: Dict[str, AgentEmailConfig] = {}
        self._stats: Dict[str, AgentEmailStats] = {}
        self._templates: Dict[str, List[AgentEmailTemplate]] = {}
        self._interactions: List[AgentEmailInteraction] = []
        self._messages: List[AgentEmailMessage] = []
        self._notifications: List[AgentEmailNotification] = []
        self._settings: Dict[str, AgentEmailSettings] = {}

        # Load data
        self._load_data()

    def _load_data(self) -> None:
        """Load data from files."""
        try:
            # Load configs
            if self.configs_file.exists():
                with open(self.configs_file, "r") as f:
                    data = json.load(f)
                    self._configs = {
                        agent_id: AgentEmailConfig(**config_data)
                        for agent_id, config_data in data.items()
                    }

            # Load stats
            if self.stats_file.exists():
                with open(self.stats_file, "r") as f:
                    data = json.load(f)
                    self._stats = {
                        agent_id: AgentEmailStats(**stats_data)
                        for agent_id, stats_data in data.items()
                    }

            # Load templates
            if self.templates_file.exists():
                with open(self.templates_file, "r") as f:
                    data = json.load(f)
                    self._templates = {
                        agent_id: [
                            AgentEmailTemplate(**template_data)
                            for template_data in templates_data
                        ]
                        for agent_id, templates_data in data.items()
                    }

            # Load interactions
            if self.interactions_file.exists():
                with open(self.interactions_file, "r") as f:
                    data = json.load(f)
                    self._interactions = [
                        AgentEmailInteraction(**interaction_data)
                        for interaction_data in data
                    ]

            # Load messages
            if self.messages_file.exists():
                with open(self.messages_file, "r") as f:
                    data = json.load(f)
                    self._messages = [
                        AgentEmailMessage(**message_data) for message_data in data
                    ]

            # Load notifications
            if self.notifications_file.exists():
                with open(self.notifications_file, "r") as f:
                    data = json.load(f)
                    self._notifications = [
                        AgentEmailNotification(**notification_data)
                        for notification_data in data
                    ]

            # Load settings
            if self.settings_file.exists():
                with open(self.settings_file, "r") as f:
                    data = json.load(f)
                    self._settings = {
                        agent_id: AgentEmailSettings(**settings_data)
                        for agent_id, settings_data in data.items()
                    }

            logger.info(
                f"Loaded agent email data: {len(self._configs)} configs, {len(self._stats)} stats"
            )

        except Exception as e:
            logger.error(f"Failed to load agent email data: {e}")

    def _save_data(self) -> None:
        """Save data to files."""
        try:
            # Save configs
            configs_data = {
                agent_id: config.dict() for agent_id, config in self._configs.items()
            }
            with open(self.configs_file, "w") as f:
                json.dump(configs_data, f, indent=2, default=str)

            # Save stats
            stats_data = {
                agent_id: stats.dict() for agent_id, stats in self._stats.items()
            }
            with open(self.stats_file, "w") as f:
                json.dump(stats_data, f, indent=2, default=str)

            # Save templates
            templates_data = {
                agent_id: [template.dict() for template in templates]
                for agent_id, templates in self._templates.items()
            }
            with open(self.templates_file, "w") as f:
                json.dump(templates_data, f, indent=2, default=str)

            # Save interactions
            interactions_data = [
                interaction.dict() for interaction in self._interactions
            ]
            with open(self.interactions_file, "w") as f:
                json.dump(interactions_data, f, indent=2, default=str)

            # Save messages
            messages_data = [message.dict() for message in self._messages]
            with open(self.messages_file, "w") as f:
                json.dump(messages_data, f, indent=2, default=str)

            # Save notifications
            notifications_data = [
                notification.dict() for notification in self._notifications
            ]
            with open(self.notifications_file, "w") as f:
                json.dump(notifications_data, f, indent=2, default=str)

            # Save settings
            settings_data = {
                agent_id: settings.dict()
                for agent_id, settings in self._settings.items()
            }
            with open(self.settings_file, "w") as f:
                json.dump(settings_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save agent email data: {e}")

    async def get_agent_config(self, agent_id: str) -> Optional[AgentEmailConfig]:
        """Get agent email configuration."""
        return self._configs.get(agent_id)

    async def update_agent_config(
        self, agent_id: str, config: AgentEmailConfig
    ) -> AgentEmailConfig:
        """Update agent email configuration."""
        config.updated_at = datetime.now()
        self._configs[agent_id] = config
        self._save_data()
        return config

    async def get_agent_stats(self, agent_id: str) -> Optional[AgentEmailStats]:
        """Get agent email statistics."""
        return self._stats.get(agent_id)

    async def update_agent_stats(
        self, agent_id: str, action: str, count: int = 1
    ) -> None:
        """Update agent email statistics."""
        if agent_id not in self._stats:
            self._stats[agent_id] = AgentEmailStats(
                agent_id=agent_id,
                total_sent=0,
                total_received=0,
                unread_count=0,
                active_conversations=0,
            )

        stats = self._stats[agent_id]

        if action == "sent":
            stats.total_sent += count
        elif action == "received":
            stats.total_received += count
            stats.unread_count += count
        elif action == "read":
            stats.unread_count = max(0, stats.unread_count - count)

        stats.last_activity = datetime.now()
        stats.updated_at = datetime.now()

        self._save_data()

    async def get_agent_templates(self, agent_id: str) -> List[AgentEmailTemplate]:
        """Get agent email templates."""
        return self._templates.get(agent_id, [])

    async def create_agent_template(
        self, agent_id: str, template: AgentEmailTemplate
    ) -> AgentEmailTemplate:
        """Create agent email template."""
        template.id = str(uuid.uuid4())
        template.agent_id = agent_id
        template.created_at = datetime.now()
        template.updated_at = datetime.now()

        if agent_id not in self._templates:
            self._templates[agent_id] = []

        self._templates[agent_id].append(template)
        self._save_data()
        return template

    async def delete_agent_template(self, agent_id: str, template_id: str) -> bool:
        """Delete agent email template."""
        if agent_id not in self._templates:
            return False

        original_count = len(self._templates[agent_id])
        self._templates[agent_id] = [
            template
            for template in self._templates[agent_id]
            if template.id != template_id
        ]

        deleted = len(self._templates[agent_id]) < original_count
        if deleted:
            self._save_data()

        return deleted

    async def log_agent_interaction(
        self,
        sender_agent_id: str,
        receiver_agent_id: str,
        interaction_type: str,
        metadata: Dict[str, Any],
    ) -> None:
        """Log agent email interaction."""
        interaction = AgentEmailInteraction(
            id=str(uuid.uuid4()),
            sender_agent_id=sender_agent_id,
            receiver_agent_id=receiver_agent_id,
            interaction_type=interaction_type,
            metadata=metadata,
        )

        self._interactions.append(interaction)
        self._save_data()

    async def get_agent_messages(
        self, agent_id: str, limit: int = 50, offset: int = 0
    ) -> List[AgentEmailMessage]:
        """Get agent email messages."""
        agent_messages = [
            message for message in self._messages if message.agent_id == agent_id
        ]

        # Sort by created_at descending
        agent_messages.sort(key=lambda x: x.created_at, reverse=True)

        return agent_messages[offset : offset + limit]

    async def get_agent_interactions(
        self, agent_id: str, limit: int = 50, offset: int = 0
    ) -> List[AgentEmailInteraction]:
        """Get agent email interactions."""
        agent_interactions = [
            interaction
            for interaction in self._interactions
            if interaction.sender_agent_id == agent_id
            or interaction.receiver_agent_id == agent_id
        ]

        # Sort by created_at descending
        agent_interactions.sort(key=lambda x: x.created_at, reverse=True)

        return agent_interactions[offset : offset + limit]

    async def process_automated_email(
        self, agent_id: str, event_type: str, context: Dict[str, Any]
    ) -> bool:
        """Process automated email for an agent."""
        try:
            # Get agent config
            config = await self.get_agent_config(agent_id)
            if not config:
                logger.warning(f"Agent {agent_id} not configured for email")
                return False

            # Get agent templates
            templates = await self.get_agent_templates(agent_id)

            # Find matching template
            matching_template = None
            for template in templates:
                if self._template_matches_conditions(template, event_type, context):
                    matching_template = template
                    break

            if not matching_template:
                logger.info(
                    f"No matching template found for agent {agent_id} and event {event_type}"
                )
                return False

            # Generate email content
            subject = self._process_template_variables(
                matching_template.subject, context
            )
            body = self._process_template_variables(matching_template.body, context)
            html_body = None
            if matching_template.html_body:
                html_body = self._process_template_variables(
                    matching_template.html_body, context
                )

            # Determine recipients
            recipients = self._determine_recipients(agent_id, event_type, context)

            if not recipients:
                logger.info(
                    f"No recipients found for agent {agent_id} and event {event_type}"
                )
                return False

            # Send email
            message = EmailMessage(
                to_emails=recipients,
                subject=subject,
                body=body,
                html_body=html_body,
            )

            result = await email_service.send_email(message)

            if result["success"]:
                # Log the interaction
                await self.log_agent_interaction(
                    agent_id,
                    "system",
                    "automated_email_sent",
                    {
                        "event_type": event_type,
                        "template_id": matching_template.id,
                        "recipients": recipients,
                        "message_id": result.get("message_id"),
                    },
                )

                # Update stats
                await self.update_agent_stats(agent_id, "sent")

                logger.info(
                    f"Automated email sent for agent {agent_id} and event {event_type}"
                )
                return True
            else:
                logger.error(
                    f"Failed to send automated email for agent {agent_id}: {result.get('error')}"
                )
                return False

        except Exception as e:
            logger.error(f"Failed to process automated email for agent {agent_id}: {e}")
            return False

    def _template_matches_conditions(
        self, template: AgentEmailTemplate, event_type: str, context: Dict[str, Any]
    ) -> bool:
        """Check if template matches trigger conditions."""
        conditions = template.trigger_conditions

        # Check event type
        if conditions.get("event_type") != event_type:
            return False

        # Check agent traits if specified
        if "agent_traits" in conditions:
            agent_traits = context.get("agent_traits", {})
            required_traits = conditions["agent_traits"]

            for trait_name, trait_value in required_traits.items():
                if agent_traits.get(trait_name) != trait_value:
                    return False

        # Check time conditions if specified
        if "time_conditions" in conditions:
            time_conditions = conditions["time_conditions"]
            now = datetime.now()

            if "time_of_day" in time_conditions:
                required_time = time_conditions["time_of_day"]
                current_time = now.strftime("%H:%M")
                if current_time != required_time:
                    return False

            if "day_of_week" in time_conditions:
                required_days = time_conditions["day_of_week"]
                current_day = now.strftime("%A").lower()
                if current_day not in required_days:
                    return False

        return True

    def _process_template_variables(
        self, template: str, context: Dict[str, Any]
    ) -> str:
        """Process template variables."""
        processed = template

        for key, value in context.items():
            placeholder = f"{{{key}}}"
            processed = processed.replace(placeholder, str(value))

        return processed

    def _determine_recipients(
        self, agent_id: str, event_type: str, context: Dict[str, Any]
    ) -> List[str]:
        """Determine email recipients based on event type and context."""
        recipients = []

        if event_type == "agent_interaction":
            # Send to the interacting agent
            target_agent_id = context.get("target_agent_id")
            if target_agent_id:
                target_config = self._configs.get(target_agent_id)
                if target_config:
                    recipients.append(target_config.agent_email)

        elif event_type == "system_alert":
            # Send to system administrators or specific agents
            alert_recipients = context.get("recipients", [])
            recipients.extend(alert_recipients)

        elif event_type == "scheduled":
            # Send to configured recipients
            scheduled_recipients = context.get("recipients", [])
            recipients.extend(scheduled_recipients)

        return recipients

    async def create_agent_notification(
        self,
        agent_id: str,
        notification_type: str,
        title: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentEmailNotification:
        """Create agent email notification."""
        notification = AgentEmailNotification(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            notification_type=notification_type,
            title=title,
            message=message,
            metadata=metadata or {},
        )

        self._notifications.append(notification)
        self._save_data()

        return notification

    async def get_agent_notifications(
        self, agent_id: str, unread_only: bool = False, limit: int = 50
    ) -> List[AgentEmailNotification]:
        """Get agent email notifications."""
        notifications = [
            notification
            for notification in self._notifications
            if notification.agent_id == agent_id
        ]

        if unread_only:
            notifications = [n for n in notifications if not n.read]

        # Sort by created_at descending
        notifications.sort(key=lambda x: x.created_at, reverse=True)

        return notifications[:limit]

    async def mark_notification_read(self, notification_id: str) -> bool:
        """Mark notification as read."""
        for notification in self._notifications:
            if notification.id == notification_id:
                notification.read = True
                self._save_data()
                return True

        return False

    async def get_agent_settings(self, agent_id: str) -> Optional[AgentEmailSettings]:
        """Get agent email settings."""
        return self._settings.get(agent_id)

    async def update_agent_settings(
        self, agent_id: str, settings: AgentEmailSettings
    ) -> AgentEmailSettings:
        """Update agent email settings."""
        settings.agent_id = agent_id
        settings.updated_at = datetime.now()
        self._settings[agent_id] = settings
        self._save_data()
        return settings


# Global agent email service instance
agent_email_service = AgentEmailService()
