"""
Comprehensive pytest tests for all ECS systems.
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from typing import Dict, Any

from reynard_ecs_world.systems import (
    MemorySystem,
    InteractionSystem,
    SocialSystem,
    LearningSystem,
    GenderSystem,
)
from reynard_ecs_world.components import (
    MemoryComponent,
    Memory,
    MemoryType,
    InteractionComponent,
    Interaction,
    InteractionType,
    CommunicationStyle,
    SocialComponent,
    SocialGroup,
    GroupType,
    SocialRole,
    KnowledgeComponent,
    Knowledge,
    KnowledgeType,
    GenderComponent,
    GenderIdentity,
    GenderExpression,
)


class TestMemorySystem:
    """Test suite for MemorySystem."""
    
    @pytest.mark.unit
    def test_memory_system_initialization(self):
        """Test MemorySystem initialization."""
        world = Mock()
        system = MemorySystem(world)
        
        assert system.world == world
        assert system.processing_interval == 1.0
        assert system.memory_decay_rate == 0.01
        assert system.consolidation_threshold == 0.1
        assert system.cleanup_threshold == 0.05
        assert system.total_memories_processed == 0
        assert system.total_memories_consolidated == 0
        assert system.total_memories_cleaned == 0
    
    @pytest.mark.unit
    def test_store_memory_for_agent(self):
        """Test storing memory for an agent."""
        world = Mock()
        system = MemorySystem(world)
        
        # Mock agent with MemoryComponent
        agent = Mock()
        memory_component = MemoryComponent()
        agent.get_component.return_value = memory_component
        world.get_agent.return_value = agent
        
        result = system.store_memory_for_agent(
            "agent-1",
            MemoryType.EPISODIC,
            "Test memory content",
            importance=0.8,
            emotional_weight=0.6
        )
        
        assert result is True
        assert len(memory_component.memories) == 1
        assert memory_component.memories[0].content == "Test memory content"
        assert memory_component.total_memories_created == 1
    
    @pytest.mark.unit
    def test_retrieve_memories_for_agent(self):
        """Test retrieving memories for an agent."""
        world = Mock()
        system = MemorySystem(world)
        
        # Mock agent with MemoryComponent
        agent = Mock()
        memory_component = MemoryComponent()
        
        # Add test memories
        memory1 = Memory(
            content="Memory 1",
            memory_type=MemoryType.EPISODIC,
            importance=0.8
        )
        memory2 = Memory(
            content="Memory 2",
            memory_type=MemoryType.SEMANTIC,
            importance=0.6
        )
        memory_component.add_memory(memory1)
        memory_component.add_memory(memory2)
        
        agent.get_component.return_value = memory_component
        world.get_agent.return_value = agent
        
        memories = system.retrieve_memories_for_agent("agent-1", limit=5)
        
        assert len(memories) == 2
        assert memories[0].content == "Memory 1"
        assert memories[1].content == "Memory 2"
    
    @pytest.mark.unit
    def test_process_memory_decay(self):
        """Test memory decay processing."""
        world = Mock()
        system = MemorySystem(world)
        
        # Mock agent with MemoryComponent
        agent = Mock()
        memory_component = MemoryComponent()
        
        # Add old memory
        old_memory = Memory(
            content="Old memory",
            memory_type=MemoryType.EPISODIC,
            importance=0.5
        )
        old_memory.created_at = datetime.now() - timedelta(days=10)
        memory_component.add_memory(old_memory)
        
        agent.get_component.return_value = memory_component
        world.get_agent.return_value = agent
        
        # Process decay
        system._process_memory_decay(agent, memory_component, 1.0)
        
        # Memory importance should be reduced
        assert memory_component.memories[0].importance < 0.5
    
    @pytest.mark.unit
    def test_process_memory_consolidation(self):
        """Test memory consolidation processing."""
        world = Mock()
        system = MemorySystem(world)
        
        # Mock agent with MemoryComponent
        agent = Mock()
        memory_component = MemoryComponent()
        
        # Add similar memories
        memory1 = Memory(
            content="Similar memory 1",
            memory_type=MemoryType.EPISODIC,
            importance=0.3
        )
        memory2 = Memory(
            content="Similar memory 2",
            memory_type=MemoryType.EPISODIC,
            importance=0.3
        )
        memory_component.add_memory(memory1)
        memory_component.add_memory(memory2)
        
        agent.get_component.return_value = memory_component
        world.get_agent.return_value = agent
        
        # Process consolidation
        system._process_memory_consolidation(agent, memory_component)
        
        # Should have consolidated memories
        assert system.total_memories_consolidated > 0


class TestInteractionSystem:
    """Test suite for InteractionSystem."""
    
    @pytest.mark.unit
    def test_interaction_system_initialization(self):
        """Test InteractionSystem initialization."""
        world = Mock()
        system = InteractionSystem(world)
        
        assert system.world == world
        assert system.processing_interval == 1.0
        assert system.interaction_range == 5.0
        assert system.base_interaction_probability == 0.3
        assert system.social_energy_cost == 10.0
        assert system.energy_recovery_rate == 5.0
        assert system.total_interactions_processed == 0
    
    @pytest.mark.unit
    def test_initiate_interaction(self):
        """Test initiating interaction between agents."""
        world = Mock()
        system = InteractionSystem(world)
        
        # Mock agents with InteractionComponent
        agent1 = Mock()
        agent2 = Mock()
        interaction_comp1 = InteractionComponent()
        interaction_comp2 = InteractionComponent()
        
        agent1.get_component.return_value = interaction_comp1
        agent2.get_component.return_value = interaction_comp2
        agent1.id = "agent-1"
        agent2.id = "agent-2"
        
        world.get_agent.side_effect = lambda x: agent1 if x == "agent-1" else agent2
        world.get_entities_with_components.return_value = [agent1, agent2]
        
        result = system.initiate_interaction(
            "agent-1",
            "agent-2",
            InteractionType.COMMUNICATION
        )
        
        assert result is True
        assert len(interaction_comp1.interactions) == 1
        assert interaction_comp1.total_interactions == 1
    
    @pytest.mark.unit
    def test_check_proximity(self):
        """Test proximity checking between agents."""
        world = Mock()
        system = InteractionSystem(world)
        
        # Mock agents with positions
        agent1 = Mock()
        agent2 = Mock()
        agent1.position = (0, 0)
        agent2.position = (3, 4)  # Distance of 5
        
        result = system._check_proximity(agent1, agent2)
        
        assert result is True  # Within range of 5
    
    @pytest.mark.unit
    def test_calculate_interaction_probability(self):
        """Test interaction probability calculation."""
        world = Mock()
        system = InteractionSystem(world)
        
        # Mock agents with traits
        agent1 = Mock()
        agent2 = Mock()
        
        # Mock trait components
        trait1 = Mock()
        trait2 = Mock()
        trait1.personality = {"charisma": 0.8, "playfulness": 0.6}
        trait2.personality = {"charisma": 0.7, "playfulness": 0.5}
        
        agent1.get_component.return_value = trait1
        agent2.get_component.return_value = trait2
        
        probability = system._calculate_interaction_probability(agent1, agent2)
        
        assert 0.0 <= probability <= 1.0
        assert probability > system.base_interaction_probability  # Higher due to good traits
    
    @pytest.mark.unit
    def test_process_social_energy(self):
        """Test social energy processing."""
        world = Mock()
        system = InteractionSystem(world)
        
        # Mock agent with InteractionComponent
        agent = Mock()
        interaction_comp = InteractionComponent()
        interaction_comp.social_energy = 50.0  # Below max
        
        agent.get_component.return_value = interaction_comp
        world.get_agent.return_value = agent
        
        # Process energy recovery
        system._process_social_energy(agent, interaction_comp, 1.0)
        
        # Energy should have increased
        assert interaction_comp.social_energy > 50.0


class TestSocialSystem:
    """Test suite for SocialSystem."""
    
    @pytest.mark.unit
    def test_social_system_initialization(self):
        """Test SocialSystem initialization."""
        world = Mock()
        system = SocialSystem(world)
        
        assert system.world == world
        assert system.processing_interval == 1.0
        assert system.group_formation_threshold == 0.7
        assert system.leadership_change_threshold == 0.8
        assert system.group_health_threshold == 0.3
        assert system.total_groups_created == 0
        assert system.total_connections_formed == 0
        assert system.total_leadership_changes == 0
    
    @pytest.mark.unit
    def test_create_social_group(self):
        """Test creating social groups."""
        world = Mock()
        system = SocialSystem(world)
        
        # Mock agents
        agent1 = Mock()
        agent2 = Mock()
        agent3 = Mock()
        
        world.get_agent.side_effect = lambda x: {
            "agent-1": agent1,
            "agent-2": agent2,
            "agent-3": agent3
        }[x]
        
        group_id = system.create_social_group(
            "agent-1",
            "Test Group",
            GroupType.FRIENDSHIP,
            ["agent-1", "agent-2", "agent-3"]
        )
        
        assert group_id is not None
        assert system.total_groups_created == 1
    
    @pytest.mark.unit
    def test_form_social_connection(self):
        """Test forming social connections."""
        world = Mock()
        system = SocialSystem(world)
        
        # Mock agents with SocialComponent
        agent1 = Mock()
        agent2 = Mock()
        social_comp1 = SocialComponent()
        social_comp2 = SocialComponent()
        
        agent1.get_component.return_value = social_comp1
        agent2.get_component.return_value = social_comp2
        agent1.id = "agent-1"
        agent2.id = "agent-2"
        
        world.get_agent.side_effect = lambda x: agent1 if x == "agent-1" else agent2
        
        result = system.form_social_connection("agent-1", "agent-2", 0.8)
        
        assert result is True
        assert "agent-2" in social_comp1.social_connections
        assert system.total_connections_formed == 1
    
    @pytest.mark.unit
    def test_calculate_social_influence(self):
        """Test social influence calculation."""
        world = Mock()
        system = SocialSystem(world)
        
        # Mock agent with SocialComponent
        agent = Mock()
        social_comp = SocialComponent()
        
        # Add connections
        from reynard_ecs_world.components import SocialConnection
        connection1 = SocialConnection(
            agent_id="agent-2",
            connection_strength=0.8,
            connection_type="friend",
            mutual_connections=1,
            last_interaction=datetime.now()
        )
        connection2 = SocialConnection(
            agent_id="agent-3",
            connection_strength=0.6,
            connection_type="acquaintance",
            mutual_connections=0,
            last_interaction=datetime.now()
        )
        
        social_comp.add_social_connection(connection1)
        social_comp.add_social_connection(connection2)
        
        agent.get_component.return_value = social_comp
        world.get_agent.return_value = agent
        
        influence = system._calculate_social_influence(agent, social_comp)
        
        assert influence > 0
        assert influence <= 1.0
    
    @pytest.mark.unit
    def test_process_group_dynamics(self):
        """Test group dynamics processing."""
        world = Mock()
        system = SocialSystem(world)
        
        # Mock agent with SocialComponent
        agent = Mock()
        social_comp = SocialComponent()
        
        # Add a group
        group = SocialGroup(
            group_id="group-1",
            name="Test Group",
            group_type=GroupType.FRIENDSHIP,
            members=["agent-1", "agent-2"],
            leader_id="agent-1",
            created_at=datetime.now()
        )
        social_comp.join_social_group(group, SocialRole.MEMBER)
        
        agent.get_component.return_value = social_comp
        world.get_agent.return_value = agent
        
        # Process group dynamics
        system._process_group_dynamics(agent, social_comp, 1.0)
        
        # Should have processed group dynamics
        assert True  # Test passes if no exceptions


class TestLearningSystem:
    """Test suite for LearningSystem."""
    
    @pytest.mark.unit
    def test_learning_system_initialization(self):
        """Test LearningSystem initialization."""
        world = Mock()
        system = LearningSystem(world)
        
        assert system.world == world
        assert system.processing_interval == 1.0
        assert system.knowledge_sharing_radius == 10.0
        assert system.learning_rate == 0.1
        assert system.teaching_effectiveness == 0.5
        assert system.total_knowledge_transfers == 0
        assert system.total_teaching_sessions == 0
        assert system.total_learning_sessions == 0
    
    @pytest.mark.unit
    def test_add_knowledge_to_agent(self):
        """Test adding knowledge to an agent."""
        world = Mock()
        system = LearningSystem(world)
        
        # Mock agent with KnowledgeComponent
        agent = Mock()
        knowledge_comp = KnowledgeComponent()
        agent.get_component.return_value = knowledge_comp
        world.get_agent.return_value = agent
        
        knowledge_id = system.add_knowledge_to_agent(
            "agent-1",
            "Test Knowledge",
            KnowledgeType.FACTUAL,
            "Test description",
            proficiency=0.8,
            importance=0.7
        )
        
        assert knowledge_id is not None
        assert knowledge_id in knowledge_comp.knowledge_items
        assert knowledge_comp.total_knowledge_acquired == 1
    
    @pytest.mark.unit
    def test_transfer_knowledge(self):
        """Test knowledge transfer between agents."""
        world = Mock()
        system = LearningSystem(world)
        
        # Mock agents with KnowledgeComponent
        teacher = Mock()
        student = Mock()
        teacher_comp = KnowledgeComponent()
        student_comp = KnowledgeComponent()
        
        # Add knowledge to teacher
        knowledge = Knowledge(
            title="Test Knowledge",
            knowledge_type=KnowledgeType.FACTUAL,
            description="Test",
            proficiency=0.8
        )
        knowledge_id = teacher_comp.add_knowledge(knowledge)
        
        teacher.get_component.return_value = teacher_comp
        student.get_component.return_value = student_comp
        teacher.id = "teacher-1"
        student.id = "student-1"
        
        world.get_agent.side_effect = lambda x: teacher if x == "teacher-1" else student
        
        result = system.transfer_knowledge("teacher-1", "student-1", knowledge_id)
        
        assert result is True
        assert system.total_knowledge_transfers == 1
        assert system.total_teaching_sessions == 1
    
    @pytest.mark.unit
    def test_calculate_teaching_effectiveness(self):
        """Test teaching effectiveness calculation."""
        world = Mock()
        system = LearningSystem(world)
        
        # Mock teacher and student with traits
        teacher = Mock()
        student = Mock()
        
        # Mock trait components
        teacher_traits = Mock()
        student_traits = Mock()
        teacher_traits.personality = {"charisma": 0.8, "intelligence": 0.9}
        student_traits.personality = {"intelligence": 0.7, "curiosity": 0.8}
        
        teacher.get_component.return_value = teacher_traits
        student.get_component.return_value = student_traits
        
        effectiveness = system._calculate_teaching_effectiveness(teacher, student)
        
        assert 0.0 <= effectiveness <= 1.0
        assert effectiveness > 0.5  # Should be good with high traits
    
    @pytest.mark.unit
    def test_process_knowledge_decay(self):
        """Test knowledge decay processing."""
        world = Mock()
        system = LearningSystem(world)
        
        # Mock agent with KnowledgeComponent
        agent = Mock()
        knowledge_comp = KnowledgeComponent()
        
        # Add old knowledge
        knowledge = Knowledge(
            title="Old Knowledge",
            knowledge_type=KnowledgeType.FACTUAL,
            description="Test",
            proficiency=0.8
        )
        knowledge.acquired_at = datetime.now() - timedelta(days=10)
        knowledge_comp.add_knowledge(knowledge)
        
        agent.get_component.return_value = knowledge_comp
        world.get_agent.return_value = agent
        
        # Process decay
        system._process_knowledge_decay(agent, knowledge_comp, 1.0)
        
        # Knowledge proficiency should be reduced
        knowledge_item = list(knowledge_comp.knowledge_items.values())[0]
        assert knowledge_item.proficiency < 0.8


class TestGenderSystem:
    """Test suite for GenderSystem."""
    
    @pytest.mark.unit
    def test_gender_system_initialization(self):
        """Test GenderSystem initialization."""
        world = Mock()
        system = GenderSystem(world)
        
        assert system.world == world
        assert system.processing_interval == 1.0
        assert system.support_network_threshold == 0.5
        assert system.expression_confidence_threshold == 0.3
        assert system.gender_fluidity_rate == 0.01
        assert system.total_identity_changes == 0
        assert system.total_support_network_changes == 0
        assert system.total_coming_out_events == 0
    
    @pytest.mark.unit
    def test_update_gender_identity(self):
        """Test updating gender identity."""
        world = Mock()
        system = GenderSystem(world)
        
        # Mock agent with GenderComponent
        agent = Mock()
        gender_comp = GenderComponent()
        agent.get_component.return_value = gender_comp
        world.get_agent.return_value = agent
        
        result = system.update_gender_identity("agent-1", GenderIdentity.MALE)
        
        assert result is True
        assert gender_comp.profile.primary_identity == GenderIdentity.MALE
        assert gender_comp.profile.last_identity_change is not None
        assert system.total_identity_changes == 1
    
    @pytest.mark.unit
    def test_add_support_agent(self):
        """Test adding support agents."""
        world = Mock()
        system = GenderSystem(world)
        
        # Mock agent with GenderComponent
        agent = Mock()
        gender_comp = GenderComponent()
        agent.get_component.return_value = gender_comp
        world.get_agent.return_value = agent
        
        result = system.add_support_agent("agent-1", "agent-2")
        
        assert result is True
        assert "agent-2" in gender_comp.profile.support_network
        assert system.total_support_network_changes == 1
    
    @pytest.mark.unit
    def test_update_coming_out_status(self):
        """Test updating coming out status."""
        world = Mock()
        system = GenderSystem(world)
        
        # Mock agent with GenderComponent
        agent = Mock()
        gender_comp = GenderComponent()
        agent.get_component.return_value = gender_comp
        world.get_agent.return_value = agent
        
        result = system.update_coming_out_status("agent-1", "agent-2", True)
        
        assert result is True
        assert gender_comp.profile.coming_out_status["agent-2"] is True
        assert len(gender_comp.profile.coming_out_events) == 1
        assert system.total_coming_out_events == 1
    
    @pytest.mark.unit
    def test_process_gender_fluidity(self):
        """Test gender fluidity processing."""
        world = Mock()
        system = GenderSystem(world)
        
        # Mock agent with GenderComponent
        agent = Mock()
        gender_comp = GenderComponent()
        gender_comp.profile.gender_fluidity = 0.5  # Set some fluidity
        
        agent.get_component.return_value = gender_comp
        world.get_agent.return_value = agent
        
        # Process fluidity
        system._process_gender_fluidity(agent, gender_comp, 1.0)
        
        # Should have processed fluidity (no exceptions)
        assert True
    
    @pytest.mark.unit
    def test_calculate_gender_wellbeing(self):
        """Test gender wellbeing calculation."""
        world = Mock()
        system = GenderSystem(world)
        
        # Mock agent with GenderComponent
        agent = Mock()
        gender_comp = GenderComponent()
        
        # Add support network
        gender_comp.add_support_agent("agent-2")
        gender_comp.add_support_agent("agent-3")
        
        # Update coming out status
        gender_comp.update_coming_out_status("agent-2", True)
        
        agent.get_component.return_value = gender_comp
        world.get_agent.return_value = agent
        
        wellbeing = system._calculate_gender_wellbeing(agent, gender_comp)
        
        assert 0.0 <= wellbeing <= 1.0
        assert wellbeing > 0.5  # Should be higher with support network
