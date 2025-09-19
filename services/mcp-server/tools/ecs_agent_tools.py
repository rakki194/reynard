#!/usr/bin/env python3
"""
ECS Agent Tools
===============

MCP tool handlers for ECS-based agent management.
Now uses the new @register_tool decorator system for automatic registration.

Provides tools for creating, managing, and automating agent systems.
Uses the authoritative ECS World via FastAPI backend connection.
"""

import json
import logging
from typing import Any

from services.ecs_client import get_ecs_client
from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)

# Initialize ECS client
ecs_client = get_ecs_client()


@register_tool(
    name="create_ecs_agent",
    category="ecs",
    description="Create a new agent using the ECS system",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def create_ecs_agent(**kwargs) -> dict[str, Any]:
    """Create a new agent using ECS system via FastAPI backend."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id", "")
    spirit = arguments.get("spirit", "fox")
    style = arguments.get("style", "foundation")
    name = arguments.get("name")

    # Generate a proper agent ID if a generic one is provided
    if not agent_id or agent_id in [
        "current-session",
        "test-agent",
        "agent",
        "user",
        "default",
        "temp",
        "temporary",
        "placeholder",
        "unknown",
        "new-agent",
    ]:
        import uuid
        agent_id = f"agent-{uuid.uuid4().hex[:8]}"

    try:
        # Create agent via ECS client
        result = await ecs_client.create_agent(
            agent_id=agent_id,
            spirit=spirit,
            style=style,
            name=name
        )

        if result.get("success"):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ ECS Agent created successfully!\n\n{json.dumps(result, indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Failed to create ECS agent: {result.get('error', 'Unknown error')}"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error creating ECS agent: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error creating ECS agent: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_ecs_agent_status",
    category="ecs",
    description="Get status of all agents in the ECS system",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_ecs_agent_status(**kwargs) -> dict[str, Any]:
    """Get status of all agents in the ECS system."""
    try:
        result = ecs_client.get_agent_status()
        
        if result.get("success"):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📊 ECS Agent Status:\n\n{json.dumps(result, indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Failed to get ECS agent status: {result.get('error', 'Unknown error')}"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error getting ECS agent status: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting ECS agent status: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_ecs_agent_positions",
    category="ecs",
    description="Get positions of all agents in the ECS system",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_ecs_agent_positions(**kwargs) -> dict[str, Any]:
    """Get positions of all agents in the ECS system."""
    try:
        result = await ecs_client.get_all_agent_positions()
        
        positions = result.get("positions", {})
        if positions:
            position_text = "📍 ECS Agent Positions:\n"
            for agent_id, pos_data in positions.items():
                position_text += f"  • {agent_id}: ({pos_data['x']:.1f}, {pos_data['y']:.1f})\n"
                position_text += f"    Target: ({pos_data['target_x']:.1f}, {pos_data['target_y']:.1f})\n"
                position_text += f"    Velocity: ({pos_data['velocity_x']:.1f}, {pos_data['velocity_y']:.1f})\n"
                position_text += f"    Speed: {pos_data['movement_speed']:.1f}\n\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": position_text
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "📍 No agents found in the ECS world"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error getting ECS agent positions: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting ECS agent positions: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_simulation_status",
    category="ecs",
    description="Get comprehensive ECS world simulation status",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_simulation_status(**kwargs) -> dict[str, Any]:
    """Get comprehensive ECS world simulation status."""
    try:
        result = ecs_client.get_simulation_status()
        
        if result.get("success"):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🌍 ECS Simulation Status:\n\n{json.dumps(result, indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Failed to get simulation status: {result.get('error', 'Unknown error')}"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error getting simulation status: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting simulation status: {e!s}"
                }
            ]
        }


@register_tool(
    name="accelerate_time",
    category="ecs",
    description="Adjust time acceleration factor for world simulation",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def accelerate_time(**kwargs) -> dict[str, Any]:
    """Adjust time acceleration factor for world simulation."""
    arguments = kwargs.get("arguments", {})
    acceleration = arguments.get("acceleration", 10.0)
    
    try:
        result = ecs_client.accelerate_time(acceleration)
        
        if result.get("success"):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"⏰ Time acceleration set to {acceleration}x\n\n{json.dumps(result, indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Failed to accelerate time: {result.get('error', 'Unknown error')}"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error accelerating time: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error accelerating time: {e!s}"
                }
            ]
        }


@register_tool(
    name="nudge_time",
    category="ecs",
    description="Nudge simulation time forward (for MCP actions)",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def nudge_time(**kwargs) -> dict[str, Any]:
    """Nudge simulation time forward (for MCP actions)."""
    arguments = kwargs.get("arguments", {})
    nudge_amount = arguments.get("nudge_amount", 0.05)
    
    try:
        result = ecs_client.nudge_time(nudge_amount)
        
        if result.get("success"):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"⏰ Time nudged forward by {nudge_amount} units\n\n{json.dumps(result, indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Failed to nudge time: {result.get('error', 'Unknown error')}"
                    }
                ]
            }

    except Exception as e:
        logger.exception("Error nudging time: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error nudging time: {e!s}"
                }
            ]
        }


# Enhanced Position and Movement Tools

@register_tool(
    name="get_agent_position",
    category="ecs",
    description="Get the current position of a specific agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_agent_position(**kwargs) -> dict[str, Any]:
    """Get the current position of a specific agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        
        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required"
                    }
                ]
            }
        
        result = await ecs_client.get_agent_position(agent_id)
        
        position_text = f"📍 Position of {agent_id}:\n"
        position_text += f"  Current: ({result['x']:.1f}, {result['y']:.1f})\n"
        position_text += f"  Target: ({result['target_x']:.1f}, {result['target_y']:.1f})\n"
        position_text += f"  Velocity: ({result['velocity_x']:.1f}, {result['velocity_y']:.1f})\n"
        position_text += f"  Movement Speed: {result['movement_speed']:.1f}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": position_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error getting agent position: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting agent position: {e!s}"
                }
            ]
        }


@register_tool(
    name="move_agent",
    category="ecs",
    description="Move an agent to a specific position",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def move_agent(**kwargs) -> dict[str, Any]:
    """Move an agent to a specific position."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        x = arguments.get("x")
        y = arguments.get("y")
        
        if not agent_id or x is None or y is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id, x, and y are required"
                    }
                ]
            }
        
        result = await ecs_client.move_agent(agent_id, float(x), float(y))
        
        move_text = f"🚀 Moved {agent_id} to position ({x}, {y}):\n"
        move_text += f"  Current: ({result['x']:.1f}, {result['y']:.1f})\n"
        move_text += f"  Target: ({result['target_x']:.1f}, {result['target_y']:.1f})\n"
        move_text += f"  Velocity: ({result['velocity_x']:.1f}, {result['velocity_y']:.1f})"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": move_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error moving agent: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error moving agent: {e!s}"
                }
            ]
        }


@register_tool(
    name="move_agent_towards",
    category="ecs",
    description="Move an agent towards another agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def move_agent_towards(**kwargs) -> dict[str, Any]:
    """Move an agent towards another agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        target_agent_id = arguments.get("target_agent_id")
        distance = arguments.get("distance", 50.0)
        
        if not agent_id or not target_agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id and target_agent_id are required"
                    }
                ]
            }
        
        result = await ecs_client.move_agent_towards(agent_id, target_agent_id, float(distance))
        
        move_text = f"🎯 Moved {agent_id} towards {target_agent_id} (distance: {distance}):\n"
        move_text += f"  Current: ({result['x']:.1f}, {result['y']:.1f})\n"
        move_text += f"  Target: ({result['target_x']:.1f}, {result['target_y']:.1f})\n"
        move_text += f"  Velocity: ({result['velocity_x']:.1f}, {result['velocity_y']:.1f})"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": move_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error moving agent towards target: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error moving agent towards target: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_agent_distance",
    category="ecs",
    description="Get the distance between two agents",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_agent_distance(**kwargs) -> dict[str, Any]:
    """Get the distance between two agents."""
    try:
        arguments = kwargs.get("arguments", {})
        agent1_id = arguments.get("agent1_id")
        agent2_id = arguments.get("agent2_id")
        
        if not agent1_id or not agent2_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent1_id and agent2_id are required"
                    }
                ]
            }
        
        result = await ecs_client.get_agent_distance(agent1_id, agent2_id)
        
        distance_text = f"📏 Distance between {agent1_id} and {agent2_id}:\n"
        distance_text += f"  Distance: {result['distance']:.1f} units\n"
        distance_text += f"  {agent1_id} position: ({result['position1']['x']:.1f}, {result['position1']['y']:.1f})\n"
        distance_text += f"  {agent2_id} position: ({result['position2']['x']:.1f}, {result['position2']['y']:.1f})"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": distance_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error getting agent distance: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting agent distance: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_nearby_agents",
    category="ecs",
    description="Get all agents within a certain radius of an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_nearby_agents(**kwargs) -> dict[str, Any]:
    """Get all agents within a certain radius of an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        radius = arguments.get("radius", 100.0)
        
        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required"
                    }
                ]
            }
        
        result = await ecs_client.get_nearby_agents(agent_id, float(radius))
        
        nearby_agents = result.get("nearby_agents", [])
        if nearby_agents:
            nearby_text = f"👥 Agents near {agent_id} (radius: {radius}):\n"
            for agent in nearby_agents:
                nearby_text += f"  • {agent['name']} ({agent['agent_id']}): {agent['spirit']}\n"
                nearby_text += f"    Position: ({agent['x']:.1f}, {agent['y']:.1f})\n"
                nearby_text += f"    Distance: {agent['distance']:.1f}\n\n"
        else:
            nearby_text = f"👥 No agents found within {radius} units of {agent_id}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": nearby_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error getting nearby agents: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting nearby agents: {e!s}"
                }
            ]
        }


# Interaction and Communication Tools

@register_tool(
    name="initiate_interaction",
    category="ecs",
    description="Initiate an interaction between two agents",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def initiate_interaction(**kwargs) -> dict[str, Any]:
    """Initiate an interaction between two agents."""
    try:
        arguments = kwargs.get("arguments", {})
        agent1_id = arguments.get("agent1_id")
        agent2_id = arguments.get("agent2_id")
        interaction_type = arguments.get("interaction_type", "communication")
        
        if not agent1_id or not agent2_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent1_id and agent2_id are required"
                    }
                ]
            }
        
        result = await ecs_client.initiate_interaction(agent1_id, agent2_id, interaction_type)
        
        if result.get("success"):
            interaction_text = f"🤝 Interaction initiated between {agent1_id} and {agent2_id}:\n"
            interaction_text += f"  Type: {result['interaction_type']}\n"
            interaction_text += f"  Message: {result['message']}\n"
            interaction_text += f"  Agent 1 Energy: {result.get('agent1_energy', 'N/A')}"
        else:
            interaction_text = f"❌ Failed to initiate interaction:\n"
            interaction_text += f"  Message: {result['message']}\n"
            interaction_text += f"  Social Energy: {result.get('social_energy', 'N/A')}\n"
            interaction_text += f"  Active Interactions: {result.get('active_interactions', 'N/A')}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": interaction_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error initiating interaction: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error initiating interaction: {e!s}"
                }
            ]
        }


@register_tool(
    name="send_chat_message",
    category="ecs",
    description="Send a chat message from one agent to another",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def send_chat_message(**kwargs) -> dict[str, Any]:
    """Send a chat message from one agent to another."""
    try:
        arguments = kwargs.get("arguments", {})
        sender_id = arguments.get("sender_id")
        receiver_id = arguments.get("receiver_id")
        message = arguments.get("message")
        interaction_type = arguments.get("interaction_type", "communication")
        
        if not sender_id or not receiver_id or not message:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: sender_id, receiver_id, and message are required"
                    }
                ]
            }
        
        result = await ecs_client.send_chat_message(sender_id, receiver_id, message, interaction_type)
        
        if result.get("success"):
            chat_text = f"💬 Chat message sent from {sender_id} to {receiver_id}:\n"
            chat_text += f"  Message: \"{result['content']}\"\n"
            chat_text += f"  Type: {result['interaction_type']}\n"
            chat_text += f"  Sender Energy: {result.get('sender_energy', 'N/A')}"
        else:
            chat_text = f"❌ Failed to send chat message:\n"
            chat_text += f"  Message: {result['message']}\n"
            chat_text += f"  Social Energy: {result.get('social_energy', 'N/A')}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": chat_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error sending chat message: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error sending chat message: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_agent_social_stats",
    category="ecs",
    description="Get social interaction statistics for an agent",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_agent_social_stats(**kwargs) -> dict[str, Any]:
    """Get social interaction statistics for an agent."""
    try:
        arguments = kwargs.get("arguments", {})
        agent_id = arguments.get("agent_id")
        
        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Error: agent_id is required"
                    }
                ]
            }
        
        result = await ecs_client.get_agent_social_stats(agent_id)
        
        stats_text = f"📊 Social Stats for {agent_id}:\n"
        stats_text += f"  Total Interactions: {result['total_interactions']}\n"
        stats_text += f"  Successful: {result['successful_interactions']}\n"
        stats_text += f"  Failed: {result['failed_interactions']}\n"
        stats_text += f"  Success Rate: {result['success_rate']:.1%}\n"
        stats_text += f"  Social Energy: {result['social_energy']:.2f}/{result['max_social_energy']:.2f} ({result['energy_percentage']:.1%})\n"
        stats_text += f"  Active Interactions: {result['active_interactions']}\n"
        stats_text += f"  Total Relationships: {result['total_relationships']}\n"
        stats_text += f"  Positive Relationships: {result['positive_relationships']}\n"
        stats_text += f"  Negative Relationships: {result['negative_relationships']}\n"
        stats_text += f"  Communication Style: {result['communication_style']}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": stats_text
                }
            ]
        }

    except Exception as e:
        logger.exception("Error getting agent social stats: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting agent social stats: {e!s}"
                }
            ]
        }