"""Memory System

Manages agent memories, storage, retrieval, decay, and consolidation.
Processes memory operations for all agents in the ECS world.
"""

import logging
from typing import Any

from ..components.memory import MemoryComponent, MemoryType
from ..core.system import System

logger = logging.getLogger(__name__)


class MemorySystem(System):
    """System for managing agent memories, storage, and retrieval.

    Handles memory decay, consolidation, cleanup, and provides
    intelligent memory management for all agents.
    """

    def __init__(self, world) -> None:
        """Initialize the memory system.

        Args:
            world: The ECS world this system belongs to

        """
        super().__init__(world)
        self.memory_processing_interval = 1.0  # Process memories every second
        self.last_processing_time = 0.0
        self.total_memories_processed = 0
        self.total_memories_consolidated = 0
        self.total_memories_cleaned = 0

    def update(self, delta_time: float) -> None:
        """Process memory operations for all agents.

        Args:
            delta_time: Time elapsed since last update

        """
        self.last_processing_time += delta_time

        # Process memories at regular intervals
        if self.last_processing_time >= self.memory_processing_interval:
            self._process_memory_operations(delta_time)
            self.last_processing_time = 0.0

    def _process_memory_operations(self, delta_time: float) -> None:
        """Process all memory operations for agents with memory components.

        Args:
            delta_time: Time elapsed since last processing

        """
        entities = self.get_entities_with_components(MemoryComponent)

        for entity in entities:
            memory_comp = entity.get_component(MemoryComponent)
            if memory_comp:
                self._process_agent_memories(memory_comp, delta_time)

    def _process_agent_memories(
        self,
        memory_comp: MemoryComponent,
        delta_time: float,
    ) -> None:
        """Process memory operations for a specific agent.

        Args:
            memory_comp: The agent's memory component
            delta_time: Time elapsed since last processing

        """
        # Apply memory decay
        self._process_memory_decay(memory_comp, delta_time)

        # Consolidate important memories
        consolidated = self._consolidate_important_memories(memory_comp)
        self.total_memories_consolidated += consolidated

        # Cleanup forgotten memories
        cleaned = self._cleanup_irrelevant_memories(memory_comp)
        self.total_memories_cleaned += cleaned

        self.total_memories_processed += len(memory_comp.memories)

    def _process_memory_decay(
        self,
        memory_comp: MemoryComponent,
        delta_time: float,
    ) -> None:
        """Apply decay to memories based on importance and access patterns.

        Args:
            memory_comp: The agent's memory component
            delta_time: Time elapsed since last processing

        """
        for memory in memory_comp.memories.values():
            # Calculate decay based on importance and access frequency
            decay_factor = memory.decay_rate * delta_time

            # Faster decay for unimportant memories
            if memory.importance < 0.3:
                decay_factor *= 2.0

            # Slower decay for frequently accessed memories
            if memory.access_count > 10:
                decay_factor *= 0.5

            # Apply decay
            memory.decay(decay_factor)

    def _consolidate_important_memories(self, memory_comp: MemoryComponent) -> int:
        """Consolidate important memories to prevent decay.

        Args:
            memory_comp: The agent's memory component

        Returns:
            Number of memories consolidated

        """
        consolidated_count = 0

        for memory in memory_comp.memories.values():
            # Consolidate memories that are important and frequently accessed
            if (
                memory.importance > 0.7
                and memory.access_count > 5
                and not memory.is_consolidated()
            ):

                # Boost importance to consolidation threshold
                memory.importance = min(1.0, memory.importance + 0.1)
                consolidated_count += 1

                logger.debug(f"Consolidated memory: {memory.id}")

        return consolidated_count

    def _cleanup_irrelevant_memories(self, memory_comp: MemoryComponent) -> int:
        """Remove memories that have decayed below recall threshold.

        Args:
            memory_comp: The agent's memory component

        Returns:
            Number of memories cleaned up

        """
        memories_to_remove = []

        for memory_id, memory in memory_comp.memories.items():
            if memory.is_forgotten():
                memories_to_remove.append(memory_id)

        # Remove forgotten memories
        for memory_id in memories_to_remove:
            del memory_comp.memories[memory_id]
            memory_comp.total_memories_forgotten += 1

        return len(memories_to_remove)

    def store_memory_for_agent(
        self,
        agent_id: str,
        memory_type: MemoryType,
        content: str,
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        associated_agents: list[str] | None = None,
    ) -> str | None:
        """Store a memory for a specific agent.

        Args:
            agent_id: ID of the agent
            memory_type: Type of memory to store
            content: Memory content
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory

        Returns:
            Memory ID if successful, None if agent not found

        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return None

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            return None

        return memory_comp.store_memory(
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents,
        )

    def retrieve_memories_for_agent(
        self,
        agent_id: str,
        query: str = "",
        memory_type: MemoryType | None = None,
        limit: int = 10,
    ) -> list[Any]:
        """Retrieve memories for a specific agent.

        Args:
            agent_id: ID of the agent
            query: Search query
            memory_type: Filter by memory type
            limit: Maximum number of results

        Returns:
            List of memories

        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return []

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            return []

        return memory_comp.search_memories(
            query=query,
            memory_type=memory_type,
            limit=limit,
        )

    def get_memory_stats_for_agent(self, agent_id: str) -> dict[str, Any]:
        """Get memory statistics for a specific agent.

        Args:
            agent_id: ID of the agent

        Returns:
            Memory statistics dictionary

        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {}

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            return {}

        return memory_comp.get_memory_stats()

    def get_system_stats(self) -> dict[str, Any]:
        """Get comprehensive system statistics."""
        total_agents = len(self.get_entities_with_components(MemoryComponent))

        return {
            "total_agents_with_memory": total_agents,
            "total_memories_processed": self.total_memories_processed,
            "total_memories_consolidated": self.total_memories_consolidated,
            "total_memories_cleaned": self.total_memories_cleaned,
            "processing_interval": self.memory_processing_interval,
            "last_processing_time": self.last_processing_time,
        }

    def force_memory_consolidation(self, agent_id: str | None = None) -> int:
        """Force memory consolidation for an agent or all agents.

        Args:
            agent_id: ID of specific agent, or None for all agents

        Returns:
            Number of memories consolidated

        """
        if agent_id:
            entity = self.world.get_entity(agent_id)
            if not entity:
                return 0

            memory_comp = entity.get_component(MemoryComponent)
            if not memory_comp:
                return 0

            return self._consolidate_important_memories(memory_comp)
        # Consolidate for all agents
        total_consolidated = 0
        entities = self.get_entities_with_components(MemoryComponent)

        for entity in entities:
            memory_comp = entity.get_component(MemoryComponent)
            if memory_comp:
                total_consolidated += self._consolidate_important_memories(
                    memory_comp,
                )

        return total_consolidated

    def force_memory_cleanup(self, agent_id: str | None = None) -> int:
        """Force memory cleanup for an agent or all agents.

        Args:
            agent_id: ID of specific agent, or None for all agents

        Returns:
            Number of memories cleaned up

        """
        if agent_id:
            entity = self.world.get_entity(agent_id)
            if not entity:
                return 0

            memory_comp = entity.get_component(MemoryComponent)
            if not memory_comp:
                return 0

            return self._cleanup_irrelevant_memories(memory_comp)
        # Cleanup for all agents
        total_cleaned = 0
        entities = self.get_entities_with_components(MemoryComponent)

        for entity in entities:
            memory_comp = entity.get_component(MemoryComponent)
            if memory_comp:
                total_cleaned += self._cleanup_irrelevant_memories(memory_comp)

        return total_cleaned
