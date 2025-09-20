"""
Experiment Orchestrator

Main orchestrator for agent reconstruction experiments.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from .config import ExperimentConfig, ExperimentType, create_success_advisor_target
from .baseline import BaselineReconstruction
from .phoenix_reconstruction import PhoenixReconstruction
from .evaluator import AgentEvaluator
from .analyzer import StatisticalAnalyzer
from .metrics import ReconstructionMetrics


class ExperimentOrchestrator:
    """Main orchestrator for agent reconstruction experiments."""

    def __init__(self, config: ExperimentConfig):
        """Initialize experiment orchestrator."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.results: Dict[str, Any] = {}

        # Initialize components
        self.target = create_success_advisor_target()
        self.baseline_reconstruction = BaselineReconstruction(self.target)
        self.phoenix_reconstruction = PhoenixReconstruction(self.target, config)
        self.evaluator = AgentEvaluator(self.target)
        self.analyzer = StatisticalAnalyzer(config)

        # Setup logging
        self._setup_logging()

    def _setup_logging(self):
        """Setup logging configuration."""
        log_file = Path(self.config.results_dir) / "experiment.log"
        log_file.parent.mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )

    async def run_experiment(self) -> Dict[str, Any]:
        """Run complete experiment."""

        self.logger.info(f"Starting experiment: {self.config.experiment_type.value}")

        # Initialize results structure
        self.results = {
            'experiment_config': self.config.__dict__,
            'target_agent': self.target.__dict__,
            'start_time': datetime.now().isoformat(),
            'trials': [],
            'summary': {}
        }

        # Run multiple trials
        for trial in range(self.config.num_trials):
            self.logger.info(f"Running trial {trial + 1}/{self.config.num_trials}")

            trial_result = await self._run_single_trial(trial)
            self.results['trials'].append(trial_result)

            if self.config.save_intermediate:
                await self._save_intermediate_results()

        # Analyze results
        self.results['summary'] = await self.analyzer.analyze_results(self.results['trials'])
        self.results['end_time'] = datetime.now().isoformat()

        # Save final results
        await self._save_final_results()

        self.logger.info("Experiment completed successfully")
        return self.results

    async def _run_single_trial(self, trial_number: int) -> Dict[str, Any]:
        """Run a single experimental trial."""

        trial_result = {
            'trial_number': trial_number,
            'start_time': datetime.now().isoformat(),
            'methods': {}
        }

        # Run baseline methods
        if self.config.experiment_type in [ExperimentType.BASELINE, ExperimentType.COMPARATIVE]:
            baseline_results = await self._run_baseline_methods()
            trial_result['methods']['baseline'] = baseline_results

        # Run PHOENIX methods
        if self.config.experiment_type in [ExperimentType.PHOENIX_EVOLUTIONARY,
                                          ExperimentType.PHOENIX_DIRECT,
                                          ExperimentType.COMPARATIVE]:
            phoenix_results = await self._run_phoenix_methods()
            trial_result['methods']['phoenix'] = phoenix_results

        trial_result['end_time'] = datetime.now().isoformat()
        return trial_result

    async def _run_baseline_methods(self) -> Dict[str, Any]:
        """Run baseline reconstruction methods."""

        baseline_results = {}

        # Random baseline
        random_agent = self.baseline_reconstruction.reconstruct_random()
        random_metrics = self.baseline_reconstruction.evaluate_reconstruction()
        baseline_results['random'] = {
            'agent': random_agent.__dict__,
            'metrics': random_metrics.to_dict()
        }

        # Average baseline
        average_agent = self.baseline_reconstruction.reconstruct_average()
        average_metrics = self.baseline_reconstruction.evaluate_reconstruction()
        baseline_results['average'] = {
            'agent': average_agent.__dict__,
            'metrics': average_metrics.to_dict()
        }

        # Documentation baseline
        doc_data = {
            'personality_traits': self.target.personality_traits,
            'physical_traits': self.target.physical_traits,
            'ability_traits': self.target.ability_traits,
            'knowledge_base': {
                'domain_expertise': self.target.domain_expertise,
                'specializations': self.target.specializations,
                'achievements': self.target.achievements
            }
        }

        doc_agent = self.baseline_reconstruction.reconstruct_documentation_based(doc_data)
        doc_metrics = self.baseline_reconstruction.evaluate_reconstruction()
        baseline_results['documentation'] = {
            'agent': doc_agent.__dict__,
            'metrics': doc_metrics.to_dict()
        }

        return baseline_results

    async def _run_phoenix_methods(self) -> Dict[str, Any]:
        """Run PHOENIX reconstruction methods."""

        phoenix_results = {}

        # Evolutionary reconstruction
        if self.config.experiment_type in [ExperimentType.PHOENIX_EVOLUTIONARY,
                                          ExperimentType.COMPARATIVE]:
            evolutionary_agent = await self.phoenix_reconstruction.reconstruct_evolutionary()
            evolutionary_metrics = await self.phoenix_reconstruction.evaluate_reconstruction()
            phoenix_results['evolutionary'] = {
                'agent': evolutionary_agent.__dict__,
                'metrics': evolutionary_metrics.to_dict()
            }

        # Direct reconstruction
        if self.config.experiment_type in [ExperimentType.PHOENIX_DIRECT,
                                          ExperimentType.COMPARATIVE]:
            # Generate synthetic training data
            training_data = await self._generate_training_data()
            direct_agent = await self.phoenix_reconstruction.reconstruct_direct(training_data)
            direct_metrics = await self.phoenix_reconstruction.evaluate_reconstruction()
            phoenix_results['direct'] = {
                'agent': direct_agent.__dict__,
                'metrics': direct_metrics.to_dict()
            }

        return phoenix_results

    async def _generate_training_data(self) -> List[str]:
        """Generate synthetic training data for reconstruction."""

        # Generate data based on target agent characteristics
        training_data = []

        # Add domain-specific content
        for domain in self.target.domain_expertise:
            training_data.append(f"Expertise in {domain} with high proficiency and deep understanding.")

        # Add specialization content
        for spec in self.target.specializations:
            training_data.append(f"Specialized in {spec} with proven track record and expertise.")

        # Add achievement content
        for achievement in self.target.achievements:
            training_data.append(f"Successfully achieved: {achievement}")

        # Add trait-based content
        for trait, value in self.target.personality_traits.items():
            if value > 0.8:
                training_data.append(f"Demonstrates high {trait} in all interactions and decisions.")

        return training_data

    async def _save_intermediate_results(self):
        """Save intermediate results."""

        results_file = Path(self.config.results_dir) / "intermediate_results.json"
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

    async def _save_final_results(self):
        """Save final results."""

        results_file = Path(self.config.results_dir) / "final_results.json"
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

        # Save summary report
        summary_file = Path(self.config.results_dir) / "summary_report.txt"
        with open(summary_file, 'w') as f:
            f.write(self._generate_summary_report())

    def _generate_summary_report(self) -> str:
        """Generate summary report."""

        summary = self.results.get('summary', {})

        report = f"""
PHOENIX Agent Reconstruction Experiment Summary
==============================================

Experiment Configuration:
- Type: {self.config.experiment_type.value}
- Trials: {self.config.num_trials}
- Population Size: {self.config.population_size}
- Max Generations: {self.config.max_generations}

Target Agent: {self.target.name}
- Spirit: {self.target.spirit}
- Style: {self.target.style}
- Expected Accuracy: {self.target.expected_accuracy}

Results Summary:
{json.dumps(summary, indent=2)}

Experiment completed at: {self.results.get('end_time', 'Unknown')}
"""

        return report
