"""
Social System

Manages social networks, group dynamics, social influence, and community formation
in the ECS world.
"""

import logging
import random
from typing import Any, Dict, List, Set

from ..components.social import (
    SocialComponent,
    SocialGroup,
    SocialRole,
    SocialStatus,
    GroupType,
)
from ..components.interaction import InteractionComponent
from ..components.traits import TraitComponent
from ..core.system import System

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

        # Attempt to form new groups
        for leader in potential_leaders:
            if random.random() < 0.1:  # 10% chance per update
                self._attempt_group_formation(leader, potential_members)

    def _attempt_group_formation(self, leader: Any, potential_members: List[Any]) -> None:
        """Attempt to form a new group with a leader and potential members."""
        social_comp = leader.get_component(SocialComponent)
        if not social_comp:
            return

        # Check if leader is already in a group
        if social_comp.current_groups:
            return

        # Find compatible members
        compatible_members = []
        for member in potential_members:
            if member.id == leader.id:
                continue
            
            member_social_comp = member.get_component(SocialComponent)
            if not member_social_comp:
                continue

            # Check if member is already in a group
            if member_social_comp.current_groups:
                continue

            # Check compatibility
            if self._are_agents_compatible(leader, member):
                compatible_members.append(member)

        # Form group if we have enough members
        if len(compatible_members) >= 2:
            self._create_social_group(leader, compatible_members)

    def _are_agents_compatible(self, agent1: Any, agent2: Any) -> bool:
        """Check if two agents are compatible for group formation."""
        social_comp1 = agent1.get_component(SocialComponent)
        social_comp2 = agent2.get_component(SocialComponent)

        if not social_comp1 or not social_comp2:
            return False

        # Check social energy compatibility
        energy_diff = abs(social_comp1.social_energy - social_comp2.social_energy)
        if energy_diff > 0.5:
            return False

        # Check group activity preference compatibility
        activity_diff = abs(social_comp1.group_activity_preference - social_comp2.group_activity_preference)
        if activity_diff > 0.4:
            return False

        return True

    def _create_social_group(self, leader: Any, members: List[Any]) -> None:
        """Create a new social group."""
        group_id = f"group_{self.total_groups_created}_{leader.id}"
        
        # Determine group type based on leader's preferences
        leader_social_comp = leader.get_component(SocialComponent)
        group_type = self._determine_group_type(leader_social_comp)

        # Create group
        group = SocialGroup(
            id=group_id,
            name=f"{group_type.value} Group",
            group_type=group_type,
            leader_id=leader.id,
            member_ids=[leader.id] + [member.id for member in members],
            created_at=leader_social_comp.last_update,
            activity_level=0.5,
            cohesion=0.5,
            influence=0.3
        )

        # Add group to system
        self.social_groups[group_id] = group

        # Update member social components
        all_members = [leader] + members
        for member in all_members:
            member_social_comp = member.get_component(SocialComponent)
            if member_social_comp:
                member_social_comp.join_group(group_id, SocialRole.LEADER if member.id == leader.id else SocialRole.MEMBER)

        self.total_groups_created += 1
        logger.debug(f"Created social group {group_id} with {len(all_members)} members")

    def _determine_group_type(self, social_comp: SocialComponent) -> GroupType:
        """Determine the type of group to create based on leader's preferences."""
        # This would typically use more sophisticated logic
        # For now, randomly select based on preferences
        if social_comp.leadership_ability > 0.7:
            return GroupType.WORK
        elif social_comp.social_energy > 0.8:
            return GroupType.SOCIAL
        else:
            return GroupType.INTEREST

    def _process_group_dynamics(self) -> None:
        """Process dynamics within existing groups."""
        for group in self.social_groups.values():
            self._update_group_cohesion(group)
            self._update_group_influence(group)
            self._process_leadership_changes(group)

    def _update_group_cohesion(self, group: SocialGroup) -> None:
        """Update group cohesion based on member interactions."""
        # Get member social components
        member_components = []
        for member_id in group.member_ids:
            entity = self.world.get_entity(member_id)
            if entity:
                social_comp = entity.get_component(SocialComponent)
                if social_comp:
                    member_components.append(social_comp)

        if not member_components:
            return

        # Calculate average social energy
        avg_social_energy = sum(comp.social_energy for comp in member_components) / len(member_components)

        # Update cohesion based on social energy and interactions
        cohesion_change = (avg_social_energy - 0.5) * 0.01
        group.cohesion = max(0.0, min(1.0, group.cohesion + cohesion_change))

    def _update_group_influence(self, group: SocialGroup) -> None:
        """Update group influence based on size and cohesion."""
        # Influence increases with size and cohesion
        size_factor = min(1.0, len(group.member_ids) / 10.0)  # Normalize to 10 members
        cohesion_factor = group.cohesion

        group.influence = (size_factor * 0.6 + cohesion_factor * 0.4)

    def _process_leadership_changes(self, group: SocialGroup) -> None:
        """Process potential leadership changes within groups."""
        # Find current leader
        leader_entity = self.world.get_entity(group.leader_id)
        if not leader_entity:
            return

        leader_social_comp = leader_entity.get_component(SocialComponent)
        if not leader_social_comp:
            return

        # Check if leader is still suitable
        if (leader_social_comp.social_energy < 0.3 or 
            leader_social_comp.leadership_ability < 0.4):
            
            # Find a new leader
            new_leader = self._find_new_leader(group)
            if new_leader:
                self._change_group_leader(group, new_leader)

    def _find_new_leader(self, group: SocialGroup) -> Any:
        """Find a new leader for a group."""
        best_candidate = None
        best_score = 0.0

        for member_id in group.member_ids:
            if member_id == group.leader_id:
                continue

            entity = self.world.get_entity(member_id)
            if not entity:
                continue

            social_comp = entity.get_component(SocialComponent)
            if not social_comp:
                continue

            # Calculate leadership score
            score = (social_comp.leadership_ability * 0.4 + 
                    social_comp.social_energy * 0.3 + 
                    social_comp.influence * 0.3)

            if score > best_score:
                best_score = score
                best_candidate = entity

        return best_candidate

    def _change_group_leader(self, group: SocialGroup, new_leader: Any) -> None:
        """Change the leader of a group."""
        old_leader_id = group.leader_id
        new_leader_id = new_leader.id

        # Update group
        group.leader_id = new_leader_id

        # Update social components
        old_leader_entity = self.world.get_entity(old_leader_id)
        if old_leader_entity:
            old_leader_social_comp = old_leader_entity.get_component(SocialComponent)
            if old_leader_social_comp:
                old_leader_social_comp.update_group_role(group.id, SocialRole.MEMBER)

        new_leader_social_comp = new_leader.get_component(SocialComponent)
        if new_leader_social_comp:
            new_leader_social_comp.update_group_role(group.id, SocialRole.LEADER)

        self.total_leadership_changes += 1
        logger.debug(f"Changed leader of group {group.id} from {old_leader_id} to {new_leader_id}")

    def _process_network_updates(self, entities: List[Any]) -> None:
        """Process social network updates and connections."""
        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if not social_comp:
                continue

            # Update social connections
            self._update_social_connections(entity, social_comp)

    def _update_social_connections(self, entity: Any, social_comp: SocialComponent) -> None:
        """Update social connections for an agent."""
        # Find nearby agents for potential connections
        nearby_entities = self._find_nearby_agents(entity)

        for nearby_entity in nearby_entities:
            if nearby_entity.id == entity.id:
                continue

            nearby_social_comp = nearby_entity.get_component(SocialComponent)
            if not nearby_social_comp:
                continue

            # Check if connection should be formed
            if self._should_form_connection(social_comp, nearby_social_comp):
                self._form_social_connection(entity, nearby_entity, social_comp, nearby_social_comp)

    def _find_nearby_agents(self, entity: Any) -> List[Any]:
        """Find nearby agents for social interaction."""
        # This would typically use position components
        # For now, return all other entities with social components
        all_entities = self.get_entities_with_components(SocialComponent)
        return [e for e in all_entities if e.id != entity.id]

    def _should_form_connection(self, social_comp1: SocialComponent, social_comp2: SocialComponent) -> bool:
        """Check if two agents should form a social connection."""
        # Check if they're already connected
        if social_comp1.has_connection(social_comp2.entity_id):
            return False

        # Check social energy compatibility
        energy_diff = abs(social_comp1.social_energy - social_comp2.social_energy)
        if energy_diff > 0.6:
            return False

        # Random chance based on social energy
        connection_chance = (social_comp1.social_energy + social_comp2.social_energy) / 2.0 * 0.05
        return random.random() < connection_chance

    def _form_social_connection(self, entity1: Any, entity2: Any, social_comp1: SocialComponent, social_comp2: SocialComponent) -> None:
        """Form a social connection between two agents."""
        # Add connection to both agents
        social_comp1.add_connection(entity2.id, 0.1)  # Initial connection strength
        social_comp2.add_connection(entity1.id, 0.1)

        self.total_connections_formed += 1
        logger.debug(f"Formed social connection between {entity1.id} and {entity2.id}")

    def _update_social_energy_recovery(self, delta_time: float) -> None:
        """Update social energy recovery for all agents."""
        entities = self.get_entities_with_components(SocialComponent)

        for entity in entities:
            social_comp = entity.get_component(SocialComponent)
            if social_comp:
                social_comp.recover_social_energy(delta_time)

    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        total_agents = len(self.get_entities_with_components(SocialComponent))
        total_groups = len(self.social_groups)
        
        return {
            "total_agents_with_social": total_agents,
            "total_groups": total_groups,
            "total_groups_created": self.total_groups_created,
            "total_connections_formed": self.total_connections_formed,
            "total_leadership_changes": self.total_leadership_changes,
            "processing_interval": self.processing_interval
        }

    def create_group(
        self,
        leader_id: str,
        group_name: str,
        group_type: GroupType,
        member_ids: List[str] | None = None
    ) -> str | None:
        """
        Create a new social group.
        
        Args:
            leader_id: ID of the group leader
            group_name: Name of the group
            group_type: Type of group
            member_ids: List of member IDs (optional)
            
        Returns:
            Group ID if successful, None otherwise
        """
        leader_entity = self.world.get_entity(leader_id)
        if not leader_entity:
            return None

        leader_social_comp = leader_entity.get_component(SocialComponent)
        if not leader_social_comp:
            return None

        # Check if leader is already in a group
        if leader_social_comp.current_groups:
            return None

        # Create group
        group_id = f"group_{self.total_groups_created}_{leader_id}"
        
        if member_ids is None:
            member_ids = [leader_id]
        elif leader_id not in member_ids:
            member_ids.append(leader_id)

        group = SocialGroup(
            id=group_id,
            name=group_name,
            group_type=group_type,
            leader_id=leader_id,
            member_ids=member_ids,
            created_at=leader_social_comp.last_update,
            activity_level=0.5,
            cohesion=0.5,
            influence=0.3
        )

        # Add group to system
        self.social_groups[group_id] = group

        # Update member social components
        for member_id in member_ids:
            member_entity = self.world.get_entity(member_id)
            if member_entity:
                member_social_comp = member_entity.get_component(SocialComponent)
                if member_social_comp:
                    role = SocialRole.LEADER if member_id == leader_id else SocialRole.MEMBER
                    member_social_comp.join_group(group_id, role)

        self.total_groups_created += 1
        return group_id

    def disband_group(self, group_id: str) -> bool:
        """
        Disband a social group.
        
        Args:
            group_id: ID of the group to disband
            
        Returns:
            True if successful, False otherwise
        """
        if group_id not in self.social_groups:
            return False

        group = self.social_groups[group_id]

        # Update member social components
        for member_id in group.member_ids:
            member_entity = self.world.get_entity(member_id)
            if member_entity:
                member_social_comp = member_entity.get_component(SocialComponent)
                if member_social_comp:
                    member_social_comp.leave_group(group_id)

        # Remove group
        del self.social_groups[group_id]
        return True

    def get_group_info(self, group_id: str) -> Dict[str, Any] | None:
        """Get information about a specific group."""
        if group_id not in self.social_groups:
            return None

        group = self.social_groups[group_id]
        return {
            "id": group.id,
            "name": group.name,
            "group_type": group.group_type.value,
            "leader_id": group.leader_id,
            "member_ids": group.member_ids,
            "member_count": len(group.member_ids),
            "activity_level": group.activity_level,
            "cohesion": group.cohesion,
            "influence": group.influence,
            "created_at": group.created_at.isoformat()
        }
