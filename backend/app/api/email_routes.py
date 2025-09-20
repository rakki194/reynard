"""
Email API routes for Reynard Backend.

This module provides REST API endpoints for email functionality.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends

from ..auth.user_service import get_current_active_user
from ..services.email_service import email_service, EmailMessage, EmailAttachment
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
