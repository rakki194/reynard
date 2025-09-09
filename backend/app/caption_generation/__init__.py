"""
Reynard Caption Generation System

A modular, independent reimplementation of Yipyap's sophisticated caption generation
system as part of the Reynard framework. This system provides:

- Multiple caption generation models (JTP2, Florence2, WDV3, JoyCaption)
- Plugin-based architecture for easy extension
- Model management and lifecycle handling
- Batch processing with progress tracking
- GPU acceleration and optimization
- Comprehensive error handling and retry logic

The system is designed to be completely independent and modular, with clear
separation between backend Python services and frontend TypeScript/SolidJS
integration.
"""

from .services.caption_service import CaptionService, CaptionTask, CaptionResult

def get_caption_service() -> CaptionService:
    """Get the global caption service instance."""
    global _caption_service
    if _caption_service is None:
        _caption_service = CaptionService()
    return _caption_service

# Global service instance
_caption_service: CaptionService = None
from .plugin_loader import discover_plugins, CaptionerPlugin
from .base import CaptionGenerator

__all__ = [
    'get_caption_service',
    'CaptionService',
    'CaptionTask',
    'CaptionResult', 
    'discover_plugins',
    'CaptionerPlugin',
    'CaptionGenerator'
]
