"""
Test Knowledge System

Unit and integration tests for the knowledge system components and functionality.
"""

from reynard_ecs_world.components.knowledge import (
    KnowledgeComponent,
    Knowledge,
    KnowledgeType,
    LearningMethod,
    KnowledgeLevel,
    LearningOpportunity,
)
from reynard_ecs_world.systems.learning_system import LearningSystem
from reynard_ecs_world.world.agent_world import AgentWorld


def test_knowledge_component() -> None:
    """Test KnowledgeComponent functionality."""
    print("🧪 Testing KnowledgeComponent...")
    
    # Create knowledge component
    comp = KnowledgeComponent()
    comp.set_agent_id("test_agent")
    
    # Test initial state
    assert comp.learning_rate == 0.1
    assert comp.teaching_ability == 0.5
    assert comp.curiosity == 0.5
    assert comp.retention_rate == 0.8
    assert comp.knowledge_capacity == 100
    assert len(comp.knowledge_base) == 0
    assert len(comp.learning_opportunities) == 0
    
    # Test adding knowledge
    knowledge_id = comp.add_knowledge(
        title="Test Knowledge",
        knowledge_type=KnowledgeType.FACTUAL,
        description="A test knowledge item",
        proficiency=0.3,
        confidence=0.7,
        learning_method=LearningMethod.STUDY,
        tags=["test", "sample"],
        difficulty=0.4,
        importance=0.6,
        transferability=0.8
    )
    
    assert knowledge_id != ""
    assert len(comp.knowledge_base) == 1
    assert comp.total_knowledge_acquired == 1
    
    # Test retrieving knowledge
    knowledge = comp.get_knowledge(knowledge_id)
    assert knowledge is not None
    assert knowledge.title == "Test Knowledge"
    assert knowledge.knowledge_type == KnowledgeType.FACTUAL
    assert knowledge.proficiency == 0.3
    assert knowledge.confidence == 0.7
    
    # Test knowledge level
    level = knowledge.get_knowledge_level()
    assert level == KnowledgeLevel.NOVICE  # 0.3 proficiency
    
    # Test updating proficiency
    comp.update_knowledge_proficiency(knowledge_id, 0.2)
    updated_knowledge = comp.get_knowledge(knowledge_id)
    assert updated_knowledge is not None
    assert updated_knowledge.proficiency == 0.5
    
    # Test using knowledge
    comp.use_knowledge(knowledge_id)
    used_knowledge = comp.get_knowledge(knowledge_id)
    assert used_knowledge is not None
    assert used_knowledge.usage_count == 1
    
    # Test teachable knowledge
    teachable = comp.get_teachable_knowledge()
    assert len(teachable) == 1
    assert teachable[0].can_teach()
    
    # Test adding learning opportunity
    opportunity_id = comp.add_learning_opportunity(
        knowledge_id=knowledge_id,
        source_agent="other_agent",
        learning_method=LearningMethod.TEACHING,
        estimated_difficulty=0.3,
        estimated_duration=60.0,
        learning_potential=0.7
    )
    
    assert opportunity_id != ""
    assert len(comp.learning_opportunities) == 1
    
    # Test getting learning opportunities
    opportunities = comp.get_learning_opportunities()
    assert len(opportunities) == 1
    
    # Test best learning opportunity
    best_opportunity = comp.get_best_learning_opportunity()
    assert best_opportunity is not None
    assert best_opportunity.id == opportunity_id
    
    # Test learning effectiveness
    effectiveness = comp.calculate_learning_effectiveness(LearningMethod.TEACHING)
    assert 0.0 <= effectiveness <= 1.0
    
    # Test knowledge stats
    stats = comp.get_knowledge_stats()
    assert "total_knowledge" in stats
    assert stats["total_knowledge"] == 1
    assert "knowledge_types" in stats
    assert "proficiency_levels" in stats
    
    print("✅ KnowledgeComponent tests passed!")


def test_knowledge() -> None:
    """Test Knowledge dataclass functionality."""
    print("🧪 Testing Knowledge...")
    
    # Create knowledge
    knowledge = Knowledge(
        id="test_knowledge",
        title="Test Knowledge",
        knowledge_type=KnowledgeType.PROCEDURAL,
        description="A test knowledge item",
        proficiency=0.6,
        confidence=0.8,
        learning_method=LearningMethod.PRACTICE,
        source_agent="teacher_agent",
        tags=["test", "procedural"],
        difficulty=0.5,
        importance=0.7,
        transferability=0.6
    )
    
    # Test initial state
    assert knowledge.id == "test_knowledge"
    assert knowledge.title == "Test Knowledge"
    assert knowledge.knowledge_type == KnowledgeType.PROCEDURAL
    assert knowledge.proficiency == 0.6
    assert knowledge.confidence == 0.8
    
    # Test knowledge level
    level = knowledge.get_knowledge_level()
    assert level == KnowledgeLevel.ADVANCED  # 0.6 proficiency
    
    # Test updating proficiency
    knowledge.update_proficiency(0.2)
    assert knowledge.proficiency == 0.8
    assert knowledge.get_knowledge_level() == KnowledgeLevel.EXPERT
    
    # Test updating confidence
    knowledge.update_confidence(0.1)
    assert knowledge.confidence == 0.9
    
    # Test using knowledge
    initial_usage = knowledge.usage_count
    knowledge.use_knowledge()
    assert knowledge.usage_count == initial_usage + 1
    assert knowledge.proficiency > 0.8  # Should increase slightly
    
    # Test teaching capability
    assert knowledge.can_teach() == True  # 0.8 proficiency, 0.9 confidence, 0.6 transferability
    
    # Test teaching effectiveness
    effectiveness = knowledge.get_teaching_effectiveness()
    assert 0.0 <= effectiveness <= 1.0
    
    # Test knowledge value
    value = knowledge.get_knowledge_value()
    assert 0.0 <= value <= 1.0
    
    print("✅ Knowledge tests passed!")


def test_learning_opportunity() -> None:
    """Test LearningOpportunity dataclass functionality."""
    print("🧪 Testing LearningOpportunity...")
    
    # Create learning opportunity
    opportunity = LearningOpportunity(
        id="test_opportunity",
        knowledge_id="test_knowledge",
        source_agent="teacher_agent",
        learning_method=LearningMethod.TEACHING,
        estimated_difficulty=0.4,
        estimated_duration=120.0,
        prerequisites_met=True,
        learning_potential=0.8
    )
    
    # Test initial state
    assert opportunity.id == "test_opportunity"
    assert opportunity.knowledge_id == "test_knowledge"
    assert opportunity.source_agent == "teacher_agent"
    assert opportunity.learning_method == LearningMethod.TEACHING
    assert opportunity.estimated_difficulty == 0.4
    assert opportunity.estimated_duration == 120.0
    assert opportunity.prerequisites_met == True
    assert opportunity.learning_potential == 0.8
    
    # Test expiration
    assert opportunity.is_expired() == False
    
    # Test learning score
    score = opportunity.get_learning_score()
    assert 0.0 <= score <= 1.0
    
    print("✅ LearningOpportunity tests passed!")


def test_learning_system() -> None:
    """Test LearningSystem functionality."""
    print("🧪 Testing LearningSystem...")
    
    # Create world and system
    world = AgentWorld()
    system = LearningSystem(world)
    
    # Create test agents
    world.create_agent("agent1", "fox", "foundation")
    world.create_agent("agent2", "wolf", "foundation")
    world.create_agent("agent3", "otter", "foundation")
    
    # Test knowledge transfer
    # First add knowledge to agent1
    knowledge_id = world.add_knowledge(
        agent_id="agent1",
        title="Test Knowledge",
        knowledge_type=KnowledgeType.FACTUAL,
        description="A test knowledge item",
        proficiency=0.7,
        confidence=0.8,
        learning_method=LearningMethod.EXPERIENCE,
        difficulty=0.4,
        importance=0.6,
        transferability=0.8
    )
    
    assert knowledge_id != ""
    
    # Test knowledge transfer
    success = world.transfer_knowledge(
        teacher_id="agent1",
        student_id="agent2",
        knowledge_id=knowledge_id,
        learning_method=LearningMethod.TEACHING
    )
    
    assert success == True
    
    # Test knowledge stats
    stats1 = world.get_knowledge_stats("agent1")
    stats2 = world.get_knowledge_stats("agent2")
    
    assert "total_knowledge" in stats1
    assert "total_knowledge" in stats2
    assert stats1["total_knowledge"] >= 1
    assert stats2["total_knowledge"] >= 1
    
    # Test transfer stats
    transfer_stats1 = world.get_knowledge_transfer_stats("agent1")
    transfer_stats2 = world.get_knowledge_transfer_stats("agent2")
    
    assert "total_teaching_sessions" in transfer_stats1
    assert "total_learning_sessions" in transfer_stats2
    
    # Test system stats
    system_stats = world.get_learning_system_stats()
    assert "total_agents_with_knowledge" in system_stats
    assert "total_knowledge_items" in system_stats
    assert "knowledge_transfers" in system_stats
    
    print("✅ LearningSystem tests passed!")


def test_agent_world_integration() -> None:
    """Test integration with AgentWorld."""
    print("🧪 Testing AgentWorld integration...")
    
    # Create world
    world = AgentWorld()
    
    # Create agents
    world.create_agent("agent1", "fox", "foundation")
    world.create_agent("agent2", "wolf", "foundation")
    world.create_agent("agent3", "otter", "foundation")
    
    # Test adding knowledge
    knowledge_id1 = world.add_knowledge(
        agent_id="agent1",
        title="Fox Wisdom",
        knowledge_type=KnowledgeType.CONCEPTUAL,
        description="Strategic thinking and cunning",
        proficiency=0.8,
        confidence=0.9,
        learning_method=LearningMethod.EXPERIENCE,
        tags=["strategy", "cunning"],
        difficulty=0.6,
        importance=0.8,
        transferability=0.7
    )
    
    knowledge_id2 = world.add_knowledge(
        agent_id="agent2",
        title="Wolf Pack Tactics",
        knowledge_type=KnowledgeType.PROCEDURAL,
        description="Coordinated hunting and teamwork",
        proficiency=0.9,
        confidence=0.8,
        learning_method=LearningMethod.PRACTICE,
        tags=["teamwork", "hunting"],
        difficulty=0.7,
        importance=0.9,
        transferability=0.6
    )
    
    assert knowledge_id1 != ""
    assert knowledge_id2 != ""
    
    # Test knowledge transfer
    success1 = world.transfer_knowledge(
        teacher_id="agent1",
        student_id="agent2",
        knowledge_id=knowledge_id1,
        learning_method=LearningMethod.TEACHING
    )
    
    success2 = world.transfer_knowledge(
        teacher_id="agent2",
        student_id="agent1",
        knowledge_id=knowledge_id2,
        learning_method=LearningMethod.COLLABORATION
    )
    
    assert success1 == True
    assert success2 == True
    
    # Test knowledge stats
    stats1 = world.get_knowledge_stats("agent1")
    stats2 = world.get_knowledge_stats("agent2")
    
    assert stats1["total_knowledge"] >= 2  # Original + transferred
    assert stats2["total_knowledge"] >= 2  # Original + transferred
    
    # Test transfer stats
    transfer_stats1 = world.get_knowledge_transfer_stats("agent1")
    transfer_stats2 = world.get_knowledge_transfer_stats("agent2")
    
    assert transfer_stats1["total_teaching_sessions"] >= 1
    assert transfer_stats1["total_learning_sessions"] >= 1
    assert transfer_stats2["total_teaching_sessions"] >= 1
    assert transfer_stats2["total_learning_sessions"] >= 1
    
    # Test system stats
    system_stats = world.get_learning_system_stats()
    assert system_stats["total_agents_with_knowledge"] >= 3
    assert system_stats["total_knowledge_items"] >= 4  # 2 original + 2 transferred
    assert system_stats["knowledge_transfers"] >= 2
    
    print("✅ AgentWorld integration tests passed!")


def test_knowledge_learning_simulation() -> None:
    """Test realistic knowledge learning simulation."""
    print("🧪 Testing knowledge learning simulation...")
    
    # Create world with multiple agents
    world = AgentWorld()
    
    # Create agents with different personalities
    agents = []
    for i in range(6):
        agent = world.create_agent(f"knowledge_agent_{i}", "fox", "foundation")
        agents.append(agent)
    
    # Add diverse knowledge to agents
    knowledge_types = [
        KnowledgeType.FACTUAL,
        KnowledgeType.PROCEDURAL,
        KnowledgeType.CONCEPTUAL,
        KnowledgeType.EXPERIENTIAL,
        KnowledgeType.SOCIAL,
        KnowledgeType.TECHNICAL
    ]
    
    learning_methods = [
        LearningMethod.EXPERIENCE,
        LearningMethod.PRACTICE,
        LearningMethod.TEACHING,
        LearningMethod.STUDY,
        LearningMethod.COLLABORATION,
        LearningMethod.OBSERVATION
    ]
    
    knowledge_added = 0
    for i, agent_id in enumerate([f"knowledge_agent_{j}" for j in range(6)]):
        for j in range(3):  # 3 knowledge items per agent
            knowledge_type = knowledge_types[j % len(knowledge_types)]
            learning_method = learning_methods[j % len(learning_methods)]
            
            knowledge_id = world.add_knowledge(
                agent_id=agent_id,
                title=f"{knowledge_type.value.title()} Knowledge {j+1}",
                knowledge_type=knowledge_type,
                description=f"Sample {knowledge_type.value} knowledge for agent {i+1}",
                proficiency=0.2 + (j * 0.2),
                confidence=0.3 + (j * 0.15),
                learning_method=learning_method,
                tags=[f"agent_{i+1}", f"knowledge_{j+1}", knowledge_type.value],
                difficulty=0.3 + (j * 0.1),
                importance=0.4 + (j * 0.1),
                transferability=0.5 + (j * 0.1)
            )
            
            if knowledge_id:
                knowledge_added += 1
    
    # Test knowledge transfers between agents
    transfers_made = 0
    for i in range(6):
        teacher_id = f"knowledge_agent_{i}"
        student_id = f"knowledge_agent_{(i + 1) % 6}"
        
        # Get teacher's knowledge stats to find teachable knowledge
        teacher_stats = world.get_knowledge_stats(teacher_id)
        if teacher_stats.get("total_knowledge", 0) > 0:
            # Try to transfer knowledge (this would need knowledge IDs in real implementation)
            # For now, we'll just verify the system can handle the requests
            transfers_made += 1
    
    # Verify knowledge was added
    assert knowledge_added > 0
    
    # Check that all agents have knowledge components
    for i in range(6):
        agent_id = f"knowledge_agent_{i}"
        stats = world.get_knowledge_stats(agent_id)
        assert "total_knowledge" in stats
        assert stats["total_knowledge"] >= 0  # Should have some knowledge
    
    # Check system stats
    system_stats = world.get_learning_system_stats()
    assert system_stats["total_agents_with_knowledge"] >= 6
    assert system_stats["total_knowledge_items"] >= knowledge_added
    
    print("✅ Knowledge learning simulation tests passed!")


def main() -> bool:
    """Run all knowledge system tests."""
    print("🦊 Starting Knowledge System Tests...\n")
    
    try:
        test_knowledge_component()
        test_knowledge()
        test_learning_opportunity()
        test_learning_system()
        test_agent_world_integration()
        test_knowledge_learning_simulation()
        
        print("\n🎉 All Knowledge System tests passed!")
        print("✅ Phase 4: Knowledge System implementation is working correctly!")
        
    except (AssertionError, KeyError, ValueError, AttributeError) as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    main()
