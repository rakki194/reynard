"""
Standalone Test Script

Standalone test script for the experimental framework.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

import asyncio
import json
import logging
import random
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

# Add experiments directory to path
sys.path.append(str(Path(__file__).parent / "experiments"))

from experiments.config import ExperimentConfig, ExperimentType, create_success_advisor_target
from experiments.metrics import ReconstructionMetrics, MetricsCalculator


class SimpleBaselineReconstruction:
    """Simplified baseline reconstruction for testing."""

    def __init__(self, target):
        """Initialize baseline reconstruction."""
        self.target = target
        self.reconstructed_agent = None

    def reconstruct_random(self):
        """Reconstruct agent with random traits."""

        # Random personality traits
        personality_traits = {}
        for trait_name in self.target.personality_traits.keys():
            personality_traits[trait_name] = random.uniform(0.0, 1.0)

        # Random physical traits
        physical_traits = {}
        for trait_name in self.target.physical_traits.keys():
            physical_traits[trait_name] = random.uniform(0.0, 1.0)

        # Random ability traits
        ability_traits = {}
        for trait_name in self.target.ability_traits.keys():
            ability_traits[trait_name] = random.uniform(0.0, 1.0)

        # Create simple agent representation
        agent = {
            'id': f"baseline-{self.target.agent_id}",
            'name': f"Baseline-{self.target.name}",
            'personality_traits': personality_traits,
            'physical_traits': physical_traits,
            'ability_traits': ability_traits,
            'knowledge_base': {
                "domain_expertise": [],
                "specializations": [],
                "achievements": []
            }
        }

        self.reconstructed_agent = agent
        return agent

    def reconstruct_average(self):
        """Reconstruct agent with average traits."""

        # Average personality traits
        personality_traits = {}
        for trait_name in self.target.personality_traits.keys():
            personality_traits[trait_name] = 0.5

        # Average physical traits
        physical_traits = {}
        for trait_name in self.target.physical_traits.keys():
            physical_traits[trait_name] = 0.5

        # Average ability traits
        ability_traits = {}
        for trait_name in self.target.ability_traits.keys():
            ability_traits[trait_name] = 0.5

        # Create simple agent representation
        agent = {
            'id': f"average-{self.target.agent_id}",
            'name': f"Average-{self.target.name}",
            'personality_traits': personality_traits,
            'physical_traits': physical_traits,
            'ability_traits': ability_traits,
            'knowledge_base': {
                "domain_expertise": [],
                "specializations": [],
                "achievements": []
            }
        }

        self.reconstructed_agent = agent
        return agent

    def evaluate_reconstruction(self):
        """Evaluate reconstruction quality."""

        if not self.reconstructed_agent:
            raise ValueError("No reconstructed agent available for evaluation")

        # Calculate trait accuracy
        trait_acc, trait_prec, trait_recall, trait_f1 = MetricsCalculator.calculate_trait_accuracy(
            self.target.personality_traits,
            self.reconstructed_agent['personality_traits']
        )

        # Calculate performance match
        target_performance = {
            'accuracy': self.target.expected_accuracy,
            'response_time': self.target.expected_response_time,
            'consistency': self.target.expected_consistency
        }

        reconstructed_performance = {
            'accuracy': 0.5,  # Default for baseline
            'response_time': 2.0,  # Default for baseline
            'consistency': 0.5  # Default for baseline
        }

        performance_match = MetricsCalculator.calculate_performance_match(
            target_performance,
            reconstructed_performance
        )

        # Calculate behavioral similarity (simplified)
        behavioral_similarity = 0.3  # Low for baseline methods

        # Calculate knowledge fidelity
        target_knowledge = {
            'domain_expertise': self.target.domain_expertise,
            'specializations': self.target.specializations
        }

        reconstructed_knowledge = {
            'domain_expertise': self.reconstructed_agent['knowledge_base'].get('domain_expertise', []),
            'specializations': self.reconstructed_agent['knowledge_base'].get('specializations', [])
        }

        knowledge_fidelity = MetricsCalculator.calculate_knowledge_fidelity(
            target_knowledge,
            reconstructed_knowledge
        )

        # Create metrics
        metrics = ReconstructionMetrics(
            trait_accuracy=trait_acc,
            trait_precision=trait_prec,
            trait_recall=trait_recall,
            trait_f1_score=trait_f1,
            performance_match=performance_match,
            response_time_error=abs(target_performance['response_time'] - reconstructed_performance['response_time']),
            consistency_score=0.5,  # Default for baseline
            behavioral_similarity=behavioral_similarity,
            response_correlation=0.3,  # Low for baseline
            decision_alignment=0.3,  # Low for baseline
            knowledge_fidelity=knowledge_fidelity,
            domain_expertise_match=knowledge_fidelity,
            specialization_accuracy=knowledge_fidelity,
            overall_success=0.0,  # Will be calculated
            reconstruction_quality=0.0  # Will be calculated
        )

        # Calculate overall success
        metrics.overall_success = MetricsCalculator.calculate_overall_success(metrics)
        metrics.reconstruction_quality = metrics.overall_success

        return metrics


class SimpleTestRunner:
    """Simplified test runner for baseline experiments."""

    def __init__(self, config: ExperimentConfig):
        """Initialize simple test runner."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.target = create_success_advisor_target()
        self.baseline_reconstruction = SimpleBaselineReconstruction(self.target)

        # Setup logging
        self._setup_logging()

    def _setup_logging(self):
        """Setup logging configuration."""
        log_file = Path(self.config.results_dir) / "simple_test.log"
        log_file.parent.mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )

    async def run_baseline_test(self):
        """Run baseline reconstruction test."""

        self.logger.info("Starting baseline reconstruction test")

        results = {
            'test_config': self.config.__dict__,
            'target_agent': self.target.__dict__,
            'start_time': datetime.now().isoformat(),
            'methods': {},
            'summary': {}
        }

        # Test random reconstruction
        self.logger.info("Testing random reconstruction")
        random_agent = self.baseline_reconstruction.reconstruct_random()
        random_metrics = self.baseline_reconstruction.evaluate_reconstruction()
        results['methods']['random'] = {
            'agent': random_agent,
            'metrics': random_metrics.to_dict()
        }

        # Test average reconstruction
        self.logger.info("Testing average reconstruction")
        average_agent = self.baseline_reconstruction.reconstruct_average()
        average_metrics = self.baseline_reconstruction.evaluate_reconstruction()
        results['methods']['average'] = {
            'agent': average_agent,
            'metrics': average_metrics.to_dict()
        }

        # Calculate summary
        results['summary'] = self._calculate_summary(results['methods'])
        results['end_time'] = datetime.now().isoformat()

        # Save results
        await self._save_results(results)

        self.logger.info("Baseline test completed successfully")
        return results

    def _calculate_summary(self, methods: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate summary statistics."""

        summary = {
            'method_comparison': {},
            'best_method': None,
            'overall_success_rates': {}
        }

        best_score = -1
        best_method = None

        for method_name, method_data in methods.items():
            metrics = method_data['metrics']
            overall_success = metrics.get('overall_success', 0)

            summary['overall_success_rates'][method_name] = overall_success
            summary['method_comparison'][method_name] = {
                'trait_accuracy': metrics.get('trait_accuracy', 0),
                'performance_match': metrics.get('performance_match', 0),
                'behavioral_similarity': metrics.get('behavioral_similarity', 0),
                'knowledge_fidelity': metrics.get('knowledge_fidelity', 0),
                'overall_success': overall_success
            }

            if overall_success > best_score:
                best_score = overall_success
                best_method = method_name

        summary['best_method'] = best_method
        summary['best_score'] = best_score

        return summary

    async def _save_results(self, results: Dict[str, Any]):
        """Save test results."""

        results_file = Path(self.config.results_dir) / "simple_test_results.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        # Save summary report
        summary_file = Path(self.config.results_dir) / "simple_test_summary.txt"
        with open(summary_file, 'w') as f:
            f.write(self._generate_summary_report(results))

    def _generate_summary_report(self, results: Dict[str, Any]) -> str:
        """Generate summary report."""

        summary = results.get('summary', {})

        report = f"""
PHOENIX Baseline Reconstruction Test Summary
==========================================

Test Configuration:
- Type: {self.config.experiment_type.value}
- Target Agent: {self.target.name}
- Spirit: {self.target.spirit}
- Style: {self.target.style}

Method Comparison:
"""

        for method_name, comparison in summary.get('method_comparison', {}).items():
            report += f"""
{method_name.upper()}:
- Trait Accuracy: {comparison['trait_accuracy']:.3f}
- Performance Match: {comparison['performance_match']:.3f}
- Behavioral Similarity: {comparison['behavioral_similarity']:.3f}
- Knowledge Fidelity: {comparison['knowledge_fidelity']:.3f}
- Overall Success: {comparison['overall_success']:.3f}
"""

        report += f"""
Best Method: {summary.get('best_method', 'Unknown')}
Best Score: {summary.get('best_score', 0):.3f}

Test completed at: {results.get('end_time', 'Unknown')}
"""

        return report


async def main():
    """Main test runner."""

    # Create test configuration
    config = ExperimentConfig(
        experiment_type=ExperimentType.BASELINE,
        num_trials=1,
        results_dir="test_results",
        log_level="INFO"
    )

    # Run test
    runner = SimpleTestRunner(config)
    results = await runner.run_baseline_test()

    # Print summary
    print("\n" + "="*60)
    print("BASELINE TEST COMPLETED SUCCESSFULLY")
    print("="*60)

    summary = results.get('summary', {})
    if 'best_method' in summary:
        print(f"Best Method: {summary['best_method']}")
        print(f"Best Score: {summary['best_score']:.3f}")

    print(f"Results saved to: {config.results_dir}")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
