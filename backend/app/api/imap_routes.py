"""
IMAP API routes for Reynard Backend.

This module provides REST API endpoints for email receiving functionality.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query

from ..auth.user_service import get_current_active_user
from ..services.imap_service import imap_service
from ..models.email_models import EmailStatusModel

router = APIRouter(prefix="/api/imap", tags=["imap"])


@router.get("/status", response_model=EmailStatusModel)
async def get_imap_status(
    _current_user: dict = Depends(get_current_active_user)
) -> EmailStatusModel:
    """
    Get IMAP service status.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        EmailStatusModel: IMAP service status
    """
    try:
        # Test IMAP connection
        test_connection = False
        try:
            await imap_service.connect()
            test_connection = True
            await imap_service.disconnect()
        except Exception:
            test_connection = False
        
        return EmailStatusModel(
            service_configured=bool(imap_service.config.imap_username and imap_service.config.imap_password),
            smtp_server=imap_service.config.imap_server,
            from_email=imap_service.config.imap_username,
            test_connection=test_connection,
            last_test_time=None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get IMAP status: {str(e)}"
        )


@router.get("/unread")
async def get_unread_emails(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of emails to retrieve"),
    _current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get unread emails.
    
    Args:
        limit: Maximum number of emails to retrieve
        current_user: Current authenticated user
        
    Returns:
        Dict containing unread emails
    """
    try:
        emails = await imap_service.get_unread_emails(limit=limit)
        
        # Convert EmailMessage objects to dictionaries
        email_list = []
        for email_msg in emails:
            email_dict = {
                "message_id": email_msg.message_id,
                "subject": email_msg.subject,
                "sender": email_msg.sender,
                "recipient": email_msg.recipient,
                "date": email_msg.date.isoformat(),
                "body": email_msg.body,
                "html_body": email_msg.html_body,
                "attachments": email_msg.attachments
            }
            email_list.append(email_dict)
        
        return {
            "success": True,
            "count": len(email_list),
            "emails": email_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread emails: {str(e)}"
        )


@router.get("/recent")
async def get_recent_emails(
    days: int = Query(7, ge=1, le=30, description="Number of days to look back"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of emails to retrieve"),
    _current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get recent emails from the last N days.
    
    Args:
        days: Number of days to look back
        limit: Maximum number of emails to retrieve
        current_user: Current authenticated user
        
    Returns:
        Dict containing recent emails
    """
    try:
        emails = await imap_service.get_recent_emails(days=days, limit=limit)
        
        # Convert EmailMessage objects to dictionaries
        email_list = []
        for email_msg in emails:
            email_dict = {
                "message_id": email_msg.message_id,
                "subject": email_msg.subject,
                "sender": email_msg.sender,
                "recipient": email_msg.recipient,
                "date": email_msg.date.isoformat(),
                "body": email_msg.body,
                "html_body": email_msg.html_body,
                "attachments": email_msg.attachments
            }
            email_list.append(email_dict)
        
        return {
            "success": True,
            "count": len(email_list),
            "days": days,
            "emails": email_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recent emails: {str(e)}"
        )


@router.post("/mark-read")
async def mark_email_as_read(
    message_id: str,
    _current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Mark an email as read.
    
    Args:
        message_id: Email message ID
        current_user: Current authenticated user
        
    Returns:
        Dict containing operation result
    """
    try:
        success = await imap_service.mark_as_read(message_id)
        
        return {
            "success": success,
            "message_id": message_id,
            "message": "Email marked as read" if success else "Failed to mark email as read"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark email as read: {str(e)}"
        )


@router.get("/mailbox-info")
async def get_mailbox_info(
    _current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get mailbox information and statistics.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Dict containing mailbox statistics
    """
    try:
        info = await imap_service.get_mailbox_info()
        
        return {
            "success": True,
            "mailbox": imap_service.config.mailbox,
            "info": info
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get mailbox info: {str(e)}"
        )


@router.post("/test-connection")
async def test_imap_connection(
    _current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Test IMAP connection.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Dict containing test result
    """
    try:
        # Test connection
        connected = await imap_service.connect()
        
        if connected:
            # Get mailbox info
            info = await imap_service.get_mailbox_info()
            await imap_service.disconnect()
            
            return {
                "success": True,
                "message": "IMAP connection successful",
                "mailbox_info": info
            }
        else:
            return {
                "success": False,
                "message": "Failed to connect to IMAP server"
            }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"IMAP connection test failed: {str(e)}"
        }
