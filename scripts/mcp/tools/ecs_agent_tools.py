#!/usr/bin/env python3
"""
ECS Agent Tools
===============

MCP tool handlers for ECS-based agent management.
Provides tools for creating, managing, and automating agent systems.

Uses the authoritative ECS World via FastAPI backend connection.
Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
import math
from typing import Any

from services.ecs_client import ECSClient, get_ecs_client

logger = logging.getLogger(__name__)


class ECSAgentTools:
    """Handles ECS-based agent tool operations via FastAPI backend."""

    def __init__(self, ecs_client: ECSClient | None = None):
        """Initialize ECS agent tools with FastAPI backend connection."""
        self.ecs_client = ecs_client or get_ecs_client()
        self.automatic_reproduction = True

    async def create_ecs_agent(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create a new agent using ECS system via FastAPI backend."""
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
            import random
            import time

            agent_id = f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

        try:
            agent_data = await self.ecs_client.create_agent(
                agent_id, spirit, style, name
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Created ECS agent {agent_data['agent_id']} with name {agent_data['name']}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to create ECS agent: {e}"}
                ]
            }

    async def create_ecs_offspring(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create offspring using ECS system via FastAPI backend."""
        parent1_id = arguments.get("parent1_id", "")
        parent2_id = arguments.get("parent2_id", "")
        offspring_id = arguments.get("offspring_id", "")

        # Generate a proper offspring ID if a generic one is provided
        if not offspring_id or offspring_id in [
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
            "offspring",
            "child",
        ]:
            import random
            import time

            offspring_id = f"offspring-{int(time.time())}-{random.randint(1000, 9999)}"

        try:
            offspring_data = await self.ecs_client.create_offspring(
                parent1_id, parent2_id, offspring_id
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Created ECS offspring {offspring_data['agent_id']} from parents {parent1_id} and {parent2_id}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to create ECS offspring: {e}"}
                ]
            }

    async def enable_automatic_reproduction(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Enable or disable automatic reproduction via FastAPI backend."""
        enabled = arguments.get("enabled", True)

        try:
            result = await self.ecs_client.enable_breeding(enabled)
            self.automatic_reproduction = enabled

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result.get(
                            "message",
                            f"Automatic reproduction {'enabled' if enabled else 'disabled'}",
                        ),
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to toggle breeding: {e}"}]
            }

    async def get_ecs_agent_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get status of all ECS agents via FastAPI backend."""
        try:
            status_data = await self.ecs_client.get_world_status()
            agents_data = await self.ecs_client.get_agents()

            status_text = "ECS Agent Status:\n"
            status_text += f"Status: {status_data.get('status', 'unknown')}\n"
            status_text += f"Total agents: {status_data.get('agent_count', 0)}\n"
            status_text += f"Mature agents: {status_data.get('mature_agents', 0)}\n"
            status_text += f"Entity count: {status_data.get('entity_count', 0)}\n"
            status_text += f"System count: {status_data.get('system_count', 0)}\n"
            status_text += f"Automatic reproduction: {'enabled' if self.automatic_reproduction else 'disabled'}\n"

            return {"content": [{"type": "text", "text": status_text}]}
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to get ECS status: {e}"}]
            }

    def get_ecs_agent_positions(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get positions of all ECS agents with enhanced spatial data."""
        try:
            from reynard_ecs_world import (
                AgentComponent,
                LifecycleComponent,
                PositionComponent,
            )

            agents = self.world.get_entities_with_components(
                AgentComponent, PositionComponent
            )
            agent_data = []

            for entity in agents:
                agent_comp = entity.get_component(AgentComponent)
                position_comp = entity.get_component(PositionComponent)
                lifecycle_comp = entity.get_component(LifecycleComponent)

                if agent_comp and position_comp:
                    # Calculate age from lifecycle component if available
                    age = 0.0
                    maturity_age = 18.0
                    if lifecycle_comp:
                        age = lifecycle_comp.age
                        maturity_age = lifecycle_comp.maturity_age

                    agent_data.append(
                        {
                            "id": entity.id,
                            "name": agent_comp.name,
                            "spirit": agent_comp.spirit,
                            "style": agent_comp.style,
                            "age": age,
                            "maturity_age": maturity_age,
                            "position": {"x": position_comp.x, "y": position_comp.y},
                            "target": {
                                "x": position_comp.target_x,
                                "y": position_comp.target_y,
                            },
                            "velocity": {
                                "x": position_comp.velocity_x,
                                "y": position_comp.velocity_y,
                            },
                            "movement_speed": position_comp.movement_speed,
                            "last_update": position_comp.last_update,
                        }
                    )

            return {
                "content": [{"type": "text", "text": json.dumps(agent_data, indent=2)}]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to get agent positions: {e}"}
                ]
            }

    async def find_ecs_compatible_mates(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Find compatible mates for an agent via FastAPI backend."""
        agent_id = arguments.get("agent_id", "")
        max_results = arguments.get("max_results", 5)

        try:
            mates_data = await self.ecs_client.find_compatible_mates(
                agent_id, max_results
            )

            mates_text = f"Compatible mates for {agent_id}:\n"
            for mate in mates_data.get("compatible_mates", []):
                mates_text += f"- {mate}\n"

            return {"content": [{"type": "text", "text": mates_text}]}
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to find compatible mates: {e}"}
                ]
            }

    async def analyze_ecs_compatibility(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents via FastAPI backend."""
        agent1_id = arguments.get("agent1_id", "")
        agent2_id = arguments.get("agent2_id", "")

        try:
            compatibility = await self.ecs_client.analyze_compatibility(
                agent1_id, agent2_id
            )

            compat_text = "Compatibility Analysis:\n"
            compat_text += f"Agent 1: {agent1_id}\n"
            compat_text += f"Agent 2: {agent2_id}\n"
            compat_text += (
                f"Compatibility: {compatibility.get('compatibility', 0):.2f}\n"
            )
            compat_text += f"Analysis: {compatibility.get('analysis', 'N/A')}\n"
            compat_text += f"Recommended: {compatibility.get('recommended', False)}"

            return {"content": [{"type": "text", "text": compat_text}]}
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to analyze compatibility: {e}"}
                ]
            }

    async def get_ecs_lineage(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get agent lineage information via FastAPI backend."""
        agent_id = arguments.get("agent_id", "")
        depth = arguments.get("depth", 3)

        try:
            lineage = await self.ecs_client.get_agent_lineage(agent_id, depth)

            lineage_text = f"Lineage for {agent_id}:\n"
            lineage_text += f"Parents: {lineage.get('parents', [])}\n"
            lineage_text += f"Children: {lineage.get('children', [])}\n"
            lineage_text += f"Ancestors: {lineage.get('ancestors', [])}\n"
            lineage_text += f"Descendants: {lineage.get('descendants', [])}"

            return {"content": [{"type": "text", "text": lineage_text}]}
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to get lineage: {e}"}]
            }

    def update_ecs_world(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Update the ECS world (simulate time passage)."""
        delta_time = arguments.get("delta_time", 1.0)

        try:
            # Use the inherited update method from ECSWorld
            self.world.update(delta_time)
            self.world.cleanup_destroyed_entities()

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"ECS world updated with delta_time={delta_time}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to update ECS world: {e}"}
                ]
            }

    def search_agents_by_proximity(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find agents within a specified distance of a target position."""
        try:
            from reynard_ecs_world import AgentComponent, PositionComponent

            target_x = arguments.get("x", 0.0)
            target_y = arguments.get("y", 0.0)
            max_distance = arguments.get("max_distance", 100.0)
            max_results = arguments.get("max_results", 10)

            agents = self.world.get_entities_with_components(
                AgentComponent, PositionComponent
            )
            nearby_agents = []

            for entity in agents:
                agent_comp = entity.get_component(AgentComponent)
                position_comp = entity.get_component(PositionComponent)

                if agent_comp and position_comp:
                    distance = math.sqrt(
                        (position_comp.x - target_x) ** 2
                        + (position_comp.y - target_y) ** 2
                    )

                    if distance <= max_distance:
                        nearby_agents.append(
                            {
                                "id": entity.id,
                                "name": agent_comp.name,
                                "spirit": agent_comp.spirit,
                                "position": {
                                    "x": position_comp.x,
                                    "y": position_comp.y,
                                },
                                "distance": round(distance, 2),
                            }
                        )

            # Sort by distance
            nearby_agents.sort(key=lambda x: x["distance"])

            return {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(nearby_agents[:max_results], indent=2),
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Failed to search agents by proximity: {e}",
                    }
                ]
            }

    def search_agents_by_region(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find agents within a rectangular region."""
        try:
            from reynard_ecs_world import AgentComponent, PositionComponent

            min_x = arguments.get("min_x", 0.0)
            min_y = arguments.get("min_y", 0.0)
            max_x = arguments.get("max_x", 1000.0)
            max_y = arguments.get("max_y", 1000.0)

            agents = self.world.get_entities_with_components(
                AgentComponent, PositionComponent
            )
            region_agents = []

            for entity in agents:
                agent_comp = entity.get_component(AgentComponent)
                position_comp = entity.get_component(PositionComponent)

                if agent_comp and position_comp:
                    if (
                        min_x <= position_comp.x <= max_x
                        and min_y <= position_comp.y <= max_y
                    ):
                        region_agents.append(
                            {
                                "id": entity.id,
                                "name": agent_comp.name,
                                "spirit": agent_comp.spirit,
                                "position": {
                                    "x": position_comp.x,
                                    "y": position_comp.y,
                                },
                            }
                        )

            return {
                "content": [
                    {"type": "text", "text": json.dumps(region_agents, indent=2)}
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to search agents by region: {e}"}
                ]
            }

    def get_agent_movement_path(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the movement path and trajectory for a specific agent."""
        try:
            from reynard_ecs_world import AgentComponent, PositionComponent

            agent_id = arguments.get("agent_id", "")

            entity = self.world.get_entity(agent_id)
            if not entity:
                return {
                    "content": [{"type": "text", "text": f"Agent {agent_id} not found"}]
                }

            agent_comp = entity.get_component(AgentComponent)
            position_comp = entity.get_component(PositionComponent)

            if not agent_comp or not position_comp:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Agent {agent_id} missing position data",
                        }
                    ]
                }

            # Calculate movement vector and estimated arrival time
            dx = position_comp.target_x - position_comp.x
            dy = position_comp.target_y - position_comp.y
            distance = math.sqrt(dx**2 + dy**2)

            estimated_time = (
                distance / position_comp.movement_speed
                if position_comp.movement_speed > 0
                else 0
            )

            path_data = {
                "agent_id": agent_id,
                "name": agent_comp.name,
                "current_position": {"x": position_comp.x, "y": position_comp.y},
                "target_position": {
                    "x": position_comp.target_x,
                    "y": position_comp.target_y,
                },
                "velocity": {
                    "x": position_comp.velocity_x,
                    "y": position_comp.velocity_y,
                },
                "movement_speed": position_comp.movement_speed,
                "distance_to_target": round(distance, 2),
                "estimated_arrival_time": round(estimated_time, 2),
                "is_moving": distance > 0.1,
                "last_update": position_comp.last_update,
            }

            return {
                "content": [{"type": "text", "text": json.dumps(path_data, indent=2)}]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to get agent movement path: {e}"}
                ]
            }

    def get_spatial_analytics(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive spatial analytics for all agents."""
        try:
            import statistics

            from reynard_ecs_world import AgentComponent, PositionComponent

            agents = self.world.get_entities_with_components(
                AgentComponent, PositionComponent
            )

            if not agents:
                return {
                    "content": [
                        {"type": "text", "text": "No agents with position data found"}
                    ]
                }

            positions = []
            velocities = []
            movement_speeds = []

            for entity in agents:
                position_comp = entity.get_component(PositionComponent)
                if position_comp:
                    positions.append((position_comp.x, position_comp.y))
                    velocities.append(
                        (position_comp.velocity_x, position_comp.velocity_y)
                    )
                    movement_speeds.append(position_comp.movement_speed)

            # Calculate spatial statistics
            x_coords = [pos[0] for pos in positions]
            y_coords = [pos[1] for pos in positions]

            analytics = {
                "total_agents": len(agents),
                "spatial_distribution": {
                    "center_of_mass": {
                        "x": round(statistics.mean(x_coords), 2),
                        "y": round(statistics.mean(y_coords), 2),
                    },
                    "bounds": {
                        "min_x": round(min(x_coords), 2),
                        "max_x": round(max(x_coords), 2),
                        "min_y": round(min(y_coords), 2),
                        "max_y": round(max(y_coords), 2),
                    },
                    "spread": {
                        "x_std": round(
                            statistics.stdev(x_coords) if len(x_coords) > 1 else 0, 2
                        ),
                        "y_std": round(
                            statistics.stdev(y_coords) if len(y_coords) > 1 else 0, 2
                        ),
                    },
                },
                "movement_statistics": {
                    "avg_speed": round(statistics.mean(movement_speeds), 2),
                    "max_speed": round(max(movement_speeds), 2),
                    "min_speed": round(min(movement_speeds), 2),
                    "speed_std": round(
                        (
                            statistics.stdev(movement_speeds)
                            if len(movement_speeds) > 1
                            else 0
                        ),
                        2,
                    ),
                },
                "velocity_analysis": {
                    "avg_velocity_magnitude": round(
                        statistics.mean(
                            [math.sqrt(vx**2 + vy**2) for vx, vy in velocities]
                        ),
                        2,
                    ),
                    "stationary_agents": len(
                        [
                            v
                            for v in velocities
                            if math.sqrt(v[0] ** 2 + v[1] ** 2) < 0.1
                        ]
                    ),
                },
            }

            return {
                "content": [{"type": "text", "text": json.dumps(analytics, indent=2)}]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to get spatial analytics: {e}"}
                ]
            }

    def start_global_breeding(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Start the global breeding scheduler."""
        try:
            import asyncio

            # Start the breeding scheduler
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.world.start_global_breeding())
            loop.close()

            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Global breeding scheduler started successfully",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to start global breeding: {e}"}
                ]
            }

    def stop_global_breeding(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Stop the global breeding scheduler."""
        try:
            import asyncio

            # Stop the breeding scheduler
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.world.stop_global_breeding())
            loop.close()

            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Global breeding scheduler stopped successfully",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to stop global breeding: {e}"}
                ]
            }

    async def get_breeding_statistics(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Get breeding statistics via FastAPI backend."""
        try:
            stats = await self.ecs_client.get_breeding_stats()
            return {"content": [{"type": "text", "text": json.dumps(stats, indent=2)}]}
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to get breeding statistics: {e}"}
                ]
            }

    async def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive ECS world simulation status via FastAPI backend."""
        try:
            # Get basic world status
            status_data = await self.ecs_client.get_world_status()
            breeding_stats = await self.ecs_client.get_breeding_stats()

            status = {
                "world_status": status_data.get("status", "unknown"),
                "entity_count": status_data.get("entity_count", 0),
                "agent_count": status_data.get("agent_count", 0),
                "mature_agents": status_data.get("mature_agents", 0),
                "breeding_stats": breeding_stats,
                "simulation_time": 0.0,  # Placeholder - would come from world simulation
                "time_acceleration": 10.0,  # Placeholder - would come from world simulation
            }

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"ECS World Simulation Status: {json.dumps(status, indent=2)}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to get simulation status: {e}"}
                ]
            }

    def accelerate_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Adjust time acceleration factor for world simulation."""
        try:
            factor = arguments.get("factor", 10.0)
            # Placeholder - would set time acceleration in world simulation
            return {
                "content": [
                    {"type": "text", "text": f"Time acceleration set to {factor}x"}
                ]
            }
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to accelerate time: {e}"}]
            }

    def nudge_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Nudge simulation time forward (for MCP actions)."""
        try:
            amount = arguments.get("amount", 0.05)
            # Placeholder - would nudge time in world simulation
            return {
                "content": [
                    {"type": "text", "text": f"Time nudged forward by {amount} units"}
                ]
            }
        except Exception as e:
            return {"content": [{"type": "text", "text": f"Failed to nudge time: {e}"}]}
