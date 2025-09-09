"""
Backend utilities for Reynard
"""

from .lazy_loading import LazyLoadingSystem, get_lazy_loading_system
from .hf_cache import (
    get_hf_cache_dir,
    get_hf_hub_dir,
    get_model_cache_path,
    get_model_snapshot_path,
    is_model_cached,
    get_cache_size,
    clear_cache,
    ensure_hf_cache_dir
)
from .executor import (
    ThreadPoolExecutorManager,
    get_global_executor,
    execute_in_thread_pool,
    execute_batch_in_thread_pool,
    shutdown_global_executor
)
from .image_utils import (
    ImageUtils,
    ImageProcessingService,
    get_image_processing_service
)
