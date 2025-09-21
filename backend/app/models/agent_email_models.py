"""
Agent Email models for Reynard Backend.

This module provides Pydantic models for agent email-related data structures.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum


class EventType(str, Enum):
    """Event types for automated email triggers."""

    AGENT_INTERACTION = "agent_interaction"
    SYSTEM_ALERT = "system_alert"
    MANUAL = "manual"
    SCHEDULED = "scheduled"


class AgentEmailConfig(BaseModel):
    """Agent email configuration model."""

    agent_id: str = Field(..., description="Agent ID")
    agent_name: str = Field(..., description="Agent name")
    agent_email: EmailStr = Field(..., description="Agent email address")
    auto_reply_enabled: bool = Field(False, description="Enable auto-reply")
    auto_reply_template: Optional[str] = Field(
        None, description="Auto-reply template ID"
    )
    notification_preferences: Dict[str, bool] = Field(
        default_factory=lambda: {
            "new_messages": True,
            "system_alerts": True,
            "agent_interactions": True,
        },
        description="Notification preferences",
    )
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last update timestamp"
    )


class AgentEmailStats(BaseModel):
    """Agent email statistics model."""

    agent_id: str = Field(..., description="Agent ID")
    total_sent: int = Field(0, description="Total emails sent")
    total_received: int = Field(0, description="Total emails received")
    unread_count: int = Field(0, description="Number of unread emails")
    last_activity: Optional[datetime] = Field(None, description="Last email activity")
    active_conversations: int = Field(0, description="Number of active conversations")
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last update timestamp"
    )


class AgentEmailTemplate(BaseModel):
    """Agent email template model."""

    id: str = Field(..., description="Template ID")
    agent_id: str = Field(..., description="Agent ID")
    name: str = Field(..., description="Template name")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    html_body: Optional[str] = Field(None, description="HTML email body")
    trigger_conditions: Dict[str, Any] = Field(
        default_factory=dict, description="Template trigger conditions"
    )
    variables: List[str] = Field(default_factory=list, description="Template variables")
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last update timestamp"
    )


class AgentEmailSendRequest(BaseModel):
    """Request model for sending agent emails."""

    target_agent_id: str = Field(..., description="Target agent ID")
    message: "AgentEmailMessage" = Field(..., description="Email message")


class AgentEmailMessage(BaseModel):
    """Agent email message model."""

    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    body: str = Field(..., min_length=1, description="Plain text email body")
    html_body: Optional[str] = Field(None, description="HTML email body")
    cc_emails: Optional[List[EmailStr]] = Field(None, description="CC email addresses")
    bcc_emails: Optional[List[EmailStr]] = Field(
        None, description="BCC email addresses"
    )
    attachments: Optional[List[Dict[str, Any]]] = Field(
        None, description="Email attachments"
    )
    reply_to: Optional[EmailStr] = Field(None, description="Reply-to email address")


class AgentEmailBulkRequest(BaseModel):
    """Request model for sending bulk agent emails."""

    target_agent_ids: List[str] = Field(
        ..., min_length=1, description="Target agent IDs"
    )
    message: AgentEmailMessage = Field(..., description="Email message")
    batch_size: Optional[int] = Field(10, ge=1, le=100, description="Batch size")
    delay_between_batches: Optional[float] = Field(
        1.0, ge=0.0, le=60.0, description="Delay between batches"
    )


class AgentEmailTriggerRequest(BaseModel):
    """Request model for triggering automated agent emails."""

    event_type: EventType = Field(..., description="Event type")
    context: Dict[str, Any] = Field(default_factory=dict, description="Event context")


class AgentEmailInteraction(BaseModel):
    """Agent email interaction model."""

    id: str = Field(..., description="Interaction ID")
    sender_agent_id: str = Field(..., description="Sender agent ID")
    receiver_agent_id: str = Field(..., description="Receiver agent ID")
    interaction_type: str = Field(..., description="Type of interaction")
    subject: Optional[str] = Field(None, description="Email subject")
    message_id: Optional[str] = Field(None, description="Email message ID")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )


class AgentEmailMessage(BaseModel):
    """Agent email message model."""

    id: str = Field(..., description="Message ID")
    agent_id: str = Field(..., description="Agent ID")
    sender_agent_id: Optional[str] = Field(None, description="Sender agent ID")
    recipient_agent_id: Optional[str] = Field(None, description="Recipient agent ID")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    html_body: Optional[str] = Field(None, description="HTML email body")
    status: str = Field("sent", description="Message status")
    message_id: Optional[str] = Field(None, description="Email message ID")
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last update timestamp"
    )


class AgentEmailNotification(BaseModel):
    """Agent email notification model."""

    id: str = Field(..., description="Notification ID")
    agent_id: str = Field(..., description="Agent ID")
    notification_type: str = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    read: bool = Field(False, description="Whether notification is read")
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )


class AgentEmailSettings(BaseModel):
    """Agent email settings model."""

    agent_id: str = Field(..., description="Agent ID")
    email_frequency: str = Field("daily", description="Email frequency preference")
    digest_enabled: bool = Field(True, description="Enable email digest")
    digest_time: str = Field("09:00", description="Digest time")
    auto_archive: bool = Field(False, description="Auto-archive old emails")
    archive_days: int = Field(30, description="Days before auto-archive")
    signature: Optional[str] = Field(None, description="Email signature")
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="Last update timestamp"
    )


# Update forward references
AgentEmailSendRequest.model_rebuild()
AgentEmailBulkRequest.model_rebuild()
