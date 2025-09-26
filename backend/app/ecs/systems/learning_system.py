"""Learning System

Manages knowledge acquisition, sharing, and transfer between agents
in the ECS world.
"""

import logging
import random
from typing import Any

from ..components.knowledge import (
    Knowledge,
    KnowledgeComponent,
    LearningMethod,
)
from ..components.social import SocialComponent
from ..core.system import System

logger = logging.getLogger(__name__)


class LearningSystem(System):
    """System for managing knowledge acquisition, sharing, and transfer.

    Handles learning opportunities, knowledge transfer between agents,
    teaching sessions, and knowledge decay over time.
    """

    def __init__(self, world: Any) -> None:
        """Initialize the learning system.

        Args:
            world: The ECS world this system belongs to

        """
        super().__init__(world)
        self.processing_interval = 3.0  # Process learning every 3 seconds
        self.last_processing_time = 0.0
        self.total_knowledge_transfers = 0
        self.total_teaching_sessions = 0
        self.total_learning_sessions = 0
        self.knowledge_sharing_radius = 50.0  # Distance for knowledge sharing

    def update(self, delta_time: float) -> None:
        """Process learning dynamics for all agents.

        Args:
            delta_time: Time elapsed since last update

        """
        self.last_processing_time += delta_time

        # Process learning dynamics at regular intervals
        if self.last_processing_time >= self.processing_interval:
            self._process_learning_dynamics(delta_time)
            self.last_processing_time = 0.0

        # Update knowledge decay for all agents
        self._update_knowledge_decay(delta_time)

    def _process_learning_dynamics(self, delta_time: float) -> None:  # noqa: ARG002
        """Process learning dynamics including knowledge transfer and teaching."""
        entities = self.get_entities_with_components(KnowledgeComponent)

        # Process knowledge sharing opportunities
        self._process_knowledge_sharing(entities)

        # Process teaching sessions
        self._process_teaching_sessions(entities)

        # Process learning opportunities
        self._process_learning_opportunities(entities)

        # Clean up expired learning opportunities
        self._cleanup_expired_opportunities(entities)

    def _process_knowledge_sharing(self, entities: list[Any]) -> None:
        """Process knowledge sharing between nearby agents."""
        for i, entity1 in enumerate(entities):
            knowledge_comp1 = entity1.get_component(KnowledgeComponent)
            social_comp1 = entity1.get_component(SocialComponent)

            if not knowledge_comp1 or not social_comp1:
                continue

            # Find nearby agents
            for entity2 in entities[i + 1 :]:
                knowledge_comp2 = entity2.get_component(KnowledgeComponent)
                social_comp2 = entity2.get_component(SocialComponent)

                if not knowledge_comp2 or not social_comp2:
                    continue

                # Check if agents are in proximity
                if self._are_agents_in_proximity(entity1, entity2):
                    self._attempt_knowledge_sharing(
                        entity1,
                        entity2,
                        knowledge_comp1,
                        knowledge_comp2,
                    )

    def _process_teaching_sessions(self, entities: list[Any]) -> None:
        """Process formal teaching sessions between agents."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            social_comp = entity.get_component(SocialComponent)

            if not knowledge_comp or not social_comp:
                continue

            # Check if agent wants to teach
            if self._should_agent_teach(entity, knowledge_comp, social_comp):
                self._initiate_teaching_session(entity, knowledge_comp, social_comp)

    def _process_learning_opportunities(self, entities: list[Any]) -> None:
        """Process learning opportunities for agents."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            social_comp = entity.get_component(SocialComponent)

            if not knowledge_comp or not social_comp:
                continue

            # Check if agent wants to learn
            if self._should_agent_learn(entity, knowledge_comp, social_comp):
                self._seek_learning_opportunities(entity, knowledge_comp, social_comp)

    def _cleanup_expired_opportunities(self, entities: list[Any]) -> None:
        """Clean up expired learning opportunities."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue

            # Remove expired opportunities
            expired_opportunities = [
                opp_id
                for opp_id, opportunity in knowledge_comp.learning_opportunities.items()
                if opportunity.is_expired()
            ]

            for opp_id in expired_opportunities:
                del knowledge_comp.learning_opportunities[opp_id]

    def _are_agents_in_proximity(self, entity1: Any, entity2: Any) -> bool:
        """Check if two agents are in proximity for knowledge sharing."""
        # This would typically check position components
        # For now, return True to allow knowledge sharing
        return True

    def _attempt_knowledge_sharing(
        self,
        entity1: Any,
        entity2: Any,
        knowledge_comp1: KnowledgeComponent,
        knowledge_comp2: KnowledgeComponent,
    ) -> None:
        """Attempt to share knowledge between two agents."""
        # Find knowledge that entity1 can share with entity2
        shareable_knowledge = self._find_shareable_knowledge(
            knowledge_comp1,
            knowledge_comp2,
        )

        if shareable_knowledge:
            # Attempt to transfer knowledge
            success = self._transfer_knowledge(
                entity1,
                entity2,
                shareable_knowledge,
                knowledge_comp1,
                knowledge_comp2,
            )

            if success:
                self.total_knowledge_transfers += 1
                logger.debug(f"Knowledge shared between {entity1.id} and {entity2.id}")

    def _find_shareable_knowledge(
        self,
        source_comp: KnowledgeComponent,
        target_comp: KnowledgeComponent,
    ) -> Knowledge | None:
        """Find knowledge that can be shared from source to target."""
        for knowledge in source_comp.knowledge.values():
            # Check if knowledge can be taught
            if not knowledge.can_teach():
                continue

            # Check if target doesn't already have this knowledge
            if self._target_has_knowledge(target_comp, knowledge):
                continue

            # Check if target meets prerequisites
            if not self._target_meets_prerequisites(target_comp, knowledge):
                continue

            return knowledge

        return None

    def _target_has_knowledge(
        self,
        target_comp: KnowledgeComponent,
        knowledge: Knowledge,
    ) -> bool:
        """Check if target agent already has similar knowledge."""
        for existing_knowledge in target_comp.knowledge.values():
            if (
                existing_knowledge.title.lower() == knowledge.title.lower()
                or existing_knowledge.knowledge_type == knowledge.knowledge_type
            ):
                return True
        return False

    def _target_meets_prerequisites(
        self,
        target_comp: KnowledgeComponent,
        knowledge: Knowledge,
    ) -> bool:
        """Check if target agent meets knowledge prerequisites."""
        if not knowledge.prerequisites:
            return True

        for prereq_id in knowledge.prerequisites:
            if prereq_id not in target_comp.knowledge:
                return False

        return True

    def _transfer_knowledge(
        self,
        source_entity: Any,
        target_entity: Any,
        knowledge: Knowledge,
        source_comp: KnowledgeComponent,
        target_comp: KnowledgeComponent,
    ) -> bool:
        """Transfer knowledge from source to target agent."""
        # Calculate transfer effectiveness
        teaching_effectiveness = knowledge.get_teaching_effectiveness()
        learning_effectiveness = target_comp.learning_rate

        # Apply social factors
        social_comp = target_entity.get_component(SocialComponent)
        if social_comp:
            # Higher effectiveness for positive relationships
            relationship = social_comp.get_relationship(source_entity.id)
            if relationship and relationship.is_positive_relationship():
                learning_effectiveness *= 1.2

        # Calculate final proficiency
        base_proficiency = 0.1  # Minimum proficiency from learning
        max_proficiency = min(
            0.8,
            knowledge.proficiency * 0.9,
        )  # Can't exceed teacher's level
        final_proficiency = (
            base_proficiency
            + (max_proficiency - base_proficiency)
            * teaching_effectiveness
            * learning_effectiveness
        )

        # Create new knowledge for target
        new_knowledge_id = target_comp.acquire_knowledge(
            title=knowledge.title,
            knowledge_type=knowledge.knowledge_type,
            description=knowledge.description,
            proficiency=final_proficiency,
            confidence=0.5,  # Lower confidence for learned knowledge
            learning_method=LearningMethod.TEACHING,
            source_agent=source_entity.id,
            tags=knowledge.tags.copy(),
            prerequisites=knowledge.prerequisites.copy(),
            applications=knowledge.applications.copy(),
            difficulty=knowledge.difficulty,
            importance=knowledge.importance,
            transferability=knowledge.transferability,
        )

        return new_knowledge_id is not None

    def _should_agent_teach(
        self,
        entity: Any,
        knowledge_comp: KnowledgeComponent,
        social_comp: SocialComponent,
    ) -> bool:
        """Check if an agent should initiate a teaching session."""
        # Check if agent has knowledge to teach
        teachable_knowledge = [
            k for k in knowledge_comp.knowledge.values() if k.can_teach()
        ]

        if not teachable_knowledge:
            return False

        # Check social energy and willingness
        if social_comp.social_energy < 0.3:
            return False

        # Random chance based on teaching effectiveness
        teaching_chance = knowledge_comp.teaching_effectiveness * 0.1
        return random.random() < teaching_chance

    def _should_agent_learn(
        self,
        entity: Any,
        knowledge_comp: KnowledgeComponent,
        social_comp: SocialComponent,
    ) -> bool:
        """Check if an agent should seek learning opportunities."""
        # Check if agent has capacity for more knowledge
        if len(knowledge_comp.knowledge) >= knowledge_comp.knowledge_capacity * 0.9:
            return False

        # Check social energy
        if social_comp.social_energy < 0.2:
            return False

        # Random chance based on learning rate
        learning_chance = knowledge_comp.learning_rate * 0.1
        return random.random() < learning_chance

    def _initiate_teaching_session(
        self,
        entity: Any,
        knowledge_comp: KnowledgeComponent,
        social_comp: SocialComponent,
    ) -> None:
        """Initiate a teaching session for an agent."""
        # Find nearby agents who could benefit from teaching
        nearby_entities = self._find_nearby_agents(entity)

        for target_entity in nearby_entities:
            target_knowledge_comp = target_entity.get_component(KnowledgeComponent)
            if not target_knowledge_comp:
                continue

            # Find knowledge to teach
            teachable_knowledge = self._find_shareable_knowledge(
                knowledge_comp,
                target_knowledge_comp,
            )
            if teachable_knowledge:
                success = self._transfer_knowledge(
                    entity,
                    target_entity,
                    teachable_knowledge,
                    knowledge_comp,
                    target_knowledge_comp,
                )

                if success:
                    self.total_teaching_sessions += 1
                    logger.debug(f"Teaching session initiated by {entity.id}")
                    break

    def _seek_learning_opportunities(
        self,
        entity: Any,
        knowledge_comp: KnowledgeComponent,
        social_comp: SocialComponent,
    ) -> None:
        """Seek learning opportunities for an agent."""
        # Find nearby agents who could teach
        nearby_entities = self._find_nearby_agents(entity)

        for source_entity in nearby_entities:
            source_knowledge_comp = source_entity.get_component(KnowledgeComponent)
            if not source_knowledge_comp:
                continue

            # Find knowledge to learn
            learnable_knowledge = self._find_shareable_knowledge(
                source_knowledge_comp,
                knowledge_comp,
            )
            if learnable_knowledge:
                success = self._transfer_knowledge(
                    source_entity,
                    entity,
                    learnable_knowledge,
                    source_knowledge_comp,
                    knowledge_comp,
                )

                if success:
                    self.total_learning_sessions += 1
                    logger.debug(f"Learning session initiated by {entity.id}")
                    break

    def _find_nearby_agents(self, entity: Any) -> list[Any]:
        """Find nearby agents for interaction."""
        # This would typically use position components to find nearby agents
        # For now, return all other entities with knowledge components
        all_entities = self.get_entities_with_components(KnowledgeComponent)
        return [e for e in all_entities if e.id != entity.id]

    def _update_knowledge_decay(self, delta_time: float) -> None:
        """Update knowledge decay for all agents."""
        entities = self.get_entities_with_components(KnowledgeComponent)

        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue

            # Apply knowledge decay
            for knowledge in knowledge_comp.knowledge.values():
                # Knowledge decays slowly over time if not used
                decay_rate = 0.001 * delta_time  # Very slow decay
                knowledge.proficiency = max(0.0, knowledge.proficiency - decay_rate)

                # Remove knowledge that has decayed too much
                if knowledge.proficiency < 0.01:
                    del knowledge_comp.knowledge[knowledge.id]

    def get_system_stats(self) -> dict[str, Any]:
        """Get comprehensive system statistics."""
        total_agents = len(self.get_entities_with_components(KnowledgeComponent))

        return {
            "total_agents_with_knowledge": total_agents,
            "total_knowledge_transfers": self.total_knowledge_transfers,
            "total_teaching_sessions": self.total_teaching_sessions,
            "total_learning_sessions": self.total_learning_sessions,
            "processing_interval": self.processing_interval,
            "knowledge_sharing_radius": self.knowledge_sharing_radius,
        }

    def force_knowledge_transfer(
        self,
        source_agent_id: str,
        target_agent_id: str,
        knowledge_id: str,
    ) -> bool:
        """Force a knowledge transfer between two agents.

        Args:
            source_agent_id: ID of source agent
            target_agent_id: ID of target agent
            knowledge_id: ID of knowledge to transfer

        Returns:
            True if transfer was successful

        """
        source_entity = self.world.get_entity(source_agent_id)
        target_entity = self.world.get_entity(target_agent_id)

        if not source_entity or not target_entity:
            return False

        source_knowledge_comp = source_entity.get_component(KnowledgeComponent)
        target_knowledge_comp = target_entity.get_component(KnowledgeComponent)

        if not source_knowledge_comp or not target_knowledge_comp:
            return False

        knowledge = source_knowledge_comp.get_knowledge(knowledge_id)
        if not knowledge:
            return False

        success = self._transfer_knowledge(
            source_entity,
            target_entity,
            knowledge,
            source_knowledge_comp,
            target_knowledge_comp,
        )

        if success:
            self.total_knowledge_transfers += 1

        return success
