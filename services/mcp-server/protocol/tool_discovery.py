#!/usr/bin/env python3
"""
Tool Discovery System
=====================

Automatic tool discovery system that scans modules for @register_tool decorators
and automatically registers them with the tool registry.

Follows the 140-line axiom and modular architecture principles.
"""

import ast
import importlib
import logging
import os
import time
from pathlib import Path
from typing import List, Set

from .tool_registry import ToolRegistry, get_tool_registry

logger = logging.getLogger(__name__)


class ToolDiscovery:
    """Automatic tool discovery system."""

    def __init__(self, tool_registry: ToolRegistry):
        self.tool_registry = tool_registry

    def discover_tools_in_directory(self, directory_path: str) -> int:
        """Discover all tools in a directory and its subdirectories."""
        discovered_count = 0
        directory = Path(directory_path)
        
        if not directory.exists():
            logger.warning(f"Directory {directory_path} does not exist")
            return 0

        # Find all Python files
        python_files = list(directory.rglob("*.py"))
        
        for python_file in python_files:
            # Skip __pycache__ and test files
            if "__pycache__" in str(python_file) or "test_" in python_file.name:
                continue
                
            try:
                count = self._discover_tools_in_file(python_file)
                discovered_count += count
                if count > 0:
                    logger.info(f"Discovered {count} tools in {python_file}")
            except Exception as e:
                logger.error(f"Failed to discover tools in {python_file}: {e}")

        logger.info(f"Total tools discovered: {discovered_count}")
        return discovered_count

    def _discover_tools_in_file(self, file_path: Path) -> int:
        """Discover tools in a single Python file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse the AST
            tree = ast.parse(content)
            
            # Find all function definitions with @register_tool decorators
            tools_found = 0
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if self._has_register_tool_decorator(node):
                        tools_found += 1
                        logger.debug(f"Found @register_tool decorator on function: {node.name}")
            
            return tools_found
            
        except Exception as e:
            logger.error(f"Failed to parse {file_path}: {e}")
            return 0

    def _has_register_tool_decorator(self, func_node: ast.FunctionDef) -> bool:
        """Check if a function has the @register_tool decorator."""
        for decorator in func_node.decorator_list:
            if isinstance(decorator, ast.Call):
                # Handle @register_tool(...) calls
                if isinstance(decorator.func, ast.Name) and decorator.func.id == "register_tool":
                    return True
            elif isinstance(decorator, ast.Name):
                # Handle @register_tool without arguments
                if decorator.id == "register_tool":
                    return True
        return False

    def import_and_register_tools(self, module_path: str) -> int:
        """Import a module and register any tools found."""
        logger.debug(f"🕐 Starting import_and_register_tools for {module_path}")
        start_time = time.time()
        
        try:
            # Convert file path to module path
            logger.debug(f"🕐 Converting file path to module name...")
            module_name = self._file_path_to_module_name(module_path)
            logger.debug(f"Module name: {module_name}")
            
            # Import the module
            logger.debug(f"🕐 Importing module {module_name}...")
            import_start = time.time()
            try:
                module = importlib.import_module(module_name)
                import_elapsed = time.time() - import_start
                logger.debug(f"✅ Module {module_name} imported in {import_elapsed:.3f}s")
            except Exception as import_error:
                import_elapsed = time.time() - import_start
                logger.error(f"❌ Failed to import module {module_name} after {import_elapsed:.3f}s: {import_error}")
                raise
            
            # Register any tools that were decorated with @register_tool
            logger.debug(f"🕐 Registering tools from {module_name}...")
            register_start = time.time()
            tools_registered = 0
            for name in dir(module):
                obj = getattr(module, name)
                if callable(obj) and hasattr(obj, '_tool_registration'):
                    # Register the tool
                    registry = self.tool_registry
                    reg_info = obj._tool_registration
                    registry.register_tool_decorator(
                        name=reg_info['name'],
                        category=reg_info['category'],
                        description=reg_info['description'],
                        execution_type=reg_info['execution_type'],
                        enabled=reg_info['enabled'],
                        dependencies=reg_info['dependencies'],
                        config=reg_info['config']
                    )(obj)
                    tools_registered += 1
                    logger.debug(f"✅ Registered tool: {reg_info['name']}")
            
            register_elapsed = time.time() - register_start
            logger.debug(f"✅ Registered {tools_registered} tools from {module_name} in {register_elapsed:.3f}s")
            
            total_elapsed = time.time() - start_time
            logger.debug(f"✅ import_and_register_tools completed for {module_path} in {total_elapsed:.3f}s")
            return tools_registered
            
        except Exception as e:
            total_elapsed = time.time() - start_time
            logger.error(f"❌ Failed to import module {module_path} after {total_elapsed:.3f}s: {e}")
            return 0

    def _file_path_to_module_name(self, file_path: str) -> str:
        """Convert a file path to a module name."""
        # Remove .py extension
        module_path = file_path.replace('.py', '')
        
        # Replace path separators with dots
        module_path = module_path.replace(os.sep, '.')
        
        # Remove leading dots
        module_path = module_path.lstrip('.')
        
        return module_path

    def discover_and_import_tools(self, directory_path: str) -> int:
        """Discover and import all tools in a directory."""
        logger.debug(f"🕐 Starting discover_and_import_tools for {directory_path}")
        start_time = time.time()
        discovered_count = 0
        
        # First, discover tools by scanning files
        logger.debug("🕐 Phase 1: Discovering tools by scanning files...")
        scan_start = time.time()
        try:
            self.discover_tools_in_directory(directory_path)
            scan_elapsed = time.time() - scan_start
            logger.debug(f"✅ File scanning completed in {scan_elapsed:.3f}s")
        except Exception as e:
            scan_elapsed = time.time() - scan_start
            logger.error(f"❌ File scanning failed after {scan_elapsed:.3f}s: {e}")
            raise
        
        # Then, import modules to trigger decorator registration
        logger.debug("🕐 Phase 2: Importing modules to trigger decorator registration...")
        import_start = time.time()
        directory = Path(directory_path)
        if not directory.exists():
            logger.warning(f"Directory {directory_path} does not exist")
            return 0
            
        python_files = list(directory.rglob("*.py"))
        logger.debug(f"Found {len(python_files)} Python files to process")
        
        for i, python_file in enumerate(python_files):
            # Skip __pycache__ and test files
            if "__pycache__" in str(python_file) or "test_" in python_file.name:
                logger.debug(f"Skipping {python_file} (cache or test file)")
                continue
                
            logger.debug(f"🕐 Processing file {i+1}/{len(python_files)}: {python_file}")
            file_start = time.time()
            try:
                count = self.import_and_register_tools(str(python_file))
                discovered_count += count
                file_elapsed = time.time() - file_start
                if count > 0:
                    logger.info(f"✅ Imported {count} tools from {python_file} in {file_elapsed:.3f}s")
                else:
                    logger.debug(f"✅ Processed {python_file} in {file_elapsed:.3f}s (no tools found)")
            except Exception as e:
                file_elapsed = time.time() - file_start
                logger.error(f"❌ Failed to import tools from {python_file} after {file_elapsed:.3f}s: {e}")

        import_elapsed = time.time() - import_start
        total_elapsed = time.time() - start_time
        logger.info(f"✅ Total tools discovered and imported: {discovered_count} in {total_elapsed:.3f}s")
        return discovered_count

    def get_discovered_tools(self) -> List[str]:
        """Get list of all discovered tool names."""
        return list(self.tool_registry.list_all_tools().keys())

    def get_tools_by_category(self, category: str) -> List[str]:
        """Get tools by category."""
        tools = self.tool_registry.get_tools_by_category(category)
        return list(tools.keys())

    def validate_tool_registration(self) -> dict:
        """Validate that all discovered tools are properly registered."""
        validation_results = {
            "total_tools": len(self.tool_registry.list_all_tools()),
            "enabled_tools": 0,
            "disabled_tools": 0,
            "categories": {},
            "issues": []
        }
        
        for tool_name, metadata in self.tool_registry.list_all_tools().items():
            if metadata.enabled:
                validation_results["enabled_tools"] += 1
            else:
                validation_results["disabled_tools"] += 1
                
            # Count by category
            category = metadata.category
            if category not in validation_results["categories"]:
                validation_results["categories"][category] = 0
            validation_results["categories"][category] += 1
            
            # Check for issues
            if not metadata.handler_method:
                validation_results["issues"].append(f"Tool {tool_name} has no handler method")
            if not metadata.description:
                validation_results["issues"].append(f"Tool {tool_name} has no description")
                
        return validation_results
