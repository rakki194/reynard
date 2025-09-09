"""
Lazy Loading Service - Refactored

This module provides the main service interface for lazy loading operations.
It orchestrates the various specialized managers for a clean, modular architecture.
"""

from typing import Dict, List, Optional, Any
from .package_manager import PackageManager
from .status_monitor import StatusMonitor
from .config_manager import ConfigManager
from .cleanup_manager import CleanupManager


class LazyLoadingService:
    """Main service for managing lazy loading operations."""
    
    def __init__(self):
        """Initialize the service with its component managers."""
        self.package_manager = PackageManager()
        self.status_monitor = StatusMonitor()
        self.config_manager = ConfigManager()
        self.cleanup_manager = CleanupManager()
    
    # Package Management Operations
    def create_lazy_export(self, package_name: str, validation_level: str) -> Dict[str, Any]:
        """Create a new lazy export for a package."""
        return self.package_manager.create_lazy_export(package_name, validation_level)
    
    def get_lazy_export(self, package_name: str) -> Optional[Dict[str, Any]]:
        """Get an existing lazy export."""
        return self.package_manager.get_lazy_export(package_name)
    
    def load_package(self, package_name: str) -> Dict[str, Any]:
        """Load a package using its lazy export."""
        return self.package_manager.load_package(package_name)
    
    def unload_package(self, package_name: str) -> Dict[str, Any]:
        """Unload a package by forcing cleanup of its lazy export."""
        return self.package_manager.unload_package(package_name)
    
    # Status Monitoring Operations
    def get_system_status(self) -> Dict[str, Any]:
        """Get the current status of the lazy loading system."""
        return self.status_monitor.get_system_status()
    
    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific package."""
        return self.status_monitor.get_package_info(package_name)
    
    def get_all_packages_info(self) -> List[Dict[str, Any]]:
        """Get information about all registered packages."""
        return self.status_monitor.get_all_packages_info()
    
    # Configuration Operations
    def get_config(self) -> Dict[str, Any]:
        """Get the current lazy loading configuration."""
        return self.config_manager.get_config()
    
    def update_config(self, config_update: Dict[str, Any]) -> Dict[str, Any]:
        """Update the lazy loading configuration."""
        return self.config_manager.update_config(config_update)
    
    # Cleanup Operations
    def clear_registry(self) -> Dict[str, Any]:
        """Clear the export registry."""
        return self.cleanup_manager.clear_registry()
    
    def force_cleanup(self, package_name: Optional[str] = None) -> Dict[str, Any]:
        """Force cleanup of packages or all packages."""
        return self.cleanup_manager.force_cleanup(package_name)


# Global service instance
_lazy_loading_service: Optional[LazyLoadingService] = None


def get_lazy_loading_service() -> LazyLoadingService:
    """Get the global lazy loading service instance."""
    global _lazy_loading_service
    if _lazy_loading_service is None:
        _lazy_loading_service = LazyLoadingService()
    return _lazy_loading_service
