"""
IMAP Service for Reynard Backend.

This module provides email receiving functionality using IMAP.
"""

import asyncio
import logging
import imaplib
import email
from email.header import decode_header
from typing import List, Optional, Dict, Any, Tuple, Union
from datetime import datetime, timedelta
import os
from dataclasses import dataclass

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
    """IMAP service for receiving emails."""
    
    def __init__(self, config: Optional[IMAPConfig] = None):
        self.config = config or IMAPConfig()
        self._validate_config()
        self._connection: Optional[Union[imaplib.IMAP4, imaplib.IMAP4_SSL]] = None
    
    def _validate_config(self) -> None:
        """Validate IMAP configuration."""
        if not self.config.imap_username:
            raise ValueError("IMAP username is required")
        if not self.config.imap_password:
            raise ValueError("IMAP password is required")
    
    async def connect(self) -> bool:
        """
        Connect to IMAP server.
        
        Returns:
            bool: True if connection successful
        """
        try:
            # Run IMAP connection in thread pool
            loop = asyncio.get_event_loop()
            self._connection = await loop.run_in_executor(
                None, 
                self._connect_sync
            )
            return True
        except Exception as e:
            logger.error(f"Failed to connect to IMAP server: {e}")
            return False
    
    def _connect_sync(self) -> Union[imaplib.IMAP4, imaplib.IMAP4_SSL]:
        """Synchronous IMAP connection."""
        if self.config.use_ssl:
            connection = imaplib.IMAP4_SSL(self.config.imap_server, self.config.imap_port)
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
    
    async def get_unread_emails(self, limit: int = 10) -> List[EmailMessage]:
        """
        Get unread emails.
        
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
                None,
                self._get_unread_emails_sync,
                limit
            )
            return emails
        except Exception as e:
            logger.error(f"Failed to get unread emails: {e}")
            return []
    
    def _get_unread_emails_sync(self, limit: int) -> List[EmailMessage]:
        """Synchronous method to get unread emails."""
        # Search for unread emails
        status, messages = self._connection.search(None, 'UNSEEN')
        if status != 'OK':
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
                status, msg_data = self._connection.fetch(email_id, '(RFC822)')
                if status != 'OK':
                    continue
                
                # Parse email
                email_message = self._parse_email(msg_data[0][1])
                if email_message:
                    emails.append(email_message)
                    
            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue
        
        return emails
    
    async def get_recent_emails(self, days: int = 7, limit: int = 10) -> List[EmailMessage]:
        """
        Get recent emails from the last N days.
        
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
                None,
                self._get_recent_emails_sync,
                days,
                limit
            )
            return emails
        except Exception as e:
            logger.error(f"Failed to get recent emails: {e}")
            return []
    
    def _get_recent_emails_sync(self, days: int, limit: int) -> List[EmailMessage]:
        """Synchronous method to get recent emails."""
        # Calculate date range
        since_date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")
        
        # Search for emails since date
        status, messages = self._connection.search(None, f'SINCE {since_date}')
        if status != 'OK':
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
                status, msg_data = self._connection.fetch(email_id, '(RFC822)')
                if status != 'OK':
                    continue
                
                # Parse email
                email_message = self._parse_email(msg_data[0][1])
                if email_message:
                    emails.append(email_message)
                    
            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue
        
        return emails
    
    def _parse_email(self, raw_email: bytes) -> Optional[EmailMessage]:
        """Parse raw email data into EmailMessage object."""
        try:
            # Parse email
            msg = email.message_from_bytes(raw_email)
            
            # Extract headers
            subject = self._decode_header(msg.get('Subject', ''))
            sender = self._decode_header(msg.get('From', ''))
            recipient = self._decode_header(msg.get('To', ''))
            message_id = msg.get('Message-ID', '')
            
            # Parse date
            date_str = msg.get('Date', '')
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
                attachments=attachments
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
                        decoded_string += part.decode('utf-8', errors='ignore')
                else:
                    decoded_string += part
            return decoded_string
        except Exception:
            return header
    
    def _extract_body_and_attachments(self, msg: email.message.Message) -> Tuple[str, Optional[str], List[Dict[str, Any]]]:
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
                        attachments.append({
                            "filename": filename,
                            "content_type": content_type,
                            "size": len(part.get_payload(decode=True) or b"")
                        })
                
                # Handle text content
                elif content_type == "text/plain" and "attachment" not in content_disposition:
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            body = payload.decode('utf-8')
                        except Exception:
                            body = payload.decode('utf-8', errors='ignore')
                
                elif content_type == "text/html" and "attachment" not in content_disposition:
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            html_body = payload.decode('utf-8')
                        except Exception:
                            html_body = payload.decode('utf-8', errors='ignore')
        else:
            # Simple message
            content_type = msg.get_content_type()
            payload = msg.get_payload(decode=True)
            if payload:
                try:
                    text = payload.decode('utf-8')
                except Exception:
                    text = payload.decode('utf-8', errors='ignore')
                
                if content_type == "text/html":
                    html_body = text
                else:
                    body = text
        
        return body, html_body, attachments
    
    async def mark_as_read(self, message_id: str) -> bool:
        """
        Mark an email as read.
        
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
                None,
                self._mark_as_read_sync,
                message_id
            )
            return result
        except Exception as e:
            logger.error(f"Failed to mark email as read: {e}")
            return False
    
    def _mark_as_read_sync(self, message_id: str) -> bool:
        """Synchronous method to mark email as read."""
        try:
            # Search for the specific message
            status, messages = self._connection.search(None, f'HEADER Message-ID "{message_id}"')
            if status != 'OK' or not messages[0]:
                return False
            
            email_id = messages[0].split()[0]
            
            # Mark as read
            status, _ = self._connection.store(email_id, '+FLAGS', '\\Seen')
            return status == 'OK'
            
        except Exception as e:
            logger.error(f"Error marking email as read: {e}")
            return False
    
    async def get_mailbox_info(self) -> Dict[str, Any]:
        """
        Get mailbox information.
        
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
    
    def _get_mailbox_info_sync(self) -> Dict[str, Any]:
        """Synchronous method to get mailbox info."""
        try:
            # Get mailbox status
            status, messages = self._connection.status(self.config.mailbox, '(MESSAGES UNSEEN)')
            if status != 'OK':
                return {}
            
            # Parse response
            info = {}
            for item in messages[0].decode().split():
                if 'MESSAGES' in item:
                    info['total_messages'] = int(item.split('(')[1])
                elif 'UNSEEN' in item:
                    info['unread_messages'] = int(item.split('(')[1])
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting mailbox info: {e}")
            return {}


# Global IMAP service instance
imap_service = IMAPService()
