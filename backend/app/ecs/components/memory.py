"""Memory Component

Advanced memory management system for agents with episodic, semantic, procedural,
and emotional memory types with intelligent decay and consolidation.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any

from ..core.component import Component


class MemoryType(Enum):
    """Types of memories that agents can form."""

    EPISODIC = "episodic"  # Specific events and experiences
    SEMANTIC = "semantic"  # Facts and knowledge
    PROCEDURAL = "procedural"  # Skills and abilities
    EMOTIONAL = "emotional"  # Feelings and associations
    SOCIAL = "social"  # Relationships and interactions


@dataclass
class Memory:
    """Individual memory entry with comprehensive metadata."""

    id: str
    memory_type: MemoryType
    content: str
    importance: float  # 0.0 to 1.0
    emotional_weight: float  # -1.0 to 1.0
    associated_agents: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)
    access_count: int = 0
    decay_rate: float = 0.01

    def __post_init__(self):
        """Validate memory data after initialization."""
        self.importance = max(0.0, min(1.0, self.importance))
        self.emotional_weight = max(-1.0, min(1.0, self.emotional_weight))
        self.decay_rate = max(0.0, min(0.1, self.decay_rate))

    def access(self) -> None:
        """Record memory access and update metadata."""
        self.last_accessed = datetime.now()
        self.access_count += 1
        # Slight importance boost from access
        self.importance = min(1.0, self.importance + 0.01)

    def decay(self, delta_time: float) -> None:
        """Apply decay to memory importance over time."""
        decay_factor = self.decay_rate * delta_time
        self.importance = max(0.0, self.importance - decay_factor)

    def is_consolidated(self, threshold: float = 0.8) -> bool:
        """Check if memory is consolidated (high importance)."""
        return self.importance >= threshold

    def is_forgotten(self, threshold: float = 0.1) -> bool:
        """Check if memory has decayed below recall threshold."""
        return self.importance < threshold


class MemoryComponent(Component):
    """Agent memory and experience storage component.

    Manages episodic, semantic, procedural, and emotional memories with
    intelligent decay, consolidation, and retrieval capabilities.
    """

    def __init__(self, memory_capacity: int = 1000):
        """Initialize the memory component.

        Args:
            memory_capacity: Maximum number of memories to store

        """
        super().__init__()
        self.memories: dict[str, Memory] = {}
        self.memory_capacity = memory_capacity
        self.memory_decay_rate = 0.01
        self.importance_threshold = 0.5
        self.consolidation_threshold = 0.8
        self.retrieval_efficiency = 1.0
        self.total_memories_formed = 0
        self.total_memories_forgotten = 0

    def store_memory(
        self,
        memory_type: MemoryType,
        content: str,
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        associated_agents: list[str] | None = None,
    ) -> str:
        """Store a new memory.

        Args:
            memory_type: Type of memory to store
            content: Memory content
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory

        Returns:
            Memory ID

        """
        if associated_agents is None:
            associated_agents = []

        memory_id = str(uuid.uuid4())
        memory = Memory(
            id=memory_id,
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents,
        )

        # Check capacity and remove old memories if needed
        if len(self.memories) >= self.memory_capacity:
            self._remove_oldest_memory()

        self.memories[memory_id] = memory
        self.total_memories_formed += 1

        return memory_id

    def retrieve_memory(self, memory_id: str) -> Memory | None:
        """Retrieve a specific memory by ID.

        Args:
            memory_id: ID of memory to retrieve

        Returns:
            Memory object or None if not found

        """
        memory = self.memories.get(memory_id)
        if memory:
            memory.access()
        return memory

    def search_memories(
        self,
        query: str = "",
        memory_type: MemoryType | None = None,
        min_importance: float = 0.0,
        max_importance: float = 1.0,
        associated_agent: str | None = None,
        limit: int = 10,
    ) -> list[Memory]:
        """Search memories based on various criteria.

        Args:
            query: Text query to search for in memory content
            memory_type: Filter by memory type
            min_importance: Minimum importance threshold
            max_importance: Maximum importance threshold
            associated_agent: Filter by associated agent
            limit: Maximum number of results

        Returns:
            List of matching memories

        """
        results = []

        for memory in self.memories.values():
            # Check importance range
            if not (min_importance <= memory.importance <= max_importance):
                continue

            # Check memory type
            if memory_type and memory.memory_type != memory_type:
                continue

            # Check associated agent
            if associated_agent and associated_agent not in memory.associated_agents:
                continue

            # Check text query
            if query and query.lower() not in memory.content.lower():
                continue

            results.append(memory)

        # Sort by importance and access count
        results.sort(key=lambda m: (m.importance, m.access_count), reverse=True)

        return results[:limit]

    def get_memory_stats(self) -> dict[str, Any]:
        """Get comprehensive memory statistics."""
        if not self.memories:
            return {
                "total_memories": 0,
                "memory_types": {},
                "average_importance": 0.0,
                "consolidated_memories": 0,
                "forgotten_memories": 0,
                "total_formed": self.total_memories_formed,
                "total_forgotten": self.total_memories_forgotten,
            }

        memory_types = {}
        total_importance = 0.0
        consolidated_count = 0
        forgotten_count = 0

        for memory in self.memories.values():
            # Count by type
            memory_types[memory.memory_type.value] = (
                memory_types.get(memory.memory_type.value, 0) + 1
            )

            # Sum importance
            total_importance += memory.importance

            # Count consolidated and forgotten
            if memory.is_consolidated(self.consolidation_threshold):
                consolidated_count += 1
            if memory.is_forgotten():
                forgotten_count += 1

        return {
            "total_memories": len(self.memories),
            "memory_types": memory_types,
            "average_importance": total_importance / len(self.memories),
            "consolidated_memories": consolidated_count,
            "forgotten_memories": forgotten_count,
            "total_formed": self.total_memories_formed,
            "total_forgotten": self.total_memories_forgotten,
            "memory_capacity": self.memory_capacity,
            "capacity_usage": len(self.memories) / self.memory_capacity,
        }

    def consolidate_memories(self, delta_time: float) -> None:
        """Apply memory decay and consolidation over time.

        Args:
            delta_time: Time elapsed since last consolidation

        """
        memories_to_remove = []

        for memory in self.memories.values():
            # Apply decay
            memory.decay(delta_time)

            # Mark for removal if forgotten
            if memory.is_forgotten():
                memories_to_remove.append(memory.id)

        # Remove forgotten memories
        for memory_id in memories_to_remove:
            del self.memories[memory_id]
            self.total_memories_forgotten += 1

    def _remove_oldest_memory(self) -> None:
        """Remove the oldest, least important memory."""
        if not self.memories:
            return

        # Find memory with lowest importance and oldest access time
        oldest_memory = min(
            self.memories.values(), key=lambda m: (m.importance, m.last_accessed),
        )

        del self.memories[oldest_memory.id]
        self.total_memories_forgotten += 1

    def get_episodic_memories(self, limit: int = 10) -> list[Memory]:
        """Get recent episodic memories."""
        return self.search_memories(memory_type=MemoryType.EPISODIC, limit=limit)

    def get_semantic_memories(self, limit: int = 10) -> list[Memory]:
        """Get semantic memories."""
        return self.search_memories(memory_type=MemoryType.SEMANTIC, limit=limit)

    def get_emotional_memories(self, limit: int = 10) -> list[Memory]:
        """Get emotional memories."""
        return self.search_memories(memory_type=MemoryType.EMOTIONAL, limit=limit)

    def get_social_memories(self, limit: int = 10) -> list[Memory]:
        """Get social memories."""
        return self.search_memories(memory_type=MemoryType.SOCIAL, limit=limit)

    def get_memories_with_agent(self, agent_id: str, limit: int = 10) -> list[Memory]:
        """Get memories associated with a specific agent."""
        return self.search_memories(associated_agent=agent_id, limit=limit)

    def update_memory_importance(self, memory_id: str, new_importance: float) -> bool:
        """Update the importance of a memory.

        Args:
            memory_id: ID of memory to update
            new_importance: New importance value (0.0 to 1.0)

        Returns:
            True if memory was found and updated

        """
        memory = self.memories.get(memory_id)
        if memory:
            memory.importance = max(0.0, min(1.0, new_importance))
            return True
        return False

    def forget_memory(self, memory_id: str) -> bool:
        """Remove a specific memory.

        Args:
            memory_id: ID of memory to remove

        Returns:
            True if memory was found and removed

        """
        if memory_id in self.memories:
            del self.memories[memory_id]
            self.total_memories_forgotten += 1
            return True
        return False
