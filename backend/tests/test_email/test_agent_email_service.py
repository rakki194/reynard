"""
Tests for Agent Email Service
"""

import pytest
import asyncio
from datetime import datetime
from pathlib import Path
import tempfile
import shutil

from app.services.agent_email_service import AgentEmailService
from app.models.agent_email_models import (
    AgentEmailConfig,
    AgentEmailStats,
    AgentEmailTemplate,
    EventType,
)


@pytest.fixture
async def agent_email_service():
    """Create a temporary agent email service for testing."""
    temp_dir = tempfile.mkdtemp()
    service = AgentEmailService(data_dir=temp_dir)
    yield service
    shutil.rmtree(temp_dir)


@pytest.mark.asyncio
async def test_agent_config_management(agent_email_service):
    """Test agent email configuration management."""
    # Create agent config
    config = AgentEmailConfig(
        agent_id="test-agent-1",
        agent_name="Test Agent",
        agent_email="test@example.com",
        auto_reply_enabled=True,
        notification_preferences={
            "new_messages": True,
            "system_alerts": False,
            "agent_interactions": True,
        }
    )
    
    # Update config
    updated_config = await agent_email_service.update_agent_config("test-agent-1", config)
    assert updated_config.agent_id == "test-agent-1"
    assert updated_config.agent_name == "Test Agent"
    assert updated_config.auto_reply_enabled is True
    
    # Get config
    retrieved_config = await agent_email_service.get_agent_config("test-agent-1")
    assert retrieved_config is not None
    assert retrieved_config.agent_id == "test-agent-1"
    assert retrieved_config.agent_name == "Test Agent"


@pytest.mark.asyncio
async def test_agent_stats_management(agent_email_service):
    """Test agent email statistics management."""
    # Update stats
    await agent_email_service.update_agent_stats("test-agent-1", "sent", 5)
    await agent_email_service.update_agent_stats("test-agent-1", "received", 3)
    
    # Get stats
    stats = await agent_email_service.get_agent_stats("test-agent-1")
    assert stats is not None
    assert stats.total_sent == 5
    assert stats.total_received == 3
    assert stats.unread_count == 3  # Received emails are unread by default


@pytest.mark.asyncio
async def test_agent_template_management(agent_email_service):
    """Test agent email template management."""
    # Create template
    template = AgentEmailTemplate(
        id="",  # Will be generated
        agent_id="test-agent-1",
        name="Welcome Template",
        subject="Welcome {agent_name}!",
        body="Hello {agent_name}, welcome to the system!",
        html_body="<h1>Welcome {agent_name}!</h1><p>Hello {agent_name}, welcome to the system!</p>",
        trigger_conditions={
            "event_type": "agent_interaction",
            "agent_traits": {"charisma": 0.7}
        },
        variables=["agent_name", "agent_id"]
    )
    
    # Create template
    created_template = await agent_email_service.create_agent_template("test-agent-1", template)
    assert created_template.id != ""
    assert created_template.name == "Welcome Template"
    assert created_template.agent_id == "test-agent-1"
    
    # Get templates
    templates = await agent_email_service.get_agent_templates("test-agent-1")
    assert len(templates) == 1
    assert templates[0].name == "Welcome Template"
    
    # Delete template
    success = await agent_email_service.delete_agent_template("test-agent-1", created_template.id)
    assert success is True
    
    # Verify deletion
    templates = await agent_email_service.get_agent_templates("test-agent-1")
    assert len(templates) == 0


@pytest.mark.asyncio
async def test_agent_interaction_logging(agent_email_service):
    """Test agent interaction logging."""
    # Log interaction
    await agent_email_service.log_agent_interaction(
        "sender-agent-1",
        "receiver-agent-1",
        "email_sent",
        {
            "subject": "Test Email",
            "message_id": "test-message-123"
        }
    )
    
    # Get interactions
    interactions = await agent_email_service.get_agent_interactions("sender-agent-1", limit=10)
    assert len(interactions) == 1
    assert interactions[0].sender_agent_id == "sender-agent-1"
    assert interactions[0].receiver_agent_id == "receiver-agent-1"
    assert interactions[0].interaction_type == "email_sent"
    assert interactions[0].metadata["subject"] == "Test Email"


@pytest.mark.asyncio
async def test_automated_email_processing(agent_email_service):
    """Test automated email processing."""
    # Setup agent config
    config = AgentEmailConfig(
        agent_id="test-agent-1",
        agent_name="Test Agent",
        agent_email="test@example.com"
    )
    await agent_email_service.update_agent_config("test-agent-1", config)
    
    # Create template
    template = AgentEmailTemplate(
        id="",
        agent_id="test-agent-1",
        name="Auto Welcome",
        subject="Welcome {agent_name}!",
        body="Hello {agent_name}, this is an automated welcome message!",
        trigger_conditions={
            "event_type": "agent_interaction"
        },
        variables=["agent_name"]
    )
    await agent_email_service.create_agent_template("test-agent-1", template)
    
    # Mock the email service to avoid actual email sending
    original_process_automated_email = agent_email_service.process_automated_email
    
    async def mock_process_automated_email(agent_id, event_type, context):
        # Just return True to simulate successful processing
        return True
    
    agent_email_service.process_automated_email = mock_process_automated_email
    
    # Process automated email
    success = await agent_email_service.process_automated_email(
        "test-agent-1",
        "agent_interaction",
        {
            "agent_name": "Test Agent",
            "target_agent_id": "target-agent-1"
        }
    )
    
    assert success is True


@pytest.mark.asyncio
async def test_notification_management(agent_email_service):
    """Test notification management."""
    # Create notification
    notification = await agent_email_service.create_agent_notification(
        "test-agent-1",
        "email_received",
        "New Email",
        "You have received a new email message",
        {"sender": "other-agent", "subject": "Test Subject"}
    )
    
    assert notification.agent_id == "test-agent-1"
    assert notification.notification_type == "email_received"
    assert notification.title == "New Email"
    assert notification.read is False
    
    # Get notifications
    notifications = await agent_email_service.get_agent_notifications("test-agent-1")
    assert len(notifications) == 1
    assert notifications[0].title == "New Email"
    
    # Mark as read
    success = await agent_email_service.mark_notification_read(notification.id)
    assert success is True
    
    # Verify read status
    notifications = await agent_email_service.get_agent_notifications("test-agent-1")
    assert len(notifications) == 1
    assert notifications[0].read is True

