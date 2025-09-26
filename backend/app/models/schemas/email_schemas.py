"""Email models for Reynard Backend.

This module provides Pydantic models for email-related data structures.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


class EmailAttachmentModel(BaseModel):
    """Email attachment model."""

    file_path: str = Field(..., description="Path to the attachment file")
    filename: str | None = Field(
        None,
        description="Custom filename for the attachment",
    )

    @field_validator("file_path")
    @classmethod
    def validate_file_path(cls, v: str) -> str:
        """Validate that the file path is not empty."""
        if not v or not v.strip():
            raise ValueError("File path cannot be empty")
        return v


class EmailSendRequest(BaseModel):
    """Request model for sending emails."""

    to_emails: list[EmailStr] = Field(
        ...,
        min_length=1,
        description="List of recipient email addresses",
    )
    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    body: str = Field(..., min_length=1, description="Plain text email body")
    html_body: str | None = Field(None, description="HTML email body")
    cc_emails: list[EmailStr] | None = Field(None, description="CC email addresses")
    bcc_emails: list[EmailStr] | None = Field(
        None,
        description="BCC email addresses",
    )
    attachments: list[EmailAttachmentModel] | None = Field(
        None,
        description="Email attachments",
    )
    reply_to: EmailStr | None = Field(None, description="Reply-to email address")

    @field_validator("to_emails", "cc_emails", "bcc_emails")
    @classmethod
    def validate_email_lists(
        cls,
        v: list[EmailStr] | None,
    ) -> list[EmailStr] | None:
        """Validate email lists are not empty if provided."""
        if v is not None and len(v) == 0:
            raise ValueError("Email list cannot be empty")
        return v


class EmailSendResponse(BaseModel):
    """Response model for email sending."""

    success: bool = Field(..., description="Whether the email was sent successfully")
    message_id: str | None = Field(None, description="Email message ID")
    sent_at: datetime | None = Field(
        None,
        description="Timestamp when email was sent",
    )
    recipients: list[str] = Field(..., description="List of recipients")
    error: str | None = Field(None, description="Error message if sending failed")


class EmailTemplateRequest(BaseModel):
    """Request model for sending templated emails."""

    to_emails: list[EmailStr] = Field(
        ...,
        min_length=1,
        description="List of recipient email addresses",
    )
    template_name: str = Field(
        ...,
        min_length=1,
        description="Name of the email template",
    )
    template_variables: dict[str, Any] = Field(
        default_factory=dict,
        description="Template variables",
    )
    subject: str | None = Field(
        None,
        description="Custom subject (overrides template)",
    )
    cc_emails: list[EmailStr] | None = Field(None, description="CC email addresses")
    bcc_emails: list[EmailStr] | None = Field(
        None,
        description="BCC email addresses",
    )
    attachments: list[EmailAttachmentModel] | None = Field(
        None,
        description="Email attachments",
    )


class EmailBulkRequest(BaseModel):
    """Request model for bulk email sending."""

    to_emails: list[EmailStr] = Field(
        ...,
        min_length=1,
        description="List of recipient email addresses",
    )
    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    body: str = Field(..., min_length=1, description="Plain text email body")
    html_body: str | None = Field(None, description="HTML email body")
    batch_size: int = Field(
        10,
        ge=1,
        le=100,
        description="Number of emails to send per batch",
    )
    delay_between_batches: float = Field(
        1.0,
        ge=0.0,
        le=60.0,
        description="Delay between batches in seconds",
    )


class EmailBulkResponse(BaseModel):
    """Response model for bulk email sending."""

    total_recipients: int = Field(..., description="Total number of recipients")
    successful_sends: int = Field(..., description="Number of successful sends")
    failed_sends: int = Field(..., description="Number of failed sends")
    batch_count: int = Field(..., description="Number of batches processed")
    processing_time: float = Field(..., description="Total processing time in seconds")
    results: list[EmailSendResponse] = Field(..., description="Individual send results")


class EmailConfigModel(BaseModel):
    """Email configuration model."""

    smtp_server: str = Field(..., description="SMTP server hostname")
    smtp_port: int = Field(587, ge=1, le=65535, description="SMTP server port")
    smtp_username: str = Field(..., description="SMTP username")
    smtp_password: str = Field(..., description="SMTP password")
    use_tls: bool = Field(True, description="Use TLS encryption")
    from_email: str = Field(..., description="Default from email address")
    from_name: str = Field("Reynard System", description="Default from name")


class EmailStatusModel(BaseModel):
    """Email status model."""

    service_configured: bool = Field(
        ...,
        description="Whether email service is properly configured",
    )
    smtp_server: str = Field(..., description="SMTP server being used")
    from_email: str = Field(..., description="Default from email")
    test_connection: bool = Field(
        ...,
        description="Whether SMTP connection test passed",
    )
    last_test_time: datetime | None = Field(
        None,
        description="Last connection test time",
    )
