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

    # Memory Management Methods

    async def store_memory(
        self,
        agent_id: str,
        memory_type: str,
        content: str,
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        associated_agents: List[str] = None,
    ) -> bool:
        """
        Store a memory for an agent.

        Args:
            agent_id: ID of the agent to store memory for
            memory_type: Type of memory to store
            content: Memory content/description
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory

        Returns:
            True if memory was stored successfully
        """
        data = {
            "agent_id": agent_id,
            "memory_type": memory_type,
            "content": content,
            "importance": importance,
            "emotional_weight": emotional_weight,
            "associated_agents": associated_agents or [],
        }
        result = await self._request("POST", "/memory/store", data=data)
        return result.get("success", False)

    async def retrieve_memories(
        self,
        agent_id: str,
        query: str = "",
        memory_type: str = None,
        limit: int = 10,
        min_importance: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve memories for an agent.

        Args:
            agent_id: ID of the agent to retrieve memories for
            query: Text query to search for in memory content
            memory_type: Filter by specific memory type
            limit: Maximum number of memories to return
            min_importance: Minimum importance threshold

        Returns:
            List of matching memories
        """
        params = {
            "query": query,
            "limit": limit,
            "min_importance": min_importance,
        }
        if memory_type:
            params["memory_type"] = memory_type

        result = await self._request("GET", f"/memory/{agent_id}/retrieve", params=params)
        return result.get("memories", [])

    async def get_memory_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get memory statistics for an agent.

        Args:
            agent_id: ID of the agent to get stats for

        Returns:
            Dictionary with memory statistics
        """
        return await self._request("GET", f"/memory/{agent_id}/stats")

    async def get_memory_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive memory system statistics.

        Returns:
            Dictionary with system-wide memory statistics
        """
        return await self._request("GET", "/memory/system/stats")

    # Interaction Management Methods

    async def initiate_interaction(
        self,
        agent1_id: str,
        agent2_id: str,
        interaction_type: str = "communication",
    ) -> bool:
        """
        Initiate an interaction between two agents.

        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            interaction_type: Type of interaction to initiate

        Returns:
            True if interaction was initiated successfully
        """
        data = {
            "agent1_id": agent1_id,
            "agent2_id": agent2_id,
            "interaction_type": interaction_type,
        }
        result = await self._request("POST", "/interactions/initiate", data=data)
        return result.get("success", False)

    async def get_relationship_status(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """
        Get relationship status between two agents.

        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent

        Returns:
            Dictionary with relationship information
        """
        return await self._request(
            "GET", f"/interactions/relationship/{agent1_id}/{agent2_id}"
        )

    async def get_interaction_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get interaction statistics for an agent.

        Args:
            agent_id: ID of the agent to get stats for

        Returns:
            Dictionary with interaction statistics
        """
        return await self._request("GET", f"/interactions/{agent_id}/stats")

    async def get_interaction_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive interaction system statistics.

        Returns:
            Dictionary with system-wide interaction statistics
        """
        return await self._request("GET", "/interactions/system/stats")

    # Social Management Methods

    async def create_social_group(
        self,
        creator_id: str,
        group_name: str,
        group_type: str,
        member_ids: List[str],
    ) -> str:
        """
        Create a social group.

        Args:
            creator_id: ID of the agent creating the group
            group_name: Name of the group
            group_type: Type of group to create
            member_ids: List of agent IDs to include in the group

        Returns:
            Group ID if successful, empty string if failed
        """
        data = {
            "creator_id": creator_id,
            "group_name": group_name,
            "group_type": group_type,
            "member_ids": member_ids,
        }
        result = await self._request("POST", "/social/groups/create", data=data)
        return result.get("group_id", "")

    async def get_social_network(self, agent_id: str) -> Dict[str, Any]:
        """
        Get social network information for an agent.

        Args:
            agent_id: ID of the agent to get network for

        Returns:
            Dictionary with network information
        """
        return await self._request("GET", f"/social/network/{agent_id}")

    async def get_group_info(self, group_id: str) -> Dict[str, Any]:
        """
        Get information about a social group.

        Args:
            group_id: ID of the group to get info for

        Returns:
            Dictionary with group information
        """
        return await self._request("GET", f"/social/groups/{group_id}")

    async def get_social_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get social statistics for an agent.

        Args:
            agent_id: ID of the agent to get stats for

        Returns:
            Dictionary with social statistics
        """
        return await self._request("GET", f"/social/stats/{agent_id}")

    async def get_social_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive social system statistics.

        Returns:
            Dictionary with system-wide social statistics
        """
        return await self._request("GET", "/social/system/stats")

    # Knowledge Management Methods

    async def add_knowledge(
        self,
        agent_id: str,
        title: str,
        knowledge_type: str,
        description: str,
        proficiency: float = 0.1,
        confidence: float = 0.5,
        learning_method: str = "experience",
        source_agent: str | None = None,
        tags: List[str] | None = None,
        difficulty: float = 0.5,
        importance: float = 0.5,
        transferability: float = 0.5,
    ) -> str:
        """
        Add knowledge to an agent's knowledge base.

        Args:
            agent_id: ID of the agent to add knowledge to
            title: Title of the knowledge
            knowledge_type: Type of knowledge
            description: Description of the knowledge
            proficiency: Initial proficiency level (0.0 to 1.0)
            confidence: Confidence in the knowledge (0.0 to 1.0)
            learning_method: How the knowledge was acquired
            source_agent: Agent who taught this knowledge
            tags: Tags for categorization
            difficulty: Difficulty of the knowledge
            importance: Importance of the knowledge
            transferability: How easy it is to teach this knowledge

        Returns:
            Knowledge ID if successful, empty string if failed
        """
        data = {
            "agent_id": agent_id,
            "title": title,
            "knowledge_type": knowledge_type,
            "description": description,
            "proficiency": proficiency,
            "confidence": confidence,
            "learning_method": learning_method,
            "source_agent": source_agent,
            "tags": tags or [],
            "difficulty": difficulty,
            "importance": importance,
            "transferability": transferability,
        }
        result = await self._request("POST", "/knowledge/add", data=data)
        return result.get("knowledge_id", "")

    async def transfer_knowledge(
        self,
        teacher_id: str,
        student_id: str,
        knowledge_id: str,
        learning_method: str = "teaching",
    ) -> bool:
        """
        Transfer knowledge between agents.

        Args:
            teacher_id: ID of the agent teaching the knowledge
            student_id: ID of the agent learning the knowledge
            knowledge_id: ID of the knowledge to transfer
            learning_method: Method of learning

        Returns:
            True if transfer was successful
        """
        data = {
            "teacher_id": teacher_id,
            "student_id": student_id,
            "knowledge_id": knowledge_id,
            "learning_method": learning_method,
        }
        result = await self._request("POST", "/knowledge/transfer", data=data)
        return result.get("success", False)

    async def get_knowledge_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get knowledge statistics for an agent.

        Args:
            agent_id: ID of the agent to get stats for

        Returns:
            Dictionary with knowledge statistics
        """
        return await self._request("GET", f"/knowledge/stats/{agent_id}")

    async def get_knowledge_transfer_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get knowledge transfer statistics for an agent.

        Args:
            agent_id: ID of the agent to get stats for

        Returns:
            Dictionary with transfer statistics
        """
        return await self._request("GET", f"/knowledge/transfer/stats/{agent_id}")

    async def get_learning_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive learning system statistics.

        Returns:
            Dictionary with system-wide learning statistics
        """
        return await self._request("GET", "/knowledge/system/stats")


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
