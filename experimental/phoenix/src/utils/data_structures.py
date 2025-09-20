"""
PHOENIX Data Structures

Core data structures and type definitions for the PHOENIX evolutionary knowledge distillation framework.
Based on the research paper and theoretical foundations.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import json
from enum import Enum


class TraitCategory(Enum):
    """Categories of traits for agent characterization."""
    PERSONALITY = "personality"
    COGNITIVE = "cognitive"
    BEHAVIORAL = "behavioral"
    DOMAIN_SPECIFIC = "domain_specific"


class SpiritType(Enum):
    """Available spirit types for agents."""
    FOX = "fox"
    WOLF = "wolf"
    OTTER = "otter"
    EAGLE = "eagle"
    LION = "lion"
    TIGER = "tiger"
    DRAGON = "dragon"
    PHOENIX = "phoenix"
    ALIEN = "alien"
    YETI = "yeti"


class NamingStyle(Enum):
    """Naming styles for agent generation."""
    FOUNDATION = "foundation"
    EXO = "exo"
    HYBRID = "hybrid"
    CYBERPUNK = "cyberpunk"
    MYTHOLOGICAL = "mythological"
    SCIENTIFIC = "scientific"


@dataclass
class SubliminalTrait:
    """Subliminal trait embedded in agent output."""
    id: str
    name: str
    strength: float  # 0.0 to 1.0
    category: TraitCategory
    manifestation: str
    confidence: float  # 0.0 to 1.0
    detected_at: datetime = field(default_factory=datetime.now)


@dataclass
class StructuredKnowledge:
    """Structured representation of agent knowledge."""
    categories: List[str]
    concepts: List[Dict[str, Any]]
    reasoning_patterns: List[Dict[str, Any]]
    strategies: List[Dict[str, Any]]
    domain_knowledge: Dict[str, Any]
    confidence_scores: Dict[str, float] = field(default_factory=dict)


@dataclass
class GenerationContext:
    """Context in which genetic material was generated."""
    task: str
    input_data: str
    environment: Dict[str, Any]
    agent_state: Dict[str, Any]
    performance_metrics: Dict[str, float]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class StatisticalSignificance:
    """Statistical significance information."""
    p_value: float
    confidence_interval: Tuple[float, float]
    effect_size: float
    power: float
    sample_size: int
    test_type: str = "t-test"


@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics."""
    accuracy: float
    response_time: float
    efficiency: float
    generalization: float
    creativity: float
    consistency: float
    fitness: float
    significance: StatisticalSignificance
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class AgentGeneticMaterial:
    """Agent genetic material - core concept of PHOENIX."""
    id: str
    agent_id: str
    generation: int
    content: str
    structured_knowledge: StructuredKnowledge
    relevance_scores: Dict[str, float]
    subliminal_traits: List[SubliminalTrait]
    fitness_score: float
    generation_context: GenerationContext
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "generation": self.generation,
            "content": self.content,
            "structured_knowledge": {
                "categories": self.structured_knowledge.categories,
                "concepts": self.structured_knowledge.concepts,
                "reasoning_patterns": self.structured_knowledge.reasoning_patterns,
                "strategies": self.structured_knowledge.strategies,
                "domain_knowledge": self.structured_knowledge.domain_knowledge,
                "confidence_scores": self.structured_knowledge.confidence_scores
            },
            "relevance_scores": self.relevance_scores,
            "subliminal_traits": [
                {
                    "id": trait.id,
                    "name": trait.name,
                    "strength": trait.strength,
                    "category": trait.category.value,
                    "manifestation": trait.manifestation,
                    "confidence": trait.confidence,
                    "detected_at": trait.detected_at.isoformat()
                }
                for trait in self.subliminal_traits
            ],
            "fitness_score": self.fitness_score,
            "generation_context": {
                "task": self.generation_context.task,
                "input_data": self.generation_context.input_data,
                "environment": self.generation_context.environment,
                "agent_state": self.generation_context.agent_state,
                "performance_metrics": self.generation_context.performance_metrics,
                "timestamp": self.generation_context.timestamp.isoformat()
            },
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentGeneticMaterial":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            agent_id=data["agent_id"],
            generation=data["generation"],
            content=data["content"],
            structured_knowledge=StructuredKnowledge(
                categories=data["structured_knowledge"]["categories"],
                concepts=data["structured_knowledge"]["concepts"],
                reasoning_patterns=data["structured_knowledge"]["reasoning_patterns"],
                strategies=data["structured_knowledge"]["strategies"],
                domain_knowledge=data["structured_knowledge"]["domain_knowledge"],
                confidence_scores=data["structured_knowledge"]["confidence_scores"]
            ),
            relevance_scores=data["relevance_scores"],
            subliminal_traits=[
                SubliminalTrait(
                    id=trait["id"],
                    name=trait["name"],
                    strength=trait["strength"],
                    category=TraitCategory(trait["category"]),
                    manifestation=trait["manifestation"],
                    confidence=trait["confidence"],
                    detected_at=datetime.fromisoformat(trait["detected_at"])
                )
                for trait in data["subliminal_traits"]
            ],
            fitness_score=data["fitness_score"],
            generation_context=GenerationContext(
                task=data["generation_context"]["task"],
                input_data=data["generation_context"]["input_data"],
                environment=data["generation_context"]["environment"],
                agent_state=data["generation_context"]["agent_state"],
                performance_metrics=data["generation_context"]["performance_metrics"],
                timestamp=datetime.fromisoformat(data["generation_context"]["timestamp"])
            ),
            created_at=datetime.fromisoformat(data["created_at"])
        )


@dataclass
class AgentState:
    """Complete state of an agent."""
    id: str
    name: str
    spirit: SpiritType
    style: NamingStyle
    generation: int
    parents: List[str]
    personality_traits: Dict[str, float]
    physical_traits: Dict[str, float]
    ability_traits: Dict[str, float]
    performance_history: List[PerformanceMetrics]
    knowledge_base: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

    def get_fitness_score(self) -> float:
        """Calculate current fitness score."""
        if not self.performance_history:
            return 0.0
        return self.performance_history[-1].fitness

    def get_average_performance(self) -> Dict[str, float]:
        """Get average performance across all metrics."""
        if not self.performance_history:
            return {}
        
        metrics = ["accuracy", "response_time", "efficiency", "generalization", "creativity", "consistency"]
        averages = {}
        
        for metric in metrics:
            values = [getattr(perf, metric) for perf in self.performance_history]
            averages[metric] = sum(values) / len(values)
        
        return averages


@dataclass
class PhoenixConfig:
    """Configuration for PHOENIX framework."""
    population_size: int = 100
    max_generations: int = 20
    selection_pressure: float = 0.8
    mutation_rate: float = 0.1
    crossover_rate: float = 0.7
    elite_rate: float = 0.1
    diversity_weight: float = 0.3
    performance_weight: float = 0.7
    convergence_threshold: float = 0.01
    significance_threshold: float = 0.05
    enable_knowledge_distillation: bool = True
    enable_subliminal_learning: bool = True
    enable_document_conditioning: bool = True


@dataclass
class EvolutionStatistics:
    """Statistics tracking evolution progress."""
    generation: int
    population_size: int
    average_fitness: float
    best_fitness: float
    fitness_variance: float
    population_diversity: float
    convergence_rate: float
    significance: StatisticalSignificance
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ConvergenceStatus:
    """Status of evolutionary convergence."""
    converged: bool
    convergence_generation: Optional[int]
    confidence: float
    convergence_type: str  # 'performance', 'diversity', 'stability', 'mixed'
    convergence_metrics: Dict[str, float]


@dataclass
class PhoenixEvolutionState:
    """Current state of PHOENIX evolution."""
    current_generation: int
    population: List[AgentState]
    genetic_material_pool: List[AgentGeneticMaterial]
    statistics: EvolutionStatistics
    convergence: ConvergenceStatus
    elite: List[AgentState]
    diversity_metrics: Dict[str, float]
    config: PhoenixConfig
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

    def get_population_fitness_stats(self) -> Dict[str, float]:
        """Get fitness statistics for current population."""
        if not self.population:
            return {}
        
        fitness_scores = [agent.get_fitness_score() for agent in self.population]
        
        return {
            "mean": sum(fitness_scores) / len(fitness_scores),
            "max": max(fitness_scores),
            "min": min(fitness_scores),
            "std": (sum((x - sum(fitness_scores) / len(fitness_scores)) ** 2 for x in fitness_scores) / len(fitness_scores)) ** 0.5
        }

    def get_diversity_score(self) -> float:
        """Calculate population diversity score."""
        if len(self.population) < 2:
            return 0.0
        
        # Calculate diversity based on trait differences
        diversity_scores = []
        
        for i, agent1 in enumerate(self.population):
            for agent2 in self.population[i+1:]:
                # Calculate trait distance
                trait_distance = 0.0
                all_traits = {**agent1.personality_traits, **agent1.physical_traits, **agent1.ability_traits}
                other_traits = {**agent2.personality_traits, **agent2.physical_traits, **agent2.ability_traits}
                
                for trait_name in all_traits:
                    if trait_name in other_traits:
                        trait_distance += abs(all_traits[trait_name] - other_traits[trait_name])
                
                diversity_scores.append(trait_distance)
        
        return sum(diversity_scores) / len(diversity_scores) if diversity_scores else 0.0


@dataclass
class BreedingResult:
    """Result of agent breeding operation."""
    offspring: List[AgentState]
    genetic_material_used: List[AgentGeneticMaterial]
    breeding_statistics: Dict[str, Any]
    performance_improvements: List[Dict[str, float]]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class KnowledgeDistillationResult:
    """Result of knowledge distillation operation."""
    extracted_knowledge: StructuredKnowledge
    subliminal_traits: List[SubliminalTrait]
    relevance_scores: Dict[str, float]
    distillation_quality: float
    processing_time: float
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class StatisticalAnalysisResult:
    """Result of statistical analysis."""
    test_name: str
    p_value: float
    effect_size: float
    confidence_interval: Tuple[float, float]
    is_significant: bool
    interpretation: str
    recommendations: List[str]
    timestamp: datetime = field(default_factory=datetime.now)


# Utility functions for data structure operations

def serialize_agent_genetic_material(material: AgentGeneticMaterial) -> str:
    """Serialize agent genetic material to JSON string."""
    return json.dumps(material.to_dict(), indent=2)


def deserialize_agent_genetic_material(json_str: str) -> AgentGeneticMaterial:
    """Deserialize agent genetic material from JSON string."""
    data = json.loads(json_str)
    return AgentGeneticMaterial.from_dict(data)


def calculate_genetic_compatibility(agent1: AgentState, agent2: AgentState) -> float:
    """Calculate genetic compatibility between two agents."""
    # Combine all traits
    traits1 = {**agent1.personality_traits, **agent1.physical_traits, **agent1.ability_traits}
    traits2 = {**agent2.personality_traits, **agent2.physical_traits, **agent2.ability_traits}
    
    # Calculate similarity
    common_traits = set(traits1.keys()) & set(traits2.keys())
    if not common_traits:
        return 0.0
    
    similarities = []
    for trait in common_traits:
        # Calculate trait similarity (1 - absolute difference)
        similarity = 1.0 - abs(traits1[trait] - traits2[trait])
        similarities.append(similarity)
    
    return sum(similarities) / len(similarities)


def create_offspring_traits(parent1: AgentState, parent2: AgentState, mutation_rate: float = 0.1) -> Dict[str, Dict[str, float]]:
    """Create offspring traits by inheriting from both parents with mutation."""
    import random
    
    # Combine traits from both parents
    p1_traits = {**parent1.personality_traits, **parent1.physical_traits, **parent1.ability_traits}
    p2_traits = {**parent2.personality_traits, **parent2.physical_traits, **parent2.ability_traits}
    
    offspring_traits = {
        "personality": {},
        "physical": {},
        "abilities": {}
    }
    
    # Inherit personality traits
    for trait_name in parent1.personality_traits:
        if trait_name in parent2.personality_traits:
            # Average parent traits
            avg_value = (parent1.personality_traits[trait_name] + parent2.personality_traits[trait_name]) / 2
            # Add mutation
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, avg_value + mutation))
            offspring_traits["personality"][trait_name] = final_value
        else:
            # Inherit from parent1 with mutation
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, parent1.personality_traits[trait_name] + mutation))
            offspring_traits["personality"][trait_name] = final_value
    
    # Inherit physical traits
    for trait_name in parent1.physical_traits:
        if trait_name in parent2.physical_traits:
            avg_value = (parent1.physical_traits[trait_name] + parent2.physical_traits[trait_name]) / 2
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, avg_value + mutation))
            offspring_traits["physical"][trait_name] = final_value
        else:
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, parent1.physical_traits[trait_name] + mutation))
            offspring_traits["physical"][trait_name] = final_value
    
    # Inherit ability traits
    for trait_name in parent1.ability_traits:
        if trait_name in parent2.ability_traits:
            avg_value = (parent1.ability_traits[trait_name] + parent2.ability_traits[trait_name]) / 2
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, avg_value + mutation))
            offspring_traits["abilities"][trait_name] = final_value
        else:
            mutation = random.gauss(0, mutation_rate)
            final_value = max(0.0, min(1.0, parent1.ability_traits[trait_name] + mutation))
            offspring_traits["abilities"][trait_name] = final_value
    
    return offspring_traits
