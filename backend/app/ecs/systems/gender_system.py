"""Gender identity and expression system for the ECS world.

This system manages:
- Gender identity development and fluidity
- Gender expression and confidence
- Social dynamics related to gender
- Support networks and coming out processes
- Gender-based interactions and relationships
"""

import logging
import random
from datetime import datetime
from typing import TYPE_CHECKING

from ..components.gender import (
    GenderComponent,
    GenderExpression,
    GenderIdentity,
    PronounSet,
)
from ..core.system import System

if TYPE_CHECKING:
    from ..core.entity import Entity
    from ..core.world import ECSWorld

logger = logging.getLogger(__name__)


class GenderSystem(System):
    """System for managing gender identity and expression."""

    def __init__(self, world: "ECSWorld") -> None:
        """Initialize the gender system."""
        super().__init__(world)
        self.system_name = "GenderSystem"

        # Gender identity statistics
        self.identity_distribution: dict[GenderIdentity, int] = {}
        self.expression_distribution: dict[GenderExpression, int] = {}
        self.pronoun_usage: dict[str, int] = {}

        # Support network statistics
        self.support_networks: dict[str, set[str]] = {}
        self.coming_out_events: list[dict] = []

        # Gender-based interaction statistics
        self.gender_interactions: dict[str, int] = {}
        self.expression_confidence_changes: list[dict] = []

        logger.info("GenderSystem initialized")

    def update(self, delta_time: float) -> None:
        """Update gender-related dynamics."""
        entities = self.get_entities_with_components(GenderComponent)

        if not entities:
            return

        # Process gender fluidity and identity changes
        self._process_gender_fluidity(delta_time)

        # Process gender expression confidence
        self._process_expression_confidence(delta_time)

        # Process social gender dynamics
        self._process_social_gender_dynamics(delta_time)

        # Update statistics
        self._update_gender_statistics()

        # Process support network dynamics
        self._process_support_networks(delta_time)

        logger.debug("GenderSystem updated for %d entities", len(entities))

    def _process_gender_fluidity(self, delta_time: float) -> None:
        """Process gender fluidity and identity changes."""
        entities = self.get_entities_with_components(GenderComponent)

        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            if not gender_comp:
                continue

            if not gender_comp.profile.is_identity_fluid():
                continue

            # Simulate potential identity changes based on fluidity rate and time
            # Higher delta_time means more time has passed, increasing chance of change
            time_adjusted_rate = gender_comp.profile.fluidity_rate * delta_time * 0.001
            if random.random() < time_adjusted_rate:
                self._simulate_identity_change(entity, gender_comp)

    def _simulate_identity_change(
        self, entity: "Entity", gender_comp: GenderComponent,
    ) -> None:
        """Simulate a potential gender identity change."""
        current_identity = gender_comp.profile.primary_identity

        # Get possible identities (excluding current)
        possible_identities = [id for id in GenderIdentity if id != current_identity]

        if not possible_identities:
            return

        # Choose new identity based on fluidity preferences
        new_identity = random.choice(possible_identities)

        # Update identity
        gender_comp.profile.update_identity(new_identity)

        # Update pronouns if needed
        self._update_pronouns_for_identity(gender_comp, new_identity)

        # Log the change
        logger.info("Gender identity change: %s -> %s", entity.id, new_identity.value)

        # Record the change
        self.expression_confidence_changes.append(
            {
                "entity_id": entity.id,
                "change_type": "identity_change",
                "old_identity": current_identity.value,
                "new_identity": new_identity.value,
                "timestamp": datetime.now().isoformat(),
            },
        )

    def _update_pronouns_for_identity(
        self, gender_comp: GenderComponent, identity: GenderIdentity,
    ) -> None:
        """Update pronouns based on gender identity."""
        # This is a simplified mapping - in reality, pronouns are personal choice
        pronoun_mapping = {
            GenderIdentity.MALE: PronounSet("he", "him", "his", "himself"),
            GenderIdentity.FEMALE: PronounSet("she", "her", "hers", "herself"),
            GenderIdentity.NON_BINARY: PronounSet(
                "they", "them", "theirs", "themselves",
            ),
            GenderIdentity.GENDERFLUID: PronounSet(
                "they", "them", "theirs", "themselves",
            ),
            GenderIdentity.AGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.DEMIGENDER: PronounSet(
                "they", "them", "theirs", "themselves",
            ),
            GenderIdentity.BIGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.QUESTIONING: PronounSet(
                "they", "them", "theirs", "themselves",
            ),
            GenderIdentity.OTHER: PronounSet("they", "them", "theirs", "themselves"),
        }

        if identity in pronoun_mapping:
            gender_comp.profile.set_preferred_pronouns(pronoun_mapping[identity])

    def _process_expression_confidence(self, delta_time: float) -> None:
        """Process gender expression confidence changes."""
        entities = self.get_entities_with_components(GenderComponent)

        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            if not gender_comp:
                continue

            # Simulate confidence changes based on social support and time
            support_level = self._calculate_support_level(entity, None)

            # Confidence changes over time based on support level
            # Time-based adjustment makes changes more gradual and realistic
            confidence_change = (support_level - 0.5) * delta_time * 0.001
            gender_comp.expression_confidence = max(
                0.0,
                min(
                    1.0,
                    gender_comp.expression_confidence + confidence_change,
                ),
            )

    def _calculate_support_level(self, entity: "Entity", social_comp: None) -> float:
        """Calculate the level of social support for an agent."""
        # Get support network from gender component
        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return 0.5

        support_agents = gender_comp.profile.support_network
        if not support_agents:
            return 0.5

        # Calculate average relationship strength with support agents
        total_strength = 0.0
        valid_relationships = 0

        for support_agent_id in support_agents:
            # For now, assume positive relationships with support agents
            # In a full implementation, this would check actual relationship strength
            total_strength += 0.8  # Assume strong positive relationship
            valid_relationships += 1

        if valid_relationships == 0:
            return 0.5

        return total_strength / valid_relationships

    def _process_social_gender_dynamics(self, delta_time: float) -> None:
        """Process social dynamics related to gender."""
        entities = self.get_entities_with_components(GenderComponent)

        # Process social dynamics less frequently to avoid excessive computation
        # Only process every 5 seconds of simulation time
        if delta_time > 0.05:  # Threshold for social dynamics processing
            for entity in entities:
                gender_comp = entity.get_component(GenderComponent)
                if not gender_comp:
                    continue

                # Process coming out events
                if self._should_come_out(entity, gender_comp):
                    self._process_coming_out(entity, gender_comp)

                # Process gender-based interactions
                self._process_gender_interactions(entity, gender_comp)

    def _should_come_out(self, entity: "Entity", gender_comp: GenderComponent) -> bool:
        """Check if an agent should come out about their gender identity."""
        # Check if already out (using coming_out_status)
        if gender_comp.profile.coming_out_status.get("general", False):
            return False

        # Check confidence level
        if gender_comp.expression_confidence < 0.6:
            return False

        # Check social support
        support_level = self._calculate_support_level(
            entity, None,
        )  # Simplified for now
        if support_level < 0.5:
            return False

        # Random chance based on confidence and support
        come_out_chance = (
            (gender_comp.expression_confidence + support_level) / 2.0 * 0.001
        )
        return random.random() < come_out_chance

    def _process_coming_out(
        self, entity: "Entity", gender_comp: GenderComponent,
    ) -> None:
        """Process a coming out event."""
        # Update coming out status
        gender_comp.profile.update_coming_out_status("general", True)

        # Log the event
        logger.info("Coming out event: %s", entity.id)

        # Record the event
        self.coming_out_events.append(
            {
                "entity_id": entity.id,
                "gender_identity": gender_comp.profile.primary_identity.value,
                "expression": gender_comp.profile.expression_style.value,
                "pronouns": (
                    gender_comp.profile.preferred_pronouns.subject
                    if gender_comp.profile.preferred_pronouns
                    else "they"
                ),
                "timestamp": datetime.now().isoformat(),
            },
        )

        # Update social relationships based on coming out
        self._update_relationships_after_coming_out(entity)

    def _update_relationships_after_coming_out(self, entity: "Entity") -> None:
        """Update social relationships after coming out."""
        # This would typically involve updating relationships based on how others react
        # For now, we'll just log the event
        logger.debug("Updating relationships after coming out for %s", entity.id)

    def _process_gender_interactions(
        self, entity: "Entity", gender_comp: GenderComponent,
    ) -> None:
        """Process gender-based interactions."""
        # Find nearby agents for gender-based interactions
        nearby_entities = self._find_nearby_agents(entity)

        for nearby_entity in nearby_entities:
            nearby_gender_comp = nearby_entity.get_component(GenderComponent)
            if not nearby_gender_comp:
                continue

            # Check if gender-based interaction should occur
            if self._should_have_gender_interaction(gender_comp, nearby_gender_comp):
                self._process_gender_interaction(
                    entity, nearby_entity, gender_comp, nearby_gender_comp,
                )

    def _find_nearby_agents(self, entity: "Entity") -> list["Entity"]:
        """Find nearby agents for gender-based interactions."""
        # This would typically use position components
        # For now, return all other entities with gender components
        all_entities = self.get_entities_with_components(GenderComponent)
        return [e for e in all_entities if e.id != entity.id]

    def _should_have_gender_interaction(
        self, gender_comp1: GenderComponent, gender_comp2: GenderComponent,
    ) -> bool:
        """Check if two agents should have a gender-based interaction."""
        # Very low probability for gender-based interactions
        return random.random() < 0.001

    def _process_gender_interaction(
        self,
        entity1: "Entity",
        entity2: "Entity",
        gender_comp1: GenderComponent,
        gender_comp2: GenderComponent,
    ) -> None:
        """Process a gender-based interaction between two agents."""
        # Log the interaction
        logger.debug("Gender interaction between %s and %s", entity1.id, entity2.id)

        # Record the interaction
        interaction_key = f"{entity1.id}_{entity2.id}"
        self.gender_interactions[interaction_key] = (
            self.gender_interactions.get(interaction_key, 0) + 1
        )

    def _process_support_networks(self, delta_time: float) -> None:
        """Process support network dynamics."""
        entities = self.get_entities_with_components(GenderComponent)

        # Only update support networks periodically to avoid excessive processing
        # Update every 10 seconds of simulation time
        if delta_time > 0.1:  # Threshold for periodic updates
            for entity in entities:
                gender_comp = entity.get_component(GenderComponent)
                if not gender_comp:
                    continue

                # Update support networks based on social relationships
                self._update_support_network(gender_comp)

    def _update_support_network(self, gender_comp: GenderComponent) -> None:
        """Update support network for an agent."""
        # For now, this is a simplified implementation
        # In a full implementation, this would check actual social relationships
        # and add supportive agents to the support network

        # Find other entities that could be support agents
        all_entities = self.get_entities_with_components(GenderComponent)
        support_candidates = []

        for other_entity in all_entities:
            # Add some agents to support network (simplified)
            support_candidates.append(other_entity.id)

        # Limit to 5 support agents and update the network
        for agent_id in support_candidates[:5]:
            gender_comp.profile.add_support_agent(agent_id)

    def _update_gender_statistics(self) -> None:
        """Update gender-related statistics."""
        entities = self.get_entities_with_components(GenderComponent)

        # Reset distributions
        self.identity_distribution = dict.fromkeys(GenderIdentity, 0)
        self.expression_distribution = dict.fromkeys(GenderExpression, 0)
        self.pronoun_usage = {}

        # Count distributions
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            if not gender_comp:
                continue

            # Count identities
            self.identity_distribution[gender_comp.profile.primary_identity] += 1

            # Count expressions
            self.expression_distribution[gender_comp.profile.expression_style] += 1

            # Count pronouns
            pronoun_key = (
                gender_comp.profile.preferred_pronouns.subject
                if gender_comp.profile.preferred_pronouns
                else "they"
            )
            self.pronoun_usage[pronoun_key] = self.pronoun_usage.get(pronoun_key, 0) + 1

    def get_system_stats(self) -> dict:
        """Get comprehensive system statistics."""
        total_agents = len(self.get_entities_with_components(GenderComponent))

        return {
            "total_agents_with_gender": total_agents,
            "identity_distribution": {
                k.value: v for k, v in self.identity_distribution.items()
            },
            "expression_distribution": {
                k.value: v for k, v in self.expression_distribution.items()
            },
            "pronoun_usage": self.pronoun_usage,
            "coming_out_events": len(self.coming_out_events),
            "gender_interactions": len(self.gender_interactions),
            "support_networks": len(self.support_networks),
        }

    def get_agent_gender_info(self, agent_id: str) -> dict | None:
        """Get gender information for a specific agent."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return None

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return None

        return {
            "agent_id": agent_id,
            "primary_identity": gender_comp.profile.primary_identity.value,
            "secondary_identities": [
                id.value for id in gender_comp.profile.secondary_identities
            ],
            "primary_expression": gender_comp.profile.expression_style.value,
            "pronouns": (
                gender_comp.profile.preferred_pronouns.subject
                if gender_comp.profile.preferred_pronouns
                else "they"
            ),
            "expression_confidence": gender_comp.expression_confidence,
            "is_out": gender_comp.profile.coming_out_status.get("general", False),
            "support_agents": list(gender_comp.profile.support_network),
            "gender_wellbeing": gender_comp.get_gender_wellbeing(),
        }

    def update_agent_gender_identity(
        self, agent_id: str, new_identity: GenderIdentity,
    ) -> bool:
        """Update an agent's gender identity."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        # Update identity
        gender_comp.profile.update_identity(new_identity)

        # Update pronouns
        self._update_pronouns_for_identity(gender_comp, new_identity)

        # Log the change
        logger.info(
            "Manual gender identity change: %s -> %s", agent_id, new_identity.value,
        )

        return True

    def update_agent_gender_expression(
        self, agent_id: str, new_expression: GenderExpression,
    ) -> bool:
        """Update an agent's gender expression."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        # Update expression
        gender_comp.profile.expression_style = new_expression

        # Log the change
        logger.info(
            "Gender expression change: %s -> %s", agent_id, new_expression.value,
        )

        return True

    def add_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """Add a support agent to an agent's support network."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        # Add support agent
        if support_agent_id not in gender_comp.profile.support_network:
            gender_comp.profile.add_support_agent(support_agent_id)
            return True

        return False

    def remove_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """Remove a support agent from an agent's support network."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        # Remove support agent
        if support_agent_id in gender_comp.profile.support_network:
            gender_comp.profile.remove_support_agent(support_agent_id)
            return True

        return False

    def update_coming_out_status(
        self, agent_id: str, other_agent_id: str, knows: bool,
    ) -> bool:
        """Update who knows about an agent's gender identity."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False

        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False

        # Update coming out status for specific agent
        gender_comp.profile.update_coming_out_status(other_agent_id, knows)

        # Log the change
        logger.info(
            "Coming out status update: %s -> %s (knows: %s)",
            agent_id,
            other_agent_id,
            knows,
        )

        return True

    def get_gender_statistics(self) -> dict:
        """Get comprehensive gender system statistics."""
        return self.get_system_stats()
