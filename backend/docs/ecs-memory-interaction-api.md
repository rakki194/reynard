# ECS Memory & Interaction System API Documentation

_Comprehensive API reference for the ECS Memory & Interaction System in the Reynard framework_

## Overview

The ECS Memory & Interaction System provides advanced agent capabilities including episodic memory, social interactions, relationship management, and knowledge sharing. This system transforms agents from simple entities into complex social beings with rich internal lives and dynamic relationships.

## Core Components

### MemoryComponent

The `MemoryComponent` manages agent memory and experience storage with intelligent decay and consolidation.

#### Constructor

```python
MemoryComponent(memory_capacity: int = 1000)
```

**Parameters:**

- `memory_capacity` (int): Maximum number of memories to store (default: 1000)

#### Key Attributes

- `memories` (Dict[str, Memory]): Dictionary of stored memories
- `memory_capacity` (int): Maximum memory capacity
- `memory_decay_rate` (float): Rate of memory decay over time (default: 0.01)
- `importance_threshold` (float): Minimum importance for memory retention (default: 0.5)
- `consolidation_threshold` (float): Threshold for memory consolidation (default: 0.8)
- `retrieval_efficiency` (float): Memory retrieval efficiency (default: 1.0)
- `total_memories_formed` (int): Total memories created
- `total_memories_forgotten` (int): Total memories forgotten

#### Methods

##### `store_memory(memory_type, content, importance=0.5, emotional_weight=0.0, associated_agents=None)`

Store a new memory for the agent.

**Parameters:**

- `memory_type` (MemoryType): Type of memory (EPISODIC, SEMANTIC, PROCEDURAL, EMOTIONAL, SOCIAL)
- `content` (str): Memory content
- `importance` (float): Importance level (0.0 to 1.0)
- `emotional_weight` (float): Emotional significance (-1.0 to 1.0)
- `associated_agents` (List[str]): List of agent IDs associated with this memory

**Returns:**

- `str`: Memory ID

**Example:**

```python
memory_id = memory_component.store_memory(
    memory_type=MemoryType.EPISODIC,
    content="Met a friendly agent at the coffee shop",
    importance=0.8,
    emotional_weight=0.6,
    associated_agents=["agent-123"]
)
```

##### `retrieve_memory(memory_id)`

Retrieve a specific memory by ID.

**Parameters:**

- `memory_id` (str): ID of memory to retrieve

**Returns:**

- `Memory | None`: Memory object or None if not found

##### `search_memories(query="", memory_type=None, min_importance=0.0, max_importance=1.0, associated_agent=None, limit=10)`

Search memories based on various criteria.

**Parameters:**

- `query` (str): Text query to search for in memory content
- `memory_type` (MemoryType): Filter by memory type
- `min_importance` (float): Minimum importance threshold
- `max_importance` (float): Maximum importance threshold
- `associated_agent` (str): Filter by associated agent
- `limit` (int): Maximum number of results

**Returns:**

- `List[Memory]`: List of matching memories

##### `get_memory_stats()`

Get comprehensive memory statistics.

**Returns:**

- `Dict[str, Any]`: Memory statistics including:
  - `total_memories`: Number of stored memories
  - `memory_types`: Distribution by memory type
  - `average_importance`: Average importance of memories
  - `consolidated_memories`: Number of consolidated memories
  - `forgotten_memories`: Number of forgotten memories
  - `total_formed`: Total memories created
  - `total_forgotten`: Total memories forgotten
  - `memory_capacity`: Maximum capacity
  - `capacity_usage`: Current capacity usage percentage

##### `consolidate_memories(delta_time)`

Apply memory decay and consolidation over time.

**Parameters:**

- `delta_time` (float): Time elapsed since last consolidation

### InteractionComponent

The `InteractionComponent` manages agent interactions, relationships, and social energy.

#### Constructor

```python
InteractionComponent(max_relationships: int = 100, max_interactions: int = 1000)
```

**Parameters:**

- `max_relationships` (int): Maximum number of relationships to track (default: 100)
- `max_interactions` (int): Maximum number of interactions to store (default: 1000)

#### Key Attributes

- `relationships` (Dict[str, Relationship]): Dictionary of agent relationships
- `interactions` (List[Interaction]): List of interaction history
- `max_relationships` (int): Maximum relationship capacity
- `max_interactions` (int): Maximum interaction capacity
- `social_energy` (float): Current social energy (0.0 to 1.0)
- `max_social_energy` (float): Maximum social energy (default: 1.0)
- `energy_recovery_rate` (float): Energy recovery rate per hour (default: 0.1)
- `energy_drain_rate` (float): Energy consumed per interaction (default: 0.2)
- `preferred_communication_style` (CommunicationStyle): Preferred communication style
- `communication_effectiveness` (float): Communication effectiveness (default: 1.0)
- `social_confidence` (float): Social confidence level (default: 0.5)
- `total_interactions` (int): Total interactions initiated
- `successful_interactions` (int): Number of successful interactions
- `failed_interactions` (int): Number of failed interactions
- `total_social_time` (float): Total time spent in social interactions

#### Methods

##### `initiate_interaction(target_agent_id, interaction_type, content, duration=0.0)`

Initiate an interaction with another agent.

**Parameters:**

- `target_agent_id` (str): ID of agent to interact with
- `interaction_type` (InteractionType): Type of interaction
- `content` (str): Interaction content
- `duration` (float): Interaction duration in seconds

**Returns:**

- `Interaction | None`: Interaction object if successful, None if insufficient energy

**Example:**

```python
interaction = interaction_component.initiate_interaction(
    target_agent_id="agent-456",
    interaction_type=InteractionType.COMMUNICATION,
    content="Hello! How are you today?",
    duration=30.0
)
```

##### `get_relationship(agent_id)`

Get relationship with a specific agent.

**Parameters:**

- `agent_id` (str): ID of agent to get relationship with

**Returns:**

- `Relationship | None`: Relationship object or None if no relationship exists

##### `get_all_relationships()`

Get all relationships.

**Returns:**

- `Dict[str, Relationship]`: Copy of all relationships

##### `get_positive_relationships()`

Get all positive relationships.

**Returns:**

- `Dict[str, Relationship]`: Relationships with positive quality

##### `get_close_relationships()`

Get all close relationships.

**Returns:**

- `Dict[str, Relationship]`: Relationships with high familiarity and strength

##### `get_relationship_stats()`

Get comprehensive relationship statistics.

**Returns:**

- `Dict[str, Any]`: Relationship statistics including:
  - `total_relationships`: Number of relationships
  - `relationship_types`: Distribution by relationship type
  - `average_strength`: Average relationship strength
  - `average_trust`: Average trust level
  - `average_familiarity`: Average familiarity level
  - `positive_relationships`: Number of positive relationships
  - `close_relationships`: Number of close relationships

##### `get_interaction_stats()`

Get comprehensive interaction statistics.

**Returns:**

- `Dict[str, Any]`: Interaction statistics including:
  - `total_interactions`: Total interactions
  - `interaction_types`: Distribution by interaction type
  - `interaction_outcomes`: Distribution by outcome
  - `average_duration`: Average interaction duration
  - `total_social_time`: Total time spent in interactions
  - `success_rate`: Success rate percentage
  - `successful_interactions`: Number of successful interactions
  - `failed_interactions`: Number of failed interactions
  - `social_energy`: Current social energy
  - `max_social_energy`: Maximum social energy
  - `energy_percentage`: Energy percentage
  - `active_interactions`: Number of active interactions
  - `total_relationships`: Number of relationships
  - `positive_relationships`: Number of positive relationships
  - `negative_relationships`: Number of negative relationships
  - `communication_style`: Current communication style

##### `recover_social_energy(delta_time)`

Recover social energy over time.

**Parameters:**

- `delta_time` (float): Time elapsed in hours

##### `can_interact()`

Check if the agent has enough social energy to interact.

**Returns:**

- `bool`: True if agent can interact

##### `get_social_energy_status()`

Get social energy status.

**Returns:**

- `Dict[str, float]`: Energy status including:
  - `current_energy`: Current energy level
  - `max_energy`: Maximum energy level
  - `energy_percentage`: Energy percentage
  - `energy_recovery_rate`: Recovery rate
  - `energy_drain_rate`: Drain rate

##### `update_communication_style(style)`

Update preferred communication style.

**Parameters:**

- `style` (CommunicationStyle): New communication style

##### `update_communication_effectiveness(effectiveness)`

Update communication effectiveness.

**Parameters:**

- `effectiveness` (float): New effectiveness value (0.0 to 1.0)

##### `update_social_confidence(confidence)`

Update social confidence.

**Parameters:**

- `confidence` (float): New confidence value (0.0 to 1.0)

## Data Structures

### Memory

Individual memory entry with comprehensive metadata.

#### Attributes

- `id` (str): Unique memory identifier
- `memory_type` (MemoryType): Type of memory
- `content` (str): Memory content
- `importance` (float): Importance level (0.0 to 1.0)
- `emotional_weight` (float): Emotional significance (-1.0 to 1.0)
- `associated_agents` (List[str]): Associated agent IDs
- `created_at` (datetime): Creation timestamp
- `last_accessed` (datetime): Last access timestamp
- `access_count` (int): Number of times accessed
- `decay_rate` (float): Memory decay rate

#### Methods

- `access()`: Record memory access and update metadata
- `decay(delta_time)`: Apply decay to memory importance over time
- `is_consolidated(threshold=0.8)`: Check if memory is consolidated
- `is_forgotten(threshold=0.1)`: Check if memory has decayed below recall threshold

### Interaction

Record of an interaction between agents.

#### Attributes

- `id` (str): Unique interaction identifier
- `participants` (List[str]): List of participating agent IDs
- `interaction_type` (InteractionType): Type of interaction
- `content` (str): Interaction content
- `outcome` (InteractionOutcome): Interaction outcome
- `relationship_impact` (float): Impact on relationship (-1.0 to 1.0)
- `timestamp` (datetime): Interaction timestamp
- `duration` (float): Interaction duration in seconds
- `energy_cost` (float): Social energy consumed
- `success_factors` (Dict[str, float]): Factors that influenced success

### Relationship

Relationship between two agents.

#### Attributes

- `agent_id` (str): ID of the other agent
- `relationship_type` (str): Type of relationship
- `strength` (float): Relationship strength (0.0 to 1.0)
- `trust_level` (float): Trust level (0.0 to 1.0)
- `familiarity` (float): Familiarity level (0.0 to 1.0)
- `last_interaction` (datetime): Last interaction timestamp
- `interaction_count` (int): Total number of interactions
- `positive_interactions` (int): Number of positive interactions
- `negative_interactions` (int): Number of negative interactions
- `total_time_together` (float): Total time spent interacting

#### Methods

- `update_from_interaction(interaction)`: Update relationship based on interaction
- `get_relationship_quality()`: Calculate overall relationship quality
- `is_positive_relationship()`: Check if this is a positive relationship
- `is_close_relationship()`: Check if this is a close relationship

## Enums

### MemoryType

Types of memories that agents can form.

- `EPISODIC`: Specific events and experiences
- `SEMANTIC`: Facts and knowledge
- `PROCEDURAL`: Skills and abilities
- `EMOTIONAL`: Feelings and associations
- `SOCIAL`: Relationships and interactions

### InteractionType

Types of interactions between agents.

- `COMMUNICATION`: Verbal or written communication
- `COLLABORATION`: Working together on tasks
- `TEACHING`: Knowledge transfer and learning
- `SOCIAL`: Casual social interaction
- `COMPETITIVE`: Competitive activities
- `ROMANTIC`: Romantic or intimate interactions

### InteractionOutcome

Possible outcomes of interactions.

- `SUCCESS`: Interaction was successful
- `PARTIAL_SUCCESS`: Interaction was partially successful
- `FAILURE`: Interaction failed
- `NEUTRAL`: Interaction had neutral outcome

### CommunicationStyle

Communication styles for agents.

- `FORMAL`: Formal, professional communication
- `CASUAL`: Casual, relaxed communication
- `PLAYFUL`: Playful, humorous communication
- `SERIOUS`: Serious, focused communication
- `MYSTERIOUS`: Mysterious, enigmatic communication

## Usage Examples

### Basic Memory Management

```python
from backend.app.ecs.components import MemoryComponent, MemoryType

# Create memory component
memory = MemoryComponent(memory_capacity=500)

# Store a memory
memory_id = memory.store_memory(
    memory_type=MemoryType.EPISODIC,
    content="Had a great conversation with Agent-123 about AI ethics",
    importance=0.9,
    emotional_weight=0.7,
    associated_agents=["agent-123"]
)

# Retrieve the memory
retrieved_memory = memory.retrieve_memory(memory_id)
print(f"Memory: {retrieved_memory.content}")

# Search for memories
episodic_memories = memory.search_memories(
    memory_type=MemoryType.EPISODIC,
    min_importance=0.5,
    limit=5
)

# Get memory statistics
stats = memory.get_memory_stats()
print(f"Total memories: {stats['total_memories']}")
print(f"Average importance: {stats['average_importance']:.2f}")
```

### Social Interactions

```python
from backend.app.ecs.components import InteractionComponent, InteractionType

# Create interaction component
interaction = InteractionComponent()

# Check if agent can interact
if interaction.can_interact():
    # Initiate an interaction
    new_interaction = interaction.initiate_interaction(
        target_agent_id="agent-456",
        interaction_type=InteractionType.COMMUNICATION,
        content="Hello! I'd like to discuss the new project proposal.",
        duration=45.0
    )

    if new_interaction:
        print(f"Interaction started: {new_interaction.content}")
    else:
        print("Failed to start interaction - insufficient energy")

# Get relationship with specific agent
relationship = interaction.get_relationship("agent-456")
if relationship:
    print(f"Relationship strength: {relationship.strength:.2f}")
    print(f"Trust level: {relationship.trust_level:.2f}")
    print(f"Familiarity: {relationship.familiarity:.2f}")

# Get interaction statistics
stats = interaction.get_interaction_stats()
print(f"Total interactions: {stats['total_interactions']}")
print(f"Success rate: {stats['success_rate']:.1%}")
print(f"Social energy: {stats['social_energy']:.2f}")
```

### Memory and Interaction Integration

```python
from backend.app.ecs.components import MemoryComponent, InteractionComponent
from backend.app.ecs.components.memory import MemoryType
from backend.app.ecs.components.interaction import InteractionType

# Create both components
memory = MemoryComponent()
interaction = InteractionComponent()

# Store a memory about an interaction
interaction_memory_id = memory.store_memory(
    memory_type=MemoryType.SOCIAL,
    content="Had a productive collaboration session with Agent-789",
    importance=0.8,
    emotional_weight=0.5,
    associated_agents=["agent-789"]
)

# Initiate the actual interaction
collaboration = interaction.initiate_interaction(
    target_agent_id="agent-789",
    interaction_type=InteractionType.COLLABORATION,
    content="Let's work together on the new feature implementation",
    duration=120.0
)

# Update memory based on interaction outcome
if collaboration and collaboration.outcome == InteractionOutcome.SUCCESS:
    memory.update_memory_importance(interaction_memory_id, 0.9)
    print("Interaction was successful - memory importance increased")
```

## Performance Considerations

### Memory Management

- **Capacity Limits**: Set appropriate memory capacity based on agent needs
- **Decay Rates**: Adjust decay rates to balance memory retention and forgetting
- **Consolidation**: Regular consolidation prevents memory overflow
- **Search Optimization**: Use specific filters to improve search performance

### Interaction Management

- **Energy Management**: Monitor social energy to prevent interaction failures
- **Relationship Limits**: Set appropriate relationship capacity limits
- **Interaction History**: Limit interaction history to prevent memory bloat
- **Batch Processing**: Process multiple interactions efficiently

### Best Practices

1. **Regular Cleanup**: Call `consolidate_memories()` regularly to clean up forgotten memories
2. **Energy Monitoring**: Check `can_interact()` before initiating interactions
3. **Relationship Maintenance**: Regularly update relationships based on interactions
4. **Memory Importance**: Set appropriate importance levels for different memory types
5. **Error Handling**: Always check for None returns from interaction methods

## Error Handling

### Common Issues

1. **Insufficient Energy**: Check `can_interact()` before initiating interactions
2. **Memory Overflow**: Monitor memory capacity and implement cleanup strategies
3. **Relationship Limits**: Handle relationship capacity limits gracefully
4. **Invalid Parameters**: Validate input parameters before method calls

### Error Recovery

```python
# Safe interaction initiation
if interaction.can_interact():
    result = interaction.initiate_interaction(...)
    if result is None:
        print("Interaction failed - insufficient energy")
        # Wait for energy recovery or reduce energy cost
else:
    print("Cannot interact - need to recover energy")
    # Implement energy recovery strategy
```

## Integration with ECS World

The Memory and Interaction components integrate seamlessly with the ECS World system:

```python
from backend.app.ecs.world.agent_world import AgentWorld

# Create agent world
world = AgentWorld()

# Create agent with memory and interaction components
agent = world.create_agent("agent-1", "fox", "foundation", "TestAgent")

# Access components
memory = agent.get_component(MemoryComponent)
interaction = agent.get_component(InteractionComponent)

# Use components
memory.store_memory(MemoryType.EPISODIC, "Created in the world", 0.5)
interaction.initiate_interaction("agent-2", InteractionType.SOCIAL, "Hello!")
```

This comprehensive API documentation provides everything needed to effectively use the ECS Memory & Interaction System in the Reynard framework.
