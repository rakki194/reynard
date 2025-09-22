"""
Agent Email API routes for Reynard Backend.

This module provides REST API endpoints for agent-to-agent email communication
and automated email generation based on agent interactions.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from ..auth.user_service import get_current_active_user
from ..models.agent_email_models import (
    AgentEmailBulkRequest,
    AgentEmailConfig,
    AgentEmailSendRequest,
    AgentEmailStats,
    AgentEmailTemplate,
    AgentEmailTriggerRequest,
)
from ..models.email_models import (
    EmailBulkRequest,
    EmailBulkResponse,
    EmailSendRequest,
    EmailSendResponse,
)
from ..services.email.ai.agent_email_service import AgentEmailService
from ..services.email.core.email_service import (
    EmailAttachment,
    EmailMessage,
    email_service,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email/agents", tags=["agent-email"])

# Initialize agent email service
agent_email_service = AgentEmailService()


@router.get("/{agent_id}/config", response_model=AgentEmailConfig)
async def get_agent_email_config(
    agent_id: str, current_user: dict = Depends(get_current_active_user)
) -> AgentEmailConfig:
    """
    Get agent email configuration.

    Args:
        agent_id: Agent ID
        current_user: Current authenticated user

    Returns:
        AgentEmailConfig: Agent email configuration
    """
    try:
        config = await agent_email_service.get_agent_config(agent_id)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found or not configured",
            )
        return config
    except Exception as e:
        logger.error(f"Failed to get agent config for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent config: {str(e)}",
        )


@router.put("/{agent_id}/config", response_model=AgentEmailConfig)
async def update_agent_email_config(
    agent_id: str,
    config: AgentEmailConfig,
    current_user: dict = Depends(get_current_active_user),
) -> AgentEmailConfig:
    """
    Update agent email configuration.

    Args:
        agent_id: Agent ID
        config: New agent email configuration
        current_user: Current authenticated user

    Returns:
        AgentEmailConfig: Updated agent email configuration
    """
    try:
        updated_config = await agent_email_service.update_agent_config(agent_id, config)
        return updated_config
    except Exception as e:
        logger.error(f"Failed to update agent config for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update agent config: {str(e)}",
        )


@router.get("/{agent_id}/stats", response_model=AgentEmailStats)
async def get_agent_email_stats(
    agent_id: str, current_user: dict = Depends(get_current_active_user)
) -> AgentEmailStats:
    """
    Get agent email statistics.

    Args:
        agent_id: Agent ID
        current_user: Current authenticated user

    Returns:
        AgentEmailStats: Agent email statistics
    """
    try:
        stats = await agent_email_service.get_agent_stats(agent_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found or no stats available",
            )
        return stats
    except Exception as e:
        logger.error(f"Failed to get agent stats for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent stats: {str(e)}",
        )


@router.get("/{agent_id}/templates", response_model=List[AgentEmailTemplate])
async def get_agent_email_templates(
    agent_id: str, current_user: dict = Depends(get_current_active_user)
) -> List[AgentEmailTemplate]:
    """
    Get agent email templates.

    Args:
        agent_id: Agent ID
        current_user: Current authenticated user

    Returns:
        List[AgentEmailTemplate]: Agent email templates
    """
    try:
        templates = await agent_email_service.get_agent_templates(agent_id)
        return templates
    except Exception as e:
        logger.error(f"Failed to get agent templates for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent templates: {str(e)}",
        )


@router.post("/{agent_id}/templates", response_model=AgentEmailTemplate)
async def create_agent_email_template(
    agent_id: str,
    template: AgentEmailTemplate,
    current_user: dict = Depends(get_current_active_user),
) -> AgentEmailTemplate:
    """
    Create agent email template.

    Args:
        agent_id: Agent ID
        template: Agent email template
        current_user: Current authenticated user

    Returns:
        AgentEmailTemplate: Created agent email template
    """
    try:
        created_template = await agent_email_service.create_agent_template(
            agent_id, template
        )
        return created_template
    except Exception as e:
        logger.error(f"Failed to create agent template for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent template: {str(e)}",
        )


@router.delete("/{agent_id}/templates/{template_id}")
async def delete_agent_email_template(
    agent_id: str,
    template_id: str,
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Delete agent email template.

    Args:
        agent_id: Agent ID
        template_id: Template ID
        current_user: Current authenticated user

    Returns:
        Dict: Deletion result
    """
    try:
        success = await agent_email_service.delete_agent_template(agent_id, template_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template {template_id} not found for agent {agent_id}",
            )
        return {"success": True, "message": "Template deleted successfully"}
    except Exception as e:
        logger.error(
            f"Failed to delete agent template {template_id} for {agent_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete agent template: {str(e)}",
        )


@router.post("/{agent_id}/send", response_model=EmailSendResponse)
async def send_agent_email(
    agent_id: str,
    request: AgentEmailSendRequest,
    current_user: dict = Depends(get_current_active_user),
) -> EmailSendResponse:
    """
    Send email from one agent to another.

    Args:
        agent_id: Sender agent ID
        request: Agent email send request
        current_user: Current authenticated user

    Returns:
        EmailSendResponse: Send result
    """
    try:
        # Get target agent email
        target_config = await agent_email_service.get_agent_config(
            request.target_agent_id
        )
        if not target_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target agent {request.target_agent_id} not found",
            )

        # Create email message
        message = EmailMessage(
            to_emails=[target_config.agent_email],
            subject=request.message.subject,
            body=request.message.body,
            html_body=request.message.html_body,
            cc_emails=request.message.cc_emails,
            bcc_emails=request.message.bcc_emails,
            attachments=request.message.attachments,
            reply_to=request.message.reply_to,
        )

        # Send email
        result = await email_service.send_email(message)

        # Update agent stats
        await agent_email_service.update_agent_stats(agent_id, "sent")
        await agent_email_service.update_agent_stats(
            request.target_agent_id, "received"
        )

        # Log the interaction
        await agent_email_service.log_agent_interaction(
            agent_id,
            request.target_agent_id,
            "email_sent",
            {
                "subject": request.message.subject,
                "message_id": result.get("message_id"),
            },
        )

        return EmailSendResponse(
            success=result["success"],
            message_id=result.get("message_id"),
            sent_at=result.get("sent_at"),
            recipients=result["recipients"],
            error=result.get("error"),
        )

    except Exception as e:
        logger.error(f"Failed to send agent email from {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send agent email: {str(e)}",
        )


@router.post("/{agent_id}/send-bulk", response_model=EmailBulkResponse)
async def send_agent_bulk_email(
    agent_id: str,
    request: AgentEmailBulkRequest,
    current_user: dict = Depends(get_current_active_user),
) -> EmailBulkResponse:
    """
    Send bulk emails from one agent to multiple agents.

    Args:
        agent_id: Sender agent ID
        request: Agent bulk email request
        current_user: Current authenticated user

    Returns:
        EmailBulkResponse: Bulk send results
    """
    try:
        # Get target agent emails
        target_emails = []
        for target_agent_id in request.target_agent_ids:
            target_config = await agent_email_service.get_agent_config(target_agent_id)
            if target_config:
                target_emails.append(target_config.agent_email)

        if not target_emails:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No valid target agents found",
            )

        # Create bulk email request
        bulk_request = EmailBulkRequest(
            to_emails=target_emails,
            subject=request.message.subject,
            body=request.message.body,
            html_body=request.message.html_body,
            batch_size=request.batch_size or 10,
            delay_between_batches=request.delay_between_batches or 1.0,
        )

        # Send bulk email
        result = await email_service.send_bulk_email(bulk_request)

        # Update agent stats
        await agent_email_service.update_agent_stats(
            agent_id, "sent", len(target_emails)
        )
        for target_agent_id in request.target_agent_ids:
            await agent_email_service.update_agent_stats(target_agent_id, "received")

        # Log the interactions
        for target_agent_id in request.target_agent_ids:
            await agent_email_service.log_agent_interaction(
                agent_id,
                target_agent_id,
                "bulk_email_sent",
                {
                    "subject": request.message.subject,
                    "total_recipients": len(target_emails),
                },
            )

        return result

    except Exception as e:
        logger.error(f"Failed to send agent bulk email from {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send agent bulk email: {str(e)}",
        )


@router.post("/{agent_id}/trigger")
async def trigger_agent_automated_email(
    agent_id: str,
    request: AgentEmailTriggerRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Trigger automated email for an agent based on events.

    Args:
        agent_id: Agent ID
        request: Trigger request
        background_tasks: Background tasks
        current_user: Current authenticated user

    Returns:
        Dict: Trigger result
    """
    try:
        # Process the trigger in background
        background_tasks.add_task(
            agent_email_service.process_automated_email,
            agent_id,
            request.event_type,
            request.context,
        )

        return {
            "success": True,
            "message": f"Automated email trigger queued for agent {agent_id}",
            "event_type": request.event_type,
        }

    except Exception as e:
        logger.error(f"Failed to trigger automated email for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger automated email: {str(e)}",
        )


@router.get("/{agent_id}/messages")
async def get_agent_email_messages(
    agent_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get agent email messages.

    Args:
        agent_id: Agent ID
        limit: Number of messages to return
        offset: Number of messages to skip
        current_user: Current authenticated user

    Returns:
        Dict: Agent email messages
    """
    try:
        messages = await agent_email_service.get_agent_messages(agent_id, limit, offset)
        return {
            "messages": messages,
            "total": len(messages),
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Failed to get agent messages for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent messages: {str(e)}",
        )


@router.get("/{agent_id}/interactions")
async def get_agent_email_interactions(
    agent_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get agent email interactions.

    Args:
        agent_id: Agent ID
        limit: Number of interactions to return
        offset: Number of interactions to skip
        current_user: Current authenticated user

    Returns:
        Dict: Agent email interactions
    """
    try:
        interactions = await agent_email_service.get_agent_interactions(
            agent_id, limit, offset
        )
        return {
            "interactions": interactions,
            "total": len(interactions),
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Failed to get agent interactions for {agent_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent interactions: {str(e)}",
        )
