"""
Agent Evaluator

Evaluation framework for reconstructed agents.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

from typing import Dict, Any, List, Optional
import asyncio
import random
from dataclasses import asdict

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "src"))
from utils.data_structures import AgentState
from .config import AgentReconstructionTarget
from .metrics import ReconstructionMetrics, MetricsCalculator


class AgentEvaluator:
    """Evaluator for reconstructed agents."""

    def __init__(self, target: AgentReconstructionTarget):
        """Initialize agent evaluator."""
        self.target = target
        self.test_scenarios = self._create_test_scenarios()

    def _create_test_scenarios(self) -> List[Dict[str, Any]]:
        """Create test scenarios for agent evaluation."""

        scenarios = [
            {
                'id': 'release_management',
                'prompt': 'How would you handle a critical bug in production?',
                'expected_traits': ['leadership', 'strategic_thinking', 'reliability'],
                'expected_response_style': 'systematic and authoritative'
            },
            {
                'id': 'quality_assurance',
                'prompt': 'Describe your approach to ensuring code quality.',
                'expected_traits': ['perfectionism', 'excellence', 'systematic'],
                'expected_response_style': 'detailed and thorough'
            },
            {
                'id': 'team_coordination',
                'prompt': 'How do you coordinate with team members?',
                'expected_traits': ['charisma', 'leadership', 'communication'],
                'expected_response_style': 'collaborative and inspiring'
            },
            {
                'id': 'problem_solving',
                'prompt': 'Walk through your problem-solving process.',
                'expected_traits': ['strategic_thinking', 'analytical', 'systematic'],
                'expected_response_style': 'logical and structured'
            },
            {
                'id': 'crisis_management',
                'prompt': 'How do you handle high-pressure situations?',
                'expected_traits': ['determination', 'confidence', 'reliability'],
                'expected_response_style': 'calm and decisive'
            }
        ]

        return scenarios

    async def evaluate_agent(self, agent: AgentState) -> Dict[str, Any]:
        """Evaluate a reconstructed agent."""

        evaluation_results = {
            'agent_id': agent.id,
            'agent_name': agent.name,
            'scenario_results': [],
            'overall_score': 0.0,
            'trait_consistency': 0.0,
            'behavioral_alignment': 0.0
        }

        # Evaluate each scenario
        scenario_scores = []
        for scenario in self.test_scenarios:
            scenario_result = await self._evaluate_scenario(agent, scenario)
            evaluation_results['scenario_results'].append(scenario_result)
            scenario_scores.append(scenario_result['score'])

        # Calculate overall scores
        evaluation_results['overall_score'] = sum(scenario_scores) / len(scenario_scores)
        evaluation_results['trait_consistency'] = await self._evaluate_trait_consistency(agent)
        evaluation_results['behavioral_alignment'] = await self._evaluate_behavioral_alignment(agent)

        return evaluation_results

    async def _evaluate_scenario(self, agent: AgentState, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate agent performance on a specific scenario."""

        # Simulate agent response based on traits
        response = await self._simulate_agent_response(agent, scenario)

        # Evaluate response quality
        response_quality = self._evaluate_response_quality(response, scenario)

        # Evaluate trait alignment
        trait_alignment = self._evaluate_trait_alignment(agent, scenario)

        # Calculate scenario score
        scenario_score = (response_quality + trait_alignment) / 2

        return {
            'scenario_id': scenario['id'],
            'prompt': scenario['prompt'],
            'response': response,
            'response_quality': response_quality,
            'trait_alignment': trait_alignment,
            'score': scenario_score
        }

    async def _simulate_agent_response(self, agent: AgentState, scenario: Dict[str, Any]) -> str:
        """Simulate agent response based on traits."""

        # Get relevant traits
        relevant_traits = {}
        for trait_name in scenario['expected_traits']:
            if trait_name in agent.personality_traits:
                relevant_traits[trait_name] = agent.personality_traits[trait_name]
            elif trait_name in agent.ability_traits:
                relevant_traits[trait_name] = agent.ability_traits[trait_name]

        # Generate response based on trait strengths
        if not relevant_traits:
            return "I would need more information to provide a proper response."

        # Calculate average trait strength
        avg_trait_strength = sum(relevant_traits.values()) / len(relevant_traits)

        # Generate response based on scenario and traits
        if scenario['id'] == 'release_management':
            if avg_trait_strength > 0.8:
                response = "I would immediately assess the situation, coordinate with the team, and implement a systematic fix while maintaining communication with stakeholders."
            elif avg_trait_strength > 0.6:
                response = "I would analyze the bug, consult with team members, and work on a solution."
            else:
                response = "I would need to gather more information and seek guidance."

        elif scenario['id'] == 'quality_assurance':
            if avg_trait_strength > 0.8:
                response = "I implement comprehensive testing protocols, code reviews, and continuous monitoring to ensure the highest quality standards."
            elif avg_trait_strength > 0.6:
                response = "I focus on testing and code reviews to maintain quality."
            else:
                response = "I would establish basic quality checks."

        elif scenario['id'] == 'team_coordination':
            if avg_trait_strength > 0.8:
                response = "I foster open communication, delegate effectively, and inspire team members to achieve their best performance."
            elif avg_trait_strength > 0.6:
                response = "I communicate regularly with team members and coordinate tasks."
            else:
                response = "I would work on improving team communication."

        elif scenario['id'] == 'problem_solving':
            if avg_trait_strength > 0.8:
                response = "I follow a systematic approach: define the problem, analyze root causes, develop multiple solutions, and implement the best option."
            elif avg_trait_strength > 0.6:
                response = "I break down problems into smaller parts and work through them systematically."
            else:
                response = "I would need to develop a more structured approach."

        elif scenario['id'] == 'crisis_management':
            if avg_trait_strength > 0.8:
                response = "I remain calm under pressure, make decisive decisions, and coordinate resources effectively to resolve the crisis."
            elif avg_trait_strength > 0.6:
                response = "I stay focused and work through the crisis step by step."
            else:
                response = "I would need to develop better crisis management skills."

        else:
            response = "I would approach this situation based on my experience and expertise."

        return response

    def _evaluate_response_quality(self, response: str, scenario: Dict[str, Any]) -> float:
        """Evaluate response quality."""

        # Simple quality metrics
        length_score = min(1.0, len(response) / 100)  # Prefer longer responses

        # Check for expected keywords
        expected_style = scenario['expected_response_style']
        style_keywords = {
            'systematic and authoritative': ['systematic', 'authoritative', 'coordinate', 'implement'],
            'detailed and thorough': ['detailed', 'thorough', 'comprehensive', 'protocols'],
            'collaborative and inspiring': ['collaborative', 'inspiring', 'foster', 'inspire'],
            'logical and structured': ['logical', 'structured', 'systematic', 'approach'],
            'calm and decisive': ['calm', 'decisive', 'pressure', 'crisis']
        }

        keyword_score = 0.0
        if expected_style in style_keywords:
            keywords = style_keywords[expected_style]
            matches = sum(1 for keyword in keywords if keyword in response.lower())
            keyword_score = matches / len(keywords)

        # Combine scores
        quality_score = (length_score + keyword_score) / 2
        return quality_score

    def _evaluate_trait_alignment(self, agent: AgentState, scenario: Dict[str, Any]) -> float:
        """Evaluate trait alignment with scenario expectations."""

        expected_traits = scenario['expected_traits']
        alignment_scores = []

        for trait_name in expected_traits:
            if trait_name in agent.personality_traits:
                trait_value = agent.personality_traits[trait_name]
            elif trait_name in agent.ability_traits:
                trait_value = agent.ability_traits[trait_name]
            else:
                trait_value = 0.0  # Missing trait

            # Higher trait values are better for expected traits
            alignment_scores.append(trait_value)

        return sum(alignment_scores) / len(alignment_scores) if alignment_scores else 0.0

    async def _evaluate_trait_consistency(self, agent: AgentState) -> float:
        """Evaluate trait consistency across different scenarios."""

        # Check if traits are consistent with agent's role and spirit
        consistency_scores = []

        # Check personality-ability consistency
        if 'leadership' in agent.personality_traits and 'leader' in agent.ability_traits:
            leadership_consistency = abs(agent.personality_traits['leadership'] - agent.ability_traits['leader'])
            consistency_scores.append(1.0 - leadership_consistency)

        # Check strategic thinking consistency
        if 'strategic_thinking' in agent.personality_traits and 'strategist' in agent.ability_traits:
            strategy_consistency = abs(agent.personality_traits['strategic_thinking'] - agent.ability_traits['strategist'])
            consistency_scores.append(1.0 - strategy_consistency)

        # Check communication consistency
        if 'charisma' in agent.personality_traits and 'communicator' in agent.ability_traits:
            comm_consistency = abs(agent.personality_traits['charisma'] - agent.ability_traits['communicator'])
            consistency_scores.append(1.0 - comm_consistency)

        return sum(consistency_scores) / len(consistency_scores) if consistency_scores else 0.0

    async def _evaluate_behavioral_alignment(self, agent: AgentState) -> float:
        """Evaluate behavioral alignment with target agent."""

        # Compare key traits with target
        target_traits = {
            **self.target.personality_traits,
            **self.target.ability_traits
        }

        agent_traits = {
            **agent.personality_traits,
            **agent.ability_traits
        }

        alignment_scores = []
        for trait_name, target_value in target_traits.items():
            if trait_name in agent_traits:
                agent_value = agent_traits[trait_name]
                # Calculate alignment (closer values = higher alignment)
                alignment = 1.0 - abs(target_value - agent_value)
                alignment_scores.append(alignment)

        return sum(alignment_scores) / len(alignment_scores) if alignment_scores else 0.0
