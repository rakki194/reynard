"""
🦊 Reynard Progress Monitoring Service
======================================

Real-time progress monitoring for indexing operations.
Provides WebSocket-based progress updates, progress persistence,
and comprehensive monitoring dashboards.

Features:
- Real-time WebSocket progress updates
- Progress persistence and history
- Performance metrics tracking
- Error monitoring and reporting
- Progress visualization data
- Configurable update intervals

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import json
import logging
import time
from typing import Any, Dict, List, Optional, Set

logger = logging.getLogger(__name__)


class ProgressMonitor:
    """Real-time progress monitoring for indexing operations."""

    def __init__(self):
        """Initialize the progress monitor."""
        self.active_connections: Set[Any] = set()
        self.progress_history: List[Dict[str, Any]] = []
        self.max_history_size = 100
        self.update_interval = 1.0  # seconds
        self.is_monitoring = False
        self.monitor_task: Optional[asyncio.Task] = None

    async def add_connection(self, websocket: Any) -> None:
        """Add a WebSocket connection for progress updates."""
        self.active_connections.add(websocket)
        logger.info(
            f"Added progress monitoring connection. Total: {len(self.active_connections)}"
        )

    async def remove_connection(self, websocket: Any) -> None:
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(
                f"Removed progress monitoring connection. Total: {len(self.active_connections)}"
            )

    async def broadcast_progress(self, progress_data: Dict[str, Any]) -> None:
        """Broadcast progress update to all connected clients."""
        if not self.active_connections:
            return

        try:
            message = json.dumps(
                {
                    "type": "progress_update",
                    "timestamp": time.time(),
                    "data": progress_data,
                }
            )

            # Send to all active connections
            disconnected = set()
            for websocket in self.active_connections:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.warning(f"Failed to send progress update: {e}")
                    disconnected.add(websocket)

            # Remove disconnected connections
            for websocket in disconnected:
                await self.remove_connection(websocket)

        except Exception as e:
            logger.error(f"Failed to broadcast progress: {e}")

    async def record_progress(self, progress_data: Dict[str, Any]) -> None:
        """Record progress data in history."""
        try:
            # Add timestamp if not present
            if "timestamp" not in progress_data:
                progress_data["timestamp"] = time.time()

            # Add to history
            self.progress_history.append(progress_data.copy())

            # Maintain history size limit
            if len(self.progress_history) > self.max_history_size:
                self.progress_history = self.progress_history[-self.max_history_size :]

            # Broadcast to active connections
            await self.broadcast_progress(progress_data)

        except Exception as e:
            logger.error(f"Failed to record progress: {e}")

    async def get_progress_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent progress history."""
        return (
            self.progress_history[-limit:]
            if limit > 0
            else self.progress_history.copy()
        )

    async def get_current_progress(self) -> Optional[Dict[str, Any]]:
        """Get the most recent progress data."""
        return self.progress_history[-1] if self.progress_history else None

    async def start_monitoring(self, indexing_service: Any) -> None:
        """Start monitoring an indexing service."""
        if self.is_monitoring:
            logger.warning("Progress monitoring is already active")
            return

        self.is_monitoring = True
        self.monitor_task = asyncio.create_task(self._monitor_loop(indexing_service))
        logger.info("Started progress monitoring")

    async def stop_monitoring(self) -> None:
        """Stop progress monitoring."""
        if not self.is_monitoring:
            return

        self.is_monitoring = False
        if self.monitor_task:
            self.monitor_task.cancel()
            try:
                await self.monitor_task
            except asyncio.CancelledError:
                pass
        logger.info("Stopped progress monitoring")

    async def _monitor_loop(self, indexing_service: Any) -> None:
        """Main monitoring loop."""
        try:
            while self.is_monitoring:
                try:
                    # Get current progress from indexing service
                    progress = await indexing_service.get_progress()
                    if progress:
                        await self.record_progress(progress)

                    # Wait for next update
                    await asyncio.sleep(self.update_interval)

                except Exception as e:
                    logger.error(f"Error in monitoring loop: {e}")
                    await asyncio.sleep(self.update_interval)

        except asyncio.CancelledError:
            logger.info("Progress monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Fatal error in monitoring loop: {e}")
        finally:
            self.is_monitoring = False

    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)

    async def get_monitoring_stats(self) -> Dict[str, Any]:
        """Get monitoring statistics."""
        return {
            "active_connections": len(self.active_connections),
            "is_monitoring": self.is_monitoring,
            "history_size": len(self.progress_history),
            "max_history_size": self.max_history_size,
            "update_interval": self.update_interval,
            "latest_progress": (
                self.progress_history[-1] if self.progress_history else None
            ),
        }


# Global progress monitor instance
_global_progress_monitor: Optional[ProgressMonitor] = None


def get_progress_monitor() -> ProgressMonitor:
    """Get the global progress monitor instance."""
    global _global_progress_monitor
    if _global_progress_monitor is None:
        _global_progress_monitor = ProgressMonitor()
    return _global_progress_monitor
