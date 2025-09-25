"""WebSocket Manager for Real-time Training Progress.

This module provides WebSocket-based real-time communication for training
progress updates, log streaming, and status monitoring in the diffusion-pipe
integration.
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.api.diffusion_pipe.models import TrainingStatus, TrainingMetrics

logger = logging.getLogger(__name__)


class WebSocketMessage(BaseModel):
    """WebSocket message structure."""
    
    type: str
    data: Dict[str, Any]
    timestamp: str
    training_id: Optional[str] = None


class WebSocketConnection:
    """Individual WebSocket connection with metadata."""
    
    def __init__(self, websocket: WebSocket, connection_id: str, training_id: Optional[str] = None):
        self.websocket = websocket
        self.connection_id = connection_id
        self.training_id = training_id
        self.subscribed_topics: Set[str] = set()
        self.connected_at = asyncio.get_event_loop().time()
    
    async def send_message(self, message: WebSocketMessage):
        """Send a message to this connection."""
        try:
            await self.websocket.send_text(message.model_dump_json())
        except Exception as e:
            logger.error(f"Failed to send message to connection {self.connection_id}: {e}")
    
    def is_subscribed_to(self, topic: str) -> bool:
        """Check if connection is subscribed to a topic."""
        return topic in self.subscribed_topics
    
    def subscribe_to(self, topic: str):
        """Subscribe to a topic."""
        self.subscribed_topics.add(topic)
    
    def unsubscribe_from(self, topic: str):
        """Unsubscribe from a topic."""
        self.subscribed_topics.discard(topic)


class WebSocketManager:
    """Manager for WebSocket connections and real-time updates."""
    
    def __init__(self):
        self.connections: Dict[str, WebSocketConnection] = {}
        self.training_connections: Dict[str, Set[str]] = {}  # training_id -> connection_ids
        self.connection_counter = 0
    
    async def connect(self, websocket: WebSocket, training_id: Optional[str] = None) -> str:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        self.connection_counter += 1
        connection_id = f"conn_{self.connection_counter}"
        
        connection = WebSocketConnection(websocket, connection_id, training_id)
        self.connections[connection_id] = connection
        
        # Add to training-specific connections if training_id provided
        if training_id:
            if training_id not in self.training_connections:
                self.training_connections[training_id] = set()
            self.training_connections[training_id].add(connection_id)
        
        logger.info(f"WebSocket connection established: {connection_id} (training: {training_id})")
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection."""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        
        # Remove from training-specific connections
        if connection.training_id and connection.training_id in self.training_connections:
            self.training_connections[connection.training_id].discard(connection_id)
            if not self.training_connections[connection.training_id]:
                del self.training_connections[connection.training_id]
        
        del self.connections[connection_id]
        logger.info(f"WebSocket connection closed: {connection_id}")
    
    async def send_to_connection(self, connection_id: str, message: WebSocketMessage):
        """Send a message to a specific connection."""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        await connection.send_message(message)
    
    async def send_to_training(self, training_id: str, message: WebSocketMessage):
        """Send a message to all connections subscribed to a training."""
        if training_id not in self.training_connections:
            return
        
        message.training_id = training_id
        
        # Send to all connections subscribed to this training
        for connection_id in list(self.training_connections[training_id]):
            if connection_id in self.connections:
                await self.send_to_connection(connection_id, message)
    
    async def broadcast(self, message: WebSocketMessage, topic: Optional[str] = None):
        """Broadcast a message to all connections, optionally filtered by topic."""
        for connection_id in list(self.connections.keys()):
            connection = self.connections[connection_id]
            
            # Filter by topic if specified
            if topic and not connection.is_subscribed_to(topic):
                continue
            
            await self.send_to_connection(connection_id, message)
    
    async def handle_message(self, connection_id: str, message_data: Dict[str, Any]):
        """Handle incoming WebSocket message."""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        message_type = message_data.get("type")
        
        if message_type == "subscribe":
            topic = message_data.get("topic")
            if topic:
                connection.subscribe_to(topic)
                logger.info(f"Connection {connection_id} subscribed to topic: {topic}")
        
        elif message_type == "unsubscribe":
            topic = message_data.get("topic")
            if topic:
                connection.unsubscribe_from(topic)
                logger.info(f"Connection {connection_id} unsubscribed from topic: {topic}")
        
        elif message_type == "ping":
            # Respond with pong
            pong_message = WebSocketMessage(
                type="pong",
                data={"timestamp": message_data.get("timestamp")},
                timestamp=asyncio.get_event_loop().time()
            )
            await self.send_to_connection(connection_id, pong_message)
    
    async def send_training_status_update(self, training_id: str, status: TrainingStatus):
        """Send training status update to subscribed connections."""
        message = WebSocketMessage(
            type="training_status",
            data=status.model_dump(),
            timestamp=asyncio.get_event_loop().time(),
            training_id=training_id
        )
        await self.send_to_training(training_id, message)
    
    async def send_training_metrics(self, training_id: str, metrics: TrainingMetrics):
        """Send training metrics to subscribed connections."""
        message = WebSocketMessage(
            type="training_metrics",
            data=metrics.model_dump(),
            timestamp=asyncio.get_event_loop().time(),
            training_id=training_id
        )
        await self.send_to_training(training_id, message)
    
    async def send_training_log(self, training_id: str, log_line: str, level: str = "info"):
        """Send training log line to subscribed connections."""
        message = WebSocketMessage(
            type="training_log",
            data={
                "log_line": log_line,
                "level": level,
            },
            timestamp=asyncio.get_event_loop().time(),
            training_id=training_id
        )
        await self.send_to_training(training_id, message)
    
    async def send_system_notification(self, notification: str, level: str = "info"):
        """Send system notification to all connections."""
        message = WebSocketMessage(
            type="system_notification",
            data={
                "notification": notification,
                "level": level,
            },
            timestamp=asyncio.get_event_loop().time()
        )
        await self.broadcast(message, "system")
    
    def get_connection_count(self) -> int:
        """Get total number of active connections."""
        return len(self.connections)
    
    def get_training_connection_count(self, training_id: str) -> int:
        """Get number of connections subscribed to a specific training."""
        return len(self.training_connections.get(training_id, set()))
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics."""
        return {
            "total_connections": len(self.connections),
            "training_connections": {
                training_id: len(connection_ids)
                for training_id, connection_ids in self.training_connections.items()
            },
            "active_trainings": len(self.training_connections),
        }


# Global WebSocket manager instance
_websocket_manager: Optional[WebSocketManager] = None


def get_websocket_manager() -> WebSocketManager:
    """Get the global WebSocket manager instance."""
    global _websocket_manager
    if _websocket_manager is None:
        _websocket_manager = WebSocketManager()
    return _websocket_manager
