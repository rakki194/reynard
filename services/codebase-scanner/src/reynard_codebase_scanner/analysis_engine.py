"""
Codebase Analysis Engine

Comprehensive codebase analysis engine with multi-language support,
dependency analysis, and advanced metrics collection.
"""

import ast
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

try:
    import tree_sitter
    from tree_sitter import Language, Parser

    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False
    Language = None  # type: ignore
    Parser = None  # type: ignore

try:
    import git

    GIT_AVAILABLE = True
except ImportError:
    GIT_AVAILABLE = False

logger = logging.getLogger(__name__)


class CodebaseAnalysisEngine:
    """Comprehensive codebase analysis engine with multi-language support."""

    def __init__(self, root_path: str) -> None:
        """Initialize the analysis engine."""
        self.root_path = Path(root_path).resolve()
        self.tree_sitter_available = TREE_SITTER_AVAILABLE
        self.git_available = GIT_AVAILABLE

        # Language parsers
        self.parsers: Dict[str, Parser] = {}
        self._setup_parsers()

        # Analysis results cache
        self._cache: Dict[str, Any] = {}

        # Supported file extensions
        self.supported_extensions = {
            '.py': 'python',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.toml': 'toml',
            '.cfg': 'ini',
            '.ini': 'ini',
        }

    def _setup_parsers(self) -> None:
        """Setup Tree-sitter parsers for supported languages."""
        if not self.tree_sitter_available:
            logger.warning(
                "Tree-sitter not available. Install with: pip install tree-sitter"
            )
            return

        try:
            # Python parser
            try:
                from tree_sitter_python import language as python_language

                python_parser = Parser()
                python_parser.set_language(python_language())
                self.parsers['python'] = python_parser
            except ImportError:
                logger.warning("tree-sitter-python not available")
            except Exception as e:
                logger.warning(f"Error setting up Python parser: {e}")

            # TypeScript parser
            try:
                from tree_sitter_typescript import (
                    language_typescript as typescript_language,
                )

                typescript_parser = Parser()
                typescript_parser.set_language(typescript_language())
                self.parsers['typescript'] = typescript_parser
            except ImportError:
                logger.warning("tree-sitter-typescript not available")
            except Exception as e:
                logger.warning(f"Error setting up TypeScript parser: {e}")

            # JavaScript parser
            try:
                from tree_sitter_javascript import language as javascript_language

                javascript_parser = Parser()
                javascript_parser.set_language(javascript_language())
                self.parsers['javascript'] = javascript_parser
            except ImportError:
                logger.warning("tree-sitter-javascript not available")
            except Exception as e:
                logger.warning(f"Error setting up JavaScript parser: {e}")

            # JSON parser
            try:
                from tree_sitter_json import language as json_language

                json_parser = Parser()
                json_parser.set_language(json_language())
                self.parsers['json'] = json_parser
            except ImportError:
                logger.warning("tree-sitter-json not available")
            except Exception as e:
                logger.warning(f"Error setting up JSON parser: {e}")

        except Exception as e:
            logger.error(f"Error setting up parsers: {e}")

    def discover_files(
        self,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
        max_depth: Optional[int] = None,
    ) -> List[Path]:
        """
        Discover files in the codebase.

        Args:
            include_patterns: List of glob patterns to include
            exclude_patterns: List of glob patterns to exclude
            max_depth: Maximum directory depth to search

        Returns:
            List of discovered file paths
        """
        files = []

        # Default exclude patterns
        default_exclude = {
            '**/__pycache__/**',
            '**/node_modules/**',
            '**/.git/**',
            '**/venv/**',
            '**/env/**',
            '**/.venv/**',
            '**/dist/**',
            '**/build/**',
            '**/.pytest_cache/**',
            '**/coverage/**',
            '**/.coverage/**',
            '**/htmlcov/**',
            '**/.mypy_cache/**',
            '**/.ruff_cache/**',
        }

        if exclude_patterns:
            exclude_patterns.extend(default_exclude)
        else:
            exclude_patterns = list(default_exclude)

        # Walk through directory tree
        for root, dirs, filenames in os.walk(self.root_path):
            # Check depth limit
            if max_depth is not None:
                depth = len(Path(root).relative_to(self.root_path).parts)
                if depth > max_depth:
                    continue

            # Filter directories
            dirs[:] = [
                d
                for d in dirs
                if not any(Path(root, d).match(pattern) for pattern in exclude_patterns)
            ]

            # Process files
            for filename in filenames:
                file_path = Path(root, filename)
                relative_path = file_path.relative_to(self.root_path)

                # Check exclude patterns
                if any(relative_path.match(pattern) for pattern in exclude_patterns):
                    continue

                # Check include patterns
                if include_patterns:
                    if not any(
                        relative_path.match(pattern) for pattern in include_patterns
                    ):
                        continue

                files.append(file_path)

        return sorted(files)

    def analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Analyze a single file.

        Args:
            file_path: Path to the file to analyze

        Returns:
            Dictionary with analysis results
        """
        try:
            # Get file extension and language
            extension = file_path.suffix.lower()
            language = self.supported_extensions.get(extension, 'unknown')

            # Read file content
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                # Try with different encoding
                with open(file_path, 'r', encoding='latin-1') as f:
                    content = f.read()

            # Basic file metrics
            lines = content.splitlines()
            analysis = {
                'file_path': str(file_path.relative_to(self.root_path)),
                'absolute_path': str(file_path),
                'language': language,
                'extension': extension,
                'size_bytes': file_path.stat().st_size,
                'line_count': len(lines),
                'character_count': len(content),
                'non_empty_lines': len([line for line in lines if line.strip()]),
                'empty_lines': len([line for line in lines if not line.strip()]),
                'function_count': 0,
                'class_count': 0,
                'import_count': 0,
            }

            # Language-specific analysis
            if language == 'python':
                analysis.update(self._analyze_python_file(content, file_path))
            elif language in ['typescript', 'javascript']:
                analysis.update(self._analyze_js_file(content, file_path, language))
            elif language == 'json':
                analysis.update(self._analyze_json_file(content, file_path))
            elif language == 'yaml':
                analysis.update(self._analyze_yaml_file(content, file_path))
            elif language == 'markdown':
                analysis.update(self._analyze_markdown_file(content, file_path))

            return analysis

        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {e}")
            return {
                'file_path': str(file_path.relative_to(self.root_path)),
                'absolute_path': str(file_path),
                'error': str(e),
                'language': 'unknown',
            }

    def _analyze_python_file(self, content: str, file_path: Path) -> Dict[str, Any]:
        """Analyze Python file using AST."""
        analysis = {}

        try:
            # Parse AST
            tree = ast.parse(content, filename=str(file_path))

            # Count different node types
            node_counts = {}
            imports = []
            functions = []
            classes = []
            decorators = []

            for node in ast.walk(tree):
                node_type = type(node).__name__
                node_counts[node_type] = node_counts.get(node_type, 0) + 1

                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ''
                    for alias in node.names:
                        imports.append(f"{module}.{alias.name}")
                elif isinstance(node, ast.FunctionDef):
                    functions.append(
                        {
                            'name': node.name,
                            'line': node.lineno,
                            'args': len(node.args.args),
                            'decorators': [
                                d.id if hasattr(d, 'id') else str(d)
                                for d in node.decorator_list
                            ],
                        }
                    )
                elif isinstance(node, ast.ClassDef):
                    classes.append(
                        {
                            'name': node.name,
                            'line': node.lineno,
                            'bases': [
                                base.id if hasattr(base, 'id') else str(base)
                                for base in node.bases
                            ],
                            'methods': len(
                                [n for n in node.body if isinstance(n, ast.FunctionDef)]
                            ),
                        }
                    )
                elif isinstance(node, ast.Decorator):
                    decorators.append(str(node))

            analysis.update(
                {
                    'ast_node_counts': node_counts,
                    'imports': imports,
                    'functions': functions,
                    'classes': classes,
                    'decorators': decorators,
                    'function_count': len(functions),
                    'class_count': len(classes),
                    'import_count': len(imports),
                }
            )

        except SyntaxError as e:
            analysis['syntax_error'] = {
                'message': str(e),
                'line': e.lineno,
                'column': e.offset,
            }
        except Exception as e:
            analysis['parse_error'] = str(e)

        return analysis

    def _analyze_js_file(
        self, content: str, file_path: Path, language: str
    ) -> Dict[str, Any]:
        """Analyze JavaScript/TypeScript file."""
        analysis = {}

        if language in self.parsers:
            try:
                parser = self.parsers[language]
                tree = parser.parse(bytes(content, 'utf8'))

                # Basic AST analysis
                functions = []
                classes = []
                imports = []

                def traverse_node(node, depth=0):
                    if depth > 20:  # Prevent infinite recursion
                        return

                    if hasattr(node, 'type'):
                        if node.type == 'function_declaration':
                            functions.append(
                                {
                                    'name': (
                                        node.child_by_field_name('name').text.decode(
                                            'utf8'
                                        )
                                        if node.child_by_field_name('name')
                                        else 'anonymous'
                                    ),
                                    'line': node.start_point[0] + 1,
                                }
                            )
                        elif node.type == 'class_declaration':
                            classes.append(
                                {
                                    'name': (
                                        node.child_by_field_name('name').text.decode(
                                            'utf8'
                                        )
                                        if node.child_by_field_name('name')
                                        else 'anonymous'
                                    ),
                                    'line': node.start_point[0] + 1,
                                }
                            )
                        elif node.type in ['import_statement', 'import_declaration']:
                            imports.append(node.text.decode('utf8'))

                    for child in node.children:
                        traverse_node(child, depth + 1)

                traverse_node(tree.root_node)

                analysis.update(
                    {
                        'functions': functions,
                        'classes': classes,
                        'imports': imports,
                        'function_count': len(functions),
                        'class_count': len(classes),
                        'import_count': len(imports),
                    }
                )

            except Exception as e:
                analysis['parse_error'] = str(e)

        return analysis

    def _analyze_json_file(self, content: str, file_path: Path) -> Dict[str, Any]:
        """Analyze JSON file."""
        analysis = {}

        try:
            data = json.loads(content)
            analysis.update(
                {
                    'json_valid': True,
                    'json_type': type(data).__name__,
                    'json_size': len(str(data)),
                }
            )

            if isinstance(data, dict):
                analysis['json_keys'] = list(data.keys())
                analysis['json_key_count'] = len(data.keys())
            elif isinstance(data, list):
                analysis['json_length'] = len(data)

        except json.JSONDecodeError as e:
            analysis.update(
                {
                    'json_valid': False,
                    'json_error': str(e),
                }
            )

        return analysis

    def _analyze_yaml_file(self, content: str, file_path: Path) -> Dict[str, Any]:
        """Analyze YAML file."""
        analysis = {}

        try:
            import yaml

            data = yaml.safe_load(content)
            analysis.update(
                {
                    'yaml_valid': True,
                    'yaml_type': type(data).__name__ if data is not None else 'null',
                }
            )

            if isinstance(data, dict):
                analysis['yaml_keys'] = list(data.keys())
                analysis['yaml_key_count'] = len(data.keys())
            elif isinstance(data, list):
                analysis['yaml_length'] = len(data)

        except ImportError:
            analysis['yaml_error'] = 'PyYAML not available'
        except yaml.YAMLError as e:
            analysis.update(
                {
                    'yaml_valid': False,
                    'yaml_error': str(e),
                }
            )

        return analysis

    def _analyze_markdown_file(self, content: str, file_path: Path) -> Dict[str, Any]:
        """Analyze Markdown file."""
        analysis = {}

        # Count markdown elements
        headers = re.findall(r'^#{1,6}\s+(.+)$', content, re.MULTILINE)
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content)
        code_blocks = re.findall(r'```(\w+)?\n(.*?)\n```', content, re.DOTALL)

        analysis.update(
            {
                'markdown_headers': headers,
                'markdown_links': links,
                'markdown_images': images,
                'markdown_code_blocks': code_blocks,
                'header_count': len(headers),
                'link_count': len(links),
                'image_count': len(images),
                'code_block_count': len(code_blocks),
            }
        )

        return analysis

    def analyze_dependencies(self, file_paths: List[Path]) -> Dict[str, Any]:
        """
        Analyze dependencies across the codebase.

        Args:
            file_paths: List of file paths to analyze

        Returns:
            Dictionary with dependency analysis
        """
        dependencies = {
            'python': set(),
            'javascript': set(),
            'typescript': set(),
            'files': {},
        }

        for file_path in file_paths:
            analysis = self.analyze_file(file_path)

            if 'imports' in analysis:
                language = analysis.get('language', 'unknown')
                if language in dependencies:
                    dependencies[language].update(analysis['imports'])

                dependencies['files'][str(file_path.relative_to(self.root_path))] = (
                    analysis['imports']
                )

        # Convert sets to lists for JSON serialization
        for lang in ['python', 'javascript', 'typescript']:
            dependencies[lang] = list(dependencies[lang])

        return dependencies

    def get_git_info(self) -> Dict[str, Any]:
        """Get Git repository information."""
        if not self.git_available:
            return {'error': 'Git not available'}

        try:
            repo = git.Repo(self.root_path)

            return {
                'is_git_repo': True,
                'branch': repo.active_branch.name if repo.active_branch else 'detached',
                'commit_count': len(list(repo.iter_commits())),
                'last_commit': {
                    'hash': repo.head.commit.hexsha[:8],
                    'message': repo.head.commit.message.strip(),
                    'author': str(repo.head.commit.author),
                    'date': repo.head.commit.committed_datetime.isoformat(),
                },
                'remote_urls': [remote.url for remote in repo.remotes],
                'untracked_files': len(repo.untracked_files),
                'modified_files': len([item.a_path for item in repo.index.diff(None)]),
            }
        except git.InvalidGitRepositoryError:
            return {'is_git_repo': False}
        except Exception as e:
            return {'error': str(e)}

    def analyze_codebase(
        self,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
        max_depth: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Perform comprehensive codebase analysis.

        Args:
            include_patterns: List of glob patterns to include
            exclude_patterns: List of glob patterns to exclude
            max_depth: Maximum directory depth to search

        Returns:
            Dictionary with comprehensive analysis results
        """
        logger.info(f"Starting codebase analysis for {self.root_path}")

        # Discover files
        files = self.discover_files(include_patterns, exclude_patterns, max_depth)
        logger.info(f"Discovered {len(files)} files")

        # Analyze files
        file_analyses = []
        language_stats = {}
        total_lines = 0
        total_size = 0

        for file_path in files:
            analysis = self.analyze_file(file_path)
            file_analyses.append(analysis)

            # Update language statistics
            language = analysis.get('language', 'unknown')
            if language not in language_stats:
                language_stats[language] = {
                    'file_count': 0,
                    'total_lines': 0,
                    'total_size': 0,
                }

            language_stats[language]['file_count'] += 1
            language_stats[language]['total_lines'] += analysis.get('line_count', 0)
            language_stats[language]['total_size'] += analysis.get('size_bytes', 0)

            total_lines += analysis.get('line_count', 0)
            total_size += analysis.get('size_bytes', 0)

        # Analyze dependencies
        dependencies = self.analyze_dependencies(files)

        # Get Git information
        git_info = self.get_git_info()

        # Compile results
        results = {
            'metadata': {
                'root_path': str(self.root_path),
                'analysis_timestamp': str(Path().cwd()),
                'total_files': len(files),
                'total_lines': total_lines,
                'total_size_bytes': total_size,
                'supported_languages': list(self.supported_extensions.values()),
            },
            'language_statistics': language_stats,
            'file_analyses': file_analyses,
            'dependencies': dependencies,
            'git_info': git_info,
            'tree_sitter_available': self.tree_sitter_available,
            'git_available': self.git_available,
        }

        logger.info(f"Codebase analysis completed. Analyzed {len(files)} files.")
        return results
