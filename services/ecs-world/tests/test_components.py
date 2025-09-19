"""
Comprehensive pytest tests for all ECS components.
"""

import pytest
from datetime import datetime, timedelta
from typing import Dict, Any

from reynard_ecs_world.components import (
    MemoryComponent,
    Memory,
    MemoryType,
    InteractionComponent,
    Interaction,
    Relationship,
    InteractionType,
    CommunicationStyle,
    SocialComponent,
    SocialConnection,
    SocialGroup,
    SocialRole,
    SocialStatus,
    GroupType,
    KnowledgeComponent,
    Knowledge,
    LearningOpportunity,
    KnowledgeType,
    GenderComponent,
    GenderProfile,
    PronounSet,
    GenderIdentity,
    GenderExpression,
    PronounType,
)


class TestMemoryComponent:
    """Test suite for MemoryComponent."""
    
    @pytest.mark.unit
    def test_memory_component_initialization(self):
        """Test MemoryComponent initialization."""
        component = MemoryComponent()
        
        assert component.memories == {}
        assert component.memory_capacity == 1000
        assert component.memory_decay_rate == 0.01
        assert component.consolidation_threshold == 0.8
        assert component.total_memories_formed == 0
        assert component.total_memories_forgotten == 0
    
    @pytest.mark.unit
    def test_memory_component_custom_initialization(self):
        """Test MemoryComponent with custom parameters."""
        component = MemoryComponent(memory_capacity=500)
        
        assert component.memory_capacity == 500
        assert component.memory_decay_rate == 0.01
        assert component.consolidation_threshold == 0.8
    
    @pytest.mark.unit
    def test_store_memory(self):
        """Test storing memories in component."""
        component = MemoryComponent()
        
        memory_id = component.store_memory(
            memory_type=MemoryType.EPISODIC,
            content="Test memory",
            importance=0.8,
            emotional_weight=0.6
        )
        
        assert len(component.memories) == 1
        assert memory_id in component.memories
        assert component.memories[memory_id].content == "Test memory"
        assert component.total_memories_formed == 1
    
    @pytest.mark.unit
    def test_get_memories_by_type(self):
        """Test retrieving memories by type."""
        component = MemoryComponent()
        
        # Add different types of memories
        episodic_id = component.store_memory(
            memory_type=MemoryType.EPISODIC,
            content="Episodic memory",
            importance=0.8
        )
        semantic_id = component.store_memory(
            memory_type=MemoryType.SEMANTIC,
            content="Semantic memory",
            importance=0.6
        )
        
        episodic_memories = component.retrieve_memories(memory_type=MemoryType.EPISODIC)
        semantic_memories = component.retrieve_memories(memory_type=MemoryType.SEMANTIC)
        
        assert len(episodic_memories) == 1
        assert len(semantic_memories) == 1
        assert episodic_memories[0].content == "Episodic memory"
        assert semantic_memories[0].content == "Semantic memory"
    
    @pytest.mark.unit
    def test_memory_capacity_limit(self):
        """Test memory capacity limit enforcement."""
        component = MemoryComponent(memory_capacity=2)
        
        # Add memories up to capacity
        for i in range(3):
            memory_id = component.store_memory(
                memory_type=MemoryType.EPISODIC,
                content=f"Memory {i}",
                importance=0.5
            )
        
        # Should only have 2 memories due to capacity limit
        assert len(component.memories) == 2
        assert component.total_memories_formed == 3  # Total created, not current


class TestInteractionComponent:
    """Test suite for InteractionComponent."""
    
    @pytest.mark.unit
    def test_interaction_component_initialization(self):
        """Test InteractionComponent initialization."""
        component = InteractionComponent()
        
        assert component.interactions == []
        assert component.relationship_map == {}
        assert component.social_energy == 100.0
        assert component.max_social_energy == 100.0
        assert component.energy_recovery_rate == 10.0
        assert component.interaction_range == 5.0
        assert component.base_interaction_probability == 0.3
        assert component.total_interactions == 0
        assert component.last_interaction_time is None
    
    @pytest.mark.unit
    def test_add_interaction(self):
        """Test adding interactions to component."""
        component = InteractionComponent()
        
        interaction = Interaction(
            agent1_id="agent-1",
            agent2_id="agent-2",
            interaction_type=InteractionType.COMMUNICATION,
            communication_style=CommunicationStyle.CASUAL
        )
        
        component.add_interaction(interaction)
        
        assert len(component.interactions) == 1
        assert component.interactions[0].agent1_id == "agent-1"
        assert component.total_interactions == 1
    
    @pytest.mark.unit
    def test_get_relationship(self):
        """Test getting relationship between agents."""
        component = InteractionComponent()
        
        # Add a relationship
        relationship = Relationship(
            agent_id="agent-2",
            relationship_type="friend",
            connection_strength=0.8,
            trust_level=0.7,
            familiarity=0.6
        )
        component.relationship_map["agent-2"] = relationship
        
        retrieved_relationship = component.get_relationship("agent-2")
        
        assert retrieved_relationship is not None
        assert retrieved_relationship.relationship_type == "friend"
        assert retrieved_relationship.connection_strength == 0.8
    
    @pytest.mark.unit
    def test_update_relationship(self):
        """Test updating existing relationships."""
        component = InteractionComponent()
        
        # Add initial relationship
        relationship = Relationship(
            agent_id="agent-2",
            relationship_type="acquaintance",
            connection_strength=0.3,
            trust_level=0.2,
            familiarity=0.1
        )
        component.relationship_map["agent-2"] = relationship
        
        # Update relationship
        component.update_relationship("agent-2", 0.1, 0.1, 0.1)
        
        updated_relationship = component.get_relationship("agent-2")
        assert updated_relationship.connection_strength == 0.4
        assert updated_relationship.trust_level == 0.3
        assert updated_relationship.familiarity == 0.2


class TestSocialComponent:
    """Test suite for SocialComponent."""
    
    @pytest.mark.unit
    def test_social_component_initialization(self):
        """Test SocialComponent initialization."""
        component = SocialComponent()
        
        assert component.social_connections == {}
        assert component.social_groups == {}
        assert component.social_status == SocialStatus.ACCEPTED
        assert component.social_influence == 0.0
        assert component.leadership_roles == []
        assert component.social_energy == 100.0
        assert component.max_social_energy == 100.0
        assert component.energy_recovery_rate == 5.0
        assert component.total_connections_formed == 0
        assert component.total_groups_joined == 0
    
    @pytest.mark.unit
    def test_add_social_connection(self):
        """Test adding social connections."""
        component = SocialComponent()
        
        connection = SocialConnection(
            agent_id="agent-2",
            connection_strength=0.8,
            connection_type="friend",
            mutual_connections=2,
            last_interaction=datetime.now()
        )
        
        component.add_social_connection(connection)
        
        assert "agent-2" in component.social_connections
        assert component.social_connections["agent-2"].connection_strength == 0.8
        assert component.total_connections_formed == 1
    
    @pytest.mark.unit
    def test_join_social_group(self):
        """Test joining social groups."""
        component = SocialComponent()
        
        group = SocialGroup(
            group_id="group-1",
            name="Test Group",
            group_type=GroupType.FRIENDSHIP,
            members=["agent-1", "agent-2"],
            leader_id="agent-1",
            created_at=datetime.now()
        )
        
        component.join_social_group(group, SocialRole.MEMBER)
        
        assert "group-1" in component.social_groups
        assert component.social_groups["group-1"].role == SocialRole.MEMBER
        assert component.total_groups_joined == 1
    
    @pytest.mark.unit
    def test_calculate_social_influence(self):
        """Test social influence calculation."""
        component = SocialComponent()
        
        # Add connections
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
        
        component.add_social_connection(connection1)
        component.add_social_connection(connection2)
        
        influence = component.calculate_social_influence()
        
        # Influence should be based on connection strength and network size
        assert influence > 0
        assert influence <= 1.0


class TestKnowledgeComponent:
    """Test suite for KnowledgeComponent."""
    
    @pytest.mark.unit
    def test_knowledge_component_initialization(self):
        """Test KnowledgeComponent initialization."""
        component = KnowledgeComponent()
        
        assert component.knowledge_items == {}
        assert component.learning_opportunities == []
        assert component.teachable_knowledge == []
        assert component.knowledge_capacity == 100
        assert component.learning_rate == 0.1
        assert component.teaching_effectiveness == 0.5
        assert component.total_knowledge_acquired == 0
        assert component.total_knowledge_shared == 0
    
    @pytest.mark.unit
    def test_add_knowledge(self):
        """Test adding knowledge to component."""
        component = KnowledgeComponent()
        
        knowledge = Knowledge(
            title="Test Knowledge",
            knowledge_type=KnowledgeType.FACTUAL,
            description="Test description",
            proficiency=0.8,
            importance=0.7
        )
        
        knowledge_id = component.add_knowledge(knowledge)
        
        assert knowledge_id in component.knowledge_items
        assert component.knowledge_items[knowledge_id].title == "Test Knowledge"
        assert component.total_knowledge_acquired == 1
    
    @pytest.mark.unit
    def test_get_knowledge_by_type(self):
        """Test retrieving knowledge by type."""
        component = KnowledgeComponent()
        
        # Add different types of knowledge
        factual_knowledge = Knowledge(
            title="Factual Knowledge",
            knowledge_type=KnowledgeType.FACTUAL,
            description="Test",
            proficiency=0.8
        )
        procedural_knowledge = Knowledge(
            title="Procedural Knowledge",
            knowledge_type=KnowledgeType.PROCEDURAL,
            description="Test",
            proficiency=0.6
        )
        
        component.add_knowledge(factual_knowledge)
        component.add_knowledge(procedural_knowledge)
        
        factual_items = component.get_knowledge_by_type(KnowledgeType.FACTUAL)
        procedural_items = component.get_knowledge_by_type(KnowledgeType.PROCEDURAL)
        
        assert len(factual_items) == 1
        assert len(procedural_items) == 1
        assert factual_items[0].title == "Factual Knowledge"
        assert procedural_items[0].title == "Procedural Knowledge"
    
    @pytest.mark.unit
    def test_add_learning_opportunity(self):
        """Test adding learning opportunities."""
        component = KnowledgeComponent()
        
        opportunity = LearningOpportunity(
            knowledge_id="knowledge-1",
            teacher_id="teacher-1",
            learning_method="teaching",
            difficulty=0.5,
            estimated_time=30
        )
        
        component.add_learning_opportunity(opportunity)
        
        assert len(component.learning_opportunities) == 1
        assert component.learning_opportunities[0].knowledge_id == "knowledge-1"


class TestGenderComponent:
    """Test suite for GenderComponent."""
    
    @pytest.mark.unit
    def test_gender_component_initialization(self):
        """Test GenderComponent initialization."""
        component = GenderComponent()
        
        assert component.profile is not None
        assert component.profile.primary_identity == GenderIdentity.NON_BINARY
        assert component.profile.expression == GenderExpression.ANDROGYNOUS
        assert component.profile.pronoun_sets == []
        assert component.profile.preferred_pronouns == []
        assert component.profile.support_network == []
        assert component.profile.coming_out_status == {}
        assert component.profile.gender_wellbeing == 0.5
        assert component.profile.expression_confidence == 0.5
        assert component.profile.support_needs == []
        assert component.profile.transition_goals == []
        assert component.profile.gender_fluidity == 0.0
        assert component.profile.last_identity_change is None
        assert component.profile.identity_change_history == []
        assert component.profile.expression_experiments == []
        assert component.profile.gender_validation_events == []
        assert component.profile.pronoun_usage_stats == {}
        assert component.profile.expression_confidence_changes == []
        assert component.profile.support_network_changes == []
        assert component.profile.coming_out_events == []
        assert component.profile.gender_interactions == []
        assert component.profile.expression_confidence_changes == []
    
    @pytest.mark.unit
    def test_gender_component_custom_initialization(self):
        """Test GenderComponent with custom profile."""
        profile = GenderProfile(
            primary_identity=GenderIdentity.MALE,
            expression=GenderExpression.MASCULINE
        )
        component = GenderComponent(profile=profile)
        
        assert component.profile.primary_identity == GenderIdentity.MALE
        assert component.profile.expression == GenderExpression.MASCULINE
    
    @pytest.mark.unit
    def test_update_identity(self):
        """Test updating gender identity."""
        component = GenderComponent()
        
        # Update to male identity
        component.update_identity(GenderIdentity.MALE)
        
        assert component.profile.primary_identity == GenderIdentity.MALE
        assert component.profile.last_identity_change is not None
        assert len(component.profile.identity_change_history) == 1
    
    @pytest.mark.unit
    def test_add_support_agent(self):
        """Test adding support agents."""
        component = GenderComponent()
        
        component.add_support_agent("agent-2")
        
        assert "agent-2" in component.profile.support_network
        assert len(component.profile.support_network_changes) == 1
    
    @pytest.mark.unit
    def test_update_coming_out_status(self):
        """Test updating coming out status."""
        component = GenderComponent()
        
        component.update_coming_out_status("agent-2", True)
        
        assert component.profile.coming_out_status["agent-2"] is True
        assert len(component.profile.coming_out_events) == 1
    
    @pytest.mark.unit
    def test_calculate_wellbeing(self):
        """Test gender wellbeing calculation."""
        component = GenderComponent()
        
        # Add support network
        component.add_support_agent("agent-2")
        component.add_support_agent("agent-3")
        
        # Update coming out status
        component.update_coming_out_status("agent-2", True)
        
        wellbeing = component.calculate_wellbeing()
        
        # Wellbeing should be higher with support network and coming out
        assert wellbeing > 0.5
        assert wellbeing <= 1.0


class TestDataStructures:
    """Test suite for data structures (Memory, Interaction, etc.)."""
    
    @pytest.mark.unit
    def test_memory_dataclass(self):
        """Test Memory dataclass."""
        memory = Memory(
            content="Test memory content",
            memory_type=MemoryType.EPISODIC,
            importance=0.8,
            emotional_weight=0.6,
            associated_agents=["agent-1", "agent-2"]
        )
        
        assert memory.content == "Test memory content"
        assert memory.memory_type == MemoryType.EPISODIC
        assert memory.importance == 0.8
        assert memory.emotional_weight == 0.6
        assert memory.associated_agents == ["agent-1", "agent-2"]
        assert memory.created_at is not None
        assert memory.last_accessed is not None
        assert memory.access_count == 0
    
    @pytest.mark.unit
    def test_interaction_dataclass(self):
        """Test Interaction dataclass."""
        interaction = Interaction(
            agent1_id="agent-1",
            agent2_id="agent-2",
            interaction_type=InteractionType.COMMUNICATION,
            communication_style=CommunicationStyle.CASUAL,
            duration=30,
            success=True
        )
        
        assert interaction.agent1_id == "agent-1"
        assert interaction.agent2_id == "agent-2"
        assert interaction.interaction_type == InteractionType.COMMUNICATION
        assert interaction.communication_style == CommunicationStyle.CASUAL
        assert interaction.duration == 30
        assert interaction.success is True
        assert interaction.timestamp is not None
    
    @pytest.mark.unit
    def test_relationship_dataclass(self):
        """Test Relationship dataclass."""
        relationship = Relationship(
            agent_id="agent-2",
            relationship_type="friend",
            connection_strength=0.8,
            trust_level=0.7,
            familiarity=0.6,
            mutual_connections=2
        )
        
        assert relationship.agent_id == "agent-2"
        assert relationship.relationship_type == "friend"
        assert relationship.connection_strength == 0.8
        assert relationship.trust_level == 0.7
        assert relationship.familiarity == 0.6
        assert relationship.mutual_connections == 2
        assert relationship.first_met is not None
        assert relationship.last_interaction is not None
    
    @pytest.mark.unit
    def test_knowledge_dataclass(self):
        """Test Knowledge dataclass."""
        knowledge = Knowledge(
            title="Test Knowledge",
            knowledge_type=KnowledgeType.FACTUAL,
            description="Test description",
            proficiency=0.8,
            importance=0.7,
            confidence=0.6
        )
        
        assert knowledge.title == "Test Knowledge"
        assert knowledge.knowledge_type == KnowledgeType.FACTUAL
        assert knowledge.description == "Test description"
        assert knowledge.proficiency == 0.8
        assert knowledge.importance == 0.7
        assert knowledge.confidence == 0.6
        assert knowledge.acquired_at is not None
        assert knowledge.last_used is not None
    
    @pytest.mark.unit
    def test_gender_profile_dataclass(self):
        """Test GenderProfile dataclass."""
        profile = GenderProfile(
            primary_identity=GenderIdentity.MALE,
            expression=GenderExpression.MASCULINE
        )
        
        assert profile.primary_identity == GenderIdentity.MALE
        assert profile.expression == GenderExpression.MASCULINE
        assert profile.pronoun_sets == []
        assert profile.preferred_pronouns == []
        assert profile.support_network == []
        assert profile.coming_out_status == {}
        assert profile.gender_wellbeing == 0.5
        assert profile.expression_confidence == 0.5
    
    @pytest.mark.unit
    def test_pronoun_set_dataclass(self):
        """Test PronounSet dataclass."""
        pronoun_set = PronounSet(
            subject="he",
            object="him",
            possessive="his",
            reflexive="himself",
            pronoun_type=PronounType.SUBJECT
        )
        
        assert pronoun_set.subject == "he"
        assert pronoun_set.object == "him"
        assert pronoun_set.possessive == "his"
        assert pronoun_set.reflexive == "himself"
        assert pronoun_set.pronoun_type == PronounType.SUBJECT
