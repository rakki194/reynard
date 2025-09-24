#!/usr/bin/env python3
"""VULCAN Evaluation Script: Model evaluation and testing.

This script provides comprehensive model evaluation capabilities for
trained Qwen3-8B models using the VULCAN framework.
"""

import argparse
import logging
import sys
from pathlib import Path

import torch
import yaml
from rich.console import Console
from rich.panel import Panel
from transformers import AutoModelForCausalLM, AutoTokenizer

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from data_processor import DataProcessor
from evaluator import ModelEvaluator

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
console = Console()


def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path) as f:
        config = yaml.safe_load(f)
    return config


def load_model_and_tokenizer(model_path: str):
    """Load model and tokenizer from path."""
    logger.info(f"🔥 VULCAN: Loading model from {model_path}")

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
    )

    return model, tokenizer


def main():
    """Main evaluation function."""
    parser = argparse.ArgumentParser(description="VULCAN Model Evaluation")

    parser.add_argument(
        "--model_path", type=str, required=True, help="Path to trained model",
    )

    parser.add_argument("--eval_data", type=str, help="Path to evaluation data file")

    parser.add_argument(
        "--config",
        type=str,
        default="config/qwen3_config.yaml",
        help="Path to configuration file",
    )

    parser.add_argument(
        "--output_file", type=str, help="Output file for evaluation results",
    )

    parser.add_argument(
        "--generate_samples",
        action="store_true",
        help="Generate sample responses for evaluation",
    )

    parser.add_argument(
        "--num_samples",
        type=int,
        default=5,
        help="Number of sample responses to generate",
    )

    args = parser.parse_args()

    # Display VULCAN banner
    console.print(
        Panel.fit(
            "🔥 VULCAN: Model Evaluation Framework\n"
            "⚒️  Assessing model craftsmanship",
            title="VULCAN Evaluation",
            border_style="blue",
        ),
    )

    try:
        # Load configuration
        logger.info(f"🔥 VULCAN: Loading configuration from {args.config}")
        config = load_config(args.config)

        # Load model and tokenizer
        model, tokenizer = load_model_and_tokenizer(args.model_path)

        # Initialize evaluator
        evaluator = ModelEvaluator(config)
        evaluator.set_model(model, tokenizer)

        # Load evaluation data if provided
        if args.eval_data:
            logger.info(f"🔥 VULCAN: Loading evaluation data from {args.eval_data}")

            # Initialize data processor
            data_processor = DataProcessor(config)
            data_processor.set_tokenizer(tokenizer)

            # Load and process evaluation data
            eval_dataset, _ = data_processor.load_datasets(args.eval_data)

            # Run evaluation
            logger.info("🔥 VULCAN: Running comprehensive evaluation...")
            results = evaluator.evaluate(eval_dataset)

            # Display results
            console.print(
                Panel.fit(
                    f"🔥 VULCAN Evaluation Results:\n"
                    f"📉 Perplexity: {results['perplexity']:.4f}\n"
                    f"📊 BLEU Score: {results['bleu_score']:.4f}\n"
                    f"📏 Avg Response Length: {results['average_response_length']:.1f} tokens\n"
                    f"🔤 Vocabulary Diversity: {results['vocabulary_diversity']:.4f}\n"
                    f"🧠 Coherence Score: {results['coherence_score']:.4f}",
                    title="VULCAN Evaluation Complete",
                    border_style="green",
                ),
            )

            # Save results if output file specified
            if args.output_file:
                import json

                with open(args.output_file, "w") as f:
                    json.dump(results, f, indent=2)
                logger.info(f"🔥 VULCAN: Results saved to {args.output_file}")

        # Generate sample responses if requested
        if args.generate_samples:
            logger.info("🔥 VULCAN: Generating sample responses...")

            sample_prompts = [
                "Explain the concept of machine learning in simple terms.",
                "Write a Python function to sort a list of numbers.",
                "What are the benefits of renewable energy?",
                "Describe the process of photosynthesis.",
                "How does a neural network learn?",
            ]

            # Limit to requested number
            sample_prompts = sample_prompts[: args.num_samples]

            responses = evaluator.generate_sample_responses(sample_prompts)

            # Display sample responses
            console.print(
                Panel.fit(
                    "🔥 VULCAN Sample Responses:",
                    title="Generated Samples",
                    border_style="yellow",
                ),
            )

            for i, (prompt, response) in enumerate(zip(sample_prompts, responses, strict=False)):
                console.print(f"\n📝 Prompt {i+1}: {prompt}")
                console.print(f"🤖 Response: {response}")
                console.print("-" * 50)

        logger.info("🔥 VULCAN: Evaluation completed successfully!")

    except Exception as e:
        logger.error(f"🔥 VULCAN: Evaluation failed - {e}")
        console.print(
            Panel.fit(
                f"🔥 VULCAN Evaluation Failed!\n❌ Error: {e!s}",
                title="VULCAN Evaluation Failed",
                border_style="red",
            ),
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
