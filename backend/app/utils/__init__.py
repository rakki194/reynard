"""Backend utilities for Reynard"""

from .executor import (
    ThreadPoolExecutorManager,
    execute_batch_in_thread_pool,
    execute_in_thread_pool,
    get_global_executor,
    shutdown_global_executor,
)
from .hf_cache import (
    clear_cache,
    ensure_hf_cache_dir,
    get_cache_size,
    get_hf_cache_dir,
    get_hf_hub_dir,
    get_model_cache_path,
    get_model_snapshot_path,
    is_model_cached,
)
from .image_service import (
    ImageProcessingService,
    get_image_processing_service,
)
from .image_utils_core import (
    ImageUtils,
)
from .lazy_loading_registry import LazyLoadingSystem, get_lazy_loading_system
