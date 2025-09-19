"""
Memory Component

Advanced memory management system for agents with episodic, semantic, procedural,
and emotional memory types with intelligent decay and consolidation.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List

from ..core.component import Component


class MemoryType(Enum):
    """Types of memories that agents can form."""
    EPISODIC = "episodic"      # Specific events and experiences
    SEMANTIC = "semantic"      # Facts and knowledge
    PROCEDURAL = "procedural"  # Skills and abilities
    EMOTIONAL = "emotional"    # Feelings and associations
    SOCIAL = "social"          # Relationships and interactions


@dataclass
class Memory:
    """Individual memory entry with comprehensive metadata."""
    id: str
    memory_type: MemoryType
    content: str
    importance: float  # 0.0 to 1.0
    emotional_weight: float  # -1.0 to 1.0
    associated_agents: List[str] = field(default_factory=list)
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
    """
    Agent memory and experience storage component.
    
    Manages episodic, semantic, procedural, and emotional memories with
    intelligent decay, consolidation, and retrieval capabilities.
    """

    def __init__(self, memory_capacity: int = 1000):
        """
        Initialize the memory component.
        
        Args:
            memory_capacity: Maximum number of memories to store
        """
        super().__init__()
        self.memories: Dict[str, Memory] = {}
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
        associated_agents: List[str] | None = None
    ) -> str:
        """
        Store a new memory for the agent.
        
        Args:
            memory_type: Type of memory to store
            content: Memory content/description
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory
            
        Returns:
            Memory ID of the stored memory
        """
        if associated_agents is None:
            associated_agents = []

        # Check capacity and remove least important memory if needed
        if len(self.memories) >= self.memory_capacity:
            self._remove_least_important_memory()

        # Create new memory
        memory_id = f"memory_{uuid.uuid4().hex[:8]}"
        memory = Memory(
            id=memory_id,
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents
        )

        self.memories[memory_id] = memory
        self.total_memories_formed += 1

        return memory_id

    def retrieve_memories(
        self,
        query: str = "",
        memory_type: MemoryType | None = None,
        limit: int = 10,
        min_importance: float = 0.0
    ) -> List[Memory]:
        """
        Retrieve memories based on query and filters.
        
        Args:
            query: Text query to search for in memory content
            memory_type: Filter by specific memory type
            limit: Maximum number of memories to return
            min_importance: Minimum importance threshold
            
        Returns:
            List of matching memories sorted by importance and recency
        """
        memories = list(self.memories.values())

        # Filter by memory type
        if memory_type:
            memories = [m for m in memories if m.memory_type == memory_type]

        # Filter by importance
        memories = [m for m in memories if m.importance >= min_importance]

        # Filter by query
        if query:
            query_lower = query.lower()
            memories = [m for m in memories if query_lower in m.content.lower()]

        # Sort by importance and recency
        memories.sort(key=lambda m: (m.importance, m.last_accessed), reverse=True)

        # Record access for returned memories
        for memory in memories[:limit]:
            memory.access()

        return memories[:limit]

    def get_memory_by_id(self, memory_id: str) -> Memory | None:
        """
        Get a specific memory by ID.
        
        Args:
            memory_id: ID of the memory to retrieve
            
        Returns:
            Memory object or None if not found
        """
        memory = self.memories.get(memory_id)
        if memory:
            memory.access()
        return memory

    def update_memory_importance(self, memory_id: str, new_importance: float) -> bool:
        """
        Update the importance of a specific memory.
        
        Args:
            memory_id: ID of the memory to update
            new_importance: New importance value (0.0 to 1.0)
            
        Returns:
            True if memory was updated, False if not found
        """
        memory = self.memories.get(memory_id)
        if memory:
            memory.importance = max(0.0, min(1.0, new_importance))
            return True
        return False

    def consolidate_memories(self) -> int:
        """
        Consolidate important memories to prevent decay.
        
        Returns:
            Number of memories consolidated
        """
        consolidated_count = 0
        for memory in self.memories.values():
            if memory.is_consolidated(self.consolidation_threshold):
                # Reduce decay rate for consolidated memories
                memory.decay_rate *= 0.5
                consolidated_count += 1
        return consolidated_count

    def cleanup_forgotten_memories(self) -> int:
        """
        Remove memories that have decayed below threshold.
        
        Returns:
            Number of memories removed
        """
        to_remove = [
            memory_id for memory_id, memory in self.memories.items()
            if memory.is_forgotten()
        ]
        
        for memory_id in to_remove:
            del self.memories[memory_id]
            self.total_memories_forgotten += 1

        return len(to_remove)

    def get_memory_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive memory statistics.
        
        Returns:
            Dictionary with memory statistics
        """
        if not self.memories:
            return {
                "total_memories": 0,
                "memory_types": {},
                "average_importance": 0.0,
                "consolidated_count": 0,
                "total_formed": self.total_memories_formed,
                "total_forgotten": self.total_memories_forgotten
            }

        # Count by memory type
        memory_types: Dict[str, int] = {}
        total_importance = 0.0
        consolidated_count = 0

        for memory in self.memories.values():
            memory_type = memory.memory_type.value
            memory_types[memory_type] = memory_types.get(memory_type, 0) + 1
            total_importance += memory.importance
            if memory.is_consolidated(self.consolidation_threshold):
                consolidated_count += 1

        return {
            "total_memories": len(self.memories),
            "memory_types": memory_types,
            "average_importance": total_importance / len(self.memories),
            "consolidated_count": consolidated_count,
            "total_formed": self.total_memories_formed,
            "total_forgotten": self.total_memories_forgotten,
            "capacity_usage": len(self.memories) / self.memory_capacity
        }

    def _remove_least_important_memory(self) -> None:
        """Remove the least important memory to make room for new ones."""
        if not self.memories:
            return

        least_important = min(
            self.memories.values(),
            key=lambda m: (m.importance, m.last_accessed)
        )
        del self.memories[least_important.id]
        self.total_memories_forgotten += 1

    def __repr__(self) -> str:
        """String representation of the memory component."""
        return f"MemoryComponent(memories={len(self.memories)}, capacity={self.memory_capacity})"
