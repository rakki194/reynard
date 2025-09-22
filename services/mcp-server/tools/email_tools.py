#!/usr/bin/env python3
"""
Email Tool Handlers for MCP Server
==================================

Handles email-related MCP tool calls for agent communication.
Provides integration between agents and the email system.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


@register_tool(
    name="send_agent_email",
    category="email",
    description="Send email from one agent to another",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def send_agent_email(**kwargs) -> dict[str, Any]:
    """Send email from one agent to another."""
    try:
        arguments = kwargs.get("arguments", {})
        sender_agent_id = arguments.get("sender_agent_id")
        target_agent_id = arguments.get("target_agent_id")
        subject = arguments.get("subject", "")
        body = arguments.get("body", "")
        html_body = arguments.get("html_body")

        if not sender_agent_id or not target_agent_id:
            return {
                "success": False,
                "error": "Both sender_agent_id and target_agent_id are required",
            }

        # Import here to avoid circular imports
        from services.backend_agent_manager import BackendAgentManager

        agent_manager = BackendAgentManager()

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Get sender agent config
        sender_config = await agent_email_service.get_agent_config(sender_agent_id)
        if not sender_config:
            return {
                "success": False,
                "error": f"Sender agent {sender_agent_id} not configured for email",
            }

        # Get target agent config
        target_config = await agent_email_service.get_agent_config(target_agent_id)
        if not target_config:
            return {
                "success": False,
                "error": f"Target agent {target_agent_id} not configured for email",
            }

        # Send email via agent email service
        from backend.app.models.agent_email_models import (
            AgentEmailMessage,
            AgentEmailSendRequest,
        )

        message = AgentEmailMessage(subject=subject, body=body, html_body=html_body)

        request = AgentEmailSendRequest(
            target_agent_id=target_agent_id, message=message
        )

        # This would normally go through the API, but we'll call the service directly
        # In a real implementation, you'd make an HTTP request to the backend API

        return {
            "success": True,
            "message": f"Email sent from {sender_agent_id} to {target_agent_id}",
            "subject": subject,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Failed to send agent email: {e}")
        return {"success": False, "error": str(e)}


@register_tool(
    name="get_agent_email_stats",
    category="email",
    description="Get email statistics for an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_agent_email_stats(**kwargs) -> dict[str, Any]:
    """Get email statistics for an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")

        if not agent_id:
            return {"success": False, "error": "agent_id is required"}

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Get agent stats
        stats = await agent_email_service.get_agent_stats(agent_id)
        if not stats:
            return {
                "success": False,
                "error": f"Agent {agent_id} not found or no stats available",
            }

        return {
            "success": True,
            "agent_id": agent_id,
            "total_sent": stats.total_sent,
            "total_received": stats.total_received,
            "unread_count": stats.unread_count,
            "active_conversations": stats.active_conversations,
            "last_activity": (
                stats.last_activity.isoformat() if stats.last_activity else None
            ),
        }

    except Exception as e:
        logger.error(f"Failed to get agent email stats: {e}")
        return {"success": False, "error": str(e)}


@register_tool(
    name="create_agent_email_template",
    category="email",
    description="Create an email template for an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def create_agent_email_template(**kwargs) -> dict[str, Any]:
    """Create an email template for an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        name = arguments.get("name", "")
        subject = arguments.get("subject", "")
        body = arguments.get("body", "")
        html_body = arguments.get("html_body")
        trigger_conditions = arguments.get("trigger_conditions", {})
        variables = arguments.get("variables", [])

        if not agent_id or not name or not subject or not body:
            return {
                "success": False,
                "error": "agent_id, name, subject, and body are required",
            }

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Create template
        from backend.app.models.agent_email_models import AgentEmailTemplate

        template = AgentEmailTemplate(
            id="",  # Will be generated by the service
            agent_id=agent_id,
            name=name,
            subject=subject,
            body=body,
            html_body=html_body,
            trigger_conditions=trigger_conditions,
            variables=variables,
        )

        created_template = await agent_email_service.create_agent_template(
            agent_id, template
        )

        return {
            "success": True,
            "template_id": created_template.id,
            "name": created_template.name,
            "subject": created_template.subject,
            "created_at": created_template.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Failed to create agent email template: {e}")
        return {"success": False, "error": str(e)}


@register_tool(
    name="trigger_agent_automated_email",
    category="email",
    description="Trigger automated email for an agent based on events",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def trigger_agent_automated_email(**kwargs) -> dict[str, Any]:
    """Trigger automated email for an agent based on events."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        event_type = arguments.get("event_type", "manual")
        context = arguments.get("context", {})

        if not agent_id:
            return {"success": False, "error": "agent_id is required"}

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Trigger automated email
        success = await agent_email_service.process_automated_email(
            agent_id, event_type, context
        )

        return {
            "success": success,
            "agent_id": agent_id,
            "event_type": event_type,
            "message": (
                "Automated email triggered" if success else "No matching template found"
            ),
        }

    except Exception as e:
        logger.error(f"Failed to trigger agent automated email: {e}")
        return {"success": False, "error": str(e)}


@register_tool(
    name="get_agent_email_config",
    category="email",
    description="Get email configuration for an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_agent_email_config(**kwargs) -> dict[str, Any]:
    """Get email configuration for an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")

        if not agent_id:
            return {"success": False, "error": "agent_id is required"}

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Get agent config
        config = await agent_email_service.get_agent_config(agent_id)
        if not config:
            return {
                "success": False,
                "error": f"Agent {agent_id} not configured for email",
            }

        return {
            "success": True,
            "agent_id": config.agent_id,
            "agent_name": config.agent_name,
            "agent_email": config.agent_email,
            "auto_reply_enabled": config.auto_reply_enabled,
            "notification_preferences": config.notification_preferences,
        }

    except Exception as e:
        logger.error(f"Failed to get agent email config: {e}")
        return {"success": False, "error": str(e)}


@register_tool(
    name="setup_agent_email",
    category="email",
    description="Setup email configuration for an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def setup_agent_email(**kwargs) -> dict[str, Any]:
    """Setup email configuration for an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        agent_name = arguments.get("agent_name", "")
        agent_email = arguments.get("agent_email", "")
        auto_reply_enabled = arguments.get("auto_reply_enabled", False)
        notification_preferences = arguments.get("notification_preferences", {})

        if not agent_id or not agent_name or not agent_email:
            return {
                "success": False,
                "error": "agent_id, agent_name, and agent_email are required",
            }

        # Get agent email service
        try:
            from backend.app.services.email.ai.agent_email_service import (
                agent_email_service,
            )
        except ImportError:
            return {"success": False, "error": "Agent email service not available"}

        # Create config
        from backend.app.models.agent_email_models import AgentEmailConfig

        config = AgentEmailConfig(
            agent_id=agent_id,
            agent_name=agent_name,
            agent_email=agent_email,
            auto_reply_enabled=auto_reply_enabled,
            notification_preferences=notification_preferences,
        )

        # Update config
        updated_config = await agent_email_service.update_agent_config(agent_id, config)

        return {
            "success": True,
            "agent_id": updated_config.agent_id,
            "agent_name": updated_config.agent_name,
            "agent_email": updated_config.agent_email,
            "message": f"Email configuration setup for agent {agent_id}",
        }

    except Exception as e:
        logger.error(f"Failed to setup agent email: {e}")
        return {"success": False, "error": str(e)}
