"""
VULCAN Model Manager: Handles model loading and management for Qwen3-8B.

This module provides comprehensive model management capabilities including
loading, configuration, and optimization for the VULCAN training framework.
"""

import logging
from typing import Any, Dict, Optional, Tuple

import torch
from rich.console import Console
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

logger = logging.getLogger(__name__)
console = Console()


class ModelManager:
    """
    🔥 VULCAN Model Manager - Precision model craftsmanship.

    Handles all aspects of model loading, configuration, and optimization
    for Qwen3-8B within the VULCAN training framework.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.tokenizer = None

    def load_model(self) -> Tuple[torch.nn.Module, Any]:
        """Load the Qwen3-8B model and tokenizer."""
        logger.info("🔥 VULCAN: Loading Qwen3-8B model...")

        model_name = self.config["model"]["name"]

        # Load tokenizer
        self.tokenizer = self._load_tokenizer(model_name)

        # Load model with optimizations
        self.model = self._load_model_with_optimizations(model_name)

        logger.info("🔥 VULCAN: Model loaded successfully!")
        return self.model, self.tokenizer

    def _load_tokenizer(self, model_name: str) -> AutoTokenizer:
        """Load and configure the tokenizer."""
        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True,
            use_fast=True,
        )

        # Set pad token if not present
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        # Configure tokenizer settings
        tokenizer.padding_side = "right"
        tokenizer.truncation_side = "left"

        return tokenizer

    def _load_model_with_optimizations(self, model_name: str) -> torch.nn.Module:
        """Load model with modern PyTorch 2.8.0 optimizations for RTX 4090."""
        # Configure quantization if enabled
        quantization_config = self._get_quantization_config()

        # Use PyTorch 2.8.0's built-in attention implementation
        attention_impl = self.config.get("rtx4090_optimizations", {}).get("attention_implementation", "sdpa")

        # Load model with modern optimizations
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            torch_dtype=torch.bfloat16,
            trust_remote_code=True,
            attn_implementation=attention_impl,  # Use PyTorch's built-in SDPA
        )

        # Apply BetterTransformer optimization if enabled
        if self.config.get("rtx4090_optimizations", {}).get("use_bettertransformer", False):
            model = self._apply_bettertransformer(model)

        # Apply torch.compile for PyTorch 2.8.0 speedup
        if self.config.get("rtx4090_optimizations", {}).get("use_torch_compile", False):
            model = self._apply_torch_compile(model)

        # Enable gradient checkpointing for memory efficiency
        if self.config["advanced"]["gradient_checkpointing"]:
            model.gradient_checkpointing_enable()

        return model

    def _get_quantization_config(self) -> Optional[BitsAndBytesConfig]:
        """Get quantization configuration if enabled."""
        if not self.config.get("memory", {}).get("use_4bit", False):
            return None

        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
        )

    def _apply_bettertransformer(self, model: torch.nn.Module) -> torch.nn.Module:
        """Apply BetterTransformer optimization for RTX 4090."""
        try:
            from optimum.bettertransformer import BetterTransformer
            logger.info("🔥 VULCAN: Applying BetterTransformer optimization...")
            model = BetterTransformer.transform(model)
            return model
        except ImportError:
            logger.warning("BetterTransformer not available, skipping optimization")
            return model

    def _apply_torch_compile(self, model: torch.nn.Module) -> torch.nn.Module:
        """Apply PyTorch 2.8.0 torch.compile for RTX 4090 speedup."""
        try:
            logger.info("🔥 VULCAN: Applying torch.compile optimization...")
            # Use torch.compile with optimal settings for RTX 4090
            model = torch.compile(
                model,
                mode="reduce-overhead",  # Optimize for inference speed
                fullgraph=True,  # Compile the entire model
            )
            return model
        except Exception as e:
            logger.warning(f"torch.compile failed: {e}, continuing without compilation")
            return model

    def get_model_info(self) -> Dict[str, Any]:
        """Get comprehensive model information."""
        if self.model is None:
            raise RuntimeError("Model not loaded")

        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)

        return {
            "model_name": self.config["model"]["name"],
            "total_parameters": total_params,
            "trainable_parameters": trainable_params,
            "model_size_gb": total_params * 4 / (1024**3),  # Approximate size in GB
            "device": next(self.model.parameters()).device,
            "dtype": next(self.model.parameters()).dtype,
            "gradient_checkpointing": self.model.gradient_checkpointing_enabled,
        }

    def display_model_info(self) -> None:
        """Display model information in a rich format."""
        info = self.get_model_info()

        console.print(
            f"🔥 VULCAN Model Info:\n"
            f"📦 Model: {info['model_name']}\n"
            f"🧠 Total Parameters: {info['total_parameters']:,}\n"
            f"⚡ Trainable Parameters: {info['trainable_parameters']:,}\n"
            f"💾 Model Size: {info['model_size_gb']:.2f} GB\n"
            f"🖥️  Device: {info['device']}\n"
            f"🔢 Data Type: {info['dtype']}\n"
            f"💾 Gradient Checkpointing: {info['gradient_checkpointing']}"
        )
