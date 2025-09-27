#!/usr/bin/env python3
"""Service Profiler
==================

Comprehensive profiling system for every active backend service, feature, and package.
Provides detailed statistics and metrics for individual service analysis.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
import psutil
import gc
import os
import importlib
import tracemalloc
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import json

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

logger = logging.getLogger(__name__)


@dataclass
class ServiceMetrics:
    """Detailed metrics for a single service."""
    name: str
    enabled: bool
    memory_mb: float
    memory_percent: float
    cpu_percent: float
    startup_time_ms: float
    import_time_ms: float
    dependencies: List[str]
    configuration: Dict[str, Any]
    status: str
    error_count: int
    last_activity: Optional[datetime]
    performance_score: float


@dataclass
class PackageMetrics:
    """Detailed metrics for a Python package."""
    name: str
    enabled: bool
    memory_mb: float
    import_time_ms: float
    version: str
    dependencies: List[str]
    modules_loaded: int
    classes_loaded: int
    functions_loaded: int
    size_on_disk_mb: float


@dataclass
class FeatureMetrics:
    """Detailed metrics for a backend feature."""
    name: str
    enabled: bool
    memory_mb: float
    services_used: List[str]
    endpoints_count: int
    configuration: Dict[str, Any]
    performance_score: float
    error_rate: float


class ServiceProfiler:
    """Comprehensive service profiling system."""

    def __init__(self):
        """Initialize the service profiler."""
        self.start_time = time.time()
        self.service_metrics: Dict[str, ServiceMetrics] = {}
        self.package_metrics: Dict[str, PackageMetrics] = {}
        self.feature_metrics: Dict[str, FeatureMetrics] = {}
        self.enabled_services = self._get_enabled_services()
        self.enabled_packages = self._get_enabled_packages()
        self.enabled_features = self._get_enabled_features()

    def _get_enabled_services(self) -> List[str]:
        """Get list of enabled services from environment variables."""
        enabled = []
        service_mappings = {
            # Core services
            'GATEKEEPER_ENABLED': 'gatekeeper',
            'RAG_ENABLED': 'rag',
            'OLLAMA_ENABLED': 'ollama',
            'COMFY_ENABLED': 'comfy',
            'NLWEB_ENABLED': 'nlweb',
            'TTS_ENABLED': 'tts',
            'ECS_WORLD_ENABLED': 'ecs_world',
            'ECS_DATABASE_ENABLED': 'ecs_database',
            'SECURITY_ENABLED': 'security',
            'REDIS_ENABLED': 'redis',
            'CACHING_ENABLED': 'caching',
            'FILE_INDEXING_ENABLED': 'file_indexing',
            'DEBUG_LOGGING_ENABLED': 'debug_logging',
            # AI/ML services
            'PYTORCH_ENABLED': 'pytorch',
            'TRANSFORMERS_ENABLED': 'transformers',
            'EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED': 'sentence_transformers',
            'EMBEDDING_OLLAMA_ENABLED': 'embedding_ollama',
            'EMBEDDING_OPENAI_ENABLED': 'embedding_openai',
            'EMBEDDING_HUGGINGFACE_ENABLED': 'embedding_huggingface',
            # Processing services
            'PDF_PROCESSING_ENABLED': 'pdf_processing',
            'MARKER_PACKAGE_ENABLED': 'marker_package',
            'MARKER_LLM_ENHANCEMENT_ENABLED': 'marker_llm_enhancement',
            'SECURITY_THREAT_DETECTION_ENABLED': 'security_threat_detection',
            # Infrastructure services
            'DIFFUSION_PIPE_ENABLED': 'diffusion_pipe',
            'CONTINUOUS_INDEXING_ENABLED': 'continuous_indexing',
            'INDEXING_MEMORY_PROFILER_ENABLED': 'indexing_memory_profiler',
            'RAG_CONTINUOUS_INDEXING_ENABLED': 'rag_continuous_indexing',
        }

        for env_var, service_name in service_mappings.items():
            if os.getenv(env_var, 'false').lower() == 'true':
                enabled.append(service_name)

        return enabled

    def _get_enabled_packages(self) -> List[str]:
        """Get list of enabled packages from environment variables."""
        enabled = []
        package_mappings = {
            'PYTORCH_ENABLED': 'torch',
            'TRANSFORMERS_ENABLED': 'transformers',
            'NUMPY_ENABLED': 'numpy',
            'PANDAS_ENABLED': 'pandas',
            'SCIKIT_LEARN_ENABLED': 'sklearn',
            'OPENCV_ENABLED': 'cv2',
            'PILLOW_ENABLED': 'PIL',
            'MATPLOTLIB_ENABLED': 'matplotlib',
            'SEABORN_ENABLED': 'seaborn',
            'PLOTLY_ENABLED': 'plotly',
            'REQUESTS_ENABLED': 'requests',
            'AIOHTTP_ENABLED': 'aiohttp',
        }

        for env_var, package_name in package_mappings.items():
            if os.getenv(env_var, 'false').lower() == 'true':
                enabled.append(package_name)

        return enabled

    def _get_enabled_features(self) -> List[str]:
        """Get list of enabled features from environment variables."""
        enabled = []
        feature_mappings = {
            'INDEXING_MEMORY_PROFILER_ENABLED': 'indexing_memory_profiler',
            'RAG_CONTINUOUS_INDEXING_ENABLED': 'rag_continuous_indexing',
            'EMBEDDING_BACKENDS_ENABLED': 'embedding_backends',
            'EMBEDDING_OLLAMA_ENABLED': 'embedding_ollama',
            'EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED': 'embedding_sentence_transformers',
            'EMBEDDING_OPENAI_ENABLED': 'embedding_openai',
            'EMBEDDING_HUGGINGFACE_ENABLED': 'embedding_huggingface',
            'PDF_PROCESSING_ENABLED': 'pdf_processing',
            'MARKER_PACKAGE_ENABLED': 'marker_package',
            'MARKER_LLM_ENHANCEMENT_ENABLED': 'marker_llm_enhancement',
            'SECURITY_THREAT_DETECTION_ENABLED': 'security_threat_detection',
        }

        for env_var, feature_name in feature_mappings.items():
            if os.getenv(env_var, 'false').lower() == 'true':
                enabled.append(feature_name)

        return enabled

    async def profile_all_services(self) -> Dict[str, Any]:
        """Profile all enabled services with detailed metrics."""
        logger.info("Starting comprehensive service profiling...")

        # Start tracemalloc for precise memory tracking
        tracemalloc.start()

        results = {
            "profiling_session": {
                "start_time": datetime.now(timezone.utc).isoformat(),
                "total_services": len(self.enabled_services),
                "total_packages": len(self.enabled_packages),
                "total_features": len(self.enabled_features),
            },
            "services": {},
            "packages": {},
            "features": {},
            "summary": {}
        }

        # Profile each service individually
        for service_name in self.enabled_services:
            try:
                service_metrics = await self._profile_service(service_name)
                self.service_metrics[service_name] = service_metrics
                results["services"][service_name] = asdict(service_metrics)
            except Exception as e:
                logger.error(f"Failed to profile service {service_name}: {e}")
                results["services"][service_name] = {
                    "name": service_name,
                    "error": str(e),
                    "status": "error"
                }

        # Profile each package individually
        for package_name in self.enabled_packages:
            try:
                package_metrics = await self._profile_package(package_name)
                self.package_metrics[package_name] = package_metrics
                results["packages"][package_name] = asdict(package_metrics)
            except Exception as e:
                logger.error(f"Failed to profile package {package_name}: {e}")
                results["packages"][package_name] = {
                    "name": package_name,
                    "error": str(e),
                    "status": "error"
                }

        # Profile each feature individually
        for feature_name in self.enabled_features:
            try:
                feature_metrics = await self._profile_feature(feature_name)
                self.feature_metrics[feature_name] = feature_metrics
                results["features"][feature_name] = asdict(feature_metrics)
            except Exception as e:
                logger.error(f"Failed to profile feature {feature_name}: {e}")
                results["features"][feature_name] = {
                    "name": feature_name,
                    "error": str(e),
                    "status": "error"
                }

        # Generate summary statistics
        results["summary"] = self._generate_summary()

        # Stop tracemalloc
        tracemalloc.stop()

        results["profiling_session"]["end_time"] = datetime.now(timezone.utc).isoformat()
        results["profiling_session"]["duration_seconds"] = time.time() - self.start_time

        logger.info("Service profiling completed successfully")
        return results

    async def _profile_service(self, service_name: str) -> ServiceMetrics:
        """Profile a single service with detailed metrics."""
        logger.info(f"Profiling service: {service_name}")

        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024

        # Get service configuration
        config = self._get_service_configuration(service_name)

        # Measure import time
        import_start = time.time()
        try:
            service_module = self._import_service_module(service_name)
            import_time = (time.time() - import_start) * 1000
        except Exception as e:
            logger.warning(f"Could not import service {service_name}: {e}")
            service_module = None
            import_time = 0

        # Measure startup time
        startup_start = time.time()
        try:
            if service_module:
                # Try to initialize the service
                service_instance = self._initialize_service(service_name, service_module)
                startup_time = (time.time() - startup_start) * 1000
            else:
                startup_time = 0
                service_instance = None
        except Exception as e:
            logger.warning(f"Could not initialize service {service_name}: {e}")
            startup_time = 0
            service_instance = None

        # Measure final memory usage
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024
        memory_delta = end_memory - start_memory

        # Get dependencies
        dependencies = self._get_service_dependencies(service_name)

        # Calculate performance score
        performance_score = self._calculate_service_performance_score(
            memory_delta, startup_time, import_time
        )

        return ServiceMetrics(
            name=service_name,
            enabled=True,
            memory_mb=memory_delta,
            memory_percent=(memory_delta / psutil.virtual_memory().total) * 100,
            cpu_percent=psutil.Process().cpu_percent(),
            startup_time_ms=startup_time,
            import_time_ms=import_time,
            dependencies=dependencies,
            configuration=config,
            status="active" if service_instance else "inactive",
            error_count=0,  # TODO: Implement error tracking
            last_activity=datetime.now(timezone.utc),
            performance_score=performance_score
        )

    async def _profile_package(self, package_name: str) -> PackageMetrics:
        """Profile a single package with detailed metrics."""
        logger.info(f"Profiling package: {package_name}")

        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024

        # Measure import time
        import_start = time.time()
        try:
            package_module = importlib.import_module(package_name)
            import_time = (time.time() - import_start) * 1000
        except Exception as e:
            logger.warning(f"Could not import package {package_name}: {e}")
            package_module = None
            import_time = 0

        # Measure memory usage
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024
        memory_delta = end_memory - start_memory

        # Get package information
        version = self._get_package_version(package_name)
        dependencies = self._get_package_dependencies(package_name)
        modules_loaded = len(sys.modules) if package_module else 0
        classes_loaded = self._count_package_classes(package_module) if package_module else 0
        functions_loaded = self._count_package_functions(package_module) if package_module else 0
        size_on_disk = self._get_package_size(package_name)

        return PackageMetrics(
            name=package_name,
            enabled=True,
            memory_mb=memory_delta,
            import_time_ms=import_time,
            version=version,
            dependencies=dependencies,
            modules_loaded=modules_loaded,
            classes_loaded=classes_loaded,
            functions_loaded=functions_loaded,
            size_on_disk_mb=size_on_disk
        )

    async def _profile_feature(self, feature_name: str) -> FeatureMetrics:
        """Profile a single feature with detailed metrics."""
        logger.info(f"Profiling feature: {feature_name}")

        start_memory = psutil.Process().memory_info().rss / 1024 / 1024

        # Get feature configuration
        config = self._get_feature_configuration(feature_name)

        # Get services used by this feature
        services_used = self._get_feature_services(feature_name)

        # Count endpoints
        endpoints_count = self._count_feature_endpoints(feature_name)

        # Measure memory usage
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024
        memory_delta = end_memory - start_memory

        # Calculate performance score
        performance_score = self._calculate_feature_performance_score(
            memory_delta, len(services_used), endpoints_count
        )

        return FeatureMetrics(
            name=feature_name,
            enabled=True,
            memory_mb=memory_delta,
            services_used=services_used,
            endpoints_count=endpoints_count,
            configuration=config,
            performance_score=performance_score,
            error_rate=0.0  # TODO: Implement error rate tracking
        )

    def _get_service_configuration(self, service_name: str) -> Dict[str, Any]:
        """Get configuration for a service."""
        config_mappings = {
            'rag': {
                'RAG_ENABLED': os.getenv('RAG_ENABLED'),
                'RAG_CONTINUOUS_INDEXING_ENABLED': os.getenv('RAG_CONTINUOUS_INDEXING_ENABLED'),
                'INDEXING_MEMORY_PROFILER_ENABLED': os.getenv('INDEXING_MEMORY_PROFILER_ENABLED'),
                'EMBEDDING_BACKENDS_ENABLED': os.getenv('EMBEDDING_BACKENDS_ENABLED'),
            },
            'ollama': {
                'OLLAMA_ENABLED': os.getenv('OLLAMA_ENABLED'),
                'OLLAMA_BASE_URL': os.getenv('OLLAMA_BASE_URL'),
            },
            'gatekeeper': {
                'GATEKEEPER_ENABLED': os.getenv('GATEKEEPER_ENABLED'),
                'GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES': os.getenv('GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES'),
                'GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS': os.getenv('GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS'),
            },
            'redis': {
                'REDIS_ENABLED': os.getenv('REDIS_ENABLED'),
                'REDIS_URL': os.getenv('REDIS_URL'),
            },
            'pytorch': {
                'PYTORCH_ENABLED': os.getenv('PYTORCH_ENABLED'),
                'PYTORCH_CUDA_ALLOC_CONF': os.getenv('PYTORCH_CUDA_ALLOC_CONF'),
                'CUDA_LAUNCH_BLOCKING': os.getenv('CUDA_LAUNCH_BLOCKING'),
            },
            'transformers': {
                'TRANSFORMERS_ENABLED': os.getenv('TRANSFORMERS_ENABLED'),
                'TOKENIZERS_PARALLELISM': os.getenv('TOKENIZERS_PARALLELISM'),
            },
            'sentence_transformers': {
                'EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED': os.getenv('EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED'),
            },
            'embedding_ollama': {
                'EMBEDDING_OLLAMA_ENABLED': os.getenv('EMBEDDING_OLLAMA_ENABLED'),
            },
            'embedding_openai': {
                'EMBEDDING_OPENAI_ENABLED': os.getenv('EMBEDDING_OPENAI_ENABLED'),
            },
            'embedding_huggingface': {
                'EMBEDDING_HUGGINGFACE_ENABLED': os.getenv('EMBEDDING_HUGGINGFACE_ENABLED'),
            },
            'pdf_processing': {
                'PDF_PROCESSING_ENABLED': os.getenv('PDF_PROCESSING_ENABLED'),
            },
            'marker_package': {
                'MARKER_PACKAGE_ENABLED': os.getenv('MARKER_PACKAGE_ENABLED'),
            },
            'marker_llm_enhancement': {
                'MARKER_LLM_ENHANCEMENT_ENABLED': os.getenv('MARKER_LLM_ENHANCEMENT_ENABLED'),
            },
            'security_threat_detection': {
                'SECURITY_THREAT_DETECTION_ENABLED': os.getenv('SECURITY_THREAT_DETECTION_ENABLED'),
            },
            'diffusion_pipe': {
                'DIFFUSION_PIPE_ENABLED': os.getenv('DIFFUSION_PIPE_ENABLED'),
                'DIFFUSION_PIPE_DEBUG': os.getenv('DIFFUSION_PIPE_DEBUG'),
                'DIFFUSION_PIPE_TIMEOUT': os.getenv('DIFFUSION_PIPE_TIMEOUT'),
            },
            'continuous_indexing': {
                'CONTINUOUS_INDEXING_ENABLED': os.getenv('CONTINUOUS_INDEXING_ENABLED'),
            },
            'indexing_memory_profiler': {
                'INDEXING_MEMORY_PROFILER_ENABLED': os.getenv('INDEXING_MEMORY_PROFILER_ENABLED'),
            },
            'rag_continuous_indexing': {
                'RAG_CONTINUOUS_INDEXING_ENABLED': os.getenv('RAG_CONTINUOUS_INDEXING_ENABLED'),
            },
        }

        return config_mappings.get(service_name, {})

    def _get_feature_configuration(self, feature_name: str) -> Dict[str, Any]:
        """Get configuration for a feature."""
        config_mappings = {
            'indexing_memory_profiler': {
                'INDEXING_MEMORY_PROFILER_ENABLED': os.getenv('INDEXING_MEMORY_PROFILER_ENABLED'),
            },
            'rag_continuous_indexing': {
                'RAG_CONTINUOUS_INDEXING_ENABLED': os.getenv('RAG_CONTINUOUS_INDEXING_ENABLED'),
            },
            'embedding_backends': {
                'EMBEDDING_BACKENDS_ENABLED': os.getenv('EMBEDDING_BACKENDS_ENABLED'),
                'EMBEDDING_OLLAMA_ENABLED': os.getenv('EMBEDDING_OLLAMA_ENABLED'),
            },
        }

        return config_mappings.get(feature_name, {})

    def _import_service_module(self, service_name: str):
        """Import a service module."""
        module_mappings = {
            # Core services
            'rag': 'app.services.rag.rag_service',
            'ollama': 'app.services.ai.ollama_service',
            'gatekeeper': 'app.services.gatekeeper.gatekeeper_service',
            'redis': 'app.core.redis_cache',
            'caching': 'app.core.redis_cache',
            'file_indexing': 'app.services.rag.indexing',
            'debug_logging': 'app.core.debug_logging',
            'security': 'app.security',
            'ecs_world': 'app.ecs.world',
            'ecs_database': 'app.ecs.database',
            'comfy': 'app.services.comfy.comfy_service',
            'nlweb': 'app.services.nlweb.nlweb_service',
            'tts': 'app.services.tts.tts_service',
            # AI/ML services
            'pytorch': 'torch',
            'transformers': 'transformers',
            'sentence_transformers': 'sentence_transformers',
            'embedding_ollama': 'app.services.rag.services.core.ai_embedding',
            'embedding_openai': 'app.services.rag.services.core.ai_embedding',
            'embedding_huggingface': 'app.services.rag.services.core.ai_embedding',
            # Processing services
            'pdf_processing': 'app.services.pdf_processor',
            'marker_package': 'app.services.rag.services.core.document_processor',
            'marker_llm_enhancement': 'app.services.rag.services.core.document_processor',
            'security_threat_detection': 'app.security.security_config',
            # Infrastructure services
            'diffusion_pipe': 'app.services.diffusion_pipe',
            'continuous_indexing': 'app.services.rag.file_indexing_service',
            'indexing_memory_profiler': 'app.services.rag.services.monitoring.rag_profiler',
            'rag_continuous_indexing': 'app.services.rag.file_indexing_service',
        }

        module_path = module_mappings.get(service_name)
        if module_path:
            try:
                return importlib.import_module(module_path)
            except ImportError as e:
                logger.warning(f"Could not import module {module_path}: {e}")
                return None
        return None

    def _initialize_service(self, service_name: str, service_module):
        """Initialize a service instance."""
        # This is a simplified initialization - in practice, you'd need
        # to handle the specific initialization patterns for each service
        try:
            if hasattr(service_module, 'Service'):
                return service_module.Service()
            elif hasattr(service_module, 'create_service'):
                return service_module.create_service()
            else:
                return None
        except Exception as e:
            logger.warning(f"Could not initialize service {service_name}: {e}")
            return None

    def _get_service_dependencies(self, service_name: str) -> List[str]:
        """Get dependencies for a service."""
        dependency_mappings = {
            # Core services
            'rag': ['database', 'redis', 'embedding_backends', 'file_indexing'],
            'ollama': ['requests', 'aiohttp'],
            'gatekeeper': ['database', 'redis'],
            'redis': [],
            'caching': ['redis'],
            'file_indexing': ['rag', 'database', 'pdf_processing'],
            'debug_logging': [],
            'security': ['database'],
            'ecs_world': ['database', 'redis'],
            'ecs_database': ['database'],
            'comfy': ['requests', 'aiohttp'],
            'nlweb': ['requests', 'aiohttp'],
            'tts': ['requests', 'aiohttp'],
            # AI/ML services
            'pytorch': ['numpy', 'cuda'],
            'transformers': ['torch', 'tokenizers'],
            'sentence_transformers': ['transformers', 'torch'],
            'embedding_ollama': ['ollama', 'rag'],
            'embedding_openai': ['openai', 'rag'],
            'embedding_huggingface': ['transformers', 'rag'],
            # Processing services
            'pdf_processing': ['marker_package', 'file_indexing'],
            'marker_package': ['torch', 'transformers'],
            'marker_llm_enhancement': ['ollama', 'marker_package'],
            'security_threat_detection': ['security', 'database'],
            # Infrastructure services
            'diffusion_pipe': ['torch', 'transformers'],
            'continuous_indexing': ['rag', 'file_indexing', 'database'],
            'indexing_memory_profiler': ['rag', 'file_indexing'],
            'rag_continuous_indexing': ['rag', 'continuous_indexing'],
        }

        return dependency_mappings.get(service_name, [])

    def _get_feature_services(self, feature_name: str) -> List[str]:
        """Get services used by a feature."""
        service_mappings = {
            'indexing_memory_profiler': ['rag', 'file_indexing'],
            'rag_continuous_indexing': ['rag', 'file_indexing'],
            'embedding_backends': ['rag', 'ollama'],
            'embedding_ollama': ['ollama', 'rag'],
            'embedding_sentence_transformers': ['rag'],
            'embedding_openai': ['rag'],
            'embedding_huggingface': ['rag'],
            'pdf_processing': ['file_indexing'],
            'marker_package': ['file_indexing'],
            'marker_llm_enhancement': ['ollama', 'rag'],
            'security_threat_detection': ['security'],
        }

        return service_mappings.get(feature_name, [])

    def _get_package_version(self, package_name: str) -> str:
        """Get version of a package."""
        try:
            package_module = importlib.import_module(package_name)
            if hasattr(package_module, '__version__'):
                return package_module.__version__
            return "unknown"
        except Exception:
            return "not_installed"

    def _get_package_dependencies(self, package_name: str) -> List[str]:
        """Get dependencies of a package."""
        # This is a simplified implementation
        # In practice, you'd use pkg_resources or importlib.metadata
        return []

    def _count_package_classes(self, package_module) -> int:
        """Count classes in a package module."""
        if not package_module:
            return 0

        count = 0
        for name in dir(package_module):
            obj = getattr(package_module, name)
            if isinstance(obj, type):
                count += 1
        return count

    def _count_package_functions(self, package_module) -> int:
        """Count functions in a package module."""
        if not package_module:
            return 0

        count = 0
        for name in dir(package_module):
            obj = getattr(package_module, name)
            if callable(obj) and not isinstance(obj, type):
                count += 1
        return count

    def _get_package_size(self, package_name: str) -> float:
        """Get size of a package on disk in MB."""
        try:
            package_module = importlib.import_module(package_name)
            if hasattr(package_module, '__file__'):
                package_path = Path(package_module.__file__).parent
                total_size = sum(f.stat().st_size for f in package_path.rglob('*') if f.is_file())
                return total_size / (1024 * 1024)  # Convert to MB
            return 0.0
        except Exception:
            return 0.0

    def _count_feature_endpoints(self, feature_name: str) -> int:
        """Count endpoints for a feature."""
        # This is a simplified implementation
        # In practice, you'd analyze the FastAPI router for the feature
        endpoint_mappings = {
            'rag': 5,  # /query, /config, /index, /search, /health
            'ollama': 4,  # /chat, /models, /generate, /health
            'gatekeeper': 3,  # /auth, /validate, /health
            'redis': 2,  # /cache, /health
            'caching': 2,  # /cache, /health
            'file_indexing': 3,  # /index, /status, /health
            'debug_logging': 1,  # /logs
            'security': 4,  # /scan, /validate, /audit, /health
            'ecs_world': 6,  # /world, /entities, /systems, /events, /time, /health
            'ecs_database': 3,  # /entities, /systems, /health
            'comfy': 4,  # /text2img, /workflow, /queue, /health
            'nlweb': 3,  # /suggest, /proxy, /health
            'tts': 2,  # /synthesize, /health
        }

        return endpoint_mappings.get(feature_name, 0)

    def _calculate_service_performance_score(self, memory_mb: float, startup_time_ms: float, import_time_ms: float) -> float:
        """Calculate performance score for a service (0-100, higher is better)."""
        # Penalize high memory usage, slow startup, and slow imports
        memory_score = max(0, 100 - (memory_mb * 2))  # 2 points per MB
        startup_score = max(0, 100 - (startup_time_ms / 10))  # 1 point per 10ms
        import_score = max(0, 100 - (import_time_ms / 5))  # 1 point per 5ms

        return (memory_score + startup_score + import_score) / 3

    def _calculate_feature_performance_score(self, memory_mb: float, services_count: int, endpoints_count: int) -> float:
        """Calculate performance score for a feature (0-100, higher is better)."""
        # Penalize high memory usage and complexity
        memory_score = max(0, 100 - (memory_mb * 2))
        complexity_score = max(0, 100 - (services_count * 5) - (endpoints_count * 2))

        return (memory_score + complexity_score) / 2

    def _generate_summary(self) -> Dict[str, Any]:
        """Generate summary statistics with specific recommendations."""
        total_services = len(self.service_metrics)
        total_packages = len(self.package_metrics)
        total_features = len(self.feature_metrics)

        total_memory = sum(service.memory_mb for service in self.service_metrics.values())
        total_startup_time = sum(service.startup_time_ms for service in self.service_metrics.values())
        total_import_time = sum(service.import_time_ms for service in self.service_metrics.values())

        avg_performance_score = (
            sum(service.performance_score for service in self.service_metrics.values()) / total_services
            if total_services > 0 else 0
        )

        # Find top memory consumers
        top_memory_services = sorted(
            self.service_metrics.values(),
            key=lambda x: x.memory_mb,
            reverse=True
        )[:5]

        # Find slowest services
        slowest_services = sorted(
            self.service_metrics.values(),
            key=lambda x: x.startup_time_ms,
            reverse=True
        )[:5]

        # Generate specific recommendations
        recommendations = self._generate_specific_recommendations()

        return {
            "total_services": total_services,
            "total_packages": total_packages,
            "total_features": total_features,
            "total_memory_mb": total_memory,
            "total_startup_time_ms": total_startup_time,
            "total_import_time_ms": total_import_time,
            "average_performance_score": avg_performance_score,
            "top_memory_consumers": [
                {
                    "name": service.name,
                    "memory_mb": service.memory_mb,
                    "performance_score": service.performance_score,
                    "recommendation": self._get_service_specific_recommendation(service.name, "memory")
                }
                for service in top_memory_services
            ],
            "slowest_services": [
                {
                    "name": service.name,
                    "startup_time_ms": service.startup_time_ms,
                    "performance_score": service.performance_score,
                    "recommendation": self._get_service_specific_recommendation(service.name, "startup")
                }
                for service in slowest_services
            ],
            "system_health": self._calculate_system_health(),
            "specific_recommendations": recommendations
        }

    def _calculate_system_health(self) -> Dict[str, Any]:
        """Calculate overall system health metrics."""
        active_services = sum(1 for service in self.service_metrics.values() if service.status == "active")
        total_services = len(self.service_metrics)

        avg_memory = sum(service.memory_mb for service in self.service_metrics.values()) / total_services if total_services > 0 else 0
        avg_startup_time = sum(service.startup_time_ms for service in self.service_metrics.values()) / total_services if total_services > 0 else 0

        # Health score based on various factors
        health_score = 100
        if avg_memory > 100:  # High memory usage
            health_score -= 20
        if avg_startup_time > 1000:  # Slow startup
            health_score -= 20
        if active_services < total_services:  # Some services inactive
            health_score -= 10

        return {
            "overall_health_score": max(0, health_score),
            "active_services": active_services,
            "total_services": total_services,
            "service_uptime_percentage": (active_services / total_services * 100) if total_services > 0 else 0,
            "average_memory_usage_mb": avg_memory,
            "average_startup_time_ms": avg_startup_time,
            "health_status": "excellent" if health_score >= 90 else "good" if health_score >= 70 else "fair" if health_score >= 50 else "poor"
        }

    def _generate_specific_recommendations(self) -> List[Dict[str, Any]]:
        """Generate specific, actionable recommendations based on actual data."""
        recommendations = []
        
        # Memory-based recommendations
        high_memory_services = [s for s in self.service_metrics.values() if s.memory_mb > 50]
        if high_memory_services:
            recommendations.append({
                "category": "memory_optimization",
                "priority": "high",
                "issue": f"{len(high_memory_services)} services consuming >50MB each",
                "services_affected": [s.name for s in high_memory_services],
                "recommendation": "Implement lazy loading for high-memory services",
                "action_items": [
                    "Enable LazyRAGService for RAG components",
                    "Use conditional imports for ML libraries",
                    "Implement service-level memory monitoring"
                ]
            })

        # Startup time recommendations
        slow_services = [s for s in self.service_metrics.values() if s.startup_time_ms > 1000]
        if slow_services:
            recommendations.append({
                "category": "startup_optimization",
                "priority": "medium",
                "issue": f"{len(slow_services)} services taking >1s to start",
                "services_affected": [s.name for s in slow_services],
                "recommendation": "Optimize service initialization sequence",
                "action_items": [
                    "Implement parallel service initialization",
                    "Cache heavy computations during startup",
                    "Use async initialization patterns"
                ]
            })

        # Performance score recommendations
        low_performance_services = [s for s in self.service_metrics.values() if s.performance_score < 50]
        if low_performance_services:
            recommendations.append({
                "category": "performance_optimization",
                "priority": "high",
                "issue": f"{len(low_performance_services)} services with performance score <50",
                "services_affected": [s.name for s in low_performance_services],
                "recommendation": "Address performance bottlenecks in critical services",
                "action_items": [
                    "Profile individual service methods",
                    "Optimize database queries and connections",
                    "Implement caching strategies"
                ]
            })

        # Dependency optimization
        complex_services = [s for s in self.service_metrics.values() if len(s.dependencies) > 3]
        if complex_services:
            recommendations.append({
                "category": "dependency_optimization",
                "priority": "medium",
                "issue": f"{len(complex_services)} services with >3 dependencies",
                "services_affected": [s.name for s in complex_services],
                "recommendation": "Simplify service dependencies",
                "action_items": [
                    "Review and eliminate unnecessary dependencies",
                    "Implement dependency injection patterns",
                    "Consider service decomposition"
                ]
            })

        return recommendations

    def _get_service_specific_recommendation(self, service_name: str, issue_type: str) -> str:
        """Get specific recommendation for a service based on issue type."""
        recommendations = {
            "pytorch": {
                "memory": "Consider using torch.jit.script for model optimization and enable CUDA memory pooling",
                "startup": "Pre-load models in background threads and use model caching"
            },
            "transformers": {
                "memory": "Use model quantization and implement model sharing between services",
                "startup": "Cache tokenizers and use lazy model loading"
            },
            "rag": {
                "memory": "Implement LazyRAGService and use vector store compression",
                "startup": "Initialize embedding models asynchronously and cache vector indices"
            },
            "ollama": {
                "memory": "Use model streaming and implement connection pooling",
                "startup": "Pre-warm model connections and implement health checks"
            },
            "gatekeeper": {
                "memory": "Optimize JWT token storage and implement token cleanup",
                "startup": "Cache user permissions and use async database connections"
            },
            "redis": {
                "memory": "Configure memory limits and implement key expiration policies",
                "startup": "Use connection pooling and implement health monitoring"
            },
            "ecs_world": {
                "memory": "Implement entity pooling and optimize component storage",
                "startup": "Use parallel system initialization and cache world state"
            }
        }

        service_recs = recommendations.get(service_name, {})
        return service_recs.get(issue_type, "Review service configuration and optimize based on usage patterns")


async def main():
    """Main function for testing the service profiler."""
    profiler = ServiceProfiler()
    results = await profiler.profile_all_services()

    print("=== SERVICE PROFILING RESULTS ===")
    print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(main())
