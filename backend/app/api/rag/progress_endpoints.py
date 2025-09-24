"""🦊 Reynard Progress Monitoring API Endpoints
============================================

WebSocket and HTTP endpoints for real-time progress monitoring
of indexing operations and system status.

Features:
- WebSocket connections for real-time progress updates
- HTTP endpoints for progress history and status
- Comprehensive monitoring dashboards
- Error tracking and reporting
- Performance metrics

Author: Reynard Development Team
Version: 1.0.0
"""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from app.services.rag.progress_monitor import get_progress_monitor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/progress", tags=["progress"])


@router.websocket("/ws")
async def websocket_progress_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time progress monitoring."""
    await websocket.accept()
    progress_monitor = get_progress_monitor()

    try:
        # Add connection to monitor
        await progress_monitor.add_connection(websocket)

        # Send initial status
        initial_status = {
            "type": "connection_established",
            "timestamp": json.dumps({"timestamp": 0}),
            "data": {
                "message": "Connected to progress monitoring",
                "active_connections": progress_monitor.get_connection_count(),
            },
        }
        await websocket.send_text(json.dumps(initial_status))

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for client messages (ping/pong, commands, etc.)
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(
                        json.dumps(
                            {"type": "pong", "timestamp": message.get("timestamp")},
                        ),
                    )
                elif message.get("type") == "get_history":
                    history = await progress_monitor.get_progress_history(
                        message.get("limit", 50),
                    )
                    await websocket.send_text(
                        json.dumps({"type": "history", "data": history}),
                    )
                elif message.get("type") == "get_stats":
                    stats = await progress_monitor.get_monitoring_stats()
                    await websocket.send_text(
                        json.dumps({"type": "stats", "data": stats}),
                    )

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Invalid JSON message"}),
                )
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_text(
                    json.dumps({"type": "error", "message": str(e)}),
                )

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        # Remove connection from monitor
        await progress_monitor.remove_connection(websocket)


@router.get("/history")
async def get_progress_history(limit: int = 50) -> JSONResponse:
    """Get progress history."""
    try:
        progress_monitor = get_progress_monitor()
        history = await progress_monitor.get_progress_history(limit)

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "history": history,
                    "total_entries": len(history),
                    "limit": limit,
                },
            },
        )

    except Exception as e:
        logger.error(f"Failed to get progress history: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@router.get("/current")
async def get_current_progress() -> JSONResponse:
    """Get current progress status."""
    try:
        progress_monitor = get_progress_monitor()
        current_progress = await progress_monitor.get_current_progress()

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "current_progress": current_progress,
                    "has_progress": current_progress is not None,
                },
            },
        )

    except Exception as e:
        logger.error(f"Failed to get current progress: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@router.get("/stats")
async def get_monitoring_stats() -> JSONResponse:
    """Get monitoring statistics."""
    try:
        progress_monitor = get_progress_monitor()
        stats = await progress_monitor.get_monitoring_stats()

        return JSONResponse({"status": "success", "data": stats})

    except Exception as e:
        logger.error(f"Failed to get monitoring stats: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@router.get("/connections")
async def get_connection_info() -> JSONResponse:
    """Get WebSocket connection information."""
    try:
        progress_monitor = get_progress_monitor()
        connection_count = progress_monitor.get_connection_count()

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "active_connections": connection_count,
                    "is_monitoring": progress_monitor.is_monitoring,
                },
            },
        )

    except Exception as e:
        logger.error(f"Failed to get connection info: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)
