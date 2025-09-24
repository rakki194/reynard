"""🦊 Reynard Streaming Response Mixin
===================================

Advanced streaming response capabilities for the Reynard backend services,
providing sophisticated event handling, WebSocket management, and streaming
optimization patterns.

This module provides:
- Advanced streaming response management
- Event filtering and transformation
- WebSocket connection management
- Streaming error handling and recovery
- Performance monitoring and metrics
- Connection pooling and management

Key Features:
- Event Filtering: Advanced event filtering and transformation capabilities
- WebSocket Management: Connection pooling, heartbeat, and reconnection handling
- Error Recovery: Comprehensive error handling with automatic recovery
- Performance Monitoring: Real-time metrics and connection tracking
- Connection Management: Automatic cleanup and resource management
- Event Transformation: Flexible event processing and formatting

Author: Reynard Development Team
Version: 2.0.0 - Advanced streaming patterns
"""

import asyncio
import json
import time
import uuid
from collections.abc import AsyncGenerator, Callable
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

from .error_handler import service_error_handler
from .logging_config import get_service_logger

logger = get_service_logger("streaming")


class StreamingEvent(BaseModel):
    """Standardized streaming event model."""

    id: str = ""
    type: str
    data: Any
    timestamp: float = 0.0
    metadata: dict[str, Any] = {}

    def __init__(self, **data):
        if not data.get("id"):
            data["id"] = str(uuid.uuid4())
        if not data.get("timestamp"):
            data["timestamp"] = time.time()
        super().__init__(**data)


class StreamingMetrics(BaseModel):
    """Streaming performance metrics."""

    active_connections: int = 0
    total_events_sent: int = 0
    events_per_second: float = 0.0
    average_latency_ms: float = 0.0
    error_rate: float = 0.0
    connection_duration_avg: float = 0.0
    last_updated: float = 0.0


class WebSocketConnection:
    """WebSocket connection manager."""

    def __init__(self, websocket: WebSocket, connection_id: str):
        self.websocket = websocket
        self.connection_id = connection_id
        self.connected_at = time.time()
        self.last_heartbeat = time.time()
        self.events_sent = 0
        self.is_active = True
        self.subscriptions: list[str] = []
        self.filters: dict[str, Any] = {}

    async def send_event(self, event: StreamingEvent) -> bool:
        """Send event to WebSocket connection."""
        try:
            await self.websocket.send_text(event.json())
            self.events_sent += 1
            self.last_heartbeat = time.time()
            return True
        except Exception as e:
            logger.warning(f"Failed to send event to {self.connection_id}: {e}")
            self.is_active = False
            return False

    async def send_heartbeat(self) -> bool:
        """Send heartbeat to keep connection alive."""
        heartbeat_event = StreamingEvent(
            type="heartbeat",
            data={"timestamp": time.time()},
            metadata={"connection_id": self.connection_id},
        )
        return await self.send_event(heartbeat_event)

    def should_receive_event(self, event: StreamingEvent) -> bool:
        """Check if connection should receive this event."""
        if not self.is_active:
            return False

        # Check subscriptions
        if self.subscriptions and event.type not in self.subscriptions:
            return False

        # Check filters
        for filter_key, filter_value in self.filters.items():
            if filter_key in event.metadata:
                if event.metadata[filter_key] != filter_value:
                    return False

        return True


class StreamingResponseMixin:
    """Advanced streaming response mixin with enterprise-grade capabilities.

    Provides sophisticated streaming patterns including:
    - Event filtering and transformation
    - WebSocket connection management
    - Streaming error handling and recovery
    - Performance monitoring and metrics
    - Connection pooling and management
    """

    def __init__(self):
        self._websocket_connections: dict[str, WebSocketConnection] = {}
        self._streaming_metrics = StreamingMetrics()
        self._event_filters: dict[str, Callable] = {}
        self._event_transformers: dict[str, Callable] = {}
        self._heartbeat_task: asyncio.Task | None = None
        self._cleanup_task: asyncio.Task | None = None
        self._background_tasks_started = False

    def _start_background_tasks(self):
        """Start background tasks for connection management."""
        try:
            # Only start tasks if we're in an async context
            loop = asyncio.get_running_loop()
            if not self._background_tasks_started:
                if not self._heartbeat_task or self._heartbeat_task.done():
                    self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())

                if not self._cleanup_task or self._cleanup_task.done():
                    self._cleanup_task = asyncio.create_task(self._cleanup_loop())

                self._background_tasks_started = True
        except RuntimeError:
            # No event loop running, tasks will be started when needed
            pass

    async def _heartbeat_loop(self):
        """Background task to send heartbeats to WebSocket connections."""
        while True:
            try:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds

                inactive_connections = []
                for connection_id, connection in self._websocket_connections.items():
                    if not await connection.send_heartbeat():
                        inactive_connections.append(connection_id)

                # Remove inactive connections
                for connection_id in inactive_connections:
                    await self._remove_websocket_connection(connection_id)

            except Exception:
                logger.exception("Error in heartbeat loop")
                await asyncio.sleep(5)  # Wait before retrying

    async def _cleanup_loop(self):
        """Background task to clean up old connections and update metrics."""
        while True:
            try:
                await asyncio.sleep(60)  # Cleanup every minute

                # Remove old inactive connections
                current_time = time.time()
                old_connections = [
                    conn_id
                    for conn_id, conn in self._websocket_connections.items()
                    if not conn.is_active
                    or (current_time - conn.last_heartbeat) > 300  # 5 minutes
                ]

                for connection_id in old_connections:
                    await self._remove_websocket_connection(connection_id)

                # Update metrics
                self._update_streaming_metrics()

            except Exception:
                logger.exception("Error in cleanup loop")
                await asyncio.sleep(10)  # Wait before retrying

    def _update_streaming_metrics(self):
        """Update streaming performance metrics."""
        active_connections = sum(
            1 for conn in self._websocket_connections.values() if conn.is_active
        )
        total_events = sum(
            conn.events_sent for conn in self._websocket_connections.values()
        )

        self._streaming_metrics.active_connections = active_connections
        self._streaming_metrics.total_events_sent = total_events
        self._streaming_metrics.last_updated = time.time()

    async def _remove_websocket_connection(self, connection_id: str):
        """Remove WebSocket connection."""
        if connection_id in self._websocket_connections:
            connection = self._websocket_connections[connection_id]
            try:
                await connection.websocket.close()
            except Exception:
                pass  # Connection might already be closed
            del self._websocket_connections[connection_id]
            logger.info(f"Removed WebSocket connection: {connection_id}")

    def setup_streaming_endpoints(self) -> None:
        """Setup advanced streaming endpoints."""

        @self.router.get("/stream")
        async def stream_data():
            """Stream data from the service."""
            try:
                service = self.get_service()
                if hasattr(service, "stream_data"):
                    return EventSourceResponse(service.stream_data())
                raise HTTPException(
                    status_code=501, detail="Streaming not supported by this service",
                )
            except Exception as e:
                logger.error(f"Streaming failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="stream_data", error=e, service_name=self.service_name,
                )

        @self.router.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time streaming."""
            await self._handle_websocket_connection(websocket)

        @self.router.get("/streaming/metrics")
        async def get_streaming_metrics():
            """Get streaming performance metrics."""
            return self._streaming_metrics.dict()

        @self.router.get("/streaming/connections")
        async def get_active_connections():
            """Get active WebSocket connections."""
            return {
                "active_connections": len(self._websocket_connections),
                "connections": [
                    {
                        "id": conn_id,
                        "connected_at": conn.connected_at,
                        "events_sent": conn.events_sent,
                        "subscriptions": conn.subscriptions,
                        "is_active": conn.is_active,
                    }
                    for conn_id, conn in self._websocket_connections.items()
                ],
            }

    async def _handle_websocket_connection(self, websocket: WebSocket):
        """Handle WebSocket connection."""
        connection_id = str(uuid.uuid4())

        try:
            # Start background tasks if not already started
            self._start_background_tasks()

            await websocket.accept()
            connection = WebSocketConnection(websocket, connection_id)
            self._websocket_connections[connection_id] = connection

            logger.info(f"WebSocket connection established: {connection_id}")

            # Send welcome message
            welcome_event = StreamingEvent(
                type="connection_established",
                data={"connection_id": connection_id, "service": self.service_name},
                metadata={"timestamp": time.time()},
            )
            await connection.send_event(welcome_event)

            # Handle incoming messages
            while True:
                try:
                    message = await websocket.receive_text()
                    await self._handle_websocket_message(connection, message)
                except WebSocketDisconnect:
                    break
                except Exception as e:
                    logger.error(f"Error handling WebSocket message: {e}")
                    error_event = StreamingEvent(
                        type="error",
                        data={"error": str(e)},
                        metadata={"connection_id": connection_id},
                    )
                    await connection.send_event(error_event)

        except Exception as e:
            logger.exception(f"WebSocket connection error: {e}")
        finally:
            await self._remove_websocket_connection(connection_id)

    async def _handle_websocket_message(
        self, connection: WebSocketConnection, message: str,
    ):
        """Handle incoming WebSocket message."""
        try:
            data = json.loads(message)
            message_type = data.get("type")

            if message_type == "subscribe":
                # Handle subscription
                event_types = data.get("event_types", [])
                connection.subscriptions = event_types
                logger.info(
                    f"Connection {connection.connection_id} subscribed to: {event_types}",
                )

            elif message_type == "filter":
                # Handle filtering
                filters = data.get("filters", {})
                connection.filters = filters
                logger.info(
                    f"Connection {connection.connection_id} set filters: {filters}",
                )

            elif message_type == "ping":
                # Handle ping
                pong_event = StreamingEvent(
                    type="pong",
                    data={"timestamp": time.time()},
                    metadata={"connection_id": connection.connection_id},
                )
                await connection.send_event(pong_event)

        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON message from {connection.connection_id}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")

    def create_streaming_response(
        self,
        data_generator: AsyncGenerator,
        content_type: str = "text/plain",
        headers: dict[str, str] | None = None,
    ) -> StreamingResponse:
        """Create an enhanced streaming response with error handling.

        Args:
            data_generator: Generator that yields data
            content_type: Content type for the response
            headers: Additional headers

        Returns:
            StreamingResponse: The streaming response

        """
        default_headers = {
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "X-Streaming-Service": self.service_name,
        }

        if headers:
            default_headers.update(headers)

        return StreamingResponse(
            data_generator,
            media_type=content_type,
            headers=default_headers,
        )

    def create_sse_response(
        self, event_generator: AsyncGenerator, headers: dict[str, str] | None = None,
    ) -> EventSourceResponse:
        """Create an enhanced Server-Sent Events response.

        Args:
            event_generator: Generator that yields SSE events
            headers: Additional headers

        Returns:
            EventSourceResponse: The SSE response

        """
        default_headers = {
            "X-Streaming-Service": self.service_name,
            "X-Event-Source": "reynard-streaming",
        }

        if headers:
            default_headers.update(headers)

        return EventSourceResponse(event_generator, headers=default_headers)

    def create_enhanced_sse_response(
        self,
        event_generator: AsyncGenerator,
        filters: dict[str, Any] | None = None,
        transformers: dict[str, Callable] | None = None,
    ) -> EventSourceResponse:
        """Create an enhanced SSE response with filtering and transformation.

        Args:
            event_generator: Generator that yields events
            filters: Event filters to apply
            transformers: Event transformers to apply

        Returns:
            EventSourceResponse: The enhanced SSE response

        """

        async def enhanced_event_generator():
            async for event_data in event_generator:
                try:
                    # Create standardized event
                    if isinstance(event_data, dict):
                        event = StreamingEvent(**event_data)
                    else:
                        event = StreamingEvent(
                            type="data",
                            data=event_data,
                            metadata={"source": self.service_name},
                        )

                    # Apply filters
                    if filters and not self._apply_event_filters(event, filters):
                        continue

                    # Apply transformers
                    if transformers:
                        event = self._apply_event_transformers(event, transformers)

                    # Broadcast to WebSocket connections
                    await self._broadcast_to_websockets(event)

                    # Yield for SSE
                    yield {
                        "event": event.type,
                        "data": event.json(),
                        "id": event.id,
                    }

                except Exception as e:
                    logger.error(f"Error processing streaming event: {e}")
                    error_event = StreamingEvent(
                        type="error",
                        data={"error": str(e)},
                        metadata={"source": self.service_name},
                    )
                    yield {
                        "event": "error",
                        "data": error_event.json(),
                        "id": error_event.id,
                    }

        return self.create_sse_response(enhanced_event_generator())

    def _apply_event_filters(
        self, event: StreamingEvent, filters: dict[str, Any],
    ) -> bool:
        """Apply event filters."""
        for filter_key, filter_value in filters.items():
            if (filter_key == "type" and event.type != filter_value) or (
                filter_key in event.metadata
                and event.metadata[filter_key] != filter_value
            ):
                return False
        return True

    def _apply_event_transformers(
        self, event: StreamingEvent, transformers: dict[str, Callable],
    ) -> StreamingEvent:
        """Apply event transformers."""
        for transformer_key, transformer_func in transformers.items():
            if transformer_key == "data":
                event.data = transformer_func(event.data)
            elif transformer_key == "metadata":
                event.metadata = transformer_func(event.metadata)
            elif transformer_key in event.metadata:
                event.metadata[transformer_key] = transformer_func(
                    event.metadata[transformer_key],
                )
        return event

    async def _broadcast_to_websockets(self, event: StreamingEvent):
        """Broadcast event to all active WebSocket connections."""
        if not self._websocket_connections:
            return

        # Create tasks for concurrent sending
        send_tasks = []
        for connection in self._websocket_connections.values():
            if connection.should_receive_event(event):
                send_tasks.append(connection.send_event(event))

        # Send to all connections concurrently
        if send_tasks:
            await asyncio.gather(*send_tasks, return_exceptions=True)

    def add_event_filter(
        self, name: str, filter_func: Callable[[StreamingEvent], bool],
    ):
        """Add a custom event filter."""
        self._event_filters[name] = filter_func

    def add_event_transformer(self, name: str, transformer_func: Callable):
        """Add a custom event transformer."""
        self._event_transformers[name] = transformer_func

    async def send_event_to_websockets(self, event: StreamingEvent):
        """Send event to all WebSocket connections."""
        await self._broadcast_to_websockets(event)

    def get_streaming_metrics(self) -> StreamingMetrics:
        """Get current streaming metrics."""
        self._update_streaming_metrics()
        return self._streaming_metrics

    async def cleanup(self):
        """Cleanup streaming resources."""
        # Cancel background tasks
        if self._heartbeat_task and not self._heartbeat_task.done():
            self._heartbeat_task.cancel()

        if self._cleanup_task and not self._cleanup_task.done():
            self._cleanup_task.cancel()

        # Close all WebSocket connections
        for connection_id in list(self._websocket_connections.keys()):
            await self._remove_websocket_connection(connection_id)

        logger.info("Streaming mixin cleanup completed")
