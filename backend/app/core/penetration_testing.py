"""Penetration Testing Mode Coordinator

This module provides coordination between the backend and fenrir testing suite
to ensure that auto-reloading is disabled during penetration testing sessions.

Features:
- Penetration testing mode activation/deactivation
- Auto-reload control during security testing
- Session tracking and timeout management
- Integration with development bypass middleware
"""

import os
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_config


class PenetrationTestingCoordinator:
    """Coordinates penetration testing sessions between backend and fenrir suite.

    This class manages the penetration testing mode state and provides
    methods to control auto-reloading during security testing sessions.
    """

    def __init__(self):
        self.is_active = False
        self.session_id: str | None = None
        self.start_time: datetime | None = None
        self.timeout_minutes = 30  # Default timeout
        self.lock = threading.Lock()
        self.config = get_config()

        # File to track penetration testing state
        self.state_file = Path("/tmp/reynard_penetration_testing.lock")

        # Auto-reload control
        self.original_reload = None
        self.uvicorn_server = None

    def activate_penetration_testing(
        self,
        session_id: str,
        timeout_minutes: int = 30,
    ) -> bool:
        """Activate penetration testing mode.

        Args:
            session_id: Unique identifier for the testing session
            timeout_minutes: Maximum duration for the session

        Returns:
            bool: True if successfully activated

        """
        with self.lock:
            if self.is_active:
                return False  # Already active

            self.is_active = True
            self.session_id = session_id
            self.start_time = datetime.now()
            self.timeout_minutes = timeout_minutes

            # Write state to file for persistence across reloads
            self._write_state_file()

            # Disable auto-reload if in development mode
            if self.config.environment == "development":
                self._disable_auto_reload()

            return True

    def deactivate_penetration_testing(self, session_id: str) -> bool:
        """Deactivate penetration testing mode.

        Args:
            session_id: Session ID to deactivate

        Returns:
            bool: True if successfully deactivated

        """
        with self.lock:
            if not self.is_active or self.session_id != session_id:
                return False

            self.is_active = False
            self.session_id = None
            self.start_time = None

            # Remove state file
            self._remove_state_file()

            # Re-enable auto-reload if in development mode
            if self.config.environment == "development":
                self._enable_auto_reload()

            return True

    def is_penetration_testing_active(self) -> bool:
        """Check if penetration testing mode is currently active.

        Returns:
            bool: True if penetration testing is active

        """
        with self.lock:
            # Check for timeout
            if self.is_active and self.start_time:
                elapsed = datetime.now() - self.start_time
                if elapsed > timedelta(minutes=self.timeout_minutes):
                    self._force_deactivate("timeout")
                    return False

            return self.is_active

    def get_session_info(self) -> dict[str, Any]:
        """Get current penetration testing session information.

        Returns:
            dict: Session information

        """
        with self.lock:
            if not self.is_active:
                return {"active": False}

            elapsed = (
                datetime.now() - self.start_time if self.start_time else timedelta(0)
            )
            remaining = timedelta(minutes=self.timeout_minutes) - elapsed

            return {
                "active": True,
                "session_id": self.session_id,
                "start_time": self.start_time.isoformat() if self.start_time else None,
                "elapsed_seconds": int(elapsed.total_seconds()),
                "remaining_seconds": max(0, int(remaining.total_seconds())),
                "timeout_minutes": self.timeout_minutes,
            }

    def _write_state_file(self):
        """Write penetration testing state to file."""
        try:
            state_data = {
                "active": self.is_active,
                "session_id": self.session_id,
                "start_time": self.start_time.isoformat() if self.start_time else None,
                "timeout_minutes": self.timeout_minutes,
                "pid": os.getpid(),
            }

            with open(self.state_file, "w") as f:
                f.write(f"REYNARD_PENETRATION_TESTING={self.is_active}\n")
                f.write(f"SESSION_ID={self.session_id}\n")
                f.write(
                    f"START_TIME={self.start_time.isoformat() if self.start_time else ''}\n",
                )
                f.write(f"TIMEOUT_MINUTES={self.timeout_minutes}\n")
                f.write(f"PID={os.getpid()}\n")
        except Exception as e:
            print(f"Warning: Could not write penetration testing state file: {e}")

    def _remove_state_file(self):
        """Remove penetration testing state file."""
        try:
            if self.state_file.exists():
                self.state_file.unlink()
        except Exception as e:
            print(f"Warning: Could not remove penetration testing state file: {e}")

    def _disable_auto_reload(self):
        """Disable auto-reload functionality."""
        try:
            # Set environment variable to disable auto-reload
            os.environ["REYNARD_DISABLE_AUTO_RELOAD"] = "1"
            print("🦊 Penetration testing mode: Auto-reload disabled")
        except Exception as e:
            print(f"Warning: Could not disable auto-reload: {e}")

    def _enable_auto_reload(self):
        """Re-enable auto-reload functionality."""
        try:
            # Remove environment variable to re-enable auto-reload
            if "REYNARD_DISABLE_AUTO_RELOAD" in os.environ:
                del os.environ["REYNARD_DISABLE_AUTO_RELOAD"]
            print("🦊 Penetration testing mode: Auto-reload re-enabled")
        except Exception as e:
            print(f"Warning: Could not re-enable auto-reload: {e}")

    def _force_deactivate(self, reason: str):
        """Force deactivation of penetration testing mode."""
        print(f"🦊 Penetration testing mode force deactivated: {reason}")
        self.is_active = False
        self.session_id = None
        self.start_time = None
        self._remove_state_file()
        if self.config.environment == "development":
            self._enable_auto_reload()


# Global coordinator instance
_penetration_coordinator: PenetrationTestingCoordinator | None = None


def get_penetration_coordinator() -> PenetrationTestingCoordinator:
    """Get the global penetration testing coordinator instance."""
    global _penetration_coordinator
    if _penetration_coordinator is None:
        _penetration_coordinator = PenetrationTestingCoordinator()
    return _penetration_coordinator


class PenetrationTestingMiddleware(BaseHTTPMiddleware):
    """Middleware to handle penetration testing mode coordination.

    This middleware provides HTTP endpoints for the fenrir suite to
    control penetration testing mode and checks for active sessions.
    """

    def __init__(self, app):
        super().__init__(app)
        self.coordinator = get_penetration_coordinator()

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process requests and handle penetration testing mode endpoints.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response

        """
        # Handle penetration testing control endpoints
        if request.url.path == "/api/penetration-testing/activate":
            return await self._handle_activate(request)
        if request.url.path == "/api/penetration-testing/deactivate":
            return await self._handle_deactivate(request)
        if request.url.path == "/api/penetration-testing/status":
            return await self._handle_status(request)

        # Check if penetration testing is active and add header
        response = await call_next(request)

        if self.coordinator.is_penetration_testing_active():
            response.headers["X-Penetration-Testing"] = "active"
            session_info = self.coordinator.get_session_info()
            response.headers["X-PT-Session-ID"] = session_info.get("session_id", "")
            response.headers["X-PT-Remaining"] = str(
                session_info.get("remaining_seconds", 0),
            )

        return response

    async def _handle_activate(self, request: Request) -> Response:
        """Handle penetration testing activation request."""
        if request.method != "POST":
            return Response("Method not allowed", status_code=405)

        try:
            data = await request.json()
            session_id = data.get("session_id", f"session_{int(time.time())}")
            timeout_minutes = data.get("timeout_minutes", 30)

            success = self.coordinator.activate_penetration_testing(
                session_id,
                timeout_minutes,
            )

            if success:
                return Response(
                    f"Penetration testing mode activated: {session_id}",
                    status_code=200,
                    headers={"X-PT-Session-ID": session_id},
                )
            return Response("Penetration testing mode already active", status_code=409)

        except Exception as e:
            return Response(
                f"Error activating penetration testing: {e!s}",
                status_code=500,
            )

    async def _handle_deactivate(self, request: Request) -> Response:
        """Handle penetration testing deactivation request."""
        if request.method != "POST":
            return Response("Method not allowed", status_code=405)

        try:
            data = await request.json()
            session_id = data.get("session_id")

            if not session_id:
                return Response("Session ID required", status_code=400)

            success = self.coordinator.deactivate_penetration_testing(session_id)

            if success:
                return Response("Penetration testing mode deactivated", status_code=200)
            return Response(
                "Penetration testing mode not active or invalid session",
                status_code=404,
            )

        except Exception as e:
            return Response(
                f"Error deactivating penetration testing: {e!s}",
                status_code=500,
            )

    async def _handle_status(self, request: Request) -> Response:
        """Handle penetration testing status request."""
        if request.method != "GET":
            return Response("Method not allowed", status_code=405)

        session_info = self.coordinator.get_session_info()
        import json

        return Response(
            content=json.dumps(session_info),
            media_type="application/json",
            status_code=200,
        )


def setup_penetration_testing_middleware(app: FastAPI):
    """Set up penetration testing middleware."""
    app.add_middleware(PenetrationTestingMiddleware)


def check_penetration_testing_state() -> bool:
    """Check if penetration testing mode should be active based on state file.

    This function is called during startup to restore penetration testing
    state if the server was restarted during an active session.

    Returns:
        bool: True if penetration testing should be active

    """
    state_file = Path("/tmp/reynard_penetration_testing.lock")

    if not state_file.exists():
        return False

    try:
        with open(state_file) as f:
            lines = f.readlines()

        state_data = {}
        for line in lines:
            if "=" in line:
                key, value = line.strip().split("=", 1)
                state_data[key] = value

        # Check if this is from the current process
        if state_data.get("PID") != str(os.getpid()):
            # Different process, remove stale file
            state_file.unlink()
            return False

        # Check if session is still valid (not timed out)
        start_time_str = state_data.get("START_TIME")
        timeout_minutes = int(state_data.get("TIMEOUT_MINUTES", "30"))

        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str)
            elapsed = datetime.now() - start_time
            if elapsed > timedelta(minutes=timeout_minutes):
                # Session timed out, remove file
                state_file.unlink()
                return False

        return state_data.get("REYNARD_PENETRATION_TESTING") == "True"

    except Exception as e:
        print(f"Warning: Could not read penetration testing state file: {e}")
        # Remove corrupted file
        try:
            state_file.unlink()
        except:
            pass
        return False
