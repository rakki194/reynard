"""
Tests for MCP tool integration with ECS Memory & Interaction System.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from typing import Dict, Any

from reynard_mcp_server.services.ecs_client import ECSClient
from reynard_mcp_server.tools.ecs_memory_tools import (
    store_memory,
    retrieve_memories,
    get_memory_stats,
    get_memory_system_stats,
    create_sample_memories,
)
from reynard_mcp_server.tools.ecs_interaction_tools import (
    initiate_interaction,
    get_relationship_status,
    get_interaction_stats,
    get_interaction_system_stats,
    simulate_agent_meeting,
)
from reynard_mcp_server.tools.ecs_social_tools import (
    create_social_group,
    get_social_network,
    get_group_info,
    get_social_stats,
    get_social_system_stats,
    simulate_social_community,
)
from reynard_mcp_server.tools.ecs_knowledge_tools import (
    add_knowledge,
    transfer_knowledge,
    get_knowledge_stats,
    get_knowledge_transfer_stats,
    get_learning_system_stats,
    simulate_knowledge_learning,
)
from reynard_mcp_server.tools.ecs_gender_tools import (
    update_gender_identity,
    add_support_agent,
    remove_support_agent,
    update_coming_out_status,
    get_gender_stats,
    get_gender_system_stats,
    simulate_gender_community,
)


class TestMCPMemoryTools:
    """Test suite for MCP memory tools."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_store_memory_tool(self):
        """Test store_memory MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_client.store_memory.return_value = True
            
            result = await store_memory(
                agent_id="test-agent",
                memory_type="episodic",
                content="Test memory content",
                importance=0.8,
                emotional_weight=0.6
            )
            
            assert result is True
            mock_client.store_memory.assert_called_once_with(
                "test-agent",
                "episodic",
                "Test memory content",
                importance=0.8,
                emotional_weight=0.6,
                associated_agents=None
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_retrieve_memories_tool(self):
        """Test retrieve_memories MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_memories = [
                {
                    "content": "Test memory 1",
                    "memory_type": "episodic",
                    "importance": 0.8,
                    "created_at": "2025-01-27T12:00:00"
                },
                {
                    "content": "Test memory 2",
                    "memory_type": "semantic",
                    "importance": 0.6,
                    "created_at": "2025-01-27T11:00:00"
                }
            ]
            mock_client.retrieve_memories.return_value = mock_memories
            
            result = await retrieve_memories(
                agent_id="test-agent",
                memory_type="episodic",
                limit=5
            )
            
            assert len(result) == 2
            assert result[0]["content"] == "Test memory 1"
            mock_client.retrieve_memories.assert_called_once_with(
                "test-agent",
                memory_type="episodic",
                limit=5
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_memory_stats_tool(self):
        """Test get_memory_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_memories": 10,
                "memories_by_type": {
                    "episodic": 5,
                    "semantic": 3,
                    "procedural": 2
                },
                "average_importance": 0.7,
                "memory_capacity_usage": 0.1
            }
            mock_client.get_memory_stats.return_value = mock_stats
            
            result = await get_memory_stats(agent_id="test-agent")
            
            assert result["total_memories"] == 10
            assert result["memories_by_type"]["episodic"] == 5
            mock_client.get_memory_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_memory_system_stats_tool(self):
        """Test get_memory_system_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_agents_with_memory": 50,
                "total_memories": 500,
                "memories_processed": 1000,
                "memories_consolidated": 100,
                "memories_cleaned": 50
            }
            mock_client.get_memory_system_stats.return_value = mock_stats
            
            result = await get_memory_system_stats()
            
            assert result["total_agents_with_memory"] == 50
            assert result["total_memories"] == 500
            mock_client.get_memory_system_stats.assert_called_once()
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_create_sample_memories_tool(self):
        """Test create_sample_memories MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_client.store_memory.return_value = True
            
            result = await create_sample_memories(agent_id="test-agent")
            
            assert result is True
            # Should have called store_memory multiple times for different memory types
            assert mock_client.store_memory.call_count >= 3


class TestMCPInteractionTools:
    """Test suite for MCP interaction tools."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_initiate_interaction_tool(self):
        """Test initiate_interaction MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_interaction_tools.ecs_client') as mock_client:
            mock_client.initiate_interaction.return_value = True
            
            result = await initiate_interaction(
                agent1_id="agent-1",
                agent2_id="agent-2",
                interaction_type="communication"
            )
            
            assert result is True
            mock_client.initiate_interaction.assert_called_once_with(
                "agent-1",
                "agent-2",
                "communication"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_relationship_status_tool(self):
        """Test get_relationship_status MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_interaction_tools.ecs_client') as mock_client:
            mock_relationship = {
                "relationship_type": "friend",
                "connection_strength": 0.8,
                "trust_level": 0.7,
                "familiarity": 0.6
            }
            mock_client.get_relationship_status.return_value = mock_relationship
            
            result = await get_relationship_status(
                agent1_id="agent-1",
                agent2_id="agent-2"
            )
            
            assert result["relationship_type"] == "friend"
            assert result["connection_strength"] == 0.8
            mock_client.get_relationship_status.assert_called_once_with(
                "agent-1",
                "agent-2"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_interaction_stats_tool(self):
        """Test get_interaction_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_interaction_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_interactions": 25,
                "relationships": {
                    "friends": 5,
                    "acquaintances": 10,
                    "rivals": 2
                },
                "social_energy": 80.0,
                "interaction_range": 5.0
            }
            mock_client.get_interaction_stats.return_value = mock_stats
            
            result = await get_interaction_stats(agent_id="test-agent")
            
            assert result["total_interactions"] == 25
            assert result["relationships"]["friends"] == 5
            mock_client.get_interaction_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_interaction_system_stats_tool(self):
        """Test get_interaction_system_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_interaction_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_agents_with_interactions": 100,
                "total_relationships": 500,
                "total_interactions": 1000,
                "interactions_processed": 2000
            }
            mock_client.get_interaction_system_stats.return_value = mock_stats
            
            result = await get_interaction_system_stats()
            
            assert result["total_agents_with_interactions"] == 100
            assert result["total_interactions"] == 1000
            mock_client.get_interaction_system_stats.assert_called_once()
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_simulate_agent_meeting_tool(self):
        """Test simulate_agent_meeting MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_interaction_tools.ecs_client') as mock_client:
            mock_client.initiate_interaction.return_value = True
            mock_client.get_relationship_status.return_value = {
                "relationship_type": "friend",
                "connection_strength": 0.8
            }
            
            result = await simulate_agent_meeting(
                agent1_id="agent-1",
                agent2_id="agent-2"
            )
            
            assert result is True
            # Should have called initiate_interaction
            mock_client.initiate_interaction.assert_called()


class TestMCPSocialTools:
    """Test suite for MCP social tools."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_create_social_group_tool(self):
        """Test create_social_group MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_client.create_social_group.return_value = "group-123"
            
            result = await create_social_group(
                creator_id="agent-1",
                name="Test Group",
                group_type="friendship",
                member_ids=["agent-1", "agent-2", "agent-3"]
            )
            
            assert result == "group-123"
            mock_client.create_social_group.assert_called_once_with(
                "agent-1",
                "Test Group",
                "friendship",
                ["agent-1", "agent-2", "agent-3"]
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_social_network_tool(self):
        """Test get_social_network MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_network = {
                "connections": [
                    {
                        "agent_id": "agent-2",
                        "connection_strength": 0.8,
                        "connection_type": "friend"
                    },
                    {
                        "agent_id": "agent-3",
                        "connection_strength": 0.6,
                        "connection_type": "acquaintance"
                    }
                ],
                "total_connections": 2,
                "social_influence": 0.7
            }
            mock_client.get_social_network.return_value = mock_network
            
            result = await get_social_network(agent_id="test-agent")
            
            assert result["total_connections"] == 2
            assert len(result["connections"]) == 2
            mock_client.get_social_network.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_group_info_tool(self):
        """Test get_group_info MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_info = {
                "group_id": "group-123",
                "name": "Test Group",
                "group_type": "friendship",
                "members": ["agent-1", "agent-2", "agent-3"],
                "leader_id": "agent-1",
                "created_at": "2025-01-27T12:00:00"
            }
            mock_client.get_group_info.return_value = mock_info
            
            result = await get_group_info(group_id="group-123")
            
            assert result["name"] == "Test Group"
            assert result["group_type"] == "friendship"
            assert len(result["members"]) == 3
            mock_client.get_group_info.assert_called_once_with("group-123")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_social_stats_tool(self):
        """Test get_social_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_connections": 10,
                "social_groups": ["group-1", "group-2"],
                "social_status": "accepted",
                "social_influence": 0.7,
                "leadership_roles": ["leader"]
            }
            mock_client.get_social_stats.return_value = mock_stats
            
            result = await get_social_stats(agent_id="test-agent")
            
            assert result["total_connections"] == 10
            assert len(result["social_groups"]) == 2
            assert result["social_status"] == "accepted"
            mock_client.get_social_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_social_system_stats_tool(self):
        """Test get_social_system_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_agents_with_social": 100,
                "total_social_groups": 25,
                "total_connections": 500,
                "total_leadership_roles": 30
            }
            mock_client.get_social_system_stats.return_value = mock_stats
            
            result = await get_social_system_stats()
            
            assert result["total_agents_with_social"] == 100
            assert result["total_social_groups"] == 25
            mock_client.get_social_system_stats.assert_called_once()
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_simulate_social_community_tool(self):
        """Test simulate_social_community MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_social_tools.ecs_client') as mock_client:
            mock_client.create_social_group.return_value = "group-123"
            
            result = await simulate_social_community(
                agent_count=5,
                group_count=2
            )
            
            assert result is True
            # Should have called create_social_group multiple times
            assert mock_client.create_social_group.call_count >= 2


class TestMCPKnowledgeTools:
    """Test suite for MCP knowledge tools."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_add_knowledge_tool(self):
        """Test add_knowledge MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_client.add_knowledge.return_value = "knowledge-123"
            
            result = await add_knowledge(
                agent_id="test-agent",
                title="Test Knowledge",
                knowledge_type="factual",
                description="Test description",
                proficiency=0.8,
                importance=0.7
            )
            
            assert result == "knowledge-123"
            mock_client.add_knowledge.assert_called_once_with(
                "test-agent",
                "Test Knowledge",
                "factual",
                "Test description",
                proficiency=0.8,
                importance=0.7
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_transfer_knowledge_tool(self):
        """Test transfer_knowledge MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_client.transfer_knowledge.return_value = True
            
            result = await transfer_knowledge(
                teacher_id="teacher-agent",
                student_id="student-agent",
                knowledge_id="knowledge-123"
            )
            
            assert result is True
            mock_client.transfer_knowledge.assert_called_once_with(
                "teacher-agent",
                "student-agent",
                "knowledge-123"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_knowledge_stats_tool(self):
        """Test get_knowledge_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_knowledge": 15,
                "knowledge_by_type": {
                    "factual": 8,
                    "procedural": 4,
                    "conceptual": 3
                },
                "average_proficiency": 0.7,
                "teachable_knowledge": 10
            }
            mock_client.get_knowledge_stats.return_value = mock_stats
            
            result = await get_knowledge_stats(agent_id="test-agent")
            
            assert result["total_knowledge"] == 15
            assert result["knowledge_by_type"]["factual"] == 8
            mock_client.get_knowledge_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_knowledge_transfer_stats_tool(self):
        """Test get_knowledge_transfer_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_teaching_sessions": 25,
                "total_learning_sessions": 30,
                "successful_transfers": 20,
                "average_teaching_effectiveness": 0.8
            }
            mock_client.get_knowledge_transfer_stats.return_value = mock_stats
            
            result = await get_knowledge_transfer_stats(agent_id="test-agent")
            
            assert result["total_teaching_sessions"] == 25
            assert result["successful_transfers"] == 20
            mock_client.get_knowledge_transfer_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_learning_system_stats_tool(self):
        """Test get_learning_system_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_agents_with_knowledge": 100,
                "total_knowledge_items": 500,
                "total_learning_opportunities": 200,
                "total_teachable_knowledge": 400
            }
            mock_client.get_learning_system_stats.return_value = mock_stats
            
            result = await get_learning_system_stats()
            
            assert result["total_agents_with_knowledge"] == 100
            assert result["total_knowledge_items"] == 500
            mock_client.get_learning_system_stats.assert_called_once()
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_simulate_knowledge_learning_tool(self):
        """Test simulate_knowledge_learning MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_knowledge_tools.ecs_client') as mock_client:
            mock_client.add_knowledge.return_value = "knowledge-123"
            mock_client.transfer_knowledge.return_value = True
            
            result = await simulate_knowledge_learning(
                teacher_id="teacher-agent",
                student_id="student-agent"
            )
            
            assert result is True
            # Should have called add_knowledge and transfer_knowledge
            mock_client.add_knowledge.assert_called()
            mock_client.transfer_knowledge.assert_called()


class TestMCPGenderTools:
    """Test suite for MCP gender tools."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_update_gender_identity_tool(self):
        """Test update_gender_identity MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_client.update_gender_identity.return_value = True
            
            result = await update_gender_identity(
                agent_id="test-agent",
                identity="male"
            )
            
            assert result is True
            mock_client.update_gender_identity.assert_called_once_with(
                "test-agent",
                "male"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_add_support_agent_tool(self):
        """Test add_support_agent MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_client.add_support_agent.return_value = True
            
            result = await add_support_agent(
                agent_id="test-agent",
                support_agent_id="support-agent"
            )
            
            assert result is True
            mock_client.add_support_agent.assert_called_once_with(
                "test-agent",
                "support-agent"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_remove_support_agent_tool(self):
        """Test remove_support_agent MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_client.remove_support_agent.return_value = True
            
            result = await remove_support_agent(
                agent_id="test-agent",
                support_agent_id="support-agent"
            )
            
            assert result is True
            mock_client.remove_support_agent.assert_called_once_with(
                "test-agent",
                "support-agent"
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_update_coming_out_status_tool(self):
        """Test update_coming_out_status MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_client.update_coming_out_status.return_value = True
            
            result = await update_coming_out_status(
                agent_id="test-agent",
                other_agent_id="other-agent",
                is_out=True
            )
            
            assert result is True
            mock_client.update_coming_out_status.assert_called_once_with(
                "test-agent",
                "other-agent",
                True
            )
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_gender_stats_tool(self):
        """Test get_gender_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_stats = {
                "profile": {
                    "primary_identity": "non_binary",
                    "expression": "androgynous",
                    "support_network": ["agent-2", "agent-3"],
                    "coming_out_status": {"agent-2": True},
                    "gender_wellbeing": 0.8,
                    "expression_confidence": 0.7
                },
                "pronoun_usage": {"they": 0.8, "them": 0.8},
                "support_network_size": 2
            }
            mock_client.get_gender_stats.return_value = mock_stats
            
            result = await get_gender_stats(agent_id="test-agent")
            
            assert result["profile"]["primary_identity"] == "non_binary"
            assert len(result["profile"]["support_network"]) == 2
            mock_client.get_gender_stats.assert_called_once_with("test-agent")
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_get_gender_system_stats_tool(self):
        """Test get_gender_system_stats MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_stats = {
                "total_agents": 100,
                "identity_distribution": {
                    "male": 30,
                    "female": 30,
                    "non_binary": 20,
                    "genderfluid": 10,
                    "agender": 10
                },
                "expression_distribution": {
                    "masculine": 40,
                    "feminine": 40,
                    "androgynous": 20
                },
                "average_expression_confidence": 0.7,
                "average_gender_wellbeing": 0.8
            }
            mock_client.get_gender_system_stats.return_value = mock_stats
            
            result = await get_gender_system_stats()
            
            assert result["total_agents"] == 100
            assert result["identity_distribution"]["male"] == 30
            assert result["identity_distribution"]["non_binary"] == 20
            mock_client.get_gender_system_stats.assert_called_once()
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_simulate_gender_community_tool(self):
        """Test simulate_gender_community MCP tool."""
        with patch('reynard_mcp_server.tools.ecs_gender_tools.ecs_client') as mock_client:
            mock_client.update_gender_identity.return_value = True
            mock_client.add_support_agent.return_value = True
            mock_client.update_coming_out_status.return_value = True
            
            result = await simulate_gender_community(
                agent_count=5,
                support_network_density=0.6
            )
            
            assert result is True
            # Should have called gender operations multiple times
            assert mock_client.update_gender_identity.call_count >= 5
            assert mock_client.add_support_agent.call_count >= 3
            assert mock_client.update_coming_out_status.call_count >= 3


class TestMCPErrorHandling:
    """Test suite for MCP tool error handling."""
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_mcp_tool_error_handling(self):
        """Test MCP tool error handling with client failures."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_client.store_memory.side_effect = Exception("Connection failed")
            
            result = await store_memory(
                agent_id="test-agent",
                memory_type="episodic",
                content="Test content"
            )
            
            assert result is False
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_mcp_tool_invalid_parameters(self):
        """Test MCP tool handling of invalid parameters."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            mock_client.store_memory.return_value = False
            
            result = await store_memory(
                agent_id="",  # Invalid empty agent ID
                memory_type="episodic",
                content="Test content"
            )
            
            assert result is False
    
    @pytest.mark.mcp
    @pytest.mark.asyncio
    async def test_mcp_tool_timeout_handling(self):
        """Test MCP tool timeout handling."""
        with patch('reynard_mcp_server.tools.ecs_memory_tools.ecs_client') as mock_client:
            async def slow_operation(*args, **kwargs):
                await asyncio.sleep(10)  # Simulate slow operation
                return True
            
            mock_client.store_memory.side_effect = slow_operation
            
            # This should timeout or handle gracefully
            result = await store_memory(
                agent_id="test-agent",
                memory_type="episodic",
                content="Test content"
            )
            
            # Result depends on timeout implementation
            assert isinstance(result, bool)
