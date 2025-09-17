"""
Tool Configuration Service for MCP Server

This service manages tool enable/disable states, configuration, and provides
a bridge between the MCP server and the FastAPI backend for tool management.
"""

import json
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


class ToolConfigService:
    """Service for managing tool configurations and states."""
    
    def __init__(self, config_file_path: str = "tool_config.json"):
        """Initialize the tool configuration service."""
        self.config_file_path = Path(config_file_path)
        self.config_data: Dict[str, Any] = {}
        self._load_config()
    
    def _load_config(self) -> None:
        """Load tool configuration from file."""
        try:
            if self.config_file_path.exists():
                with open(self.config_file_path, 'r', encoding='utf-8') as f:
                    self.config_data = json.load(f)
                logger.info(f"Loaded tool configuration from {self.config_file_path}")
            else:
                # Create default configuration
                self._create_default_config()
                self._save_config()
                logger.info(f"Created default tool configuration at {self.config_file_path}")
        except Exception as e:
            logger.error(f"Failed to load tool configuration: {e}")
            self._create_default_config()
    
    def _create_default_config(self) -> None:
        """Create default tool configuration."""
        self.config_data = {
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "tools": {
                "generate_agent_name": {
                    "name": "generate_agent_name",
                    "category": "agent",
                    "enabled": True,
                    "description": "Generate robot names with animal spirit themes",
                    "dependencies": [],
                    "config": {}
                },
                "assign_agent_name": {
                    "name": "assign_agent_name",
                    "category": "agent",
                    "enabled": True,
                    "description": "Assign names to agents with persistence",
                    "dependencies": [],
                    "config": {}
                },
                "get_agent_name": {
                    "name": "get_agent_name",
                    "category": "agent",
                    "enabled": True,
                    "description": "Retrieve current agent names",
                    "dependencies": [],
                    "config": {}
                },
                "list_agent_names": {
                    "name": "list_agent_names",
                    "category": "agent",
                    "enabled": True,
                    "description": "List all assigned agent names",
                    "dependencies": [],
                    "config": {}
                },
                "roll_agent_spirit": {
                    "name": "roll_agent_spirit",
                    "category": "agent",
                    "enabled": True,
                    "description": "Randomly select animal spirits",
                    "dependencies": [],
                    "config": {}
                },
                "agent_startup_sequence": {
                    "name": "agent_startup_sequence",
                    "category": "agent",
                    "enabled": True,
                    "description": "Complete initialization with ECS integration",
                    "dependencies": [],
                    "config": {}
                },
                "get_agent_persona": {
                    "name": "get_agent_persona",
                    "category": "agent",
                    "enabled": True,
                    "description": "Get comprehensive agent persona from ECS system",
                    "dependencies": [],
                    "config": {}
                },
                "get_lora_config": {
                    "name": "get_lora_config",
                    "category": "agent",
                    "enabled": True,
                    "description": "Get LoRA configuration for agent persona",
                    "dependencies": [],
                    "config": {}
                },
                "get_current_time": {
                    "name": "get_current_time",
                    "category": "utility",
                    "enabled": True,
                    "description": "Get current date and time with timezone support",
                    "dependencies": [],
                    "config": {}
                },
                "get_current_location": {
                    "name": "get_current_location",
                    "category": "utility",
                    "enabled": True,
                    "description": "Get location based on IP address",
                    "dependencies": [],
                    "config": {}
                },
                "send_desktop_notification": {
                    "name": "send_desktop_notification",
                    "category": "utility",
                    "enabled": True,
                    "description": "Send desktop notifications using libnotify",
                    "dependencies": [],
                    "config": {}
                },
                "restart_mcp_server": {
                    "name": "restart_mcp_server",
                    "category": "utility",
                    "enabled": True,
                    "description": "Restart the MCP server with different methods",
                    "dependencies": [],
                    "config": {}
                },
                "create_ecs_agent": {
                    "name": "create_ecs_agent",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Create a new agent using the ECS system",
                    "dependencies": [],
                    "config": {}
                },
                "create_ecs_offspring": {
                    "name": "create_ecs_offspring",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Create offspring agent from two parent agents using ECS",
                    "dependencies": [],
                    "config": {}
                },
                "get_ecs_agent_status": {
                    "name": "get_ecs_agent_status",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Get status of all agents in the ECS system",
                    "dependencies": [],
                    "config": {}
                },
                "get_ecs_agent_positions": {
                    "name": "get_ecs_agent_positions",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Get positions of all agents in the ECS system",
                    "dependencies": [],
                    "config": {}
                },
                "get_simulation_status": {
                    "name": "get_simulation_status",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Get comprehensive ECS world simulation status",
                    "dependencies": [],
                    "config": {}
                },
                "accelerate_time": {
                    "name": "accelerate_time",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Adjust time acceleration factor for world simulation",
                    "dependencies": [],
                    "config": {}
                },
                "nudge_time": {
                    "name": "nudge_time",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Nudge simulation time forward (for MCP actions)",
                    "dependencies": [],
                    "config": {}
                },
                "lint_frontend": {
                    "name": "lint_frontend",
                    "category": "linting",
                    "enabled": True,
                    "description": "ESLint for TypeScript/JavaScript (with auto-fix)",
                    "dependencies": [],
                    "config": {}
                },
                "lint_python": {
                    "name": "lint_python",
                    "category": "linting",
                    "enabled": True,
                    "description": "Flake8, Pylint for Python (with auto-fix)",
                    "dependencies": [],
                    "config": {}
                },
                "lint_markdown": {
                    "name": "lint_markdown",
                    "category": "linting",
                    "enabled": True,
                    "description": "markdownlint validation (with auto-fix)",
                    "dependencies": [],
                    "config": {}
                },
                "run_all_linting": {
                    "name": "run_all_linting",
                    "category": "linting",
                    "enabled": True,
                    "description": "Execute entire linting suite (with auto-fix)",
                    "dependencies": [],
                    "config": {}
                },
                "format_frontend": {
                    "name": "format_frontend",
                    "category": "formatting",
                    "enabled": True,
                    "description": "Prettier formatting (with check-only mode)",
                    "dependencies": [],
                    "config": {}
                },
                "format_python": {
                    "name": "format_python",
                    "category": "formatting",
                    "enabled": True,
                    "description": "Black + isort formatting (with check-only mode)",
                    "dependencies": [],
                    "config": {}
                },
                "search_files": {
                    "name": "search_files",
                    "category": "search",
                    "enabled": True,
                    "description": "Search for files by name pattern in the project",
                    "dependencies": [],
                    "config": {}
                },
                "semantic_search": {
                    "name": "semantic_search",
                    "category": "search",
                    "enabled": True,
                    "description": "Perform semantic search using vector embeddings",
                    "dependencies": [],
                    "config": {}
                },
                "search_enhanced": {
                    "name": "search_enhanced",
                    "category": "search",
                    "enabled": True,
                    "description": "Enhanced BM25 search with query expansion",
                    "dependencies": [],
                    "config": {}
                },
                "validate_mermaid_diagram": {
                    "name": "validate_mermaid_diagram",
                    "category": "visualization",
                    "enabled": True,
                    "description": "Validate mermaid diagram syntax and check for errors",
                    "dependencies": [],
                    "config": {}
                },
                "render_mermaid_to_svg": {
                    "name": "render_mermaid_to_svg",
                    "category": "visualization",
                    "enabled": True,
                    "description": "Render mermaid diagram to SVG format",
                    "dependencies": [],
                    "config": {}
                },
                "open_image": {
                    "name": "open_image",
                    "category": "visualization",
                    "enabled": True,
                    "description": "Open an image file with the imv image viewer",
                    "dependencies": [],
                    "config": {}
                },
                "scan_security": {
                    "name": "scan_security",
                    "category": "security",
                    "enabled": True,
                    "description": "Complete security audit (Bandit, audit-ci, type checking)",
                    "dependencies": [],
                    "config": {}
                },
                "scan_security_fast": {
                    "name": "scan_security_fast",
                    "category": "security",
                    "enabled": True,
                    "description": "Run fast security scanning (skips slow Bandit checks)",
                    "dependencies": [],
                    "config": {}
                },
                "get_versions": {
                    "name": "get_versions",
                    "category": "version",
                    "enabled": True,
                    "description": "Get versions of Python, Node.js, npm, pnpm, and TypeScript",
                    "dependencies": [],
                    "config": {}
                },
                "get_python_version": {
                    "name": "get_python_version",
                    "category": "version",
                    "enabled": True,
                    "description": "Get Python version information",
                    "dependencies": [],
                    "config": {}
                },
                "get_vscode_active_file": {
                    "name": "get_vscode_active_file",
                    "category": "vscode",
                    "enabled": True,
                    "description": "Get currently active file path in VS Code",
                    "dependencies": [],
                    "config": {}
                },
                "discover_vscode_tasks": {
                    "name": "discover_vscode_tasks",
                    "category": "vscode",
                    "enabled": True,
                    "description": "Discover all available VS Code tasks from tasks.json",
                    "dependencies": [],
                    "config": {}
                },
                "playwright_screenshot": {
                    "name": "playwright_screenshot",
                    "category": "playwright",
                    "enabled": True,
                    "description": "Take screenshots using Playwright browser automation",
                    "dependencies": [],
                    "config": {}
                },
                "playwright_navigate": {
                    "name": "playwright_navigate",
                    "category": "playwright",
                    "enabled": True,
                    "description": "Navigate to URLs and interact with web pages",
                    "dependencies": [],
                    "config": {}
                },
                "detect_monoliths": {
                    "name": "detect_monoliths",
                    "category": "monolith",
                    "enabled": True,
                    "description": "Detect large monolithic files that violate the 140-line axiom",
                    "dependencies": [],
                    "config": {}
                },
                "analyze_file_complexity": {
                    "name": "analyze_file_complexity",
                    "category": "monolith",
                    "enabled": True,
                    "description": "Deep-dive analysis of a specific file's complexity metrics",
                    "dependencies": [],
                    "config": {}
                }
            }
        }
    
    def _save_config(self) -> None:
        """Save tool configuration to file."""
        try:
            self.config_data["last_updated"] = datetime.now().isoformat()
            with open(self.config_file_path, 'w', encoding='utf-8') as f:
                json.dump(self.config_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved tool configuration to {self.config_file_path}")
        except Exception as e:
            logger.error(f"Failed to save tool configuration: {e}")
            raise
    
    def get_all_tools(self) -> Dict[str, Any]:
        """Get all tool configurations."""
        return self.config_data.get("tools", {})
    
    def get_tool_config(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific tool."""
        return self.config_data.get("tools", {}).get(tool_name)
    
    def is_tool_enabled(self, tool_name: str) -> bool:
        """Check if a tool is enabled."""
        tool_config = self.get_tool_config(tool_name)
        return tool_config.get("enabled", False) if tool_config else False
    
    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name not in self.config_data.get("tools", {}):
            return False
        
        self.config_data["tools"][tool_name]["enabled"] = True
        self._save_config()
        logger.info(f"Enabled tool: {tool_name}")
        return True
    
    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name not in self.config_data.get("tools", {}):
            return False
        
        self.config_data["tools"][tool_name]["enabled"] = False
        self._save_config()
        logger.info(f"Disabled tool: {tool_name}")
        return True
    
    def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        if tool_name not in self.config_data.get("tools", {}):
            return False
        
        current_state = self.config_data["tools"][tool_name]["enabled"]
        self.config_data["tools"][tool_name]["enabled"] = not current_state
        self._save_config()
        logger.info(f"Toggled tool {tool_name} to {'enabled' if not current_state else 'disabled'}")
        return True
    
    def update_tool_config(self, tool_name: str, config: Dict[str, Any]) -> bool:
        """Update a tool's configuration."""
        if tool_name not in self.config_data.get("tools", {}):
            return False
        
        self.config_data["tools"][tool_name]["config"].update(config)
        self._save_config()
        logger.info(f"Updated configuration for tool: {tool_name}")
        return True
    
    def get_tools_by_category(self, category: str) -> Dict[str, Any]:
        """Get all tools in a specific category."""
        tools = self.config_data.get("tools", {})
        return {
            name: config for name, config in tools.items()
            if config.get("category") == category
        }
    
    def get_tool_stats(self) -> Dict[str, Any]:
        """Get statistics about tool configurations."""
        tools = self.config_data.get("tools", {})
        total_tools = len(tools)
        enabled_tools = sum(1 for tool in tools.values() if tool.get("enabled", False))
        disabled_tools = total_tools - enabled_tools
        
        # Count by category
        categories = {}
        for tool in tools.values():
            category = tool.get("category", "unknown")
            categories[category] = categories.get(category, 0) + 1
        
        return {
            "total_tools": total_tools,
            "enabled_tools": enabled_tools,
            "disabled_tools": disabled_tools,
            "categories": categories,
            "last_updated": self.config_data.get("last_updated")
        }
    
    def reload_config(self) -> None:
        """Reload configuration from file."""
        self._load_config()
        logger.info("Reloaded tool configuration from file")
