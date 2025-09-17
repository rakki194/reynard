"""
ASTCodeChunker: Tree-sitter based AST chunking for semantic code boundaries.

Responsibilities:
- Parse code using tree-sitter for multiple languages
- Extract semantic units (functions, classes, modules) as chunk boundaries
- Generate symbol maps for functions, classes, and imports
- Fallback to regex-based chunking when AST parsing fails
- Support for Python, TypeScript, JavaScript, Java, C++
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("uvicorn")

# Optional imports for tree-sitter
try:
    import tree_sitter
    from tree_sitter import Language, Parser
    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False
    tree_sitter = None
    Language = None
    Parser = None


class ASTCodeChunker:
    """AST-aware code chunking using tree-sitter for semantic boundaries."""

    def __init__(self) -> None:
        self.parsers: Dict[str, Any] = {}
        self._initialized = False
        self._initialize_parsers()

    def _initialize_parsers(self) -> None:
        """Initialize tree-sitter parsers for supported languages."""
        if not TREE_SITTER_AVAILABLE:
            logger.warning("tree-sitter not available, falling back to regex-based chunking")
            return

        languages = {
            'python': 'tree-sitter-python',
            'typescript': 'tree-sitter-typescript',
            'javascript': 'tree-sitter-javascript',
            'java': 'tree-sitter-java',
            'cpp': 'tree-sitter-cpp'
        }

        for lang, lib in languages.items():
            try:
                # Try to load the language library
                # In production, these would be pre-built and available
                self.parsers[lang] = None  # Placeholder for now
                logger.info(f"Tree-sitter parser for {lang} would be initialized")
            except Exception as e:
                logger.warning(f"Failed to load {lang} parser: {e}")

        self._initialized = True

    def chunk_code_ast_aware(self, code: str, language: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Chunk code using AST boundaries for semantic coherence."""
        if not self._initialized or language not in self.parsers or self.parsers[language] is None:
            return self._fallback_chunking(code, language)

        try:
            # For now, use fallback since we don't have actual tree-sitter libraries
            # In production, this would use actual AST parsing
            return self._fallback_chunking(code, language)
        except Exception as e:
            logger.warning(f"AST parsing failed for {language}: {e}, using fallback")
            return self._fallback_chunking(code, language)

    def _chunk_python_ast(self, tree: Any, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Chunk Python code by functions, classes, and imports."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        def traverse_node(node: Any, depth: int = 0) -> None:
            if node.type == 'function_definition':
                func_name = self._extract_function_name(node, code)
                start_line = node.start_point[0] + 1
                end_line = node.end_point[0] + 1

                chunk_text = '\n'.join(lines[start_line-1:end_line])
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'type': 'function',
                        'name': func_name,
                        'start_line': start_line,
                        'end_line': end_line,
                        'language': 'python'
                    },
                    'tokens': self._estimate_tokens(chunk_text)
                })

                symbol_map[func_name] = {
                    'type': 'function',
                    'line': start_line,
                    'chunk_index': len(chunks) - 1
                }

            elif node.type == 'class_definition':
                class_name = self._extract_class_name(node, code)
                start_line = node.start_point[0] + 1
                end_line = node.end_point[0] + 1

                chunk_text = '\n'.join(lines[start_line-1:end_line])
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'type': 'class',
                        'name': class_name,
                        'start_line': start_line,
                        'end_line': end_line,
                        'language': 'python'
                    },
                    'tokens': self._estimate_tokens(chunk_text)
                })

                symbol_map[class_name] = {
                    'type': 'class',
                    'line': start_line,
                    'chunk_index': len(chunks) - 1
                }

            # Recursively traverse children
            for child in node.children:
                traverse_node(child, depth + 1)

        # This would be called with actual tree.root_node in production
        # traverse_node(tree.root_node)
        return chunks, symbol_map

    def _chunk_js_ast(self, tree: Any, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Chunk JavaScript/TypeScript by functions, classes, and modules."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        def traverse_node(node: Any, depth: int = 0) -> None:
            if node.type in ['function_declaration', 'function_expression', 'arrow_function']:
                func_name = self._extract_js_function_name(node, code)
                start_line = node.start_point[0] + 1
                end_line = node.end_point[0] + 1

                chunk_text = '\n'.join(lines[start_line-1:end_line])
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'type': 'function',
                        'name': func_name,
                        'start_line': start_line,
                        'end_line': end_line,
                        'language': 'javascript'
                    },
                    'tokens': self._estimate_tokens(chunk_text)
                })

                symbol_map[func_name] = {
                    'type': 'function',
                    'line': start_line,
                    'chunk_index': len(chunks) - 1
                }

            elif node.type == 'class_declaration':
                class_name = self._extract_js_class_name(node, code)
                start_line = node.start_point[0] + 1
                end_line = node.end_point[0] + 1

                chunk_text = '\n'.join(lines[start_line-1:end_line])
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'type': 'class',
                        'name': class_name,
                        'start_line': start_line,
                        'end_line': end_line,
                        'language': 'javascript'
                    },
                    'tokens': self._estimate_tokens(chunk_text)
                })

                symbol_map[class_name] = {
                    'type': 'class',
                    'line': start_line,
                    'chunk_index': len(chunks) - 1
                }

            # Recursively traverse children
            for child in node.children:
                traverse_node(child, depth + 1)

        # This would be called with actual tree.root_node in production
        # traverse_node(tree.root_node)
        return chunks, symbol_map

    def _fallback_chunking(self, code: str, language: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Fallback to regex-based chunking if AST parsing fails."""
        if language == 'python':
            return self._chunk_python_regex(code)
        elif language in ['typescript', 'javascript']:
            return self._chunk_js_regex(code)
        elif language == 'java':
            return self._chunk_java_regex(code)
        elif language == 'cpp':
            return self._chunk_cpp_regex(code)
        else:
            return self._chunk_generic_regex(code)

    def _chunk_python_regex(self, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Python regex-based chunking for functions and classes."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        # Regex patterns for Python
        function_pattern = re.compile(r'^(\s*)def\s+(\w+)\s*\(', re.MULTILINE)
        class_pattern = re.compile(r'^(\s*)class\s+(\w+)\s*\(?', re.MULTILINE)
        import_pattern = re.compile(r'^(import\s+\w+|from\s+\w+\s+import)', re.MULTILINE)

        # Find all matches
        functions = list(function_pattern.finditer(code))
        classes = list(class_pattern.finditer(code))
        imports = list(import_pattern.finditer(code))

        # Process imports first
        for match in imports:
            start_line = code[:match.start()].count('\n') + 1
            end_line = start_line
            chunk_text = lines[start_line - 1]
            
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'import',
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'python'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

        # Process functions
        for match in functions:
            func_name = match.group(2)
            start_line = code[:match.start()].count('\n') + 1
            
            # Find function end (next function, class, or end of file)
            end_line = self._find_function_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'function',
                    'name': func_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'python'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[func_name] = {
                'type': 'function',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        # Process classes
        for match in classes:
            class_name = match.group(2)
            start_line = code[:match.start()].count('\n') + 1
            
            # Find class end
            end_line = self._find_class_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'class',
                    'name': class_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'python'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[class_name] = {
                'type': 'class',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        return chunks, symbol_map

    def _chunk_js_regex(self, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """JavaScript/TypeScript regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        # Regex patterns for JavaScript/TypeScript
        function_pattern = re.compile(r'^(export\s+)?(async\s+)?function\s+(\w+)\s*\(', re.MULTILINE)
        class_pattern = re.compile(r'^(export\s+)?class\s+(\w+)\s*(extends\s+\w+)?\s*{', re.MULTILINE)
        arrow_function_pattern = re.compile(r'^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>', re.MULTILINE)

        # Find all matches
        functions = list(function_pattern.finditer(code))
        classes = list(class_pattern.finditer(code))
        arrow_functions = list(arrow_function_pattern.finditer(code))

        # Process functions
        for match in functions:
            func_name = match.group(3)
            start_line = code[:match.start()].count('\n') + 1
            end_line = self._find_js_function_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'function',
                    'name': func_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'javascript'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[func_name] = {
                'type': 'function',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        # Process classes
        for match in classes:
            class_name = match.group(2)
            start_line = code[:match.start()].count('\n') + 1
            end_line = self._find_js_class_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'class',
                    'name': class_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'javascript'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[class_name] = {
                'type': 'class',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        return chunks, symbol_map

    def _chunk_java_regex(self, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Java regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        # Java patterns
        class_pattern = re.compile(r'^(public\s+|private\s+|protected\s+)?(static\s+)?(final\s+)?class\s+(\w+)', re.MULTILINE)
        method_pattern = re.compile(r'^(public\s+|private\s+|protected\s+)?(static\s+)?(\w+\s+)*(\w+)\s+(\w+)\s*\(', re.MULTILINE)

        # Process classes and methods
        classes = list(class_pattern.finditer(code))
        methods = list(method_pattern.finditer(code))

        for match in classes:
            class_name = match.group(4)
            start_line = code[:match.start()].count('\n') + 1
            end_line = self._find_java_class_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'class',
                    'name': class_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'java'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[class_name] = {
                'type': 'class',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        return chunks, symbol_map

    def _chunk_cpp_regex(self, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """C++ regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        # C++ patterns
        class_pattern = re.compile(r'^(class|struct)\s+(\w+)', re.MULTILINE)
        function_pattern = re.compile(r'^(\w+\s+)*(\w+)\s+(\w+)\s*\([^)]*\)\s*{', re.MULTILINE)

        classes = list(class_pattern.finditer(code))
        functions = list(function_pattern.finditer(code))

        for match in classes:
            class_name = match.group(2)
            start_line = code[:match.start()].count('\n') + 1
            end_line = self._find_cpp_class_end(code, match.start(), lines)
            
            chunk_text = '\n'.join(lines[start_line-1:end_line])
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'class',
                    'name': class_name,
                    'start_line': start_line,
                    'end_line': end_line,
                    'language': 'cpp'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

            symbol_map[class_name] = {
                'type': 'class',
                'line': start_line,
                'chunk_index': len(chunks) - 1
            }

        return chunks, symbol_map

    def _chunk_generic_regex(self, code: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Generic regex-based chunking for unsupported languages."""
        chunks = []
        symbol_map = {}
        lines = code.split('\n')

        # Simple line-based chunking
        chunk_size = 50  # lines per chunk
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i:i + chunk_size]
            chunk_text = '\n'.join(chunk_lines)
            
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'generic',
                    'start_line': i + 1,
                    'end_line': min(i + chunk_size, len(lines)),
                    'language': 'generic'
                },
                'tokens': self._estimate_tokens(chunk_text)
            })

        return chunks, symbol_map

    def _find_function_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Python function."""
        # Simple implementation - find next function, class, or end of file
        current_line = code[:start_pos].count('\n') + 1
        
        for i in range(current_line, len(lines)):
            line = lines[i].strip()
            if line.startswith('def ') or line.startswith('class ') or line.startswith('@'):
                return i
            if i == len(lines) - 1:
                return i + 1
        
        return len(lines)

    def _find_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Python class."""
        current_line = code[:start_pos].count('\n') + 1
        
        for i in range(current_line, len(lines)):
            line = lines[i].strip()
            if line.startswith('class ') and i > current_line:
                return i
            if i == len(lines) - 1:
                return i + 1
        
        return len(lines)

    def _find_js_function_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a JavaScript function."""
        # Simple implementation
        current_line = code[:start_pos].count('\n') + 1
        return min(current_line + 20, len(lines))  # Assume 20 lines max

    def _find_js_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a JavaScript class."""
        current_line = code[:start_pos].count('\n') + 1
        return min(current_line + 50, len(lines))  # Assume 50 lines max

    def _find_java_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Java class."""
        current_line = code[:start_pos].count('\n') + 1
        return min(current_line + 100, len(lines))  # Assume 100 lines max

    def _find_cpp_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a C++ class."""
        current_line = code[:start_pos].count('\n') + 1
        return min(current_line + 100, len(lines))  # Assume 100 lines max

    def _extract_function_name(self, node: Any, code: str) -> str:
        """Extract function name from AST node."""
        # Placeholder implementation
        return "function"

    def _extract_class_name(self, node: Any, code: str) -> str:
        """Extract class name from AST node."""
        # Placeholder implementation
        return "class"

    def _extract_js_function_name(self, node: Any, code: str) -> str:
        """Extract JavaScript function name from AST node."""
        # Placeholder implementation
        return "js_function"

    def _extract_js_class_name(self, node: Any, code: str) -> str:
        """Extract JavaScript class name from AST node."""
        # Placeholder implementation
        return "js_class"

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text."""
        return len(text.split()) * 1.3  # Rough estimation

    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages."""
        return list(self.parsers.keys()) if self._initialized else []

    def is_language_supported(self, language: str) -> bool:
        """Check if language is supported."""
        return language in self.parsers and self.parsers[language] is not None

    def get_chunker_stats(self) -> Dict[str, Any]:
        """Get chunker statistics."""
        return {
            "tree_sitter_available": TREE_SITTER_AVAILABLE,
            "initialized": self._initialized,
            "supported_languages": self.get_supported_languages(),
            "parsers_loaded": len([p for p in self.parsers.values() if p is not None])
        }
