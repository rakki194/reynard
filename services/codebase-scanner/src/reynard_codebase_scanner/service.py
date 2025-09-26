"""
Codebase Scanner Service

Main service class that orchestrates comprehensive codebase analysis,
metrics collection, and integration features.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from .analysis_engine import CodebaseAnalysisEngine
from .integration_features import ExportManager, MCPIntegration, RealTimeMonitor
from .metrics_insights import CodebaseMetricsInsights

logger = logging.getLogger(__name__)


class CodebaseScannerService:
    """Main service for comprehensive codebase analysis and monitoring."""

    def __init__(self, root_path: str) -> None:
        """Initialize the codebase scanner service."""
        self.root_path = Path(root_path).resolve()

        # Initialize components
        self.analysis_engine = CodebaseAnalysisEngine(str(self.root_path))
        self.metrics_insights = CodebaseMetricsInsights(str(self.root_path))
        self.real_time_monitor = RealTimeMonitor(str(self.root_path))
        self.export_manager = ExportManager()
        self.mcp_integration = MCPIntegration()

        # Service state
        self.is_available = True
        self.last_analysis: Optional[Dict[str, Any]] = None
        self.analysis_cache: Dict[str, Any] = {}

    def analyze_codebase(
        self,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
        max_depth: Optional[int] = None,
        include_complexity: bool = True,
        include_security: bool = True,
        include_performance: bool = True,
        include_dependencies: bool = True,
    ) -> Dict[str, Any]:
        """
        Perform comprehensive codebase analysis.

        Args:
            include_patterns: List of glob patterns to include
            exclude_patterns: List of glob patterns to exclude
            max_depth: Maximum directory depth to search
            include_complexity: Whether to include complexity analysis
            include_security: Whether to include security scanning
            include_performance: Whether to include performance analysis
            include_dependencies: Whether to include dependency analysis

        Returns:
            Dictionary with comprehensive analysis results
        """
        logger.info(f"Starting comprehensive codebase analysis for {self.root_path}")

        try:
            # Basic codebase analysis
            analysis_results = self.analysis_engine.analyze_codebase(
                include_patterns, exclude_patterns, max_depth
            )

            file_analyses = analysis_results.get('file_analyses', [])
            file_paths = [
                Path(self.root_path, analysis['file_path'])
                for analysis in file_analyses
            ]

            # Complexity analysis
            if include_complexity:
                logger.info("Performing complexity analysis...")
                complexity_results = self.metrics_insights.analyze_code_complexity(
                    file_paths
                )
                analysis_results['complexity_analysis'] = complexity_results

            # Dependency graph generation
            if include_dependencies:
                logger.info("Generating dependency graph...")
                dependency_graph = self.metrics_insights.generate_dependency_graph(
                    file_analyses
                )
                analysis_results['dependency_graph'] = dependency_graph

            # Security vulnerability scanning
            if include_security:
                logger.info("Performing security scan...")
                security_results = self.metrics_insights.scan_security_vulnerabilities(
                    file_paths
                )
                analysis_results['security_scan'] = security_results

            # Performance bottleneck detection
            if include_performance:
                logger.info("Detecting performance bottlenecks...")
                performance_results = (
                    self.metrics_insights.detect_performance_bottlenecks(file_analyses)
                )
                analysis_results['performance_analysis'] = performance_results

            # Generate insights report
            logger.info("Generating insights report...")
            insights = self.metrics_insights.generate_insights_report(
                analysis_results.get('complexity_analysis', {}),
                analysis_results.get('dependency_graph', {}),
                analysis_results.get('security_scan', {}),
                analysis_results.get('performance_analysis', {}),
            )
            analysis_results['insights'] = insights

            # Cache results
            self.last_analysis = analysis_results
            cache_key = f"{include_patterns}_{exclude_patterns}_{max_depth}"
            self.analysis_cache[cache_key] = analysis_results

            logger.info("Codebase analysis completed successfully")
            return analysis_results

        except Exception as e:
            logger.error(f"Error during codebase analysis: {e}")
            return {
                'error': str(e),
                'metadata': {
                    'root_path': str(self.root_path),
                    'analysis_failed': True,
                },
            }

    def start_monitoring(
        self,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
    ) -> bool:
        """
        Start real-time codebase monitoring.

        Args:
            include_patterns: List of glob patterns to include
            exclude_patterns: List of glob patterns to exclude

        Returns:
            True if monitoring started successfully
        """
        logger.info("Starting real-time codebase monitoring")

        # Add callback for change events
        def on_change(file_path: str, change_type: str) -> None:
            logger.info(f"File {change_type}: {file_path}")
            # Trigger re-analysis or update cache as needed
            self._handle_file_change(file_path, change_type)

        self.real_time_monitor.add_change_callback(on_change)

        return self.real_time_monitor.start_monitoring(
            include_patterns, exclude_patterns
        )

    def stop_monitoring(self) -> None:
        """Stop real-time codebase monitoring."""
        logger.info("Stopping real-time codebase monitoring")
        self.real_time_monitor.stop_monitoring()

    def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status."""
        return self.real_time_monitor.get_monitoring_status()

    def get_change_history(
        self, limit: Optional[int] = None, since: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get file change history.

        Args:
            limit: Maximum number of changes to return
            since: ISO timestamp to filter changes since

        Returns:
            List of change records
        """
        from datetime import datetime

        since_dt = None
        if since:
            try:
                since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            except ValueError:
                logger.warning(f"Invalid timestamp format: {since}")

        return self.real_time_monitor.get_change_history(limit, since_dt)

    def export_analysis(
        self,
        analysis_data: Optional[Dict[str, Any]] = None,
        output_path: str = "analysis_export",
        format: str = "json",
    ) -> Dict[str, Any]:
        """
        Export analysis results to various formats.

        Args:
            analysis_data: Analysis data to export (uses last analysis if None)
            output_path: Output file path (without extension)
            format: Export format (json, csv, yaml, html, xml)

        Returns:
            Dictionary with export results
        """
        if analysis_data is None:
            analysis_data = self.last_analysis

        if not analysis_data:
            return {'error': 'No analysis data available to export'}

        if format not in self.export_manager.supported_formats:
            return {
                'error': f'Unsupported format: {format}. Supported: {self.export_manager.supported_formats}'
            }

        try:
            # Add file extension
            output_file = f"{output_path}.{format}"

            # Export based on format
            if format == 'json':
                success = self.export_manager.export_to_json(analysis_data, output_file)
            elif format == 'csv':
                success = self.export_manager.export_to_csv(analysis_data, output_file)
            elif format == 'yaml':
                success = self.export_manager.export_to_yaml(analysis_data, output_file)
            elif format == 'html':
                success = self.export_manager.export_to_html(analysis_data, output_file)
            elif format == 'xml':
                success = self.export_manager.export_to_xml(analysis_data, output_file)
            else:
                return {'error': f'Export format {format} not implemented'}

            if success:
                return {
                    'success': True,
                    'output_path': output_file,
                    'format': format,
                    'size_bytes': (
                        Path(output_file).stat().st_size
                        if Path(output_file).exists()
                        else 0
                    ),
                }
            else:
                return {'error': f'Failed to export to {format}'}

        except Exception as e:
            logger.error(f"Export error: {e}")
            return {'error': str(e)}

    def get_analysis_summary(self) -> Dict[str, Any]:
        """Get summary of the last analysis."""
        if not self.last_analysis:
            return {'error': 'No analysis data available'}

        metadata = self.last_analysis.get('metadata', {})
        insights = self.last_analysis.get('insights', {})

        return {
            'metadata': metadata,
            'insights_summary': insights.get('summary', {}),
            'recommendations_count': len(insights.get('recommendations', [])),
            'analysis_timestamp': metadata.get('analysis_timestamp'),
            'total_files': metadata.get('total_files', 0),
            'total_lines': metadata.get('total_lines', 0),
        }

    def get_service_info(self) -> Dict[str, Any]:
        """Get comprehensive service information."""
        return {
            'service_name': 'Codebase Scanner Service',
            'version': '1.0.0',
            'root_path': str(self.root_path),
            'is_available': self.is_available,
            'components': {
                'analysis_engine': {
                    'available': self.analysis_engine.tree_sitter_available,
                    'supported_languages': list(
                        self.analysis_engine.supported_extensions.values()
                    ),
                },
                'metrics_insights': {
                    'networkx_available': self.metrics_insights.networkx_available,
                    'radon_available': self.metrics_insights.radon_available,
                    'lizard_available': self.metrics_insights.lizard_available,
                    'bandit_available': self.metrics_insights.bandit_available,
                    'safety_available': self.metrics_insights.safety_available,
                },
                'real_time_monitor': {
                    'watchdog_available': self.real_time_monitor.watchdog_available,
                    'is_monitoring': self.real_time_monitor.is_monitoring,
                },
                'export_manager': {
                    'supported_formats': self.export_manager.supported_formats,
                },
                'mcp_integration': {
                    'available_tools': self.mcp_integration.get_available_tools(),
                },
            },
            'cache_info': {
                'cached_analyses': len(self.analysis_cache),
                'last_analysis_available': self.last_analysis is not None,
            },
        }

    def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the service."""
        try:
            # Test basic functionality
            test_files = list(self.root_path.glob('*.py'))[
                :5
            ]  # Test with first 5 Python files

            if test_files:
                # Quick analysis test
                test_analysis = self.analysis_engine.analyze_file(test_files[0])
                analysis_working = 'error' not in test_analysis
            else:
                analysis_working = True  # No Python files to test with

            return {
                'status': 'healthy' if analysis_working else 'degraded',
                'is_available': self.is_available,
                'analysis_working': analysis_working,
                'monitoring_active': self.real_time_monitor.is_monitoring,
                'service_info': self.get_service_info(),
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'is_available': self.is_available,
                'error': str(e),
                'service_info': self.get_service_info(),
            }

    def _handle_file_change(self, file_path: str, change_type: str) -> None:
        """Handle file change events."""
        # Invalidate relevant cache entries
        cache_keys_to_remove = []
        for cache_key in self.analysis_cache.keys():
            # Simple heuristic: if the changed file might affect the analysis
            if any(pattern in cache_key for pattern in ['*', file_path.split('/')[-1]]):
                cache_keys_to_remove.append(cache_key)

        for key in cache_keys_to_remove:
            del self.analysis_cache[key]

        logger.info(
            f"Invalidated {len(cache_keys_to_remove)} cache entries due to {change_type} of {file_path}"
        )

    def clear_cache(self) -> None:
        """Clear analysis cache."""
        self.analysis_cache.clear()
        self.last_analysis = None
        logger.info("Analysis cache cleared")

    def get_cached_analysis(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis by key."""
        return self.analysis_cache.get(cache_key)

    def list_cached_analyses(self) -> List[str]:
        """List all cached analysis keys."""
        return list(self.analysis_cache.keys())
