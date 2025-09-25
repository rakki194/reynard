#!/usr/bin/env python3
"""
Populate Default Tool Configurations
====================================

Script to populate the database with default tool configurations.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import get_db_session, test_connection
from app.models.tool_config_models import Tool, ToolCategory, ToolCategoryEnum, ToolConfiguration
from app.services.tool_config_service import ToolConfigService

def create_default_categories(db):
    """Create default tool categories."""
    categories = [
        ("AGENT", "Agent Tools", "Tools for agent management and naming", "🤖", "#FF6B6B", 1),
        ("CHARACTER", "Character Tools", "Tools for character creation and management", "👤", "#4ECDC4", 2),
        ("ECS", "ECS World Tools", "Entity Component System world simulation tools", "🌍", "#45B7D1", 3),
        ("SOCIAL", "Social Tools", "Tools for agent social interactions", "👥", "#96CEB4", 4),
        ("LINTING", "Linting Tools", "Code quality and linting tools", "🔍", "#FFEAA7", 5),
        ("FORMATTING", "Formatting Tools", "Code formatting and style tools", "✨", "#DDA0DD", 6),
        ("SEARCH", "Search Tools", "Code and content search tools", "🔎", "#98D8C8", 7),
        ("VISUALIZATION", "Visualization Tools", "Diagram and image visualization tools", "📊", "#F7DC6F", 8),
        ("SECURITY", "Security Tools", "Security scanning and analysis tools", "🔒", "#BB8FCE", 9),
        ("UTILITY", "Utility Tools", "General utility and helper tools", "🛠️", "#85C1E9", 10),
        ("VERSION", "Version Tools", "Version and environment information tools", "📋", "#F8C471", 11),
        ("VSCODE", "VS Code Tools", "VS Code integration and task tools", "💻", "#82E0AA", 12),
        ("PLAYWRIGHT", "Playwright Tools", "Browser automation and testing tools", "🎭", "#F1948A", 13),
        ("MONOLITH", "Monolith Detection", "Code complexity and monolith detection tools", "🏗️", "#D7BDE2", 14),
        ("MANAGEMENT", "Management Tools", "System and configuration management tools", "⚙️", "#A9DFBF", 15),
        ("SECRETS", "Secrets Tools", "Secret and credential management tools", "🔐", "#F9E79F", 16),
        ("RESEARCH", "Research Tools", "Academic and research paper tools", "📚", "#AED6F1", 17),
        ("EMAIL", "Email Tools", "Email and communication tools", "📧", "#D5DBDB", 18),
        ("GIT", "Git Tools", "Version control and Git tools", "🌿", "#FADBD8", 19),
    ]
    
    for name, display_name, description, icon, color, sort_order in categories:
        existing = db.query(ToolCategory).filter(ToolCategory.name == ToolCategoryEnum(name)).first()
        if not existing:
            category = ToolCategory(
                name=ToolCategoryEnum(name),
                display_name=display_name,
                description=description,
                icon=icon,
                color=color,
                sort_order=sort_order,
                is_active=True
            )
            db.add(category)
            print(f"Created category: {name}")

def create_default_tools(db):
    """Create default tools."""
    tools_data = [
        # Agent Tools
        ("generate_agent_name", "AGENT", "Generate robot names with animal spirit themes"),
        ("assign_agent_name", "AGENT", "Assign names to agents with persistence"),
        ("get_agent_name", "AGENT", "Retrieve current agent names"),
        ("list_agent_names", "AGENT", "List all assigned agent names"),
        ("roll_agent_spirit", "AGENT", "Randomly select animal spirits"),
        ("get_spirit_emoji", "AGENT", "Get emoji for animal spirit types"),
        ("agent_startup_sequence", "AGENT", "Complete initialization with ECS integration"),
        ("get_agent_persona", "AGENT", "Get comprehensive agent persona from ECS system"),
        ("get_lora_config", "AGENT", "Get LoRA configuration for agent persona"),
        
        # Character Tools
        ("create_character", "CHARACTER", "Create a new character with detailed customization"),
        ("get_character", "CHARACTER", "Get detailed character information by ID"),
        ("list_characters", "CHARACTER", "List all characters with optional filtering"),
        ("search_characters", "CHARACTER", "Search characters by name, description, or tags"),
        ("update_character", "CHARACTER", "Update character information"),
        ("delete_character", "CHARACTER", "Delete a character by ID"),
        ("get_character_types", "CHARACTER", "Get available character types"),
        ("get_personality_traits", "CHARACTER", "Get available personality traits"),
        ("get_ability_traits", "CHARACTER", "Get available ability traits"),
        
        # Utility Tools
        ("get_current_time", "UTILITY", "Get current date and time with timezone support"),
        ("get_current_location", "UTILITY", "Get location based on IP address"),
        ("send_desktop_notification", "UTILITY", "Send desktop notifications using libnotify"),
        ("restart_mcp_server", "UTILITY", "Restart the MCP server with different methods"),
        
        # ECS Tools
        ("create_ecs_agent", "ECS", "Create a new agent using the ECS system"),
        ("create_ecs_offspring", "ECS", "Create offspring agent from two parent agents using ECS"),
        ("get_ecs_agent_status", "ECS", "Get status of all agents in the ECS system"),
        ("get_ecs_agent_positions", "ECS", "Get positions of all agents in the ECS system"),
        ("get_simulation_status", "ECS", "Get comprehensive ECS world simulation status"),
        ("accelerate_time", "ECS", "Adjust time acceleration factor for world simulation"),
        ("nudge_time", "ECS", "Nudge simulation time forward (for MCP actions)"),
        
        # Linting Tools
        ("lint_frontend", "LINTING", "ESLint for TypeScript/JavaScript (with auto-fix)"),
        ("lint_python", "LINTING", "Flake8, Pylint for Python (with auto-fix)"),
        ("lint_markdown", "LINTING", "markdownlint validation (with auto-fix)"),
        ("run_all_linting", "LINTING", "Execute entire linting suite (with auto-fix)"),
        
        # Formatting Tools
        ("format_frontend", "FORMATTING", "Prettier formatting (with check-only mode)"),
        ("format_python", "FORMATTING", "Black + isort formatting (with check-only mode)"),
        
        # Search Tools
        ("search_files", "SEARCH", "Search for files by name pattern in the project"),
        ("semantic_search", "SEARCH", "Perform semantic search using vector embeddings"),
        ("search_codebase", "SEARCH", "Search the Reynard codebase using RAG backend with BM25 fallback"),
        ("search_semantic", "SEARCH", "Perform semantic search using RAG backend with Ollama embeddings"),
        ("search_keyword", "SEARCH", "Perform keyword search using BM25 fallback"),
        
        # Visualization Tools
        ("validate_mermaid_diagram", "VISUALIZATION", "Validate mermaid diagram syntax and check for errors"),
        ("render_mermaid_to_svg", "VISUALIZATION", "Render mermaid diagram to SVG format"),
        ("open_image", "VISUALIZATION", "Open an image file with the imv image viewer"),
        
        # Security Tools
        ("scan_security", "SECURITY", "Complete security audit (Bandit, audit-ci, type checking)"),
        ("scan_security_fast", "SECURITY", "Run fast security scanning (skips slow Bandit checks)"),
        
        # Version Tools
        ("get_versions", "VERSION", "Get versions of Python, Node.js, npm, pnpm, and TypeScript"),
        ("get_python_version", "VERSION", "Get Python version information"),
        
        # VS Code Tools
        ("get_vscode_active_file", "VSCODE", "Get currently active file path in VS Code"),
        ("discover_vscode_tasks", "VSCODE", "Discover all available VS Code tasks from tasks.json"),
        
        # Playwright Tools
        ("playwright_screenshot", "PLAYWRIGHT", "Take screenshots using Playwright browser automation"),
        ("playwright_navigate", "PLAYWRIGHT", "Navigate to URLs and interact with web pages"),
        
        # Monolith Detection Tools
        ("detect_monoliths", "MONOLITH", "Detect large monolithic files that violate the 140-line axiom"),
        ("analyze_file_complexity", "MONOLITH", "Deep-dive analysis of a specific file's complexity metrics"),
    ]
    
    for tool_name, category_name, description in tools_data:
        existing = db.query(Tool).filter(Tool.name == tool_name).first()
        if not existing:
            category = db.query(ToolCategory).filter(ToolCategory.name == ToolCategoryEnum(category_name)).first()
            if category:
                tool = Tool(
                    name=tool_name,
                    category_id=category.id,
                    enabled=True,
                    description=description,
                    dependencies=[],
                    config={},
                    version="1.0.0",
                    is_system_tool=True,
                    execution_type="sync",
                    timeout_seconds=30,
                    max_concurrent=1
                )
                db.add(tool)
                print(f"Created tool: {tool_name}")

def create_global_config(db):
    """Create global configuration."""
    existing = db.query(ToolConfiguration).first()
    if not existing:
        config = ToolConfiguration(
            version="1.0.0",
            auto_sync_enabled=True,
            default_timeout=30,
            max_concurrent_tools=10,
            cache_ttl_seconds=300,
            settings={}
        )
        db.add(config)
        print("Created global configuration")

def main():
    """Populate the database with default tool configurations."""
    print("Testing database connection...")
    if not test_connection():
        print("❌ Database connection failed")
        return False
    
    print("Populating database with default tool configurations...")
    try:
        db = next(get_db_session())
        
        # Create categories
        create_default_categories(db)
        db.commit()
        
        # Create tools
        create_default_tools(db)
        db.commit()
        
        # Create global configuration
        create_global_config(db)
        db.commit()
        
        db.close()
        
        print("✅ Database populated successfully")
        
        # Verify the population
        service = ToolConfigService()
        stats = service.get_tool_statistics()
        print(f"Database now contains {stats.get('total_tools', 0)} tools")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to populate database: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
