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

    def update_proficiency(self, amount: float) -> None:
        """Update proficiency level."""
        self.proficiency = max(0.0, min(1.0, self.proficiency + amount))
        self.last_used = datetime.now()

    def update_confidence(self, amount: float) -> None:
        """Update confidence level."""
        self.confidence = max(0.0, min(1.0, self.confidence + amount))

    def use_knowledge(self) -> None:
        """Mark knowledge as used."""
        self.usage_count += 1
        self.last_used = datetime.now()
        # Slight proficiency increase from usage
        self.update_proficiency(0.001)

    def can_teach(self, target_proficiency: float = 0.3) -> bool:
        """Check if this knowledge can be taught to others."""
        return (self.proficiency >= target_proficiency and 
                self.confidence >= 0.4 and 
                self.transferability >= 0.3)

    def get_teaching_effectiveness(self) -> float:
        """Calculate how effectively this knowledge can be taught."""
        return (self.proficiency * 0.4 + 
                self.confidence * 0.3 + 
                self.transferability * 0.3)

    def get_knowledge_value(self) -> float:
        """Calculate the overall value of this knowledge."""
        return (self.proficiency * 0.3 + 
                self.importance * 0.3 + 
                self.confidence * 0.2 + 
                (self.usage_count / 100.0) * 0.2)


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
    Agent knowledge and learning capabilities.
    
    Manages knowledge acquisition, storage, sharing, and learning
    opportunities for agents.
    """

    def __init__(self) -> None:
        """Initialize the knowledge component."""
        super().__init__()
        self.knowledge_base: Dict[str, Knowledge] = {}
        self.learning_opportunities: Dict[str, LearningOpportunity] = {}
        self.learning_rate: float = 0.1  # Base learning rate
        self.teaching_ability: float = 0.5  # Ability to teach others
        self.curiosity: float = 0.5  # Drive to learn new things
        self.retention_rate: float = 0.8  # How well knowledge is retained
        self.knowledge_capacity: int = 100  # Maximum number of knowledge items
        self.specialization_areas: Set[str] = set()  # Areas of expertise
        self.learning_preferences: Dict[LearningMethod, float] = {
            method: 0.5 for method in LearningMethod
        }
        self.total_knowledge_acquired: int = 0
        self.total_knowledge_shared: int = 0
        self.total_teaching_sessions: int = 0
        self.total_learning_sessions: int = 0
        self.knowledge_decay_rate: float = 0.001  # Knowledge decay per day
        self.last_knowledge_update: datetime = datetime.now()
        self._agent_id: str = "unknown"

    def add_knowledge(
        self, 
        title: str, 
        knowledge_type: KnowledgeType, 
        description: str,
        proficiency: float = 0.1,
        confidence: float = 0.5,
        learning_method: LearningMethod = LearningMethod.EXPERIENCE,
        source_agent: str | None = None,
        tags: List[str] | None = None,
        difficulty: float = 0.5,
        importance: float = 0.5,
        transferability: float = 0.5
    ) -> str:
        """
        Add new knowledge to the agent's knowledge base.
        
        Args:
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
        if len(self.knowledge_base) >= self.knowledge_capacity:
            # Remove least valuable knowledge
            self._remove_least_valuable_knowledge()

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
            tags=tags or [],
            difficulty=difficulty,
            importance=importance,
            transferability=transferability
        )

        self.knowledge_base[knowledge_id] = knowledge
        self.total_knowledge_acquired += 1
        self.last_knowledge_update = datetime.now()

        return knowledge_id

    def get_knowledge(self, knowledge_id: str) -> Knowledge | None:
        """Get knowledge by ID."""
        return self.knowledge_base.get(knowledge_id)

    def get_knowledge_by_type(self, knowledge_type: KnowledgeType) -> List[Knowledge]:
        """Get all knowledge of a specific type."""
        return [knowledge for knowledge in self.knowledge_base.values() 
                if knowledge.knowledge_type == knowledge_type]

    def get_knowledge_by_level(self, min_proficiency: float = 0.0) -> List[Knowledge]:
        """Get knowledge above a certain proficiency level."""
        return [knowledge for knowledge in self.knowledge_base.values() 
                if knowledge.proficiency >= min_proficiency]

    def get_teachable_knowledge(self, min_proficiency: float = 0.3) -> List[Knowledge]:
        """Get knowledge that can be taught to others."""
        return [knowledge for knowledge in self.knowledge_base.values() 
                if knowledge.can_teach(min_proficiency)]

    def update_knowledge_proficiency(self, knowledge_id: str, amount: float) -> bool:
        """Update proficiency of specific knowledge."""
        knowledge = self.get_knowledge(knowledge_id)
        if knowledge:
            knowledge.update_proficiency(amount)
            self.last_knowledge_update = datetime.now()
            return True
        return False

    def use_knowledge(self, knowledge_id: str) -> bool:
        """Mark knowledge as used."""
        knowledge = self.get_knowledge(knowledge_id)
        if knowledge:
            knowledge.use_knowledge()
            return True
        return False

    def remove_knowledge(self, knowledge_id: str) -> bool:
        """Remove knowledge from the knowledge base."""
        if knowledge_id in self.knowledge_base:
            del self.knowledge_base[knowledge_id]
            return True
        return False

    def _remove_least_valuable_knowledge(self) -> None:
        """Remove the least valuable knowledge to make room for new knowledge."""
        if not self.knowledge_base:
            return

        least_valuable = min(
            self.knowledge_base.values(),
            key=lambda k: k.get_knowledge_value()
        )
        del self.knowledge_base[least_valuable.id]

    def add_learning_opportunity(
        self,
        knowledge_id: str,
        source_agent: str,
        learning_method: LearningMethod,
        estimated_difficulty: float,
        estimated_duration: float,
        prerequisites_met: bool = True,
        learning_potential: float = 0.5,
        expires_at: datetime | None = None
    ) -> str:
        """
        Add a learning opportunity for the agent.
        
        Args:
            knowledge_id: ID of the knowledge to learn
            source_agent: Agent who can teach this knowledge
            learning_method: Method of learning
            estimated_difficulty: Estimated difficulty (0.0 to 1.0)
            estimated_duration: Estimated duration in seconds
            prerequisites_met: Whether prerequisites are met
            learning_potential: Potential learning value (0.0 to 1.0)
            expires_at: When the opportunity expires
            
        Returns:
            Opportunity ID if successful, empty string if failed
        """
        opportunity_id = str(uuid.uuid4())
        opportunity = LearningOpportunity(
            id=opportunity_id,
            knowledge_id=knowledge_id,
            source_agent=source_agent,
            learning_method=learning_method,
            estimated_difficulty=estimated_difficulty,
            estimated_duration=estimated_duration,
            prerequisites_met=prerequisites_met,
            learning_potential=learning_potential,
            expires_at=expires_at
        )

        self.learning_opportunities[opportunity_id] = opportunity
        return opportunity_id

    def get_learning_opportunities(self, expired: bool = False) -> List[LearningOpportunity]:
        """Get learning opportunities, optionally including expired ones."""
        if expired:
            return list(self.learning_opportunities.values())
        else:
            return [opp for opp in self.learning_opportunities.values() 
                    if not opp.is_expired()]

    def get_best_learning_opportunity(self) -> LearningOpportunity | None:
        """Get the best available learning opportunity."""
        opportunities = self.get_learning_opportunities()
        if not opportunities:
            return None
        
        return max(opportunities, key=lambda opp: opp.get_learning_score())

    def remove_learning_opportunity(self, opportunity_id: str) -> bool:
        """Remove a learning opportunity."""
        if opportunity_id in self.learning_opportunities:
            del self.learning_opportunities[opportunity_id]
            return True
        return False

    def can_learn_from(self, source_agent: str, knowledge_id: str) -> bool:
        """Check if the agent can learn specific knowledge from another agent."""
        # Check if we already have this knowledge
        if any(k.id == knowledge_id for k in self.knowledge_base.values()):
            return False
        
        # Check if we have a learning opportunity for this
        for opportunity in self.learning_opportunities.values():
            if (opportunity.knowledge_id == knowledge_id and 
                opportunity.source_agent == source_agent and 
                not opportunity.is_expired()):
                return True
        
        return False

    def calculate_learning_effectiveness(self, learning_method: LearningMethod) -> float:
        """Calculate how effective a learning method is for this agent."""
        base_effectiveness = self.learning_preferences.get(learning_method, 0.5)
        curiosity_bonus = self.curiosity * 0.2
        learning_rate_bonus = self.learning_rate * 0.3
        
        return min(1.0, base_effectiveness + curiosity_bonus + learning_rate_bonus)

    def process_knowledge_decay(self, delta_time: float) -> None:  # noqa: ARG002
        """Process knowledge decay over time."""
        current_time = datetime.now()
        time_since_update = (current_time - self.last_knowledge_update).total_seconds()
        
        if time_since_update > 86400:  # More than a day
            decay_amount = self.knowledge_decay_rate * (time_since_update / 86400)
            
            for knowledge in self.knowledge_base.values():
                # Decay proficiency and confidence
                knowledge.update_proficiency(-decay_amount * 0.1)
                knowledge.update_confidence(-decay_amount * 0.05)
            
            self.last_knowledge_update = current_time

    def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get comprehensive knowledge statistics."""
        total_knowledge = len(self.knowledge_base)
        if total_knowledge == 0:
            return {
                "total_knowledge": 0,
                "knowledge_types": {},
                "proficiency_levels": {},
                "learning_opportunities": 0,
                "specialization_areas": list(self.specialization_areas),
                "learning_rate": self.learning_rate,
                "teaching_ability": self.teaching_ability,
                "curiosity": self.curiosity
            }

        # Count by knowledge type
        knowledge_types: Dict[str, int] = {}
        for knowledge in self.knowledge_base.values():
            kt = knowledge.knowledge_type.value
            knowledge_types[kt] = knowledge_types.get(kt, 0) + 1

        # Count by proficiency level
        proficiency_levels: Dict[str, int] = {}
        for knowledge in self.knowledge_base.values():
            level = knowledge.get_knowledge_level().value
            proficiency_levels[level] = proficiency_levels.get(level, 0) + 1

        # Calculate averages
        avg_proficiency = sum(k.proficiency for k in self.knowledge_base.values()) / total_knowledge
        avg_confidence = sum(k.confidence for k in self.knowledge_base.values()) / total_knowledge
        avg_importance = sum(k.importance for k in self.knowledge_base.values()) / total_knowledge

        return {
            "total_knowledge": total_knowledge,
            "knowledge_types": knowledge_types,
            "proficiency_levels": proficiency_levels,
            "average_proficiency": avg_proficiency,
            "average_confidence": avg_confidence,
            "average_importance": avg_importance,
            "learning_opportunities": len(self.get_learning_opportunities()),
            "specialization_areas": list(self.specialization_areas),
            "learning_rate": self.learning_rate,
            "teaching_ability": self.teaching_ability,
            "curiosity": self.curiosity,
            "retention_rate": self.retention_rate,
            "knowledge_capacity": self.knowledge_capacity,
            "total_knowledge_acquired": self.total_knowledge_acquired,
            "total_knowledge_shared": self.total_knowledge_shared,
            "total_teaching_sessions": self.total_teaching_sessions,
            "total_learning_sessions": self.total_learning_sessions
        }

    def get_agent_id(self) -> str:
        """Get the agent ID for this component."""
        return self._agent_id

    def set_agent_id(self, agent_id: str) -> None:
        """Set the agent ID for this component."""
        self._agent_id = agent_id

    def __repr__(self) -> str:
        """String representation of the knowledge component."""
        return f"KnowledgeComponent(knowledge={len(self.knowledge_base)}, opportunities={len(self.learning_opportunities)})"
