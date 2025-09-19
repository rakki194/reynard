"""
Memory System

Manages agent memories, storage, retrieval, decay, and consolidation.
Processes memory operations for all agents in the ECS world.
"""

import logging
from typing import Any, Dict, List

from reynard_ecs_world.components.memory import MemoryComponent, MemoryType
from reynard_ecs_world.core.system import System

logger = logging.getLogger(__name__)


class MemorySystem(System):
    """
    System for managing agent memories, storage, and retrieval.
    
    Handles memory decay, consolidation, cleanup, and provides
    intelligent memory management for all agents.
    """

    def __init__(self, world) -> None:
        """
        Initialize the memory system.
        
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
        """
        Process memory operations for all agents.
        
        Args:
            delta_time: Time elapsed since last update
        """
        self.last_processing_time += delta_time

        # Process memories at regular intervals
        if self.last_processing_time >= self.memory_processing_interval:
            self._process_memory_operations(delta_time)
            self.last_processing_time = 0.0

    def _process_memory_operations(self, delta_time: float) -> None:
        """
        Process all memory operations for agents with memory components.
        
        Args:
            delta_time: Time elapsed since last processing
        """
        entities = self.get_entities_with_components(MemoryComponent)
        
        for entity in entities:
            memory_comp = entity.get_component(MemoryComponent)
            if memory_comp:
                self._process_agent_memories(memory_comp, delta_time)

    def _process_agent_memories(self, memory_comp: MemoryComponent, delta_time: float) -> None:
        """
        Process memory operations for a specific agent.
        
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

    def _process_memory_decay(self, memory_comp: MemoryComponent, delta_time: float) -> None:
        """
        Apply decay to memories based on importance and access patterns.
        
        Args:
            memory_comp: The agent's memory component
            delta_time: Time elapsed since last processing
        """
        for memory in memory_comp.memories.values():
            # Calculate decay based on importance and access frequency
            decay_factor = memory.decay_rate * delta_time
            
            # Faster decay for unimportant memories
            if memory.importance < memory_comp.importance_threshold:
                decay_factor *= 2.0
            
            # Slower decay for frequently accessed memories
            if memory.access_count > 5:
                decay_factor *= 0.5
            
            # Apply decay
            memory.decay(decay_factor)

    def _consolidate_important_memories(self, memory_comp: MemoryComponent) -> int:
        """
        Consolidate highly important memories to prevent decay.
        
        Args:
            memory_comp: The agent's memory component
            
        Returns:
            Number of memories consolidated
        """
        return memory_comp.consolidate_memories()

    def _cleanup_irrelevant_memories(self, memory_comp: MemoryComponent) -> int:
        """
        Remove memories that have decayed below threshold.
        
        Args:
            memory_comp: The agent's memory component
            
        Returns:
            Number of memories removed
        """
        return memory_comp.cleanup_forgotten_memories()

    def store_memory_for_agent(
        self,
        agent_id: str,
        memory_type: MemoryType,
        content: str,
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        associated_agents: List[str] | None = None
    ) -> str:
        """
        Store a memory for a specific agent.
        
        Args:
            agent_id: ID of the agent to store memory for
            memory_type: Type of memory to store
            content: Memory content/description
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory
            
        Returns:
            Memory ID of the stored memory, or empty string if agent not found
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            logger.warning(f"Agent {agent_id} not found for memory storage")
            return ""

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            logger.warning(f"Agent {agent_id} has no memory component")
            return ""

        memory_id = memory_comp.store_memory(
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents or []
        )

        logger.debug(f"Stored {memory_type.value} memory for agent {agent_id}: {memory_id}")
        return memory_id

    def retrieve_memories_for_agent(
        self,
        agent_id: str,
        query: str = "",
        memory_type: MemoryType | None = None,
        limit: int = 10,
        min_importance: float = 0.0
    ) -> List[Any]:
        """
        Retrieve memories for a specific agent.
        
        Args:
            agent_id: ID of the agent to retrieve memories for
            query: Text query to search for in memory content
            memory_type: Filter by specific memory type
            limit: Maximum number of memories to return
            min_importance: Minimum importance threshold
            
        Returns:
            List of matching memories
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            logger.warning(f"Agent {agent_id} not found for memory retrieval")
            return []

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            logger.warning(f"Agent {agent_id} has no memory component")
            return []

        return memory_comp.retrieve_memories(
            query=query,
            memory_type=memory_type,
            limit=limit,
            min_importance=min_importance
        )

    def get_memory_stats_for_agent(self, agent_id: str) -> Dict[str, Any]:
        """
        Get memory statistics for a specific agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with memory statistics
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {}

        memory_comp = entity.get_component(MemoryComponent)
        if not memory_comp:
            return {}

        return memory_comp.get_memory_stats()

    def get_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive system statistics.
        
        Returns:
            Dictionary with system statistics
        """
        entities = self.get_entities_with_components(MemoryComponent)
        total_agents = len(entities)
        total_memories = sum(
            len(entity.get_component(MemoryComponent).memories)
            for entity in entities
            if entity.get_component(MemoryComponent)
        )

        return {
            "total_agents_with_memory": total_agents,
            "total_memories": total_memories,
            "memories_processed": self.total_memories_processed,
            "memories_consolidated": self.total_memories_consolidated,
            "memories_cleaned": self.total_memories_cleaned,
            "processing_interval": self.memory_processing_interval
        }

    def __repr__(self) -> str:
        """String representation of the memory system."""
        return f"MemorySystem(enabled={self.enabled}, processed={self.total_memories_processed})"
