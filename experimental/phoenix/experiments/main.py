"""Main Experiment Runner

Main entry point for agent reconstruction experiments.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

import argparse
import asyncio
import sys

from .config import ExperimentConfig, ExperimentType
from .orchestrator import ExperimentOrchestrator


async def main():
    """Main experiment runner."""
    parser = argparse.ArgumentParser(
        description="PHOENIX Agent Reconstruction Experiments",
    )
    parser.add_argument(
        "--experiment-type",
        type=str,
        default="comparative",
        choices=["baseline", "phoenix_evolutionary", "phoenix_direct", "comparative"],
        help="Type of experiment to run",
    )
    parser.add_argument(
        "--trials", type=int, default=10, help="Number of trials to run",
    )
    parser.add_argument(
        "--population-size",
        type=int,
        default=50,
        help="Population size for evolutionary methods",
    )
    parser.add_argument(
        "--max-generations",
        type=int,
        default=20,
        help="Maximum generations for evolutionary methods",
    )
    parser.add_argument(
        "--results-dir", type=str, default="results", help="Directory to save results",
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level",
    )

    args = parser.parse_args()

    # Create experiment configuration
    config = ExperimentConfig(
        experiment_type=ExperimentType(args.experiment_type),
        num_trials=args.trials,
        population_size=args.population_size,
        max_generations=args.max_generations,
        results_dir=args.results_dir,
        log_level=args.log_level,
    )

    # Create and run experiment
    orchestrator = ExperimentOrchestrator(config)

    try:
        results = await orchestrator.run_experiment()

        # Print summary
        print("\n" + "=" * 60)
        print("EXPERIMENT COMPLETED SUCCESSFULLY")
        print("=" * 60)

        summary = results.get("summary", {})
        if "recommendations" in summary:
            print("\nRECOMMENDATIONS:")
            for i, rec in enumerate(summary["recommendations"], 1):
                print(f"{i}. {rec}")

        print(f"\nResults saved to: {config.results_dir}")
        print("=" * 60)

    except Exception as e:
        print(f"Experiment failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
