"""
Automated Refactoring Detection Tool

This tool automatically detects code duplication, inconsistent patterns,
and refactoring opportunities in the Reynard backend codebase.
"""

import ast
import os
import re
import json
import time
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any, Optional
import hashlib


@dataclass
class CodePattern:
    """Represents a detected code pattern."""
    pattern_type: str
    file_path: str
    line_number: int
    code_snippet: str
    hash: str
    complexity: int
    dependencies: List[str]


@dataclass
class DuplicationGroup:
    """Represents a group of duplicated code patterns."""
    pattern_hash: str
    pattern_type: str
    occurrences: List[CodePattern]
    similarity_score: float
    refactoring_suggestion: str
    estimated_effort: str


@dataclass
class RefactoringMetrics:
    """Comprehensive refactoring quality metrics."""
    total_files: int
    total_lines: int
    duplicated_lines: int
    duplication_percentage: float
    pattern_groups: int
    complexity_score: float
    maintainability_index: float
    refactoring_opportunities: int
    estimated_effort_hours: float
    quality_score: float


class RefactoringDetector:
    """
    Automated refactoring detection and analysis tool.
    
    Detects:
    - Code duplication patterns
    - Inconsistent error handling
    - Repeated configuration patterns
    - Similar API endpoint structures
    - Common logging patterns
    - Health check implementations
    """
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.patterns: List[CodePattern] = []
        self.duplication_groups: List[DuplicationGroup] = []
        self.metrics: Optional[RefactoringMetrics] = None
        
        # Pattern detection rules
        self.pattern_rules = {
            "error_handling": [
                r"try:\s*\n.*except.*Exception.*:",
                r"raise HTTPException\(",
                r"logger\.error\(",
                r"return.*error.*message"
            ],
            "health_checks": [
                r"@.*\.get\("/health"\)",
                r"async def.*health.*:",
                r"return.*status.*healthy",
                r"health.*check"
            ],
            "configuration": [
                r"os\.getenv\(",
                r"config.*=.*{",
                r"default.*config",
                r"environment.*variable"
            ],
            "logging": [
                r"logger\.info\(",
                r"logger\.error\(",
                r"logger\.warning\(",
                r"logging\.getLogger\("
            ],
            "api_endpoints": [
                r"@.*\.get\(",
                r"@.*\.post\(",
                r"@.*\.put\(",
                r"@.*\.delete\(",
                r"async def.*:"
            ],
            "service_initialization": [
                r"async def.*init.*:",
                r"async def.*startup.*:",
                r"service.*initialization",
                r"initialize.*service"
            ]
        }
    
    def analyze_codebase(self) -> RefactoringMetrics:
        """Perform comprehensive codebase analysis."""
        print("🔍 Starting codebase analysis...")
        
        # Find all Python files
        python_files = self._find_python_files()
        print(f"📁 Found {len(python_files)} Python files")
        
        # Extract patterns from each file
        for file_path in python_files:
            self._extract_patterns_from_file(file_path)
        
        print(f"🎯 Extracted {len(self.patterns)} code patterns")
        
        # Group similar patterns
        self._group_duplicate_patterns()
        print(f"📊 Found {len(self.duplication_groups)} duplication groups")
        
        # Calculate metrics
        self.metrics = self._calculate_metrics(python_files)
        
        return self.metrics
    
    def _find_python_files(self) -> List[Path]:
        """Find all Python files in the project."""
        python_files = []
        
        for root, dirs, files in os.walk(self.project_root):
            # Skip certain directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['__pycache__', 'node_modules', 'venv']]
            
            for file in files:
                if file.endswith('.py'):
                    python_files.append(Path(root) / file)
        
        return python_files
    
    def _extract_patterns_from_file(self, file_path: Path) -> None:
        """Extract code patterns from a single file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            
            # Extract patterns using regex rules
            for pattern_type, rules in self.pattern_rules.items():
                for rule in rules:
                    matches = re.finditer(rule, content, re.MULTILINE | re.DOTALL)
                    for match in matches:
                        line_number = content[:match.start()].count('\n') + 1
                        code_snippet = self._extract_code_snippet(content, match.start(), match.end())
                        
                        pattern = CodePattern(
                            pattern_type=pattern_type,
                            file_path=str(file_path.relative_to(self.project_root)),
                            line_number=line_number,
                            code_snippet=code_snippet,
                            hash=self._calculate_pattern_hash(code_snippet),
                            complexity=self._calculate_complexity(code_snippet),
                            dependencies=self._extract_dependencies(code_snippet)
                        )
                        
                        self.patterns.append(pattern)
            
            # Extract AST-based patterns
            self._extract_ast_patterns(file_path, content)
            
        except Exception as e:
            print(f"⚠️ Error analyzing {file_path}: {e}")
    
    def _extract_ast_patterns(self, file_path: Path, content: str) -> None:
        """Extract patterns using AST analysis."""
        try:
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    self._analyze_function_pattern(node, file_path, content)
                elif isinstance(node, ast.ClassDef):
                    self._analyze_class_pattern(node, file_path, content)
                elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                    self._analyze_import_pattern(node, file_path)
        
        except SyntaxError:
            # Skip files with syntax errors
            pass
    
    def _analyze_function_pattern(self, node: ast.FunctionDef, file_path: Path, content: str) -> None:
        """Analyze function patterns for duplication."""
        # Extract function signature and body
        lines = content.split('\n')
        start_line = node.lineno
        end_line = node.end_lineno or start_line
        
        function_code = '\n'.join(lines[start_line-1:end_line])
        
        # Check for common function patterns
        if self._is_error_handler_function(node, function_code):
            pattern = CodePattern(
                pattern_type="error_handler_function",
                file_path=str(file_path.relative_to(self.project_root)),
                line_number=start_line,
                code_snippet=function_code,
                hash=self._calculate_pattern_hash(function_code),
                complexity=self._calculate_complexity(function_code),
                dependencies=self._extract_dependencies(function_code)
            )
            self.patterns.append(pattern)
        
        elif self._is_health_check_function(node, function_code):
            pattern = CodePattern(
                pattern_type="health_check_function",
                file_path=str(file_path.relative_to(self.project_root)),
                line_number=start_line,
                code_snippet=function_code,
                hash=self._calculate_pattern_hash(function_code),
                complexity=self._calculate_complexity(function_code),
                dependencies=self._extract_dependencies(function_code)
            )
            self.patterns.append(pattern)
        
        elif self._is_config_function(node, function_code):
            pattern = CodePattern(
                pattern_type="config_function",
                file_path=str(file_path.relative_to(self.project_root)),
                line_number=start_line,
                code_snippet=function_code,
                hash=self._calculate_pattern_hash(function_code),
                complexity=self._calculate_complexity(function_code),
                dependencies=self._extract_dependencies(function_code)
            )
            self.patterns.append(pattern)
    
    def _analyze_class_pattern(self, node: ast.ClassDef, file_path: Path, content: str) -> None:
        """Analyze class patterns for duplication."""
        # Check for common class patterns
        if self._is_router_class(node):
            lines = content.split('\n')
            start_line = node.lineno
            end_line = node.end_lineno or start_line
            
            class_code = '\n'.join(lines[start_line-1:end_line])
            
            pattern = CodePattern(
                pattern_type="router_class",
                file_path=str(file_path.relative_to(self.project_root)),
                line_number=start_line,
                code_snippet=class_code,
                hash=self._calculate_pattern_hash(class_code),
                complexity=self._calculate_complexity(class_code),
                dependencies=self._extract_dependencies(class_code)
            )
            self.patterns.append(pattern)
    
    def _analyze_import_pattern(self, node: ast.Import | ast.ImportFrom, file_path: Path) -> None:
        """Analyze import patterns for consistency."""
        # Check for common import patterns
        if isinstance(node, ast.ImportFrom):
            if node.module and 'fastapi' in node.module:
                pattern = CodePattern(
                    pattern_type="fastapi_import",
                    file_path=str(file_path.relative_to(self.project_root)),
                    line_number=node.lineno,
                    code_snippet=ast.unparse(node),
                    hash=self._calculate_pattern_hash(ast.unparse(node)),
                    complexity=1,
                    dependencies=[]
                )
                self.patterns.append(pattern)
    
    def _is_error_handler_function(self, node: ast.FunctionDef, code: str) -> bool:
        """Check if function is an error handler."""
        error_keywords = ['error', 'exception', 'handle', 'catch', 'try']
        return any(keyword in node.name.lower() for keyword in error_keywords) or \
               'except' in code or 'raise' in code
    
    def _is_health_check_function(self, node: ast.FunctionDef, code: str) -> bool:
        """Check if function is a health check."""
        health_keywords = ['health', 'status', 'check', 'ping']
        return any(keyword in node.name.lower() for keyword in health_keywords) or \
               'healthy' in code or 'status' in code
    
    def _is_config_function(self, node: ast.FunctionDef, code: str) -> bool:
        """Check if function is configuration-related."""
        config_keywords = ['config', 'setting', 'env', 'getenv']
        return any(keyword in node.name.lower() for keyword in config_keywords) or \
               'os.getenv' in code or 'config' in code
    
    def _is_router_class(self, node: ast.ClassDef) -> bool:
        """Check if class is a router."""
        router_keywords = ['router', 'api', 'endpoint', 'service']
        return any(keyword in node.name.lower() for keyword in router_keywords)
    
    def _extract_code_snippet(self, content: str, start: int, end: int) -> str:
        """Extract code snippet with context."""
        lines = content.split('\n')
        start_line = content[:start].count('\n')
        end_line = content[:end].count('\n')
        
        # Include some context lines
        context_start = max(0, start_line - 2)
        context_end = min(len(lines), end_line + 3)
        
        return '\n'.join(lines[context_start:context_end])
    
    def _calculate_pattern_hash(self, code: str) -> str:
        """Calculate hash for code pattern."""
        # Normalize code for comparison
        normalized = re.sub(r'\s+', ' ', code.strip())
        normalized = re.sub(r'"[^"]*"', '"..."', normalized)  # Replace strings
        normalized = re.sub(r"'[^']*'", "'...'", normalized)  # Replace strings
        normalized = re.sub(r'\b\w+\b', lambda m: m.group() if m.group() in ['def', 'class', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from'] else 'VAR', normalized)
        
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def _calculate_complexity(self, code: str) -> int:
        """Calculate cyclomatic complexity."""
        complexity = 1  # Base complexity
        
        # Count decision points
        complexity += len(re.findall(r'\bif\b', code))
        complexity += len(re.findall(r'\bfor\b', code))
        complexity += len(re.findall(r'\bwhile\b', code))
        complexity += len(re.findall(r'\btry\b', code))
        complexity += len(re.findall(r'\bexcept\b', code))
        complexity += len(re.findall(r'\band\b', code))
        complexity += len(re.findall(r'\bor\b', code))
        
        return complexity
    
    def _extract_dependencies(self, code: str) -> List[str]:
        """Extract dependencies from code."""
        dependencies = []
        
        # Find import statements
        import_matches = re.findall(r'from\s+(\S+)\s+import|import\s+(\S+)', code)
        for match in import_matches:
            dep = match[0] or match[1]
            if dep and not dep.startswith('.'):
                dependencies.append(dep.split('.')[0])
        
        return list(set(dependencies))
    
    def _group_duplicate_patterns(self) -> None:
        """Group similar patterns into duplication groups."""
        pattern_groups = defaultdict(list)
        
        # Group patterns by hash
        for pattern in self.patterns:
            pattern_groups[pattern.hash].append(pattern)
        
        # Create duplication groups
        for pattern_hash, patterns in pattern_groups.items():
            if len(patterns) > 1:  # Only groups with duplicates
                group = DuplicationGroup(
                    pattern_hash=pattern_hash,
                    pattern_type=patterns[0].pattern_type,
                    occurrences=patterns,
                    similarity_score=self._calculate_similarity_score(patterns),
                    refactoring_suggestion=self._generate_refactoring_suggestion(patterns[0]),
                    estimated_effort=self._estimate_refactoring_effort(patterns)
                )
                self.duplication_groups.append(group)
    
    def _calculate_similarity_score(self, patterns: List[CodePattern]) -> float:
        """Calculate similarity score for a group of patterns."""
        if len(patterns) < 2:
            return 1.0
        
        # Calculate average complexity similarity
        complexities = [p.complexity for p in patterns]
        avg_complexity = sum(complexities) / len(complexities)
        complexity_variance = sum((c - avg_complexity) ** 2 for c in complexities) / len(complexities)
        complexity_similarity = 1.0 / (1.0 + complexity_variance)
        
        # Calculate dependency similarity
        all_deps = set()
        for pattern in patterns:
            all_deps.update(pattern.dependencies)
        
        if not all_deps:
            dep_similarity = 1.0
        else:
            common_deps = set(patterns[0].dependencies)
            for pattern in patterns[1:]:
                common_deps &= set(pattern.dependencies)
            dep_similarity = len(common_deps) / len(all_deps)
        
        return (complexity_similarity + dep_similarity) / 2.0
    
    def _generate_refactoring_suggestion(self, pattern: CodePattern) -> str:
        """Generate refactoring suggestion for a pattern."""
        suggestions = {
            "error_handling": "Create centralized error handler using ServiceErrorHandler",
            "health_checks": "Implement standardized health checks using HealthCheckManager",
            "configuration": "Use ServiceConfigManager for centralized configuration",
            "logging": "Use get_service_logger() for consistent logging",
            "api_endpoints": "Inherit from BaseServiceRouter for consistent API patterns",
            "service_initialization": "Use EnhancedServiceRegistry for service lifecycle management",
            "error_handler_function": "Extract to centralized error handling system",
            "health_check_function": "Standardize using health check framework",
            "config_function": "Move to centralized configuration management",
            "router_class": "Inherit from BaseServiceRouter and use mixins",
            "fastapi_import": "Ensure consistent FastAPI import patterns"
        }
        
        return suggestions.get(pattern.pattern_type, "Consider extracting to reusable component")
    
    def _estimate_refactoring_effort(self, patterns: List[CodePattern]) -> str:
        """Estimate refactoring effort."""
        total_complexity = sum(p.complexity for p in patterns)
        num_patterns = len(patterns)
        
        if total_complexity < 10:
            return "Low (1-2 hours)"
        elif total_complexity < 25:
            return "Medium (3-5 hours)"
        elif total_complexity < 50:
            return "High (6-10 hours)"
        else:
            return "Very High (10+ hours)"
    
    def _calculate_metrics(self, python_files: List[Path]) -> RefactoringMetrics:
        """Calculate comprehensive refactoring metrics."""
        total_files = len(python_files)
        total_lines = 0
        duplicated_lines = 0
        
        # Count total lines
        for file_path in python_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    total_lines += len(f.readlines())
            except:
                pass
        
        # Count duplicated lines
        for group in self.duplication_groups:
            for pattern in group.occurrences:
                duplicated_lines += len(pattern.code_snippet.split('\n'))
        
        duplication_percentage = (duplicated_lines / total_lines * 100) if total_lines > 0 else 0
        
        # Calculate complexity score
        total_complexity = sum(p.complexity for p in self.patterns)
        avg_complexity = total_complexity / len(self.patterns) if self.patterns else 0
        complexity_score = min(avg_complexity / 10.0, 1.0)  # Normalize to 0-1
        
        # Calculate maintainability index
        maintainability_index = max(0, 1.0 - (duplication_percentage / 100) - complexity_score)
        
        # Count refactoring opportunities
        refactoring_opportunities = len(self.duplication_groups)
        
        # Estimate total effort
        estimated_effort_hours = 0
        for group in self.duplication_groups:
            effort = group.estimated_effort
            if "1-2" in effort:
                estimated_effort_hours += 1.5
            elif "3-5" in effort:
                estimated_effort_hours += 4
            elif "6-10" in effort:
                estimated_effort_hours += 8
            else:
                estimated_effort_hours += 12
        
        # Calculate overall quality score
        quality_score = (maintainability_index * 0.4 + 
                        (1.0 - complexity_score) * 0.3 + 
                        (1.0 - duplication_percentage / 100) * 0.3)
        
        return RefactoringMetrics(
            total_files=total_files,
            total_lines=total_lines,
            duplicated_lines=duplicated_lines,
            duplication_percentage=duplication_percentage,
            pattern_groups=len(self.duplication_groups),
            complexity_score=complexity_score,
            maintainability_index=maintainability_index,
            refactoring_opportunities=refactoring_opportunities,
            estimated_effort_hours=estimated_effort_hours,
            quality_score=quality_score
        )
    
    def generate_report(self, output_file: str = "refactoring_report.json") -> None:
        """Generate comprehensive refactoring report."""
        if not self.metrics:
            self.analyze_codebase()
        
        report = {
            "timestamp": time.time(),
            "project_root": str(self.project_root),
            "metrics": asdict(self.metrics),
            "duplication_groups": [asdict(group) for group in self.duplication_groups],
            "summary": {
                "total_patterns": len(self.patterns),
                "duplication_groups": len(self.duplication_groups),
                "quality_score": self.metrics.quality_score,
                "maintainability_index": self.metrics.maintainability_index,
                "estimated_effort_hours": self.metrics.estimated_effort_hours
            }
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Refactoring report generated: {output_file}")
    
    def print_summary(self) -> None:
        """Print summary of refactoring analysis."""
        if not self.metrics:
            self.analyze_codebase()
        
        print("\n" + "="*60)
        print("🦊 REFACTORING ANALYSIS SUMMARY")
        print("="*60)
        print(f"📁 Total Files: {self.metrics.total_files}")
        print(f"📝 Total Lines: {self.metrics.total_lines:,}")
        print(f"🔄 Duplicated Lines: {self.metrics.duplicated_lines:,}")
        print(f"📊 Duplication Percentage: {self.metrics.duplication_percentage:.1f}%")
        print(f"🎯 Pattern Groups: {self.metrics.pattern_groups}")
        print(f"⚡ Complexity Score: {self.metrics.complexity_score:.2f}")
        print(f"🛠️ Maintainability Index: {self.metrics.maintainability_index:.2f}")
        print(f"💡 Refactoring Opportunities: {self.metrics.refactoring_opportunities}")
        print(f"⏱️ Estimated Effort: {self.metrics.estimated_effort_hours:.1f} hours")
        print(f"⭐ Quality Score: {self.metrics.quality_score:.2f}")
        print("="*60)
        
        if self.metrics.quality_score >= 0.8:
            print("🎉 Excellent code quality! Minimal refactoring needed.")
        elif self.metrics.quality_score >= 0.6:
            print("✅ Good code quality. Some refactoring opportunities exist.")
        elif self.metrics.quality_score >= 0.4:
            print("⚠️ Moderate code quality. Significant refactoring recommended.")
        else:
            print("🚨 Poor code quality. Extensive refactoring required.")
        
        print("\n🔍 TOP REFACTORING OPPORTUNITIES:")
        for i, group in enumerate(self.duplication_groups[:5], 1):
            print(f"{i}. {group.pattern_type.upper()}")
            print(f"   Files: {len(group.occurrences)}")
            print(f"   Suggestion: {group.refactoring_suggestion}")
            print(f"   Effort: {group.estimated_effort}")
            print()


def main():
    """Main function for running refactoring detection."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Automated Refactoring Detection Tool")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    parser.add_argument("--output", default="refactoring_report.json", help="Output report file")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    detector = RefactoringDetector(args.project_root)
    
    print("🦊 Starting automated refactoring detection...")
    print(f"📁 Project root: {args.project_root}")
    
    # Analyze codebase
    metrics = detector.analyze_codebase()
    
    # Print summary
    detector.print_summary()
    
    # Generate report
    detector.generate_report(args.output)
    
    print(f"\n✅ Analysis complete! Report saved to {args.output}")


if __name__ == "__main__":
    main()
