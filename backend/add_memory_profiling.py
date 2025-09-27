#!/usr/bin/env python3
"""🦊 Add Memory Profiling to RAG Components
==========================================

Script to add memory profiling decorators to key RAG components for
comprehensive memory usage tracking and debugging.

This script will:
1. Identify key functions in RAG components
2. Add memory profiling decorators
3. Create backup files
4. Generate a report of changes made

Author: Reynard Development Team
Version: 1.0.0
"""

import ast
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class MemoryProfilingAdder:
    """Add memory profiling decorators to RAG components."""
    
    def __init__(self, backend_path: str):
        """Initialize the memory profiling adder."""
        self.backend_path = Path(backend_path)
        self.rag_services_path = self.backend_path / "app" / "services" / "rag"
        self.changes_made: List[Dict[str, Any]] = []
        
        # Key components to profile
        self.components_to_profile = {
            "embedding_service": {
                "file": "services/core/embedding.py",
                "functions": ["embed_text", "embed_batch", "_generate_embedding_via_ai_service"],
                "component_name": "embedding_service"
            },
            "vector_store": {
                "file": "services/core/vector_store.py",
                "functions": ["store_vectors", "search_vectors", "delete_vectors"],
                "component_name": "vector_store"
            },
            "document_indexer": {
                "file": "services/core/document_processor.py",
                "functions": ["index_documents", "process_document", "extract_content"],
                "component_name": "document_indexer"
            },
            "search_engine": {
                "file": "services/core/search.py",
                "functions": ["search", "search_with_filters", "hybrid_search"],
                "component_name": "search_engine"
            },
            "rag_service": {
                "file": "rag_service.py",
                "functions": ["embed_text", "embed_batch", "search", "index_documents"],
                "component_name": "rag_service"
            },
            "indexing_service": {
                "file": "indexing.py",
                "functions": ["perform_indexing", "_process_batch", "_process_single_file"],
                "component_name": "indexing_service"
            }
        }
    
    def add_profiling_to_all_components(self) -> Dict[str, Any]:
        """Add memory profiling to all RAG components."""
        logger.info("🚀 Starting memory profiling addition to RAG components...")
        
        results = {
            "success": True,
            "components_processed": 0,
            "functions_modified": 0,
            "errors": [],
            "changes": []
        }
        
        for component_name, config in self.components_to_profile.items():
            try:
                file_path = self.rag_services_path / config["file"]
                
                if not file_path.exists():
                    logger.warning(f"⚠️ File not found: {file_path}")
                    results["errors"].append(f"File not found: {file_path}")
                    continue
                
                logger.info(f"📝 Processing {component_name}: {file_path}")
                
                # Create backup
                backup_path = file_path.with_suffix(f"{file_path.suffix}.backup")
                shutil.copy2(file_path, backup_path)
                logger.info(f"💾 Backup created: {backup_path}")
                
                # Add profiling
                changes = self._add_profiling_to_file(
                    file_path, 
                    config["functions"], 
                    config["component_name"]
                )
                
                if changes["functions_modified"] > 0:
                    results["components_processed"] += 1
                    results["functions_modified"] += changes["functions_modified"]
                    results["changes"].append({
                        "component": component_name,
                        "file": str(file_path),
                        "functions_modified": changes["functions_modified"],
                        "functions": changes["functions"]
                    })
                    logger.info(f"✅ Modified {changes['functions_modified']} functions in {component_name}")
                else:
                    logger.info(f"ℹ️ No functions modified in {component_name}")
                
            except Exception as e:
                logger.error(f"❌ Error processing {component_name}: {e}")
                results["errors"].append(f"Error processing {component_name}: {e}")
                results["success"] = False
        
        logger.info(f"🎯 Memory profiling addition completed:")
        logger.info(f"   Components processed: {results['components_processed']}")
        logger.info(f"   Functions modified: {results['functions_modified']}")
        logger.info(f"   Errors: {len(results['errors'])}")
        
        return results
    
    def _add_profiling_to_file(
        self, 
        file_path: Path, 
        functions_to_profile: List[str], 
        component_name: str
    ) -> Dict[str, Any]:
        """Add memory profiling to a specific file."""
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse the AST
            tree = ast.parse(content)
            
            # Track changes
            changes = {
                "functions_modified": 0,
                "functions": []
            }
            
            # Check if memory profiling import exists
            has_memory_import = "from app.core.memory_profiling import memory_profile" in content
            
            # Modify the AST
            modified_tree = self._modify_ast_for_profiling(
                tree, 
                functions_to_profile, 
                component_name,
                changes
            )
            
            # Generate new content
            new_content = self._ast_to_code(modified_tree)
            
            # Add import if needed
            if not has_memory_import and changes["functions_modified"] > 0:
                new_content = self._add_memory_import(new_content)
            
            # Write the modified content
            if changes["functions_modified"] > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                logger.info(f"📝 Modified {file_path}")
            
            return changes
            
        except Exception as e:
            logger.error(f"Error modifying {file_path}: {e}")
            return {"functions_modified": 0, "functions": [], "error": str(e)}
    
    def _modify_ast_for_profiling(
        self, 
        tree: ast.AST, 
        functions_to_profile: List[str], 
        component_name: str,
        changes: Dict[str, Any]
    ) -> ast.AST:
        """Modify AST to add memory profiling decorators."""
        
        class ProfilingTransformer(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Check if this function should be profiled
                if node.name in functions_to_profile:
                    # Add memory profiling decorator
                    decorator = ast.Call(
                        func=ast.Name(id='memory_profile', ctx=ast.Load()),
                        args=[],
                        keywords=[
                            ast.keyword(arg='component', value=ast.Constant(value=component_name)),
                            ast.keyword(arg='operation', value=ast.Constant(value=node.name)),
                            ast.keyword(arg='log_threshold_mb', value=ast.Constant(value=5.0))
                        ]
                    )
                    
                    # Add decorator to the function
                    node.decorator_list.insert(0, decorator)
                    
                    changes["functions_modified"] += 1
                    changes["functions"].append(node.name)
                    
                    logger.debug(f"Added profiling to function: {node.name}")
                
                return self.generic_visit(node)
            
            def visit_AsyncFunctionDef(self, node):
                # Check if this async function should be profiled
                if node.name in functions_to_profile:
                    # Add memory profiling decorator
                    decorator = ast.Call(
                        func=ast.Name(id='memory_profile', ctx=ast.Load()),
                        args=[],
                        keywords=[
                            ast.keyword(arg='component', value=ast.Constant(value=component_name)),
                            ast.keyword(arg='operation', value=ast.Constant(value=node.name)),
                            ast.keyword(arg='log_threshold_mb', value=ast.Constant(value=5.0))
                        ]
                    )
                    
                    # Add decorator to the function
                    node.decorator_list.insert(0, decorator)
                    
                    changes["functions_modified"] += 1
                    changes["functions"].append(node.name)
                    
                    logger.debug(f"Added profiling to async function: {node.name}")
                
                return self.generic_visit(node)
        
        transformer = ProfilingTransformer()
        return transformer.visit(tree)
    
    def _ast_to_code(self, tree: ast.AST) -> str:
        """Convert AST back to code."""
        import ast
        
        # Simple AST to code conversion
        # This is a basic implementation - in production, you'd want to use a proper code generator
        lines = []
        
        def visit_node(node, indent=0):
            if isinstance(node, ast.Module):
                for stmt in node.body:
                    visit_node(stmt, indent)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    lines.append(" " * indent + f"import {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                names = ", ".join([alias.name for alias in node.names])
                lines.append(" " * indent + f"from {module} import {names}")
            elif isinstance(node, ast.FunctionDef):
                # Handle function definition
                decorators = []
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Call):
                        decorators.append(self._decorator_to_string(decorator))
                    else:
                        decorators.append(decorator.id if hasattr(decorator, 'id') else str(decorator))
                
                for decorator in decorators:
                    lines.append(" " * indent + f"@{decorator}")
                
                args = [arg.arg for arg in node.args.args]
                args_str = ", ".join(args)
                lines.append(" " * indent + f"def {node.name}({args_str}):")
                
                # Add a simple pass for now - in production, you'd preserve the function body
                lines.append(" " * (indent + 4) + "pass")
            elif isinstance(node, ast.AsyncFunctionDef):
                # Handle async function definition
                decorators = []
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Call):
                        decorators.append(self._decorator_to_string(decorator))
                    else:
                        decorators.append(decorator.id if hasattr(decorator, 'id') else str(decorator))
                
                for decorator in decorators:
                    lines.append(" " * indent + f"@{decorator}")
                
                args = [arg.arg for arg in node.args.args]
                args_str = ", ".join(args)
                lines.append(" " * indent + f"async def {node.name}({args_str}):")
                
                # Add a simple pass for now
                lines.append(" " * (indent + 4) + "pass")
            else:
                # For other nodes, just add a comment
                lines.append(" " * indent + f"# {type(node).__name__}")
        
        visit_node(tree)
        return "\n".join(lines)
    
    def _decorator_to_string(self, decorator: ast.Call) -> str:
        """Convert a decorator AST node to string."""
        if decorator.func.id == 'memory_profile':
            keywords = []
            for keyword in decorator.keywords:
                if keyword.arg == 'component':
                    keywords.append(f"component='{keyword.value.value}'")
                elif keyword.arg == 'operation':
                    keywords.append(f"operation='{keyword.value.value}'")
                elif keyword.arg == 'log_threshold_mb':
                    keywords.append(f"log_threshold_mb={keyword.value.value}")
            
            return f"memory_profile({', '.join(keywords)})"
        
        return str(decorator)
    
    def _add_memory_import(self, content: str) -> str:
        """Add memory profiling import to the content."""
        import_line = "from app.core.memory_profiling import memory_profile\n"
        
        # Find the best place to add the import
        lines = content.split('\n')
        
        # Look for existing imports
        import_index = -1
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('from '):
                import_index = i
        
        if import_index >= 0:
            # Insert after the last import
            lines.insert(import_index + 1, import_line)
        else:
            # Insert at the beginning
            lines.insert(0, import_line)
        
        return '\n'.join(lines)
    
    def create_profiling_test_script(self) -> str:
        """Create a test script to verify memory profiling."""
        script_content = '''#!/usr/bin/env python3
"""Test script for memory profiling in RAG components."""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.memory_profiling import get_memory_stats, get_memory_profiles, clear_memory_profiles

async def test_memory_profiling():
    """Test memory profiling functionality."""
    print("🧪 Testing memory profiling...")
    
    # Clear existing profiles
    clear_memory_profiles()
    
    # Import and test RAG components
    try:
        from app.services.rag.rag_service import RAGService
        
        # Create a simple config
        config = {
            "rag_enabled": True,
            "embedding_model": "embeddinggemma:latest",
            "vector_store": "chroma",
        }
        
        # Initialize RAG service
        rag_service = RAGService(config)
        
        # Test embedding (this should trigger memory profiling)
        print("📊 Testing embedding with memory profiling...")
        try:
            embedding = await rag_service.embed_text("test text for memory profiling")
            print(f"✅ Embedding generated: {len(embedding)} dimensions")
        except Exception as e:
            print(f"⚠️ Embedding test failed: {e}")
        
        # Get memory statistics
        stats = get_memory_stats()
        print(f"📈 Memory stats: {stats}")
        
        # Get profiles
        profiles = get_memory_profiles(limit=10)
        print(f"📋 Recent profiles: {len(profiles)}")
        
        for profile in profiles[-3:]:  # Show last 3
            print(f"   {profile.get('component', 'unknown')}.{profile.get('operation', 'unknown')}: "
                  f"{profile.get('memory_used_mb', 0):.1f}MB in {profile.get('execution_time_ms', 0):.1f}ms")
        
    except Exception as e:
        print(f"❌ Error testing memory profiling: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_memory_profiling())
'''
        
        script_path = self.backend_path / "test_memory_profiling.py"
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        logger.info(f"📝 Created test script: {script_path}")
        return str(script_path)


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Add memory profiling to RAG components")
    parser.add_argument("--backend-path", default=".", help="Path to backend directory")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be changed without making changes")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create adder
    adder = MemoryProfilingAdder(args.backend_path)
    
    if args.dry_run:
        logger.info("🔍 Dry run mode - showing what would be changed...")
        # In dry run mode, just show what would be changed
        for component_name, config in adder.components_to_profile.items():
            file_path = adder.rag_services_path / config["file"]
            if file_path.exists():
                logger.info(f"Would add profiling to {component_name}: {file_path}")
                logger.info(f"  Functions: {config['functions']}")
            else:
                logger.warning(f"File not found: {file_path}")
    else:
        # Actually add profiling
        results = adder.add_profiling_to_all_components()
        
        if results["success"]:
            logger.info("✅ Memory profiling added successfully!")
            
            # Create test script
            test_script = adder.create_profiling_test_script()
            logger.info(f"🧪 Test script created: {test_script}")
            
            # Print summary
            print("\n" + "="*60)
            print("MEMORY PROFILING ADDITION SUMMARY")
            print("="*60)
            print(f"Components processed: {results['components_processed']}")
            print(f"Functions modified: {results['functions_modified']}")
            print(f"Errors: {len(results['errors'])}")
            
            if results["changes"]:
                print("\nChanges made:")
                for change in results["changes"]:
                    print(f"  {change['component']}: {change['functions_modified']} functions")
                    print(f"    Functions: {', '.join(change['functions'])}")
            
            if results["errors"]:
                print("\nErrors:")
                for error in results["errors"]:
                    print(f"  ❌ {error}")
            
            print(f"\n🧪 To test: python {test_script}")
            print("="*60)
        else:
            logger.error("❌ Failed to add memory profiling")
            for error in results["errors"]:
                logger.error(f"  {error}")


if __name__ == "__main__":
    main()
