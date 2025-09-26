"""Advanced Code Tokenization Module
================================

Provides intelligent tokenization for programming languages with:
- Tree-sitter AST-based parsing
- CamelCase and snake_case splitting
- Programming language pattern recognition
- Fallback regex-based tokenization
"""

import logging
import re
from pathlib import Path
from typing import Any

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

logger = logging.getLogger(__name__)


class CodeTokenizer:
    """Advanced tokenizer for programming languages with Tree-sitter support."""

    def __init__(self):
        self.parsers: dict[str, Any] = {}
        self.languages: dict[str, Any] = {}
        self._initialized = False
        self._initialize_parsers()

    def _initialize_parsers(self) -> None:
        """Initialize Tree-sitter parsers for supported languages."""
        if not TREE_SITTER_AVAILABLE:
            logger.warning("Tree-sitter not available, using regex-based tokenization")
            return

        # Language configurations
        language_configs = {
            "python": {
                "library": "tree-sitter-python",
                "file_extensions": [".py"],
                "keywords": [
                    "def",
                    "class",
                    "import",
                    "from",
                    "if",
                    "else",
                    "for",
                    "while",
                    "try",
                    "except",
                ],
            },
            "typescript": {
                "library": "tree-sitter-typescript",
                "file_extensions": [".ts", ".tsx"],
                "keywords": [
                    "function",
                    "class",
                    "interface",
                    "type",
                    "import",
                    "export",
                    "const",
                    "let",
                    "var",
                ],
            },
            "javascript": {
                "library": "tree-sitter-javascript",
                "file_extensions": [".js", ".jsx"],
                "keywords": [
                    "function",
                    "class",
                    "import",
                    "export",
                    "const",
                    "let",
                    "var",
                    "async",
                    "await",
                ],
            },
            "java": {
                "library": "tree-sitter-java",
                "file_extensions": [".java"],
                "keywords": [
                    "public",
                    "private",
                    "protected",
                    "class",
                    "interface",
                    "method",
                    "static",
                    "final",
                ],
            },
            "cpp": {
                "library": "tree-sitter-cpp",
                "file_extensions": [".cpp", ".cc", ".cxx", ".hpp", ".h"],
                "keywords": [
                    "class",
                    "struct",
                    "namespace",
                    "template",
                    "public",
                    "private",
                    "protected",
                ],
            },
        }

        for lang, config in language_configs.items():
            try:
                # Load actual Tree-sitter language libraries
                if lang == "python":
                    import tree_sitter_python as tslang

                    language = Language(tslang.language())
                elif lang == "typescript":
                    import tree_sitter_typescript as tslang

                    language = Language(tslang.language_typescript())
                elif lang == "javascript":
                    import tree_sitter_javascript as tslang

                    language = Language(tslang.language())
                elif lang == "java":
                    import tree_sitter_java as tslang

                    language = Language(tslang.language())
                elif lang == "cpp":
                    import tree_sitter_cpp as tslang

                    language = Language(tslang.language())
                else:
                    language = None

                if language:
                    parser = Parser(language)
                    self.parsers[lang] = parser
                    self.languages[lang] = config
                    logger.info(
                        f"Tree-sitter parser for {lang} initialized successfully",
                    )
                else:
                    self.parsers[lang] = None
                    self.languages[lang] = config
                    logger.warning(f"Failed to load {lang} parser: language not found")

            except ImportError as e:
                logger.warning(f"Failed to import {lang} parser: {e}")
                self.parsers[lang] = None
                self.languages[lang] = config
            except Exception as e:
                logger.warning(f"Failed to load {lang} parser: {e}")
                self.parsers[lang] = None

        self._initialized = True

    def detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension."""
        path = Path(file_path)
        extension = path.suffix.lower()

        for lang, config in self.languages.items():
            if extension in config["file_extensions"]:
                return lang

        return "generic"

    def tokenize_with_ast(self, code: str, language: str) -> list[str]:
        """Tokenize code using Tree-sitter AST parsing."""
        if (
            not self._initialized
            or language not in self.parsers
            or self.parsers[language] is None
        ):
            return self._fallback_tokenize(code, language)

        try:
            parser = self.parsers[language]
            tree = parser.parse(bytes(code, "utf8"))

            # Extract tokens from AST
            tokens = []
            self._extract_tokens_from_ast(tree.root_node, code, tokens, language)

            # If we got no tokens from AST, fall back to regex
            if not tokens:
                return self._fallback_tokenize(code, language)

            return tokens

        except Exception as e:
            logger.warning(
                f"AST tokenization failed for {language}: {e}, using fallback",
            )
            return self._fallback_tokenize(code, language)

    def _extract_tokens_from_ast(
        self,
        node,
        code: str,
        tokens: list[str],
        language: str,
    ) -> None:
        """Extract meaningful tokens from AST nodes."""
        # Get the text content of this node
        node_text = code[node.start_byte : node.end_byte].strip()

        # Skip empty nodes
        if not node_text:
            return

        # Extract different types of tokens based on node type
        node_type = node.type

        # Extract identifiers (variables, functions, classes)
        if node_type in ["identifier", "type_identifier", "property_identifier"]:
            # Split camelCase and snake_case
            split_tokens = self._split_identifier(node_text)
            tokens.extend(split_tokens)

        # Extract string literals
        elif node_type in ["string", "string_literal", "raw_string_literal"]:
            # Clean up string literals
            cleaned = self._clean_string_literal(node_text)
            if cleaned:
                tokens.append(cleaned)

        # Extract keywords
        elif node_type in ["keyword", "def", "class", "function", "import", "export"]:
            tokens.append(node_text.lower())

        # Extract comments
        elif node_type in ["comment", "line_comment", "block_comment"]:
            cleaned = self._clean_comment(node_text)
            if cleaned:
                tokens.append(cleaned)

        # Extract numbers
        elif node_type in ["number", "integer", "float"]:
            tokens.append(node_text)

        # Recursively process child nodes
        for child in node.children:
            self._extract_tokens_from_ast(child, code, tokens, language)

    def _split_identifier(self, identifier: str) -> list[str]:
        """Split identifiers into meaningful parts."""
        tokens = []

        # Keep the original identifier
        tokens.append(identifier.lower())

        # Split camelCase: SearchService -> [search, service]
        camel_case_split = re.sub(r"([a-z])([A-Z])", r"\1 \2", identifier)

        # Split snake_case: search_service -> [search, service]
        snake_case_split = camel_case_split.replace("_", " ")

        # Split on spaces and add individual parts
        parts = snake_case_split.split()
        for part in parts:
            if part.lower() != identifier.lower():  # Avoid duplicates
                tokens.append(part.lower())

        return tokens

    def _clean_string_literal(self, string_literal: str) -> str:
        """Clean up string literals for tokenization."""
        # Remove quotes and escape sequences
        cleaned = re.sub(r'^["\'`]|["\'`]$', "", string_literal)
        cleaned = re.sub(r"\\.", "", cleaned)  # Remove escape sequences
        return cleaned.strip()

    def _clean_comment(self, comment: str) -> str:
        """Clean up comments for tokenization."""
        # Remove comment markers
        cleaned = re.sub(r"^[#/]*\s*", "", comment)
        cleaned = re.sub(r"\*/\s*$", "", cleaned)
        return cleaned.strip()

    def _fallback_tokenize(self, code: str, language: str) -> list[str]:
        """Fallback tokenization using regex patterns."""
        # Step 1: Clean and normalize the code
        code = self._normalize_code(code)

        # Step 2: Extract different types of tokens
        tokens = []

        # Extract strings (preserve them as single tokens)
        string_tokens = self._extract_strings(code)
        code_without_strings = self._remove_strings(code)

        # Extract identifiers (variables, functions, classes)
        identifier_tokens = self._extract_identifiers(code_without_strings, language)

        # Extract keywords and operators
        keyword_tokens = self._extract_keywords(code_without_strings, language)

        # Extract numbers
        number_tokens = self._extract_numbers(code_without_strings)

        # Extract comments
        comment_tokens = self._extract_comments(code)

        # Combine all tokens
        tokens.extend(string_tokens)
        tokens.extend(identifier_tokens)
        tokens.extend(keyword_tokens)
        tokens.extend(number_tokens)
        tokens.extend(comment_tokens)

        # Remove empty tokens and normalize
        tokens = [token.lower().strip() for token in tokens if token.strip()]

        return tokens

    def _normalize_code(self, code: str) -> str:
        """Normalize code for better tokenization."""
        # Remove excessive whitespace
        code = re.sub(r"\s+", " ", code)
        # Normalize line endings
        code = code.replace("\r\n", "\n").replace("\r", "\n")
        return code

    def _extract_strings(self, code: str) -> list[str]:
        """Extract string literals."""
        strings = []
        # Match various string patterns
        string_patterns = [
            r'"[^"\\]*(\\.[^"\\]*)*"',  # Double quoted strings
            r"'[^'\\]*(\\.[^'\\]*)*'",  # Single quoted strings
            r"`[^`\\]*(\\.[^`\\]*)*`",  # Backtick strings (JS/TS)
            r'r"[^"]*"',  # Raw strings (Python)
            r'f"[^"]*"',  # F-strings (Python)
        ]

        for pattern in string_patterns:
            matches = re.findall(pattern, code)
            strings.extend(matches)

        return strings

    def _remove_strings(self, code: str) -> str:
        """Remove string literals from code."""
        # Replace strings with placeholders
        string_patterns = [
            r'"[^"\\]*(\\.[^"\\]*)*"',
            r"'[^'\\]*(\\.[^'\\]*)*'",
            r"`[^`\\]*(\\.[^`\\]*)*`",
            r'r"[^"]*"',
            r'f"[^"]*"',
        ]

        for pattern in string_patterns:
            code = re.sub(pattern, " STRING_PLACEHOLDER ", code)

        return code

    def _extract_identifiers(self, code: str, language: str) -> list[str]:
        """Extract identifiers with intelligent splitting."""
        # Pattern for identifiers (letters, digits, underscores)
        identifier_pattern = r"\b[a-zA-Z_][a-zA-Z0-9_]*\b"
        identifiers = re.findall(identifier_pattern, code)

        # Split camelCase and PascalCase
        split_identifiers = []
        for identifier in identifiers:
            # Skip if it's a placeholder
            if identifier == "STRING_PLACEHOLDER":
                continue

            # Split camelCase: SearchService -> [Search, Service]
            camel_case_split = re.sub(r"([a-z])([A-Z])", r"\1 \2", identifier)

            # Split snake_case: search_service -> [search, service]
            snake_case_split = camel_case_split.replace("_", " ")

            # Split on spaces and add individual parts
            parts = snake_case_split.split()
            split_identifiers.extend(parts)

            # Also keep the original identifier
            split_identifiers.append(identifier)

        return split_identifiers

    def _extract_keywords(self, code: str, language: str) -> list[str]:
        """Extract language-specific keywords."""
        if language not in self.languages:
            return []

        keywords = self.languages[language]["keywords"]
        found_keywords = []

        for keyword in keywords:
            # Use word boundaries to match whole words only
            pattern = r"\b" + re.escape(keyword) + r"\b"
            if re.search(pattern, code, re.IGNORECASE):
                found_keywords.append(keyword)

        return found_keywords

    def _extract_numbers(self, code: str) -> list[str]:
        """Extract numeric literals."""
        # Pattern for various number formats
        number_pattern = r"\b\d+(\.\d+)?([eE][+-]?\d+)?\b"
        numbers = re.findall(number_pattern, code)

        # Flatten the tuples and return as strings
        return ["".join(num) for num in numbers]

    def _extract_comments(self, code: str) -> list[str]:
        """Extract comments."""
        comments = []

        # Single line comments
        single_line_pattern = r"//.*$|#.*$"
        single_line_comments = re.findall(single_line_pattern, code, re.MULTILINE)
        comments.extend(single_line_comments)

        # Multi-line comments
        multi_line_pattern = r"/\*.*?\*/"
        multi_line_comments = re.findall(multi_line_pattern, code, re.DOTALL)
        comments.extend(multi_line_comments)

        # Clean up comments
        cleaned_comments = []
        for comment in comments:
            # Remove comment markers
            cleaned = re.sub(r"^[#/]*\s*", "", comment)
            cleaned = re.sub(r"\*/\s*$", "", cleaned)
            if cleaned.strip():
                cleaned_comments.append(cleaned.strip())

        return cleaned_comments

    def tokenize(self, code: str, file_path: str = "") -> list[str]:
        """Main tokenization method."""
        language = self.detect_language(file_path) if file_path else "generic"
        return self.tokenize_with_ast(code, language)

    def get_tokenization_stats(self) -> dict[str, Any]:
        """Get statistics about tokenization capabilities."""
        return {
            "tree_sitter_available": TREE_SITTER_AVAILABLE,
            "initialized": self._initialized,
            "supported_languages": list(self.languages.keys()),
            "parsers_loaded": len([p for p in self.parsers.values() if p is not None]),
            "total_parsers": len(self.parsers),
        }


# Global tokenizer instance
_tokenizer = None


def get_code_tokenizer() -> CodeTokenizer:
    """Get the global code tokenizer instance."""
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = CodeTokenizer()
    return _tokenizer
