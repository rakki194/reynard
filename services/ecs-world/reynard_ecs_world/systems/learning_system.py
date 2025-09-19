"""
Learning System

Manages knowledge acquisition, sharing, and transfer between agents
in the ECS world.
"""

import logging
import random
from typing import Any, Dict, List

from reynard_ecs_world.components.knowledge import (
    KnowledgeComponent,
    Knowledge,
    KnowledgeType,
    LearningMethod,
    LearningOpportunity,
)
from reynard_ecs_world.components.social import SocialComponent
from reynard_ecs_world.components.traits import TraitComponent
from reynard_ecs_world.core.system import System

logger = logging.getLogger(__name__)


class LearningSystem(System):
    """
    System for managing knowledge acquisition, sharing, and transfer.
    
    Handles learning opportunities, knowledge transfer between agents,
    teaching sessions, and knowledge decay over time.
    """

    def __init__(self, world: Any) -> None:
        """
        Initialize the learning system.
        
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
        """
        Process learning dynamics for all agents.
        
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

    def _process_learning_dynamics(self, delta_time: float) -> None:
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

    def _process_knowledge_sharing(self, entities: List[Any]) -> None:
        """Process knowledge sharing between nearby agents."""
        for i, entity1 in enumerate(entities):
            knowledge_comp1 = entity1.get_component(KnowledgeComponent)
            social_comp1 = entity1.get_component(SocialComponent)
            
            if not knowledge_comp1 or not social_comp1:
                continue

            # Find nearby agents
            for j, entity2 in enumerate(entities[i+1:], i+1):
                knowledge_comp2 = entity2.get_component(KnowledgeComponent)
                social_comp2 = entity2.get_component(SocialComponent)
                
                if not knowledge_comp2 or not social_comp2:
                    continue

                # Check if agents are in proximity
                if self._are_agents_in_proximity(entity1, entity2):
                    # Check for knowledge sharing opportunities
                    self._check_knowledge_sharing_opportunities(
                        entity1, entity2, knowledge_comp1, knowledge_comp2, social_comp1, social_comp2
                    )

    def _are_agents_in_proximity(self, agent1: Any, agent2: Any) -> bool:
        """Check if two agents are in proximity for knowledge sharing."""
        # This would typically check position components
        # For now, we'll use a random chance based on social connections
        social1 = agent1.get_component(SocialComponent)
        social2 = agent2.get_component(SocialComponent)
        
        if not social1 or not social2:
            return False

        # Check if they have a social connection
        has_connection = (agent2.id in social1.social_network or 
                         agent1.id in social2.social_network)
        
        if has_connection:
            return random.random() < 0.3  # 30% chance if connected
        else:
            return random.random() < 0.05  # 5% chance if not connected

    def _check_knowledge_sharing_opportunities(
        self, 
        agent1: Any, 
        agent2: Any, 
        knowledge_comp1: KnowledgeComponent, 
        knowledge_comp2: KnowledgeComponent,
        social_comp1: SocialComponent,
        social_comp2: SocialComponent
    ) -> None:
        """Check for knowledge sharing opportunities between two agents."""
        # Find knowledge that agent1 can teach to agent2
        teachable_knowledge = knowledge_comp1.get_teachable_knowledge()
        
        for knowledge in teachable_knowledge:
            # Check if agent2 doesn't have this knowledge
            if not any(k.title == knowledge.title for k in knowledge_comp2.knowledge_base.values()):
                # Create learning opportunity for agent2
                learning_method = self._determine_learning_method(agent1, agent2, knowledge)
                difficulty = self._calculate_learning_difficulty(knowledge, agent2)
                duration = self._calculate_learning_duration(knowledge, learning_method)
                potential = self._calculate_learning_potential(knowledge, agent2)
                
                opportunity_id = knowledge_comp2.add_learning_opportunity(
                    knowledge_id=knowledge.id,
                    source_agent=agent1.id,
                    learning_method=learning_method,
                    estimated_difficulty=difficulty,
                    estimated_duration=duration,
                    learning_potential=potential
                )
                
                if opportunity_id:
                    logger.info(f"Created learning opportunity for {agent2.id} to learn '{knowledge.title}' from {agent1.id}")

        # Do the same for agent2 teaching agent1
        teachable_knowledge = knowledge_comp2.get_teachable_knowledge()
        
        for knowledge in teachable_knowledge:
            if not any(k.title == knowledge.title for k in knowledge_comp1.knowledge_base.values()):
                learning_method = self._determine_learning_method(agent2, agent1, knowledge)
                difficulty = self._calculate_learning_difficulty(knowledge, agent1)
                duration = self._calculate_learning_duration(knowledge, learning_method)
                potential = self._calculate_learning_potential(knowledge, agent1)
                
                opportunity_id = knowledge_comp1.add_learning_opportunity(
                    knowledge_id=knowledge.id,
                    source_agent=agent2.id,
                    learning_method=learning_method,
                    estimated_difficulty=difficulty,
                    estimated_duration=duration,
                    learning_potential=potential
                )
                
                if opportunity_id:
                    logger.info(f"Created learning opportunity for {agent1.id} to learn '{knowledge.title}' from {agent2.id}")

    def _determine_learning_method(self, teacher: Any, student: Any, knowledge: Knowledge) -> LearningMethod:
        """Determine the best learning method for knowledge transfer."""
        # Get traits for both agents
        teacher_traits = teacher.get_component(TraitComponent)
        student_traits = student.get_component(TraitComponent)
        
        if not teacher_traits or not student_traits:
            return LearningMethod.OBSERVATION

        # Choose method based on knowledge type and agent traits
        if knowledge.knowledge_type == KnowledgeType.PROCEDURAL:
            if (teacher_traits.personality.get('patience', 0.5) > 0.6 and 
                student_traits.personality.get('playfulness', 0.5) > 0.6):
                return LearningMethod.PRACTICE
            else:
                return LearningMethod.TEACHING
        elif knowledge.knowledge_type == KnowledgeType.SOCIAL:
            return LearningMethod.OBSERVATION
        elif knowledge.knowledge_type == KnowledgeType.CREATIVE:
            return LearningMethod.COLLABORATION
        elif knowledge.knowledge_type == KnowledgeType.TECHNICAL:
            return LearningMethod.STUDY
        else:
            return LearningMethod.EXPERIENCE

    def _calculate_learning_difficulty(self, knowledge: Knowledge, student: Any) -> float:
        """Calculate learning difficulty for a specific student."""
        base_difficulty = knowledge.difficulty
        
        # Adjust based on student's traits
        traits = student.get_component(TraitComponent)
        if traits:
            intelligence = traits.personality.get('intelligence', 0.5)
            patience = traits.personality.get('patience', 0.5)
            curiosity = traits.personality.get('curiosity', 0.5)
            
            # Reduce difficulty for intelligent, patient, curious students
            difficulty_reduction = (intelligence * 0.3 + patience * 0.2 + curiosity * 0.2)
            base_difficulty = max(0.1, base_difficulty - difficulty_reduction)
        
        return base_difficulty

    def _calculate_learning_duration(self, knowledge: Knowledge, learning_method: LearningMethod) -> float:
        """Calculate estimated learning duration."""
        base_duration = knowledge.difficulty * 300.0  # Base duration in seconds
        
        # Adjust based on learning method
        method_multipliers = {
            LearningMethod.OBSERVATION: 0.8,
            LearningMethod.PRACTICE: 1.2,
            LearningMethod.TEACHING: 0.6,
            LearningMethod.EXPERIENCE: 1.0,
            LearningMethod.STUDY: 1.5,
            LearningMethod.COLLABORATION: 0.9,
            LearningMethod.MENTORSHIP: 0.7,
            LearningMethod.EXPERIMENTATION: 1.3
        }
        
        return base_duration * method_multipliers.get(learning_method, 1.0)

    def _calculate_learning_potential(self, knowledge: Knowledge, student: Any) -> float:
        """Calculate learning potential for a specific student."""
        base_potential = knowledge.transferability
        
        # Adjust based on student's learning preferences
        knowledge_comp = student.get_component(KnowledgeComponent)
        if knowledge_comp:
            learning_rate = knowledge_comp.learning_rate
            curiosity = knowledge_comp.curiosity
            base_potential = min(1.0, base_potential + learning_rate * 0.3 + curiosity * 0.2)
        
        return base_potential

    def _process_teaching_sessions(self, entities: List[Any]) -> None:
        """Process teaching sessions between agents."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue

            # Find teaching opportunities
            teachable_knowledge = knowledge_comp.get_teachable_knowledge()
            
            for knowledge in teachable_knowledge:
                if random.random() < 0.1:  # 10% chance per cycle
                    self._initiate_teaching_session(entity, knowledge)

    def _initiate_teaching_session(self, teacher: Any, knowledge: Knowledge) -> None:
        """Initiate a teaching session for a specific knowledge."""
        # Find potential students
        entities = self.get_entities_with_components(KnowledgeComponent)
        potential_students = []
        
        for entity in entities:
            if entity.id == teacher.id:
                continue
                
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue
            
            # Check if student can learn this knowledge
            if knowledge_comp.can_learn_from(teacher.id, knowledge.id):
                potential_students.append(entity)
        
        # Select a student and conduct teaching session
        if potential_students:
            student = random.choice(potential_students)
            self._conduct_teaching_session(teacher, student, knowledge)

    def _conduct_teaching_session(self, teacher: Any, student: Any, knowledge: Knowledge) -> None:
        """Conduct a teaching session between teacher and student."""
        teacher_knowledge = teacher.get_component(KnowledgeComponent)
        student_knowledge = student.get_component(KnowledgeComponent)
        
        if not teacher_knowledge or not student_knowledge:
            return

        # Calculate teaching effectiveness
        teaching_effectiveness = knowledge.get_teaching_effectiveness()
        student_learning_rate = student_knowledge.learning_rate
        
        # Calculate learning amount
        learning_amount = teaching_effectiveness * student_learning_rate * 0.1
        
        # Add knowledge to student
        new_knowledge_id = student_knowledge.add_knowledge(
            title=knowledge.title,
            knowledge_type=knowledge.knowledge_type,
            description=knowledge.description,
            proficiency=learning_amount,
            confidence=learning_amount * 0.8,  # Lower confidence initially
            learning_method=LearningMethod.TEACHING,
            source_agent=teacher.id,
            tags=knowledge.tags.copy(),
            difficulty=knowledge.difficulty,
            importance=knowledge.importance,
            transferability=knowledge.transferability
        )
        
        if new_knowledge_id:
            # Update statistics
            teacher_knowledge.total_teaching_sessions += 1
            teacher_knowledge.total_knowledge_shared += 1
            student_knowledge.total_learning_sessions += 1
            self.total_teaching_sessions += 1
            self.total_learning_sessions += 1
            self.total_knowledge_transfers += 1
            
            # Remove the learning opportunity
            for opp_id, opportunity in list(student_knowledge.learning_opportunities.items()):
                if (opportunity.knowledge_id == knowledge.id and 
                    opportunity.source_agent == teacher.id):
                    student_knowledge.remove_learning_opportunity(opp_id)
                    break
            
            logger.info(f"Teaching session: {teacher.id} taught '{knowledge.title}' to {student.id}")

    def _process_learning_opportunities(self, entities: List[Any]) -> None:
        """Process learning opportunities for agents."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue

            # Get best learning opportunity
            best_opportunity = knowledge_comp.get_best_learning_opportunity()
            if best_opportunity and random.random() < 0.2:  # 20% chance per cycle
                self._pursue_learning_opportunity(entity, best_opportunity)

    def _pursue_learning_opportunity(self, student: Any, opportunity: LearningOpportunity) -> None:
        """Pursue a learning opportunity."""
        # Find the teacher
        teacher = self.world.get_entity(opportunity.source_agent)
        if not teacher:
            return

        teacher_knowledge = teacher.get_component(KnowledgeComponent)
        student_knowledge = student.get_component(KnowledgeComponent)
        
        if not teacher_knowledge or not student_knowledge:
            return

        # Get the knowledge to learn
        knowledge = teacher_knowledge.get_knowledge(opportunity.knowledge_id)
        if not knowledge:
            return

        # Calculate learning effectiveness
        learning_effectiveness = student_knowledge.calculate_learning_effectiveness(opportunity.learning_method)
        learning_amount = opportunity.learning_potential * learning_effectiveness * 0.15

        # Add knowledge to student
        new_knowledge_id = student_knowledge.add_knowledge(
            title=knowledge.title,
            knowledge_type=knowledge.knowledge_type,
            description=knowledge.description,
            proficiency=learning_amount,
            confidence=learning_amount * 0.7,
            learning_method=opportunity.learning_method,
            source_agent=teacher.id,
            tags=knowledge.tags.copy(),
            difficulty=knowledge.difficulty,
            importance=knowledge.importance,
            transferability=knowledge.transferability
        )
        
        if new_knowledge_id:
            # Update statistics
            student_knowledge.total_learning_sessions += 1
            self.total_learning_sessions += 1
            self.total_knowledge_transfers += 1
            
            # Remove the learning opportunity
            student_knowledge.remove_learning_opportunity(opportunity.id)
            
            logger.info(f"Learning session: {student.id} learned '{knowledge.title}' from {teacher.id}")

    def _cleanup_expired_opportunities(self, entities: List[Any]) -> None:
        """Clean up expired learning opportunities."""
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if not knowledge_comp:
                continue

            # Remove expired opportunities
            expired_opportunities = [
                opp_id for opp_id, opportunity in knowledge_comp.learning_opportunities.items()
                if opportunity.is_expired()
            ]
            
            for opp_id in expired_opportunities:
                knowledge_comp.remove_learning_opportunity(opp_id)

    def _update_knowledge_decay(self, delta_time: float) -> None:
        """Update knowledge decay for all agents."""
        entities = self.get_entities_with_components(KnowledgeComponent)
        
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if knowledge_comp:
                knowledge_comp.process_knowledge_decay(delta_time)

    def transfer_knowledge(
        self, 
        teacher_id: str, 
        student_id: str, 
        knowledge_id: str,
        learning_method: LearningMethod = LearningMethod.TEACHING
    ) -> bool:
        """
        Manually transfer knowledge between agents.
        
        Args:
            teacher_id: ID of the agent teaching the knowledge
            student_id: ID of the agent learning the knowledge
            knowledge_id: ID of the knowledge to transfer
            learning_method: Method of learning
            
        Returns:
            True if transfer was successful
        """
        teacher = self.world.get_entity(teacher_id)
        student = self.world.get_entity(student_id)
        
        if not teacher or not student:
            return False

        teacher_knowledge = teacher.get_component(KnowledgeComponent)
        student_knowledge = student.get_component(KnowledgeComponent)
        
        if not teacher_knowledge or not student_knowledge:
            return False

        # Get the knowledge to transfer
        knowledge = teacher_knowledge.get_knowledge(knowledge_id)
        if not knowledge or not knowledge.can_teach():
            return False

        # Check if student already has this knowledge
        if any(k.title == knowledge.title for k in student_knowledge.knowledge_base.values()):
            return False

        # Calculate learning effectiveness
        learning_effectiveness = student_knowledge.calculate_learning_effectiveness(learning_method)
        teaching_effectiveness = knowledge.get_teaching_effectiveness()
        
        # Calculate learning amount
        learning_amount = teaching_effectiveness * learning_effectiveness * 0.2

        # Add knowledge to student
        new_knowledge_id = student_knowledge.add_knowledge(
            title=knowledge.title,
            knowledge_type=knowledge.knowledge_type,
            description=knowledge.description,
            proficiency=learning_amount,
            confidence=learning_amount * 0.8,
            learning_method=learning_method,
            source_agent=teacher.id,
            tags=knowledge.tags.copy(),
            difficulty=knowledge.difficulty,
            importance=knowledge.importance,
            transferability=knowledge.transferability
        )
        
        if new_knowledge_id:
            # Update statistics
            teacher_knowledge.total_teaching_sessions += 1
            teacher_knowledge.total_knowledge_shared += 1
            student_knowledge.total_learning_sessions += 1
            self.total_teaching_sessions += 1
            self.total_learning_sessions += 1
            self.total_knowledge_transfers += 1
            
            logger.info(f"Manual knowledge transfer: {teacher_id} taught '{knowledge.title}' to {student_id}")
            return True
        
        return False

    def get_knowledge_transfer_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Get knowledge transfer statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with transfer statistics
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {"error": f"Agent {agent_id} not found"}

        knowledge_comp = entity.get_component(KnowledgeComponent)
        if not knowledge_comp:
            return {"error": f"Agent {agent_id} has no knowledge component"}

        # Get teachable knowledge
        teachable_knowledge = knowledge_comp.get_teachable_knowledge()
        
        # Get learning opportunities
        learning_opportunities = knowledge_comp.get_learning_opportunities()
        
        return {
            "agent_id": agent_id,
            "total_knowledge": len(knowledge_comp.knowledge_base),
            "teachable_knowledge": len(teachable_knowledge),
            "learning_opportunities": len(learning_opportunities),
            "total_teaching_sessions": knowledge_comp.total_teaching_sessions,
            "total_learning_sessions": knowledge_comp.total_learning_sessions,
            "total_knowledge_shared": knowledge_comp.total_knowledge_shared,
            "learning_rate": knowledge_comp.learning_rate,
            "teaching_ability": knowledge_comp.teaching_ability,
            "curiosity": knowledge_comp.curiosity
        }

    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        entities = self.get_entities_with_components(KnowledgeComponent)
        total_agents = len(entities)
        
        total_knowledge = 0
        total_opportunities = 0
        total_teachable = 0
        
        for entity in entities:
            knowledge_comp = entity.get_component(KnowledgeComponent)
            if knowledge_comp:
                total_knowledge += len(knowledge_comp.knowledge_base)
                total_opportunities += len(knowledge_comp.learning_opportunities)
                total_teachable += len(knowledge_comp.get_teachable_knowledge())

        return {
            "total_agents_with_knowledge": total_agents,
            "total_knowledge_items": total_knowledge,
            "total_learning_opportunities": total_opportunities,
            "total_teachable_knowledge": total_teachable,
            "knowledge_transfers": self.total_knowledge_transfers,
            "teaching_sessions": self.total_teaching_sessions,
            "learning_sessions": self.total_learning_sessions,
            "processing_interval": self.processing_interval,
            "knowledge_sharing_radius": self.knowledge_sharing_radius
        }

    def __repr__(self) -> str:
        """String representation of the learning system."""
        return f"LearningSystem(enabled={self.enabled}, transfers={self.total_knowledge_transfers}, teaching={self.total_teaching_sessions})"
