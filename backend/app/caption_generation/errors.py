"""Caption generation error types.

Small focused module defining exceptions for the caption system.
"""

from __future__ import annotations


class CaptionError(Exception):
    """Base exception for caption generation errors."""

    def __init__(
        self, message: str, error_type: str = "unknown", retryable: bool = False,
    ):
        super().__init__(message)
        self.error_type = error_type
        self.retryable = retryable


class ModelLoadingError(CaptionError):
    """Raised when a caption model fails to load."""

    def __init__(self, model_name: str, reason: str, retryable: bool = True):
        super().__init__(
            f"Failed to load model '{model_name}': {reason}",
            "model_loading",
            retryable,
        )


class CaptionGenerationError(CaptionError):
    """Raised when caption generation fails."""

    def __init__(self, model_name: str, reason: str, retryable: bool = False):
        super().__init__(
            f"Failed to generate caption with '{model_name}': {reason}",
            "generation",
            retryable,
        )


def format_error_message(error: CaptionError) -> str:
    """Return a concise user-facing error message.

    For generation errors, extract only the reason after the first colon for brevity.
    """
    try:
        message = str(error)
        if getattr(error, "error_type", None) == "generation" and ": " in message:
            return message.split(": ", 1)[1]
        return message
    except Exception:
        return str(error)
