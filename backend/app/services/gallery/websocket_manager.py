"""
Gallery WebSocket Manager

Manages WebSocket connections for real-time gallery download progress updates.
Provides real-time progress tracking, status updates, and error notifications.
"""

import asyncio
import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


@dataclass
class ProgressUpdate:
    """Progress update message"""

    download_id: str
    url: str
    status: str
    percentage: float
    current_file: str | None = None
    total_files: int = 0
    downloaded_files: int = 0
    total_bytes: int = 0
    downloaded_bytes: int = 0
    speed: float = 0.0
    estimated_time: float | None = None
    message: str | None = None
    error: str | None = None
    timestamp: str | None = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()


@dataclass
class ConnectionInfo:
    """WebSocket connection information"""

    websocket: WebSocket | None
    user_id: str | None = None
    download_ids: set[str] = field(default_factory=set)
    connected_at: str = field(default_factory=lambda: datetime.now().isoformat())


class GalleryWebSocketManager:
    """Manages WebSocket connections for gallery download progress"""

    def __init__(self) -> None:
        self.active_connections: list[ConnectionInfo] = []
        self.download_subscribers: dict[
            str, set[int]
        ] = {}  # download_id -> connection indices
        self.connection_lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str | None = None) -> int:
        """Accept a new WebSocket connection"""
        await websocket.accept()

        async with self.connection_lock:
            connection_info = ConnectionInfo(websocket=websocket, user_id=user_id)
            self.active_connections.append(connection_info)
            connection_index = len(self.active_connections) - 1

        logger.info(
            f"Gallery WebSocket connected. Total connections: {len(self.active_connections)}"
        )
        return connection_index

    async def disconnect(self, connection_index: int) -> None:
        """Remove a WebSocket connection"""
        async with self.connection_lock:
            if 0 <= connection_index < len(self.active_connections):
                connection_info = self.active_connections[connection_index]

                # Remove from download subscribers
                for download_id in connection_info.download_ids:
                    if download_id in self.download_subscribers:
                        self.download_subscribers[download_id].discard(connection_index)
                        if not self.download_subscribers[download_id]:
                            del self.download_subscribers[download_id]

                # Mark connection as inactive (don't remove to preserve indices)
                connection_info.websocket = None

        logger.info(
            f"Gallery WebSocket disconnected. Total connections: {len(self.active_connections)}"
        )

    async def subscribe_to_download(
        self, connection_index: int, download_id: str
    ) -> None:
        """Subscribe connection to download progress updates"""
        async with self.connection_lock:
            if 0 <= connection_index < len(self.active_connections):
                connection_info = self.active_connections[connection_index]
                if connection_info:
                    connection_info.download_ids.add(download_id)

                    if download_id not in self.download_subscribers:
                        self.download_subscribers[download_id] = set()
                    self.download_subscribers[download_id].add(connection_index)

                    logger.debug(
                        f"Connection {connection_index} subscribed to download {download_id}"
                    )

    async def unsubscribe_from_download(
        self, connection_index: int, download_id: str
    ) -> None:
        """Unsubscribe connection from download progress updates"""
        async with self.connection_lock:
            if 0 <= connection_index < len(self.active_connections):
                connection_info = self.active_connections[connection_index]
                if connection_info:
                    connection_info.download_ids.discard(download_id)

                    if download_id in self.download_subscribers:
                        self.download_subscribers[download_id].discard(connection_index)
                        if not self.download_subscribers[download_id]:
                            del self.download_subscribers[download_id]

                    logger.debug(
                        f"Connection {connection_index} unsubscribed from download {download_id}"
                    )

    async def send_progress_update(self, progress: ProgressUpdate) -> None:
        """Send progress update to subscribed connections"""
        if progress.download_id not in self.download_subscribers:
            return

        message = {"type": "progress_update", "data": asdict(progress)}

        # Get connection indices for this download
        connection_indices = list(self.download_subscribers[progress.download_id])

        # Send to all subscribed connections
        disconnected_indices = []
        for connection_index in connection_indices:
            try:
                if 0 <= connection_index < len(self.active_connections):
                    connection_info = self.active_connections[connection_index]
                    if connection_info and connection_info.websocket:
                        await connection_info.websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(
                    f"Failed to send progress update to connection {connection_index}: {e}"
                )
                disconnected_indices.append(connection_index)

        # Clean up disconnected connections
        for connection_index in disconnected_indices:
            await self.disconnect(connection_index)

    async def send_download_started(self, download_id: str, url: str) -> None:
        """Send download started notification"""
        message = {
            "type": "download_started",
            "data": {
                "download_id": download_id,
                "url": url,
                "timestamp": datetime.now().isoformat(),
            },
        }
        await self._broadcast_to_download_subscribers(download_id, message)

    async def send_download_completed(
        self, download_id: str, result: dict[str, Any]
    ) -> None:
        """Send download completed notification"""
        message = {
            "type": "download_completed",
            "data": {
                "download_id": download_id,
                "result": result,
                "timestamp": datetime.now().isoformat(),
            },
        }
        await self._broadcast_to_download_subscribers(download_id, message)

    async def send_download_error(self, download_id: str, error: str) -> None:
        """Send download error notification"""
        message = {
            "type": "download_error",
            "data": {
                "download_id": download_id,
                "error": error,
                "timestamp": datetime.now().isoformat(),
            },
        }
        await self._broadcast_to_download_subscribers(download_id, message)

    async def send_download_cancelled(self, download_id: str) -> None:
        """Send download cancelled notification"""
        message = {
            "type": "download_cancelled",
            "data": {
                "download_id": download_id,
                "timestamp": datetime.now().isoformat(),
            },
        }
        await self._broadcast_to_download_subscribers(download_id, message)

    async def _broadcast_to_download_subscribers(
        self, download_id: str, message: dict[str, Any]
    ) -> None:
        """Broadcast message to all subscribers of a download"""
        if download_id not in self.download_subscribers:
            return

        connection_indices = list(self.download_subscribers[download_id])
        disconnected_indices = []

        for connection_index in connection_indices:
            try:
                if 0 <= connection_index < len(self.active_connections):
                    connection_info = self.active_connections[connection_index]
                    if connection_info and connection_info.websocket:
                        await connection_info.websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(
                    f"Failed to broadcast message to connection {connection_index}: {e}"
                )
                disconnected_indices.append(connection_index)

        # Clean up disconnected connections
        for connection_index in disconnected_indices:
            await self.disconnect(connection_index)

    async def get_connection_stats(self) -> dict[str, Any]:
        """Get WebSocket connection statistics"""
        async with self.connection_lock:
            active_connections = len(
                [conn for conn in self.active_connections if conn is not None]
            )
            total_subscriptions = sum(
                len(subscribers) for subscribers in self.download_subscribers.values()
            )

            return {
                "active_connections": active_connections,
                "total_subscriptions": total_subscriptions,
                "downloads_with_subscribers": len(self.download_subscribers),
                "connection_details": [
                    {
                        "user_id": conn.user_id,
                        "download_ids": list(conn.download_ids),
                        "connected_at": conn.connected_at,
                    }
                    for conn in self.active_connections
                    if conn is not None
                ],
            }


# Global WebSocket manager instance
websocket_manager = GalleryWebSocketManager()
