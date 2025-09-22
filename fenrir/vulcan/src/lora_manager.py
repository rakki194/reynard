"""
VULCAN LoRA Manager: Handles LoRA adapter configuration and application.

This module provides comprehensive LoRA (Low-Rank Adaptation) management
for efficient fine-tuning of Qwen3-8B models within the VULCAN framework.
"""

import logging
from typing import Any, Dict, List, Optional

import torch
from peft import LoraConfig, PeftModel, TaskType, get_peft_model
from rich.console import Console

logger = logging.getLogger(__name__)
console = Console()


class LoRAManager:
    """
    🔥 VULCAN LoRA Manager - Precision adapter craftsmanship.

    Handles all aspects of LoRA adapter configuration, application, and
    management for efficient fine-tuning of Qwen3-8B models.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.lora_config = None
        self.peft_model = None

    def apply_lora(self, model: torch.nn.Module) -> PeftModel:
        """Apply LoRA adapters to the model."""
        logger.info("🔥 VULCAN: Applying LoRA adapters...")

        # Create LoRA configuration
        self.lora_config = self._create_lora_config()

        # Apply LoRA to model
        self.peft_model = get_peft_model(model, self.lora_config)

        # Display LoRA information
        self._display_lora_info()

        logger.info("🔥 VULCAN: LoRA adapters applied successfully!")
        return self.peft_model

    def _create_lora_config(self) -> LoraConfig:
        """Create LoRA configuration from config."""
        lora_config = self.config["lora"]

        return LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            r=lora_config["rank"],
            lora_alpha=lora_config["alpha"],
            lora_dropout=lora_config["dropout"],
            target_modules=lora_config["target_modules"],
            bias="none",
            inference_mode=False,
        )

    def _display_lora_info(self) -> None:
        """Display LoRA configuration information."""
        if self.peft_model is None:
            return

        # Get trainable parameters
        trainable_params = sum(p.numel() for p in self.peft_model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in self.peft_model.parameters())

        # Calculate memory efficiency
        memory_efficiency = (1 - trainable_params / total_params) * 100

        console.print(
            f"🔥 VULCAN LoRA Info:\n"
            f"📊 Rank: {self.lora_config.r}\n"
            f"⚡ Alpha: {self.lora_config.lora_alpha}\n"
            f"💧 Dropout: {self.lora_config.lora_dropout}\n"
            f"🎯 Target Modules: {len(self.lora_config.target_modules)}\n"
            f"⚡ Trainable Parameters: {trainable_params:,}\n"
            f"🧠 Total Parameters: {total_params:,}\n"
            f"💾 Memory Efficiency: {memory_efficiency:.1f}%"
        )

    def save_lora_adapters(self, output_dir: str) -> None:
        """Save LoRA adapters to disk."""
        if self.peft_model is None:
            raise RuntimeError("LoRA not applied to model")

        logger.info(f"🔥 VULCAN: Saving LoRA adapters to {output_dir}")
        self.peft_model.save_pretrained(output_dir)

    def load_lora_adapters(self, model: torch.nn.Module, adapter_path: str) -> PeftModel:
        """Load LoRA adapters from disk."""
        logger.info(f"🔥 VULCAN: Loading LoRA adapters from {adapter_path}")

        self.peft_model = PeftModel.from_pretrained(model, adapter_path)
        return self.peft_model

    def merge_lora_weights(self) -> torch.nn.Module:
        """Merge LoRA weights into base model."""
        if self.peft_model is None:
            raise RuntimeError("LoRA not applied to model")

        logger.info("🔥 VULCAN: Merging LoRA weights...")
        merged_model = self.peft_model.merge_and_unload()

        logger.info("🔥 VULCAN: LoRA weights merged successfully!")
        return merged_model

    def get_lora_statistics(self) -> Dict[str, Any]:
        """Get comprehensive LoRA statistics."""
        if self.peft_model is None:
            raise RuntimeError("LoRA not applied to model")

        trainable_params = sum(p.numel() for p in self.peft_model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in self.peft_model.parameters())

        return {
            "lora_rank": self.lora_config.r,
            "lora_alpha": self.lora_config.lora_alpha,
            "lora_dropout": self.lora_config.lora_dropout,
            "target_modules": self.lora_config.target_modules,
            "trainable_parameters": trainable_params,
            "total_parameters": total_params,
            "memory_efficiency": (1 - trainable_params / total_params) * 100,
            "parameter_reduction": (1 - trainable_params / total_params) * 100,
        }

    def create_lora_variant(self, variant_name: str) -> LoraConfig:
        """Create a LoRA variant from configuration."""
        variants = self.config.get("variants", {})

        if variant_name not in variants:
            raise ValueError(f"LoRA variant '{variant_name}' not found in config")

        variant_config = variants[variant_name]

        return LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            r=variant_config["rank"],
            lora_alpha=variant_config["alpha"],
            lora_dropout=variant_config["dropout"],
            target_modules=variant_config["target_modules"],
            bias="none",
            inference_mode=False,
        )
