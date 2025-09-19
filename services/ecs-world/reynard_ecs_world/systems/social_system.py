"""
Social System

Manages social networks, group dynamics, social influence, and community formation
in the ECS world.
"""

import logging
import random
from typing import Any, Dict, List, Set

from reynard_ecs_world.components.social import (
    SocialComponent,
    SocialGroup,
    SocialRole,
    SocialStatus,
    GroupType,
)
from reynard_ecs_world.components.interaction import InteractionComponent
from reynard_ecs_world.components.traits import TraitComponent
from reynard_ecs_world.core.system import System

logger = logging.getLogger(__name__)


class SocialSystem(System):
    """
    System for managing social networks, group dynamics, and social influence.
    
    Handles group formation, social status updates, influence calculations,
    and community building among agents.
    """

    def __init__(self, world: Any) -> None:
        """
        Initialize the social system.
        
        Args:
            world: The ECS world this system belongs to
        """
        super().__init__(world)
        self.social_groups: Dict[str, SocialGroup] = {}
        self.processing_interval = 2.0  # Process social dynamics every 2 seconds
        self.last_processing_time = 0.0
        self.total_groups_created = 0
        self.total_connections_formed = 0
        self.total_leadership_changes = 0

    def update(self, delta_time: float) -> None:
        """
        Process social dynamics for all agents.
        
        Args:
            delta_time: Time elapsed since last update
        """
        self.last_processing_time += delta_time

        # Process social dynamics at regular intervals
        if self.last_processing_time >= self.processing_interval:
            self._process_social_dynamics(delta_time)
            self.last_processing_time = 0.0

        # Update social energy recovery for all agents
        self._update_social_energy_recovery(delta_time)

    def _process_social_dynamics(self, delta_time: float) -> None:
        """Process social dynamics including group formation and status updates."""
        entities = self.get_entities_with_components(SocialComponent)

        # Update social status for all agents
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if social_comp:
                social_comp.update_social_status()

        # Process group formation opportunities
        self._process_group_formation(entities)

        # Process group dynamics
        self._process_group_dynamics()

        # Process social network updates
        self._process_network_updates(entities)

    def _process_group_formation(self, entities: List[Any]) -> None:
        """Process opportunities for group formation."""
        # Find agents with high social energy and group activity preference
        potential_leaders = []
        potential_members = []

        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if not social_comp:
                continue

            if (social_comp.social_energy > 0.7 and 
                social_comp.group_activity_preference > 0.6 and
                social_comp.leadership_ability > 0.5):
                potential_leaders.append(entity)
            elif (social_comp.social_energy > 0.5 and 
                  social_comp.group_activity_preference > 0.4):
                potential_members.append(entity)

        # Try to form new groups
        for leader in potential_leaders:
            if random.random() < 0.1:  # 10% chance per processing cycle
                self._attempt_group_formation(leader, potential_members)

    def _attempt_group_formation(self, leader: Any, potential_members: List[Any]) -> None:
        """Attempt to form a new social group."""
        social_comp = leader.get_component(SocialComponent)
        if not social_comp or not social_comp.consume_social_energy(0.3):
            return

        # Determine group type based on leader's traits
        traits = leader.get_component(TraitComponent)
        if not traits:
            return

        # Choose group type based on personality traits
        if traits.personality.get('charisma', 0.5) > 0.7:
            group_type = random.choice([GroupType.COMMUNITY, GroupType.ALLIANCE])
        elif traits.personality.get('playfulness', 0.5) > 0.7:
            group_type = GroupType.FRIENDSHIP
        elif traits.personality.get('intelligence', 0.5) > 0.7:
            group_type = GroupType.MENTORSHIP
        else:
            group_type = random.choice(list(GroupType))

        # Find compatible members
        compatible_members = []
        for member in potential_members:
            if member.id == leader.id:
                continue
            
            member_social = member.get_component(SocialComponent)
            if not member_social:
                continue

            # Check compatibility
            if self._are_compatible_for_group(leader, member, group_type):
                compatible_members.append(member)

        # Form group if we have enough members
        if len(compatible_members) >= 2:
            self._create_social_group(leader, compatible_members, group_type)

    def _are_compatible_for_group(self, leader: Any, member: Any, group_type: GroupType) -> bool:
        """Check if two agents are compatible for a specific group type."""
        leader_traits = leader.get_component(TraitComponent)
        member_traits = member.get_component(TraitComponent)
        
        if not leader_traits or not member_traits:
            return False

        # Check personality compatibility
        compatibility = 0.0
        for trait_name in leader_traits.personality:
            if trait_name in member_traits.personality:
                leader_val = leader_traits.personality[trait_name]
                member_val = member_traits.personality[trait_name]
                similarity = 1.0 - abs(leader_val - member_val)
                compatibility += similarity

        compatibility /= len(leader_traits.personality)

        # Group type specific compatibility
        if group_type == GroupType.FRIENDSHIP:
            return compatibility > 0.6
        elif group_type == GroupType.WORK:
            return compatibility > 0.4  # Work groups can be more diverse
        elif group_type == GroupType.MENTORSHIP:
            # Leader should be more experienced/skilled
            return compatibility > 0.5 and leader_traits.personality.get('intelligence', 0.5) > member_traits.personality.get('intelligence', 0.5)
        else:
            return compatibility > 0.5

    def _create_social_group(self, leader: Any, members: List[Any], group_type: GroupType) -> None:
        """Create a new social group."""
        group_id = f"group_{random.randint(10000, 99999)}"
        group_name = f"{group_type.value.title()} Group {group_id[-4:]}"

        # Create the group
        group = SocialGroup(
            id=group_id,
            name=group_name,
            group_type=group_type,
            cohesion=0.6,  # Start with moderate cohesion
            influence=0.0,
            activity_level=0.7,
            stability=0.5
        )

        # Add leader
        group.add_member(leader.id)
        group.add_leader(leader.id)

        # Add members
        for member in members[:5]:  # Limit to 5 members initially
            group.add_member(member.id)

        # Update agent social components
        leader_social = leader.get_component(SocialComponent)
        if leader_social:
            leader_social.join_group(group_id)
            leader_social.take_leadership(group_id)
            leader_social.groups_created += 1

        for member in members:
            member_social = member.get_component(SocialComponent)
            if member_social:
                member_social.join_group(group_id)

        # Store the group
        self.social_groups[group_id] = group
        self.total_groups_created += 1

        logger.info(f"Created {group_type.value} group '{group_name}' with {len(group.members)} members")

    def _process_group_dynamics(self) -> None:
        """Process dynamics within existing groups."""
        for group_id, group in list(self.social_groups.items()):
            # Update group health
            group_health = group.calculate_group_health()

            # Check for group dissolution
            if group_health < 0.2 or len(group.members) < 2:
                self._dissolve_group(group_id)
                continue

            # Process leadership changes
            self._process_leadership_changes(group)

            # Update group cohesion based on interactions
            self._update_group_cohesion(group)

    def _process_leadership_changes(self, group: SocialGroup) -> None:
        """Process potential leadership changes in a group."""
        if not group.members or random.random() > 0.05:  # 5% chance per cycle
            return

        # Find potential new leaders
        potential_leaders = []
        for member_id in group.members:
            if member_id in group.leaders:
                continue

            entity = self.world.get_entity(member_id)
            if not entity:
                continue

            social_comp = entity.get_component(SocialComponent)
            traits = entity.get_component(TraitComponent)
            
            if (social_comp and traits and 
                social_comp.leadership_ability > 0.6 and
                traits.personality.get('charisma', 0.5) > 0.6):
                potential_leaders.append((member_id, social_comp, traits))

        # If we have potential leaders and current leaders are weak
        if potential_leaders and len(group.leaders) == 0:
            # Choose new leader
            new_leader_id, new_leader_social, new_leader_traits = max(
                potential_leaders, 
                key=lambda x: x[1].leadership_ability + x[2].personality.get('charisma', 0.5)
            )
            
            group.add_leader(new_leader_id)
            new_leader_social.take_leadership(group.id)
            self.total_leadership_changes += 1

    def _update_group_cohesion(self, group: SocialGroup) -> None:
        """Update group cohesion based on member interactions."""
        if len(group.members) < 2:
            return

        # Calculate average interaction quality among members
        total_interactions = 0
        positive_interactions = 0

        for member_id in group.members:
            entity = self.world.get_entity(member_id)
            if not entity:
                continue

            interaction_comp = entity.get_component(InteractionComponent)
            if interaction_comp:
                total_interactions += interaction_comp.total_interactions
                positive_interactions += interaction_comp.positive_interactions

        if total_interactions > 0:
            interaction_quality = positive_interactions / total_interactions
            # Update cohesion based on interaction quality
            cohesion_change = (interaction_quality - 0.5) * 0.1
            group.cohesion = max(0.0, min(1.0, group.cohesion + cohesion_change))

    def _process_network_updates(self, entities: List[Any]) -> None:
        """Process social network updates and connection formation."""
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if not social_comp:
                continue

            # Find potential new connections
            potential_connections = []
            for other_entity in entities:
                if other_entity.id == entity.id:
                    continue

                other_social = other_entity.get_component(SocialComponent)
                if not other_social or other_entity.id in social_comp.social_network:
                    continue

                # Check if they should form a connection
                if self._should_form_connection(entity, other_entity):
                    potential_connections.append(other_entity)

            # Form connections
            for other_entity in potential_connections[:2]:  # Limit to 2 new connections per cycle
                if random.random() < 0.1:  # 10% chance
                    self._form_social_connection(entity, other_entity)

    def _should_form_connection(self, agent1: Any, agent2: Any) -> bool:
        """Determine if two agents should form a social connection."""
        social1 = agent1.get_component(SocialComponent)
        social2 = agent2.get_component(SocialComponent)
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not all([social1, social2, traits1, traits2]):
            return False

        # Check social energy
        if social1.social_energy < 0.3 or social2.social_energy < 0.3:
            return False

        # Check group activity preference
        if (social1.group_activity_preference < 0.3 or 
            social2.group_activity_preference < 0.3):
            return False

        # Check personality compatibility
        compatibility = 0.0
        for trait_name in traits1.personality:
            if trait_name in traits2.personality:
                trait1_val = traits1.personality[trait_name]
                trait2_val = traits2.personality[trait_name]
                similarity = 1.0 - abs(trait1_val - trait2_val)
                compatibility += similarity

        compatibility /= len(traits1.personality)
        return compatibility > 0.4

    def _form_social_connection(self, agent1: Any, agent2: Any) -> None:
        """Form a social connection between two agents."""
        social1 = agent1.get_component(SocialComponent)
        social2 = agent2.get_component(SocialComponent)

        if not social1 or not social2:
            return

        # Determine connection type based on traits
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return

        # Choose connection type based on personality
        charisma1 = traits1.personality.get('charisma', 0.5)
        charisma2 = traits2.personality.get('charisma', 0.5)
        playfulness1 = traits1.personality.get('playfulness', 0.5)
        playfulness2 = traits2.personality.get('playfulness', 0.5)

        if (charisma1 > 0.7 and charisma2 > 0.7) or (playfulness1 > 0.7 and playfulness2 > 0.7):
            connection_type = "friend"
        elif charisma1 > 0.6 or charisma2 > 0.6:
            connection_type = "acquaintance"
        else:
            connection_type = "neutral"

        # Add connections
        social1.add_social_connection(agent2.id, connection_type)
        social2.add_social_connection(agent1.id, connection_type)

        self.total_connections_formed += 1

    def _dissolve_group(self, group_id: str) -> None:
        """Dissolve a social group."""
        if group_id not in self.social_groups:
            return

        group = self.social_groups[group_id]
        
        # Remove group memberships from all members
        for member_id in group.members:
            entity = self.world.get_entity(member_id)
            if entity:
                social_comp = entity.get_component(SocialComponent)
                if social_comp:
                    social_comp.leave_group(group_id)

        # Remove the group
        del self.social_groups[group_id]
        logger.info(f"Dissolved group '{group.name}' due to low health")

    def _update_social_energy_recovery(self, delta_time: float) -> None:
        """Update social energy recovery for all agents."""
        entities = self.get_entities_with_components(SocialComponent)
        
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if social_comp:
                social_comp.recover_social_energy(delta_time)

    def create_social_group(
        self, 
        creator_id: str, 
        group_name: str, 
        group_type: GroupType,
        member_ids: List[str]
    ) -> str:
        """
        Manually create a social group.
        
        Args:
            creator_id: ID of the agent creating the group
            group_name: Name of the group
            group_type: Type of group to create
            member_ids: List of agent IDs to include in the group
            
        Returns:
            Group ID if successful, empty string if failed
        """
        creator = self.world.get_entity(creator_id)
        if not creator:
            logger.warning(f"Creator agent {creator_id} not found")
            return ""

        creator_social = creator.get_component(SocialComponent)
        if not creator_social:
            logger.warning(f"Creator agent {creator_id} has no social component")
            return ""

        if not creator_social.consume_social_energy(0.5):
            logger.warning(f"Creator agent {creator_id} has insufficient social energy")
            return ""

        group_id = f"manual_group_{random.randint(10000, 99999)}"
        
        # Create the group
        group = SocialGroup(
            id=group_id,
            name=group_name,
            group_type=group_type,
            cohesion=0.7,
            influence=0.0,
            activity_level=0.8,
            stability=0.6
        )

        # Add creator as leader
        group.add_member(creator_id)
        group.add_leader(creator_id)
        creator_social.join_group(group_id)
        creator_social.take_leadership(group_id)
        creator_social.groups_created += 1

        # Add members
        for member_id in member_ids:
            if member_id == creator_id:
                continue

            member = self.world.get_entity(member_id)
            if not member:
                continue

            member_social = member.get_component(SocialComponent)
            if not member_social:
                continue

            group.add_member(member_id)
            member_social.join_group(group_id)

        # Store the group
        self.social_groups[group_id] = group
        self.total_groups_created += 1

        logger.info(f"Manually created {group_type.value} group '{group_name}' with {len(group.members)} members")
        return group_id

    def get_social_network(self, agent_id: str) -> Dict[str, Any]:
        """
        Get social network information for an agent.
        
        Args:
            agent_id: ID of the agent to get network for
            
        Returns:
            Dictionary with network information
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {"error": f"Agent {agent_id} not found"}

        social_comp = entity.get_component(SocialComponent)
        if not social_comp:
            return {"error": f"Agent {agent_id} has no social component"}

        # Get connection details
        connections = []
        for target_id, connection in social_comp.social_network.items():
            connections.append({
                "target_agent": target_id,
                "connection_type": connection.connection_type,
                "strength": connection.connection_strength,
                "influence_flow": connection.influence_flow,
                "mutual_connections": connection.mutual_connections,
                "shared_groups": connection.shared_groups,
                "last_interaction": connection.last_interaction.isoformat(),
                "interaction_frequency": connection.interaction_frequency
            })

        return {
            "agent_id": agent_id,
            "social_status": social_comp.social_status.value,
            "social_influence": social_comp.social_influence,
            "network_size": social_comp.network_size,
            "connections": connections,
            "group_memberships": list(social_comp.group_memberships),
            "leadership_roles": list(social_comp.leadership_roles),
            "social_energy": social_comp.social_energy,
            "charisma": social_comp.charisma,
            "leadership_ability": social_comp.leadership_ability
        }

    def get_group_info(self, group_id: str) -> Dict[str, Any]:
        """
        Get information about a social group.
        
        Args:
            group_id: ID of the group to get info for
            
        Returns:
            Dictionary with group information
        """
        if group_id not in self.social_groups:
            return {"error": f"Group {group_id} not found"}

        group = self.social_groups[group_id]
        
        return {
            "group_id": group.id,
            "name": group.name,
            "group_type": group.group_type.value,
            "members": group.members,
            "leaders": group.leaders,
            "member_count": group.get_member_count(),
            "leader_count": group.get_leader_count(),
            "cohesion": group.cohesion,
            "influence": group.influence,
            "activity_level": group.activity_level,
            "stability": group.stability,
            "group_health": group.calculate_group_health(),
            "created_at": group.created_at.isoformat(),
            "goals": group.goals,
            "rules": group.rules
        }

    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        entities = self.get_entities_with_components(SocialComponent)
        total_agents = len(entities)
        
        total_connections = 0
        total_groups = len(self.social_groups)
        total_leadership_roles = 0
        
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if social_comp:
                total_connections += social_comp.network_size
                total_leadership_roles += len(social_comp.leadership_roles)

        return {
            "total_agents_with_social": total_agents,
            "total_social_groups": total_groups,
            "total_connections": total_connections,
            "total_leadership_roles": total_leadership_roles,
            "groups_created": self.total_groups_created,
            "connections_formed": self.total_connections_formed,
            "leadership_changes": self.total_leadership_changes,
            "processing_interval": self.processing_interval
        }

    def __repr__(self) -> str:
        """String representation of the social system."""
        return f"SocialSystem(enabled={self.enabled}, groups={len(self.social_groups)}, connections={self.total_connections_formed})"
