"""
ECS Client Service for MCP Server

Provides HTTP client interface to the authoritative ECS World running in the FastAPI backend.
This ensures all MCP operations go through the single authoritative ECS instance.
"""

import asyncio
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from aiohttp import ClientSession, ClientTimeout

from .auth_client import AuthClient, get_auth_client

logger = logging.getLogger(__name__)


@dataclass
class ECSConfig:
    """Configuration for ECS client connection."""

    base_url: str = "http://localhost:8000"
    timeout: float = 30.0
    max_retries: int = 3
    retry_delay: float = 1.0


class ECSClient:
    """
    HTTP client for connecting to the authoritative ECS World via FastAPI backend.

    This client ensures all ECS operations go through the single authoritative
    instance running in the FastAPI backend, preventing data conflicts and
    ensuring consistency across all MCP tools.
    """

    def __init__(
        self,
        config: Optional[ECSConfig] = None,
        auth_client: Optional[AuthClient] = None,
    ):
        """
        Initialize the ECS client.

        Args:
            config: ECS client configuration
            auth_client: Authentication client for secure connections
        """
        self.config = config or ECSConfig()
        self.auth_client = auth_client or get_auth_client()
        self._session: Optional[ClientSession] = None
        self._base_url = self.config.base_url.rstrip("/")

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def start(self) -> None:
        """Start the HTTP client session with authentication."""
        if self._session is None:
            timeout = ClientTimeout(total=self.config.timeout)
            self._session = ClientSession(timeout=timeout)

            # Start authentication client
            await self.auth_client.start()

            logger.info(f"🌍 ECS Client started, connecting to {self._base_url}")

    async def close(self) -> None:
        """Close the HTTP client session."""
        if self._session:
            await self._session.close()
            self._session = None
            await self.auth_client.close()
            logger.info("🌍 ECS Client closed")

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Make HTTP request to ECS API with retry logic.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            data: Request body data
            params: Query parameters

        Returns:
            Response data as dictionary

        Raises:
            Exception: If request fails after retries
        """
        if not self._session:
            await self.start()

        url = f"{self._base_url}/api/ecs{endpoint}"

        for attempt in range(self.config.max_retries):
            try:
                headers = self.auth_client.get_auth_headers()

                async with self._session.request(
                    method=method, url=url, json=data, params=params, headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 404:
                        raise Exception(f"ECS endpoint not found: {endpoint}")
                    elif response.status == 503:
                        raise Exception("ECS service not available")
                    else:
                        error_text = await response.text()
                        raise Exception(
                            f"ECS API error {response.status}: {error_text}"
                        )

            except asyncio.TimeoutError:
                if attempt < self.config.max_retries - 1:
                    logger.warning(
                        f"ECS request timeout, retrying in {self.config.retry_delay}s..."
                    )
                    await asyncio.sleep(self.config.retry_delay)
                    continue
                else:
                    raise Exception(
                        f"ECS request timeout after {self.config.max_retries} attempts"
                    )

            except Exception as e:
                if attempt < self.config.max_retries - 1:
                    logger.warning(
                        f"ECS request failed: {e}, retrying in {self.config.retry_delay}s..."
                    )
                    await asyncio.sleep(self.config.retry_delay)
                    continue
                else:
                    raise Exception(
                        f"ECS request failed after {self.config.max_retries} attempts: {e}"
                    )

        raise Exception("Unexpected error in ECS request")

    # World Management Methods

    async def get_world_status(self) -> Dict[str, Any]:
        """Get the current ECS world status."""
        return await self._request("GET", "/status")

    async def get_agents(self) -> List[Dict[str, Any]]:
        """Get all agents in the world."""
        return await self._request("GET", "/agents")

    async def create_agent(
        self,
        agent_id: str,
        spirit: str = "fox",
        style: str = "foundation",
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new agent in the world.

        Args:
            agent_id: Unique identifier for the agent
            spirit: Animal spirit type
            style: Naming style
            name: Optional custom name

        Returns:
            Created agent data
        """
        data = {"agent_id": agent_id, "spirit": spirit, "style": style}
        if name:
            data["name"] = name

        return await self._request("POST", "/agents", data=data)

    async def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> Dict[str, Any]:
        """
        Create offspring from two parent agents.

        Args:
            parent1_id: First parent agent ID
            parent2_id: Second parent agent ID
            offspring_id: New offspring agent ID

        Returns:
            Created offspring data
        """
        data = {
            "parent1_id": parent1_id,
            "parent2_id": parent2_id,
            "offspring_id": offspring_id,
        }
        return await self._request("POST", "/agents/offspring", data=data)

    async def find_compatible_mates(
        self, agent_id: str, max_results: int = 5
    ) -> Dict[str, Any]:
        """
        Find compatible mates for an agent.

        Args:
            agent_id: Agent to find mates for
            max_results: Maximum number of mates to return

        Returns:
            Compatible mates data
        """
        params = {"max_results": max_results}
        return await self._request("GET", f"/agents/{agent_id}/mates", params=params)

    async def analyze_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """
        Analyze genetic compatibility between two agents.

        Args:
            agent1_id: First agent ID
            agent2_id: Second agent ID

        Returns:
            Compatibility analysis data
        """
        return await self._request(
            "GET", f"/agents/{agent1_id}/compatibility/{agent2_id}"
        )

    async def get_agent_lineage(self, agent_id: str, depth: int = 3) -> Dict[str, Any]:
        """
        Get agent family tree and lineage.

        Args:
            agent_id: Agent to get lineage for
            depth: Depth of lineage to retrieve

        Returns:
            Lineage data
        """
        params = {"depth": depth}
        return await self._request("GET", f"/agents/{agent_id}/lineage", params=params)

    async def enable_breeding(self, enabled: bool = True) -> Dict[str, Any]:
        """
        Enable or disable automatic breeding.

        Args:
            enabled: Whether to enable breeding

        Returns:
            Status message
        """
        params = {"enabled": enabled}
        return await self._request("POST", "/breeding/enable", params=params)

    async def get_breeding_stats(self) -> Dict[str, Any]:
        """Get breeding statistics."""
        return await self._request("GET", "/breeding/stats")

    # Position and Movement Methods

    async def get_agent_position(self, agent_id: str) -> Dict[str, Any]:
        """
        Get the current position of an agent.

        Args:
            agent_id: Agent to get position for

        Returns:
            Position data including x, y coordinates and movement info
        """
        return await self._request("GET", f"/agents/{agent_id}/position")

    async def get_all_agent_positions(self) -> Dict[str, Any]:
        """
        Get positions of all agents in the world.

        Returns:
            Dictionary mapping agent IDs to their position data
        """
        return await self._request("GET", "/agents/positions")

    async def move_agent(self, agent_id: str, x: float, y: float) -> Dict[str, Any]:
        """
        Move an agent to a specific position.

        Args:
            agent_id: Agent to move
            x: Target X coordinate
            y: Target Y coordinate

        Returns:
            Movement confirmation and new position
        """
        data = {"x": x, "y": y}
        return await self._request("POST", f"/agents/{agent_id}/move", data=data)

    async def move_agent_towards(
        self, agent_id: str, target_agent_id: str, distance: float = 50.0
    ) -> Dict[str, Any]:
        """
        Move an agent towards another agent.

        Args:
            agent_id: Agent to move
            target_agent_id: Agent to move towards
            distance: Distance to maintain from target (default: 50.0)

        Returns:
            Movement confirmation and new position
        """
        data = {"target_agent_id": target_agent_id, "distance": distance}
        return await self._request(
            "POST", f"/agents/{agent_id}/move_towards", data=data
        )

    async def get_agent_distance(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """
        Get the distance between two agents.

        Args:
            agent1_id: First agent ID
            agent2_id: Second agent ID

        Returns:
            Distance information between the agents
        """
        return await self._request("GET", f"/agents/{agent1_id}/distance/{agent2_id}")

    # Interaction and Communication Methods

    async def initiate_interaction(
        self, agent1_id: str, agent2_id: str, interaction_type: str = "communication"
    ) -> Dict[str, Any]:
        """
        Initiate an interaction between two agents.

        Args:
            agent1_id: First agent ID
            agent2_id: Second agent ID
            interaction_type: Type of interaction (communication, collaboration, social, etc.)

        Returns:
            Interaction initiation result
        """
        data = {"agent2_id": agent2_id, "interaction_type": interaction_type}
        return await self._request("POST", f"/agents/{agent1_id}/interact", data=data)

    async def send_chat_message(
        self,
        sender_id: str,
        receiver_id: str,
        message: str,
        interaction_type: str = "communication",
    ) -> Dict[str, Any]:
        """
        Send a chat message from one agent to another.

        Args:
            sender_id: Agent sending the message
            receiver_id: Agent receiving the message
            message: Message content
            interaction_type: Type of interaction (communication, social, etc.)

        Returns:
            Chat message result and interaction data
        """
        data = {
            "receiver_id": receiver_id,
            "message": message,
            "interaction_type": interaction_type,
        }
        return await self._request("POST", f"/agents/{sender_id}/chat", data=data)

    async def get_interaction_history(
        self, agent_id: str, limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get the interaction history for an agent.

        Args:
            agent_id: Agent to get history for
            limit: Maximum number of interactions to return

        Returns:
            List of recent interactions
        """
        try:
            params = {"limit": limit}
            return await self._request(
                "GET", f"/agents/{agent_id}/interactions", params=params
            )
        except Exception as e:
            logger.warning(f"Failed to get interaction history for {agent_id}: {e}")
            # Return empty history as fallback
            return {"interactions": [], "total_count": 0}

    async def get_agent_relationships(self, agent_id: str) -> Dict[str, Any]:
        """
        Get all relationships for an agent.

        Args:
            agent_id: Agent to get relationships for

        Returns:
            Dictionary of relationships with other agents
        """
        return await self._request("GET", f"/agents/{agent_id}/relationships")

    async def get_agent_social_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get social interaction statistics for an agent.

        Args:
            agent_id: Agent to get stats for

        Returns:
            Social interaction statistics
        """
        try:
            return await self._request("GET", f"/agents/{agent_id}/social_stats")
        except Exception as e:
            logger.warning(f"Failed to get social stats for {agent_id}: {e}")
            # Return default stats as fallback
            return {
                "total_interactions": 0,
                "successful_interactions": 0,
                "failed_interactions": 0,
                "success_rate": 0.0,
                "social_energy": 1.0,
                "max_social_energy": 1.0,
                "energy_percentage": 1.0,
                "active_interactions": 0,
                "total_relationships": 0,
                "positive_relationships": 0,
                "negative_relationships": 0,
                "communication_style": "casual",
            }

    async def get_nearby_agents(
        self, agent_id: str, radius: float = 100.0
    ) -> Dict[str, Any]:
        """
        Get all agents within a certain radius of an agent.

        Args:
            agent_id: Agent to check around
            radius: Search radius in world units

        Returns:
            List of nearby agents with their positions and distances
        """
        params = {"radius": radius}
        return await self._request("GET", f"/agents/{agent_id}/nearby", params=params)

    async def find_agent_by_name(
        self, query: str, exact_match: bool = False
    ) -> Dict[str, Any]:
        """
        Find agents by name or ID with flexible matching.

        Args:
            query: Name or ID to search for
            exact_match: Whether to require exact match

        Returns:
            Search results with matching agents
        """
        params = {"query": query, "exact_match": exact_match}
        return await self._request("GET", "/agents/search", params=params)


# Global ECS client instance
_ecs_client: Optional[ECSClient] = None


def get_ecs_client() -> ECSClient:
    """
    Get the singleton ECS client instance.

    Returns:
        The ECSClient instance
    """
    global _ecs_client
    if _ecs_client is None:
        _ecs_client = ECSClient()
    return _ecs_client


async def ensure_ecs_client() -> ECSClient:
    """
    Ensure the ECS client is started and ready.

    Returns:
        Started ECSClient instance
    """
    client = get_ecs_client()
    await client.start()
    return client
