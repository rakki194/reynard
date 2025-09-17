"""
TokenizationService: Model-specific tokenization with accurate token counting.

Responsibilities:
- Provide accurate token counting for different embedding models
- Support tiktoken for EmbeddingGemma and other OpenAI-compatible models
- Fallback to character-based estimation for unsupported models
- Model configuration registry with optimal chunk sizes
"""

import logging
from typing import Any, Dict

logger = logging.getLogger("uvicorn")

# Optional imports for tokenization
try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False
    tiktoken = None

try:
    import sentencepiece
    SENTENCEPIECE_AVAILABLE = True
except ImportError:
    SENTENCEPIECE_AVAILABLE = False
    sentencepiece = None


class TokenizationService:
    """Service for accurate token counting across different embedding models."""

    def __init__(self) -> None:
        self._tokenizers: Dict[str, Any] = {}
        self._model_configs = {
            "embeddinggemma:latest": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",  # GPT-4 tokenizer (closest to EmbeddingGemma)
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,  # 80% of max_tokens for safety margin
            },
            "embeddinggemma": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            "nomic-embed-text": {
                "tokenizer": "sentencepiece",
                "chars_per_token": 4.2,
                "max_tokens": 2048,  # Larger context window
                "optimal_chunk_size": 1638,  # 80% of max_tokens
            },
            "mxbai-embed-large": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            "bge-m3": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            "bge-large-en-v1.5": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            "bge-base-en-v1.5": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            "bge-small-en-v1.5": {
                "tokenizer": "tiktoken",
                "model_name": "cl100k_base",
                "chars_per_token": 3.8,
                "max_tokens": 512,
                "optimal_chunk_size": 410,
            },
            # Sentence-transformer models (fallback to character estimation)
            "all-MiniLM-L6-v2": {
                "tokenizer": "character",
                "chars_per_token": 4.0,
                "max_tokens": 256,
                "optimal_chunk_size": 205,
            },
            "all-mpnet-base-v2": {
                "tokenizer": "character",
                "chars_per_token": 4.0,
                "max_tokens": 384,
                "optimal_chunk_size": 307,
            },
            "sentence-transformers/all-MiniLM-L6-v2": {
                "tokenizer": "character",
                "chars_per_token": 4.0,
                "max_tokens": 256,
                "optimal_chunk_size": 205,
            },
            "sentence-transformers/all-mpnet-base-v2": {
                "tokenizer": "character",
                "chars_per_token": 4.0,
                "max_tokens": 384,
                "optimal_chunk_size": 307,
            },
        }

    def estimate_tokens_accurate(self, text: str, model: str) -> int:
        """Estimate token count using model-specific tokenizer when available."""
        config = self._model_configs.get(model, {})
        tokenizer_type = config.get("tokenizer", "character")

        try:
            if tokenizer_type == "tiktoken" and TIKTOKEN_AVAILABLE:
                return self._estimate_with_tiktoken(text, config)
            elif tokenizer_type == "sentencepiece" and SENTENCEPIECE_AVAILABLE:
                return self._estimate_with_sentencepiece(text, config)
            else:
                return self._estimate_with_character_heuristic(text, config)
        except Exception as e:
            logger.warning(f"Token estimation failed for {model}: {e}, falling back to heuristic")
            return self._estimate_with_character_heuristic(text, config)

    def _estimate_with_tiktoken(self, text: str, config: Dict[str, Any]) -> int:
        """Estimate tokens using tiktoken tokenizer."""
        model_name = config.get("model_name", "cl100k_base")
        
        # Cache tokenizer instances
        if model_name not in self._tokenizers:
            self._tokenizers[model_name] = tiktoken.get_encoding(model_name)
        
        tokenizer = self._tokenizers[model_name]
        return len(tokenizer.encode(text))

    def _estimate_with_sentencepiece(self, text: str, config: Dict[str, Any]) -> int:
        """Estimate tokens using sentencepiece (fallback to character estimation)."""
        # For now, fallback to character-based estimation
        # TODO: Implement actual sentencepiece tokenization if needed
        chars_per_token = config.get("chars_per_token", 4.0)
        return int(len(text) / chars_per_token)

    def _estimate_with_character_heuristic(self, text: str, config: Dict[str, Any]) -> int:
        """Estimate tokens using character-based heuristic."""
        chars_per_token = config.get("chars_per_token", 4.0)
        return int(len(text) / chars_per_token)

    def get_optimal_chunk_size(self, model: str) -> int:
        """Get optimal chunk size based on model capabilities."""
        config = self._model_configs.get(model, {})
        return config.get("optimal_chunk_size", 410)  # Default to EmbeddingGemma size

    def get_max_tokens(self, model: str) -> int:
        """Get maximum tokens supported by the model."""
        config = self._model_configs.get(model, {})
        return config.get("max_tokens", 512)

    def is_text_within_limits(self, text: str, model: str) -> bool:
        """Check if text is within model's token limits."""
        token_count = self.estimate_tokens_accurate(text, model)
        max_tokens = self.get_max_tokens(model)
        return token_count <= max_tokens

    def truncate_text_to_limit(self, text: str, model: str) -> str:
        """Truncate text to fit within model's token limits."""
        max_tokens = self.get_max_tokens(model)
        optimal_chunk_size = self.get_optimal_chunk_size(model)
        
        # Use optimal chunk size for safety margin
        target_tokens = min(max_tokens, optimal_chunk_size)
        
        # Binary search for optimal truncation point
        left, right = 0, len(text)
        best_text = text
        
        while left <= right:
            mid = (left + right) // 2
            truncated_text = text[:mid]
            token_count = self.estimate_tokens_accurate(truncated_text, model)
            
            if token_count <= target_tokens:
                best_text = truncated_text
                left = mid + 1
            else:
                right = mid - 1
        
        return best_text

    def get_model_config(self, model: str) -> Dict[str, Any]:
        """Get complete configuration for a model."""
        return self._model_configs.get(model, {})

    def get_supported_models(self) -> list[str]:
        """Get list of models with tokenization support."""
        return list(self._model_configs.keys())

    def get_tokenization_stats(self) -> Dict[str, Any]:
        """Get tokenization service statistics."""
        return {
            "tiktoken_available": TIKTOKEN_AVAILABLE,
            "sentencepiece_available": SENTENCEPIECE_AVAILABLE,
            "supported_models": len(self._model_configs),
            "cached_tokenizers": len(self._tokenizers),
            "model_configs": {
                model: {
                    "tokenizer": config.get("tokenizer"),
                    "max_tokens": config.get("max_tokens"),
                    "optimal_chunk_size": config.get("optimal_chunk_size"),
                }
                for model, config in self._model_configs.items()
            }
        }
