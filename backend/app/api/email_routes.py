"""
Email API routes for Reynard Backend.

This module provides REST API endpoints for email functionality.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import asdict
from fastapi import APIRouter, HTTPException, status, Depends, Query

from ..auth.user_service import get_current_active_user
from ..services.email_service import email_service, EmailMessage, EmailAttachment
from ..services.email_analytics_service import email_analytics_service
from ..services.email_encryption_service import email_encryption_service
from ..services.calendar_integration_service import calendar_integration_service
from ..services.ai_email_response_service import get_ai_email_response_service
from ..services.multi_account_service import multi_account_service
from ..models.email_models import (
    EmailSendRequest,
    EmailSendResponse,
    EmailBulkRequest,
    EmailBulkResponse,
    EmailStatusModel,
)

router = APIRouter(prefix="/api/email", tags=["email"])


@router.post("/send", response_model=EmailSendResponse)
async def send_email(
    request: EmailSendRequest, current_user: dict = Depends(get_current_active_user)
) -> EmailSendResponse:
    """
    Send an email.

    Args:
        request: Email send request
        current_user: Current authenticated user

    Returns:
        EmailSendResponse: Send result
    """
    try:
        # Log the email send attempt by the authenticated user
        user_id = current_user.get("id", "unknown")

        # Convert attachments
        attachments = []
        if request.attachments:
            for att in request.attachments:
                attachments.append(EmailAttachment(att.file_path, att.filename))

        # Create email message
        message = EmailMessage(
            to_emails=request.to_emails,
            subject=request.subject,
            body=request.body,
            html_body=request.html_body,
            cc_emails=request.cc_emails,
            bcc_emails=request.bcc_emails,
            attachments=attachments,
            reply_to=request.reply_to,
        )

        # Send email
        result = await email_service.send_email(message)

        return EmailSendResponse(
            success=result["success"],
            message_id=result.get("message_id"),
            sent_at=result.get("sent_at"),
            recipients=result["recipients"],
            error=result.get("error")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}",
        )


@router.post("/send-simple", response_model=EmailSendResponse)
async def send_simple_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str = None,
    current_user: dict = Depends(get_current_active_user),
) -> EmailSendResponse:
    """
    Send a simple email.

    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body
        html_body: Optional HTML body
        current_user: Current authenticated user

    Returns:
        EmailSendResponse: Send result
    """
    try:
        # Log the simple email send attempt by the authenticated user
        user_id = current_user.get("id", "unknown")

        result = await email_service.send_simple_email(
            to_email=to_email, subject=subject, body=body, html_body=html_body
        )

        return EmailSendResponse(
            success=result["success"],
            message_id=result.get("message_id"),
            sent_at=result.get("sent_at"),
            recipients=[to_email],
            error=result.get("error")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}",
        )


@router.post("/send-bulk", response_model=EmailBulkResponse)
async def send_bulk_email(
    request: EmailBulkRequest, current_user: dict = Depends(get_current_active_user)
) -> EmailBulkResponse:
    """
    Send bulk emails.

    Args:
        request: Bulk email request
        current_user: Current authenticated user

    Returns:
        EmailBulkResponse: Bulk send results
    """
    try:
        # Log the bulk email send attempt by the authenticated user
        user_id = current_user.get("id", "unknown")
        
        import time

        start_time = time.time()

        # Process in batches
        results = []
        successful_sends = 0
        failed_sends = 0
        batch_count = 0

        for i in range(0, len(request.to_emails), request.batch_size):
            batch = request.to_emails[i : i + request.batch_size]
            batch_count += 1

            try:
                result = await email_service.send_bulk_email(
                    to_emails=batch,
                    subject=request.subject,
                    body=request.body,
                    html_body=request.html_body,
                )

                if result["success"]:
                    successful_sends += len(batch)
                    results.append(EmailSendResponse(
                        success=True, 
                        recipients=batch,
                        message_id=None,
                        sent_at=None,
                        error=None
                    ))
                else:
                    failed_sends += len(batch)
                    results.append(
                        EmailSendResponse(
                            success=False, 
                            recipients=batch, 
                            error="Bulk send failed",
                            message_id=None,
                            sent_at=None
                        )
                    )

            except Exception as e:
                failed_sends += len(batch)
                results.append(
                    EmailSendResponse(
                        success=False, 
                        recipients=batch, 
                        error=str(e),
                        message_id=None,
                        sent_at=None
                    )
                )

            # Delay between batches
            if i + request.batch_size < len(request.to_emails):
                import asyncio

                await asyncio.sleep(request.delay_between_batches)

        processing_time = time.time() - start_time

        return EmailBulkResponse(
            total_recipients=len(request.to_emails),
            successful_sends=successful_sends,
            failed_sends=failed_sends,
            batch_count=batch_count,
            processing_time=processing_time,
            results=results,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send bulk emails: {str(e)}",
        )


@router.get("/status", response_model=EmailStatusModel)
async def get_email_status(
    current_user: dict = Depends(get_current_active_user),
) -> EmailStatusModel:
    """
    Get email service status.

    Args:
        current_user: Current authenticated user

    Returns:
        EmailStatusModel: Email service status
    """
    try:
        # Log the status check by the authenticated user
        user_id = current_user.get("id", "unknown")
        
        # Test SMTP connection
        test_connection = False
        try:
            # Simple connection test
            import smtplib

            server = smtplib.SMTP(
                email_service.config.smtp_server, email_service.config.smtp_port
            )
            if email_service.config.use_tls:
                server.starttls()
            server.quit()
            test_connection = True
        except Exception:
            test_connection = False

        return EmailStatusModel(
            service_configured=bool(
                email_service.config.smtp_username
                and email_service.config.smtp_password
            ),
            smtp_server=email_service.config.smtp_server,
            from_email=email_service.config.from_email,
            test_connection=test_connection,
            last_test_time=None
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get email status: {str(e)}",
        )


@router.post("/test")
async def test_email_connection(
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Test email service connection.

    Args:
        current_user: Current authenticated user

    Returns:
        Dict: Test result
    """
    try:
        # Send a test email to the current user
        test_subject = "Reynard Email Service Test"
        test_body = f"""
Hello {current_user.get('full_name', current_user.get('username', 'User'))},

This is a test email from the Reynard email service.

If you received this email, the email service is working correctly!

Best regards,
Reynard System
        """.strip()

        result = await email_service.send_simple_email(
            to_email=current_user["email"], subject=test_subject, body=test_body
        )

        return {
            "success": result["success"],
            "message": (
                "Test email sent successfully"
                if result["success"]
                else "Failed to send test email"
            ),
            "recipient": current_user["email"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email test failed: {str(e)}",
        )


# ============================================================================
# ADVANCED EMAIL FEATURES
# ============================================================================

# Email Analytics Routes
@router.get("/analytics/metrics")
async def get_email_analytics_metrics(
    period_start: Optional[datetime] = Query(None, description="Start of analysis period"),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    use_cache: bool = Query(True, description="Use cached results"),
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get comprehensive email metrics for a given period."""
    try:
        metrics = await email_analytics_service.get_email_metrics(
            period_start=period_start,
            period_end=period_end,
            agent_id=agent_id,
            use_cache=use_cache
        )
        
        return {
            "total_emails": metrics.total_emails,
            "sent_emails": metrics.sent_emails,
            "received_emails": metrics.received_emails,
            "agent_emails": metrics.agent_emails,
            "unread_emails": metrics.unread_emails,
            "replied_emails": metrics.replied_emails,
            "processed_emails": metrics.processed_emails,
            "avg_response_time_hours": metrics.avg_response_time_hours,
            "avg_email_length": metrics.avg_email_length,
            "most_active_hour": metrics.most_active_hour,
            "most_active_day": metrics.most_active_day,
            "top_senders": metrics.top_senders,
            "top_recipients": metrics.top_recipients,
            "email_volume_trend": metrics.email_volume_trend,
            "agent_activity": metrics.agent_activity,
            "content_analysis": metrics.content_analysis,
            "performance_metrics": metrics.performance_metrics,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get email metrics: {str(e)}")


@router.get("/analytics/insights")
async def get_email_analytics_insights(
    period_start: Optional[datetime] = Query(None, description="Start of analysis period"),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """Generate insights from email data."""
    try:
        insights = await email_analytics_service.generate_insights(
            period_start=period_start,
            period_end=period_end,
            agent_id=agent_id
        )
        
        return [
            {
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "severity": insight.severity,
                "confidence": insight.confidence,
                "data": insight.data,
                "timestamp": insight.timestamp.isoformat(),
                "actionable": insight.actionable,
                "suggested_actions": insight.suggested_actions,
            }
            for insight in insights
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")


@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    period_days: int = Query(7, description="Number of days for dashboard data"),
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get comprehensive analytics dashboard data."""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)
        
        # Get all dashboard data in parallel
        import asyncio
        metrics_task = email_analytics_service.get_email_metrics(
            period_start=start_date,
            period_end=end_date
        )
        insights_task = email_analytics_service.generate_insights(
            period_start=start_date,
            period_end=end_date
        )
        volume_trends_task = email_analytics_service.get_email_trends(
            metric="volume",
            period_days=period_days
        )
        
        # Wait for all tasks to complete
        metrics, insights, volume_trends = await asyncio.gather(
            metrics_task,
            insights_task,
            volume_trends_task
        )
        
        # Convert metrics to dictionary
        metrics_dict = {
            "total_emails": metrics.total_emails,
            "sent_emails": metrics.sent_emails,
            "received_emails": metrics.received_emails,
            "agent_emails": metrics.agent_emails,
            "unread_emails": metrics.unread_emails,
            "replied_emails": metrics.replied_emails,
            "processed_emails": metrics.processed_emails,
            "avg_response_time_hours": metrics.avg_response_time_hours,
            "avg_email_length": metrics.avg_email_length,
            "most_active_hour": metrics.most_active_hour,
            "most_active_day": metrics.most_active_day,
            "top_senders": metrics.top_senders,
            "top_recipients": metrics.top_recipients,
            "email_volume_trend": metrics.email_volume_trend,
            "agent_activity": metrics.agent_activity,
            "content_analysis": metrics.content_analysis,
            "performance_metrics": metrics.performance_metrics,
        }
        
        # Convert insights to dictionary
        insights_dict = [
            {
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "severity": insight.severity,
                "confidence": insight.confidence,
                "data": insight.data,
                "timestamp": insight.timestamp.isoformat(),
                "actionable": insight.actionable,
                "suggested_actions": insight.suggested_actions,
            }
            for insight in insights
        ]
        
        return {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "period_days": period_days,
            "metrics": metrics_dict,
            "insights": insights_dict,
            "trends": {
                "volume": volume_trends,
            },
            "generated_at": datetime.now().isoformat(),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics dashboard: {str(e)}")


# Email Encryption Routes
@router.post("/encryption/generate-key")
async def generate_encryption_key(
    name: str,
    email: str,
    passphrase: Optional[str] = None,
    key_length: int = 2048,
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Generate a new PGP encryption key."""
    try:
        key = await email_encryption_service.generate_pgp_key(
            name=name,
            email=email,
            passphrase=passphrase,
            key_length=key_length
        )
        
        return {
            "key_id": key.key_id,
            "fingerprint": key.fingerprint,
            "public_key": key.public_key,
            "user_id": key.user_id,
            "email": key.email,
            "created_at": key.created_at.isoformat(),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate encryption key: {str(e)}")


@router.post("/encryption/encrypt")
async def encrypt_email_content(
    content: str,
    recipient_email: str,
    encryption_method: Optional[str] = None,
    sign_with: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Encrypt email content for a recipient."""
    try:
        encrypted_email = await email_encryption_service.encrypt_email(
            content=content,
            recipient_email=recipient_email,
            encryption_method=encryption_method,
            sign_with=sign_with
        )
        
        return {
            "encrypted_content": encrypted_email.encrypted_content,
            "encryption_method": encrypted_email.encryption_method,
            "key_id": encrypted_email.key_id,
            "signature": encrypted_email.signature,
            "is_signed": encrypted_email.is_signed,
            "encrypted_at": encrypted_email.encrypted_at.isoformat(),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to encrypt email: {str(e)}")


@router.get("/encryption/keys")
async def list_encryption_keys(
    key_type: Optional[str] = Query(None, description="Filter by key type ('pgp' or 'smime')"),
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """List all encryption keys."""
    try:
        keys = await email_encryption_service.list_keys(key_type=key_type)
        
        return [
            {
                "key_id": key.key_id,
                "key_type": key.key_type,
                "fingerprint": key.fingerprint,
                "user_id": key.user_id,
                "email": key.email,
                "created_at": key.created_at.isoformat(),
                "expires_at": key.expires_at.isoformat() if key.expires_at else None,
                "is_revoked": key.is_revoked,
                "trust_level": key.trust_level,
            }
            for key in keys
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list encryption keys: {str(e)}")


# Calendar Integration Routes
@router.post("/calendar/extract-meetings")
async def extract_meeting_requests(
    email_subject: str,
    email_body: str,
    email_message_id: str,
    sender_email: str,
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """Extract meeting requests from email content."""
    try:
        requests = await calendar_integration_service.extract_meeting_requests_from_email(
            email_subject=email_subject,
            email_body=email_body,
            email_message_id=email_message_id,
            sender_email=sender_email
        )
        
        return [
            {
                "request_id": req.request_id,
                "email_message_id": req.email_message_id,
                "subject": req.subject,
                "proposed_times": [t.isoformat() for t in req.proposed_times],
                "duration_minutes": req.duration_minutes,
                "attendees": req.attendees,
                "location": req.location,
                "description": req.description,
                "priority": req.priority,
                "meeting_type": req.meeting_type,
                "extracted_at": req.extracted_at.isoformat(),
                "status": req.status,
            }
            for req in requests
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract meeting requests: {str(e)}")


@router.post("/calendar/schedule-meeting")
async def schedule_meeting_from_request(
    meeting_request_id: str,
    selected_time: Optional[datetime] = None,
    calendar_id: str = "primary",
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Schedule a meeting from a meeting request."""
    try:
        # Get meeting request (simplified - would need proper lookup)
        # For now, create a placeholder request
        from ..services.calendar_integration_service import MeetingRequest
        meeting_request = MeetingRequest(
            request_id=meeting_request_id,
            email_message_id="placeholder",
            subject="Meeting Request",
            proposed_times=[datetime.now() + timedelta(hours=1)],
            duration_minutes=60,
            attendees=[current_user.get("email", "user@example.com")]
        )
        
        event = await calendar_integration_service.schedule_meeting(
            meeting_request=meeting_request,
            selected_time=selected_time,
            calendar_id=calendar_id
        )
        
        return {
            "event_id": event.event_id,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time.isoformat(),
            "end_time": event.end_time.isoformat(),
            "location": event.location,
            "attendees": event.attendees,
            "organizer": event.organizer,
            "status": event.status,
            "calendar_id": event.calendar_id,
            "meeting_link": event.meeting_link,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule meeting: {str(e)}")


@router.get("/calendar/upcoming")
async def get_upcoming_meetings(
    user_email: str,
    days_ahead: int = 7,
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """Get upcoming meetings for a user."""
    try:
        meetings = await calendar_integration_service.get_upcoming_meetings(
            user_email=user_email,
            days_ahead=days_ahead
        )
        
        return [
            {
                "event_id": meeting.event_id,
                "title": meeting.title,
                "description": meeting.description,
                "start_time": meeting.start_time.isoformat(),
                "end_time": meeting.end_time.isoformat(),
                "location": meeting.location,
                "attendees": meeting.attendees,
                "organizer": meeting.organizer,
                "status": meeting.status,
                "meeting_link": meeting.meeting_link,
            }
            for meeting in meetings
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get upcoming meetings: {str(e)}")


# AI-Powered Response Routes
@router.post("/ai/analyze-context")
async def analyze_email_context(
    email_data: Dict[str, Any],
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Analyze email to extract context for AI response generation."""
    try:
        context = await get_ai_email_response_service().analyze_email_context(email_data)
        
        return {
            "original_subject": context.original_subject,
            "original_body": context.original_body,
            "sender_email": context.sender_email,
            "recipient_email": context.recipient_email,
            "sender_name": context.sender_name,
            "recipient_name": context.recipient_name,
            "email_type": context.email_type,
            "priority": context.priority,
            "sentiment": context.sentiment,
            "language": context.language,
            "agent_personality": context.agent_personality,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze email context: {str(e)}")


@router.post("/ai/generate-response")
async def generate_ai_response(
    email_context: Dict[str, Any],
    response_type: str = "reply",
    custom_instructions: Optional[str] = None,
    model: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Generate AI-powered email response."""
    try:
        from ..services.ai_email_response_service import EmailContext
        
        # Convert dict to EmailContext object
        context = EmailContext(**email_context)
        
        response = await get_ai_email_response_service().generate_response(
            email_context=context,
            response_type=response_type,
            custom_instructions=custom_instructions,
            model=model
        )
        
        return {
            "response_id": response.response_id,
            "original_email_id": response.original_email_id,
            "subject": response.subject,
            "body": response.body,
            "html_body": response.html_body,
            "tone": response.tone,
            "confidence_score": response.confidence_score,
            "response_type": response.response_type,
            "suggested_actions": response.suggested_actions,
            "generated_at": response.generated_at.isoformat(),
            "model_used": response.model_used,
            "processing_time_ms": response.processing_time_ms,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI response: {str(e)}")


@router.get("/ai/response-history")
async def get_ai_response_history(
    email_address: str,
    limit: int = 10,
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """Get AI response history for an email address."""
    try:
        responses = await get_ai_email_response_service().get_response_history(
            email_address=email_address,
            limit=limit
        )
        
        return [
            {
                "response_id": resp.response_id,
                "original_email_id": resp.original_email_id,
                "subject": resp.subject,
                "body": resp.body,
                "tone": resp.tone,
                "confidence_score": resp.confidence_score,
                "response_type": resp.response_type,
                "generated_at": resp.generated_at.isoformat(),
                "model_used": resp.model_used,
            }
            for resp in responses
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get response history: {str(e)}")


# Multi-Account Support Routes
@router.post("/accounts/create")
async def create_email_account(
    account_type: str,
    email_address: str,
    display_name: str,
    smtp_config: Dict[str, Any],
    imap_config: Dict[str, Any],
    encryption_config: Optional[Dict[str, Any]] = None,
    calendar_config: Optional[Dict[str, Any]] = None,
    ai_config: Optional[Dict[str, Any]] = None,
    is_primary: bool = False,
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Create a new email account."""
    try:
        account = await multi_account_service.create_account(
            account_type=account_type,
            email_address=email_address,
            display_name=display_name,
            smtp_config=smtp_config,
            imap_config=imap_config,
            encryption_config=encryption_config,
            calendar_config=calendar_config,
            ai_config=ai_config,
            is_primary=is_primary
        )
        
        return {
            "account_id": account.account_id,
            "account_type": account.account_type,
            "email_address": account.email_address,
            "display_name": account.display_name,
            "is_active": account.is_active,
            "is_primary": account.is_primary,
            "created_at": account.created_at.isoformat(),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(e)}")


@router.get("/accounts")
async def list_email_accounts(
    account_type: Optional[str] = Query(None, description="Filter by account type"),
    active_only: bool = Query(True, description="Only return active accounts"),
    current_user: dict = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """List all email accounts."""
    try:
        accounts = await multi_account_service.list_accounts(
            account_type=account_type,
            active_only=active_only
        )
        
        return [
            {
                "account_id": acc.account_id,
                "account_type": acc.account_type,
                "email_address": acc.email_address,
                "display_name": acc.display_name,
                "is_active": acc.is_active,
                "is_primary": acc.is_primary,
                "created_at": acc.created_at.isoformat(),
                "last_used": acc.last_used.isoformat() if acc.last_used else None,
            }
            for acc in accounts
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list accounts: {str(e)}")


@router.get("/accounts/{account_id}")
async def get_account_details(
    account_id: str,
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get detailed account information."""
    try:
        summary = await multi_account_service.get_account_summary(account_id)
        return asdict(summary)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get account details: {str(e)}")


@router.get("/accounts/system/overview")
async def get_system_overview(
    current_user: dict = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get system-wide account overview."""
    try:
        overview = await multi_account_service.get_system_overview()
        return overview
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system overview: {str(e)}")
