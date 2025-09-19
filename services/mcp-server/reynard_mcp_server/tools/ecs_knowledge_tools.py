"""
ECS Knowledge Management Tools

MCP tools for managing knowledge acquisition, sharing, and transfer
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
    name="add_knowledge",
    category="ecs",
    description="Add knowledge to an agent's knowledge base",
    execution_type="async",
    enabled=True
)
async def add_knowledge(**kwargs) -> dict[str, Any]:
    """Add knowledge to an agent's knowledge base."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    title = arguments.get("title", "New Knowledge")
    knowledge_type = arguments.get("knowledge_type", "factual")
    description = arguments.get("description", "Knowledge description")
    proficiency = arguments.get("proficiency", 0.1)
    confidence = arguments.get("confidence", 0.5)
    learning_method = arguments.get("learning_method", "experience")
    source_agent = arguments.get("source_agent")
    tags = arguments.get("tags", [])
    difficulty = arguments.get("difficulty", 0.5)
    importance = arguments.get("importance", 0.5)
    transferability = arguments.get("transferability", 0.5)

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    try:
        result = await ecs_client.add_knowledge(
            agent_id=agent_id,
            title=title,
            knowledge_type=knowledge_type,
            description=description,
            proficiency=proficiency,
            confidence=confidence,
            learning_method=learning_method,
            source_agent=source_agent,
            tags=tags,
            difficulty=difficulty,
            importance=importance,
            transferability=transferability
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Knowledge added successfully!\n"
                           f"Knowledge ID: {result}\n"
                           f"Title: {title}\n"
                           f"Type: {knowledge_type}\n"
                           f"Agent: {agent_id}\n"
                           f"Proficiency: {proficiency:.2f}\n"
                           f"Confidence: {confidence:.2f}\n"
                           f"Learning Method: {learning_method}\n"
                           f"Difficulty: {difficulty:.2f}\n"
                           f"Importance: {importance:.2f}\n"
                           f"Transferability: {transferability:.2f}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to add knowledge '{title}' to agent {agent_id}\n"
                           f"Possible reasons: agent not found, knowledge capacity exceeded, or system error"
                }]
            }

    except Exception as e:
        logger.error(f"Error adding knowledge: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error adding knowledge: {e}"
            }]
        }


@register_tool(
    name="transfer_knowledge",
    category="ecs",
    description="Transfer knowledge between agents",
    execution_type="async",
    enabled=True
)
async def transfer_knowledge(**kwargs) -> dict[str, Any]:
    """Transfer knowledge between agents."""
    arguments = kwargs.get("arguments", {})
    teacher_id = arguments.get("teacher_id")
    student_id = arguments.get("student_id")
    knowledge_id = arguments.get("knowledge_id")
    learning_method = arguments.get("learning_method", "teaching")

    if not teacher_id or not student_id or not knowledge_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: teacher_id, student_id, and knowledge_id are required"
            }]
        }

    try:
        result = await ecs_client.transfer_knowledge(
            teacher_id=teacher_id,
            student_id=student_id,
            knowledge_id=knowledge_id,
            learning_method=learning_method
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Knowledge transfer successful!\n"
                           f"Teacher: {teacher_id}\n"
                           f"Student: {student_id}\n"
                           f"Knowledge ID: {knowledge_id}\n"
                           f"Learning Method: {learning_method}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to transfer knowledge from {teacher_id} to {student_id}\n"
                           f"Possible reasons: knowledge not teachable, student already has knowledge, or system error"
                }]
            }

    except Exception as e:
        logger.error(f"Error transferring knowledge: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error transferring knowledge: {e}"
            }]
        }


@register_tool(
    name="get_knowledge_stats",
    category="ecs",
    description="Get knowledge statistics for an agent",
    execution_type="async",
    enabled=True
)
async def get_knowledge_stats(**kwargs) -> dict[str, Any]:
    """Get knowledge statistics for an agent."""
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
        result = await ecs_client.get_knowledge_stats(agent_id)

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ No knowledge statistics found for agent {agent_id}"
                }]
            }

        stats_text = f"📚 Knowledge Statistics for Agent {agent_id}:\n\n"
        stats_text += f"Total Knowledge: {result.get('total_knowledge', 0)} items\n"
        stats_text += f"Learning Opportunities: {result.get('learning_opportunities', 0)}\n"
        stats_text += f"Learning Rate: {result.get('learning_rate', 0.0):.2f}\n"
        stats_text += f"Teaching Ability: {result.get('teaching_ability', 0.0):.2f}\n"
        stats_text += f"Curiosity: {result.get('curiosity', 0.0):.2f}\n"
        stats_text += f"Retention Rate: {result.get('retention_rate', 0.0):.2f}\n"
        stats_text += f"Knowledge Capacity: {result.get('knowledge_capacity', 0)}\n\n"

        # Add knowledge type breakdown
        knowledge_types = result.get('knowledge_types', {})
        if knowledge_types:
            stats_text += "Knowledge by Type:\n"
            for kt, count in knowledge_types.items():
                stats_text += f"  • {kt.title()}: {count}\n"

        # Add proficiency level breakdown
        proficiency_levels = result.get('proficiency_levels', {})
        if proficiency_levels:
            stats_text += "\nKnowledge by Proficiency Level:\n"
            for level, count in proficiency_levels.items():
                stats_text += f"  • {level.title()}: {count}\n"

        # Add averages
        stats_text += f"\nAverages:\n"
        stats_text += f"  • Proficiency: {result.get('average_proficiency', 0.0):.2f}\n"
        stats_text += f"  • Confidence: {result.get('average_confidence', 0.0):.2f}\n"
        stats_text += f"  • Importance: {result.get('average_importance', 0.0):.2f}\n"

        # Add activity stats
        stats_text += f"\nActivity Statistics:\n"
        stats_text += f"  • Knowledge Acquired: {result.get('total_knowledge_acquired', 0)}\n"
        stats_text += f"  • Knowledge Shared: {result.get('total_knowledge_shared', 0)}\n"
        stats_text += f"  • Teaching Sessions: {result.get('total_teaching_sessions', 0)}\n"
        stats_text += f"  • Learning Sessions: {result.get('total_learning_sessions', 0)}\n"

        # Add specialization areas
        specializations = result.get('specialization_areas', [])
        if specializations:
            stats_text += f"\nSpecialization Areas: {', '.join(specializations)}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting knowledge stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting knowledge stats: {e}"
            }]
        }


@register_tool(
    name="get_knowledge_transfer_stats",
    category="ecs",
    description="Get knowledge transfer statistics for an agent",
    execution_type="async",
    enabled=True
)
async def get_knowledge_transfer_stats(**kwargs) -> dict[str, Any]:
    """Get knowledge transfer statistics for an agent."""
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
        result = await ecs_client.get_knowledge_transfer_stats(agent_id)

        if "error" in result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Error: {result['error']}"
                }]
            }

        stats_text = f"🔄 Knowledge Transfer Statistics for Agent {agent_id}:\n\n"
        stats_text += f"Total Knowledge: {result.get('total_knowledge', 0)} items\n"
        stats_text += f"Teachable Knowledge: {result.get('teachable_knowledge', 0)} items\n"
        stats_text += f"Learning Opportunities: {result.get('learning_opportunities', 0)}\n\n"
        stats_text += f"Teaching Sessions: {result.get('total_teaching_sessions', 0)}\n"
        stats_text += f"Learning Sessions: {result.get('total_learning_sessions', 0)}\n"
        stats_text += f"Knowledge Shared: {result.get('total_knowledge_shared', 0)}\n\n"
        stats_text += f"Learning Rate: {result.get('learning_rate', 0.0):.2f}\n"
        stats_text += f"Teaching Ability: {result.get('teaching_ability', 0.0):.2f}\n"
        stats_text += f"Curiosity: {result.get('curiosity', 0.0):.2f}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting knowledge transfer stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting knowledge transfer stats: {e}"
            }]
        }


@register_tool(
    name="get_learning_system_stats",
    category="ecs",
    description="Get comprehensive learning system statistics",
    execution_type="async",
    enabled=True
)
async def get_learning_system_stats(**kwargs) -> dict[str, Any]:
    """Get comprehensive learning system statistics."""
    try:
        result = await ecs_client.get_learning_system_stats()

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": "❌ No learning system statistics found"
                }]
            }

        stats_text = "📊 Learning System Statistics:\n\n"
        stats_text += f"Agents with Knowledge Components: {result.get('total_agents_with_knowledge', 0)}\n"
        stats_text += f"Total Knowledge Items: {result.get('total_knowledge_items', 0)}\n"
        stats_text += f"Total Learning Opportunities: {result.get('total_learning_opportunities', 0)}\n"
        stats_text += f"Total Teachable Knowledge: {result.get('total_teachable_knowledge', 0)}\n\n"
        stats_text += f"Knowledge Transfers: {result.get('knowledge_transfers', 0)}\n"
        stats_text += f"Teaching Sessions: {result.get('teaching_sessions', 0)}\n"
        stats_text += f"Learning Sessions: {result.get('learning_sessions', 0)}\n\n"
        stats_text += f"Processing Interval: {result.get('processing_interval', 0.0):.1f}s\n"
        stats_text += f"Knowledge Sharing Radius: {result.get('knowledge_sharing_radius', 0.0):.1f}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting learning system stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting learning system stats: {e}"
            }]
        }


@register_tool(
    name="simulate_knowledge_learning",
    category="ecs",
    description="Simulate knowledge learning and transfer between multiple agents",
    execution_type="async",
    enabled=True
)
async def simulate_knowledge_learning(**kwargs) -> dict[str, Any]:
    """Simulate knowledge learning and transfer between multiple agents."""
    arguments = kwargs.get("arguments", {})
    agent_count = arguments.get("agent_count", 5)
    knowledge_per_agent = arguments.get("knowledge_per_agent", 3)

    try:
        # Create agents for the simulation
        created_agents = []
        for i in range(agent_count):
            agent_id = f"knowledge_agent_{i}"
            # Note: In a real implementation, we'd create agents here
            # For now, we'll assume they exist
            created_agents.append(agent_id)

        # Add sample knowledge to agents
        knowledge_added = 0
        for i, agent_id in enumerate(created_agents):
            for j in range(knowledge_per_agent):
                knowledge_id = await ecs_client.add_knowledge(
                    agent_id=agent_id,
                    title=f"Knowledge {j+1} for Agent {i+1}",
                    knowledge_type="factual",
                    description=f"Sample knowledge item {j+1} for agent {i+1}",
                    proficiency=0.3 + (j * 0.1),
                    confidence=0.4 + (j * 0.1),
                    learning_method="experience",
                    tags=[f"agent_{i+1}", f"knowledge_{j+1}"],
                    difficulty=0.3 + (j * 0.1),
                    importance=0.5,
                    transferability=0.6
                )
                
                if knowledge_id:
                    knowledge_added += 1

        # Get system stats
        system_stats = await ecs_client.get_learning_system_stats()

        result_text = f"🧠 Knowledge Learning Simulation Complete!\n\n"
        result_text += f"Agents Created: {len(created_agents)}\n"
        result_text += f"Knowledge Items Added: {knowledge_added}\n"
        result_text += f"Knowledge per Agent: {knowledge_per_agent}\n\n"
        result_text += f"System Statistics:\n"
        result_text += f"  Total Knowledge Items: {system_stats.get('total_knowledge_items', 0)}\n"
        result_text += f"  Total Learning Opportunities: {system_stats.get('total_learning_opportunities', 0)}\n"
        result_text += f"  Total Teachable Knowledge: {system_stats.get('total_teachable_knowledge', 0)}\n"
        result_text += f"  Knowledge Transfers: {system_stats.get('knowledge_transfers', 0)}\n"

        return {
            "content": [{
                "type": "text",
                "text": result_text
            }]
        }

    except Exception as e:
        logger.error(f"Error simulating knowledge learning: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error simulating knowledge learning: {e}"
            }]
        }
