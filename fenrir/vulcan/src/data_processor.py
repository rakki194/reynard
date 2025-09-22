"""
VULCAN Data Processor: Handles data loading and preprocessing for training.

This module provides comprehensive data processing capabilities including
loading, preprocessing, and formatting of training data for the VULCAN framework.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import torch
from datasets import Dataset, load_dataset
from rich.console import Console
from transformers import PreTrainedTokenizer

logger = logging.getLogger(__name__)
console = Console()


class DataProcessor:
    """
    🔥 VULCAN Data Processor - Precision data craftsmanship.

    Handles all aspects of data loading, preprocessing, and formatting
    for training Qwen3-8B models within the VULCAN framework.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tokenizer = None
        self.max_length = config["model"]["max_length"]
        self.enable_thinking = config["model"].get("enable_thinking", True)

    def set_tokenizer(self, tokenizer: PreTrainedTokenizer) -> None:
        """Set the tokenizer for data processing."""
        self.tokenizer = tokenizer

    def load_datasets(self, data_path: Optional[str] = None) -> Tuple[Dataset, Dataset]:
        """Load and process training datasets."""
        if self.tokenizer is None:
            raise RuntimeError("Tokenizer not set. Call set_tokenizer() first.")

        logger.info("🔥 VULCAN: Loading training datasets...")

        # Load raw data
        if data_path:
            raw_data = self._load_from_file(data_path)
        else:
            raw_data = self._load_default_dataset()

        # Process data
        processed_data = self._process_dataset(raw_data)

        # Split into train/validation
        train_dataset, eval_dataset = self._split_dataset(processed_data)

        logger.info(
            f"🔥 VULCAN: Loaded {len(train_dataset)} training samples, {len(eval_dataset)} validation samples"
        )
        return train_dataset, eval_dataset

    def _load_from_file(self, data_path: str) -> List[Dict[str, Any]]:
        """Load data from file."""
        data_path = Path(data_path)

        if data_path.suffix == ".jsonl":
            return self._load_jsonl(data_path)
        elif data_path.suffix == ".json":
            return self._load_json(data_path)
        else:
            raise ValueError(f"Unsupported file format: {data_path.suffix}")

    def _load_jsonl(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load JSONL file."""
        data = []
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                data.append(json.loads(line.strip()))
        return data

    def _load_json(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load JSON file."""
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_default_dataset(self) -> List[Dict[str, Any]]:
        """Load default dataset for testing."""
        return [
            {
                "instruction": "Explain the concept of machine learning",
                "input": "",
                "output": "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.",
            },
            {
                "instruction": "Write a Python function to calculate fibonacci numbers",
                "input": "",
                "output": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
            },
        ]

    def _process_dataset(self, raw_data: List[Dict[str, Any]]) -> Dataset:
        """Process raw data into training format."""
        processed_data = []

        for item in raw_data:
            # Format conversation
            if "conversation" in item:
                text = self._format_conversation(item["conversation"])
            else:
                text = self._format_instruction(item)

            # Tokenize
            tokenized = self._tokenize_text(text)

            if tokenized is not None:
                processed_data.append(tokenized)

        return Dataset.from_list(processed_data)

    def _format_conversation(self, conversation: List[Dict[str, str]]) -> str:
        """Format conversation data for training."""
        formatted = ""

        for turn in conversation:
            role = turn["role"]
            content = turn["content"]

            if role == "user":
                formatted += f"<|im_start|>user\n{content}<|im_end|>\n"
            elif role == "assistant":
                formatted += f"<|im_start|>assistant\n{content}<|im_end|>\n"

        return formatted

    def _format_instruction(self, item: Dict[str, Any]) -> str:
        """Format instruction-following data for training."""
        instruction = item.get("instruction", "")
        input_text = item.get("input", "")
        output = item.get("output", "")

        if input_text:
            prompt = f"<|im_start|>user\n{instruction}\n{input_text}<|im_end|>\n<|im_start|>assistant\n{output}<|im_end|>"
        else:
            prompt = f"<|im_start|>user\n{instruction}<|im_end|>\n<|im_start|>assistant\n{output}<|im_end|>"

        return prompt

    def _tokenize_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Tokenize text for training."""
        # Tokenize with truncation and padding
        tokenized = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )

        # Check if text is too long
        if len(tokenized["input_ids"][0]) < 10:  # Minimum length check
            return None

        return {
            "input_ids": tokenized["input_ids"].squeeze(),
            "attention_mask": tokenized["attention_mask"].squeeze(),
            "labels": tokenized["input_ids"].squeeze(),  # For causal LM
        }

    def _split_dataset(self, dataset: Dataset) -> Tuple[Dataset, Dataset]:
        """Split dataset into train and validation sets."""
        data_config = self.config["data"]
        train_split = data_config["train_split"]
        val_split = data_config["val_split"]

        # Split dataset
        split_dataset = dataset.train_test_split(
            test_size=val_split,
            seed=data_config["seed"],
            shuffle=data_config["shuffle"],
        )

        return split_dataset["train"], split_dataset["test"]

    def get_data_statistics(self, dataset: Dataset) -> Dict[str, Any]:
        """Get comprehensive data statistics."""
        total_samples = len(dataset)

        # Calculate average length
        lengths = [len(item["input_ids"]) for item in dataset]
        avg_length = sum(lengths) / len(lengths)
        max_length = max(lengths)
        min_length = min(lengths)

        return {
            "total_samples": total_samples,
            "average_length": avg_length,
            "max_length": max_length,
            "min_length": min_length,
            "max_length_configured": self.max_length,
            "enable_thinking": self.enable_thinking,
        }

    def display_data_statistics(self, dataset: Dataset) -> None:
        """Display data statistics in a rich format."""
        stats = self.get_data_statistics(dataset)

        console.print(
            f"🔥 VULCAN Data Statistics:\n"
            f"📊 Total Samples: {stats['total_samples']:,}\n"
            f"📏 Average Length: {stats['average_length']:.1f} tokens\n"
            f"📏 Max Length: {stats['max_length']} tokens\n"
            f"📏 Min Length: {stats['min_length']} tokens\n"
            f"⚙️  Configured Max: {stats['max_length_configured']} tokens\n"
            f"🧠 Thinking Mode: {stats['enable_thinking']}"
        )
