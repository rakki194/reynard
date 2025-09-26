#!/usr/bin/env python3
"""
Tool Configuration Migration Script
===================================

Migrates tool configuration from JSON file to PostgreSQL database.
This script reads the existing tool_config.json and populates the PostgreSQL database.

Usage:
    python migrate_tool_config_to_postgresql.py [--json-file path/to/tool_config.json]

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import get_db_session
from app.services.tool_config_service import ToolConfigService
from app.core.logging import get_logger

logger = get_logger(__name__)


def load_json_config(json_file_path: str) -> Dict[str, Any]:
    """Load tool configuration from JSON file."""
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        logger.info(f"Loaded configuration from {json_file_path}")
        return config
    except FileNotFoundError:
        logger.error(f"JSON file not found: {json_file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {json_file_path}: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error loading JSON file: {e}")
        sys.exit(1)


def migrate_tools_to_postgresql(json_config: Dict[str, Any], service: ToolConfigService) -> Dict[str, Any]:
    """Migrate tools from JSON configuration to PostgreSQL."""
    results = {
        "total_tools": 0,
        "migrated": 0,
        "skipped": 0,
        "errors": 0,
        "error_details": []
    }
    
    tools_data = json_config.get("tools", {})
    results["total_tools"] = len(tools_data)
    
    logger.info(f"Starting migration of {results['total_tools']} tools...")
    
    for tool_name, tool_data in tools_data.items():
        try:
            # Check if tool already exists
            existing_tool = service.get_tool_by_name(tool_name)
            if existing_tool:
                logger.info(f"Tool '{tool_name}' already exists, skipping")
                results["skipped"] += 1
                continue
            
            # Create tool data in the format expected by the service
            tool_create_data = {
                "name": tool_name,
                "category": tool_data.get("category", "utility"),
                "enabled": tool_data.get("enabled", True),
                "description": tool_data.get("description", ""),
                "dependencies": tool_data.get("dependencies", []),
                "config": tool_data.get("config", {}),
                "version": tool_data.get("version", "1.0.0"),
                "is_system_tool": True,  # Tools from JSON are system tools
                "execution_type": "sync",
                "timeout_seconds": 30,
                "max_concurrent": 1
            }
            
            # Create the tool
            result = service.create_tool(tool_create_data, changed_by="migration_script")
            if result:
                logger.info(f"Successfully migrated tool: {tool_name}")
                results["migrated"] += 1
            else:
                logger.error(f"Failed to create tool: {tool_name}")
                results["errors"] += 1
                results["error_details"].append(f"Failed to create tool: {tool_name}")
                
        except Exception as e:
            logger.error(f"Error migrating tool '{tool_name}': {e}")
            results["errors"] += 1
            results["error_details"].append(f"Error migrating tool '{tool_name}': {str(e)}")
    
    return results


def main():
    """Main migration function."""
    parser = argparse.ArgumentParser(description="Migrate tool configuration from JSON to PostgreSQL")
    parser.add_argument(
        "--json-file",
        default="/home/kade/runeset/reynard/services/mcp-server/tool_config.json",
        help="Path to the JSON configuration file"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform a dry run without actually migrating data"
    )
    
    args = parser.parse_args()
    
    logger.info("Starting tool configuration migration...")
    logger.info(f"JSON file: {args.json_file}")
    logger.info(f"Dry run: {args.dry_run}")
    
    # Load JSON configuration
    json_config = load_json_config(args.json_file)
    
    if args.dry_run:
        logger.info("DRY RUN: Would migrate the following tools:")
        tools_data = json_config.get("tools", {})
        for tool_name, tool_data in tools_data.items():
            logger.info(f"  - {tool_name} (category: {tool_data.get('category', 'unknown')}, enabled: {tool_data.get('enabled', True)})")
        logger.info(f"Total tools: {len(tools_data)}")
        return
    
    # Initialize PostgreSQL service
    try:
        db_session = next(get_db_session())
        service = ToolConfigService(db_session=db_session)
        logger.info("Connected to PostgreSQL database")
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL database: {e}")
        sys.exit(1)
    
    # Perform migration
    try:
        results = migrate_tools_to_postgresql(json_config, service)
        
        # Print results
        logger.info("Migration completed!")
        logger.info(f"Total tools: {results['total_tools']}")
        logger.info(f"Successfully migrated: {results['migrated']}")
        logger.info(f"Skipped (already exist): {results['skipped']}")
        logger.info(f"Errors: {results['errors']}")
        
        if results["error_details"]:
            logger.error("Error details:")
            for error in results["error_details"]:
                logger.error(f"  - {error}")
        
        if results["errors"] > 0:
            logger.warning("Migration completed with errors")
            sys.exit(1)
        else:
            logger.info("Migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        if 'db_session' in locals():
            db_session.close()


if __name__ == "__main__":
    main()
