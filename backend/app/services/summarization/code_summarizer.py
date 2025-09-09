"""
Code-specific summarizer for Reynard.

This module provides specialized summarization for source code files,
programming documentation, and technical code content with code-specific
prompts and processing.
"""

import logging
import time
import uuid
import re
from typing import Dict, List, Optional, Any, AsyncGenerator

from .base import BaseSummarizer, SummarizationResult, SummarizationOptions, ContentType, SummaryLevel

logger = logging.getLogger(__name__)


class CodeSummarizer(BaseSummarizer):
    """
    Specialized summarizer for source code and programming content.
    
    This summarizer is optimized for source code files, programming documentation,
    and technical code content with specialized prompts and code analysis.
    """

    def __init__(self, ollama_service):
        """
        Initialize the code summarizer.

        Args:
            ollama_service: Instance of Reynard's OllamaService
        """
        super().__init__(
            name="code_summarizer",
            supported_content_types=[ContentType.CODE, ContentType.TECHNICAL]
        )
        self.ollama_service = ollama_service
        self._default_model = "codellama:7b"  # Code-specific model

    async def initialize(self) -> bool:
        """Initialize the code summarizer."""
        try:
            if not self.ollama_service:
                logger.error("Ollama service not available")
                return False

            self._is_available = True
            logger.info("✅ CodeSummarizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize CodeSummarizer: {e}")
            return False

    async def summarize(
        self, text: str, options: SummarizationOptions
    ) -> SummarizationResult:
        """Summarize code text."""
        if not self._is_available:
            raise RuntimeError("CodeSummarizer is not available")

        if not await self.validate_text(text):
            raise ValueError("Invalid code text for summarization")

        start_time = time.time()

        try:
            # Analyze code structure
            code_analysis = self._analyze_code_structure(text)
            
            # Generate summary
            summary_text = await self._generate_code_summary(text, options, code_analysis)
            
            processing_time = time.time() - start_time

            # Extract code-specific metadata
            language = self._detect_programming_language(text)
            functions = self._extract_functions(text)
            classes = self._extract_classes(text)

            # Create result
            result = SummarizationResult(
                id=str(uuid.uuid4()),
                original_text=text,
                summary=summary_text,
                content_type=ContentType.CODE,
                summary_level=options.summary_level,
                model=options.model or self._default_model,
                processing_time=processing_time,
                word_count=len(text.split()),
                summary_word_count=len(summary_text.split()),
                metadata={
                    "summarizer": self.name,
                    "model_used": options.model or self._default_model,
                    "programming_language": language,
                    "function_count": len(functions),
                    "class_count": len(classes),
                    "code_analysis": code_analysis,
                }
            )

            # Add optional fields
            if options.include_outline:
                result.outline = await self._extract_code_outline(summary_text, functions, classes)
            
            if options.include_highlights:
                result.highlights = await self._extract_code_highlights(text, functions, classes)

            # Calculate quality score
            result.quality_score = await self._calculate_code_quality(text, summary_text, code_analysis)

            return result

        except Exception as e:
            logger.error(f"Code summarization failed: {e}")
            raise

    async def summarize_stream(
        self, text: str, options: SummarizationOptions
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream code summarization progress."""
        if not self._is_available:
            yield {
                "event": "error",
                "data": {"message": "CodeSummarizer is not available"},
            }
            return

        try:
            yield {"event": "start", "data": {"message": "Starting code summarization"}}

            # Analyze code structure
            code_analysis = self._analyze_code_structure(text)
            yield {"event": "analyze", "data": {"message": "Code structure analyzed"}}

            # Stream summary generation
            summary_text = ""
            async for chunk in self._generate_code_summary_stream(text, options, code_analysis):
                if chunk.get("type") == "token":
                    summary_text += chunk.get("data", "")
                    yield {
                        "event": "token",
                        "data": {
                            "token": chunk.get("data", ""),
                            "partial_summary": summary_text,
                        },
                    }
                elif chunk.get("type") == "complete":
                    # Generate final result
                    result = await self.summarize(text, options)
                    yield {
                        "event": "complete",
                        "data": result.to_dict(),
                    }

        except Exception as e:
            logger.error(f"Streaming code summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def validate_text(self, text: str) -> bool:
        """Validate code text."""
        if not text or not text.strip():
            return False

        # Check minimum length for code
        if len(text.strip()) < 50:
            return False

        # Check maximum length
        if len(text) > 100000:  # ~25k tokens
            return False

        # Check if it looks like code
        if not self._looks_like_code(text):
            return False

        return True

    def _looks_like_code(self, text: str) -> bool:
        """Check if text looks like source code."""
        # Common code indicators
        code_indicators = [
            r'def\s+\w+\s*\(',  # Python functions
            r'function\s+\w+\s*\(',  # JavaScript functions
            r'class\s+\w+',  # Classes
            r'import\s+\w+',  # Imports
            r'from\s+\w+\s+import',  # Python imports
            r'#include\s*<',  # C/C++ includes
            r'public\s+class',  # Java classes
            r'const\s+\w+\s*=',  # JavaScript constants
            r'var\s+\w+\s*=',  # JavaScript variables
            r'int\s+\w+\s*;',  # C/C++ variables
            r'if\s*\(',  # If statements
            r'for\s*\(',  # For loops
            r'while\s*\(',  # While loops
            r'return\s+',  # Return statements
        ]

        for pattern in code_indicators:
            if re.search(pattern, text, re.IGNORECASE):
                return True

        return False

    def _analyze_code_structure(self, text: str) -> Dict[str, Any]:
        """Analyze the structure of the code."""
        analysis = {
            "lines_of_code": len(text.split('\n')),
            "has_functions": bool(re.search(r'def\s+\w+\s*\(|function\s+\w+\s*\(', text)),
            "has_classes": bool(re.search(r'class\s+\w+', text)),
            "has_imports": bool(re.search(r'import\s+\w+|from\s+\w+\s+import', text)),
            "has_comments": bool(re.search(r'#.*|//.*|/\*.*\*/', text)),
            "complexity_indicators": [],
        }

        # Check for complexity indicators
        if re.search(r'if\s*\(.*\)\s*{', text):
            analysis["complexity_indicators"].append("conditional_logic")
        if re.search(r'for\s*\(|while\s*\(', text):
            analysis["complexity_indicators"].append("loops")
        if re.search(r'try\s*{|catch\s*\(', text):
            analysis["complexity_indicators"].append("error_handling")
        if re.search(r'async\s+|await\s+', text):
            analysis["complexity_indicators"].append("asynchronous_code")

        return analysis

    def _detect_programming_language(self, text: str) -> str:
        """Detect the programming language of the code."""
        # Language detection patterns
        language_patterns = {
            'python': [r'def\s+\w+\s*\(', r'import\s+\w+', r'from\s+\w+\s+import', r'if\s+__name__\s*==\s*["\']__main__["\']'],
            'javascript': [r'function\s+\w+\s*\(', r'const\s+\w+\s*=', r'let\s+\w+\s*=', r'var\s+\w+\s*=', r'console\.log'],
            'java': [r'public\s+class\s+\w+', r'public\s+static\s+void\s+main', r'System\.out\.print'],
            'cpp': [r'#include\s*<', r'int\s+main\s*\(', r'std::', r'using\s+namespace'],
            'c': [r'#include\s*<', r'int\s+main\s*\(', r'printf\s*\(', r'#define'],
            'typescript': [r'interface\s+\w+', r'type\s+\w+\s*=', r':\s*\w+', r'export\s+'],
            'go': [r'package\s+\w+', r'func\s+\w+\s*\(', r'import\s+\w+', r'fmt\.Print'],
            'rust': [r'fn\s+\w+\s*\(', r'let\s+\w+\s*:', r'use\s+\w+', r'println!'],
        }

        for language, patterns in language_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return language

        return 'unknown'

    def _extract_functions(self, text: str) -> List[str]:
        """Extract function names from code."""
        functions = []
        
        # Python functions
        python_functions = re.findall(r'def\s+(\w+)\s*\(', text)
        functions.extend(python_functions)
        
        # JavaScript functions
        js_functions = re.findall(r'function\s+(\w+)\s*\(', text)
        functions.extend(js_functions)
        
        # Arrow functions
        arrow_functions = re.findall(r'(\w+)\s*=\s*\([^)]*\)\s*=>', text)
        functions.extend(arrow_functions)
        
        return list(set(functions))  # Remove duplicates

    def _extract_classes(self, text: str) -> List[str]:
        """Extract class names from code."""
        classes = []
        
        # Python classes
        python_classes = re.findall(r'class\s+(\w+)', text)
        classes.extend(python_classes)
        
        # JavaScript classes
        js_classes = re.findall(r'class\s+(\w+)', text)
        classes.extend(js_classes)
        
        # Java classes
        java_classes = re.findall(r'public\s+class\s+(\w+)', text)
        classes.extend(java_classes)
        
        return list(set(classes))  # Remove duplicates

    async def _generate_code_summary(self, text: str, options: SummarizationOptions, code_analysis: Dict[str, Any]) -> str:
        """Generate code summary using specialized prompts."""
        system_prompt, user_prompt = self._get_code_prompts(text, options, code_analysis)

        model = options.model or self._default_model

        # Generate summary
        summary_text = ""
        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True
        ):
            if event.type == "token":
                summary_text += event.data
            elif event.type == "error":
                raise RuntimeError(f"Ollama error: {event.data}")

        return summary_text.strip()

    async def _generate_code_summary_stream(
        self, text: str, options: SummarizationOptions, code_analysis: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate code summary with streaming."""
        system_prompt, user_prompt = self._get_code_prompts(text, options, code_analysis)

        model = options.model or self._default_model

        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True
        ):
            yield {
                "type": event.type,
                "data": event.data,
                "timestamp": event.timestamp,
                "metadata": event.metadata
            }

    def _get_code_prompts(self, text: str, options: SummarizationOptions, code_analysis: Dict[str, Any]) -> tuple[str, str]:
        """Get specialized prompts for code summarization."""
        # Code-specific system prompt
        system_prompt = """You are an expert code analyzer and technical writer specializing in source code documentation.

Your task is to create high-quality code summaries that:
- Explain the purpose and functionality of the code
- Identify key functions, classes, and components
- Describe the overall architecture and design patterns
- Highlight important algorithms and data structures
- Explain the input/output behavior
- Identify dependencies and external integrations
- Note any security considerations or best practices
- Use clear, technical language appropriate for developers

Guidelines:
- Focus on what the code does, not how it's implemented
- Explain the business logic and purpose
- Identify key functions and their roles
- Describe data flow and control flow
- Highlight any notable patterns or techniques
- Use precise technical terminology
- Make the summary useful for code review and documentation"""

        # Add level-specific instructions
        level_instructions = {
            SummaryLevel.BRIEF: "Create a concise 2-3 sentence summary focusing on the main purpose.",
            SummaryLevel.EXECUTIVE: "Create a high-level overview suitable for technical managers.",
            SummaryLevel.DETAILED: "Create a comprehensive summary covering all major components and functionality.",
            SummaryLevel.COMPREHENSIVE: "Create an extensive summary with thorough analysis of all aspects.",
            SummaryLevel.BULLET: "Create a bullet-point summary with key functions and components.",
            SummaryLevel.TTS_OPTIMIZED: "Create a summary optimized for speech with clear pronunciation of technical terms.",
        }

        system_prompt += f"\n\nSummary Level: {level_instructions.get(options.summary_level, '')}"

        if options.include_outline:
            system_prompt += "\nInclude a structured outline with main functions, classes, and components."

        if options.include_highlights:
            system_prompt += "\nInclude important code highlights, key functions, and notable implementations."

        # Add code analysis context
        if code_analysis:
            system_prompt += f"\n\nCode Analysis Context:"
            system_prompt += f"\n- Lines of code: {code_analysis.get('lines_of_code', 0)}"
            system_prompt += f"\n- Has functions: {code_analysis.get('has_functions', False)}"
            system_prompt += f"\n- Has classes: {code_analysis.get('has_classes', False)}"
            system_prompt += f"\n- Has imports: {code_analysis.get('has_imports', False)}"
            if code_analysis.get('complexity_indicators'):
                system_prompt += f"\n- Complexity indicators: {', '.join(code_analysis['complexity_indicators'])}"

        # User prompt
        user_prompt = f"Please analyze and summarize the following source code:\n\n{text}"

        if options.max_length:
            user_prompt += f"\n\nTarget length: approximately {options.max_length} words."

        return system_prompt, user_prompt

    async def _extract_code_outline(self, summary: str, functions: List[str], classes: List[str]) -> List[str]:
        """Extract outline points from code summary."""
        outline = []
        
        # Add function information
        if functions:
            outline.append(f"Functions: {', '.join(functions[:5])}")  # Limit to 5 functions
        
        # Add class information
        if classes:
            outline.append(f"Classes: {', '.join(classes[:3])}")  # Limit to 3 classes
        
        # Extract key points from summary
        sentences = summary.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 30 and any(keyword in sentence.lower() for keyword in 
                ['main', 'key', 'important', 'primary', 'function', 'class', 'algorithm']):
                outline.append(sentence)
        
        return outline[:6]  # Limit to 6 points

    async def _extract_code_highlights(self, text: str, functions: List[str], classes: List[str]) -> List[str]:
        """Extract highlights from code text."""
        highlights = []
        
        # Add function definitions as highlights
        for func in functions[:3]:  # Limit to 3 functions
            func_pattern = rf'def\s+{func}\s*\([^)]*\):|function\s+{func}\s*\([^)]*\)'
            match = re.search(func_pattern, text, re.IGNORECASE)
            if match:
                highlights.append(match.group(0))
        
        # Add class definitions as highlights
        for cls in classes[:2]:  # Limit to 2 classes
            class_pattern = rf'class\s+{cls}\s*[\(:]'
            match = re.search(class_pattern, text, re.IGNORECASE)
            if match:
                highlights.append(match.group(0))
        
        return highlights

    async def _calculate_code_quality(self, original_text: str, summary: str, code_analysis: Dict[str, Any]) -> float:
        """Calculate quality score for code summary."""
        # Enhanced quality scoring for code
        original_words = set(original_text.lower().split())
        summary_words = set(summary.lower().split())
        
        # Word overlap ratio
        overlap_ratio = len(original_words.intersection(summary_words)) / len(original_words) if original_words else 0
        
        # Length appropriateness for code (20-40% of original)
        length_ratio = len(summary.split()) / len(original_text.split()) if original_text.split() else 0
        length_score = 1.0 - abs(length_ratio - 0.3) / 0.2  # Optimal at 30%
        length_score = max(0.0, min(1.0, length_score))
        
        # Technical accuracy score
        technical_score = 0.5  # Base score
        if any(keyword in summary.lower() for keyword in ['function', 'class', 'algorithm', 'data structure']):
            technical_score += 0.3
        if code_analysis.get('has_functions') and 'function' in summary.lower():
            technical_score += 0.1
        if code_analysis.get('has_classes') and 'class' in summary.lower():
            technical_score += 0.1
        
        # Combine scores
        quality_score = (overlap_ratio * 0.3 + length_score * 0.3 + technical_score * 0.4)
        return min(1.0, max(0.0, quality_score))
