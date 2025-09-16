#!/usr/bin/env python3
"""
Modern Typing Update Script
===========================

Updates old-style typing annotations to modern Python 3.9+ syntax.
"""

import ast
import logging
import re
from pathlib import Path
from typing import Dict, List

logger = logging.getLogger(__name__)


class TypingModernizer:
    """Modernizes typing annotations in Python files."""
    
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir)
        self.updates_made = 0
        
    def modernize_all(self) -> int:
        """Modernize all Python files in the directory."""
        logger.info("🔧 Modernizing typing annotations...")
        
        python_files = list(self.root_dir.rglob("*.py"))
        logger.info(f"Found {len(python_files)} Python files to modernize")
        
        for file_path in python_files:
            if self._should_skip_file(file_path):
                continue
                
            self._modernize_file(file_path)
            
        logger.info(f"✅ Modernized {self.updates_made} files")
        return self.updates_made
    
    def _should_skip_file(self, file_path: Path) -> bool:
        """Skip certain files that shouldn't be modernized."""
        skip_patterns = [
            "__pycache__",
            ".git",
            "node_modules",
            ".venv",
            "venv",
            "build",
            "dist",
            "cleanup_deprecated.py",  # Skip our own script
            "modernize_typing.py"     # Skip our own script
        ]
        
        return any(pattern in str(file_path) for pattern in skip_patterns)
    
    def _modernize_file(self, file_path: Path) -> None:
        """Modernize typing annotations in a single file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Apply modernizations
            content = self._update_typing_imports(content)
            content = self._replace_old_typing(content)
            
            # Only write if changes were made
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.updates_made += 1
                logger.info(f"✅ Updated {file_path}")
                
        except Exception as e:
            logger.warning(f"Could not modernize {file_path}: {e}")
    
    def _update_typing_imports(self, content: str) -> str:
        """Update typing imports to remove unnecessary imports."""
        # Remove Union, Optional, List, Dict from typing imports if they're the only ones
        patterns = [
            (r'from typing import Union\n', ''),
            (r'from typing import Optional\n', ''),
            (r'from typing import List\n', ''),
            (r'from typing import Dict\n', ''),
            (r'from typing import Tuple\n', ''),
            (r'from typing import Set\n', ''),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
            
        return content
    
    def _replace_old_typing(self, content: str) -> str:
        """Replace old-style typing annotations with modern ones."""
        # Replace typing annotations
        replacements = [
            # Union types
            (r'Union\[([^,]+),\s*None\]', r'\1 | None'),
            (r'Union\[([^,]+),\s*([^,]+)\]', r'\1 | \2'),
            (r'Union\[([^,]+),\s*([^,]+),\s*([^,]+)\]', r'\1 | \2 | \3'),
            
            # Optional types
            (r'Optional\[([^\]]+)\]', r'\1 | None'),
            
            # List types
            (r'List\[([^\]]+)\]', r'list[\1]'),
            
            # Dict types
            (r'Dict\[([^\]]+)\]', r'dict[\1]'),
            
            # Tuple types
            (r'Tuple\[([^\]]+)\]', r'tuple[\1]'),
            
            # Set types
            (r'Set\[([^\]]+)\]', r'set[\1]'),
        ]
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
            
        return content


def main():
    """Main function to run the typing modernizer."""
    logging.basicConfig(level=logging.INFO)
    
    modernizer = TypingModernizer(".")
    updates = modernizer.modernize_all()
    
    if updates > 0:
        print(f"🎉 Successfully modernized {updates} files!")
        print(f"🔧 Updated typing annotations to Python 3.9+ syntax")
        print(f"📝 Next steps:")
        print(f"   1. Run tests to ensure nothing breaks")
        print(f"   2. Run the deprecation scanner again to verify fixes")
        return 0
    else:
        print(f"✅ No files needed modernization - already up to date!")
        return 0


if __name__ == "__main__":
    exit(main())
