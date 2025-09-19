#!/usr/bin/env python3
"""
Agent Naming Configuration Tools
===============================

MCP tools for managing dynamic agent naming configuration.
Allows runtime configuration changes through JSON files.
"""

import json
import logging
from pathlib import Path
from typing import Any

from protocol.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class NamingConfigTools:
    """Tools for managing agent naming configuration."""
    
    def __init__(self, tool_registry: ToolRegistry):
        self.tool_registry = tool_registry
        # Import the dynamic config manager
        try:
            from reynard_agent_naming.agent_naming.dynamic_config import DynamicConfigManager
            self.config_manager = DynamicConfigManager()
        except ImportError as e:
            logger.warning(f"Failed to import DynamicConfigManager: {e}")
            self.config_manager = None
    
    async def get_naming_config(self) -> dict[str, Any]:
        """Get current naming system configuration."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available. Please check agent naming library installation."
                        }
                    ]
                }
            
            config = self.config_manager.get_config()
            
            # Convert to a more readable format
            config_summary = {
                "version": config.version,
                "last_updated": config.last_updated,
                "default_scheme": config.default_scheme,
                "default_style": config.default_style,
                "weighted_distribution": config.weighted_distribution,
                "enabled_schemes": list(config.get_enabled_schemes().keys()),
                "enabled_styles": list(config.get_enabled_styles().keys()),
                "enabled_spirits": list(config.get_enabled_spirits().keys()),
                "total_schemes": len(config.schemes),
                "total_styles": len(config.styles),
                "total_spirits": len(config.spirits),
                "total_components": len(config.components),
                "total_generations": len(config.generations)
            }
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🎯 **Agent Naming Configuration**\n\n"
                               f"**Version:** {config_summary['version']}\n"
                               f"**Last Updated:** {config_summary['last_updated']}\n"
                               f"**Default Scheme:** {config_summary['default_scheme']}\n"
                               f"**Default Style:** {config_summary['default_style']}\n"
                               f"**Weighted Distribution:** {config_summary['weighted_distribution']}\n\n"
                               f"**📊 Statistics:**\n"
                               f"• Total Schemes: {config_summary['total_schemes']}\n"
                               f"• Total Styles: {config_summary['total_styles']}\n"
                               f"• Total Spirits: {config_summary['total_spirits']}\n"
                               f"• Total Components: {config_summary['total_components']}\n"
                               f"• Total Generations: {config_summary['total_generations']}\n\n"
                               f"**✅ Enabled Schemes:** {', '.join(config_summary['enabled_schemes'])}\n"
                               f"**✅ Enabled Styles:** {', '.join(config_summary['enabled_styles'])}\n"
                               f"**✅ Enabled Spirits:** {', '.join(config_summary['enabled_spirits'][:10])}{'...' if len(config_summary['enabled_spirits']) > 10 else ''}"
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting naming configuration: {e}"
                    }
                ]
            }
    
    async def get_available_schemes(self) -> dict[str, Any]:
        """Get list of available naming schemes."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            config = self.config_manager.get_config()
            schemes = config.get_enabled_schemes()
            
            scheme_list = []
            for name, scheme_config in schemes.items():
                status = "✅ Enabled" if scheme_config.enabled else "❌ Disabled"
                scheme_list.append(f"• **{name}**: {scheme_config.description} {status}")
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🎯 **Available Naming Schemes**\n\n" + "\n".join(scheme_list)
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting available schemes: {e}"
                    }
                ]
            }
    
    async def get_available_styles(self) -> dict[str, Any]:
        """Get list of available naming styles."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            config = self.config_manager.get_config()
            styles = config.get_enabled_styles()
            
            style_list = []
            for name, style_config in styles.items():
                status = "✅ Enabled" if style_config.enabled else "❌ Disabled"
                style_list.append(f"• **{name}**: {style_config.description} {status}")
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🎨 **Available Naming Styles**\n\n" + "\n".join(style_list)
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting available styles: {e}"
                    }
                ]
            }
    
    async def get_available_spirits(self) -> dict[str, Any]:
        """Get list of available animal spirits."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            config = self.config_manager.get_config()
            spirits = config.get_enabled_spirits()
            
            spirit_list = []
            for name, spirit_config in spirits.items():
                status = "✅ Enabled" if spirit_config.enabled else "❌ Disabled"
                weight = f" (weight: {spirit_config.weight})" if spirit_config.weight != 1.0 else ""
                spirit_list.append(f"• **{name}**: {spirit_config.description} {status}{weight}")
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🦊 **Available Animal Spirits**\n\n" + "\n".join(spirit_list)
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting available spirits: {e}"
                    }
                ]
            }
    
    async def set_default_scheme(self, scheme_name: str) -> dict[str, Any]:
        """Set the default naming scheme."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.set_default_scheme(scheme_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Default naming scheme set to '{scheme_name}'"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to set default scheme to '{scheme_name}' - scheme not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error setting default scheme: {e}"
                    }
                ]
            }
    
    async def set_default_style(self, style_name: str) -> dict[str, Any]:
        """Set the default naming style."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.set_default_style(style_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Default naming style set to '{style_name}'"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to set default style to '{style_name}' - style not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error setting default style: {e}"
                    }
                ]
            }
    
    async def enable_scheme(self, scheme_name: str) -> dict[str, Any]:
        """Enable a naming scheme."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.enable_scheme(scheme_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Naming scheme '{scheme_name}' enabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to enable scheme '{scheme_name}' - scheme not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error enabling scheme: {e}"
                    }
                ]
            }
    
    async def disable_scheme(self, scheme_name: str) -> dict[str, Any]:
        """Disable a naming scheme."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.disable_scheme(scheme_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Naming scheme '{scheme_name}' disabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to disable scheme '{scheme_name}' - scheme not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error disabling scheme: {e}"
                    }
                ]
            }
    
    async def enable_style(self, style_name: str) -> dict[str, Any]:
        """Enable a naming style."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.enable_style(style_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Naming style '{style_name}' enabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to enable style '{style_name}' - style not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error enabling style: {e}"
                    }
                ]
            }
    
    async def disable_style(self, style_name: str) -> dict[str, Any]:
        """Disable a naming style."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.disable_style(style_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Naming style '{style_name}' disabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to disable style '{style_name}' - style not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error disabling style: {e}"
                    }
                ]
            }
    
    async def enable_spirit(self, spirit_name: str) -> dict[str, Any]:
        """Enable an animal spirit."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.enable_spirit(spirit_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Animal spirit '{spirit_name}' enabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to enable spirit '{spirit_name}' - spirit not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error enabling spirit: {e}"
                    }
                ]
            }
    
    async def disable_spirit(self, spirit_name: str) -> dict[str, Any]:
        """Disable an animal spirit."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.disable_spirit(spirit_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Animal spirit '{spirit_name}' disabled"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to disable spirit '{spirit_name}' - spirit not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error disabling spirit: {e}"
                    }
                ]
            }
    
    async def reload_naming_config(self) -> dict[str, Any]:
        """Reload naming configuration from file."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            success = self.config_manager.reload_config()
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "✅ Naming configuration reloaded successfully"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Failed to reload naming configuration"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error reloading naming configuration: {e}"
                    }
                ]
            }
    
    async def validate_naming_config(self) -> dict[str, Any]:
        """Validate current naming configuration."""
        try:
            if self.config_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Naming configuration manager not available."
                        }
                    ]
                }
            
            issues = self.config_manager.validate_config()
            if not issues:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "✅ Naming configuration is valid - no issues found"
                        }
                    ]
                }
            else:
                issue_list = "\n".join([f"• {issue}" for issue in issues])
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"⚠️ **Configuration Issues Found:**\n\n{issue_list}"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error validating naming configuration: {e}"
                    }
                ]
            }



