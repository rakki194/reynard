"""IMAP Service for Reynard Backend.

This module provides email receiving functionality using IMAP.
"""

import asyncio
import email
import imaplib
import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timedelta
from email.header import decode_header
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class EmailMessage:
    """Email message model for received emails."""

    message_id: str
    subject: str
    sender: str
    recipient: str
    date: datetime
    body: str
    html_body: str | None = None
    attachments: list[dict[str, Any]] | None = None
    from_agent: str | None = None
    to_agent: str | None = None
    is_agent_email: bool = False
    status: str = "received"  # received, processed, replied

    def __post_init__(self) -> None:
        if self.attachments is None:
            self.attachments = []


@dataclass
class EmailAttachment:
    """Email attachment model."""

    filename: str
    content_type: str
    size: int
    data: bytes


class IMAPConfig:
    """IMAP configuration settings."""

    def __init__(self):
        self.imap_server = os.getenv("IMAP_SERVER", "imap.gmail.com")
        self.imap_port = int(os.getenv("IMAP_PORT", "993"))
        self.imap_username = os.getenv("IMAP_USERNAME", "")
        self.imap_password = os.getenv("IMAP_PASSWORD", "")
        self.use_ssl = os.getenv("IMAP_USE_SSL", "true").lower() == "true"
        self.mailbox = os.getenv("IMAP_MAILBOX", "INBOX")


class IMAPService:
    """IMAP service for receiving emails with agent integration."""

    def __init__(
        self, config: IMAPConfig | None = None, data_dir: str = "data/imap_emails",
    ):
        self.config = config or IMAPConfig()
        self._validate_config()
        self._connection: imaplib.IMAP4 | imaplib.IMAP4_SSL | None = None

        # Agent integration
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.received_emails_file = self.data_dir / "received_emails.json"
        self.agent_emails_file = self.data_dir / "agent_emails.json"
        self._load_received_emails()

    def _validate_config(self) -> None:
        """Validate IMAP configuration."""
        if not self.config.imap_username:
            raise ValueError("IMAP username is required")
        if not self.config.imap_password:
            raise ValueError("IMAP password is required")

    def _load_received_emails(self) -> None:
        """Load received emails from storage."""
        try:
            if self.received_emails_file.exists():
                with open(self.received_emails_file) as f:
                    data = json.load(f)
                    self.received_emails = {
                        msg_id: EmailMessage(**msg_data)
                        for msg_id, msg_data in data.items()
                    }
            else:
                self.received_emails = {}
        except Exception as e:
            logger.error(f"Failed to load received emails: {e}")
            self.received_emails = {}

    def _save_received_emails(self) -> None:
        """Save received emails to storage."""
        try:
            data = {
                msg_id: {
                    "message_id": msg.message_id,
                    "subject": msg.subject,
                    "sender": msg.sender,
                    "recipient": msg.recipient,
                    "date": msg.date.isoformat(),
                    "body": msg.body,
                    "html_body": msg.html_body,
                    "attachments": msg.attachments,
                    "from_agent": msg.from_agent,
                    "to_agent": msg.to_agent,
                    "is_agent_email": msg.is_agent_email,
                    "status": msg.status,
                }
                for msg_id, msg in self.received_emails.items()
            }
            with open(self.received_emails_file, "w") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save received emails: {e}")

    async def _detect_agent_email(self, email_msg: EmailMessage) -> EmailMessage:
        """Detect if email is from/to an agent and update accordingly."""
        try:
            # Try to import agent email service
            from ..ai.agent_email_service import agent_email_service

            # Check if sender is an agent
            sender_config = await agent_email_service.get_agent_config_by_email(
                email_msg.sender,
            )
            if sender_config:
                email_msg.from_agent = sender_config.agent_id
                email_msg.is_agent_email = True

            # Check if recipient is an agent
            recipient_config = await agent_email_service.get_agent_config_by_email(
                email_msg.recipient,
            )
            if recipient_config:
                email_msg.to_agent = recipient_config.agent_id
                email_msg.is_agent_email = True

            return email_msg
        except ImportError:
            logger.warning("Agent email service not available for email detection")
            return email_msg
        except Exception as e:
            logger.error(f"Error detecting agent email: {e}")
            return email_msg

    async def _process_agent_email(self, email_msg: EmailMessage) -> None:
        """Process agent email and trigger appropriate actions."""
        if not email_msg.is_agent_email:
            return

        try:
            from ..ai.agent_email_service import agent_email_service

            # Update agent stats
            if email_msg.to_agent:
                await agent_email_service.update_agent_stats(
                    email_msg.to_agent, "received",
                )

            # Log the interaction
            if email_msg.from_agent and email_msg.to_agent:
                await agent_email_service.log_agent_interaction(
                    email_msg.from_agent,
                    email_msg.to_agent,
                    "email_received",
                    {
                        "subject": email_msg.subject,
                        "message_id": email_msg.message_id,
                        "date": email_msg.date.isoformat(),
                    },
                )

            # Check for auto-reply
            if email_msg.to_agent:
                target_config = await agent_email_service.get_agent_config(
                    email_msg.to_agent,
                )
                if target_config and target_config.auto_reply_enabled:
                    await self._send_auto_reply(email_msg, target_config)

            # Trigger automated responses based on email content
            await self._trigger_automated_responses(email_msg)

        except Exception as e:
            logger.error(f"Error processing agent email: {e}")

    async def _send_auto_reply(
        self, original_email: EmailMessage, agent_config,
    ) -> None:
        """Send auto-reply for agent email."""
        try:
            from ..ai.agent_email_service import agent_email_service
            from .email_service import email_service

            # Get auto-reply template
            auto_reply_template = None
            if agent_config.auto_reply_template:
                templates = await agent_email_service.get_agent_templates(
                    agent_config.agent_id,
                )
                auto_reply_template = next(
                    (t for t in templates if t.id == agent_config.auto_reply_template),
                    None,
                )

            if auto_reply_template:
                # Process template variables
                subject = auto_reply_template.subject.replace(
                    "{sender_name}", original_email.sender,
                )
                body = auto_reply_template.body.replace(
                    "{sender_name}", original_email.sender,
                )
                html_body = (
                    auto_reply_template.html_body.replace(
                        "{sender_name}", original_email.sender,
                    )
                    if auto_reply_template.html_body
                    else None
                )
            else:
                # Default auto-reply
                subject = f"Re: {original_email.subject}"
                body = f"Thank you for your email. This is an automated reply from {agent_config.agent_name}."
                html_body = f"<p>Thank you for your email. This is an automated reply from <strong>{agent_config.agent_name}</strong>.</p>"

            # Send auto-reply
            from ..models.email_models import EmailMessage as EmailMessageModel

            reply_message = EmailMessageModel(
                to_emails=[original_email.sender],
                subject=subject,
                body=body,
                html_body=html_body,
                reply_to=agent_config.agent_email,
            )

            result = await email_service.send_email(reply_message)

            if result["success"]:
                logger.info(f"Auto-reply sent for email {original_email.message_id}")

                # Update original email status
                original_email.status = "replied"
                self._save_received_emails()

        except Exception as e:
            logger.error(f"Error sending auto-reply: {e}")

    async def _trigger_automated_responses(self, email_msg: EmailMessage) -> None:
        """Trigger automated responses based on email content."""
        if not email_msg.to_agent:
            return

        try:
            from ..ai.agent_email_service import agent_email_service

            # Analyze email content for trigger conditions
            trigger_context = {
                "sender": email_msg.sender,
                "subject": email_msg.subject,
                "body": email_msg.body,
                "date": email_msg.date.isoformat(),
                "message_id": email_msg.message_id,
            }

            # Trigger based on email content
            if (
                "urgent" in email_msg.subject.lower()
                or "urgent" in email_msg.body.lower()
            ):
                await agent_email_service.process_automated_email(
                    email_msg.to_agent, "urgent_email_received", trigger_context,
                )
            elif "question" in email_msg.subject.lower() or "?" in email_msg.body:
                await agent_email_service.process_automated_email(
                    email_msg.to_agent, "question_received", trigger_context,
                )
            elif (
                "meeting" in email_msg.subject.lower()
                or "meeting" in email_msg.body.lower()
            ):
                await agent_email_service.process_automated_email(
                    email_msg.to_agent, "meeting_request", trigger_context,
                )

        except Exception as e:
            logger.error(f"Error triggering automated responses: {e}")

    async def connect(self) -> bool:
        """Connect to IMAP server.

        Returns:
            bool: True if connection successful

        """
        try:
            # Run IMAP connection in thread pool
            loop = asyncio.get_event_loop()
            self._connection = await loop.run_in_executor(None, self._connect_sync)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to IMAP server: {e}")
            return False

    def _connect_sync(self) -> imaplib.IMAP4 | imaplib.IMAP4_SSL:
        """Synchronous IMAP connection."""
        if self.config.use_ssl:
            connection = imaplib.IMAP4_SSL(
                self.config.imap_server, self.config.imap_port,
            )
        else:
            connection = imaplib.IMAP4(self.config.imap_server, self.config.imap_port)

        connection.login(self.config.imap_username, self.config.imap_password)
        connection.select(self.config.mailbox)
        return connection

    async def disconnect(self) -> None:
        """Disconnect from IMAP server."""
        if self._connection:
            try:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._connection.close)
                await loop.run_in_executor(None, self._connection.logout)
            except Exception as e:
                logger.error(f"Error disconnecting from IMAP: {e}")
            finally:
                self._connection = None

    async def get_unread_emails(self, limit: int = 10) -> list[EmailMessage]:
        """Get unread emails with agent integration.

        Args:
            limit: Maximum number of emails to retrieve

        Returns:
            List[EmailMessage]: List of unread emails

        """
        if not self._connection:
            await self.connect()

        try:
            loop = asyncio.get_event_loop()
            emails = await loop.run_in_executor(
                None, self._get_unread_emails_sync, limit,
            )

            # Process each email for agent integration
            processed_emails = []
            for email_msg in emails:
                # Detect if it's an agent email
                email_msg = await self._detect_agent_email(email_msg)

                # Store the email
                self.received_emails[email_msg.message_id] = email_msg

                # Process agent email if applicable
                if email_msg.is_agent_email:
                    await self._process_agent_email(email_msg)

                processed_emails.append(email_msg)

            # Save received emails
            self._save_received_emails()

            return processed_emails
        except Exception as e:
            logger.error(f"Failed to get unread emails: {e}")
            return []

    def _get_unread_emails_sync(self, limit: int) -> list[EmailMessage]:
        """Synchronous method to get unread emails."""
        # Search for unread emails
        status, messages = self._connection.search(None, "UNSEEN")
        if status != "OK":
            raise Exception("Failed to search for unread emails")

        email_ids = messages[0].split()
        if not email_ids:
            return []

        # Limit the number of emails
        email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids

        emails = []
        for email_id in email_ids:
            try:
                # Fetch email
                status, msg_data = self._connection.fetch(email_id, "(RFC822)")
                if status != "OK":
                    continue

                # Parse email
                email_message = self._parse_email(msg_data[0][1])
                if email_message:
                    emails.append(email_message)

            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue

        return emails

    async def get_recent_emails(
        self, days: int = 7, limit: int = 10,
    ) -> list[EmailMessage]:
        """Get recent emails from the last N days.

        Args:
            days: Number of days to look back
            limit: Maximum number of emails to retrieve

        Returns:
            List[EmailMessage]: List of recent emails

        """
        if not self._connection:
            await self.connect()

        try:
            loop = asyncio.get_event_loop()
            emails = await loop.run_in_executor(
                None, self._get_recent_emails_sync, days, limit,
            )
            return emails
        except Exception as e:
            logger.error(f"Failed to get recent emails: {e}")
            return []

    def _get_recent_emails_sync(self, days: int, limit: int) -> list[EmailMessage]:
        """Synchronous method to get recent emails."""
        # Calculate date range
        since_date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")

        # Search for emails since date
        status, messages = self._connection.search(None, f"SINCE {since_date}")
        if status != "OK":
            raise Exception("Failed to search for recent emails")

        email_ids = messages[0].split()
        if not email_ids:
            return []

        # Limit the number of emails
        email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids

        emails = []
        for email_id in email_ids:
            try:
                # Fetch email
                status, msg_data = self._connection.fetch(email_id, "(RFC822)")
                if status != "OK":
                    continue

                # Parse email
                email_message = self._parse_email(msg_data[0][1])
                if email_message:
                    emails.append(email_message)

            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue

        return emails

    def _parse_email(self, raw_email: bytes) -> EmailMessage | None:
        """Parse raw email data into EmailMessage object."""
        try:
            # Parse email
            msg = email.message_from_bytes(raw_email)

            # Extract headers
            subject = self._decode_header(msg.get("Subject", ""))
            sender = self._decode_header(msg.get("From", ""))
            recipient = self._decode_header(msg.get("To", ""))
            message_id = msg.get("Message-ID", "")

            # Parse date
            date_str = msg.get("Date", "")
            try:
                import email.utils

                date = email.utils.parsedate_to_datetime(date_str)
            except Exception:
                date = datetime.now()

            # Extract body and attachments
            body, html_body, attachments = self._extract_body_and_attachments(msg)

            return EmailMessage(
                message_id=message_id,
                subject=subject,
                sender=sender,
                recipient=recipient,
                date=date,
                body=body,
                html_body=html_body,
                attachments=attachments,
            )

        except Exception as e:
            logger.error(f"Error parsing email: {e}")
            return None

    def _decode_header(self, header: str) -> str:
        """Decode email header."""
        try:
            decoded_parts = decode_header(header)
            decoded_string = ""
            for part, encoding in decoded_parts:
                if isinstance(part, bytes):
                    if encoding:
                        decoded_string += part.decode(encoding)
                    else:
                        decoded_string += part.decode("utf-8", errors="ignore")
                else:
                    decoded_string += part
            return decoded_string
        except Exception:
            return header

    def _extract_body_and_attachments(
        self, msg: email.message.Message,
    ) -> tuple[str, str | None, list[dict[str, Any]]]:
        """Extract body and attachments from email message."""
        body = ""
        html_body = None
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))

                # Skip multipart containers
                if content_type == "multipart/alternative":
                    continue

                # Handle attachments
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        filename = self._decode_header(filename)
                        attachments.append(
                            {
                                "filename": filename,
                                "content_type": content_type,
                                "size": len(part.get_payload(decode=True) or b""),
                            },
                        )

                # Handle text content
                elif (
                    content_type == "text/plain"
                    and "attachment" not in content_disposition
                ):
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            body = payload.decode("utf-8")
                        except Exception:
                            body = payload.decode("utf-8", errors="ignore")

                elif (
                    content_type == "text/html"
                    and "attachment" not in content_disposition
                ):
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            html_body = payload.decode("utf-8")
                        except Exception:
                            html_body = payload.decode("utf-8", errors="ignore")
        else:
            # Simple message
            content_type = msg.get_content_type()
            payload = msg.get_payload(decode=True)
            if payload:
                try:
                    text = payload.decode("utf-8")
                except Exception:
                    text = payload.decode("utf-8", errors="ignore")

                if content_type == "text/html":
                    html_body = text
                else:
                    body = text

        return body, html_body, attachments

    async def mark_as_read(self, message_id: str) -> bool:
        """Mark an email as read.

        Args:
            message_id: Email message ID

        Returns:
            bool: True if successful

        """
        if not self._connection:
            await self.connect()

        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, self._mark_as_read_sync, message_id,
            )
            return result
        except Exception as e:
            logger.error(f"Failed to mark email as read: {e}")
            return False

    def _mark_as_read_sync(self, message_id: str) -> bool:
        """Synchronous method to mark email as read."""
        try:
            # Search for the specific message
            status, messages = self._connection.search(
                None, f'HEADER Message-ID "{message_id}"',
            )
            if status != "OK" or not messages[0]:
                return False

            email_id = messages[0].split()[0]

            # Mark as read
            status, _ = self._connection.store(email_id, "+FLAGS", "\\Seen")
            return status == "OK"

        except Exception as e:
            logger.error(f"Error marking email as read: {e}")
            return False

    async def get_mailbox_info(self) -> dict[str, Any]:
        """Get mailbox information.

        Returns:
            Dict containing mailbox statistics

        """
        if not self._connection:
            await self.connect()

        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, self._get_mailbox_info_sync)
            return info
        except Exception as e:
            logger.error(f"Failed to get mailbox info: {e}")
            return {}

    def _get_mailbox_info_sync(self) -> dict[str, Any]:
        """Synchronous method to get mailbox info."""
        try:
            # Get mailbox status
            status, messages = self._connection.status(
                self.config.mailbox, "(MESSAGES UNSEEN)",
            )
            if status != "OK":
                return {}

            # Parse response
            info = {}
            for item in messages[0].decode().split():
                if "MESSAGES" in item:
                    info["total_messages"] = int(item.split("(")[1])
                elif "UNSEEN" in item:
                    info["unread_messages"] = int(item.split("(")[1])

            return info

        except Exception as e:
            logger.error(f"Error getting mailbox info: {e}")
            return {}

    async def get_agent_emails(
        self, agent_id: str, limit: int = 50,
    ) -> list[EmailMessage]:
        """Get emails for a specific agent.

        Args:
            agent_id: Agent ID to get emails for
            limit: Maximum number of emails to retrieve

        Returns:
            List[EmailMessage]: List of agent emails

        """
        try:
            from ..ai.agent_email_service import agent_email_service

            # Get agent config to find email address
            agent_config = await agent_email_service.get_agent_config(agent_id)
            if not agent_config:
                return []

            # Filter emails for this agent
            agent_emails = [
                email_msg
                for email_msg in self.received_emails.values()
                if (
                    email_msg.from_agent == agent_id
                    or email_msg.to_agent == agent_id
                    or email_msg.recipient == agent_config.agent_email
                    or email_msg.sender == agent_config.agent_email
                )
            ]

            # Sort by date (newest first)
            agent_emails.sort(key=lambda x: x.date, reverse=True)

            return agent_emails[:limit]

        except Exception as e:
            logger.error(f"Failed to get agent emails for {agent_id}: {e}")
            return []

    async def get_received_emails_summary(self) -> dict[str, Any]:
        """Get summary of received emails.

        Returns:
            Dict containing email statistics

        """
        try:
            total_emails = len(self.received_emails)
            agent_emails = sum(
                1
                for email_msg in self.received_emails.values()
                if email_msg.is_agent_email
            )
            unread_emails = sum(
                1
                for email_msg in self.received_emails.values()
                if email_msg.status == "received"
            )
            replied_emails = sum(
                1
                for email_msg in self.received_emails.values()
                if email_msg.status == "replied"
            )

            # Get agent breakdown
            agent_breakdown = {}
            for email_msg in self.received_emails.values():
                if email_msg.from_agent:
                    agent_breakdown[email_msg.from_agent] = (
                        agent_breakdown.get(email_msg.from_agent, 0) + 1
                    )
                if email_msg.to_agent:
                    agent_breakdown[email_msg.to_agent] = (
                        agent_breakdown.get(email_msg.to_agent, 0) + 1
                    )

            return {
                "total_emails": total_emails,
                "agent_emails": agent_emails,
                "unread_emails": unread_emails,
                "replied_emails": replied_emails,
                "agent_breakdown": agent_breakdown,
                "last_updated": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to get email summary: {e}")
            return {}

    async def start_email_monitoring(self, interval: int = 60) -> None:
        """Start continuous email monitoring.

        Args:
            interval: Check interval in seconds

        """
        logger.info(f"Starting email monitoring with {interval}s interval")

        while True:
            try:
                # Check for new emails
                new_emails = await self.get_unread_emails(limit=50)

                if new_emails:
                    logger.info(f"Received {len(new_emails)} new emails")

                    # Process each new email
                    for email_msg in new_emails:
                        if email_msg.is_agent_email:
                            logger.info(f"Processing agent email: {email_msg.subject}")
                        else:
                            logger.info(
                                f"Processing regular email: {email_msg.subject}",
                            )

                # Wait for next check
                await asyncio.sleep(interval)

            except Exception as e:
                logger.error(f"Error in email monitoring: {e}")
                await asyncio.sleep(interval)

    async def mark_email_as_processed(self, message_id: str) -> bool:
        """Mark an email as processed.

        Args:
            message_id: Email message ID

        Returns:
            bool: True if successful

        """
        try:
            if message_id in self.received_emails:
                self.received_emails[message_id].status = "processed"
                self._save_received_emails()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to mark email as processed: {e}")
            return False


# Global IMAP service instance - lazy initialization
imap_service = None


def get_imap_service() -> IMAPService:
    """Get the global IMAP service instance with lazy initialization."""
    global imap_service
    if imap_service is None:
        imap_service = IMAPService()
    return imap_service
