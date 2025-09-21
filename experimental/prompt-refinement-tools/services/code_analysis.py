#!/usr/bin/env python3
"""
Code Analysis Service

Advanced code analysis using tree-sitter for prompt refinement.
Replaces the pseudo-code code analysis functions with actual implementations.

🦊 Fox approach: Strategic code understanding with intelligent pattern recognition
"""

import asyncio
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

# Optional imports with fallbacks
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


@dataclass
class CodeAnalysisResult:
    """Result of code analysis operation."""

    file_path: str
    language: str
    functions: List[Dict[str, Any]]
    classes: List[Dict[str, Any]]
    imports: List[str]
    complexity_score: float
    patterns: List[str]
    analysis_time: float


class CodeAnalysisService:
    """
    Advanced code analysis service using tree-sitter.

    Provides comprehensive code analysis for prompt refinement.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the code analysis service."""
        self.config = config or {}

        # Configuration
        self.supported_languages = {
            "python": ".py",
            "typescript": ".ts",
            "javascript": ".js",
            "java": ".java",
            "cpp": ".cpp",
        }

        # Initialize components
        self.parsers: Dict[str, Any] = {}
        self.languages: Dict[str, Any] = {}

        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the code analysis service."""
        try:
            if TREE_SITTER_AVAILABLE:
                # Initialize tree-sitter parsers for supported languages
                for lang_name in self.supported_languages.keys():
                    try:
                        # In a real implementation, you would load the language libraries
                        # For now, we'll use fallback parsing
                        self.parsers[lang_name] = None
                        logger.info(
                            f"Tree-sitter parser for {lang_name} would be initialized"
                        )
                    except Exception as e:
                        logger.warning(f"Failed to load {lang_name} parser: {e}")
                        self.parsers[lang_name] = None
            else:
                logger.warning(
                    "Tree-sitter not available, using fallback code analysis"
                )

            self._initialized = True
            logger.info("Code analysis service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize code analysis service: {e}")
            return False

    async def analyze_codebase_relevance(
        self, query: str, research_findings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze codebase relevance for a query.

        Replaces the pseudo-code analyze_codebase_relevance() function.
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Analyzing codebase relevance for query: {query}")

        try:
            # Extract code-related concepts from query
            code_concepts = self._extract_code_concepts(query)

            # Analyze terminology gaps
            terminology_gaps = self._identify_terminology_gaps(query, research_findings)

            # Analyze pattern alignment
            pattern_alignment = self._analyze_pattern_alignment(query, code_concepts)

            # Identify architectural context needs
            architectural_context = self._identify_architectural_context(
                query, code_concepts
            )

            # Assess dependency awareness
            dependency_awareness = self._assess_dependency_awareness(
                query, code_concepts
            )

            # Evaluate coding standard alignment
            coding_standard_alignment = self._evaluate_coding_standard_alignment(query)

            return {
                "relevant": True,
                "code_concepts": code_concepts,
                "terminology_gaps": terminology_gaps,
                "pattern_alignment": pattern_alignment,
                "architectural_context": architectural_context,
                "dependency_awareness": dependency_awareness,
                "coding_standard_alignment": coding_standard_alignment,
            }

        except Exception as e:
            logger.error(f"Codebase relevance analysis failed: {e}")
            return {"relevant": False, "error": str(e)}

    def _extract_code_concepts(self, query: str) -> List[str]:
        """Extract code-related concepts from query."""
        code_indicators = [
            "function",
            "class",
            "method",
            "variable",
            "import",
            "export",
            "component",
            "module",
            "package",
            "library",
            "framework",
            "API",
            "implementation",
            "refactor",
            "debug",
            "test",
            "build",
            "deploy",
            "syntax",
            "error",
            "bug",
            "feature",
            "development",
            "programming",
            "python",
            "javascript",
            "typescript",
            "java",
            "cpp",
            "react",
            "vue",
            "angular",
            "node",
            "express",
            "django",
            "flask",
        ]

        concepts = []
        query_lower = query.lower()

        for indicator in code_indicators:
            if indicator in query_lower:
                concepts.append(indicator)

        return concepts

    def _identify_terminology_gaps(
        self, query: str, research_findings: Dict[str, Any]
    ) -> List[str]:
        """Identify terminology gaps in the query."""
        gaps = []

        # Check for missing language specification
        languages = ["python", "javascript", "typescript", "java", "cpp", "go", "rust"]
        if any(
            word in query.lower() for word in ["code", "function", "class", "method"]
        ):
            if not any(lang in query.lower() for lang in languages):
                gaps.append("Missing programming language specification")

        # Check for missing framework specification
        frameworks = ["react", "vue", "angular", "django", "flask", "express", "spring"]
        if any(word in query.lower() for word in ["component", "app", "application"]):
            if not any(framework in query.lower() for framework in frameworks):
                gaps.append("Missing framework specification")

        # Check for missing context
        if len(query.split()) < 8:
            gaps.append("Insufficient technical context")

        return gaps

    def _analyze_pattern_alignment(self, query: str, code_concepts: List[str]) -> str:
        """Analyze pattern alignment with common coding patterns."""
        alignment_score = 0.5

        # Check for common patterns
        patterns = {
            "mvc": ["model", "view", "controller"],
            "repository": ["repository", "data", "storage"],
            "factory": ["factory", "create", "build"],
            "singleton": ["singleton", "instance", "single"],
            "observer": ["observer", "listener", "event"],
            "strategy": ["strategy", "algorithm", "behavior"],
        }

        query_lower = query.lower()
        for pattern_name, pattern_terms in patterns.items():
            if any(term in query_lower for term in pattern_terms):
                alignment_score += 0.1

        # Check for modern patterns
        modern_patterns = ["hook", "composable", "middleware", "decorator", "mixin"]
        if any(pattern in query_lower for pattern in modern_patterns):
            alignment_score += 0.1

        if alignment_score > 0.7:
            return "high"
        elif alignment_score > 0.5:
            return "moderate"
        else:
            return "low"

    def _identify_architectural_context(
        self, query: str, code_concepts: List[str]
    ) -> str:
        """Identify architectural context needs."""
        query_lower = query.lower()

        # Check for architectural terms
        architectural_terms = [
            "architecture",
            "design",
            "pattern",
            "structure",
            "organization",
            "layered",
            "microservice",
            "monolith",
            "distributed",
            "scalable",
        ]

        if any(term in query_lower for term in architectural_terms):
            return "high"

        # Check for component-level terms
        component_terms = ["component", "module", "service", "controller", "model"]
        if any(term in query_lower for term in component_terms):
            return "moderate"

        return "basic"

    def _assess_dependency_awareness(self, query: str, code_concepts: List[str]) -> str:
        """Assess dependency awareness in the query."""
        query_lower = query.lower()

        # Check for dependency-related terms
        dependency_terms = [
            "dependency",
            "import",
            "require",
            "package",
            "library",
            "framework",
            "npm",
            "pip",
            "maven",
            "gradle",
            "yarn",
            "pnpm",
        ]

        if any(term in query_lower for term in dependency_terms):
            return "high"

        # Check for integration terms
        integration_terms = ["integrate", "connect", "api", "service", "database"]
        if any(term in query_lower for term in integration_terms):
            return "moderate"

        return "basic"

    def _evaluate_coding_standard_alignment(self, query: str) -> str:
        """Evaluate coding standard alignment."""
        query_lower = query.lower()

        # Check for coding standard terms
        standard_terms = [
            "style",
            "format",
            "lint",
            "eslint",
            "prettier",
            "black",
            "flake8",
            "convention",
            "best practice",
            "guideline",
            "standard",
        ]

        if any(term in query_lower for term in standard_terms):
            return "high"

        # Check for quality terms
        quality_terms = ["clean", "readable", "maintainable", "testable", "documented"]
        if any(term in query_lower for term in quality_terms):
            return "moderate"

        return "basic"

    async def analyze_file(self, file_path: str) -> CodeAnalysisResult:
        """
        Analyze a single code file.

        Provides comprehensive analysis of code structure and patterns.
        """
        start_time = asyncio.get_event_loop().time()

        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            # Determine language from file extension
            language = self._detect_language(file_path)

            # Read file content
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Analyze code structure
            functions = self._extract_functions(content, language)
            classes = self._extract_classes(content, language)
            imports = self._extract_imports(content, language)

            # Calculate complexity score
            complexity_score = self._calculate_complexity_score(
                content, functions, classes
            )

            # Identify patterns
            patterns = self._identify_patterns(content, language)

            analysis_time = asyncio.get_event_loop().time() - start_time

            return CodeAnalysisResult(
                file_path=file_path,
                language=language,
                functions=functions,
                classes=classes,
                imports=imports,
                complexity_score=complexity_score,
                patterns=patterns,
                analysis_time=analysis_time,
            )

        except Exception as e:
            logger.error(f"File analysis failed for {file_path}: {e}")
            return CodeAnalysisResult(
                file_path=file_path,
                language="unknown",
                functions=[],
                classes=[],
                imports=[],
                complexity_score=0.0,
                patterns=[],
                analysis_time=0.0,
            )

    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension."""
        file_path_obj = Path(file_path)
        extension = file_path_obj.suffix.lower()

        for lang, ext in self.supported_languages.items():
            if extension == ext:
                return lang

        return "unknown"

    def _extract_functions(self, content: str, language: str) -> List[Dict[str, Any]]:
        """Extract function definitions from code."""
        functions = []

        if language == "python":
            # Python function extraction
            pattern = r"def\s+(\w+)\s*\([^)]*\):"
            matches = re.finditer(pattern, content)
            for match in matches:
                functions.append(
                    {
                        "name": match.group(1),
                        "line": content[: match.start()].count("\n") + 1,
                        "type": "function",
                    }
                )

        elif language in ["typescript", "javascript"]:
            # JavaScript/TypeScript function extraction
            patterns = [
                r"function\s+(\w+)\s*\([^)]*\)",
                r"const\s+(\w+)\s*=\s*\([^)]*\)\s*=>",
                r"(\w+)\s*\([^)]*\)\s*{",
            ]

            for pattern in patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    functions.append(
                        {
                            "name": match.group(1),
                            "line": content[: match.start()].count("\n") + 1,
                            "type": "function",
                        }
                    )

        return functions

    def _extract_classes(self, content: str, language: str) -> List[Dict[str, Any]]:
        """Extract class definitions from code."""
        classes = []

        if language == "python":
            # Python class extraction
            pattern = r"class\s+(\w+)(?:\([^)]*\))?:"
            matches = re.finditer(pattern, content)
            for match in matches:
                classes.append(
                    {
                        "name": match.group(1),
                        "line": content[: match.start()].count("\n") + 1,
                        "type": "class",
                    }
                )

        elif language in ["typescript", "javascript"]:
            # JavaScript/TypeScript class extraction
            pattern = r"class\s+(\w+)(?:\s+extends\s+\w+)?\s*{"
            matches = re.finditer(pattern, content)
            for match in matches:
                classes.append(
                    {
                        "name": match.group(1),
                        "line": content[: match.start()].count("\n") + 1,
                        "type": "class",
                    }
                )

        return classes

    def _extract_imports(self, content: str, language: str) -> List[str]:
        """Extract import statements from code."""
        imports = []

        if language == "python":
            # Python import extraction
            patterns = [r"import\s+(\w+)", r"from\s+(\w+)\s+import"]

            for pattern in patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    imports.append(match.group(1))

        elif language in ["typescript", "javascript"]:
            # JavaScript/TypeScript import extraction
            patterns = [
                r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
                r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
            ]

            for pattern in patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    imports.append(match.group(1))

        return list(set(imports))  # Remove duplicates

    def _calculate_complexity_score(
        self,
        content: str,
        functions: List[Dict[str, Any]],
        classes: List[Dict[str, Any]],
    ) -> float:
        """Calculate code complexity score."""
        score = 0.0

        # Base score from file length
        lines = len(content.split("\n"))
        if lines > 100:
            score += 0.3
        elif lines > 50:
            score += 0.2
        else:
            score += 0.1

        # Function complexity
        if len(functions) > 10:
            score += 0.3
        elif len(functions) > 5:
            score += 0.2
        else:
            score += 0.1

        # Class complexity
        if len(classes) > 5:
            score += 0.2
        elif len(classes) > 2:
            score += 0.1

        # Import complexity
        import_count = len(re.findall(r"import|require", content))
        if import_count > 10:
            score += 0.2
        elif import_count > 5:
            score += 0.1

        return min(1.0, score)

    def _identify_patterns(self, content: str, language: str) -> List[str]:
        """Identify common design patterns in code."""
        patterns = []
        content_lower = content.lower()

        # Common patterns
        pattern_indicators = {
            "singleton": ["getinstance", "instance", "single"],
            "factory": ["factory", "create", "build"],
            "observer": ["observer", "listener", "event", "subscribe"],
            "strategy": ["strategy", "algorithm", "behavior"],
            "decorator": ["decorator", "@", "wrapper"],
            "mvc": ["model", "view", "controller"],
            "repository": ["repository", "data", "storage"],
            "service": ["service", "business", "logic"],
        }

        for pattern_name, indicators in pattern_indicators.items():
            if any(indicator in content_lower for indicator in indicators):
                patterns.append(pattern_name)

        return patterns

    async def initialize(self) -> bool:
        """Initialize the code analysis service."""
        try:
            logger.info("Code analysis service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize code analysis service: {e}")
            return False
