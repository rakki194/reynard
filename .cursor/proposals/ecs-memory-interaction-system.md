# ECS Memory & Interaction System Implementation Proposal

## Executive Summary

This proposal outlines a comprehensive extension to the Reynard ECS World system, introducing advanced memory management, agent interactions, social dynamics, and knowledge sharing capabilities. The implementation will transform the current breeding-focused simulation into a rich, social ecosystem where agents can form memories, build relationships, learn from each other, and create complex social dynamics.

**Key Features:**

- 🧠 **Advanced Memory System**: Episodic, semantic, procedural, and emotional memory types
- 🤝 **Agent Interactions**: Proximity-based communication, collaboration, and teaching
- 👥 **Social Dynamics**: Group formation, social networks, and influence systems
- 📚 **Knowledge Sharing**: Learning, teaching, and expertise transfer between agents
- 🎭 **Personality-Driven Behavior**: Trait-based interaction success and relationship building

## Current System Analysis

### Existing Components

- `AgentComponent`: Core identity (name, spirit, style, generation)
- `TraitComponent`: Comprehensive traits (personality, physical, abilities)
- `LifecycleComponent`: Agent aging and lifecycle progression
- `LineageComponent`: Family relationships and ancestry tracking
- `ReproductionComponent`: Breeding capabilities and preferences
- `PositionComponent`: Spatial positioning and movement

### Existing Systems

- Breeding System: Genetic compatibility and offspring creation
- Lifecycle System: Agent aging and maturity
- Movement System: Spatial positioning and navigation
- Time System: Accelerated world progression

## Proposed Architecture

### 1. New Components

#### MemoryComponent

```python
@dataclass
class Memory:
    """Individual memory entry."""
    id: str
    memory_type: MemoryType
    content: str
    importance: float  # 0.0 to 1.0
    emotional_weight: float  # -1.0 to 1.0
    associated_agents: List[str]
    created_at: datetime
    last_accessed: datetime
    access_count: int
    decay_rate: float

class MemoryComponent(Component):
    """Agent memory and experience storage."""
    def __init__(self):
        self.memories: Dict[str, Memory] = {}
        self.memory_capacity: int = 1000
        self.memory_decay_rate: float = 0.01
        self.importance_threshold: float = 0.5
        self.consolidation_threshold: float = 0.8
        self.retrieval_efficiency: float = 1.0
```

#### InteractionComponent

```python
@dataclass
class Interaction:
    """Record of agent interaction."""
    id: str
    participants: List[str]
    interaction_type: InteractionType
    content: str
    outcome: InteractionOutcome
    relationship_impact: float
    timestamp: datetime
    duration: float

class InteractionComponent(Component):
    """Agent interaction and communication capabilities."""
    def __init__(self):
        self.interaction_history: List[Interaction] = []
        self.communication_style: CommunicationStyle = CommunicationStyle.CASUAL
        self.social_energy: float = 1.0
        self.max_social_energy: float = 1.0
        self.energy_recovery_rate: float = 0.1
        self.relationship_map: Dict[str, Relationship] = {}
        self.active_interactions: Set[str] = set()
```

#### SocialComponent

```python
@dataclass
class Relationship:
    """Relationship between two agents."""
    agent_id: str
    relationship_type: RelationshipType
    strength: float  # 0.0 to 1.0
    trust_level: float  # 0.0 to 1.0
    familiarity: float  # 0.0 to 1.0
    last_interaction: datetime
    interaction_count: int

@dataclass
class SocialGroup:
    """Social group or community."""
    id: str
    name: str
    members: List[str]
    leader: Optional[str]
    purpose: str
    cohesion: float
    created_at: datetime

class SocialComponent(Component):
    """Social behavior and group dynamics."""
    def __init__(self):
        self.social_network: Dict[str, Relationship] = {}
        self.group_affiliations: List[str] = []
        self.social_status: SocialStatus = SocialStatus.NEUTRAL
        self.influence_level: float = 0.5
        self.charisma_bonus: float = 0.0
        self.leadership_traits: List[str] = []
        self.social_preferences: Dict[str, float] = {}
```

#### KnowledgeComponent

```python
@dataclass
class Knowledge:
    """Knowledge or skill possessed by an agent."""
    id: str
    knowledge_type: KnowledgeType
    subject: str
    proficiency: float  # 0.0 to 1.0
    confidence: float  # 0.0 to 1.0
    source: str  # How it was acquired
    acquired_at: datetime
    last_used: datetime
    usage_count: int

class KnowledgeComponent(Component):
    """Agent knowledge and learning capabilities."""
    def __init__(self):
        self.knowledge_base: Dict[str, Knowledge] = {}
        self.learning_rate: float = 0.1
        self.teaching_ability: float = 0.5
        self.expertise_areas: List[str] = []
        self.learning_preferences: Dict[str, float] = {}
        self.knowledge_sharing_willingness: float = 0.7
```

#### GenderComponent

```python
@dataclass
class GenderProfile:
    """Comprehensive gender identity profile for an agent."""
    primary_identity: GenderIdentity
    secondary_identities: List[GenderIdentity] = field(default_factory=list)
    pronouns: List[str] = field(default_factory=lambda: ["they", "them", "theirs"])
    custom_description: str = ""  # For self_describe option
    expression_preference: float = 0.5  # 0.0 = masculine, 1.0 = feminine, 0.5 = neutral
    assigned_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

class GenderComponent(Component):
    """Agent gender identity and expression capabilities."""
    def __init__(self, gender_profile: GenderProfile = None):
        if gender_profile is None:
            gender_profile = self._generate_random_gender_profile()

        self.gender_profile = gender_profile
        self.gender_fluidity: float = 0.0  # 0.0 = stable, 1.0 = highly fluid
        self.expression_confidence: float = 0.8
        self.social_gender_preferences: Dict[str, float] = {}
        self.gender_related_memories: List[str] = []  # Memory IDs related to gender identity

    def _generate_random_gender_profile(self) -> GenderProfile:
        """Generate a random gender profile for new agents."""
        import random

        # Weighted distribution favoring common identities while including diverse options
        gender_weights = {
            GenderIdentity.MALE: 0.25,
            GenderIdentity.FEMALE: 0.25,
            GenderIdentity.NON_BINARY: 0.15,
            GenderIdentity.GENDERFLUID: 0.08,
            GenderIdentity.AGENDER: 0.06,
            GenderIdentity.BIGENDER: 0.05,
            GenderIdentity.DEMIGENDER: 0.04,
            GenderIdentity.TRANSGENDER: 0.04,
            GenderIdentity.GENDERQUEER: 0.03,
            GenderIdentity.TWO_SPIRIT: 0.02,
            GenderIdentity.PREFER_NOT_TO_SAY: 0.02,
            GenderIdentity.SELF_DESCRIBE: 0.01
        }

        # Select primary identity based on weights
        primary_identity = random.choices(
            list(gender_weights.keys()),
            weights=list(gender_weights.values()),
            k=1
        )[0]

        # Generate appropriate pronouns based on identity
        pronouns = self._get_pronouns_for_identity(primary_identity)

        # Generate expression preference (can be independent of identity)
        expression_preference = random.uniform(0.0, 1.0)

        return GenderProfile(
            primary_identity=primary_identity,
            pronouns=pronouns,
            expression_preference=expression_preference
        )

    def _get_pronouns_for_identity(self, identity: GenderIdentity) -> List[str]:
        """Get appropriate pronouns for a gender identity."""
        pronoun_sets = {
            GenderIdentity.MALE: ["he", "him", "his"],
            GenderIdentity.FEMALE: ["she", "her", "hers"],
            GenderIdentity.NON_BINARY: ["they", "them", "theirs"],
            GenderIdentity.GENDERFLUID: ["they", "them", "theirs"],
            GenderIdentity.AGENDER: ["they", "them", "theirs"],
            GenderIdentity.BIGENDER: ["they", "them", "theirs"],
            GenderIdentity.DEMIGENDER: ["they", "them", "theirs"],
            GenderIdentity.TRANSGENDER: ["they", "them", "theirs"],  # Default, can be customized
            GenderIdentity.GENDERQUEER: ["they", "them", "theirs"],
            GenderIdentity.TWO_SPIRIT: ["they", "them", "theirs"],
            GenderIdentity.PREFER_NOT_TO_SAY: ["they", "them", "theirs"],
            GenderIdentity.SELF_DESCRIBE: ["they", "them", "theirs"]
        }
        return pronoun_sets.get(identity, ["they", "them", "theirs"])

    def update_gender_identity(self, new_identity: GenderIdentity, custom_description: str = "") -> None:
        """Update agent's gender identity (for genderfluid agents or identity exploration)."""
        self.gender_profile.primary_identity = new_identity
        self.gender_profile.pronouns = self._get_pronouns_for_identity(new_identity)
        self.gender_profile.custom_description = custom_description
        self.gender_profile.last_updated = datetime.now()

    def get_gender_expression(self) -> str:
        """Get current gender expression based on identity and preferences."""
        if self.gender_profile.expression_preference < 0.3:
            return "masculine"
        elif self.gender_profile.expression_preference > 0.7:
            return "feminine"
        else:
            return "androgynous"
```

### 2. New Systems

#### MemorySystem

```python
class MemorySystem(System):
    """Manages agent memories, storage, and retrieval."""

    def update(self, delta_time: float) -> None:
        """Process memory operations for all agents."""
        for entity in self.get_entities_with_components(MemoryComponent):
            memory_comp = entity.get_component(MemoryComponent)
            self._process_memory_decay(memory_comp, delta_time)
            self._consolidate_important_memories(memory_comp)
            self._cleanup_irrelevant_memories(memory_comp)

    def _process_memory_decay(self, memory_comp: MemoryComponent, delta_time: float) -> None:
        """Apply decay to memories based on importance and access patterns."""
        for memory in memory_comp.memories.values():
            # Calculate decay based on importance and access frequency
            decay_factor = memory.decay_rate * delta_time
            if memory.importance < memory_comp.importance_threshold:
                decay_factor *= 2.0  # Faster decay for unimportant memories

            memory.importance = max(0.0, memory.importance - decay_factor)

    def _consolidate_important_memories(self, memory_comp: MemoryComponent) -> None:
        """Consolidate highly important memories to prevent decay."""
        for memory in memory_comp.memories.values():
            if memory.importance >= memory_comp.consolidation_threshold:
                memory.decay_rate *= 0.5  # Slower decay for important memories

    def _cleanup_irrelevant_memories(self, memory_comp: MemoryComponent) -> None:
        """Remove memories that have decayed below threshold."""
        to_remove = [
            memory_id for memory_id, memory in memory_comp.memories.items()
            if memory.importance < 0.1
        ]
        for memory_id in to_remove:
            del memory_comp.memories[memory_id]
```

#### InteractionSystem

```python
class InteractionSystem(System):
    """Handles agent-to-agent interactions and communication."""

    def update(self, delta_time: float) -> None:
        """Process interactions between agents."""
        entities = self.get_entities_with_components(InteractionComponent, PositionComponent)

        # Find agents in proximity
        proximity_pairs = self._find_proximity_pairs(entities)

        # Process potential interactions
        for agent1, agent2 in proximity_pairs:
            self._evaluate_interaction_opportunity(agent1, agent2, delta_time)

        # Update social energy recovery
        self._update_social_energy_recovery(entities, delta_time)

    def _find_proximity_pairs(self, entities: List[Entity]) -> List[Tuple[Entity, Entity]]:
        """Find agent pairs within interaction range."""
        pairs = []
        for i, agent1 in enumerate(entities):
            for agent2 in entities[i+1:]:
                if self._are_in_proximity(agent1, agent2):
                    pairs.append((agent1, agent2))
        return pairs

    def _are_in_proximity(self, agent1: Entity, agent2: Entity) -> bool:
        """Check if two agents are within interaction range."""
        pos1 = agent1.get_component(PositionComponent)
        pos2 = agent2.get_component(PositionComponent)

        distance = math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
        return distance <= 50.0  # Interaction range

    def _evaluate_interaction_opportunity(self, agent1: Entity, agent2: Entity, delta_time: float) -> None:
        """Evaluate and potentially initiate interaction between agents."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        # Check if both agents have sufficient social energy
        if interaction_comp1.social_energy < 0.2 or interaction_comp2.social_energy < 0.2:
            return

        # Calculate interaction probability based on traits and relationship
        interaction_probability = self._calculate_interaction_probability(agent1, agent2)

        if random.random() < interaction_probability * delta_time:
            self._initiate_interaction(agent1, agent2)

    def _calculate_interaction_probability(self, agent1: Entity, agent2: Entity) -> float:
        """Calculate probability of interaction based on traits and relationship."""
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)
        interaction_comp1 = agent1.get_component(InteractionComponent)

        # Base probability from charisma and social traits
        base_prob = (traits1.personality_traits.get('charisma', 0.5) +
                    traits1.personality_traits.get('playfulness', 0.5)) / 2

        # Relationship modifier
        relationship = interaction_comp1.relationship_map.get(agent2.id)
        if relationship:
            base_prob *= (1.0 + relationship.strength)

        return min(1.0, base_prob * 0.1)  # Scale down for reasonable frequency
```

#### SocialSystem

```python
class SocialSystem(System):
    """Manages social dynamics and group behavior."""

    def update(self, delta_time: float) -> None:
        """Process social dynamics for all agents."""
        entities = self.get_entities_with_components(SocialComponent)

        # Update social networks
        self._update_social_networks(entities, delta_time)

        # Process group dynamics
        self._process_group_dynamics(entities, delta_time)

        # Calculate social influence
        self._calculate_social_influence(entities)

    def _update_social_networks(self, entities: List[Entity], delta_time: float) -> None:
        """Update social network connections and relationship strengths."""
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            interaction_comp = entity.get_component(InteractionComponent)

            # Update relationship strengths based on recent interactions
            for relationship in social_comp.social_network.values():
                time_since_interaction = datetime.now() - relationship.last_interaction
                if time_since_interaction.total_seconds() > 3600:  # 1 hour
                    # Decay relationship strength over time
                    relationship.strength *= 0.999
                    relationship.trust_level *= 0.999

    def _process_group_dynamics(self, entities: List[Entity], delta_time: float) -> None:
        """Process group formation, maintenance, and dissolution."""
        # Find potential group formations
        potential_groups = self._identify_potential_groups(entities)

        # Evaluate group cohesion and stability
        for group in potential_groups:
            self._evaluate_group_stability(group, entities)

    def _calculate_social_influence(self, entities: List[Entity]) -> None:
        """Calculate social influence levels for all agents."""
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            traits = entity.get_component(TraitComponent)

            # Base influence from leadership and charisma traits
            base_influence = (traits.personality_traits.get('leadership', 0.5) +
                            traits.personality_traits.get('charisma', 0.5)) / 2

            # Network size modifier
            network_size = len(social_comp.social_network)
            network_bonus = min(0.3, network_size * 0.01)

            social_comp.influence_level = min(1.0, base_influence + network_bonus)
```

#### LearningSystem

```python
class LearningSystem(System):
    """Handles knowledge acquisition and sharing between agents."""

    def update(self, delta_time: float) -> None:
        """Process learning opportunities and knowledge transfer."""
        entities = self.get_entities_with_components(KnowledgeComponent, InteractionComponent)

        # Find learning opportunities
        learning_opportunities = self._identify_learning_opportunities(entities)

        # Process knowledge transfer
        for opportunity in learning_opportunities:
            self._process_knowledge_transfer(opportunity, delta_time)

    def _identify_learning_opportunities(self, entities: List[Entity]) -> List[LearningOpportunity]:
        """Identify potential knowledge transfer opportunities."""
        opportunities = []

        for i, agent1 in enumerate(entities):
            for agent2 in entities[i+1:]:
                if self._can_learn_from(agent1, agent2):
                    opportunities.append(LearningOpportunity(agent1, agent2, "teaching"))
                if self._can_learn_from(agent2, agent1):
                    opportunities.append(LearningOpportunity(agent2, agent1, "teaching"))

        return opportunities

    def _can_learn_from(self, learner: Entity, teacher: Entity) -> bool:
        """Check if one agent can learn from another."""
        learner_knowledge = learner.get_component(KnowledgeComponent)
        teacher_knowledge = teacher.get_component(KnowledgeComponent)
        learner_interaction = learner.get_component(InteractionComponent)

        # Check if teacher has knowledge learner doesn't
        for knowledge_id, knowledge in teacher_knowledge.knowledge_base.items():
            if knowledge_id not in learner_knowledge.knowledge_base:
                # Check relationship and willingness to share
                relationship = learner_interaction.relationship_map.get(teacher.id)
                if relationship and relationship.trust_level > 0.3:
                    return True

        return False
```

#### GenderSystem

```python
class GenderSystem(System):
    """Manages gender identity, expression, and related social dynamics."""

    def update(self, delta_time: float) -> None:
        """Process gender-related behaviors and identity evolution."""
        entities = self.get_entities_with_components(GenderComponent)

        # Process gender fluidity for agents with high fluidity
        self._process_gender_fluidity(entities, delta_time)

        # Update gender expression confidence based on social interactions
        self._update_expression_confidence(entities, delta_time)

        # Process gender-related memory formation
        self._process_gender_memories(entities, delta_time)

    def _process_gender_fluidity(self, entities: List[Entity], delta_time: float) -> None:
        """Process gender identity changes for fluid agents."""
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)

            # Only process if agent has high gender fluidity
            if gender_comp.gender_fluidity > 0.7:
                # Random chance of identity shift based on fluidity level
                shift_probability = gender_comp.gender_fluidity * 0.001 * delta_time

                if random.random() < shift_probability:
                    self._shift_gender_identity(entity)

    def _shift_gender_identity(self, entity: Entity) -> None:
        """Shift gender identity for a fluid agent."""
        gender_comp = entity.get_component(GenderComponent)
        memory_comp = entity.get_component(MemoryComponent)

        # Get current identity and select a new one
        current_identity = gender_comp.gender_profile.primary_identity

        # For genderfluid agents, shift between common identities
        if current_identity == GenderIdentity.GENDERFLUID:
            new_identity = random.choice([
                GenderIdentity.MALE, GenderIdentity.FEMALE,
                GenderIdentity.NON_BINARY, GenderIdentity.AGENDER
            ])
        else:
            # For other fluid identities, shift to related identities
            related_identities = {
                GenderIdentity.MALE: [GenderIdentity.FEMALE, GenderIdentity.NON_BINARY],
                GenderIdentity.FEMALE: [GenderIdentity.MALE, GenderIdentity.NON_BINARY],
                GenderIdentity.NON_BINARY: [GenderIdentity.MALE, GenderIdentity.FEMALE, GenderIdentity.AGENDER],
                GenderIdentity.AGENDER: [GenderIdentity.NON_BINARY, GenderIdentity.GENDERFLUID]
            }

            new_identity = random.choice(related_identities.get(current_identity, [current_identity]))

        # Update identity
        old_identity = current_identity
        gender_comp.update_gender_identity(new_identity)

        # Create memory of identity shift
        if memory_comp:
            identity_memory = Memory(
                id=f"gender_shift_{uuid.uuid4().hex[:8]}",
                memory_type=MemoryType.EMOTIONAL,
                content=f"Gender identity shifted from {old_identity.value} to {new_identity.value}",
                importance=0.8,
                emotional_weight=0.3,
                associated_agents=[],
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                access_count=0,
                decay_rate=0.005  # Slower decay for important identity memories
            )
            memory_comp.memories[identity_memory.id] = identity_memory
            gender_comp.gender_related_memories.append(identity_memory.id)

    def _update_expression_confidence(self, entities: List[Entity], delta_time: float) -> None:
        """Update gender expression confidence based on social interactions."""
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            interaction_comp = entity.get_component(InteractionComponent)

            if not interaction_comp:
                continue

            # Calculate confidence based on recent positive interactions
            recent_interactions = [
                interaction for interaction in interaction_comp.interaction_history
                if (datetime.now() - interaction.timestamp).total_seconds() < 3600  # Last hour
                and interaction.outcome == InteractionOutcome.SUCCESS
            ]

            # Increase confidence with positive interactions
            confidence_boost = len(recent_interactions) * 0.01 * delta_time
            gender_comp.expression_confidence = min(1.0,
                gender_comp.expression_confidence + confidence_boost)

            # Gradual confidence decay over time
            gender_comp.expression_confidence = max(0.1,
                gender_comp.expression_confidence - 0.0001 * delta_time)

    def _process_gender_memories(self, entities: List[Entity], delta_time: float) -> None:
        """Process and categorize gender-related memories."""
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            memory_comp = entity.get_component(MemoryComponent)

            if not memory_comp:
                continue

            # Scan memories for gender-related content
            for memory in memory_comp.memories.values():
                if memory.id in gender_comp.gender_related_memories:
                    continue

                # Check if memory is gender-related
                gender_keywords = [
                    "gender", "identity", "pronouns", "expression",
                    "masculine", "feminine", "androgynous", "transition"
                ]

                if any(keyword in memory.content.lower() for keyword in gender_keywords):
                    gender_comp.gender_related_memories.append(memory.id)
                    memory.importance = max(memory.importance, 0.6)  # Boost importance
```

### 3. Enums and Data Types

```python
from enum import Enum

class GenderIdentity(Enum):
    """Comprehensive gender identity options for inclusive representation."""
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    GENDERFLUID = "genderfluid"
    AGENDER = "agender"
    BIGENDER = "bigender"
    DEMIGENDER = "demigender"
    TRANSGENDER = "transgender"
    GENDERQUEER = "genderqueer"
    TWO_SPIRIT = "two_spirit"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
    SELF_DESCRIBE = "self_describe"

class MemoryType(Enum):
    EPISODIC = "episodic"  # Specific events and experiences
    SEMANTIC = "semantic"  # Facts and knowledge
    PROCEDURAL = "procedural"  # Skills and abilities
    EMOTIONAL = "emotional"  # Feelings and associations
    SOCIAL = "social"  # Relationships and interactions

class InteractionType(Enum):
    COMMUNICATION = "communication"
    COLLABORATION = "collaboration"
    TEACHING = "teaching"
    SOCIAL = "social"
    COMPETITIVE = "competitive"
    ROMANTIC = "romantic"

class InteractionOutcome(Enum):
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    NEUTRAL = "neutral"

class CommunicationStyle(Enum):
    FORMAL = "formal"
    CASUAL = "casual"
    PLAYFUL = "playful"
    SERIOUS = "serious"
    MYSTERIOUS = "mysterious"

class RelationshipType(Enum):
    FRIEND = "friend"
    RIVAL = "rival"
    MENTOR = "mentor"
    STUDENT = "student"
    ROMANTIC = "romantic"
    NEUTRAL = "neutral"
    ENEMY = "enemy"

class SocialStatus(Enum):
    LEADER = "leader"
    POPULAR = "popular"
    NEUTRAL = "neutral"
    OUTCAST = "outcast"
    LONER = "loner"

class KnowledgeType(Enum):
    FACTUAL = "factual"
    PROCEDURAL = "procedural"
    CONCEPTUAL = "conceptual"
    EXPERIENTIAL = "experiential"
    SOCIAL = "social"

@dataclass
class LearningOpportunity:
    learner: Entity
    teacher: Entity
    opportunity_type: str
    knowledge_subject: str = ""
    success_probability: float = 0.5
```

### 4. Updated AgentWorld

```python
class AgentWorld(ECSWorld):
    """Enhanced agent world with memory, interaction, and social systems."""

    def __init__(self, data_dir: Path | None = None):
        super().__init__(data_dir)

        # Add new systems
        self.add_system(MemorySystem(self))
        self.add_system(InteractionSystem(self))
        self.add_system(SocialSystem(self))
        self.add_system(LearningSystem(self))
        self.add_system(GenderSystem(self))

    def create_agent(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
    ) -> Entity:
        """Create a new agent with all components."""
        entity = super().create_agent(agent_id, spirit, style, name)

        # Add new components
        entity.add_component(MemoryComponent())
        entity.add_component(InteractionComponent())
        entity.add_component(SocialComponent())
        entity.add_component(KnowledgeComponent())
        entity.add_component(GenderComponent())

        return entity

    # New methods for memory management
    def store_memory(self, agent_id: str, memory: Memory) -> bool:
        """Store a memory for an agent."""
        entity = self.get_entity(agent_id)
        if not entity:
            return False

        memory_comp = entity.get_component(MemoryComponent)
        if len(memory_comp.memories) >= memory_comp.memory_capacity:
            # Remove least important memory
            least_important = min(memory_comp.memories.values(), key=lambda m: m.importance)
            del memory_comp.memories[least_important.id]

        memory_comp.memories[memory.id] = memory
        return True

    def retrieve_memories(self, agent_id: str, query: str = "", memory_type: MemoryType = None) -> List[Memory]:
        """Retrieve memories for an agent based on query and type."""
        entity = self.get_entity(agent_id)
        if not entity:
            return []

        memory_comp = entity.get_component(MemoryComponent)
        memories = list(memory_comp.memories.values())

        # Filter by type if specified
        if memory_type:
            memories = [m for m in memories if m.memory_type == memory_type]

        # Filter by query if specified
        if query:
            memories = [m for m in memories if query.lower() in m.content.lower()]

        # Sort by importance and recency
        memories.sort(key=lambda m: (m.importance, m.last_accessed), reverse=True)
        return memories

    # New methods for interaction management
    def initiate_interaction(self, agent1_id: str, agent2_id: str, interaction_type: InteractionType) -> bool:
        """Initiate an interaction between two agents."""
        agent1 = self.get_entity(agent1_id)
        agent2 = self.get_entity(agent2_id)

        if not agent1 or not agent2:
            return False

        # Check proximity
        if not self._are_agents_in_proximity(agent1, agent2):
            return False

        # Check social energy
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if interaction_comp1.social_energy < 0.2 or interaction_comp2.social_energy < 0.2:
            return False

        # Create interaction
        interaction = Interaction(
            id=f"interaction_{uuid.uuid4().hex[:8]}",
            participants=[agent1_id, agent2_id],
            interaction_type=interaction_type,
            content="",
            outcome=InteractionOutcome.NEUTRAL,
            relationship_impact=0.0,
            timestamp=datetime.now(),
            duration=0.0
        )

        # Add to both agents' interaction history
        interaction_comp1.interaction_history.append(interaction)
        interaction_comp2.interaction_history.append(interaction)

        # Consume social energy
        interaction_comp1.social_energy -= 0.1
        interaction_comp2.social_energy -= 0.1

        return True

    # New methods for social management
    def get_social_network(self, agent_id: str) -> Dict[str, Relationship]:
        """Get the social network of an agent."""
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        social_comp = entity.get_component(SocialComponent)
        return social_comp.social_network.copy()

    def calculate_social_influence(self, agent_id: str) -> float:
        """Calculate the social influence of an agent."""
        entity = self.get_entity(agent_id)
        if not entity:
            return 0.0

        social_comp = entity.get_component(SocialComponent)
        return social_comp.influence_level

    # New methods for knowledge management
    def acquire_knowledge(self, agent_id: str, knowledge: Knowledge) -> bool:
        """Add knowledge to an agent's knowledge base."""
        entity = self.get_entity(agent_id)
        if not entity:
            return False

        knowledge_comp = entity.get_component(KnowledgeComponent)
        knowledge_comp.knowledge_base[knowledge.id] = knowledge
        return True

    def share_knowledge(self, teacher_id: str, student_id: str, knowledge_id: str) -> bool:
        """Share knowledge between agents."""
        teacher = self.get_entity(teacher_id)
        student = self.get_entity(student_id)

        if not teacher or not student:
            return False

        teacher_knowledge = teacher.get_component(KnowledgeComponent)
        student_knowledge = student.get_component(KnowledgeComponent)

        if knowledge_id not in teacher_knowledge.knowledge_base:
            return False

        # Check if student already has this knowledge
        if knowledge_id in student_knowledge.knowledge_base:
            return False

        # Check relationship and willingness to share
        teacher_interaction = teacher.get_component(InteractionComponent)
        relationship = teacher_interaction.relationship_map.get(student_id)

        if not relationship or relationship.trust_level < 0.3:
            return False

        # Transfer knowledge with reduced proficiency
        original_knowledge = teacher_knowledge.knowledge_base[knowledge_id]
        shared_knowledge = Knowledge(
            id=f"{knowledge_id}_shared_{uuid.uuid4().hex[:8]}",
            knowledge_type=original_knowledge.knowledge_type,
            subject=original_knowledge.subject,
            proficiency=original_knowledge.proficiency * 0.7,  # Reduced proficiency
            confidence=0.5,  # Lower confidence for shared knowledge
            source=f"shared_from_{teacher_id}",
            acquired_at=datetime.now(),
            last_used=datetime.now(),
            usage_count=0
        )

        student_knowledge.knowledge_base[shared_knowledge.id] = shared_knowledge
        return True

    # New methods for gender management
    def get_gender_profile(self, agent_id: str) -> GenderProfile:
        """Get the gender profile of an agent."""
        entity = self.get_entity(agent_id)
        if not entity:
            return None

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return None

        return gender_comp.gender_profile

    def update_gender_identity(self, agent_id: str, new_identity: GenderIdentity, custom_description: str = "") -> bool:
        """Update an agent's gender identity."""
        entity = self.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        gender_comp.update_gender_identity(new_identity, custom_description)
        return True

    def set_gender_fluidity(self, agent_id: str, fluidity_level: float) -> bool:
        """Set the gender fluidity level for an agent (0.0 = stable, 1.0 = highly fluid)."""
        entity = self.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        gender_comp.gender_fluidity = max(0.0, min(1.0, fluidity_level))
        return True

    def get_agents_by_gender_identity(self, identity: GenderIdentity) -> List[str]:
        """Get all agents with a specific gender identity."""
        matching_agents = []

        for entity in self.get_all_entities():
            gender_comp = entity.get_component(GenderComponent)
            if gender_comp and gender_comp.gender_profile.primary_identity == identity:
                matching_agents.append(entity.id)

        return matching_agents

    def get_gender_diversity_stats(self) -> Dict[str, int]:
        """Get statistics on gender diversity in the agent population."""
        stats = {}

        for identity in GenderIdentity:
            stats[identity.value] = len(self.get_agents_by_gender_identity(identity))

        return stats
```

### 5. MCP Tool Extensions

#### Memory Management Tools

```python
@register_tool(
    name="store_memory",
    category="ecs",
    description="Store a new memory for an agent",
    execution_type="async",
    enabled=True
)
async def store_memory(**kwargs) -> dict[str, Any]:
    """Store a memory for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    memory_type = arguments.get("memory_type", "episodic")
    content = arguments.get("content", "")
    importance = arguments.get("importance", 0.5)
    emotional_weight = arguments.get("emotional_weight", 0.0)

    try:
        memory = Memory(
            id=f"memory_{uuid.uuid4().hex[:8]}",
            memory_type=MemoryType(memory_type),
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=[],
            created_at=datetime.now(),
            last_accessed=datetime.now(),
            access_count=0,
            decay_rate=0.01
        )

        result = await ecs_client.store_memory(agent_id, memory)

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Memory stored successfully for agent {agent_id}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to store memory for agent {agent_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error storing memory: {e}"
            }]
        }

@register_tool(
    name="retrieve_memories",
    category="ecs",
    description="Retrieve memories for an agent",
    execution_type="async",
    enabled=True
)
async def retrieve_memories(**kwargs) -> dict[str, Any]:
    """Retrieve memories for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    query = arguments.get("query", "")
    memory_type = arguments.get("memory_type")
    limit = arguments.get("limit", 10)

    try:
        memories = await ecs_client.retrieve_memories(agent_id, query, memory_type)
        memories = memories[:limit]  # Limit results

        memory_list = []
        for memory in memories:
            memory_list.append({
                "id": memory.id,
                "type": memory.memory_type.value,
                "content": memory.content,
                "importance": memory.importance,
                "emotional_weight": memory.emotional_weight,
                "created_at": memory.created_at.isoformat(),
                "access_count": memory.access_count
            })

        return {
            "content": [{
                "type": "text",
                "text": f"📚 Retrieved {len(memory_list)} memories for agent {agent_id}:\n\n" +
                       json.dumps(memory_list, indent=2)
            }]
        }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error retrieving memories: {e}"
            }]
        }
```

#### Interaction Management Tools

```python
@register_tool(
    name="initiate_interaction",
    category="ecs",
    description="Initiate an interaction between two agents",
    execution_type="async",
    enabled=True
)
async def initiate_interaction(**kwargs) -> dict[str, Any]:
    """Initiate an interaction between two agents."""
    arguments = kwargs.get("arguments", {})
    agent1_id = arguments.get("agent1_id")
    agent2_id = arguments.get("agent2_id")
    interaction_type = arguments.get("interaction_type", "communication")

    try:
        result = await ecs_client.initiate_interaction(
            agent1_id, agent2_id, InteractionType(interaction_type)
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Interaction initiated between {agent1_id} and {agent2_id}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to initiate interaction between {agent1_id} and {agent2_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error initiating interaction: {e}"
            }]
        }

@register_tool(
    name="get_relationship_status",
    category="ecs",
    description="Get relationship status between two agents",
    execution_type="async",
    enabled=True
)
async def get_relationship_status(**kwargs) -> dict[str, Any]:
    """Get relationship status between two agents."""
    arguments = kwargs.get("arguments", {})
    agent1_id = arguments.get("agent1_id")
    agent2_id = arguments.get("agent2_id")

    try:
        social_network = await ecs_client.get_social_network(agent1_id)
        relationship = social_network.get(agent2_id)

        if relationship:
            return {
                "content": [{
                    "type": "text",
                    "text": f"🤝 Relationship between {agent1_id} and {agent2_id}:\n" +
                           f"Type: {relationship.relationship_type.value}\n" +
                           f"Strength: {relationship.strength:.2f}\n" +
                           f"Trust: {relationship.trust_level:.2f}\n" +
                           f"Familiarity: {relationship.familiarity:.2f}\n" +
                           f"Interactions: {relationship.interaction_count}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❓ No relationship found between {agent1_id} and {agent2_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting relationship status: {e}"
            }]
        }
```

#### Knowledge Management Tools

```python
@register_tool(
    name="acquire_knowledge",
    category="ecs",
    description="Add knowledge to an agent's knowledge base",
    execution_type="async",
    enabled=True
)
async def acquire_knowledge(**kwargs) -> dict[str, Any]:
    """Add knowledge to an agent's knowledge base."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    knowledge_type = arguments.get("knowledge_type", "factual")
    subject = arguments.get("subject", "")
    proficiency = arguments.get("proficiency", 0.5)
    confidence = arguments.get("confidence", 0.5)

    try:
        knowledge = Knowledge(
            id=f"knowledge_{uuid.uuid4().hex[:8]}",
            knowledge_type=KnowledgeType(knowledge_type),
            subject=subject,
            proficiency=proficiency,
            confidence=confidence,
            source="direct_acquisition",
            acquired_at=datetime.now(),
            last_used=datetime.now(),
            usage_count=0
        )

        result = await ecs_client.acquire_knowledge(agent_id, knowledge)

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Knowledge acquired successfully by agent {agent_id}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to acquire knowledge for agent {agent_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error acquiring knowledge: {e}"
            }]
        }

@register_tool(
    name="share_knowledge",
    category="ecs",
    description="Share knowledge between agents",
    execution_type="async",
    enabled=True
)
async def share_knowledge(**kwargs) -> dict[str, Any]:
    """Share knowledge between agents."""
    arguments = kwargs.get("arguments", {})
    teacher_id = arguments.get("teacher_id")
    student_id = arguments.get("student_id")
    knowledge_id = arguments.get("knowledge_id")

    try:
        result = await ecs_client.share_knowledge(teacher_id, student_id, knowledge_id)

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Knowledge shared successfully from {teacher_id} to {student_id}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to share knowledge from {teacher_id} to {student_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error sharing knowledge: {e}"
            }]
        }
```

#### Gender Management Tools

```python
@register_tool(
    name="get_gender_profile",
    category="ecs",
    description="Get the gender profile of an agent",
    execution_type="async",
    enabled=True
)
async def get_gender_profile(**kwargs) -> dict[str, Any]:
    """Get the gender profile of an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")

    try:
        gender_profile = await ecs_client.get_gender_profile(agent_id)

        if gender_profile:
            return {
                "content": [{
                    "type": "text",
                    "text": f"👤 Gender Profile for {agent_id}:\n" +
                           f"Primary Identity: {gender_profile.primary_identity.value}\n" +
                           f"Pronouns: {'/'.join(gender_profile.pronouns)}\n" +
                           f"Expression: {gender_profile.expression_preference:.2f}\n" +
                           f"Custom Description: {gender_profile.custom_description or 'None'}\n" +
                           f"Assigned: {gender_profile.assigned_at.isoformat()}\n" +
                           f"Last Updated: {gender_profile.last_updated.isoformat()}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ No gender profile found for agent {agent_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting gender profile: {e}"
            }]
        }

@register_tool(
    name="update_gender_identity",
    category="ecs",
    description="Update an agent's gender identity",
    execution_type="async",
    enabled=True
)
async def update_gender_identity(**kwargs) -> dict[str, Any]:
    """Update an agent's gender identity."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")
    new_identity = arguments.get("new_identity")
    custom_description = arguments.get("custom_description", "")

    try:
        result = await ecs_client.update_gender_identity(
            agent_id, GenderIdentity(new_identity), custom_description
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Gender identity updated for agent {agent_id} to {new_identity}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to update gender identity for agent {agent_id}"
                }]
            }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error updating gender identity: {e}"
            }]
        }

@register_tool(
    name="get_gender_diversity_stats",
    category="ecs",
    description="Get statistics on gender diversity in the agent population",
    execution_type="async",
    enabled=True
)
async def get_gender_diversity_stats(**kwargs) -> dict[str, Any]:
    """Get statistics on gender diversity in the agent population."""
    try:
        stats = await ecs_client.get_gender_diversity_stats()

        stats_text = "📊 Gender Diversity Statistics:\n\n"
        for identity, count in stats.items():
            stats_text += f"{identity.replace('_', ' ').title()}: {count}\n"

        total_agents = sum(stats.values())
        stats_text += f"\nTotal Agents: {total_agents}"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting gender diversity stats: {e}"
            }]
        }
```

### 6. Implementation Timeline

#### Phase 1: Core Memory System (Week 1-2)

- [ ] Implement `MemoryComponent` and `Memory` dataclass
- [ ] Create `MemorySystem` with decay and consolidation
- [ ] Add memory management methods to `AgentWorld`
- [ ] Create MCP tools for memory storage and retrieval
- [ ] Test with existing agents

#### Phase 2: Interaction Framework (Week 3-4)

- [ ] Implement `InteractionComponent` and `Interaction` dataclass
- [ ] Create `InteractionSystem` with proximity detection
- [ ] Add interaction management methods to `AgentWorld`
- [ ] Create MCP tools for interaction management
- [ ] Test agent-to-agent interactions

#### Phase 3: Social Dynamics (Week 5-6)

- [ ] Implement `SocialComponent` and relationship system
- [ ] Create `SocialSystem` with network management
- [ ] Add social influence calculations
- [ ] Create MCP tools for social management
- [ ] Test social network formation

#### Phase 4: Knowledge System (Week 7-8)

- [ ] Implement `KnowledgeComponent` and `Knowledge` dataclass
- [ ] Create `LearningSystem` with knowledge transfer
- [ ] Add knowledge management methods to `AgentWorld`
- [ ] Create MCP tools for knowledge management
- [ ] Test knowledge sharing between agents

#### Phase 5: Gender Identity System (Week 9-10)

- [ ] Implement `GenderComponent` and `GenderProfile` dataclass
- [ ] Create `GenderSystem` with identity evolution and fluidity
- [ ] Add gender management methods to `AgentWorld`
- [ ] Create MCP tools for gender management
- [ ] Test gender identity assignment and evolution
- [ ] Implement random gender assignment for new agents

#### Phase 6: Integration & Testing (Week 11-12)

- [ ] Integrate all systems with existing ECS world
- [ ] Create comprehensive test suite
- [ ] Performance optimization
- [ ] Documentation and examples
- [ ] Deploy and monitor

### 7. Migration Strategy

Since this proposal eliminates backwards compatibility, the migration will be:

1. **Complete Replacement**: All existing agent entities will be migrated to include new components
2. **Data Migration**: Existing agent data will be preserved and enhanced with new capabilities
3. **API Updates**: All MCP tools will be updated to use new system
4. **Documentation**: Complete rewrite of ECS documentation

### 8. Performance Considerations

- **Memory Management**: Efficient memory storage with automatic cleanup
- **Interaction Processing**: Spatial indexing for proximity detection
- **Social Networks**: Optimized relationship storage and updates
- **Knowledge Transfer**: Cached knowledge lookups and sharing

### 9. Testing Strategy

- **Unit Tests**: Individual component and system testing
- **Integration Tests**: Full system interaction testing
- **Performance Tests**: Load testing with many agents
- **Behavioral Tests**: Agent interaction and learning validation

### 10. Gender Assignment Strategies

#### Random Gender Assignment

When creating new agents without using `agent_startup_sequence` or when creating specific characters, the system implements intelligent gender assignment:

**Weighted Distribution**: The system uses a weighted distribution that reflects real-world diversity while ensuring representation:

- Male: 25% (common identity)
- Female: 25% (common identity)
- Non-binary: 15% (increasingly common)
- Genderfluid: 8% (moderate representation)
- Agender: 6% (moderate representation)
- Bigender: 5% (moderate representation)
- Demigender: 4% (moderate representation)
- Transgender: 4% (moderate representation)
- Genderqueer: 3% (moderate representation)
- Two-spirit: 2% (cultural representation)
- Prefer not to say: 2% (privacy respect)
- Self-describe: 1% (custom identity)

**Agent-Driven Assignment**: For specific character creation, agents can:

- Choose their own gender identity during creation
- Update their identity over time (especially for genderfluid agents)
- Provide custom descriptions for self-describe identities
- Set their own pronouns and expression preferences

#### Inclusive Design Principles

**Pronoun Flexibility**: Each gender identity comes with appropriate default pronouns, but agents can customize:

- Male: he/him/his (default)
- Female: she/her/hers (default)
- Non-binary and others: they/them/theirs (default)
- Custom pronouns supported for all identities

**Expression Independence**: Gender expression is independent of identity:

- Masculine expression (0.0-0.3)
- Androgynous expression (0.3-0.7)
- Feminine expression (0.7-1.0)

**Fluidity Support**: Agents can have varying levels of gender fluidity:

- Stable (0.0-0.3): Identity rarely changes
- Moderate (0.3-0.7): Occasional identity shifts
- High (0.7-1.0): Frequent identity exploration

### 11. Success Metrics

- **Memory Accuracy**: Agents remember important events correctly
- **Interaction Quality**: Meaningful agent-to-agent interactions
- **Social Cohesion**: Formation of stable social groups
- **Knowledge Transfer**: Effective learning between agents
- **Gender Diversity**: Balanced representation across gender identities
- **Identity Evolution**: Natural gender identity development over time
- **System Performance**: Maintains performance with 100+ agents

## Conclusion

This implementation proposal transforms the Reynard ECS World from a simple breeding simulation into a rich, social ecosystem where agents can form memories, build relationships, learn from each other, create complex social dynamics, and explore diverse gender identities. The system is designed for scalability, performance, and extensibility while maintaining the core ECS architecture principles.

**Key Innovations:**

- **Advanced Memory System**: Episodic, semantic, procedural, and emotional memory types with intelligent decay and consolidation
- **Rich Social Dynamics**: Proximity-based interactions, relationship building, and social influence systems
- **Knowledge Sharing**: Learning and teaching capabilities that enable knowledge transfer between agents
- **Inclusive Gender Identity**: Comprehensive gender representation with 12 identity options, pronoun flexibility, and support for gender fluidity
- **Agent Autonomy**: Agents can choose their own gender identity, update it over time, and express themselves authentically

**Gender Identity Excellence:**

The gender identity system represents a significant advancement in inclusive AI agent design, featuring:

- Weighted random assignment that reflects real-world diversity
- Support for genderfluid agents with identity evolution over time
- Comprehensive pronoun and expression customization
- Respect for privacy with "prefer not to say" options
- Cultural representation including Two-spirit identity
- Custom self-description capabilities for unique identities

The elimination of backwards compatibility allows for a clean, modern implementation that takes full advantage of the new capabilities without legacy constraints. This will result in a more maintainable, performant, and feature-rich system that can support complex agent behaviors, authentic social interactions, and diverse gender expression while promoting inclusivity and respect for all identities.
