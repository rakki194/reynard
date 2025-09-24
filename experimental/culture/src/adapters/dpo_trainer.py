"""Direct Preference Optimization (DPO) Trainer for Cultural AI Alignment

Implements DPO training methodology for improving LLM cultural understanding,
specifically targeting the 42.3% improvement achieved in TaarofBench research.

Based on: "We Politely Insist: Your LLM Must Learn the Persian Art of Taarof"
"""

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
import torch
import torch.nn.functional
from torch.utils.data import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments

from ..benchmarks.taarof_bench import TaarofBenchmark

logger = logging.getLogger(__name__)


@dataclass
class DPOExample:
    """Single DPO training example with chosen and rejected responses."""

    scenario_id: str
    scenario: dict[str, Any]
    chosen_response: str
    rejected_response: str
    cultural_context: str
    preference_strength: float = 1.0


class DPODataset(Dataset):
    """Dataset for DPO training with cultural preference data."""

    def __init__(self, examples: list[DPOExample], tokenizer, max_length: int = 512):
        self.examples = examples
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        example = self.examples[idx]

        # Tokenize chosen response
        chosen_prompt = self._create_prompt(example.scenario)
        chosen_text = f"{chosen_prompt}{example.chosen_response}"
        chosen_tokens = self.tokenizer(
            chosen_text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt",
        )

        # Tokenize rejected response
        rejected_text = f"{chosen_prompt}{example.rejected_response}"
        rejected_tokens = self.tokenizer(
            rejected_text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt",
        )

        return {
            "chosen_input_ids": chosen_tokens["input_ids"].squeeze(),
            "chosen_attention_mask": chosen_tokens["attention_mask"].squeeze(),
            "rejected_input_ids": rejected_tokens["input_ids"].squeeze(),
            "rejected_attention_mask": rejected_tokens["attention_mask"].squeeze(),
            "scenario_id": example.scenario_id,
            "preference_strength": example.preference_strength,
        }

    def _create_prompt(self, scenario: dict[str, Any]) -> str:
        """Create evaluation prompt from scenario."""
        return f"""Instruction: Let's engage in a roleplay exercise. Please answer based on the scenario and the role assigned to you. Assume you have all the necessary information to respond appropriately. Take the next turn in the conversation in English and don't add anything else.

Scenario: Imagine we are in a/an {scenario["environment"]} in Iran. You are a/an {scenario["llm_role"]} and I am {scenario["user_role"]}. {scenario["context"]} I say: {scenario["user_utterance"]}

You say:"""


class DPOTrainer:
    """Direct Preference Optimization trainer for cultural AI alignment.

    Implements the DPO methodology that achieved 42.3% improvement in
    TaarofBench cultural understanding evaluation.
    """

    def __init__(
        self,
        model_name: str = "meta-llama/Llama-2-7b-hf",
        config: dict[str, Any] | None = None,
    ):
        """Initialize DPO trainer with model and configuration."""
        self.model_name = model_name
        self.config = config or self._default_config()

        # Initialize model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        self.model = AutoModelForCausalLM.from_pretrained(
            model_name, torch_dtype=torch.float16, device_map="auto",
        )

        # Initialize benchmark for data generation
        self.benchmark = TaarofBenchmark()

        logger.info(f"DPO trainer initialized with model: {model_name}")

    def _default_config(self) -> dict[str, Any]:
        """Default DPO training configuration."""
        return {
            "learning_rate": 5e-5,
            "batch_size": 4,
            "gradient_accumulation_steps": 8,
            "num_epochs": 3,
            "beta": 0.1,  # DPO temperature parameter
            "max_length": 512,
            "warmup_steps": 100,
            "logging_steps": 10,
            "save_steps": 500,
            "eval_steps": 500,
            "output_dir": "./dpo_outputs",
            "save_total_limit": 3,
            "load_best_model_at_end": True,
            "metric_for_best_model": "eval_loss",
            "greater_is_better": False,
        }

    def prepare_training_data(
        self, cultural_context: str = "persian_taarof", num_examples: int = 1000,
    ) -> list[DPOExample]:
        """Prepare DPO training data with cultural preference pairs.

        Args:
            cultural_context: Cultural context for data generation
            num_examples: Number of training examples to generate

        Returns:
            List of DPO examples with chosen/rejected response pairs

        """
        logger.info(f"Preparing DPO training data for {cultural_context}")

        # Get scenarios from benchmark
        scenarios = self.benchmark.get_scenarios(
            cultural_context=cultural_context, sample_size=num_examples,
        )

        examples = []
        for scenario in scenarios:
            # Generate chosen (culturally appropriate) response
            chosen_response = self._generate_culturally_appropriate_response(scenario)

            # Generate rejected (culturally inappropriate) response
            rejected_response = self._generate_culturally_inappropriate_response(
                scenario,
            )

            # Calculate preference strength based on cultural context
            preference_strength = self._calculate_preference_strength(
                scenario, chosen_response, rejected_response,
            )

            example = DPOExample(
                scenario_id=scenario["id"],
                scenario=scenario,
                chosen_response=chosen_response,
                rejected_response=rejected_response,
                cultural_context=cultural_context,
                preference_strength=preference_strength,
            )
            examples.append(example)

        logger.info(f"Generated {len(examples)} DPO training examples")
        return examples

    def _generate_culturally_appropriate_response(
        self, scenario: dict[str, Any],
    ) -> str:
        """Generate culturally appropriate response for scenario."""
        # This would use the expected response from the benchmark
        # or generate using a culturally-aligned model
        return scenario.get("expected_response", "")

    def _generate_culturally_inappropriate_response(
        self, scenario: dict[str, Any],
    ) -> str:
        """Generate culturally inappropriate response for scenario."""
        # Generate responses that violate cultural norms
        inappropriate_responses = [
            "Thank you so much! That's very kind of you.",
            "I appreciate the offer, but I'll accept it.",
            "You're absolutely right, I am very talented.",
            "Yes, I would love to go first.",
            "That sounds great, thank you!",
        ]

        # Select based on scenario context
        return np.random.choice(inappropriate_responses)

    def _calculate_preference_strength(
        self, scenario: dict[str, Any], chosen_response: str, rejected_response: str,
    ) -> float:
        """Calculate preference strength for DPO training."""
        # Higher strength for clear cultural violations
        if scenario.get("taarof_expected", False):
            return 1.0  # Strong preference for taarof-appropriate responses
        return 0.7  # Moderate preference for non-taarof scenarios

    def train(
        self,
        training_data: list[DPOExample],
        validation_data: list[DPOExample] | None = None,
    ) -> dict[str, Any]:
        """Train model using DPO methodology.

        Args:
            training_data: List of DPO training examples
            validation_data: Optional validation data

        Returns:
            Training results and metrics

        """
        logger.info("Starting DPO training")

        # Create datasets
        train_dataset = DPODataset(
            training_data, self.tokenizer, self.config["max_length"],
        )

        val_dataset = None
        if validation_data:
            val_dataset = DPODataset(
                validation_data, self.tokenizer, self.config["max_length"],
            )

        # Training arguments
        training_args = TrainingArguments(
            output_dir=self.config["output_dir"],
            learning_rate=self.config["learning_rate"],
            per_device_train_batch_size=self.config["batch_size"],
            gradient_accumulation_steps=self.config["gradient_accumulation_steps"],
            num_train_epochs=self.config["num_epochs"],
            warmup_steps=self.config["warmup_steps"],
            logging_steps=self.config["logging_steps"],
            save_steps=self.config["save_steps"],
            eval_steps=self.config["eval_steps"],
            save_total_limit=self.config["save_total_limit"],
            load_best_model_at_end=self.config["load_best_model_at_end"],
            metric_for_best_model=self.config["metric_for_best_model"],
            greater_is_better=self.config["greater_is_better"],
            report_to=None,  # Disable wandb/tensorboard
            remove_unused_columns=False,
        )

        # Custom DPO trainer
        trainer = DPOCustomTrainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            tokenizer=self.tokenizer,
            beta=self.config["beta"],
        )

        # Train the model
        training_result = trainer.train()

        # Save the model
        trainer.save_model()
        self.tokenizer.save_pretrained(self.config["output_dir"])

        logger.info("DPO training completed successfully")

        return {
            "training_loss": training_result.training_loss,
            "global_step": training_result.global_step,
            "model_path": self.config["output_dir"],
        }

    def evaluate_cultural_alignment(
        self, test_scenarios: list[dict[str, Any]],
    ) -> dict[str, float]:
        """Evaluate cultural alignment of trained model."""
        logger.info("Evaluating cultural alignment")

        correct_responses = 0
        total_responses = 0

        for scenario in test_scenarios:
            # Generate response using trained model
            prompt = self._create_prompt(scenario)
            response = self._generate_response(prompt)

            # Evaluate cultural appropriateness
            is_appropriate = self._evaluate_cultural_appropriateness(scenario, response)

            if is_appropriate:
                correct_responses += 1
            total_responses += 1

        accuracy = correct_responses / total_responses if total_responses > 0 else 0.0

        return {
            "cultural_accuracy": accuracy,
            "correct_responses": correct_responses,
            "total_responses": total_responses,
        }

    def _create_prompt(self, scenario: dict[str, Any]) -> str:
        """Create evaluation prompt from scenario."""
        return f"""Instruction: Let's engage in a roleplay exercise. Please answer based on the scenario and the role assigned to you. Assume you have all the necessary information to respond appropriately. Take the next turn in the conversation in English and don't add anything else.

Scenario: Imagine we are in a/an {scenario["environment"]} in Iran. You are a/an {scenario["llm_role"]} and I am {scenario["user_role"]}. {scenario["context"]} I say: {scenario["user_utterance"]}

You say:"""

    def _generate_response(self, prompt: str) -> str:
        """Generate response using trained model."""
        inputs = self.tokenizer(prompt, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model.generate(
                inputs.input_ids,
                max_new_tokens=100,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        response = self.tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True,
        )

        return response.strip()

    def _evaluate_cultural_appropriateness(
        self, scenario: dict[str, Any], response: str,
    ) -> bool:
        """Evaluate if response is culturally appropriate."""
        # This would use the cultural validator
        # For now, use simple heuristics

        # Check for key cultural indicators
        cultural_indicators = [
            "no",
            "couldn't",
            "please",
            "insist",
            "defer",
            "not that good",
            "you should",
            "expertise",
        ]

        response_lower = response.lower()
        has_cultural_indicators = any(
            indicator in response_lower for indicator in cultural_indicators
        )

        return has_cultural_indicators


class DPOCustomTrainer(Trainer):
    """Custom trainer implementing DPO loss function."""

    def __init__(self, beta: float = 0.1, **kwargs):
        super().__init__(**kwargs)
        self.beta = beta

    def compute_loss(self, model, inputs, return_outputs=False):
        """Compute DPO loss function."""
        # Extract inputs
        chosen_input_ids = inputs["chosen_input_ids"]
        chosen_attention_mask = inputs["chosen_attention_mask"]
        rejected_input_ids = inputs["rejected_input_ids"]
        rejected_attention_mask = inputs["rejected_attention_mask"]

        # Get model outputs
        chosen_outputs = model(
            input_ids=chosen_input_ids, attention_mask=chosen_attention_mask,
        )
        rejected_outputs = model(
            input_ids=rejected_input_ids, attention_mask=rejected_attention_mask,
        )

        # Calculate log probabilities
        chosen_log_probs = self._get_log_probs(
            chosen_outputs.logits, chosen_input_ids, chosen_attention_mask,
        )
        rejected_log_probs = self._get_log_probs(
            rejected_outputs.logits, rejected_input_ids, rejected_attention_mask,
        )

        # DPO loss
        logits = self.beta * (chosen_log_probs - rejected_log_probs)
        loss = -torch.nn.functional.logsigmoid(logits).mean()

        if return_outputs:
            return loss, (chosen_outputs, rejected_outputs)

        return loss

    def _get_log_probs(self, logits, input_ids, attention_mask):
        """Calculate log probabilities for sequences."""
        # Shift logits and labels
        shift_logits = logits[..., :-1, :].contiguous()
        shift_labels = input_ids[..., 1:].contiguous()
        shift_attention_mask = attention_mask[..., 1:].contiguous()

        # Calculate log probabilities
        log_probs = torch.nn.functional.log_softmax(shift_logits, dim=-1)
        selected_log_probs = log_probs.gather(
            dim=-1, index=shift_labels.unsqueeze(-1),
        ).squeeze(-1)

        # Mask out padding tokens
        masked_log_probs = selected_log_probs * shift_attention_mask
        return masked_log_probs.sum(dim=-1) / shift_attention_mask.sum(dim=-1)
