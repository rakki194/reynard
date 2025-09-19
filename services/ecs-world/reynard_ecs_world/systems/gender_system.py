"""
Gender identity and expression system for the ECS world.

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
from typing import Dict, List, Optional, Set

from ..components.gender import (
    GenderComponent,
    GenderExpression,
    GenderIdentity,
    GenderProfile,
    PronounSet,
)
from ..components.social import SocialComponent
from ..core.system import System

logger = logging.getLogger(__name__)


class GenderSystem(System):
    """System for managing gender identity and expression."""
    
    def __init__(self, world):
        """Initialize the gender system."""
        super().__init__(world)
        self.system_name = "GenderSystem"
        
        # Gender identity statistics
        self.identity_distribution: Dict[GenderIdentity, int] = {}
        self.expression_distribution: Dict[GenderExpression, int] = {}
        self.pronoun_usage: Dict[str, int] = {}
        
        # Support network statistics
        self.support_networks: Dict[str, Set[str]] = {}
        self.coming_out_events: List[Dict] = []
        
        # Gender-based interaction statistics
        self.gender_interactions: Dict[str, int] = {}
        self.expression_confidence_changes: List[Dict] = {}
        
        logger.info("GenderSystem initialized")
    
    def update(self, delta_time: float):
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
    
    def _process_gender_fluidity(self, delta_time: float) -> None:  # noqa: ARG002
        """Process gender fluidity and identity changes."""
        entities = self.get_entities_with_components(GenderComponent)
        
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            
            if not gender_comp.profile.is_identity_fluid():
                continue
            
            # Simulate potential identity changes based on fluidity rate
            if random.random() < gender_comp.profile.fluidity_rate * 0.01:  # Very low probability
                self._simulate_identity_change(entity, gender_comp)
    
    def _simulate_identity_change(self, entity, gender_comp: GenderComponent) -> None:
        """Simulate a potential gender identity change."""
        current_identity = gender_comp.profile.primary_identity
        
        # Get possible identities (excluding current)
        possible_identities = [id for id in GenderIdentity if id != current_identity]
        
        if not possible_identities:
            return
        
        # Choose new identity (weighted towards similar identities)
        new_identity = random.choice(possible_identities)
        
        # Update identity
        gender_comp.profile.update_identity(new_identity)
        
        # Log the change
        logger.info("Agent %s gender identity changed from %s to %s", 
                   entity.id, current_identity.value, new_identity.value)
        
        # Record the change
        event = {
            "agent_id": entity.id,
            "event_type": "identity_change",
            "old_identity": current_identity.value,
            "new_identity": new_identity.value,
            "timestamp": datetime.now().isoformat()
        }
        self.coming_out_events.append(event)
    
    def _process_expression_confidence(self, delta_time: float) -> None:  # noqa: ARG002
        """Process gender expression confidence changes."""
        entities = self.get_entities_with_components(GenderComponent)
        
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            
            # Confidence can change based on social interactions and support
            confidence_change = 0.0
            
            # Positive factors
            if gender_comp.profile.support_network:
                confidence_change += 0.001  # Support network boosts confidence
            
            if gender_comp.euphoria_level > 0.5:
                confidence_change += 0.002  # Euphoria boosts confidence
            
            # Negative factors
            if gender_comp.dysphoria_level > 0.5:
                confidence_change -= 0.001  # Dysphoria reduces confidence
            
            if gender_comp.social_comfort < 0.3:
                confidence_change -= 0.001  # Low social comfort reduces confidence
            
            # Apply confidence change
            if confidence_change != 0.0:
                gender_comp.update_expression_confidence(confidence_change)
                
                # Record significant changes
                if abs(confidence_change) > 0.01:
                    change_event = {
                        "agent_id": entity.id,
                        "change": confidence_change,
                        "new_confidence": gender_comp.expression_confidence,
                        "timestamp": datetime.now().isoformat()
                    }
                    self.expression_confidence_changes.append(change_event)
    
    def _process_social_gender_dynamics(self, delta_time: float) -> None:  # noqa: ARG002
        """Process gender-related social dynamics."""
        entities = self.get_entities_with_components(GenderComponent)
        
        # Process gender-based interactions
        for i, entity1 in enumerate(entities):
            gender_comp1 = entity1.get_component(GenderComponent)
            social_comp1 = entity1.get_component(SocialComponent)
            
            if not social_comp1:
                continue
            
            for entity2 in entities[i+1:]:
                gender_comp2 = entity2.get_component(GenderComponent)
                social_comp2 = entity2.get_component(SocialComponent)
                
                if not social_comp2:
                    continue
                
                # Check if agents are in proximity
                if self._are_agents_in_proximity(entity1, entity2):
                    self._process_gender_interaction(entity1, entity2, gender_comp1, gender_comp2)
    
    def _are_agents_in_proximity(self, entity1, entity2) -> bool:  # noqa: ARG002
        """Check if two agents are in proximity for gender interactions."""
        # This would integrate with the spatial system
        # For now, assume all agents are in proximity
        return True
    
    def _process_gender_interaction(self, entity1, entity2, gender_comp1: GenderComponent, gender_comp2: GenderComponent) -> None:  # noqa: ARG002
        """Process gender-related interactions between two agents."""
        # Check for mutual support
        if (entity1.id in gender_comp2.profile.support_network and 
            entity2.id in gender_comp1.profile.support_network):
            
            # Mutual support boosts both agents
            gender_comp1.update_expression_confidence(0.001)
            gender_comp2.update_expression_confidence(0.001)
            gender_comp1.update_euphoria(0.001)
            gender_comp2.update_euphoria(0.001)
            
            # Record the interaction
            interaction_key = f"{entity1.id}-{entity2.id}"
            self.gender_interactions[interaction_key] = self.gender_interactions.get(interaction_key, 0) + 1
    
    def _update_gender_statistics(self) -> None:
        """Update gender identity and expression statistics."""
        entities = self.get_entities_with_components(GenderComponent)
        
        # Reset statistics
        self.identity_distribution = {identity: 0 for identity in GenderIdentity}
        self.expression_distribution = {expression: 0 for expression in GenderExpression}
        self.pronoun_usage = {}
        
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            
            # Count identity distribution
            self.identity_distribution[gender_comp.profile.primary_identity] += 1
            
            # Count expression distribution
            self.expression_distribution[gender_comp.profile.expression_style] += 1
            
            # Count pronoun usage
            if gender_comp.profile.preferred_pronouns:
                pronoun_key = gender_comp.profile.preferred_pronouns.subject
                self.pronoun_usage[pronoun_key] = self.pronoun_usage.get(pronoun_key, 0) + 1
    
    def _process_support_networks(self, delta_time: float) -> None:  # noqa: ARG002
        """Process support network dynamics."""
        entities = self.get_entities_with_components(GenderComponent)
        
        for entity in entities:
            gender_comp = entity.get_component(GenderComponent)
            
            # Update support network statistics
            self.support_networks[entity.id] = gender_comp.profile.support_network.copy()
    
    def create_gender_profile(self, agent_id: str, primary_identity: GenderIdentity, 
                            expression_style: GenderExpression = GenderExpression.NEUTRAL,
                            pronoun_sets: Optional[List[PronounSet]] = None,
                            is_fluid: bool = False) -> GenderProfile:
        """Create a new gender profile for an agent."""
        profile = GenderProfile(
            primary_identity=primary_identity,
            expression_style=expression_style,
            pronoun_sets=pronoun_sets or [],
            is_fluid=is_fluid
        )
        
        logger.info("Created gender profile for agent %s: %s", agent_id, primary_identity.value)
        return profile
    
    def update_gender_identity(self, agent_id: str, new_identity: GenderIdentity) -> bool:
        """Update an agent's gender identity."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False
        
        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False
        
        old_identity = gender_comp.profile.primary_identity
        gender_comp.profile.update_identity(new_identity)
        
        logger.info("Updated gender identity for agent %s: %s -> %s", 
                   agent_id, old_identity.value, new_identity.value)
        
        return True
    
    def add_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """Add a support agent to an agent's support network."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False
        
        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False
        
        gender_comp.profile.add_support_agent(support_agent_id)
        
        logger.info("Added support agent %s to agent %s's support network", 
                   support_agent_id, agent_id)
        
        return True
    
    def remove_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """Remove a support agent from an agent's support network."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False
        
        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False
        
        gender_comp.profile.remove_support_agent(support_agent_id)
        
        logger.info("Removed support agent %s from agent %s's support network", 
                   support_agent_id, agent_id)
        
        return True
    
    def update_coming_out_status(self, agent_id: str, other_agent_id: str, knows: bool) -> bool:
        """Update who knows about an agent's gender identity."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return False
        
        gender_comp = entity.get_component(GenderComponent)
        if not gender_comp:
            return False
        
        gender_comp.profile.update_coming_out_status(other_agent_id, knows)
        
        # Record coming out event
        self.coming_out_events.append({
            "agent_id": agent_id,
            "other_agent_id": other_agent_id,
            "event_type": "coming_out" if knows else "privacy_update",
            "knows": knows,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info("Updated coming out status for agent %s: %s knows=%s", 
                   agent_id, other_agent_id, knows)
        
        return True
    
    def get_gender_statistics(self) -> Dict:
        """Get comprehensive gender system statistics."""
        entities = self.get_entities_with_components(GenderComponent)
        
        total_agents = len(entities)
        if total_agents == 0:
            return {
                "total_agents": 0,
                "identity_distribution": {},
                "expression_distribution": {},
                "pronoun_usage": {},
                "support_networks": {},
                "coming_out_events": len(self.coming_out_events),
                "gender_interactions": len(self.gender_interactions),
                "expression_confidence_changes": len(self.expression_confidence_changes)
            }
        
        # Calculate averages
        avg_confidence = sum(gc.expression_confidence for gc in 
                           [e.get_component(GenderComponent) for e in entities]) / total_agents
        avg_wellbeing = sum(gc.get_gender_wellbeing() for gc in 
                          [e.get_component(GenderComponent) for e in entities]) / total_agents
        avg_support_network_size = sum(len(gc.profile.support_network) for gc in 
                                     [e.get_component(GenderComponent) for e in entities]) / total_agents
        
        return {
            "total_agents": total_agents,
            "identity_distribution": {k.value: v for k, v in self.identity_distribution.items()},
            "expression_distribution": {k.value: v for k, v in self.expression_distribution.items()},
            "pronoun_usage": self.pronoun_usage,
            "support_networks": {k: list(v) for k, v in self.support_networks.items()},
            "coming_out_events": len(self.coming_out_events),
            "gender_interactions": len(self.gender_interactions),
            "expression_confidence_changes": len(self.expression_confidence_changes),
            "average_expression_confidence": avg_confidence,
            "average_gender_wellbeing": avg_wellbeing,
            "average_support_network_size": avg_support_network_size
        }
    
    def get_agent_gender_info(self, agent_id: str) -> Optional[Dict]:
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
            "secondary_identities": [id.value for id in gender_comp.profile.secondary_identities],
            "expression_style": gender_comp.profile.expression_style.value,
            "pronoun_sets": [
                {
                    "subject": ps.subject,
                    "object": ps.object,
                    "possessive": ps.possessive,
                    "reflexive": ps.reflexive
                } for ps in gender_comp.profile.pronoun_sets
            ],
            "preferred_pronouns": {
                "subject": gender_comp.profile.preferred_pronouns.subject,
                "object": gender_comp.profile.preferred_pronouns.object,
                "possessive": gender_comp.profile.preferred_pronouns.possessive,
                "reflexive": gender_comp.profile.preferred_pronouns.reflexive
            } if gender_comp.profile.preferred_pronouns else None,
            "custom_pronouns": gender_comp.profile.custom_pronouns,
            "gender_description": gender_comp.profile.gender_description,
            "is_questioning": gender_comp.profile.is_questioning,
            "is_fluid": gender_comp.profile.is_fluid,
            "fluidity_rate": gender_comp.profile.fluidity_rate,
            "confidence_level": gender_comp.profile.confidence_level,
            "coming_out_status": gender_comp.profile.coming_out_status,
            "support_network": list(gender_comp.profile.support_network),
            "gender_energy": gender_comp.gender_energy,
            "expression_confidence": gender_comp.expression_confidence,
            "dysphoria_level": gender_comp.dysphoria_level,
            "euphoria_level": gender_comp.euphoria_level,
            "social_comfort": gender_comp.social_comfort,
            "transition_stage": gender_comp.transition_stage,
            "transition_goals": gender_comp.transition_goals,
            "support_needs": gender_comp.support_needs,
            "gender_wellbeing": gender_comp.get_gender_wellbeing(),
            "expression_readiness": gender_comp.get_expression_readiness(),
            "needs_support": gender_comp.needs_support(),
            "is_transitioning": gender_comp.is_transitioning(),
            "created_at": gender_comp.created_at.isoformat(),
            "last_updated": gender_comp.last_updated.isoformat()
        }
