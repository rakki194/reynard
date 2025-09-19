"""
Knowledge Component

Agent knowledge, learning capabilities, and knowledge transfer systems.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Set

from ..core.component import Component


class KnowledgeType(Enum):
    """Types of knowledge that agents can possess."""
    FACTUAL = "factual"        # Facts and information
    PROCEDURAL = "procedural"  # Skills and how-to knowledge
    CONCEPTUAL = "conceptual"  # Abstract concepts and theories
    EXPERIENTIAL = "experiential"  # Personal experiences and insights
    SOCIAL = "social"          # Social knowledge and cultural information
    TECHNICAL = "technical"    # Technical skills and expertise
    CREATIVE = "creative"      # Creative abilities and artistic knowledge
    EMOTIONAL = "emotional"    # Emotional intelligence and empathy


class LearningMethod(Enum):
    """Methods by which knowledge is acquired."""
    OBSERVATION = "observation"      # Learning by watching others
    PRACTICE = "practice"            # Learning by doing
    TEACHING = "teaching"            # Learning by teaching others
    EXPERIENCE = "experience"        # Learning from direct experience
    STUDY = "study"                  # Learning through study and research
    COLLABORATION = "collaboration"  # Learning through teamwork
    MENTORSHIP = "mentorship"        # Learning from a mentor
    EXPERIMENTATION = "experimentation"  # Learning through trial and error


class KnowledgeLevel(Enum):
    """Levels of knowledge proficiency."""
    BEGINNER = "beginner"      # 0-20% proficiency
    NOVICE = "novice"          # 20-40% proficiency
    INTERMEDIATE = "intermediate"  # 40-60% proficiency
    ADVANCED = "advanced"      # 60-80% proficiency
    EXPERT = "expert"          # 80-95% proficiency
    MASTER = "master"          # 95-100% proficiency


@dataclass
class Knowledge:
    """A piece of knowledge or skill possessed by an agent."""
    id: str
    title: str
    knowledge_type: KnowledgeType
    description: str
    proficiency: float  # 0.0 to 1.0
    confidence: float   # 0.0 to 1.0
    acquired_at: datetime = None
    last_used: datetime = None
    usage_count: int = 0
    learning_method: LearningMethod = LearningMethod.EXPERIENCE
    source_agent: str | None = None  # Agent who taught this knowledge
    tags: List[str] = None
    prerequisites: List[str] = None  # Required knowledge IDs
    applications: List[str] = None   # How this knowledge can be applied
    difficulty: float = 0.5  # 0.0 (easy) to 1.0 (very difficult)
    importance: float = 0.5  # 0.0 (low) to 1.0 (high)
    transferability: float = 0.5  # 0.0 (hard to teach) to 1.0 (easy to teach)

    def __post_init__(self) -> None:
        """Validate knowledge data after initialization."""
        if self.acquired_at is None:
            self.acquired_at = datetime.now()
        if self.last_used is None:
            self.last_used = datetime.now()
        if self.tags is None:
            self.tags = []
        if self.prerequisites is None:
            self.prerequisites = []
        if self.applications is None:
            self.applications = []
        
        self.proficiency = max(0.0, min(1.0, self.proficiency))
        self.confidence = max(0.0, min(1.0, self.confidence))
        self.difficulty = max(0.0, min(1.0, self.difficulty))
        self.importance = max(0.0, min(1.0, self.importance))
        self.transferability = max(0.0, min(1.0, self.transferability))

    def get_knowledge_level(self) -> KnowledgeLevel:
        """Get the knowledge level based on proficiency."""
        if self.proficiency >= 0.95:
            return KnowledgeLevel.MASTER
        elif self.proficiency >= 0.80:
            return KnowledgeLevel.EXPERT
        elif self.proficiency >= 0.60:
            return KnowledgeLevel.ADVANCED
        elif self.proficiency >= 0.40:
            return KnowledgeLevel.INTERMEDIATE
        elif self.proficiency >= 0.20:
            return KnowledgeLevel.NOVICE
        else:
            return KnowledgeLevel.BEGINNER

    def use_knowledge(self) -> None:
        """Record usage of this knowledge."""
        self.last_used = datetime.now()
        self.usage_count += 1
        # Slight proficiency boost from usage
        self.proficiency = min(1.0, self.proficiency + 0.001)

    def can_teach(self, target_proficiency: float = 0.3) -> bool:
        """Check if this knowledge can be taught to others."""
        return self.proficiency >= target_proficiency and self.transferability > 0.3

    def get_teaching_effectiveness(self) -> float:
        """Calculate how effectively this knowledge can be taught."""
        return (self.proficiency * self.transferability * self.confidence) / 3.0


@dataclass
class LearningOpportunity:
    """A potential learning opportunity for an agent."""
    id: str
    knowledge_id: str
    source_agent: str
    learning_method: LearningMethod
    estimated_difficulty: float
    estimated_duration: float  # Time in seconds
    prerequisites_met: bool
    learning_potential: float  # 0.0 to 1.0
    created_at: datetime = None
    expires_at: datetime | None = None

    def __post_init__(self) -> None:
        """Validate learning opportunity data."""
        if self.created_at is None:
            self.created_at = datetime.now()
        
        self.estimated_difficulty = max(0.0, min(1.0, self.estimated_difficulty))
        self.learning_potential = max(0.0, min(1.0, self.learning_potential))

    def is_expired(self) -> bool:
        """Check if the learning opportunity has expired."""
        if self.expires_at is None:
            return False
        return datetime.now() > self.expires_at

    def get_learning_score(self) -> float:
        """Calculate the overall learning score for this opportunity."""
        if self.is_expired() or not self.prerequisites_met:
            return 0.0
        
        # Higher score for easier, shorter, more valuable opportunities
        difficulty_factor = 1.0 - self.estimated_difficulty
        duration_factor = max(0.1, 1.0 - (self.estimated_duration / 3600.0))  # Normalize to hours
        potential_factor = self.learning_potential
        
        return (difficulty_factor * 0.3 + 
                duration_factor * 0.3 + 
                potential_factor * 0.4)


class KnowledgeComponent(Component):
    """
    Agent knowledge and learning capabilities component.
    
    Manages knowledge acquisition, storage, transfer, and application
    with comprehensive learning tracking and skill development.
    """

    def __init__(self, knowledge_capacity: int = 500):
        """
        Initialize the knowledge component.
        
        Args:
            knowledge_capacity: Maximum number of knowledge items to store
        """
        super().__init__()
        self.knowledge: Dict[str, Knowledge] = {}
        self.knowledge_capacity = knowledge_capacity
        self.learning_rate = 1.0
        self.teaching_effectiveness = 1.0
        self.total_knowledge_acquired = 0
        self.total_knowledge_taught = 0
        self.learning_preferences: Dict[LearningMethod, float] = {
            method: 1.0 for method in LearningMethod
        }

    def acquire_knowledge(
        self,
        title: str,
        knowledge_type: KnowledgeType,
        description: str,
        proficiency: float = 0.1,
        confidence: float = 0.5,
        learning_method: LearningMethod = LearningMethod.EXPERIENCE,
        source_agent: str | None = None,
        tags: List[str] | None = None,
        prerequisites: List[str] | None = None,
        applications: List[str] | None = None,
        difficulty: float = 0.5,
        importance: float = 0.5,
        transferability: float = 0.5
    ) -> str:
        """
        Acquire new knowledge.
        
        Args:
            title: Knowledge title
            knowledge_type: Type of knowledge
            description: Knowledge description
            proficiency: Initial proficiency level
            confidence: Confidence in this knowledge
            learning_method: How this knowledge was acquired
            source_agent: Agent who taught this knowledge
            tags: Knowledge tags
            prerequisites: Required knowledge IDs
            applications: How this knowledge can be applied
            difficulty: Knowledge difficulty
            importance: Knowledge importance
            transferability: How easy it is to teach this knowledge
            
        Returns:
            Knowledge ID
        """
        if tags is None:
            tags = []
        if prerequisites is None:
            prerequisites = []
        if applications is None:
            applications = []
            
        knowledge_id = str(uuid.uuid4())
        knowledge = Knowledge(
            id=knowledge_id,
            title=title,
            knowledge_type=knowledge_type,
            description=description,
            proficiency=proficiency,
            confidence=confidence,
            learning_method=learning_method,
            source_agent=source_agent,
            tags=tags,
            prerequisites=prerequisites,
            applications=applications,
            difficulty=difficulty,
            importance=importance,
            transferability=transferability
        )
        
        # Check capacity and remove least important knowledge if needed
        if len(self.knowledge) >= self.knowledge_capacity:
            self._remove_least_important_knowledge()
        
        self.knowledge[knowledge_id] = knowledge
        self.total_knowledge_acquired += 1
        
        return knowledge_id

    def get_knowledge(self, knowledge_id: str) -> Knowledge | None:
        """
        Get knowledge by ID.
        
        Args:
            knowledge_id: ID of knowledge to retrieve
            
        Returns:
            Knowledge object or None if not found
        """
        return self.knowledge.get(knowledge_id)

    def search_knowledge(
        self,
        query: str = "",
        knowledge_type: KnowledgeType | None = None,
        min_proficiency: float = 0.0,
        max_proficiency: float = 1.0,
        tags: List[str] | None = None,
        limit: int = 10
    ) -> List[Knowledge]:
        """
        Search knowledge based on various criteria.
        
        Args:
            query: Text query to search for
            knowledge_type: Filter by knowledge type
            min_proficiency: Minimum proficiency threshold
            max_proficiency: Maximum proficiency threshold
            tags: Filter by tags
            limit: Maximum number of results
            
        Returns:
            List of matching knowledge
        """
        if tags is None:
            tags = []
            
        results = []
        
        for knowledge in self.knowledge.values():
            # Check proficiency range
            if not (min_proficiency <= knowledge.proficiency <= max_proficiency):
                continue
                
            # Check knowledge type
            if knowledge_type and knowledge.knowledge_type != knowledge_type:
                continue
                
            # Check tags
            if tags and not any(tag in knowledge.tags for tag in tags):
                continue
                
            # Check text query
            if query and query.lower() not in knowledge.title.lower() and query.lower() not in knowledge.description.lower():
                continue
                
            results.append(knowledge)
        
        # Sort by proficiency and importance
        results.sort(key=lambda k: (k.proficiency, k.importance), reverse=True)
        
        return results[:limit]

    def use_knowledge(self, knowledge_id: str) -> bool:
        """
        Use knowledge and update usage statistics.
        
        Args:
            knowledge_id: ID of knowledge to use
            
        Returns:
            True if knowledge was found and used
        """
        knowledge = self.knowledge.get(knowledge_id)
        if knowledge:
            knowledge.use_knowledge()
            return True
        return False

    def teach_knowledge(
        self,
        knowledge_id: str,
        target_agent_id: str,
        teaching_effectiveness: float = 1.0
    ) -> bool:
        """
        Teach knowledge to another agent.
        
        Args:
            knowledge_id: ID of knowledge to teach
            target_agent_id: ID of agent to teach
            teaching_effectiveness: Effectiveness of teaching (0.0 to 1.0)
            
        Returns:
            True if knowledge was found and can be taught
        """
        knowledge = self.knowledge.get(knowledge_id)
        if knowledge and knowledge.can_teach():
            # Update teaching statistics
            self.total_knowledge_taught += 1
            return True
        return False

    def learn_from_agent(
        self,
        source_agent_id: str,
        knowledge_id: str,
        learning_effectiveness: float = 1.0
    ) -> str | None:
        """
        Learn knowledge from another agent.
        
        Args:
            source_agent_id: ID of agent to learn from
            knowledge_id: ID of knowledge to learn
            learning_effectiveness: Effectiveness of learning (0.0 to 1.0)
            
        Returns:
            New knowledge ID if successful, None otherwise
        """
        # This would typically involve getting knowledge from the source agent
        # For now, we'll return None as this requires inter-agent communication
        return None

    def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get comprehensive knowledge statistics."""
        if not self.knowledge:
            return {
                "total_knowledge": 0,
                "knowledge_types": {},
                "knowledge_levels": {},
                "average_proficiency": 0.0,
                "total_acquired": self.total_knowledge_acquired,
                "total_taught": self.total_knowledge_taught
            }
        
        knowledge_types = {}
        knowledge_levels = {}
        total_proficiency = 0.0
        
        for knowledge in self.knowledge.values():
            # Count by type
            knowledge_types[knowledge.knowledge_type.value] = knowledge_types.get(knowledge.knowledge_type.value, 0) + 1
            
            # Count by level
            level = knowledge.get_knowledge_level()
            knowledge_levels[level.value] = knowledge_levels.get(level.value, 0) + 1
            
            # Sum proficiency
            total_proficiency += knowledge.proficiency
        
        return {
            "total_knowledge": len(self.knowledge),
            "knowledge_types": knowledge_types,
            "knowledge_levels": knowledge_levels,
            "average_proficiency": total_proficiency / len(self.knowledge),
            "total_acquired": self.total_knowledge_acquired,
            "total_taught": self.total_knowledge_taught,
            "knowledge_capacity": self.knowledge_capacity,
            "capacity_usage": len(self.knowledge) / self.knowledge_capacity
        }

    def get_knowledge_by_type(self, knowledge_type: KnowledgeType, limit: int = 10) -> List[Knowledge]:
        """Get knowledge of a specific type."""
        return self.search_knowledge(knowledge_type=knowledge_type, limit=limit)

    def get_expertise_areas(self, min_proficiency: float = 0.7, limit: int = 10) -> List[Knowledge]:
        """Get areas where the agent has high proficiency."""
        return self.search_knowledge(
            min_proficiency=min_proficiency,
            limit=limit
        )

    def get_learning_opportunities(self, max_proficiency: float = 0.3, limit: int = 10) -> List[Knowledge]:
        """Get knowledge areas that need improvement."""
        return self.search_knowledge(
            max_proficiency=max_proficiency,
            limit=limit
        )

    def update_learning_preference(self, method: LearningMethod, preference: float) -> None:
        """
        Update learning preference for a specific method.
        
        Args:
            method: Learning method to update
            preference: Preference value (0.0 to 1.0)
        """
        self.learning_preferences[method] = max(0.0, min(1.0, preference))

    def get_learning_preferences(self) -> Dict[LearningMethod, float]:
        """Get current learning preferences."""
        return self.learning_preferences.copy()

    def _remove_least_important_knowledge(self) -> None:
        """Remove the least important knowledge to make room."""
        if not self.knowledge:
            return
            
        # Find knowledge with lowest importance and proficiency
        least_important = min(
            self.knowledge.values(),
            key=lambda k: (k.importance, k.proficiency)
        )
        
        del self.knowledge[least_important.id]

    def can_learn_knowledge(self, knowledge_id: str) -> bool:
        """
        Check if the agent can learn a specific knowledge.
        
        Args:
            knowledge_id: ID of knowledge to check
            
        Returns:
            True if prerequisites are met
        """
        # This would check if prerequisites are met
        # For now, return True as we don't have access to other agents' knowledge
        return True
