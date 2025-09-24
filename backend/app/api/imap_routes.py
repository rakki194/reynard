"""IMAP API Routes for Reynard Backend.

This module provides API endpoints for email receiving functionality.
"""

import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from ..auth.user_service import get_current_active_user
from ..services.email.core.imap_service import imap_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/imap", tags=["imap"])


@router.get("/status")
async def get_imap_status(
    current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Get IMAP service status and connection info.

    Returns:
        Dict containing IMAP service status

    """
    try:
        # Try to connect to check status
        connected = await imap_service.connect()

        if connected:
            mailbox_info = await imap_service.get_mailbox_info()
            await imap_service.disconnect()
        else:
            mailbox_info = {}

        return {
            "status": "connected" if connected else "disconnected",
            "mailbox_info": mailbox_info,
            "config": {
                "imap_server": imap_service.config.imap_server,
                "imap_port": imap_service.config.imap_port,
                "mailbox": imap_service.config.mailbox,
                "use_ssl": imap_service.config.use_ssl,
            },
        }

    except Exception as e:
        logger.error(f"Failed to get IMAP status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get IMAP status: {e!s}",
        )


@router.get("/emails/unread")
async def get_unread_emails(
    limit: int = 10, current_user: dict = Depends(get_current_active_user),
) -> list[dict[str, Any]]:
    """Get unread emails.

    Args:
        limit: Maximum number of emails to retrieve

    Returns:
        List of unread emails

    """
    try:
        emails = await imap_service.get_unread_emails(limit=limit)

        return [
            {
                "message_id": email.message_id,
                "subject": email.subject,
                "sender": email.sender,
                "recipient": email.recipient,
                "date": email.date.isoformat(),
                "body": email.body,
                "html_body": email.html_body,
                "attachments": email.attachments,
                "from_agent": email.from_agent,
                "to_agent": email.to_agent,
                "is_agent_email": email.is_agent_email,
                "status": email.status,
            }
            for email in emails
        ]

    except Exception as e:
        logger.error(f"Failed to get unread emails: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get unread emails: {e!s}",
        )


@router.get("/emails/recent")
async def get_recent_emails(
    days: int = 7,
    limit: int = 10,
    current_user: dict = Depends(get_current_active_user),
) -> list[dict[str, Any]]:
    """Get recent emails from the last N days.

    Args:
        days: Number of days to look back
        limit: Maximum number of emails to retrieve

    Returns:
        List of recent emails

    """
    try:
        emails = await imap_service.get_recent_emails(days=days, limit=limit)

        return [
            {
                "message_id": email.message_id,
                "subject": email.subject,
                "sender": email.sender,
                "recipient": email.recipient,
                "date": email.date.isoformat(),
                "body": email.body,
                "html_body": email.html_body,
                "attachments": email.attachments,
                "from_agent": email.from_agent,
                "to_agent": email.to_agent,
                "is_agent_email": email.is_agent_email,
                "status": email.status,
            }
            for email in emails
        ]

    except Exception as e:
        logger.error(f"Failed to get recent emails: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get recent emails: {e!s}",
        )


@router.get("/emails/agent/{agent_id}")
async def get_agent_emails(
    agent_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_active_user),
) -> list[dict[str, Any]]:
    """Get emails for a specific agent.

    Args:
        agent_id: Agent ID to get emails for
        limit: Maximum number of emails to retrieve

    Returns:
        List of agent emails

    """
    try:
        emails = await imap_service.get_agent_emails(agent_id=agent_id, limit=limit)

        return [
            {
                "message_id": email.message_id,
                "subject": email.subject,
                "sender": email.sender,
                "recipient": email.recipient,
                "date": email.date.isoformat(),
                "body": email.body,
                "html_body": email.html_body,
                "attachments": email.attachments,
                "from_agent": email.from_agent,
                "to_agent": email.to_agent,
                "is_agent_email": email.is_agent_email,
                "status": email.status,
            }
            for email in emails
        ]

    except Exception as e:
        logger.error(f"Failed to get agent emails: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get agent emails: {e!s}",
        )


@router.get("/emails/summary")
async def get_emails_summary(
    current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Get summary of received emails.

    Returns:
        Dict containing email statistics

    """
    try:
        summary = await imap_service.get_received_emails_summary()
        return summary

    except Exception as e:
        logger.error(f"Failed to get email summary: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get email summary: {e!s}",
        )


@router.post("/emails/{message_id}/mark-read")
async def mark_email_as_read(
    message_id: str, current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Mark an email as read.

    Args:
        message_id: Email message ID

    Returns:
        Success status

    """
    try:
        success = await imap_service.mark_as_read(message_id)

        if success:
            return {"success": True, "message": "Email marked as read"}
        raise HTTPException(
            status_code=404, detail="Email not found or could not be marked as read",
        )

    except Exception as e:
        logger.error(f"Failed to mark email as read: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to mark email as read: {e!s}",
        )


@router.post("/emails/{message_id}/mark-processed")
async def mark_email_as_processed(
    message_id: str, current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Mark an email as processed.

    Args:
        message_id: Email message ID

    Returns:
        Success status

    """
    try:
        success = await imap_service.mark_email_as_processed(message_id)

        if success:
            return {"success": True, "message": "Email marked as processed"}
        raise HTTPException(
            status_code=404,
            detail="Email not found or could not be marked as processed",
        )

    except Exception as e:
        logger.error(f"Failed to mark email as processed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to mark email as processed: {e!s}",
        )


@router.post("/monitoring/start")
async def start_email_monitoring(
    interval: int = 60,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Start email monitoring in the background.

    Args:
        interval: Check interval in seconds
        background_tasks: FastAPI background tasks

    Returns:
        Success status

    """
    try:
        if background_tasks:
            background_tasks.add_task(imap_service.start_email_monitoring, interval)
            return {
                "success": True,
                "message": f"Email monitoring started with {interval}s interval",
            }
        raise HTTPException(
            status_code=500, detail="Background tasks not available",
        )

    except Exception as e:
        logger.error(f"Failed to start email monitoring: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to start email monitoring: {e!s}",
        )


@router.get("/test")
async def test_imap_connection(
    current_user: dict = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Test IMAP connection and basic functionality.

    Returns:
        Test results

    """
    try:
        # Test connection
        connected = await imap_service.connect()

        if not connected:
            return {
                "success": False,
                "message": "Failed to connect to IMAP server",
                "details": "Check your IMAP configuration",
            }

        # Test mailbox info
        mailbox_info = await imap_service.get_mailbox_info()

        # Test getting a few emails
        test_emails = await imap_service.get_unread_emails(limit=1)

        await imap_service.disconnect()

        return {
            "success": True,
            "message": "IMAP connection test successful",
            "details": {
                "mailbox_info": mailbox_info,
                "test_emails_count": len(test_emails),
                "connection_status": "connected",
            },
        }

    except Exception as e:
        logger.error(f"IMAP connection test failed: {e}")
        return {
            "success": False,
            "message": f"IMAP connection test failed: {e!s}",
            "details": "Check your IMAP configuration and credentials",
        }
