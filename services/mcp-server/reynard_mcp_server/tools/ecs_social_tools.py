"""
ECS Social Management Tools

MCP tools for managing social networks, group dynamics, and social influence
in the ECS world system.
"""

import json
import logging
from typing import Any

from ..protocol.tool_registry import register_tool
from ..services.ecs_client import ECSClient

logger = logging.getLogger(__name__)

# Initialize ECS client
ecs_client = ECSClient()


@register_tool(
    name="create_social_group",
    category="ecs",
    description="Create a social group with specified members",
    execution_type="async",
    enabled=True
)
async def create_social_group(**kwargs) -> dict[str, Any]:
    """Create a social group with specified members."""
    arguments = kwargs.get("arguments", {})
    creator_id = arguments.get("creator_id")
    group_name = arguments.get("group_name", "New Group")
    group_type = arguments.get("group_type", "friendship")
    member_ids = arguments.get("member_ids", [])

    if not creator_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: creator_id is required"
            }]
        }

    if not member_ids:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: member_ids list is required"
            }]
        }

    try:
        result = await ecs_client.create_social_group(
            creator_id=creator_id,
            group_name=group_name,
            group_type=group_type,
            member_ids=member_ids
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Social group '{group_name}' created successfully!\n"
                           f"Group ID: {result}\n"
                           f"Type: {group_type}\n"
                           f"Creator: {creator_id}\n"
                           f"Members: {', '.join(member_ids)}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to create social group '{group_name}'\n"
                           f"Possible reasons: insufficient social energy, invalid members, or system error"
                }]
            }

    except Exception as e:
        logger.error(f"Error creating social group: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error creating social group: {e}"
            }]
        }


@register_tool(
    name="get_social_network",
    category="ecs",
    description="Get social network information for an agent",
    execution_type="async",
    enabled=True
)
async def get_social_network(**kwargs) -> dict[str, Any]:
    """Get social network information for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    try:
        result = await ecs_client.get_social_network(agent_id)

        if "error" in result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Error: {result['error']}"
                }]
            }

        # Format social network information
        network_text = f"🌐 Social Network for Agent {agent_id}:\n\n"
        network_text += f"Social Status: {result.get('social_status', 'unknown').title()}\n"
        network_text += f"Social Influence: {result.get('social_influence', 0.0):.2f}\n"
        network_text += f"Network Size: {result.get('network_size', 0)} connections\n"
        network_text += f"Group Memberships: {len(result.get('group_memberships', []))}\n"
        network_text += f"Leadership Roles: {len(result.get('leadership_roles', []))}\n"
        network_text += f"Social Energy: {result.get('social_energy', 0.0):.2f}\n"
        network_text += f"Charisma: {result.get('charisma', 0.0):.2f}\n"
        network_text += f"Leadership Ability: {result.get('leadership_ability', 0.0):.2f}\n\n"

        # Add connection details
        connections = result.get('connections', [])
        if connections:
            network_text += "Social Connections:\n"
            for conn in connections[:10]:  # Show first 10 connections
                network_text += f"  • {conn['target_agent']}: {conn['connection_type']} "
                network_text += f"(strength: {conn['strength']:.2f})\n"
            
            if len(connections) > 10:
                network_text += f"  ... and {len(connections) - 10} more connections\n"
        else:
            network_text += "No social connections yet.\n"

        # Add group memberships
        memberships = result.get('group_memberships', [])
        if memberships:
            network_text += f"\nGroup Memberships: {', '.join(memberships)}\n"

        # Add leadership roles
        leadership = result.get('leadership_roles', [])
        if leadership:
            network_text += f"Leadership Roles: {', '.join(leadership)}\n"

        return {
            "content": [{
                "type": "text",
                "text": network_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting social network: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting social network: {e}"
            }]
        }


@register_tool(
    name="get_group_info",
    category="ecs",
    description="Get information about a social group",
    execution_type="async",
    enabled=True
)
async def get_group_info(**kwargs) -> dict[str, Any]:
    """Get information about a social group."""
    arguments = kwargs.get("arguments", {})
    group_id = arguments.get("group_id")

    if not group_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: group_id is required"
            }]
        }

    try:
        result = await ecs_client.get_group_info(group_id)

        if "error" in result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Error: {result['error']}"
                }]
            }

        # Format group information
        group_text = f"👥 Group Information: {result.get('name', 'Unknown')}\n\n"
        group_text += f"Group ID: {result.get('group_id', 'unknown')}\n"
        group_text += f"Type: {result.get('group_type', 'unknown').title()}\n"
        group_text += f"Members: {result.get('member_count', 0)}\n"
        group_text += f"Leaders: {result.get('leader_count', 0)}\n\n"
        group_text += f"Group Health: {result.get('group_health', 0.0):.2f}\n"
        group_text += f"Cohesion: {result.get('cohesion', 0.0):.2f}\n"
        group_text += f"Influence: {result.get('influence', 0.0):.2f}\n"
        group_text += f"Activity Level: {result.get('activity_level', 0.0):.2f}\n"
        group_text += f"Stability: {result.get('stability', 0.0):.2f}\n\n"

        # Add member list
        members = result.get('members', [])
        if members:
            group_text += f"Members: {', '.join(members)}\n"

        # Add leader list
        leaders = result.get('leaders', [])
        if leaders:
            group_text += f"Leaders: {', '.join(leaders)}\n"

        # Add goals and rules
        goals = result.get('goals', [])
        if goals:
            group_text += f"\nGoals: {', '.join(goals)}\n"

        rules = result.get('rules', [])
        if rules:
            group_text += f"Rules: {', '.join(rules)}\n"

        group_text += f"\nCreated: {result.get('created_at', 'unknown')}\n"

        return {
            "content": [{
                "type": "text",
                "text": group_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting group info: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting group info: {e}"
            }]
        }


@register_tool(
    name="get_social_stats",
    category="ecs",
    description="Get social statistics for an agent",
    execution_type="async",
    enabled=True
)
async def get_social_stats(**kwargs) -> dict[str, Any]:
    """Get social statistics for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    try:
        result = await ecs_client.get_social_stats(agent_id)

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ No social statistics found for agent {agent_id}"
                }]
            }

        stats_text = f"📊 Social Statistics for Agent {agent_id}:\n\n"
        stats_text += f"Social Status: {result.get('social_status', 'unknown').title()}\n"
        stats_text += f"Social Influence: {result.get('social_influence', 0.0):.2f}\n"
        stats_text += f"Network Size: {result.get('network_size', 0)} connections\n"
        stats_text += f"Strong Connections: {result.get('strong_connections', 0)}\n"
        stats_text += f"Weak Connections: {result.get('weak_connections', 0)}\n\n"
        stats_text += f"Group Memberships: {result.get('group_memberships', 0)}\n"
        stats_text += f"Leadership Roles: {result.get('leadership_roles', 0)}\n"
        stats_text += f"Social Energy: {result.get('social_energy', 0.0):.2f}/{result.get('max_social_energy', 1.0):.2f}\n"
        stats_text += f"Energy Percentage: {result.get('energy_percentage', 0.0):.1%}\n\n"
        stats_text += f"Charisma: {result.get('charisma', 0.0):.2f}\n"
        stats_text += f"Leadership Ability: {result.get('leadership_ability', 0.0):.2f}\n"
        stats_text += f"Group Activity Preference: {result.get('group_activity_preference', 0.0):.2f}\n"
        stats_text += f"Conflict Resolution Skill: {result.get('conflict_resolution_skill', 0.0):.2f}\n\n"
        stats_text += f"Total Interactions: {result.get('total_interactions', 0)}\n"
        stats_text += f"Positive Interactions: {result.get('positive_interactions', 0)}\n"
        stats_text += f"Negative Interactions: {result.get('negative_interactions', 0)}\n"
        stats_text += f"Groups Created: {result.get('groups_created', 0)}\n"
        stats_text += f"Groups Joined: {result.get('groups_joined', 0)}\n"
        stats_text += f"Leadership Opportunities: {result.get('leadership_opportunities', 0)}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting social stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting social stats: {e}"
            }]
        }


@register_tool(
    name="get_social_system_stats",
    category="ecs",
    description="Get comprehensive social system statistics",
    execution_type="async",
    enabled=True
)
async def get_social_system_stats(**kwargs) -> dict[str, Any]:
    """Get comprehensive social system statistics."""
    try:
        result = await ecs_client.get_social_system_stats()

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": "❌ No social system statistics found"
                }]
            }

        stats_text = "📊 Social System Statistics:\n\n"
        stats_text += f"Agents with Social Components: {result.get('total_agents_with_social', 0)}\n"
        stats_text += f"Total Social Groups: {result.get('total_social_groups', 0)}\n"
        stats_text += f"Total Social Connections: {result.get('total_connections', 0)}\n"
        stats_text += f"Total Leadership Roles: {result.get('total_leadership_roles', 0)}\n\n"
        stats_text += f"Groups Created: {result.get('groups_created', 0)}\n"
        stats_text += f"Connections Formed: {result.get('connections_formed', 0)}\n"
        stats_text += f"Leadership Changes: {result.get('leadership_changes', 0)}\n"
        stats_text += f"Processing Interval: {result.get('processing_interval', 0.0):.1f}s\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting social system stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting social system stats: {e}"
            }]
        }


@register_tool(
    name="simulate_social_community",
    category="ecs",
    description="Simulate a social community formation with multiple agents",
    execution_type="async",
    enabled=True
)
async def simulate_social_community(**kwargs) -> dict[str, Any]:
    """Simulate a social community formation with multiple agents."""
    arguments = kwargs.get("arguments", {})
    agent_count = arguments.get("agent_count", 5)
    group_count = arguments.get("group_count", 2)

    try:
        # Create agents for the simulation
        created_agents = []
        for i in range(agent_count):
            agent_id = f"social_agent_{i}"
            # Note: In a real implementation, we'd create agents here
            # For now, we'll assume they exist
            created_agents.append(agent_id)

        # Create some social groups
        groups_created = []
        for i in range(group_count):
            group_name = f"Community Group {i+1}"
            group_type = "friendship" if i % 2 == 0 else "community"
            
            # Select members for the group
            members = created_agents[i*2:(i+1)*2+1] if i*2+1 < len(created_agents) else created_agents[i*2:]
            if len(members) >= 2:
                creator_id = members[0]
                member_ids = members[1:]
                
                group_id = await ecs_client.create_social_group(
                    creator_id=creator_id,
                    group_name=group_name,
                    group_type=group_type,
                    member_ids=member_ids
                )
                
                if group_id:
                    groups_created.append(group_id)

        # Get system stats
        system_stats = await ecs_client.get_social_system_stats()

        result_text = f"🏘️ Social Community Simulation Complete!\n\n"
        result_text += f"Agents Created: {len(created_agents)}\n"
        result_text += f"Groups Created: {len(groups_created)}\n"
        result_text += f"Group IDs: {', '.join(groups_created)}\n\n"
        result_text += f"System Statistics:\n"
        result_text += f"  Total Groups: {system_stats.get('total_social_groups', 0)}\n"
        result_text += f"  Total Connections: {system_stats.get('total_connections', 0)}\n"
        result_text += f"  Total Leadership Roles: {system_stats.get('total_leadership_roles', 0)}\n"

        return {
            "content": [{
                "type": "text",
                "text": result_text
            }]
        }

    except Exception as e:
        logger.error(f"Error simulating social community: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error simulating social community: {e}"
            }]
        }
