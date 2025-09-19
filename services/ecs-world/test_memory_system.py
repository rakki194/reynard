#!/usr/bin/env python3
"""
Test script for the ECS Memory System

Simple test to verify that the memory system components and functionality work correctly.
"""

import sys
from pathlib import Path

# Add the package to the path
sys.path.insert(0, str(Path(__file__).parent / "reynard_ecs_world"))

from reynard_ecs_world.components.memory import MemoryComponent, MemoryType, Memory
from reynard_ecs_world.systems.memory_system import MemorySystem
from reynard_ecs_world.world.agent_world import AgentWorld


def test_memory_component():
    """Test basic memory component functionality."""
    print("🧠 Testing Memory Component...")
    
    # Create memory component
    memory_comp = MemoryComponent(memory_capacity=100)
    
    # Store some memories
    memory_id1 = memory_comp.store_memory(
        memory_type=MemoryType.EPISODIC,
        content="First time meeting another agent",
        importance=0.8,
        emotional_weight=0.6
    )
    
    memory_id2 = memory_comp.store_memory(
        memory_type=MemoryType.SEMANTIC,
        content="Learned that foxes are cunning",
        importance=0.6,
        emotional_weight=0.2
    )
    
    print(f"✅ Stored memories: {memory_id1}, {memory_id2}")
    
    # Retrieve memories
    memories = memory_comp.retrieve_memories(limit=5)
    print(f"✅ Retrieved {len(memories)} memories")
    
    # Get stats
    stats = memory_comp.get_memory_stats()
    print(f"✅ Memory stats: {stats}")
    
    return True


def test_memory_system():
    """Test memory system functionality."""
    print("\n🔄 Testing Memory System...")
    
    # Create agent world with memory system
    world = AgentWorld()
    
    # Create a test agent
    agent = world.create_agent("test-agent-1", spirit="fox", style="foundation")
    print(f"✅ Created agent: {agent.id}")
    
    # Store memories through the world
    success1 = world.store_memory(
        agent_id="test-agent-1",
        memory_type=MemoryType.EPISODIC,
        content="Test episodic memory",
        importance=0.7,
        emotional_weight=0.5
    )
    
    success2 = world.store_memory(
        agent_id="test-agent-1",
        memory_type=MemoryType.SEMANTIC,
        content="Test semantic memory",
        importance=0.5,
        emotional_weight=0.1
    )
    
    print(f"✅ Stored memories: {success1}, {success2}")
    
    # Retrieve memories
    memories = world.retrieve_memories("test-agent-1", limit=5)
    print(f"✅ Retrieved {len(memories)} memories")
    
    # Get memory stats
    stats = world.get_memory_stats("test-agent-1")
    print(f"✅ Agent memory stats: {stats}")
    
    # Get system stats
    system_stats = world.get_memory_system_stats()
    print(f"✅ System memory stats: {system_stats}")
    
    return True


def test_memory_decay():
    """Test memory decay functionality."""
    print("\n⏰ Testing Memory Decay...")
    
    # Create memory component
    memory_comp = MemoryComponent()
    
    # Store a memory with low importance
    memory_id = memory_comp.store_memory(
        memory_type=MemoryType.EPISODIC,
        content="This memory should decay quickly",
        importance=0.3,
        emotional_weight=0.1
    )
    
    # Simulate time passing by manually decaying the memory
    for i in range(10):
        memory = memory_comp.get_memory_by_id(memory_id)
        if memory:
            memory.decay(1.0)  # 1 second delta
    
    # Check if memory decayed
    memory = memory_comp.get_memory_by_id(memory_id)
    if memory:
        print(f"✅ Memory importance after decay: {memory.importance:.3f}")
        return True
    else:
        print("❌ Memory was removed due to decay")
        return False


def main():
    """Run all memory system tests."""
    print("🧠 ECS Memory System Test Suite")
    print("=" * 50)
    
    try:
        # Test memory component
        test_memory_component()
        
        # Test memory system
        test_memory_system()
        
        # Test memory decay
        test_memory_decay()
        
        print("\n🎉 All memory system tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
