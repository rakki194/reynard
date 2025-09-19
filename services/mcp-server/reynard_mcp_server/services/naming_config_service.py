#!/usr/bin/env python3
"""
Naming Configuration Service
===========================

Service for managing dynamic naming configuration with auto-reload capabilities.
"""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class NamingConfigService:
    """Service for managing dynamic naming configuration."""
    
    def __init__(self, config_path: Optional[Path] = None):
        """Initialize the naming configuration service."""
        if config_path is None:
            # Default to agent naming data directory
            self.config_path = Path(__file__).parent.parent.parent / "agent-naming" / "reynard_agent_naming" / "data" / "naming_config.json"
        else:
            self.config_path = Path(config_path)
        
        self._last_modified = 0
        self._config_cache: Optional[Dict[str, Any]] = None
        self._auto_reload = True
        
        # Load initial configuration
        self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            if not self.config_path.exists():
                logger.warning(f"Configuration file not found: {self.config_path}")
                return {}
            
            with self.config_path.open(encoding="utf-8") as f:
                config = json.load(f)
            
            self._last_modified = self.config_path.stat().st_mtime
            self._config_cache = config
            
            logger.info(f"Loaded naming configuration from {self.config_path}")
            return config
            
        except Exception as e:
            logger.error(f"Failed to load naming configuration: {e}")
            return {}
    
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration with auto-reload."""
        if self._auto_reload and self._should_reload():
            self._load_config()
        
        return self._config_cache or {}
    
    def _should_reload(self) -> bool:
        """Check if configuration should be reloaded."""
        try:
            if not self.config_path.exists():
                return False
            
            current_mtime = self.config_path.stat().st_mtime
            return current_mtime > self._last_modified
            
        except Exception as e:
            logger.error(f"Error checking file modification time: {e}")
            return False
    
    def reload_config(self) -> bool:
        """Manually reload configuration."""
        try:
            self._load_config()
            return True
        except Exception as e:
            logger.error(f"Failed to reload configuration: {e}")
            return False
    
    def get_enabled_schemes(self) -> Dict[str, Any]:
        """Get enabled naming schemes."""
        config = self.get_config()
        schemes = config.get("schemes", {})
        return {name: scheme for name, scheme in schemes.items() if scheme.get("enabled", True)}
    
    def get_enabled_styles(self) -> Dict[str, Any]:
        """Get enabled naming styles."""
        config = self.get_config()
        styles = config.get("styles", {})
        return {name: style for name, style in styles.items() if style.get("enabled", True)}
    
    def get_enabled_spirits(self) -> Dict[str, Any]:
        """Get enabled animal spirits."""
        config = self.get_config()
        spirits = config.get("spirits", {})
        return {name: spirit for name, spirit in spirits.items() if spirit.get("enabled", True)}
    
    def get_default_scheme(self) -> str:
        """Get default naming scheme."""
        config = self.get_config()
        return config.get("default_scheme", "animal_spirit")
    
    def get_default_style(self) -> str:
        """Get default naming style."""
        config = self.get_config()
        return config.get("default_style", "foundation")
    
    def get_weighted_distribution(self) -> bool:
        """Get weighted distribution setting."""
        config = self.get_config()
        return config.get("weighted_distribution", True)
    
    def get_spirit_emoji(self, spirit_name: str) -> str:
        """Get emoji for a specific spirit."""
        config = self.get_config()
        spirits = config.get("spirits", {})
        spirit = spirits.get(spirit_name, {})
        return spirit.get("emoji", "")
    
    def get_spirit_weight(self, spirit_name: str) -> float:
        """Get weight for a specific spirit."""
        config = self.get_config()
        spirits = config.get("spirits", {})
        spirit = spirits.get(spirit_name, {})
        return spirit.get("weight", 1.0)
    
    def validate_config(self) -> list[str]:
        """Validate current configuration."""
        issues = []
        config = self.get_config()
        
        # Check for required sections
        if not config.get("schemes"):
            issues.append("No naming schemes configured")
        
        if not config.get("styles"):
            issues.append("No naming styles configured")
        
        if not config.get("spirits"):
            issues.append("No animal spirits configured")
        
        # Check default scheme exists
        default_scheme = config.get("default_scheme")
        if default_scheme and default_scheme not in config.get("schemes", {}):
            issues.append(f"Default scheme '{default_scheme}' not found")
        
        # Check default style exists
        default_style = config.get("default_style")
        if default_style and default_style not in config.get("styles", {}):
            issues.append(f"Default style '{default_style}' not found")
        
        # Check for enabled schemes
        enabled_schemes = self.get_enabled_schemes()
        if not enabled_schemes:
            issues.append("No enabled naming schemes")
        
        # Check for enabled styles
        enabled_styles = self.get_enabled_styles()
        if not enabled_styles:
            issues.append("No enabled naming styles")
        
        # Check for enabled spirits
        enabled_spirits = self.get_enabled_spirits()
        if not enabled_spirits:
            issues.append("No enabled animal spirits")
        
        return issues
    
    def set_auto_reload(self, enabled: bool) -> None:
        """Enable or disable auto-reload."""
        self._auto_reload = enabled
        logger.info(f"Auto-reload {'enabled' if enabled else 'disabled'}")
    
    def get_config_status(self) -> Dict[str, Any]:
        """Get configuration status information."""
        config = self.get_config()
        
        return {
            "config_file": str(self.config_path),
            "exists": self.config_path.exists(),
            "last_modified": self._last_modified,
            "auto_reload": self._auto_reload,
            "version": config.get("version", "unknown"),
            "last_updated": config.get("last_updated", "unknown"),
            "default_scheme": self.get_default_scheme(),
            "default_style": self.get_default_style(),
            "weighted_distribution": self.get_weighted_distribution(),
            "total_schemes": len(config.get("schemes", {})),
            "enabled_schemes": len(self.get_enabled_schemes()),
            "total_styles": len(config.get("styles", {})),
            "enabled_styles": len(self.get_enabled_styles()),
            "total_spirits": len(config.get("spirits", {})),
            "enabled_spirits": len(self.get_enabled_spirits()),
            "validation_issues": self.validate_config()
        }
