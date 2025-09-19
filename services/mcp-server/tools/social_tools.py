#!/usr/bin/env python3
"""
Social MCP Tools
================

Social interaction tools for ECS agents using FastAPI backend.
Provides chat, interaction, and relationship management capabilities.
Now uses the new @register_tool decorator system for automatic registration.
"""

import logging
from typing import Any

from protocol.tool_registry import register_tool
from services.ecs_client import get_ecs_client

logger = logging.getLogger(__name__)


@register_tool(
    name="initiate_interaction",
    description="Initiate an interaction between two agents",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def initiate_interaction(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Initiate an interaction between two agents.

    Args:
        arguments: Dictionary containing agent1_id, agent2_id, and interaction_type

    Returns:
        Interaction initiation result
    """
    try:
        agent1_id = arguments.get("agent1_id")
        agent2_id = arguments.get("agent2_id")
        interaction_type = arguments.get("interaction_type", "communication")

        if not agent1_id or not agent2_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: Both agent1_id and agent2_id are required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Initiate interaction
        result = await ecs_client.initiate_interaction(
            agent1_id, agent2_id, interaction_type
        )

        # Close ECS client
        await ecs_client.close()

        # Format response
        if result.get("success", False):
            response_text = f"✅ {result.get('message', 'Interaction initiated')}\n"
            response_text += (
                f"Interaction Type: {result.get('interaction_type', 'unknown')}\n"
            )
            response_text += f"Agent Energy: {result.get('agent1_energy', 'unknown')}"
        else:
            response_text = (
                f"❌ {result.get('message', 'Failed to initiate interaction')}"
            )

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error initiating interaction: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error initiating interaction: {str(e)}",
                }
            ]
        }


@register_tool(
    name="send_chat_message",
    description="Send a chat message from one agent to another",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def send_chat_message(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Send a chat message from one agent to another.

    Args:
        arguments: Dictionary containing sender_id, receiver_id, message, and interaction_type

    Returns:
        Chat message result
    """
    try:
        sender_id = arguments.get("sender_id")
        receiver_id = arguments.get("receiver_id")
        message = arguments.get("message")
        interaction_type = arguments.get("interaction_type", "communication")

        if not sender_id or not receiver_id or not message:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: sender_id, receiver_id, and message are required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Send chat message
        result = await ecs_client.send_chat_message(
            sender_id, receiver_id, message, interaction_type
        )

        # Close ECS client
        await ecs_client.close()

        # Format response
        if result.get("success", False):
            response_text = f"💬 {result.get('message', 'Message sent')}\n"
            response_text += f"From: {sender_id} → To: {receiver_id}\n"
            response_text += f"Content: {result.get('content', message)}\n"
            response_text += f"Type: {result.get('interaction_type', 'unknown')}\n"
            response_text += f"Sender Energy: {result.get('sender_energy', 'unknown')}"
        else:
            response_text = f"❌ {result.get('message', 'Failed to send message')}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error sending chat message: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error sending chat message: {str(e)}",
                }
            ]
        }


@register_tool(
    name="get_interaction_history",
    description="Get the interaction history for an agent",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_interaction_history(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Get the interaction history for an agent.

    Args:
        arguments: Dictionary containing agent_id and limit

    Returns:
        Interaction history
    """
    try:
        agent_id = arguments.get("agent_id")
        limit = arguments.get("limit", 10)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Get interaction history
        result = await ecs_client.get_interaction_history(agent_id, limit)

        # Close ECS client
        await ecs_client.close()

        # Format response
        interactions = result.get("interactions", [])
        total_count = result.get("total_count", 0)

        response_text = f"📜 Interaction History for {agent_id}\n"
        response_text += f"Total Interactions: {total_count}\n"
        response_text += f"Showing: {len(interactions)} recent interactions\n\n"

        if interactions:
            for i, interaction in enumerate(interactions, 1):
                response_text += f"{i}. {interaction.get('type', 'Unknown')} - {interaction.get('timestamp', 'Unknown time')}\n"
                response_text += (
                    f"   {interaction.get('description', 'No description')}\n\n"
                )
        else:
            response_text += "No interactions found."

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error getting interaction history: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting interaction history: {str(e)}",
                }
            ]
        }


@register_tool(
    name="get_agent_relationships",
    description="Get all relationships for an agent",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_agent_relationships(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Get all relationships for an agent.

    Args:
        arguments: Dictionary containing agent_id

    Returns:
        Agent relationships
    """
    try:
        agent_id = arguments.get("agent_id")

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Get agent relationships
        result = await ecs_client.get_agent_relationships(agent_id)

        # Close ECS client
        await ecs_client.close()

        # Format response
        relationships = result.get("relationships", [])
        total_count = result.get("total_count", 0)

        response_text = f"💕 Relationships for {agent_id}\n"
        response_text += f"Total Relationships: {total_count}\n\n"

        if relationships:
            for relationship in relationships:
                response_text += f"• {relationship.get('agent_id', 'Unknown')} - {relationship.get('relationship_type', 'Unknown')}\n"
                response_text += (
                    f"  Strength: {relationship.get('strength', 'Unknown')}\n"
                )
                response_text += (
                    f"  Status: {relationship.get('status', 'Unknown')}\n\n"
                )
        else:
            response_text += "No relationships found."

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error getting agent relationships: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting agent relationships: {str(e)}",
                }
            ]
        }


@register_tool(
    name="get_agent_social_stats",
    description="Get social interaction statistics for an agent",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_agent_social_stats(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Get social interaction statistics for an agent.

    Args:
        arguments: Dictionary containing agent_id

    Returns:
        Social interaction statistics
    """
    try:
        agent_id = arguments.get("agent_id")

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Get social stats
        result = await ecs_client.get_agent_social_stats(agent_id)

        # Close ECS client
        await ecs_client.close()

        # Format response
        response_text = f"📊 Social Stats for {agent_id}\n\n"
        response_text += f"Total Interactions: {result.get('total_interactions', 0)}\n"
        response_text += (
            f"Successful Interactions: {result.get('successful_interactions', 0)}\n"
        )
        response_text += (
            f"Failed Interactions: {result.get('failed_interactions', 0)}\n"
        )
        response_text += f"Success Rate: {result.get('success_rate', 0):.1%}\n\n"
        response_text += f"Social Energy: {result.get('social_energy', 0):.1f}/{result.get('max_social_energy', 1):.1f} ({result.get('energy_percentage', 0):.1%})\n"
        response_text += (
            f"Active Interactions: {result.get('active_interactions', 0)}\n\n"
        )
        response_text += (
            f"Total Relationships: {result.get('total_relationships', 0)}\n"
        )
        response_text += (
            f"Positive Relationships: {result.get('positive_relationships', 0)}\n"
        )
        response_text += (
            f"Negative Relationships: {result.get('negative_relationships', 0)}\n\n"
        )
        response_text += (
            f"Communication Style: {result.get('communication_style', 'Unknown')}"
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error getting social stats: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting social stats: {str(e)}",
                }
            ]
        }


@register_tool(
    name="get_nearby_agents",
    description="Get all agents within a certain radius of an agent",
    category="social",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_nearby_agents(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Get all agents within a certain radius of an agent.

    Args:
        arguments: Dictionary containing agent_id and radius

    Returns:
        List of nearby agents
    """
    try:
        agent_id = arguments.get("agent_id")
        radius = arguments.get("radius", 100.0)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required",
                    }
                ]
            }

        # Get ECS client
        ecs_client = get_ecs_client()
        await ecs_client.start()

        # Get nearby agents
        result = await ecs_client.get_nearby_agents(agent_id, radius)

        # Close ECS client
        await ecs_client.close()

        # Format response
        nearby_agents = result.get("nearby_agents", [])

        response_text = f"📍 Nearby Agents for {agent_id} (radius: {radius})\n"
        response_text += f"Found: {len(nearby_agents)} agents\n\n"

        if nearby_agents:
            for agent in nearby_agents:
                response_text += f"• {agent.get('agent_id', 'Unknown')} - {agent.get('name', 'Unknown')}\n"
                response_text += f"  Distance: {agent.get('distance', 'Unknown'):.1f}\n"
                response_text += f"  Position: ({agent.get('x', 0):.1f}, {agent.get('y', 0):.1f})\n\n"
        else:
            response_text += "No nearby agents found."

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text,
                }
            ]
        }

    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error(f"Error getting nearby agents: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting nearby agents: {str(e)}",
                }
            ]
        }
