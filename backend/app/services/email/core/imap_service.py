"""
IMAP Service for Reynard Backend.

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
from typing import Any, Dict, List, Optional, Tuple, Union

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
    html_body: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    from_agent: Optional[str] = None
    to_agent: Optional[str] = None
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
        self, config: Optional[IMAPConfig] = None, data_dir: str = "data/imap_emails"
    ):
        self.config = config or IMAPConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage for received emails
        self.received_emails_file = self.data_dir / "received_emails.json"
        self.received_emails: List[EmailMessage] = []

        # Load existing emails
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
                with open(self.received_emails_file, "r", encoding="utf-8") as f:
                    emails_data = json.load(f)
                    self.received_emails = [
                        EmailMessage(**email_data) for email_data in emails_data
                    ]
            else:
                self.received_emails = []
        except Exception as e:
            logger.error(f"Failed to load received emails: {e}")
            self.received_emails = []

    def _save_received_emails(self) -> None:
        """Save received emails to storage."""
        try:
            emails_data = []
            for email_msg in self.received_emails:
                email_dict = {
                    "message_id": email_msg.message_id,
                    "subject": email_msg.subject,
                    "sender": email_msg.sender,
                    "recipient": email_msg.recipient,
                    "date": email_msg.date.isoformat(),
                    "body": email_msg.body,
                    "html_body": email_msg.html_body,
                    "attachments": email_msg.attachments,
                    "from_agent": email_msg.from_agent,
                    "to_agent": email_msg.to_agent,
                    "is_agent_email": email_msg.is_agent_email,
                    "status": email_msg.status,
                }
                emails_data.append(email_dict)

            with open(self.received_emails_file, "w", encoding="utf-8") as f:
                json.dump(emails_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save received emails: {e}")

    async def _detect_agent_email(self, email_msg: EmailMessage) -> EmailMessage:
        """Detect if email is from/to an agent and update accordingly."""
        try:
            # Try to import agent email service
            from .agent_email_service import agent_email_service

            # Check if sender is an agent
            sender_config = await agent_email_service.get_agent_config(email_msg.sender)
            if sender_config:
                email_msg.from_agent = sender_config.agent_id
                email_msg.is_agent_email = True

            # Check if recipient is an agent
            recipient_config = await agent_email_service.get_agent_config(
                email_msg.recipient
            )
            if recipient_config:
                email_msg.to_agent = recipient_config.agent_id
                email_msg.is_agent_email = True

            return email_msg

        except ImportError:
            logger.debug("Agent email service not available")
            return email_msg
        except Exception as e:
            logger.error(f"Failed to detect agent email: {e}")
            return email_msg

    async def _process_agent_email(self, email_msg: EmailMessage) -> None:
        """Process agent-specific email."""
        try:
            # Try to import agent email service
            from .agent_email_service import agent_email_service

            # Update agent stats
            if email_msg.from_agent:
                await agent_email_service.update_agent_stats(
                    email_msg.from_agent, "sent"
                )

            if email_msg.to_agent:
                await agent_email_service.update_agent_stats(
                    email_msg.to_agent, "received"
                )

            # Log agent interaction
            if email_msg.from_agent and email_msg.to_agent:
                await agent_email_service.log_agent_interaction(
                    email_msg.from_agent,
                    email_msg.to_agent,
                    "email_received",
                    {
                        "message_id": email_msg.message_id,
                        "subject": email_msg.subject,
                        "date": email_msg.date.isoformat(),
                    },
                )

            # Send auto-reply if configured
            if email_msg.to_agent:
                agent_config = await agent_email_service.get_agent_config(
                    email_msg.to_agent
                )
                if agent_config and agent_config.auto_reply_enabled:
                    await self._send_auto_reply(email_msg, agent_config)

        except ImportError:
            logger.debug("Agent email service not available")
        except Exception as e:
            logger.error(f"Failed to process agent email: {e}")

    async def _send_auto_reply(
        self, original_email: EmailMessage, agent_config
    ) -> None:
        """Send auto-reply for agent email."""
        try:
            # Try to import services
            from .agent_email_service import agent_email_service
            from .email_service import email_service

            # Create auto-reply message
            auto_reply_subject = f"Re: {original_email.subject}"
            auto_reply_body = f"""
Thank you for your email. This is an automated response from {agent_config.agent_name}.

Your message has been received and will be processed shortly.

Best regards,
{agent_config.agent_name}
"""

            # Send auto-reply
            from .email_service import EmailMessage

            reply_message = EmailMessage(
                to_emails=[original_email.sender],
                subject=auto_reply_subject,
                body=auto_reply_body,
            )

            result = await email_service.send_email(reply_message)

            if result["success"]:
                # Update agent stats
                await agent_email_service.update_agent_stats(
                    agent_config.agent_id, "sent"
                )

                # Log the auto-reply
                await agent_email_service.log_agent_interaction(
                    agent_config.agent_id,
                    original_email.sender,
                    "auto_reply_sent",
                    {
                        "original_message_id": original_email.message_id,
                        "reply_message_id": result["message_id"],
                    },
                )

                logger.info(
                    f"Auto-reply sent for agent {agent_config.agent_id} to {original_email.sender}"
                )

        except ImportError:
            logger.debug("Required services not available for auto-reply")
        except Exception as e:
            logger.error(f"Failed to send auto-reply: {e}")

    async def _trigger_automated_responses(self, email_msg: EmailMessage) -> None:
        """Trigger automated responses based on email content."""
        try:
            # Try to import agent email service
            from .agent_email_service import agent_email_service

            if email_msg.to_agent:
                # Process automated email based on content
                context = {
                    "sender_email": email_msg.sender,
                    "subject": email_msg.subject,
                    "body": email_msg.body,
                    "message_id": email_msg.message_id,
                }

                # Trigger automated email processing
                await agent_email_service.process_automated_email(
                    email_msg.to_agent, "email_received", context
                )

        except ImportError:
            logger.debug("Agent email service not available")
        except Exception as e:
            logger.error(f"Failed to trigger automated responses: {e}")

    async def connect(self) -> bool:
        """Connect to IMAP server."""
        try:
            # Run IMAP connection in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._connect_sync)
            return result
        except Exception as e:
            logger.error(f"Failed to connect to IMAP server: {e}")
            return False

    def _connect_sync(self) -> Union[imaplib.IMAP4, imaplib.IMAP4_SSL]:
        """Synchronous IMAP connection."""
        if self.config.use_ssl:
            server = imaplib.IMAP4_SSL(self.config.imap_server, self.config.imap_port)
        else:
            server = imaplib.IMAP4(self.config.imap_server, self.config.imap_port)

        server.login(self.config.imap_username, self.config.imap_password)
        server.select(self.config.mailbox)
        return server

    async def disconnect(self) -> None:
        """Disconnect from IMAP server."""
        # This would be implemented if we maintain persistent connections
        pass

    async def get_unread_emails(self, limit: int = 10) -> List[EmailMessage]:
        """
        Get unread emails from IMAP server.

        Args:
            limit: Maximum number of emails to retrieve

        Returns:
            List of unread EmailMessage objects
        """
        try:
            # Run IMAP operations in thread pool
            loop = asyncio.get_event_loop()
            emails = await loop.run_in_executor(
                None, self._get_unread_emails_sync, limit
            )

            # Process each email
            processed_emails = []
            for email_msg in emails:
                # Detect if it's an agent email
                email_msg = await self._detect_agent_email(email_msg)

                # Process agent-specific functionality
                if email_msg.is_agent_email:
                    await self._process_agent_email(email_msg)
                    await self._trigger_automated_responses(email_msg)

                # Store the email
                self.received_emails.append(email_msg)
                processed_emails.append(email_msg)

            # Save received emails
            self._save_received_emails()

            return processed_emails

        except Exception as e:
            logger.error(f"Failed to get unread emails: {e}")
            return []

    def _get_unread_emails_sync(self, limit: int) -> List[EmailMessage]:
        """Synchronous IMAP email retrieval."""
        server = None
        try:
            # Connect to server
            server = self._connect_sync()

            # Search for unread emails
            status, messages = server.search(None, "UNSEEN")
            if status != "OK":
                logger.error("Failed to search for unread emails")
                return []

            # Get message IDs
            message_ids = messages[0].split()
            if not message_ids:
                logger.info("No unread emails found")
                return []

            # Limit the number of emails
            message_ids = (
                message_ids[-limit:] if len(message_ids) > limit else message_ids
            )

            emails = []
            for msg_id in message_ids:
                try:
                    # Fetch email
                    status, msg_data = server.fetch(msg_id, "(RFC822)")
                    if status != "OK":
                        continue

                    # Parse email
                    email_msg = self._parse_email(msg_data[0][1])
                    if email_msg:
                        emails.append(email_msg)

                except Exception as e:
                    logger.error(f"Failed to fetch email {msg_id}: {e}")
                    continue

            return emails

        except Exception as e:
            logger.error(f"IMAP error: {e}")
            return []
        finally:
            if server:
                server.close()
                server.logout()

    async def get_recent_emails(
        self, days: int = 7, limit: int = 10
    ) -> List[EmailMessage]:
        """
        Get recent emails from IMAP server.

        Args:
            days: Number of days to look back
            limit: Maximum number of emails to retrieve

        Returns:
            List of recent EmailMessage objects
        """
        try:
            # Run IMAP operations in thread pool
            loop = asyncio.get_event_loop()
            emails = await loop.run_in_executor(
                None, self._get_recent_emails_sync, days, limit
            )

            # Process each email
            processed_emails = []
            for email_msg in emails:
                # Detect if it's an agent email
                email_msg = await self._detect_agent_email(email_msg)

                # Process agent-specific functionality
                if email_msg.is_agent_email:
                    await self._process_agent_email(email_msg)

                # Store the email
                self.received_emails.append(email_msg)
                processed_emails.append(email_msg)

            # Save received emails
            self._save_received_emails()

            return processed_emails

        except Exception as e:
            logger.error(f"Failed to get recent emails: {e}")
            return []

    def _get_recent_emails_sync(self, days: int, limit: int) -> List[EmailMessage]:
        """Synchronous IMAP recent email retrieval."""
        server = None
        try:
            # Connect to server
            server = self._connect_sync()

            # Calculate date range
            since_date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")

            # Search for recent emails
            status, messages = server.search(None, f'SINCE "{since_date}"')
            if status != "OK":
                logger.error("Failed to search for recent emails")
                return []

            # Get message IDs
            message_ids = messages[0].split()
            if not message_ids:
                logger.info("No recent emails found")
                return []

            # Limit the number of emails
            message_ids = (
                message_ids[-limit:] if len(message_ids) > limit else message_ids
            )

            emails = []
            for msg_id in message_ids:
                try:
                    # Fetch email
                    status, msg_data = server.fetch(msg_id, "(RFC822)")
                    if status != "OK":
                        continue

                    # Parse email
                    email_msg = self._parse_email(msg_data[0][1])
                    if email_msg:
                        emails.append(email_msg)

                except Exception as e:
                    logger.error(f"Failed to fetch email {msg_id}: {e}")
                    continue

            return emails

        except Exception as e:
            logger.error(f"IMAP error: {e}")
            return []
        finally:
            if server:
                server.close()
                server.logout()

    def _parse_email(self, raw_email: bytes) -> Optional[EmailMessage]:
        """Parse raw email data into EmailMessage object."""
        try:
            # Parse email message
            msg = email.message_from_bytes(raw_email)

            # Extract basic information
            message_id = msg.get("Message-ID", "")
            subject = self._decode_header(msg.get("Subject", ""))
            sender = self._decode_header(msg.get("From", ""))
            recipient = self._decode_header(msg.get("To", ""))
            date_str = msg.get("Date", "")

            # Parse date
            try:
                date = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            except:
                try:
                    date = datetime.strptime(date_str, "%d %b %Y %H:%M:%S %z")
                except:
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
            logger.error(f"Failed to parse email: {e}")
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
        except Exception as e:
            logger.error(f"Failed to decode header: {e}")
            return header

    def _extract_body_and_attachments(
        self, msg: email.message.Message
    ) -> Tuple[str, Optional[str], List[Dict[str, Any]]]:
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
                        attachment_data = {
                            "filename": filename,
                            "content_type": content_type,
                            "size": len(part.get_payload(decode=True) or b""),
                            "data": part.get_payload(decode=True),
                        }
                        attachments.append(attachment_data)

                # Handle text content
                elif content_type == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            body = payload.decode("utf-8")
                        except UnicodeDecodeError:
                            body = payload.decode("utf-8", errors="ignore")

                elif content_type == "text/html":
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            html_body = payload.decode("utf-8")
                        except UnicodeDecodeError:
                            html_body = payload.decode("utf-8", errors="ignore")

        else:
            # Single part message
            content_type = msg.get_content_type()
            payload = msg.get_payload(decode=True)

            if payload:
                try:
                    content = payload.decode("utf-8")
                except UnicodeDecodeError:
                    content = payload.decode("utf-8", errors="ignore")

                if content_type == "text/plain":
                    body = content
                elif content_type == "text/html":
                    html_body = content

        return body, html_body, attachments

    async def mark_as_read(self, message_id: str) -> bool:
        """
        Mark email as read.

        Args:
            message_id: Email message ID

        Returns:
            True if successful
        """
        try:
            # Run IMAP operations in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, self._mark_as_read_sync, message_id
            )
            return result
        except Exception as e:
            logger.error(f"Failed to mark email as read: {e}")
            return False

    def _mark_as_read_sync(self, message_id: str) -> bool:
        """Synchronous IMAP mark as read."""
        server = None
        try:
            # Connect to server
            server = self._connect_sync()

            # Search for the message
            status, messages = server.search(None, f'HEADER Message-ID "{message_id}"')
            if status != "OK":
                return False

            message_ids = messages[0].split()
            if not message_ids:
                return False

            # Mark as read
            for msg_id in message_ids:
                server.store(msg_id, "+FLAGS", "\\Seen")

            return True

        except Exception as e:
            logger.error(f"IMAP error: {e}")
            return False
        finally:
            if server:
                server.close()
                server.logout()

    async def get_mailbox_info(self) -> Dict[str, Any]:
        """
        Get mailbox information.

        Returns:
            Dictionary with mailbox statistics
        """
        try:
            # Run IMAP operations in thread pool
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, self._get_mailbox_info_sync)
            return info
        except Exception as e:
            logger.error(f"Failed to get mailbox info: {e}")
            return {}

    def _get_mailbox_info_sync(self) -> Dict[str, Any]:
        """Synchronous IMAP mailbox info retrieval."""
        server = None
        try:
            # Connect to server
            server = self._connect_sync()

            # Get mailbox status
            status, messages = server.status(self.config.mailbox, "(MESSAGES UNSEEN)")
            if status != "OK":
                return {}

            # Parse status response
            info = {}
            for item in messages[0].decode().split():
                if "MESSAGES" in item:
                    info["total_messages"] = int(item.split("MESSAGES")[1].strip("()"))
                elif "UNSEEN" in item:
                    info["unread_messages"] = int(item.split("UNSEEN")[1].strip("()"))

            return info

        except Exception as e:
            logger.error(f"IMAP error: {e}")
            return {}
        finally:
            if server:
                server.close()
                server.logout()

    async def get_agent_emails(
        self, agent_id: str, limit: int = 50
    ) -> List[EmailMessage]:
        """
        Get emails for a specific agent.

        Args:
            agent_id: Agent ID
            limit: Maximum number of emails to retrieve

        Returns:
            List of EmailMessage objects for the agent
        """
        try:
            # Filter received emails for the agent
            agent_emails = [
                email_msg
                for email_msg in self.received_emails
                if email_msg.from_agent == agent_id or email_msg.to_agent == agent_id
            ]

            # Sort by date (newest first)
            agent_emails.sort(key=lambda x: x.date, reverse=True)

            # Limit results
            return agent_emails[:limit]

        except Exception as e:
            logger.error(f"Failed to get agent emails: {e}")
            return []

    async def get_received_emails_summary(self) -> Dict[str, Any]:
        """
        Get summary of received emails.

        Returns:
            Dictionary with email statistics
        """
        try:
            total_emails = len(self.received_emails)
            agent_emails = len([e for e in self.received_emails if e.is_agent_email])
            unread_emails = len(
                [e for e in self.received_emails if e.status == "received"]
            )

            # Get unique senders and recipients
            senders = set(e.sender for e in self.received_emails)
            recipients = set(e.recipient for e in self.received_emails)

            # Get recent activity (last 24 hours)
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_emails = len(
                [e for e in self.received_emails if e.date > recent_cutoff]
            )

            return {
                "total_emails": total_emails,
                "agent_emails": agent_emails,
                "unread_emails": unread_emails,
                "unique_senders": len(senders),
                "unique_recipients": len(recipients),
                "recent_emails_24h": recent_emails,
                "last_email_date": (
                    max(e.date for e in self.received_emails).isoformat()
                    if self.received_emails
                    else None
                ),
            }

        except Exception as e:
            logger.error(f"Failed to get email summary: {e}")
            return {}

    async def start_email_monitoring(self, interval: int = 60) -> None:
        """
        Start monitoring for new emails.

        Args:
            interval: Check interval in seconds
        """
        logger.info(f"Starting email monitoring with {interval}s interval")

        while True:
            try:
                # Get unread emails
                unread_emails = await self.get_unread_emails(limit=10)

                if unread_emails:
                    logger.info(f"Retrieved {len(unread_emails)} unread emails")

                # Wait for next check
                await asyncio.sleep(interval)

            except Exception as e:
                logger.error(f"Email monitoring error: {e}")
                await asyncio.sleep(interval)

    async def mark_email_as_processed(self, message_id: str) -> bool:
        """
        Mark email as processed.

        Args:
            message_id: Email message ID

        Returns:
            True if successful
        """
        try:
            # Find and update email status
            for email_msg in self.received_emails:
                if email_msg.message_id == message_id:
                    email_msg.status = "processed"
                    self._save_received_emails()
                    return True

            return False

        except Exception as e:
            logger.error(f"Failed to mark email as processed: {e}")
            return False


# Global IMAP service instance
imap_service = IMAPService()
