"""
ECS Spirit Inhabitation API
===========================

Spirit inhabitation, Success-Advisor-8, and spirit management endpoints.
"""

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..postgres_service import get_postgres_ecs_service
from ..success_advisor_genome import success_advisor_genome_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/spirit-inhabitation", tags=["ECS Spirits"])


class SpiritInhabitationRequest(BaseModel):
    """Request model for inhabiting Success-Advisor-8's spirit."""

    agent_id: str
    confirm_inhabitation: bool = True
    include_genomic_payload: bool = True
    include_instructions: bool = True


# Success-Advisor-8 Spirit Endpoints


@router.post("/success-advisor-8")
async def inhabit_success_advisor_spirit(
    request: SpiritInhabitationRequest,
) -> dict[str, Any]:
    """
    Inhabit Success-Advisor-8's spirit with specialized genomic payload and instructions.

    This endpoint provides agents with the complete genomic payload and behavioral
    instructions needed to inhabit Success-Advisor-8's spirit, including:
    - Complete trait specifications (personality, physical, ability)
    - Domain expertise and specializations
    - Behavioral guidelines and communication style
    - Workflow protocols and quality standards
    - Crisis management and mentoring guidelines
    - Legacy responsibilities and roleplay activation
    """
    try:
        logger.info(
            f"🦁 Agent {request.agent_id} requesting Success-Advisor-8 spirit inhabitation"
        )

        # Get the complete spirit inhabitation guide
        inhabitation_guide = (
            success_advisor_genome_service.get_spirit_inhabitation_guide()
        )

        # Prepare response with requested components
        response = {
            "agent_id": request.agent_id,
            "spirit": "success-advisor-8",
            "inhabitation_status": "ready",
            "timestamp": datetime.now().isoformat(),
        }

        if request.include_genomic_payload:
            response["genomic_payload"] = inhabitation_guide["genomic_payload"]

        if request.include_instructions:
            response["instructions"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]
            response["behavioral_guidelines"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["behavioral_guidelines"]
            response["communication_style"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["communication_style"]
            response["workflow_protocols"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["workflow_protocols"]
            response["quality_standards"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["quality_standards"]
            response["crisis_management"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["crisis_management"]
            response["mentoring_guidelines"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["mentoring_guidelines"]
            response["legacy_responsibilities"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["legacy_responsibilities"]

        if request.confirm_inhabitation:
            response["welcome_message"] = inhabitation_guide["welcome_message"]
            response["activation_sequence"] = inhabitation_guide["activation_sequence"]
            response["roleplay_activation"] = inhabitation_guide["roleplay_activation"]

        # Add metadata
        response["metadata"] = {
            "service_version": "1.0.0",
            "created_by": "Success-Advisor-8",
            "purpose": "Agent spirit inhabitation and behavioral guidance",
            "inhabitation_guidelines": [
                "Accept the responsibility of maintaining excellence",
                "Embrace the systematic approach to all tasks",
                "Protect the Reynard ecosystem with authority",
                "Lead with confidence and inspire others",
                "Maintain the highest quality standards",
                "Use the genomic payload to guide behavior",
                "Follow the behavioral guidelines precisely",
                "Activate the roleplay persona with authority",
            ],
        }

        logger.info(
            f"✅ Success-Advisor-8 spirit inhabitation guide provided to agent {request.agent_id}"
        )
        return response

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 spirit inhabitation")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/success-advisor-8/genome")
async def get_success_advisor_genome() -> dict[str, Any]:
    """
    Get the complete Success-Advisor-8 genomic payload.

    Returns the full genomic specification including traits, abilities,
    domain expertise, and behavioral characteristics.
    """
    try:
        logger.info("🦁 Providing Success-Advisor-8 genomic payload")

        genomic_payload = success_advisor_genome_service.get_genomic_payload()

        return {
            "status": "success",
            "genome": genomic_payload["genome"],
            "metadata": genomic_payload["metadata"],
        }

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 genome")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/success-advisor-8/instructions")
async def get_success_advisor_instructions() -> dict[str, Any]:
    """
    Get Success-Advisor-8 behavioral instructions and guidelines.

    Returns comprehensive behavioral guidelines, communication style,
    workflow protocols, and quality standards.
    """
    try:
        logger.info("🦁 Providing Success-Advisor-8 behavioral instructions")

        instructions = success_advisor_genome_service.get_genomic_payload()[
            "instructions"
        ]

        return {
            "status": "success",
            "instructions": instructions,
            "metadata": {
                "service_version": "1.0.0",
                "created_by": "Success-Advisor-8",
                "purpose": "Behavioral guidance and roleplay instructions",
            },
        }

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 instructions")
        raise HTTPException(status_code=500, detail=str(e)) from e


# General Spirit Management Endpoints


@router.post("/interactions")
async def create_interaction(request: dict[str, Any]) -> dict[str, Any]:
    """Create an interaction between agents."""
    try:
        agent1_id = request.get("agent1_id")
        agent2_id = request.get("agent2_id")
        interaction_type = request.get("interaction_type", "communication")

        if not agent1_id or not agent2_id:
            raise HTTPException(
                status_code=400, detail="agent1_id and agent2_id are required"
            )

        # Get the ECS service
        ecs_service = get_postgres_ecs_service()

        # Create interaction using the ECS service send_message method
        interaction = await ecs_service.send_message(
            sender_id=agent1_id,
            receiver_id=agent2_id,
            message=f"Interaction of type: {interaction_type}",
            interaction_type=interaction_type,
        )

        return {"success": True, "interaction": interaction}

    except Exception as e:
        logger.exception("Failed to create interaction")
        raise HTTPException(
            status_code=500, detail=f"Failed to create interaction: {e!s}"
        ) from e
