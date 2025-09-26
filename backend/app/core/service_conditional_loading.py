"""Conditional Service Loading for Reynard Backend

This module provides environment-based conditional loading of services and packages,
allowing fine-grained control over which services are loaded based on environment
configuration. This helps reduce memory usage and startup time by avoiding loading
unnecessary dependencies.

Key Features:
- Environment-based service enabling/disabling
- Lazy loading of ML packages (PyTorch, Transformers, etc.)
- Memory-efficient conditional imports
- Service dependency management
- Runtime service availability checking
"""

import logging
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

logger = logging.getLogger("uvicorn")


@dataclass
class ServiceConfig:
    """Configuration for a service that can be conditionally loaded."""

    name: str
    enabled_env_var: str
    default_enabled: bool = True
    dependencies: List[str] = field(default_factory=list)
    description: str = ""
    memory_impact: str = "low"  # low, medium, high
    packages: List[str] = field(default_factory=list)


class ConditionalServiceLoader:
    """Manages conditional loading of services based on environment configuration."""

    def __init__(self):
        self._service_configs: Dict[str, ServiceConfig] = {}
        self._loaded_services: Set[str] = set()
        self._available_packages: Dict[str, bool] = {}
        self._initialize_default_services()

    def _initialize_default_services(self) -> None:
        """Initialize default service configurations."""

        # ML/AI Services
        self._service_configs["sentence_transformers"] = ServiceConfig(
            name="sentence_transformers",
            enabled_env_var="EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED",
            default_enabled=False,
            dependencies=["numpy"],
            description="Sentence Transformers for local embeddings",
            memory_impact="high",
            packages=["sentence_transformers", "numpy", "torch"],
        )

        self._service_configs["torch"] = ServiceConfig(
            name="torch",
            enabled_env_var="PYTORCH_ENABLED",
            default_enabled=False,
            dependencies=[],
            description="PyTorch for deep learning",
            memory_impact="very_high",
            packages=["torch"],
        )

        self._service_configs["transformers"] = ServiceConfig(
            name="transformers",
            enabled_env_var="TRANSFORMERS_ENABLED",
            default_enabled=False,
            dependencies=["torch"],
            description="Hugging Face Transformers library",
            memory_impact="high",
            packages=["transformers", "torch"],
        )

        self._service_configs["numpy"] = ServiceConfig(
            name="numpy",
            enabled_env_var="NUMPY_ENABLED",
            default_enabled=False,
            dependencies=[],
            description="NumPy for numerical computing",
            memory_impact="medium",
            packages=["numpy"],
        )

        self._service_configs["pandas"] = ServiceConfig(
            name="pandas",
            enabled_env_var="PANDAS_ENABLED",
            default_enabled=False,
            dependencies=["numpy"],
            description="Pandas for data manipulation",
            memory_impact="medium",
            packages=["pandas", "numpy"],
        )

        self._service_configs["scikit_learn"] = ServiceConfig(
            name="scikit_learn",
            enabled_env_var="SCIKIT_LEARN_ENABLED",
            default_enabled=False,
            dependencies=["numpy"],
            description="Scikit-learn for machine learning",
            memory_impact="medium",
            packages=["sklearn", "numpy"],
        )

        # Computer Vision Services
        self._service_configs["opencv"] = ServiceConfig(
            name="opencv",
            enabled_env_var="OPENCV_ENABLED",
            default_enabled=False,
            dependencies=["numpy"],
            description="OpenCV for computer vision",
            memory_impact="medium",
            packages=["cv2", "numpy"],
        )

        self._service_configs["pillow"] = ServiceConfig(
            name="pillow",
            enabled_env_var="PILLOW_ENABLED",
            default_enabled=True,  # Usually needed for basic image processing
            dependencies=[],
            description="Pillow for image processing",
            memory_impact="low",
            packages=["PIL"],
        )

        # Visualization Services
        self._service_configs["matplotlib"] = ServiceConfig(
            name="matplotlib",
            enabled_env_var="MATPLOTLIB_ENABLED",
            default_enabled=False,
            dependencies=["numpy"],
            description="Matplotlib for plotting",
            memory_impact="medium",
            packages=["matplotlib", "numpy"],
        )

        self._service_configs["seaborn"] = ServiceConfig(
            name="seaborn",
            enabled_env_var="SEABORN_ENABLED",
            default_enabled=False,
            dependencies=["matplotlib", "pandas"],
            description="Seaborn for statistical visualization",
            memory_impact="medium",
            packages=["seaborn", "matplotlib", "pandas"],
        )

        self._service_configs["plotly"] = ServiceConfig(
            name="plotly",
            enabled_env_var="PLOTLY_ENABLED",
            default_enabled=False,
            dependencies=[],
            description="Plotly for interactive visualization",
            memory_impact="medium",
            packages=["plotly"],
        )

        # Web/API Services
        self._service_configs["requests"] = ServiceConfig(
            name="requests",
            enabled_env_var="REQUESTS_ENABLED",
            default_enabled=True,  # Usually needed for HTTP requests
            dependencies=[],
            description="Requests for HTTP client",
            memory_impact="low",
            packages=["requests"],
        )

        self._service_configs["aiohttp"] = ServiceConfig(
            name="aiohttp",
            enabled_env_var="AIOHTTP_ENABLED",
            default_enabled=True,  # Usually needed for async HTTP
            dependencies=[],
            description="aiohttp for async HTTP client",
            memory_impact="low",
            packages=["aiohttp"],
        )

    def is_service_enabled(self, service_name: str) -> bool:
        """Check if a service is enabled based on environment configuration."""
        if service_name not in self._service_configs:
            logger.warning(f"Unknown service: {service_name}")
            return False

        config = self._service_configs[service_name]
        env_value = os.getenv(config.enabled_env_var)

        if env_value is None:
            return config.default_enabled

        return env_value.lower() in ("true", "1", "yes", "on")

    def is_package_available(self, package_name: str) -> bool:
        """Check if a package is available for import."""
        if package_name in self._available_packages:
            return self._available_packages[package_name]

        try:
            __import__(package_name)
            self._available_packages[package_name] = True
            return True
        except ImportError:
            self._available_packages[package_name] = False
            return False

    def can_load_service(self, service_name: str) -> bool:
        """Check if a service can be loaded (enabled and dependencies available)."""
        if not self.is_service_enabled(service_name):
            return False

        if service_name not in self._service_configs:
            return False

        config = self._service_configs[service_name]

        # Check dependencies
        for dep in config.dependencies:
            if not self.can_load_service(dep):
                return False

        # Check packages
        for package in config.packages:
            if not self.is_package_available(package):
                return False

        return True

    def load_service(self, service_name: str) -> bool:
        """Load a service if it's enabled and available."""
        if not self.can_load_service(service_name):
            logger.info(
                f"Service {service_name} cannot be loaded (disabled or unavailable)"
            )
            return False

        if service_name in self._loaded_services:
            return True

        try:
            config = self._service_configs[service_name]

            # Import packages
            for package in config.packages:
                __import__(package)

            self._loaded_services.add(service_name)
            logger.info(f"Successfully loaded service: {service_name}")
            return True

        except ImportError as e:
            logger.warning(f"Failed to load service {service_name}: {e}")
            return False

    def get_service_info(self, service_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a service."""
        if service_name not in self._service_configs:
            return None

        config = self._service_configs[service_name]
        return {
            "name": config.name,
            "enabled": self.is_service_enabled(service_name),
            "can_load": self.can_load_service(service_name),
            "loaded": service_name in self._loaded_services,
            "dependencies": config.dependencies,
            "packages": config.packages,
            "description": config.description,
            "memory_impact": config.memory_impact,
            "env_var": config.enabled_env_var,
        }

    def get_all_services_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all services."""
        return {
            name: self.get_service_info(name) for name in self._service_configs.keys()
        }

    def get_memory_impact_summary(self) -> Dict[str, List[str]]:
        """Get summary of services by memory impact."""
        summary = {"low": [], "medium": [], "high": [], "very_high": []}

        for name, config in self._service_configs.items():
            if self.is_service_enabled(name):
                summary[config.memory_impact].append(name)

        return summary

    def get_loaded_services(self) -> Set[str]:
        """Get set of currently loaded services."""
        return self._loaded_services.copy()

    def get_available_services(self) -> List[str]:
        """Get list of services that can be loaded."""
        return [
            name for name in self._service_configs.keys() if self.can_load_service(name)
        ]

    def get_disabled_services(self) -> List[str]:
        """Get list of disabled services."""
        return [
            name
            for name in self._service_configs.keys()
            if not self.is_service_enabled(name)
        ]

    def get_unavailable_services(self) -> List[str]:
        """Get list of services that are enabled but unavailable."""
        return [
            name
            for name in self._service_configs.keys()
            if self.is_service_enabled(name) and not self.can_load_service(name)
        ]


# Global instance
_conditional_loader: Optional[ConditionalServiceLoader] = None


def get_conditional_loader() -> ConditionalServiceLoader:
    """Get the global conditional service loader instance."""
    global _conditional_loader
    if _conditional_loader is None:
        _conditional_loader = ConditionalServiceLoader()
    return _conditional_loader


def is_service_enabled(service_name: str) -> bool:
    """Check if a service is enabled."""
    return get_conditional_loader().is_service_enabled(service_name)


def can_load_service(service_name: str) -> bool:
    """Check if a service can be loaded."""
    return get_conditional_loader().can_load_service(service_name)


def load_service(service_name: str) -> bool:
    """Load a service if possible."""
    return get_conditional_loader().load_service(service_name)


def get_service_info(service_name: str) -> Optional[Dict[str, Any]]:
    """Get service information."""
    return get_conditional_loader().get_service_info(service_name)


def get_memory_impact_summary() -> Dict[str, List[str]]:
    """Get memory impact summary."""
    return get_conditional_loader().get_memory_impact_summary()


# Convenience functions for common services
def is_sentence_transformers_enabled() -> bool:
    """Check if sentence transformers is enabled."""
    return is_service_enabled("sentence_transformers")


def is_torch_enabled() -> bool:
    """Check if PyTorch is enabled."""
    return is_service_enabled("torch")


def is_transformers_enabled() -> bool:
    """Check if transformers is enabled."""
    return is_service_enabled("transformers")


def is_numpy_enabled() -> bool:
    """Check if numpy is enabled."""
    return is_service_enabled("numpy")


def is_pandas_enabled() -> bool:
    """Check if pandas is enabled."""
    return is_service_enabled("pandas")


def is_opencv_enabled() -> bool:
    """Check if OpenCV is enabled."""
    return is_service_enabled("opencv")


def is_pillow_enabled() -> bool:
    """Check if Pillow is enabled."""
    return is_service_enabled("pillow")


def is_matplotlib_enabled() -> bool:
    """Check if matplotlib is enabled."""
    return is_service_enabled("matplotlib")


def is_requests_enabled() -> bool:
    """Check if requests is enabled."""
    return is_service_enabled("requests")


def is_aiohttp_enabled() -> bool:
    """Check if aiohttp is enabled."""
    return is_service_enabled("aiohttp")
