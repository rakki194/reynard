#!/usr/bin/env python3
"""
VULCAN Training Script: Main entry point for model training.

This script provides the main entry point for training Qwen3-8B models
with LoRA optimization using the VULCAN framework.
"""

import argparse
import logging
import sys
from pathlib import Path

import yaml
from rich.console import Console
from rich.panel import Panel

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from trainer import VulcanTrainer

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
console = Console()


def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="VULCAN: Versatile Unified Learning Capability And Neural Training")

    parser.add_argument(
        "--config",
        type=str,
        default="config/qwen3_config.yaml",
        help="Path to configuration file"
    )

    parser.add_argument(
        "--data_path",
        type=str,
        help="Path to training data file"
    )

    parser.add_argument(
        "--output_dir",
        type=str,
        help="Output directory for trained model"
    )

    parser.add_argument(
        "--resume_from_checkpoint",
        type=str,
        help="Path to checkpoint to resume from"
    )

    parser.add_argument(
        "--lora_rank",
        type=int,
        help="LoRA rank (overrides config)"
    )

    parser.add_argument(
        "--learning_rate",
        type=float,
        help="Learning rate (overrides config)"
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        help="Batch size (overrides config)"
    )

    args = parser.parse_args()

    # Display VULCAN banner
    console.print(
        Panel.fit(
            "🔥 VULCAN: Versatile Unified Learning Capability And Neural Training\n"
            "⚒️  Forging models through precision craftsmanship",
            title="VULCAN Training Framework",
            border_style="red",
        )
    )

    try:
        # Load configuration
        logger.info(f"🔥 VULCAN: Loading configuration from {args.config}")
        config = load_config(args.config)

        # Override config with command line arguments
        if args.data_path:
            config["data"]["data_path"] = args.data_path
        if args.output_dir:
            config["output"]["output_dir"] = args.output_dir
        if args.lora_rank:
            config["lora"]["rank"] = args.lora_rank
        if args.learning_rate:
            config["training"]["learning_rate"] = args.learning_rate
        if args.batch_size:
            config["training"]["batch_size"] = args.batch_size

        # Initialize trainer
        logger.info("🔥 VULCAN: Initializing trainer...")
        trainer = VulcanTrainer(config)

        # Setup training
        logger.info("🔥 VULCAN: Setting up training environment...")
        trainer.setup_training()

        # Resume from checkpoint if specified
        if args.resume_from_checkpoint:
            logger.info(f"🔥 VULCAN: Resuming from checkpoint {args.resume_from_checkpoint}")
            # Implementation for checkpoint resumption would go here

        # Start training
        logger.info("🔥 VULCAN: Starting training process...")
        results = trainer.train()

        # Display final results
        console.print(
            Panel.fit(
                f"🔥 VULCAN Training Complete!\n"
                f"⏱️  Training Time: {results['training_time']:.2f}s\n"
                f"📉 Final Loss: {results['final_loss']:.4f}\n"
                f"🎯 Best Eval Loss: {results['best_eval_loss']:.4f}\n"
                f"📊 Total Steps: {results['total_steps']}\n"
                f"🧠 Trainable Parameters: {results['trainable_parameters']:,}",
                title="VULCAN Forging Complete",
                border_style="green",
            )
        )

        logger.info("🔥 VULCAN: Training completed successfully!")

    except Exception as e:
        logger.error(f"🔥 VULCAN: Training failed - {e}")
        console.print(
            Panel.fit(
                f"🔥 VULCAN Training Failed!\n"
                f"❌ Error: {str(e)}",
                title="VULCAN Forging Failed",
                border_style="red",
            )
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
