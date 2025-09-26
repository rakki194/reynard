"""
Codebase Metrics and Insights

Advanced metrics collection including code complexity analysis,
dependency graph generation, security vulnerability scanning,
and performance bottleneck detection.
"""

import json
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    import networkx as nx

    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

try:
    import radon
    from radon.complexity import cc_visit
    from radon.metrics import mi_visit
    from radon.raw import analyze

    RADON_AVAILABLE = True
except ImportError:
    RADON_AVAILABLE = False

try:
    import lizard

    LIZARD_AVAILABLE = True
except ImportError:
    LIZARD_AVAILABLE = False

try:
    import bandit
    from bandit.core import manager

    BANDIT_AVAILABLE = True
except ImportError:
    BANDIT_AVAILABLE = False

try:
    import safety

    SAFETY_AVAILABLE = True
except ImportError:
    SAFETY_AVAILABLE = False

logger = logging.getLogger(__name__)


class CodebaseMetricsInsights:
    """Advanced metrics and insights for codebase analysis."""

    def __init__(self, root_path: str) -> None:
        """Initialize the metrics and insights engine."""
        self.root_path = Path(root_path).resolve()
        self.networkx_available = NETWORKX_AVAILABLE
        self.radon_available = RADON_AVAILABLE
        self.lizard_available = LIZARD_AVAILABLE
        self.bandit_available = BANDIT_AVAILABLE
        self.safety_available = SAFETY_AVAILABLE

    def analyze_code_complexity(self, file_paths: List[Path]) -> Dict[str, Any]:
        """
        Analyze code complexity using multiple tools.

        Args:
            file_paths: List of Python file paths to analyze

        Returns:
            Dictionary with complexity analysis results
        """
        results = {
            'radon_available': self.radon_available,
            'lizard_available': self.lizard_available,
            'files': {},
            'summary': {
                'total_files': 0,
                'high_complexity_files': 0,
                'average_complexity': 0,
                'max_complexity': 0,
            },
        }

        if not self.radon_available and not self.lizard_available:
            results['error'] = 'No complexity analysis tools available'
            return results

        python_files = [f for f in file_paths if f.suffix == '.py']
        results['summary']['total_files'] = len(python_files)

        total_complexity = 0
        max_complexity = 0
        high_complexity_count = 0

        for file_path in python_files:
            file_analysis = {'path': str(file_path.relative_to(self.root_path))}

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Radon analysis
                if self.radon_available:
                    try:
                        # Cyclomatic complexity
                        cc_results = cc_visit(content)
                        file_analysis['radon_cc'] = [
                            {
                                'name': result.name,
                                'complexity': result.complexity,
                                'line': result.lineno,
                                'type': result.type,
                            }
                            for result in cc_results
                        ]

                        # Maintainability index
                        mi_result = mi_visit(content, multi=True)
                        file_analysis['radon_mi'] = mi_result

                        # Raw metrics
                        raw_result = analyze(content)
                        file_analysis['radon_raw'] = {
                            'loc': raw_result.loc,
                            'lloc': raw_result.lloc,
                            'sloc': raw_result.sloc,
                            'comments': raw_result.comments,
                            'multi': raw_result.multi,
                            'blank': raw_result.blank,
                        }

                        # Calculate average complexity for this file
                        if cc_results:
                            avg_complexity = sum(
                                r.complexity for r in cc_results
                            ) / len(cc_results)
                            file_analysis['average_complexity'] = avg_complexity
                            total_complexity += avg_complexity
                            max_complexity = max(
                                max_complexity, max(r.complexity for r in cc_results)
                            )

                            if avg_complexity > 10:  # High complexity threshold
                                high_complexity_count += 1

                    except Exception as e:
                        file_analysis['radon_error'] = str(e)

                # Lizard analysis
                if self.lizard_available:
                    try:
                        lizard_result = lizard.analyze_file(str(file_path))
                        file_analysis['lizard'] = {
                            'nloc': lizard_result.nloc,
                            'complexity': lizard_result.cyclomatic_complexity,
                            'token_count': lizard_result.token_count,
                            'average_parameter_count': lizard_result.average_parameter_count,
                            'functions': [
                                {
                                    'name': func.name,
                                    'complexity': func.cyclomatic_complexity,
                                    'nloc': func.nloc,
                                    'line': func.start_line,
                                    'parameters': func.parameter_count,
                                }
                                for func in lizard_result.function_list
                            ],
                        }
                    except Exception as e:
                        file_analysis['lizard_error'] = str(e)

            except Exception as e:
                file_analysis['error'] = str(e)

            results['files'][str(file_path.relative_to(self.root_path))] = file_analysis

        # Calculate summary statistics
        if python_files:
            results['summary']['average_complexity'] = total_complexity / len(
                python_files
            )
            results['summary']['max_complexity'] = max_complexity
            results['summary']['high_complexity_files'] = high_complexity_count

        return results

    def generate_dependency_graph(
        self, file_analyses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate dependency graph from file analyses.

        Args:
            file_analyses: List of file analysis results

        Returns:
            Dictionary with dependency graph information
        """
        if not self.networkx_available:
            return {'error': 'NetworkX not available for graph generation'}

        # Create directed graph
        G = nx.DiGraph()

        # Add nodes (files)
        for analysis in file_analyses:
            file_path = analysis.get('file_path', '')
            if file_path:
                G.add_node(
                    file_path,
                    **{
                        'language': analysis.get('language', 'unknown'),
                        'line_count': analysis.get('line_count', 0),
                        'function_count': analysis.get('function_count', 0),
                        'class_count': analysis.get('class_count', 0),
                    },
                )

        # Add edges (dependencies)
        for analysis in file_analyses:
            file_path = analysis.get('file_path', '')
            imports = analysis.get('imports', [])

            if file_path and imports:
                for import_name in imports:
                    # Try to find the corresponding file
                    target_file = self._find_import_target(import_name, file_analyses)
                    if target_file and target_file != file_path:
                        G.add_edge(file_path, target_file, import_name=import_name)

        # Calculate graph metrics
        metrics = {
            'nodes': G.number_of_nodes(),
            'edges': G.number_of_edges(),
            'density': nx.density(G) if G.number_of_nodes() > 0 else 0.0,
            'is_connected': (
                nx.is_weakly_connected(G) if G.number_of_nodes() > 0 else True
            ),
            'strongly_connected_components': nx.number_strongly_connected_components(G),
            'weakly_connected_components': nx.number_weakly_connected_components(G),
        }

        # Find most connected nodes
        in_degrees = dict(G.in_degree())
        out_degrees = dict(G.out_degree())

        most_imported = sorted(in_degrees.items(), key=lambda x: x[1], reverse=True)[
            :10
        ]
        most_importing = sorted(out_degrees.items(), key=lambda x: x[1], reverse=True)[
            :10
        ]

        # Find cycles
        try:
            cycles = list(nx.simple_cycles(G))
            metrics['cycles'] = len(cycles)
            metrics['cycle_files'] = [
                cycle for cycle in cycles[:5]
            ]  # Limit to first 5 cycles
        except Exception as e:
            metrics['cycle_error'] = str(e)

        # Convert graph to JSON-serializable format
        graph_data = {
            'nodes': [{'id': node, 'data': data} for node, data in G.nodes(data=True)],
            'edges': [
                {'source': source, 'target': target, 'data': data}
                for source, target, data in G.edges(data=True)
            ],
        }

        return {
            'graph': graph_data,
            'metrics': metrics,
            'most_imported': most_imported,
            'most_importing': most_importing,
            'networkx_available': self.networkx_available,
        }

    def _find_import_target(
        self, import_name: str, file_analyses: List[Dict[str, Any]]
    ) -> Optional[str]:
        """Find the target file for an import."""
        # Simple heuristic: look for files that might contain the imported module
        for analysis in file_analyses:
            file_path = analysis.get('file_path', '')
            if file_path:
                # Check if the file name matches the import
                file_name = Path(file_path).stem
                if file_name == import_name or file_name == import_name.split('.')[-1]:
                    return file_path
        return None

    def scan_security_vulnerabilities(self, file_paths: List[Path]) -> Dict[str, Any]:
        """
        Scan for security vulnerabilities.

        Args:
            file_paths: List of file paths to scan

        Returns:
            Dictionary with security scan results
        """
        results = {
            'bandit_available': self.bandit_available,
            'safety_available': self.safety_available,
            'bandit_results': {},
            'safety_results': {},
        }

        python_files = [f for f in file_paths if f.suffix == '.py']

        # Bandit security scan
        if self.bandit_available and python_files:
            try:
                # Run bandit on Python files
                bandit_manager = manager.BanditManager()
                bandit_manager.discover([str(f) for f in python_files])
                bandit_manager.run_tests()

                results['bandit_results'] = {
                    'issues': len(bandit_manager.get_issue_list()),
                    'high_severity': len(
                        [
                            i
                            for i in bandit_manager.get_issue_list()
                            if i.severity == 'HIGH'
                        ]
                    ),
                    'medium_severity': len(
                        [
                            i
                            for i in bandit_manager.get_issue_list()
                            if i.severity == 'MEDIUM'
                        ]
                    ),
                    'low_severity': len(
                        [
                            i
                            for i in bandit_manager.get_issue_list()
                            if i.severity == 'LOW'
                        ]
                    ),
                    'issues_by_file': {},
                }

                # Group issues by file
                for issue in bandit_manager.get_issue_list():
                    file_path = issue.fname
                    if file_path not in results['bandit_results']['issues_by_file']:
                        results['bandit_results']['issues_by_file'][file_path] = []

                    results['bandit_results']['issues_by_file'][file_path].append(
                        {
                            'test_id': issue.test_id,
                            'severity': issue.severity,
                            'confidence': issue.confidence,
                            'line': issue.lineno,
                            'message': issue.text,
                        }
                    )

            except Exception as e:
                results['bandit_error'] = str(e)

        # Safety scan for known vulnerabilities
        if self.safety_available:
            try:
                # Look for requirements files
                requirements_files = []
                for pattern in [
                    'requirements*.txt',
                    'pyproject.toml',
                    'setup.py',
                    'Pipfile',
                ]:
                    requirements_files.extend(self.root_path.glob(f'**/{pattern}'))

                if requirements_files:
                    # Run safety check
                    with tempfile.NamedTemporaryFile(
                        mode='w', suffix='.txt', delete=False
                    ) as f:
                        # Combine all requirements
                        for req_file in requirements_files:
                            try:
                                with open(req_file, 'r') as rf:
                                    f.write(rf.read())
                                    f.write('\n')
                            except Exception:
                                continue
                        f.flush()

                        # Run safety
                        safety_result = subprocess.run(
                            ['safety', 'check', '-r', f.name, '--json'],
                            capture_output=True,
                            text=True,
                            timeout=30,
                        )

                        if safety_result.returncode == 0:
                            results['safety_results'] = {'vulnerabilities': []}
                        else:
                            try:
                                safety_data = json.loads(safety_result.stdout)
                                results['safety_results'] = safety_data
                            except json.JSONDecodeError:
                                results['safety_results'] = {
                                    'error': 'Failed to parse safety output',
                                    'raw_output': safety_result.stdout,
                                }

                        # Clean up temp file
                        Path(f.name).unlink()

            except Exception as e:
                results['safety_error'] = str(e)

        return results

    def detect_performance_bottlenecks(
        self, file_analyses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Detect potential performance bottlenecks.

        Args:
            file_analyses: List of file analysis results

        Returns:
            Dictionary with performance bottleneck analysis
        """
        results = {
            'large_files': [],
            'complex_functions': [],
            'deep_nesting': [],
            'many_imports': [],
            'potential_issues': [],
        }

        for analysis in file_analyses:
            file_path = analysis.get('file_path', '')
            line_count = analysis.get('line_count', 0)
            function_count = analysis.get('function_count', 0)
            import_count = analysis.get('import_count', 0)

            # Large files (>1000 lines)
            if line_count > 1000:
                results['large_files'].append(
                    {
                        'file': file_path,
                        'lines': line_count,
                        'severity': 'high' if line_count > 2000 else 'medium',
                    }
                )

            # Files with many imports (>50)
            if import_count > 50:
                results['many_imports'].append(
                    {
                        'file': file_path,
                        'imports': import_count,
                        'severity': 'high' if import_count > 100 else 'medium',
                    }
                )

            # Complex functions (from complexity analysis)
            if 'radon_cc' in analysis:
                for func in analysis['radon_cc']:
                    if func['complexity'] > 15:
                        results['complex_functions'].append(
                            {
                                'file': file_path,
                                'function': func['name'],
                                'complexity': func['complexity'],
                                'line': func['line'],
                                'severity': (
                                    'high' if func['complexity'] > 25 else 'medium'
                                ),
                            }
                        )

            # Check for potential performance issues
            if 'ast_node_counts' in analysis:
                node_counts = analysis['ast_node_counts']

                # Many loops
                loop_count = sum(
                    node_counts.get(node_type, 0)
                    for node_type in ['For', 'While', 'AsyncFor', 'AsyncWith']
                )
                if loop_count > 10:
                    results['potential_issues'].append(
                        {
                            'file': file_path,
                            'issue': 'Many loops',
                            'count': loop_count,
                            'severity': 'medium',
                        }
                    )

                # Deep nesting (many nested structures)
                nested_count = sum(
                    node_counts.get(node_type, 0)
                    for node_type in [
                        'If',
                        'For',
                        'While',
                        'With',
                        'Try',
                        'ClassDef',
                        'FunctionDef',
                    ]
                )
                if nested_count > 50:
                    results['potential_issues'].append(
                        {
                            'file': file_path,
                            'issue': 'Deep nesting',
                            'count': nested_count,
                            'severity': 'medium',
                        }
                    )

        # Sort by severity and count
        for key in [
            'large_files',
            'complex_functions',
            'many_imports',
            'potential_issues',
        ]:
            results[key].sort(
                key=lambda x: (
                    x['severity'] == 'high',
                    x.get('count', x.get('lines', x.get('complexity', 0))),
                ),
                reverse=True,
            )

        return results

    def generate_insights_report(
        self,
        complexity_analysis: Dict[str, Any],
        dependency_graph: Dict[str, Any],
        security_scan: Dict[str, Any],
        performance_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate comprehensive insights report.

        Args:
            complexity_analysis: Code complexity analysis results
            dependency_graph: Dependency graph analysis results
            security_scan: Security vulnerability scan results
            performance_analysis: Performance bottleneck analysis results

        Returns:
            Dictionary with comprehensive insights report
        """
        insights = {
            'summary': {
                'total_issues': 0,
                'high_priority_issues': 0,
                'medium_priority_issues': 0,
                'low_priority_issues': 0,
            },
            'recommendations': [],
            'metrics': {},
            'trends': {},
        }

        # Count issues
        if 'summary' in complexity_analysis:
            high_complexity = complexity_analysis['summary'].get(
                'high_complexity_files', 0
            )
            insights['summary']['high_priority_issues'] += high_complexity
            insights['summary']['total_issues'] += high_complexity

        if 'bandit_results' in security_scan:
            bandit = security_scan['bandit_results']
            high_sev = bandit.get('high_severity', 0)
            med_sev = bandit.get('medium_severity', 0)
            low_sev = bandit.get('low_severity', 0)

            insights['summary']['high_priority_issues'] += high_sev
            insights['summary']['medium_priority_issues'] += med_sev
            insights['summary']['low_priority_issues'] += low_sev
            insights['summary']['total_issues'] += high_sev + med_sev + low_sev

        # Performance issues
        for category in ['large_files', 'complex_functions', 'many_imports']:
            for issue in performance_analysis.get(category, []):
                if issue['severity'] == 'high':
                    insights['summary']['high_priority_issues'] += 1
                else:
                    insights['summary']['medium_priority_issues'] += 1
                insights['summary']['total_issues'] += 1

        # Generate recommendations
        if insights['summary']['high_priority_issues'] > 0:
            insights['recommendations'].append(
                {
                    'priority': 'high',
                    'category': 'security',
                    'message': f"Address {insights['summary']['high_priority_issues']} high-priority security issues",
                    'action': 'Review and fix security vulnerabilities identified by Bandit',
                }
            )

        if complexity_analysis.get('summary', {}).get('high_complexity_files', 0) > 0:
            insights['recommendations'].append(
                {
                    'priority': 'high',
                    'category': 'complexity',
                    'message': f"Refactor {complexity_analysis['summary']['high_complexity_files']} high-complexity files",
                    'action': 'Break down complex functions and classes into smaller, more manageable pieces',
                }
            )

        if performance_analysis.get('large_files'):
            insights['recommendations'].append(
                {
                    'priority': 'medium',
                    'category': 'maintainability',
                    'message': f"Consider splitting {len(performance_analysis['large_files'])} large files",
                    'action': 'Break large files into smaller modules for better maintainability',
                }
            )

        # Dependency recommendations
        if 'metrics' in dependency_graph:
            metrics = dependency_graph['metrics']
            if metrics.get('cycles', 0) > 0:
                insights['recommendations'].append(
                    {
                        'priority': 'high',
                        'category': 'architecture',
                        'message': f"Resolve {metrics['cycles']} circular dependencies",
                        'action': 'Refactor code to eliminate circular imports',
                    }
                )

        return insights
