#!/usr/bin/env python3
"""
Search Ignore Configuration
==========================

Centralized configuration for ignoring directories and files during search operations.
Provides a unified way to skip dot folders, cache directories, and other junk.
"""

import os
from pathlib import Path
from typing import Set, List, Pattern
import re


class SearchIgnoreConfig:
    """Centralized ignore configuration for search operations."""
    
    # Common ignore patterns for directories
    IGNORE_DIRS: Set[str] = {
        # Python
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".coverage",
        "htmlcov",
        ".tox",
        ".venv",
        "venv",
        "env",
        ".env",
        
        # Node.js
        "node_modules",
        ".npm",
        ".yarn",
        "dist",
        "build",
        ".next",
        ".nuxt",
        ".cache",
        
        # Git and version control
        ".git",
        ".svn",
        ".hg",
        ".bzr",
        
        # IDE and editor files
        ".vscode",
        ".idea",
        ".vs",
        ".sublime-project",
        ".sublime-workspace",
        
        # OS generated files
        ".DS_Store",
        "Thumbs.db",
        ".Spotlight-V100",
        ".Trashes",
        ".fseventsd",
        ".TemporaryItems",
        
        # Build and temporary directories
        "tmp",
        "temp",
        ".tmp",
        ".temp",
        "logs",
        ".logs",
        
        # Documentation build
        "_build",
        ".doctrees",
        "site",
        
        # Jupyter
        ".ipynb_checkpoints",
        
        # Rust
        "target",
        "Cargo.lock",
        
        # Go
        "vendor",
        
        # Java
        ".gradle",
        ".m2",
        "target",
        
        # C/C++
        "Debug",
        "Release",
        ".vs",
        
        # Database
        ".db",
        ".sqlite",
        ".sqlite3",
        
        # Archives and packages
        ".zip",
        ".tar.gz",
        ".rar",
        ".7z",
        
        # Media files (usually not needed for code search)
        ".mp4",
        ".avi",
        ".mov",
        ".mp3",
        ".wav",
        ".flac",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".tiff",
        ".svg",
        ".ico",
        ".webp",
        
        # Large data files
        ".csv",
        ".json",
        ".xml",
        ".yaml",
        ".yml",
        ".toml",
        ".ini",
        ".cfg",
        ".conf",
    }
    
    # Common ignore patterns for files
    IGNORE_FILES: Set[str] = {
        # Python
        "*.pyc",
        "*.pyo",
        "*.pyd",
        "*.so",
        "*.egg",
        "*.egg-info",
        "*.whl",
        "*.tar.gz",
        
        # Node.js
        "package-lock.json",
        "yarn.lock",
        "*.log",
        
        # Git
        ".gitignore",
        ".gitattributes",
        ".gitmodules",
        
        # IDE
        "*.swp",
        "*.swo",
        "*~",
        "*.tmp",
        "*.bak",
        "*.orig",
        
        # OS
        ".DS_Store",
        "Thumbs.db",
        "desktop.ini",
        
        # Build artifacts
        "*.o",
        "*.obj",
        "*.exe",
        "*.dll",
        "*.lib",
        "*.a",
        "*.so",
        "*.dylib",
        
        # Archives
        "*.zip",
        "*.tar",
        "*.tar.gz",
        "*.rar",
        "*.7z",
        
        # Media
        "*.mp4",
        "*.avi",
        "*.mov",
        "*.mp3",
        "*.wav",
        "*.flac",
        "*.jpg",
        "*.jpeg",
        "*.png",
        "*.gif",
        "*.bmp",
        "*.tiff",
        "*.svg",
        "*.ico",
        "*.webp",
        
        # Large data files
        "*.csv",
        "*.json",
        "*.xml",
        "*.yaml",
        "*.yml",
        "*.toml",
        "*.ini",
        "*.cfg",
        "*.conf",
    }
    
    # Compiled regex patterns for efficient matching
    _ignore_dir_patterns: List[Pattern[str]] = None
    _ignore_file_patterns: List[Pattern[str]] = None
    
    @classmethod
    def _compile_patterns(cls) -> None:
        """Compile ignore patterns into regex for efficient matching."""
        if cls._ignore_dir_patterns is None:
            cls._ignore_dir_patterns = [
                re.compile(pattern.replace("*", ".*") + "$")
                for pattern in cls.IGNORE_DIRS
                if "*" in pattern
            ]
        
        if cls._ignore_file_patterns is None:
            cls._ignore_file_patterns = [
                re.compile(pattern.replace("*", ".*") + "$")
                for pattern in cls.IGNORE_FILES
                if "*" in pattern
            ]
    
    @classmethod
    def should_ignore_dir(cls, dir_name: str) -> bool:
        """
        Check if a directory should be ignored.
        
        Args:
            dir_name: Name of the directory to check
            
        Returns:
            True if the directory should be ignored
        """
        cls._compile_patterns()
        
        # Check exact matches first (faster)
        if dir_name in cls.IGNORE_DIRS:
            return True
        
        # Check pattern matches
        for pattern in cls._ignore_dir_patterns:
            if pattern.match(dir_name):
                return True
        
        # Check if it's a hidden directory (starts with .)
        if dir_name.startswith('.') and dir_name not in {'.', '..'}:
            return True
        
        return False
    
    @classmethod
    def should_ignore_file(cls, file_name: str) -> bool:
        """
        Check if a file should be ignored.
        
        Args:
            file_name: Name of the file to check
            
        Returns:
            True if the file should be ignored
        """
        cls._compile_patterns()
        
        # Check exact matches first (faster)
        if file_name in cls.IGNORE_FILES:
            return True
        
        # Check pattern matches
        for pattern in cls._ignore_file_patterns:
            if pattern.match(file_name):
                return True
        
        # Check if it's a hidden file (starts with .)
        if file_name.startswith('.') and file_name not in {'.', '..'}:
            return True
        
        return False
    
    @classmethod
    def should_ignore_path(cls, path: Path) -> bool:
        """
        Check if a path should be ignored.
        
        Args:
            path: Path to check
            
        Returns:
            True if the path should be ignored
        """
        # Check if any part of the path should be ignored
        for part in path.parts:
            if cls.should_ignore_dir(part):
                return True
        
        # Check the file name if it's a file
        if path.is_file():
            return cls.should_ignore_file(path.name)
        
        return False
    
    @classmethod
    def filter_paths(cls, paths: List[Path]) -> List[Path]:
        """
        Filter a list of paths to remove ignored ones.
        
        Args:
            paths: List of paths to filter
            
        Returns:
            Filtered list of paths
        """
        return [path for path in paths if not cls.should_ignore_path(path)]
    
    @classmethod
    def get_ignore_stats(cls) -> dict:
        """
        Get statistics about ignore patterns.
        
        Returns:
            Dictionary with ignore pattern statistics
        """
        cls._compile_patterns()
        
        return {
            "ignore_dirs": len(cls.IGNORE_DIRS),
            "ignore_files": len(cls.IGNORE_FILES),
            "ignore_dir_patterns": len(cls._ignore_dir_patterns),
            "ignore_file_patterns": len(cls._ignore_file_patterns),
            "total_patterns": len(cls.IGNORE_DIRS) + len(cls.IGNORE_FILES),
        }


# Convenience functions for easy import
def should_ignore_dir(dir_name: str) -> bool:
    """Check if a directory should be ignored."""
    return SearchIgnoreConfig.should_ignore_dir(dir_name)


def should_ignore_file(file_name: str) -> bool:
    """Check if a file should be ignored."""
    return SearchIgnoreConfig.should_ignore_file(file_name)


def should_ignore_path(path: Path) -> bool:
    """Check if a path should be ignored."""
    return SearchIgnoreConfig.should_ignore_path(path)


def filter_paths(paths: List[Path]) -> List[Path]:
    """Filter a list of paths to remove ignored ones."""
    return SearchIgnoreConfig.filter_paths(paths)

