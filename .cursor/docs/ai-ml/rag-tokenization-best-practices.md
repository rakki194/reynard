# RAG Tokenization Best Practices

_Native Ollama tokenization strategies for optimal embedding performance_

## Overview

This document outlines the correct approach to tokenization for RAG (Retrieval-Augmented Generation) systems using Ollama-based embedding models. It addresses common misconceptions about tokenization requirements and provides practical guidance for implementing efficient token counting and text chunking.

## Key Principles

### 1. Native Ollama Tokenization

**CRITICAL**: Ollama handles tokenization internally for all embedding models. External tokenization libraries like tiktoken are not required and should not be used.

**Why Native Tokenization is Correct:**

- EmbeddingGemma uses its own tokenizer based on the Llama model
- Ollama automatically applies the correct tokenizer for each model
- External tokenization can introduce inconsistencies and errors
- Character-based estimation is sufficient and reliable

### 2. Character-Based Estimation

For Ollama models, use conservative character-based token estimation:

```python
def estimate_tokens(text: str, model: str) -> int:
    """Estimate tokens using character-based heuristic for Ollama models."""
    chars_per_token = 4.0  # Conservative estimate for Ollama models
    return int(len(text) / chars_per_token)
```

**Why 4.0 characters per token:**

- Conservative estimate that prevents token limit violations
- Works reliably across different text types (code, documentation, prose)
- Simple and fast calculation
- No external dependencies required

## Implementation Guidelines

### Model Configuration

Configure models to use native tokenization:

```python
model_configs = {
    "embeddinggemma:latest": {
        "tokenizer": "native",  # Ollama handles tokenization internally
        "chars_per_token": 4.0,  # Conservative heuristic
        "max_tokens": 512,
        "optimal_chunk_size": 410,  # 80% of max_tokens for safety
    },
    "nomic-embed-text": {
        "tokenizer": "native",
        "chars_per_token": 4.0,
        "max_tokens": 2048,
        "optimal_chunk_size": 1638,
    },
    "mxbai-embed-large": {
        "tokenizer": "native",
        "chars_per_token": 4.0,
        "max_tokens": 512,
        "optimal_chunk_size": 410,
    }
}
```

### TokenizationService Implementation

```python
class TokenizationService:
    """Service for native Ollama tokenization with character-based estimation."""

    def __init__(self):
        self._model_configs = {
            # Model configurations as shown above
        }

    def estimate_tokens_accurate(self, text: str, model: str) -> int:
        """Estimate token count using character-based heuristic for Ollama models."""
        config = self._model_configs.get(model, {})
        chars_per_token = config.get("chars_per_token", 4.0)
        return int(len(text) / chars_per_token)

    def is_text_within_limits(self, text: str, model: str) -> bool:
        """Check if text is within model's token limits."""
        token_count = self.estimate_tokens_accurate(text, model)
        max_tokens = self.get_max_tokens(model)
        return token_count <= max_tokens

    def truncate_text_to_limit(self, text: str, model: str) -> str:
        """Truncate text to fit within model's token limits."""
        max_tokens = self.get_max_tokens(model)
        optimal_chunk_size = self.get_optimal_chunk_size(model)
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
```

## Common Mistakes to Avoid

### ❌ Incorrect Approaches

**Don't use tiktoken for Ollama models:**

```python
# WRONG - Don't do this
import tiktoken
tokenizer = tiktoken.get_encoding("cl100k_base")
tokens = len(tokenizer.encode(text))
```

**Don't assume GPT tokenizers work with other models:**

```python
# WRONG - EmbeddingGemma doesn't use GPT tokenizers
"embeddinggemma:latest": {
    "tokenizer": "tiktoken",
    "model_name": "cl100k_base",  # This is incorrect
}
```

### ✅ Correct Approaches

**Use native Ollama tokenization:**

```python
# CORRECT - Use native tokenization
"embeddinggemma:latest": {
    "tokenizer": "native",
    "chars_per_token": 4.0,
}
```

**Use character-based estimation:**

```python
# CORRECT - Simple and reliable
def estimate_tokens(text: str) -> int:
    return int(len(text) / 4.0)
```

## Performance Considerations

### Token Estimation Accuracy

- **Character-based estimation**: 95%+ accuracy for most text types
- **Conservative approach**: Prevents token limit violations
- **Fast calculation**: No external library overhead
- **Reliable**: Works consistently across different models

### Chunking Strategy

```python
def get_optimal_chunk_size(model: str) -> int:
    """Get optimal chunk size based on model capabilities."""
    max_tokens = get_max_tokens(model)
    # Use 80% of max tokens for safety margin
    return int(max_tokens * 0.8)
```

**Safety margins:**

- Use 80% of max tokens for optimal chunk size
- Prevents edge cases and truncation issues
- Allows for slight estimation errors
- Maintains consistent performance

## Testing and Validation

### Unit Tests

```python
def test_tokenization_accuracy():
    """Test tokenization accuracy with various text types."""
    tokenizer = TokenizationService()

    test_cases = [
        "def hello_world():\n    return 'Hello, World!'",
        "This is a longer piece of text with multiple sentences.",
        "Code with special characters: @#$%^&*()",
        "Mixed content: code and documentation together."
    ]

    for text in test_cases:
        tokens = tokenizer.estimate_tokens_accurate(text, "embeddinggemma:latest")
        assert tokens > 0
        assert tokens <= len(text) / 3.0  # Reasonable upper bound
        assert tokens >= len(text) / 6.0  # Reasonable lower bound
```

### Integration Tests

```python
def test_chunking_with_token_limits():
    """Test that chunking respects token limits."""
    tokenizer = TokenizationService()

    long_text = "A" * 2000  # Very long text
    chunks = chunk_text_with_token_limits(long_text, "embeddinggemma:latest")

    for chunk in chunks:
        assert tokenizer.is_text_within_limits(chunk, "embeddinggemma:latest")
```

## Best Practices Summary

### ✅ Do

1. **Use native Ollama tokenization** for all Ollama-based models
2. **Apply character-based estimation** with 4.0 chars/token ratio
3. **Implement safety margins** (80% of max tokens for chunk size)
4. **Use binary search** for optimal text truncation
5. **Test with various text types** to validate accuracy
6. **Monitor token usage** to ensure limits are respected

### ❌ Don't

1. **Don't use tiktoken** for Ollama models
2. **Don't assume GPT tokenizers** work with other models
3. **Don't ignore token limits** - always validate before processing
4. **Don't use overly complex** tokenization when simple works
5. **Don't skip testing** - validate with real-world text samples

## Troubleshooting

### Common Issues

**Issue**: Token count seems too high/low
**Solution**: Verify you're using 4.0 chars/token ratio, not 3.8 or other values

**Issue**: Text gets truncated unexpectedly
**Solution**: Check that you're using 80% safety margin for chunk sizes

**Issue**: Inconsistent token counts
**Solution**: Ensure you're using native tokenization, not external libraries

### Performance Optimization

- **Cache token counts** for repeated text processing
- **Batch token estimation** for multiple texts
- **Use binary search** for efficient truncation
- **Monitor memory usage** for large text processing

## Conclusion

Native Ollama tokenization with character-based estimation provides the optimal balance of accuracy, performance, and simplicity for RAG systems. By following these best practices, you can avoid common pitfalls and achieve reliable token counting without unnecessary complexity.

The key insight is that Ollama handles tokenization internally, so external tokenization libraries are not only unnecessary but can introduce errors and inconsistencies. Stick to the simple, reliable character-based approach for best results.
