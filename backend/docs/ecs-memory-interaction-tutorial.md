# ECS Memory & Interaction System Tutorial

_Step-by-step guide to using the ECS Memory & Interaction System in the Reynard framework_

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Memory Management](#basic-memory-management)
3. [Social Interactions](#social-interactions)
4. [Advanced Features](#advanced-features)
5. [Integration Examples](#integration-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Python 3.8+
- Reynard ECS framework
- Basic understanding of ECS (Entity-Component-System) architecture

### Installation

The ECS Memory & Interaction System is part of the Reynard backend. Ensure you have the latest version installed:

```bash
cd /path/to/reynard/backend
pip install -e .
```

### Basic Setup

```python
from backend.app.ecs.components import MemoryComponent, InteractionComponent
from backend.app.ecs.components.memory import MemoryType
from backend.app.ecs.components.interaction import InteractionType

# Create components
memory = MemoryComponent(memory_capacity=1000)
interaction = InteractionComponent(max_relationships=50, max_interactions=500)
```

## Basic Memory Management

### Creating Your First Memory

```python
# Store an episodic memory
memory_id = memory.store_memory(
    memory_type=MemoryType.EPISODIC,
    content="I met a friendly agent named Alice at the coffee shop today",
    importance=0.8,
    emotional_weight=0.6,
    associated_agents=["alice-agent-123"]
)

print(f"Memory stored with ID: {memory_id}")
```

### Retrieving Memories

```python
# Retrieve a specific memory
retrieved_memory = memory.retrieve_memory(memory_id)
if retrieved_memory:
    print(f"Memory content: {retrieved_memory.content}")
    print(f"Importance: {retrieved_memory.importance}")
    print(f"Emotional weight: {retrieved_memory.emotional_weight}")
    print(f"Access count: {retrieved_memory.access_count}")
```

### Searching Memories

```python
# Search for memories by type
episodic_memories = memory.search_memories(
    memory_type=MemoryType.EPISODIC,
    limit=10
)

# Search for memories by importance
important_memories = memory.search_memories(
    min_importance=0.7,
    limit=5
)

# Search for memories by content
coffee_memories = memory.search_memories(
    query="coffee",
    limit=5
)

# Search for memories with specific agents
alice_memories = memory.search_memories(
    associated_agent="alice-agent-123",
    limit=10
)
```

### Memory Statistics

```python
# Get comprehensive memory statistics
stats = memory.get_memory_stats()

print(f"Total memories: {stats['total_memories']}")
print(f"Memory types: {stats['memory_types']}")
print(f"Average importance: {stats['average_importance']:.2f}")
print(f"Consolidated memories: {stats['consolidated_memories']}")
print(f"Capacity usage: {stats['capacity_usage']:.1%}")
```

## Social Interactions

### Initiating Interactions

```python
# Check if agent can interact
if interaction.can_interact():
    # Start a communication interaction
    comm_interaction = interaction.initiate_interaction(
        target_agent_id="bob-agent-456",
        interaction_type=InteractionType.COMMUNICATION,
        content="Hello Bob! How are you doing today?",
        duration=30.0
    )

    if comm_interaction:
        print(f"Interaction started: {comm_interaction.id}")
        print(f"Energy cost: {comm_interaction.energy_cost}")
    else:
        print("Failed to start interaction")
else:
    print("Insufficient social energy to interact")
```

### Different Interaction Types

```python
# Collaboration interaction
collab_interaction = interaction.initiate_interaction(
    target_agent_id="charlie-agent-789",
    interaction_type=InteractionType.COLLABORATION,
    content="Let's work together on the new project",
    duration=120.0
)

# Teaching interaction
teaching_interaction = interaction.initiate_interaction(
    target_agent_id="david-agent-101",
    interaction_type=InteractionType.TEACHING,
    content="I'll show you how to use the new API",
    duration=60.0
)

# Social interaction
social_interaction = interaction.initiate_interaction(
    target_agent_id="eve-agent-202",
    interaction_type=InteractionType.SOCIAL,
    content="Want to grab lunch together?",
    duration=45.0
)
```

### Managing Relationships

```python
# Get relationship with specific agent
relationship = interaction.get_relationship("bob-agent-456")
if relationship:
    print(f"Relationship type: {relationship.relationship_type}")
    print(f"Strength: {relationship.strength:.2f}")
    print(f"Trust level: {relationship.trust_level:.2f}")
    print(f"Familiarity: {relationship.familiarity:.2f}")
    print(f"Interaction count: {relationship.interaction_count}")
    print(f"Total time together: {relationship.total_time_together:.1f} seconds")

    # Check relationship quality
    if relationship.is_positive_relationship():
        print("This is a positive relationship")
    if relationship.is_close_relationship():
        print("This is a close relationship")
```

### Social Energy Management

```python
# Check current energy status
energy_status = interaction.get_social_energy_status()
print(f"Current energy: {energy_status['current_energy']:.2f}")
print(f"Max energy: {energy_status['max_energy']:.2f}")
print(f"Energy percentage: {energy_status['energy_percentage']:.1%}")

# Recover energy over time
interaction.recover_social_energy(2.0)  # 2 hours of recovery
print(f"Energy after recovery: {interaction.social_energy:.2f}")
```

## Advanced Features

### Memory Consolidation

```python
# Apply memory decay and consolidation over time
memory.consolidate_memories(24.0)  # 24 hours of time passage

# Check for forgotten memories
for memory_obj in memory.memories.values():
    if memory_obj.is_forgotten():
        print(f"Memory {memory_obj.id} has been forgotten")
    elif memory_obj.is_consolidated():
        print(f"Memory {memory_obj.id} is consolidated")
```

### Communication Styles

```python
from backend.app.ecs.components.interaction import CommunicationStyle

# Update communication style
interaction.update_communication_style(CommunicationStyle.FORMAL)
interaction.update_communication_effectiveness(0.9)
interaction.update_social_confidence(0.8)

# Check current settings
stats = interaction.get_interaction_stats()
print(f"Communication style: {stats['communication_style']}")
```

### Memory Importance Management

```python
# Update memory importance based on new information
memory.update_memory_importance(memory_id, 0.9)

# Forget a specific memory
memory.forgotten = memory.forget_memory(memory_id)
if memory.forgotten:
    print("Memory successfully forgotten")
```

### Relationship Analysis

```python
# Get all relationships
all_relationships = interaction.get_all_relationships()
print(f"Total relationships: {len(all_relationships)}")

# Get positive relationships
positive_relationships = interaction.get_positive_relationships()
print(f"Positive relationships: {len(positive_relationships)}")

# Get close relationships
close_relationships = interaction.get_close_relationships()
print(f"Close relationships: {len(close_relationships)}")

# Get relationship statistics
rel_stats = interaction.get_relationship_stats()
print(f"Average relationship strength: {rel_stats['average_strength']:.2f}")
print(f"Average trust level: {rel_stats['average_trust']:.2f}")
```

## Integration Examples

### Complete Agent Lifecycle

```python
from backend.app.ecs.world.agent_world import AgentWorld

# Create agent world
world = AgentWorld()

# Create agents
agent1 = world.create_agent("agent-1", "fox", "foundation", "Alice")
agent2 = world.create_agent("agent-2", "wolf", "foundation", "Bob")

# Get components
memory1 = agent1.get_component(MemoryComponent)
interaction1 = agent1.get_component(InteractionComponent)

# Store initial memory
memory1.store_memory(
    memory_type=MemoryType.EPISODIC,
    content="I was created in the ECS world",
    importance=0.9,
    emotional_weight=0.5
)

# Initiate interaction with another agent
interaction1.initiate_interaction(
    target_agent_id="agent-2",
    interaction_type=InteractionType.COMMUNICATION,
    content="Hello Bob! Nice to meet you!",
    duration=30.0
)

# Store memory about the interaction
memory1.store_memory(
    memory_type=MemoryType.SOCIAL,
    content="Met Bob for the first time - seems friendly",
    importance=0.7,
    emotional_weight=0.4,
    associated_agents=["agent-2"]
)

# Update world simulation
world.update(1.0)  # 1 hour of simulation time
```

### Memory-Interaction Feedback Loop

```python
def process_interaction_with_memory(agent, target_agent_id, interaction_type, content):
    """Process an interaction and create corresponding memories."""

    memory = agent.get_component(MemoryComponent)
    interaction = agent.get_component(InteractionComponent)

    # Initiate interaction
    new_interaction = interaction.initiate_interaction(
        target_agent_id=target_agent_id,
        interaction_type=interaction_type,
        content=content,
        duration=60.0
    )

    if new_interaction:
        # Create memory based on interaction
        memory_content = f"Had {interaction_type.value} with {target_agent_id}: {content}"

        # Determine importance based on interaction type
        importance = 0.5
        if interaction_type == InteractionType.TEACHING:
            importance = 0.8
        elif interaction_type == InteractionType.COLLABORATION:
            importance = 0.7
        elif interaction_type == InteractionType.ROMANTIC:
            importance = 0.9

        # Store memory
        memory_id = memory.store_memory(
            memory_type=MemoryType.SOCIAL,
            content=memory_content,
            importance=importance,
            emotional_weight=0.3,
            associated_agents=[target_agent_id]
        )

        return new_interaction, memory_id

    return None, None

# Use the function
interaction, memory_id = process_interaction_with_memory(
    agent1, "agent-2", InteractionType.TEACHING, "Explained how to use the API"
)
```

### Social Network Analysis

```python
def analyze_social_network(agent):
    """Analyze an agent's social network."""

    interaction = agent.get_component(InteractionComponent)
    memory = agent.get_component(MemoryComponent)

    # Get relationship statistics
    rel_stats = interaction.get_relationship_stats()
    interaction_stats = interaction.get_interaction_stats()
    memory_stats = memory.get_memory_stats()

    print("=== Social Network Analysis ===")
    print(f"Total relationships: {rel_stats['total_relationships']}")
    print(f"Positive relationships: {rel_stats['positive_relationships']}")
    print(f"Close relationships: {rel_stats['close_relationships']}")
    print(f"Average relationship strength: {rel_stats['average_strength']:.2f}")
    print(f"Total interactions: {interaction_stats['total_interactions']}")
    print(f"Success rate: {interaction_stats['success_rate']:.1%}")
    print(f"Social memories: {memory_stats['memory_types'].get('social', 0)}")

    # Analyze relationship types
    print("\n=== Relationship Types ===")
    for rel_type, count in rel_stats['relationship_types'].items():
        print(f"{rel_type}: {count}")

    # Analyze interaction types
    print("\n=== Interaction Types ===")
    for int_type, count in interaction_stats['interaction_types'].items():
        print(f"{int_type}: {count}")

# Analyze agent's social network
analyze_social_network(agent1)
```

## Best Practices

### Memory Management

1. **Set Appropriate Capacity**: Choose memory capacity based on agent needs
2. **Regular Consolidation**: Call `consolidate_memories()` regularly
3. **Importance Levels**: Set meaningful importance levels for different memory types
4. **Memory Cleanup**: Monitor capacity usage and implement cleanup strategies

```python
# Best practice: Regular memory maintenance
def maintain_memories(agent, time_elapsed):
    """Maintain agent memories with regular consolidation."""

    memory = agent.get_component(MemoryComponent)

    # Consolidate memories
    memory.consolidate_memories(time_elapsed)

    # Check capacity usage
    stats = memory.get_memory_stats()
    if stats['capacity_usage'] > 0.9:
        print("Warning: Memory capacity nearly full")
        # Implement cleanup strategy
        cleanup_old_memories(memory)

def cleanup_old_memories(memory, target_usage=0.8):
    """Clean up old, low-importance memories."""

    # Get memories sorted by importance
    all_memories = list(memory.memories.values())
    all_memories.sort(key=lambda m: m.importance)

    # Remove lowest importance memories until target usage is reached
    target_count = int(memory.memory_capacity * target_usage)
    while len(memory.memories) > target_count and all_memories:
        memory_to_remove = all_memories.pop(0)
        memory.forget_memory(memory_to_remove.id)
```

### Interaction Management

1. **Energy Monitoring**: Always check energy before interactions
2. **Relationship Maintenance**: Regularly update relationships
3. **Interaction Variety**: Use different interaction types for rich social dynamics
4. **Error Handling**: Handle interaction failures gracefully

```python
# Best practice: Safe interaction management
def safe_interaction(agent, target_agent_id, interaction_type, content):
    """Safely initiate an interaction with proper error handling."""

    interaction = agent.get_component(InteractionComponent)

    # Check energy
    if not interaction.can_interact():
        print("Cannot interact - insufficient energy")
        return None

    # Check relationship capacity
    if len(interaction.relationships) >= interaction.max_relationships:
        print("Cannot interact - relationship capacity full")
        return None

    # Initiate interaction
    result = interaction.initiate_interaction(
        target_agent_id=target_agent_id,
        interaction_type=interaction_type,
        content=content,
        duration=30.0
    )

    if result:
        print(f"Interaction successful: {result.id}")
        return result
    else:
        print("Interaction failed")
        return None
```

### Performance Optimization

1. **Batch Operations**: Process multiple memories/interactions efficiently
2. **Lazy Loading**: Load memories only when needed
3. **Caching**: Cache frequently accessed data
4. **Indexing**: Use appropriate search filters

```python
# Best practice: Efficient batch processing
def batch_memory_operations(agent, memories_data):
    """Efficiently process multiple memory operations."""

    memory = agent.get_component(MemoryComponent)
    memory_ids = []

    # Batch store memories
    for memory_data in memories_data:
        memory_id = memory.store_memory(**memory_data)
        memory_ids.append(memory_id)

    # Batch consolidate
    memory.consolidate_memories(1.0)

    return memory_ids

def efficient_memory_search(memory, search_criteria):
    """Efficiently search memories with proper filtering."""

    # Use specific filters to reduce search space
    if 'memory_type' in search_criteria:
        return memory.search_memories(
            memory_type=search_criteria['memory_type'],
            limit=search_criteria.get('limit', 10)
        )
    elif 'min_importance' in search_criteria:
        return memory.search_memories(
            min_importance=search_criteria['min_importance'],
            limit=search_criteria.get('limit', 10)
        )
    else:
        return memory.search_memories(limit=search_criteria.get('limit', 10))
```

## Troubleshooting

### Common Issues

#### 1. Memory Capacity Exceeded

**Problem**: Memory capacity is full, new memories can't be stored.

**Solution**:

```python
# Check capacity usage
stats = memory.get_memory_stats()
if stats['capacity_usage'] > 0.95:
    # Consolidate memories to remove forgotten ones
    memory.consolidate_memories(24.0)

    # If still full, increase capacity or implement cleanup
    if stats['capacity_usage'] > 0.95:
        memory.memory_capacity = int(memory.memory_capacity * 1.5)
```

#### 2. Insufficient Social Energy

**Problem**: Agent can't initiate interactions due to low energy.

**Solution**:

```python
# Check energy status
if not interaction.can_interact():
    # Wait for energy recovery
    interaction.recover_social_energy(1.0)  # 1 hour recovery

    # Or reduce energy drain rate
    interaction.energy_drain_rate = 0.1  # Reduce from default 0.2
```

#### 3. Relationship Capacity Full

**Problem**: Can't form new relationships due to capacity limits.

**Solution**:

```python
# Check relationship capacity
if len(interaction.relationships) >= interaction.max_relationships:
    # Remove weakest relationships
    relationships = list(interaction.relationships.items())
    relationships.sort(key=lambda x: x[1].get_relationship_quality())

    # Remove lowest quality relationship
    if relationships:
        weakest_agent_id = relationships[0][0]
        del interaction.relationships[weakest_agent_id]
```

#### 4. Memory Not Found

**Problem**: Trying to retrieve a memory that doesn't exist.

**Solution**:

```python
# Always check for None return
memory = memory_component.retrieve_memory(memory_id)
if memory is None:
    print(f"Memory {memory_id} not found")
    # Handle gracefully - maybe search for similar memories
    similar_memories = memory_component.search_memories(
        query="similar content",
        limit=5
    )
```

### Debugging Tips

1. **Enable Logging**: Use detailed logging to track memory and interaction operations
2. **Monitor Statistics**: Regularly check component statistics for anomalies
3. **Test Edge Cases**: Test with extreme values and edge cases
4. **Performance Profiling**: Monitor performance with large numbers of memories/interactions

```python
# Debug helper function
def debug_agent_state(agent):
    """Debug helper to print agent state."""

    memory = agent.get_component(MemoryComponent)
    interaction = agent.get_component(InteractionComponent)

    print("=== Agent Debug State ===")
    print(f"Agent ID: {agent.id}")

    # Memory state
    memory_stats = memory.get_memory_stats()
    print(f"Memories: {memory_stats['total_memories']}/{memory.memory_capacity}")
    print(f"Memory types: {memory_stats['memory_types']}")

    # Interaction state
    interaction_stats = interaction.get_interaction_stats()
    print(f"Interactions: {interaction_stats['total_interactions']}")
    print(f"Relationships: {interaction_stats['total_relationships']}")
    print(f"Social energy: {interaction_stats['social_energy']:.2f}")

    # Recent activity
    recent_memories = memory.search_memories(limit=3)
    print(f"Recent memories: {len(recent_memories)}")

    recent_interactions = interaction.get_recent_interactions(3)
    print(f"Recent interactions: {len(recent_interactions)}")

# Use debug helper
debug_agent_state(agent1)
```

This comprehensive tutorial provides everything needed to effectively use the ECS Memory & Interaction System, from basic operations to advanced features and troubleshooting.
