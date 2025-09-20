"""
Test Social System

Unit and integration tests for the social system components and functionality.
"""

from reynard_ecs_world.components.social import (
    SocialComponent,
    SocialGroup,
    SocialConnection,
    SocialStatus,
    GroupType,
)
from reynard_ecs_world.systems.social_system import SocialSystem
from reynard_ecs_world.world.agent_world import AgentWorld


def test_social_component() -> None:
    """Test SocialComponent functionality."""
    print("🧪 Testing SocialComponent...")

    # Create social component
    comp = SocialComponent()
    comp.set_agent_id("test_agent")

    # Test initial state
    assert comp.social_status == SocialStatus.ACCEPTED
    assert comp.social_influence == 0.0
    assert comp.network_size == 0
    assert len(comp.group_memberships) == 0
    assert len(comp.leadership_roles) == 0
    assert comp.social_energy == 1.0

    # Test social connection management
    comp.add_social_connection("other_agent", "friend")
    assert comp.network_size == 1
    assert "other_agent" in comp.social_network

    connection = comp.get_connection("other_agent")
    assert connection is not None
    assert connection.connection_type == "friend"
    assert connection.connection_strength == 0.1

    # Test connection update
    comp.update_connection("other_agent", 0.2)
    updated_connection = comp.get_connection("other_agent")
    assert updated_connection is not None
    assert updated_connection.connection_strength > 0.1

    # Test group membership
    comp.join_group("test_group")
    assert "test_group" in comp.group_memberships
    assert comp.groups_joined == 1

    # Test leadership
    comp.take_leadership("test_group")
    assert "test_group" in comp.leadership_roles
    assert comp.leadership_opportunities == 1

    # Test social influence calculation
    influence = comp.calculate_social_influence()
    assert influence >= 0.0

    # Test social status update
    comp.update_social_status()
    # Status should be updated based on current metrics

    # Test social energy management
    initial_energy = comp.social_energy
    comp.consume_social_energy(0.3)
    assert comp.social_energy < initial_energy

    comp.recover_social_energy(1.0)  # 1 second
    assert comp.social_energy > initial_energy - 0.3

    # Test social stats
    stats = comp.get_social_stats()
    assert "social_status" in stats
    assert "social_influence" in stats
    assert "network_size" in stats

    print("✅ SocialComponent tests passed!")


def test_social_group() -> None:
    """Test SocialGroup functionality."""
    print("🧪 Testing SocialGroup...")

    # Create social group
    group = SocialGroup(
        id="test_group",
        name="Test Group",
        group_type=GroupType.FRIENDSHIP,
        cohesion=0.7,
        influence=0.0,
        activity_level=0.8,
        stability=0.6,
    )

    # Test initial state
    assert group.id == "test_group"
    assert group.name == "Test Group"
    assert group.group_type == GroupType.FRIENDSHIP
    assert group.get_member_count() == 0
    assert group.get_leader_count() == 0

    # Test member management
    group.add_member("agent1")
    group.add_member("agent2")
    assert group.get_member_count() == 2
    assert group.is_member("agent1")
    assert group.is_member("agent2")
    assert not group.is_member("agent3")

    # Test leadership management
    group.add_leader("agent1")
    assert group.get_leader_count() == 1
    assert group.is_leader("agent1")
    assert not group.is_leader("agent2")

    # Test member removal
    group.remove_member("agent2")
    assert group.get_member_count() == 1
    assert not group.is_member("agent2")

    # Test group health calculation
    health = group.calculate_group_health()
    assert 0.0 <= health <= 1.0

    # Test group validation
    assert group.cohesion >= 0.0 and group.cohesion <= 1.0
    assert group.activity_level >= 0.0 and group.activity_level <= 1.0
    assert group.stability >= 0.0 and group.stability <= 1.0

    print("✅ SocialGroup tests passed!")


def test_social_connection() -> None:
    """Test SocialConnection functionality."""
    print("🧪 Testing SocialConnection...")

    # Create social connection
    connection = SocialConnection(
        target_agent="other_agent",
        connection_strength=0.5,
        connection_type="friend",
        mutual_connections=2,
        shared_groups=1,
        influence_flow=0.3,
    )

    # Test initial state
    assert connection.target_agent == "other_agent"
    assert connection.connection_strength == 0.5
    assert connection.connection_type == "friend"
    assert connection.mutual_connections == 2
    assert connection.shared_groups == 1
    assert connection.influence_flow == 0.3

    # Test connection update
    initial_strength = connection.connection_strength
    connection.update_connection(0.2)
    assert connection.connection_strength > initial_strength
    # Note: update_connection updates strength and last_interaction timestamp

    # Test connection quality
    quality = connection.get_connection_quality()
    assert 0.0 <= quality <= 1.0

    # Test validation
    assert (
        connection.connection_strength >= 0.0 and connection.connection_strength <= 1.0
    )
    assert connection.influence_flow >= -1.0 and connection.influence_flow <= 1.0

    print("✅ SocialConnection tests passed!")


def test_social_system() -> None:
    """Test SocialSystem functionality."""
    print("🧪 Testing SocialSystem...")

    # Create world and system
    world = AgentWorld()
    system = SocialSystem(world)

    # Create test agents
    world.create_agent("agent1", "fox", "foundation")
    world.create_agent("agent2", "wolf", "foundation")
    world.create_agent("agent3", "otter", "foundation")

    # Test group creation
    group_id = system.create_social_group(
        creator_id="agent1",
        group_name="Test Group",
        group_type=GroupType.FRIENDSHIP,
        member_ids=["agent2", "agent3"],
    )

    assert group_id != ""
    assert group_id in system.social_groups

    # Test group info retrieval
    group_info = system.get_group_info(group_id)
    assert "group_id" in group_info
    assert group_info["name"] == "Test Group"
    assert group_info["group_type"] == "friendship"
    assert len(group_info["members"]) >= 3  # creator + 2 members

    # Test social network retrieval
    network_info = system.get_social_network("agent1")
    assert "agent_id" in network_info
    assert network_info["agent_id"] == "agent1"
    assert "social_status" in network_info

    # Test system stats
    stats = system.get_system_stats()
    assert "total_agents_with_social" in stats
    assert "total_social_groups" in stats
    assert stats["total_social_groups"] >= 1

    print("✅ SocialSystem tests passed!")


def test_agent_world_integration() -> None:
    """Test integration with AgentWorld."""
    print("🧪 Testing AgentWorld integration...")

    # Create world
    world = AgentWorld()

    # Create agents
    world.create_agent("agent1", "fox", "foundation")
    world.create_agent("agent2", "wolf", "foundation")
    world.create_agent("agent3", "otter", "foundation")

    # Test group creation
    group_id = world.create_social_group(
        creator_id="agent1",
        group_name="Integration Test Group",
        group_type=GroupType.COMMUNITY,
        member_ids=["agent2", "agent3"],
    )

    assert group_id != ""

    # Test group info retrieval
    group_info = world.get_group_info(group_id)
    assert "group_id" in group_info
    assert group_info["name"] == "Integration Test Group"

    # Test social network retrieval
    network_info = world.get_social_network("agent1")
    assert "agent_id" in network_info
    assert network_info["agent_id"] == "agent1"

    # Test social stats
    stats1 = world.get_social_stats("agent1")
    stats2 = world.get_social_stats("agent2")
    assert "social_status" in stats1
    assert "social_influence" in stats2

    # Test system stats
    system_stats = world.get_social_system_stats()
    assert "total_agents_with_social" in system_stats
    assert "total_social_groups" in system_stats

    print("✅ AgentWorld integration tests passed!")


def test_social_dynamics_simulation() -> None:
    """Test realistic social dynamics simulation."""
    print("🧪 Testing social dynamics simulation...")

    # Create world with multiple agents
    world = AgentWorld()

    # Create agents with different personalities
    agents = []
    for i in range(8):
        agent = world.create_agent(f"social_agent_{i}", "fox", "foundation")
        agents.append(agent)

    # Create multiple social groups
    groups_created = []
    for i in range(3):
        group_name = f"Community Group {i+1}"
        group_type = GroupType.FRIENDSHIP if i % 2 == 0 else GroupType.COMMUNITY

        # Select members for the group
        start_idx = i * 2
        end_idx = min(start_idx + 3, len(agents))
        member_ids = [f"social_agent_{j}" for j in range(start_idx, end_idx)]

        if len(member_ids) >= 2:
            creator_id = member_ids[0]
            other_members = member_ids[1:]

            group_id = world.create_social_group(
                creator_id=creator_id,
                group_name=group_name,
                group_type=group_type,
                member_ids=other_members,
            )

            if group_id:
                groups_created.append(group_id)

    # Verify groups were created
    assert len(groups_created) > 0

    # Check that agents have social components
    for i in range(8):
        agent_id = f"social_agent_{i}"
        stats = world.get_social_stats(agent_id)
        assert "social_status" in stats
        assert "network_size" in stats

    # Check system stats
    system_stats = world.get_social_system_stats()
    assert system_stats["total_social_groups"] >= len(groups_created)
    assert system_stats["total_agents_with_social"] >= 8

    # Test group information retrieval
    for group_id in groups_created:
        group_info = world.get_group_info(group_id)
        assert "group_id" in group_info
        assert "members" in group_info
        assert len(group_info["members"]) >= 2

    print("✅ Social dynamics simulation tests passed!")


def main() -> bool:
    """Run all social system tests."""
    print("🦊 Starting Social System Tests...\n")

    try:
        test_social_component()
        test_social_group()
        test_social_connection()
        test_social_system()
        test_agent_world_integration()
        test_social_dynamics_simulation()

        print("\n🎉 All Social System tests passed!")
        print("✅ Phase 3: Social Dynamics implementation is working correctly!")

    except (AssertionError, KeyError, ValueError, AttributeError) as e:
        print(f"\n❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    main()
