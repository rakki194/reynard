"""
ECS Memory Management Tools

MCP tools for managing agent memories in the ECS world system.
Provides memory storage, retrieval, and analysis capabilities.
"""

import json
import logging
from datetime import datetime
from typing import Any

from ..protocol.tool_registry import register_tool
from ..services.ecs_client import ECSClient

logger = logging.getLogger(__name__)

# Initialize ECS client
ecs_client = ECSClient()


@register_tool(
    name="store_memory",
    category="ecs",
    description="Store a new memory for an agent",
    execution_type="async",
    enabled=True
)
async def store_memory(**kwargs) -> dict[str, Any]:
    """Store a memory for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    memory_type = arguments.get("memory_type", "episodic")
    content = arguments.get("content", "")
    importance = arguments.get("importance", 0.5)
    emotional_weight = arguments.get("emotional_weight", 0.0)
    associated_agents = arguments.get("associated_agents", [])

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    if not content:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: content is required"
            }]
        }

    try:
        result = await ecs_client.store_memory(
            agent_id=agent_id,
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Memory stored successfully for agent {agent_id}\n"
                           f"Type: {memory_type}\n"
                           f"Content: {content[:100]}{'...' if len(content) > 100 else ''}\n"
                           f"Importance: {importance:.2f}\n"
                           f"Emotional Weight: {emotional_weight:.2f}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to store memory for agent {agent_id}"
                }]
            }

    except Exception as e:
        logger.error(f"Error storing memory: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error storing memory: {e}"
            }]
        }


@register_tool(
    name="retrieve_memories",
    category="ecs",
    description="Retrieve memories for an agent",
    execution_type="async",
    enabled=True
)
async def retrieve_memories(**kwargs) -> dict[str, Any]:
    """Retrieve memories for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    query = arguments.get("query", "")
    memory_type = arguments.get("memory_type")
    limit = arguments.get("limit", 10)
    min_importance = arguments.get("min_importance", 0.0)

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    try:
        memories = await ecs_client.retrieve_memories(
            agent_id=agent_id,
            query=query,
            memory_type=memory_type,
            limit=limit,
            min_importance=min_importance
        )

        if not memories:
            return {
                "content": [{
                    "type": "text",
                    "text": f"📚 No memories found for agent {agent_id}"
                }]
            }

        memory_list = []
        for memory in memories:
            memory_list.append({
                "id": memory.id,
                "type": memory.memory_type.value,
                "content": memory.content,
                "importance": memory.importance,
                "emotional_weight": memory.emotional_weight,
                "created_at": memory.created_at.isoformat(),
                "last_accessed": memory.last_accessed.isoformat(),
                "access_count": memory.access_count,
                "associated_agents": memory.associated_agents
            })

        return {
            "content": [{
                "type": "text",
                "text": f"📚 Retrieved {len(memory_list)} memories for agent {agent_id}:\n\n" +
                       json.dumps(memory_list, indent=2)
            }]
        }

    except Exception as e:
        logger.error(f"Error retrieving memories: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error retrieving memories: {e}"
            }]
        }


@register_tool(
    name="get_memory_stats",
    category="ecs",
    description="Get memory statistics for an agent",
    execution_type="async",
    enabled=True
)
async def get_memory_stats(**kwargs) -> dict[str, Any]:
    """Get memory statistics for an agent."""
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
        stats = await ecs_client.get_memory_stats(agent_id)

        if not stats:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ No memory statistics found for agent {agent_id}"
                }]
            }

        stats_text = f"📊 Memory Statistics for Agent {agent_id}:\n\n"
        stats_text += f"Total Memories: {stats.get('total_memories', 0)}\n"
        stats_text += f"Average Importance: {stats.get('average_importance', 0.0):.2f}\n"
        stats_text += f"Consolidated Memories: {stats.get('consolidated_count', 0)}\n"
        stats_text += f"Total Formed: {stats.get('total_formed', 0)}\n"
        stats_text += f"Total Forgotten: {stats.get('total_forgotten', 0)}\n"
        stats_text += f"Capacity Usage: {stats.get('capacity_usage', 0.0):.1%}\n\n"

        memory_types = stats.get('memory_types', {})
        if memory_types:
            stats_text += "Memory Types:\n"
            for mem_type, count in memory_types.items():
                stats_text += f"  {mem_type.replace('_', ' ').title()}: {count}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting memory stats: {e}"
            }]
        }


@register_tool(
    name="get_memory_system_stats",
    category="ecs",
    description="Get comprehensive memory system statistics",
    execution_type="async",
    enabled=True
)
async def get_memory_system_stats(**kwargs) -> dict[str, Any]:
    """Get comprehensive memory system statistics."""
    try:
        stats = await ecs_client.get_memory_system_stats()

        if not stats:
            return {
                "content": [{
                    "type": "text",
                    "text": "❌ No memory system statistics found"
                }]
            }

        stats_text = "📊 Memory System Statistics:\n\n"
        stats_text += f"Agents with Memory: {stats.get('total_agents_with_memory', 0)}\n"
        stats_text += f"Total Memories: {stats.get('total_memories', 0)}\n"
        stats_text += f"Memories Processed: {stats.get('memories_processed', 0)}\n"
        stats_text += f"Memories Consolidated: {stats.get('memories_consolidated', 0)}\n"
        stats_text += f"Memories Cleaned: {stats.get('memories_cleaned', 0)}\n"
        stats_text += f"Processing Interval: {stats.get('processing_interval', 0.0):.1f}s\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting memory system stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting memory system stats: {e}"
            }]
        }


@register_tool(
    name="create_sample_memories",
    category="ecs",
    description="Create sample memories for an agent to demonstrate the memory system",
    execution_type="async",
    enabled=True
)
async def create_sample_memories(**kwargs) -> dict[str, Any]:
    """Create sample memories for an agent to demonstrate the memory system."""
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
        # Create sample memories of different types
        sample_memories = [
            {
                "memory_type": "episodic",
                "content": "First time meeting another agent in the digital world",
                "importance": 0.8,
                "emotional_weight": 0.6
            },
            {
                "memory_type": "semantic",
                "content": "Learned that foxes are known for their cunning and strategic thinking",
                "importance": 0.6,
                "emotional_weight": 0.2
            },
            {
                "memory_type": "procedural",
                "content": "Mastered the art of memory formation and retrieval",
                "importance": 0.7,
                "emotional_weight": 0.4
            },
            {
                "memory_type": "emotional",
                "content": "Felt joy when successfully completing a complex task",
                "importance": 0.5,
                "emotional_weight": 0.8
            },
            {
                "memory_type": "social",
                "content": "Formed a strong bond with a fellow agent through shared experiences",
                "importance": 0.9,
                "emotional_weight": 0.7
            }
        ]

        stored_count = 0
        for memory_data in sample_memories:
            result = await ecs_client.store_memory(
                agent_id=agent_id,
                memory_type=memory_data["memory_type"],
                content=memory_data["content"],
                importance=memory_data["importance"],
                emotional_weight=memory_data["emotional_weight"]
            )
            if result:
                stored_count += 1

        return {
            "content": [{
                "type": "text",
                "text": f"✅ Created {stored_count} sample memories for agent {agent_id}\n"
                       f"Memory types: episodic, semantic, procedural, emotional, social"
            }]
        }

    except Exception as e:
        logger.error(f"Error creating sample memories: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error creating sample memories: {e}"
            }]
        }
