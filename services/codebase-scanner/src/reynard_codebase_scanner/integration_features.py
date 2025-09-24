"""
Integration Features

Real-time codebase monitoring, change detection, MCP integration,
and export functionality for the codebase scanner service.
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Set

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent, FileDeletedEvent
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    Observer = None  # type: ignore
    FileSystemEventHandler = None  # type: ignore

logger = logging.getLogger(__name__)


class CodebaseChangeHandler(FileSystemEventHandler):
    """Handler for file system change events."""

    def __init__(self, callback: Callable[[str, str], None]) -> None:
        """Initialize the change handler."""
        super().__init__()
        self.callback = callback
        self.last_modified: Dict[str, float] = {}
        self.debounce_time = 1.0  # 1 second debounce

    def on_modified(self, event: FileModifiedEvent) -> None:
        """Handle file modification events."""
        if not event.is_directory:
            self._handle_change(event.src_path, 'modified')

    def on_created(self, event: FileCreatedEvent) -> None:
        """Handle file creation events."""
        if not event.is_directory:
            self._handle_change(event.src_path, 'created')

    def on_deleted(self, event: FileDeletedEvent) -> None:
        """Handle file deletion events."""
        if not event.is_directory:
            self._handle_change(event.src_path, 'deleted')

    def _handle_change(self, file_path: str, change_type: str) -> None:
        """Handle file changes with debouncing."""
        current_time = time.time()
        last_time = self.last_modified.get(file_path, 0)
        
        # Debounce rapid changes
        if current_time - last_time < self.debounce_time:
            return
        
        self.last_modified[file_path] = current_time
        self.callback(file_path, change_type)


class RealTimeMonitor:
    """Real-time codebase monitoring with change detection."""

    def __init__(self, root_path: str) -> None:
        """Initialize the real-time monitor."""
        self.root_path = Path(root_path).resolve()
        self.watchdog_available = WATCHDOG_AVAILABLE
        self.observer: Optional[Observer] = None
        self.change_callbacks: List[Callable[[str, str], None]] = []
        self.is_monitoring = False
        self.change_history: List[Dict[str, Any]] = []

    def add_change_callback(self, callback: Callable[[str, str], None]) -> None:
        """Add a callback for file change events."""
        self.change_callbacks.append(callback)

    def remove_change_callback(self, callback: Callable[[str, str], None]) -> None:
        """Remove a change callback."""
        if callback in self.change_callbacks:
            self.change_callbacks.remove(callback)

    def _handle_change(self, file_path: str, change_type: str) -> None:
        """Handle file changes and notify callbacks."""
        # Record change in history
        change_record = {
            'timestamp': datetime.now().isoformat(),
            'file_path': file_path,
            'change_type': change_type,
            'relative_path': str(Path(file_path).relative_to(self.root_path)),
        }
        self.change_history.append(change_record)
        
        # Keep only last 1000 changes
        if len(self.change_history) > 1000:
            self.change_history = self.change_history[-1000:]
        
        # Notify callbacks
        for callback in self.change_callbacks:
            try:
                callback(file_path, change_type)
            except Exception as e:
                logger.error(f"Error in change callback: {e}")

    def start_monitoring(self, 
                        include_patterns: Optional[List[str]] = None,
                        exclude_patterns: Optional[List[str]] = None) -> bool:
        """
        Start real-time monitoring.

        Args:
            include_patterns: List of glob patterns to include
            exclude_patterns: List of glob patterns to exclude

        Returns:
            True if monitoring started successfully
        """
        if not self.watchdog_available:
            logger.error("Watchdog not available for real-time monitoring")
            return False
        
        if self.is_monitoring:
            logger.warning("Monitoring is already active")
            return True
        
        try:
            self.observer = Observer()
            handler = CodebaseChangeHandler(self._handle_change)
            
            # Add watch for root directory
            self.observer.schedule(handler, str(self.root_path), recursive=True)
            
            # Start observer
            self.observer.start()
            self.is_monitoring = True
            
            logger.info(f"Started real-time monitoring for {self.root_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}")
            return False

    def stop_monitoring(self) -> None:
        """Stop real-time monitoring."""
        if self.observer and self.is_monitoring:
            self.observer.stop()
            self.observer.join()
            self.is_monitoring = False
            logger.info("Stopped real-time monitoring")

    def get_change_history(self, 
                          limit: Optional[int] = None,
                          since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Get change history.

        Args:
            limit: Maximum number of changes to return
            since: Only return changes since this timestamp

        Returns:
            List of change records
        """
        history = self.change_history
        
        if since:
            since_iso = since.isoformat()
            history = [change for change in history if change['timestamp'] >= since_iso]
        
        if limit:
            history = history[-limit:]
        
        return history

    def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status."""
        return {
            'is_monitoring': self.is_monitoring,
            'watchdog_available': self.watchdog_available,
            'root_path': str(self.root_path),
            'change_callbacks_count': len(self.change_callbacks),
            'change_history_count': len(self.change_history),
        }


class ExportManager:
    """Manager for exporting analysis results to various formats."""

    def __init__(self) -> None:
        """Initialize the export manager."""
        self.supported_formats = ['json', 'csv', 'yaml', 'html', 'xml']

    def export_to_json(self, data: Dict[str, Any], output_path: str) -> bool:
        """Export data to JSON format."""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
            return True
        except Exception as e:
            logger.error(f"Failed to export to JSON: {e}")
            return False

    def export_to_csv(self, data: Dict[str, Any], output_path: str) -> bool:
        """Export data to CSV format."""
        try:
            import csv
            
            # Flatten data for CSV export
            flattened_data = self._flatten_data(data)
            
            if not flattened_data:
                return False
            
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=flattened_data[0].keys())
                writer.writeheader()
                writer.writerows(flattened_data)
            
            return True
        except Exception as e:
            logger.error(f"Failed to export to CSV: {e}")
            return False

    def export_to_yaml(self, data: Dict[str, Any], output_path: str) -> bool:
        """Export data to YAML format."""
        try:
            import yaml
            
            with open(output_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
            return True
        except Exception as e:
            logger.error(f"Failed to export to YAML: {e}")
            return False

    def export_to_html(self, data: Dict[str, Any], output_path: str) -> bool:
        """Export data to HTML format."""
        try:
            html_content = self._generate_html_report(data)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            return True
        except Exception as e:
            logger.error(f"Failed to export to HTML: {e}")
            return False

    def export_to_xml(self, data: Dict[str, Any], output_path: str) -> bool:
        """Export data to XML format."""
        try:
            import xml.etree.ElementTree as ET
            
            root = ET.Element('codebase_analysis')
            self._dict_to_xml(data, root)
            
            tree = ET.ElementTree(root)
            tree.write(output_path, encoding='utf-8', xml_declaration=True)
            return True
        except Exception as e:
            logger.error(f"Failed to export to XML: {e}")
            return False

    def _flatten_data(self, data: Dict[str, Any], parent_key: str = '', sep: str = '_') -> List[Dict[str, Any]]:
        """Flatten nested dictionary for CSV export."""
        items = []
        
        for key, value in data.items():
            new_key = f"{parent_key}{sep}{key}" if parent_key else key
            
            if isinstance(value, dict):
                items.extend(self._flatten_data(value, new_key, sep))
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        items.extend(self._flatten_data(item, f"{new_key}_{i}", sep))
                    else:
                        items.append({new_key: item})
            else:
                items.append({new_key: value})
        
        return items

    def _generate_html_report(self, data: Dict[str, Any]) -> str:
        """Generate HTML report from analysis data."""
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Analysis Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #f0f0f0; padding: 20px; border-radius: 5px; }}
        .section {{ margin: 20px 0; }}
        .metric {{ display: inline-block; margin: 10px; padding: 10px; background-color: #e8f4f8; border-radius: 3px; }}
        .issue {{ padding: 10px; margin: 5px 0; border-left: 4px solid #ff6b6b; background-color: #fff5f5; }}
        .warning {{ border-left-color: #ffa726; background-color: #fff8e1; }}
        .info {{ border-left-color: #42a5f5; background-color: #e3f2fd; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        pre {{ background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Codebase Analysis Report</h1>
        <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
"""
        
        # Add metadata section
        if 'metadata' in data:
            metadata = data['metadata']
            html += f"""
    <div class="section">
        <h2>Project Overview</h2>
        <div class="metric">Total Files: {metadata.get('total_files', 0)}</div>
        <div class="metric">Total Lines: {metadata.get('total_lines', 0)}</div>
        <div class="metric">Total Size: {metadata.get('total_size_bytes', 0)} bytes</div>
    </div>
"""
        
        # Add language statistics
        if 'language_statistics' in data:
            html += """
    <div class="section">
        <h2>Language Statistics</h2>
        <table>
            <tr><th>Language</th><th>Files</th><th>Lines</th><th>Size (bytes)</th></tr>
"""
            for lang, stats in data['language_statistics'].items():
                html += f"""
            <tr>
                <td>{lang}</td>
                <td>{stats.get('file_count', 0)}</td>
                <td>{stats.get('total_lines', 0)}</td>
                <td>{stats.get('total_size', 0)}</td>
            </tr>
"""
            html += "        </table>\n    </div>\n"
        
        # Add insights if available
        if 'insights' in data:
            insights = data['insights']
            html += """
    <div class="section">
        <h2>Insights & Recommendations</h2>
"""
            if 'summary' in insights:
                summary = insights['summary']
                html += f"""
        <div class="metric">Total Issues: {summary.get('total_issues', 0)}</div>
        <div class="metric">High Priority: {summary.get('high_priority_issues', 0)}</div>
        <div class="metric">Medium Priority: {summary.get('medium_priority_issues', 0)}</div>
        <div class="metric">Low Priority: {summary.get('low_priority_issues', 0)}</div>
"""
            
            if 'recommendations' in insights:
                html += "<h3>Recommendations</h3>\n"
                for rec in insights['recommendations']:
                    priority_class = rec.get('priority', 'info')
                    html += f"""
        <div class="issue {priority_class}">
            <strong>{rec.get('category', 'General').title()}</strong>: {rec.get('message', '')}
            <br><em>Action: {rec.get('action', '')}</em>
        </div>
"""
            html += "    </div>\n"
        
        html += """
</body>
</html>
"""
        return html

    def _dict_to_xml(self, data: Dict[str, Any], parent: Any) -> None:
        """Convert dictionary to XML elements."""
        for key, value in data.items():
            # Clean key name for XML
            clean_key = key.replace(' ', '_').replace('-', '_')
            
            if isinstance(value, dict):
                child = parent.makeelement(clean_key)
                self._dict_to_xml(value, child)
                parent.append(child)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        child = parent.makeelement(clean_key)
                        self._dict_to_xml(item, child)
                        parent.append(child)
                    else:
                        child = parent.makeelement(clean_key)
                        child.text = str(item)
                        parent.append(child)
            else:
                child = parent.makeelement(clean_key)
                child.text = str(value)
                parent.append(child)


class MCPIntegration:
    """Integration with MCP (Model Context Protocol) tools."""

    def __init__(self) -> None:
        """Initialize MCP integration."""
        self.available_tools: Set[str] = set()
        self.tool_callbacks: Dict[str, Callable] = {}

    def register_tool(self, tool_name: str, callback: Callable) -> None:
        """Register an MCP tool."""
        self.available_tools.add(tool_name)
        self.tool_callbacks[tool_name] = callback
        logger.info(f"Registered MCP tool: {tool_name}")

    def unregister_tool(self, tool_name: str) -> None:
        """Unregister an MCP tool."""
        if tool_name in self.available_tools:
            self.available_tools.remove(tool_name)
            if tool_name in self.tool_callbacks:
                del self.tool_callbacks[tool_name]
            logger.info(f"Unregistered MCP tool: {tool_name}")

    def call_tool(self, tool_name: str, *args, **kwargs) -> Any:
        """Call an MCP tool."""
        if tool_name not in self.available_tools:
            raise ValueError(f"Tool {tool_name} not available")
        
        callback = self.tool_callbacks.get(tool_name)
        if not callback:
            raise ValueError(f"No callback registered for tool {tool_name}")
        
        try:
            return callback(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name}: {e}")
            raise

    def get_available_tools(self) -> List[str]:
        """Get list of available MCP tools."""
        return list(self.available_tools)

    def get_tool_info(self, tool_name: str) -> Dict[str, Any]:
        """Get information about an MCP tool."""
        if tool_name not in self.available_tools:
            return {'error': f'Tool {tool_name} not available'}
        
        callback = self.tool_callbacks.get(tool_name)
        return {
            'name': tool_name,
            'available': True,
            'callback': callback is not None,
            'signature': str(callback) if callback else None,
        }
