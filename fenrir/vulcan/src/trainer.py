"""
VULCAN Trainer: Main training orchestrator for Qwen3-8B with LoRA.

This module provides the core training functionality for the VULCAN framework,
handling the complete training pipeline from data loading to model evaluation.
"""

import logging
import time
from pathlib import Path
from typing import Any, Dict, Optional

import torch
from rich.console import Console
from rich.panel import Panel
from transformers import DataCollatorForLanguageModeling, Trainer, TrainingArguments

from .data_processor import DataProcessor
from .evaluator import ModelEvaluator
from .lora_manager import LoRAManager
from .model_manager import ModelManager

logger = logging.getLogger(__name__)
console = Console()


class VulcanTrainer:
    """
    🔥 VULCAN Trainer - Forging models through precision craftsmanship.

    Main training orchestrator that coordinates all components of the
    VULCAN training pipeline for Qwen3-8B with LoRA optimization.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model_manager = ModelManager(config)
        self.lora_manager = LoRAManager(config)
        self.data_processor = DataProcessor(config)
        self.evaluator = ModelEvaluator(config)

        # Training components
        self.model = None
        self.tokenizer = None
        self.trainer = None
        self.training_args = None

        # Training state
        self.training_start_time = None
        self.best_metric = float("inf")

    def setup_training(self) -> None:
        """Setup the complete training environment."""
        logger.info("🔥 VULCAN: Setting up training forge...")

        # Load model and tokenizer
        self.model, self.tokenizer = self.model_manager.load_model()

        # Apply LoRA adapters
        self.model = self.lora_manager.apply_lora(self.model)

        # Setup training arguments
        self.training_args = self._create_training_arguments()

        # Load and process data
        train_dataset, eval_dataset = self.data_processor.load_datasets()

        # Create data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,  # Causal language modeling
        )

        # Initialize trainer
        self.trainer = Trainer(
            model=self.model,
            args=self.training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            tokenizer=self.tokenizer,
        )

        logger.info("🔥 VULCAN: Training forge ready!")

    def train(self) -> Dict[str, Any]:
        """Execute the training process."""
        if self.trainer is None:
            raise RuntimeError("Training not setup. Call setup_training() first.")

        logger.info("🔥 VULCAN: Beginning the forging process...")
        self.training_start_time = time.time()

        try:
            # Execute training
            training_result = self.trainer.train()

            # Save final model
            self._save_final_model()

            # Generate training report
            report = self._generate_training_report(training_result)

            # Display results
            self._display_training_results(report)

            return report

        except Exception as e:
            logger.error(f"🔥 VULCAN: Training failed - {e}")
            raise

    def _create_training_arguments(self) -> TrainingArguments:
        """Create training arguments from configuration."""
        return TrainingArguments(
            output_dir=self.config["output"]["output_dir"],
            overwrite_output_dir=self.config["output"]["overwrite_output_dir"],
            num_train_epochs=self.config["training"]["num_epochs"],
            per_device_train_batch_size=self.config["training"]["batch_size"],
            per_device_eval_batch_size=self.config["training"]["batch_size"],
            gradient_accumulation_steps=self.config["training"][
                "gradient_accumulation_steps"
            ],
            learning_rate=self.config["training"]["learning_rate"],
            weight_decay=self.config["training"]["weight_decay"],
            max_grad_norm=self.config["training"]["max_grad_norm"],
            warmup_steps=self.config["training"]["warmup_steps"],
            logging_steps=self.config["logging"]["logging_steps"],
            eval_steps=self.config["logging"]["eval_steps"],
            save_steps=self.config["logging"]["save_steps"],
            save_total_limit=self.config["logging"]["save_total_limit"],
            load_best_model_at_end=self.config["logging"]["load_best_model_at_end"],
            metric_for_best_model=self.config["logging"]["metric_for_best_model"],
            greater_is_better=self.config["logging"]["greater_is_better"],
            evaluation_strategy=self.config["output"]["evaluation_strategy"],
            save_strategy=self.config["output"]["save_strategy"],
            dataloader_num_workers=self.config["hardware"]["dataloader_num_workers"],
            dataloader_pin_memory=self.config["hardware"]["dataloader_pin_memory"],
            remove_unused_columns=self.config["advanced"]["remove_unused_columns"],
            dataloader_drop_last=self.config["advanced"]["dataloader_drop_last"],
            gradient_checkpointing=self.config["advanced"]["gradient_checkpointing"],
            ddp_find_unused_parameters=self.config["advanced"][
                "ddp_find_unused_parameters"
            ],
            bf16=self.config["hardware"]["mixed_precision"] == "bf16",
            fp16=self.config["hardware"]["mixed_precision"] == "fp16",
            report_to="tensorboard",
        )

    def _save_final_model(self) -> None:
        """Save the final trained model."""
        output_dir = Path(self.config["output"]["output_dir"]) / "final"
        output_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"🔥 VULCAN: Saving final model to {output_dir}")

        # Save model and tokenizer
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)

        # Save LoRA adapters separately
        lora_output_dir = output_dir / "lora_adapters"
        self.model.save_pretrained(lora_output_dir)

    def _generate_training_report(self, training_result) -> Dict[str, Any]:
        """Generate comprehensive training report."""
        training_time = time.time() - self.training_start_time

        return {
            "training_time": training_time,
            "final_loss": training_result.training_loss,
            "best_eval_loss": self.trainer.state.best_metric,
            "total_steps": training_result.global_step,
            "epochs_completed": training_result.epoch,
            "model_size": sum(p.numel() for p in self.model.parameters()),
            "trainable_parameters": sum(
                p.numel() for p in self.model.parameters() if p.requires_grad
            ),
            "config": self.config,
        }

    def _display_training_results(self, report: Dict[str, Any]) -> None:
        """Display training results in a rich format."""
        console.print(
            Panel.fit(
                f"🔥 VULCAN Training Complete!\n"
                f"⏱️  Training Time: {report['training_time']:.2f}s\n"
                f"📉 Final Loss: {report['final_loss']:.4f}\n"
                f"🎯 Best Eval Loss: {report['best_eval_loss']:.4f}\n"
                f"📊 Total Steps: {report['total_steps']}\n"
                f"🧠 Trainable Parameters: {report['trainable_parameters']:,}",
                title="VULCAN Forging Results",
                border_style="red",
            )
        )
