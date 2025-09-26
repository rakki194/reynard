"""Tests for Pydantic schemas."""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.models.schemas.email_schemas import EmailAttachmentModel
from app.models.schemas.caption_schemas import CaptionRequest, CaptionResponse
from app.models.schemas.agent_schemas import (
    EventType,
    AgentEmailConfig,
    AgentEmailStats,
    AgentEmailTemplate,
    AgentEmailSendRequest,
    AgentEmailMessage,
)


class TestEmailAttachmentModel:
    """Test cases for EmailAttachmentModel."""

    def test_email_attachment_creation(self):
        """Test basic email attachment creation."""
        attachment = EmailAttachmentModel(
            file_path="/path/to/file.pdf",
            filename="document.pdf"
        )
        
        assert attachment.file_path == "/path/to/file.pdf"
        assert attachment.filename == "document.pdf"

    def test_email_attachment_optional_filename(self):
        """Test email attachment with optional filename."""
        attachment = EmailAttachmentModel(
            file_path="/path/to/file.pdf"
        )
        
        assert attachment.file_path == "/path/to/file.pdf"
        assert attachment.filename is None

    def test_email_attachment_validation(self):
        """Test email attachment validation."""
        # Valid attachment
        attachment = EmailAttachmentModel(
            file_path="/path/to/file.pdf",
            filename="document.pdf"
        )
        assert attachment.file_path == "/path/to/file.pdf"
        
        # Invalid - missing required field
        with pytest.raises(ValidationError):
            EmailAttachmentModel(filename="document.pdf")


class TestCaptionSchemas:
    """Test cases for caption generation schemas."""

    def test_caption_request_creation(self):
        """Test basic caption request creation."""
        request = CaptionRequest(
            image_path="/path/to/image.jpg",
            generator_name="jtp2",
            config={"max_length": 100}
        )
        
        assert request.image_path == "/path/to/image.jpg"
        assert request.generator_name == "jtp2"
        assert request.config == {"max_length": 100}

    def test_caption_request_optional_config(self):
        """Test caption request with optional config."""
        request = CaptionRequest(
            image_path="/path/to/image.jpg",
            generator_name="florence2"
        )
        
        assert request.image_path == "/path/to/image.jpg"
        assert request.generator_name == "florence2"
        assert request.config is None

    def test_caption_response_creation(self):
        """Test basic caption response creation."""
        response = CaptionResponse(
            caption="A beautiful sunset over the mountains",
            confidence=0.95,
            generator_used="jtp2",
            processing_time=1.5
        )
        
        assert response.caption == "A beautiful sunset over the mountains"
        assert response.confidence == 0.95
        assert response.generator_used == "jtp2"
        assert response.processing_time == 1.5

    def test_caption_response_optional_fields(self):
        """Test caption response with optional fields."""
        response = CaptionResponse(
            caption="A simple caption"
        )
        
        assert response.caption == "A simple caption"
        assert response.confidence is None
        assert response.generator_used is None
        assert response.processing_time is None


class TestAgentEmailSchemas:
    """Test cases for agent email schemas."""

    def test_event_type_enum(self):
        """Test EventType enum values."""
        assert EventType.AGENT_INTERACTION == "agent_interaction"
        assert EventType.SYSTEM_ALERT == "system_alert"
        assert EventType.MANUAL == "manual"
        assert EventType.SCHEDULED == "scheduled"

    def test_agent_email_config_creation(self):
        """Test basic agent email config creation."""
        config = AgentEmailConfig(
            agent_id="test-agent-001",
            agent_name="Test Agent",
            agent_email="test@example.com",
            auto_reply_enabled=True,
            auto_reply_template="template-001"
        )
        
        assert config.agent_id == "test-agent-001"
        assert config.agent_name == "Test Agent"
        assert config.agent_email == "test@example.com"
        assert config.auto_reply_enabled is True
        assert config.auto_reply_template == "template-001"
        assert config.notification_preferences["new_messages"] is True
        assert config.notification_preferences["system_alerts"] is True
        assert config.notification_preferences["agent_interactions"] is True

    def test_agent_email_config_defaults(self):
        """Test agent email config default values."""
        config = AgentEmailConfig(
            agent_id="test-agent-001",
            agent_name="Test Agent",
            agent_email="test@example.com"
        )
        
        assert config.auto_reply_enabled is False
        assert config.auto_reply_template is None
        assert config.notification_preferences["new_messages"] is True
        assert config.notification_preferences["system_alerts"] is True
        assert config.notification_preferences["agent_interactions"] is True

    def test_agent_email_stats_creation(self):
        """Test basic agent email stats creation."""
        stats = AgentEmailStats(
            agent_id="test-agent-001",
            total_sent=100,
            total_received=50,
            unread_count=5,
            active_conversations=3
        )
        
        assert stats.agent_id == "test-agent-001"
        assert stats.total_sent == 100
        assert stats.total_received == 50
        assert stats.unread_count == 5
        assert stats.active_conversations == 3

    def test_agent_email_stats_defaults(self):
        """Test agent email stats default values."""
        stats = AgentEmailStats(
            agent_id="test-agent-001"
        )
        
        assert stats.total_sent == 0
        assert stats.total_received == 0
        assert stats.unread_count == 0
        assert stats.last_activity is None
        assert stats.active_conversations == 0

    def test_agent_email_template_creation(self):
        """Test basic agent email template creation."""
        template = AgentEmailTemplate(
            id="template-001",
            agent_id="test-agent-001",
            name="Welcome Template",
            subject="Welcome to Reynard!",
            body="Welcome to the Reynard system.",
            html_body="<h1>Welcome to Reynard!</h1>",
            trigger_conditions={"event_type": "agent_interaction"},
            variables=["agent_name", "system_name"]
        )
        
        assert template.id == "template-001"
        assert template.agent_id == "test-agent-001"
        assert template.name == "Welcome Template"
        assert template.subject == "Welcome to Reynard!"
        assert template.body == "Welcome to the Reynard system."
        assert template.html_body == "<h1>Welcome to Reynard!</h1>"
        assert template.trigger_conditions == {"event_type": "agent_interaction"}
        assert template.variables == ["agent_name", "system_name"]

    def test_agent_email_template_defaults(self):
        """Test agent email template default values."""
        template = AgentEmailTemplate(
            id="template-001",
            agent_id="test-agent-001",
            name="Test Template",
            subject="Test Subject",
            body="Test Body"
        )
        
        assert template.html_body is None
        assert template.trigger_conditions == {}
        assert template.variables == []

    def test_agent_email_message_creation(self):
        """Test basic agent email message creation."""
        message = AgentEmailMessage(
            subject="Test Subject",
            body="Test body content",
            html_body="<p>Test body content</p>",
            cc_emails=["cc@example.com"],
            bcc_emails=["bcc@example.com"]
        )
        
        assert message.subject == "Test Subject"
        assert message.body == "Test body content"
        assert message.html_body == "<p>Test body content</p>"
        assert message.cc_emails == ["cc@example.com"]
        assert message.bcc_emails == ["bcc@example.com"]

    def test_agent_email_message_validation(self):
        """Test agent email message validation."""
        # Valid message
        message = AgentEmailMessage(
            subject="Test Subject",
            body="Test body content"
        )
        assert message.subject == "Test Subject"
        
        # Invalid - empty subject
        with pytest.raises(ValidationError):
            AgentEmailMessage(
                subject="",  # Empty subject
                body="Test body content"
            )
        
        # Invalid - subject too long
        with pytest.raises(ValidationError):
            AgentEmailMessage(
                subject="x" * 201,  # Too long
                body="Test body content"
            )
        
        # Invalid - empty body
        with pytest.raises(ValidationError):
            AgentEmailMessage(
                subject="Test Subject",
                body=""  # Empty body
            )

    def test_agent_email_send_request_creation(self):
        """Test basic agent email send request creation."""
        message = AgentEmailMessage(
            subject="Test Subject",
            body="Test body content"
        )
        
        request = AgentEmailSendRequest(
            target_agent_id="target-agent-001",
            message=message
        )
        
        assert request.target_agent_id == "target-agent-001"
        assert request.message.subject == "Test Subject"
        assert request.message.body == "Test body content"

    def test_schema_serialization(self):
        """Test schema serialization to dict."""
        config = AgentEmailConfig(
            agent_id="test-agent-001",
            agent_name="Test Agent",
            agent_email="test@example.com"
        )
        
        config_dict = config.model_dump()
        
        assert isinstance(config_dict, dict)
        assert config_dict["agent_id"] == "test-agent-001"
        assert config_dict["agent_name"] == "Test Agent"
        assert config_dict["agent_email"] == "test@example.com"
        assert "created_at" in config_dict
        assert "updated_at" in config_dict

    def test_schema_deserialization(self):
        """Test schema deserialization from dict."""
        data = {
            "agent_id": "test-agent-001",
            "agent_name": "Test Agent",
            "agent_email": "test@example.com",
            "auto_reply_enabled": True
        }
        
        config = AgentEmailConfig(**data)
        
        assert config.agent_id == "test-agent-001"
        assert config.agent_name == "Test Agent"
        assert config.agent_email == "test@example.com"
        assert config.auto_reply_enabled is True


