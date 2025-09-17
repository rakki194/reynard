"""
Penetration Testing Client for Fenrir Suite

This client coordinates with the Reynard backend to manage penetration testing
sessions, ensuring that auto-reloading is disabled during security testing.

Features:
- Session activation/deactivation
- Timeout management
- Automatic cleanup on exit
- Integration with all fenrir exploit modules
"""

import atexit
import time
import uuid
from contextlib import contextmanager
from typing import Any

import requests


class PenetrationTestingClient:
    """
    Client for coordinating penetration testing sessions with the backend.

    This client manages the penetration testing mode state and ensures
    that the backend doesn't auto-reload during security testing sessions.
    """

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id: str | None = None
        self.is_active = False
        self.timeout_minutes = 30
        self.session = requests.Session()

        # Set fenrir user agent for bypass detection
        self.session.headers.update(
            {"User-Agent": "BlackHat Exploit Suite", "Content-Type": "application/json"}
        )

        # Register cleanup on exit
        atexit.register(self.cleanup)

    def activate_penetration_testing(self, timeout_minutes: int = 30) -> bool:
        """
        Activate penetration testing mode on the backend.

        Args:
            timeout_minutes: Maximum duration for the session

        Returns:
            bool: True if successfully activated
        """
        if self.is_active:
            print("🦊 Penetration testing mode already active")
            return True

        try:
            # Generate unique session ID
            self.session_id = f"fenrir_{uuid.uuid4().hex[:8]}_{int(time.time())}"
            self.timeout_minutes = timeout_minutes

            # Send activation request
            response = self.session.post(
                f"{self.base_url}/api/penetration-testing/activate",
                json={
                    "session_id": self.session_id,
                    "timeout_minutes": timeout_minutes,
                },
                timeout=10,
            )

            if response.status_code == 200:
                self.is_active = True
                print(f"🦊 Penetration testing mode activated: {self.session_id}")
                print(f"   Timeout: {timeout_minutes} minutes")
                print("   Auto-reload disabled on backend")
                return True
            if response.status_code == 409:
                print("🦊 Penetration testing mode already active on backend")
                return True
            print(f"❌ Failed to activate penetration testing: {response.text}")
            return False

        except requests.exceptions.RequestException as e:
            print(f"❌ Error activating penetration testing: {e}")
            return False

    def deactivate_penetration_testing(self) -> bool:
        """
        Deactivate penetration testing mode on the backend.

        Returns:
            bool: True if successfully deactivated
        """
        if not self.is_active or not self.session_id:
            return True

        try:
            response = self.session.post(
                f"{self.base_url}/api/penetration-testing/deactivate",
                json={"session_id": self.session_id},
                timeout=10,
            )

            if response.status_code == 200:
                print(f"🦊 Penetration testing mode deactivated: {self.session_id}")
                print("   Auto-reload re-enabled on backend")
                self.is_active = False
                self.session_id = None
                return True
            print(f"❌ Failed to deactivate penetration testing: {response.text}")
            return False

        except requests.exceptions.RequestException as e:
            print(f"❌ Error deactivating penetration testing: {e}")
            return False

    def get_status(self) -> dict[str, Any] | None:
        """
        Get current penetration testing status from the backend.

        Returns:
            dict: Status information or None if error
        """
        try:
            response = self.session.get(
                f"{self.base_url}/api/penetration-testing/status", timeout=10
            )

            if response.status_code == 200:
                return response.json()
            print(f"❌ Failed to get penetration testing status: {response.text}")
            return None

        except requests.exceptions.RequestException as e:
            print(f"❌ Error getting penetration testing status: {e}")
            return None

    def is_backend_ready(self) -> bool:
        """
        Check if the backend is ready and responsive.

        Returns:
            bool: True if backend is ready
        """
        try:
            response = self.session.get(f"{self.base_url}/", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def wait_for_backend(self, max_wait_seconds: int = 30) -> bool:
        """
        Wait for the backend to become ready.

        Args:
            max_wait_seconds: Maximum time to wait

        Returns:
            bool: True if backend becomes ready
        """
        print("🦊 Waiting for backend to be ready...")

        start_time = time.time()
        while time.time() - start_time < max_wait_seconds:
            if self.is_backend_ready():
                print("✅ Backend is ready")
                return True

            time.sleep(1)
            print(".", end="", flush=True)

        print(f"\n❌ Backend not ready after {max_wait_seconds} seconds")
        return False

    def cleanup(self):
        """Clean up penetration testing session on exit."""
        if self.is_active:
            print("\n🦊 Cleaning up penetration testing session...")
            self.deactivate_penetration_testing()

    @contextmanager
    def penetration_testing_session(self, timeout_minutes: int = 30):
        """
        Context manager for penetration testing sessions.

        Args:
            timeout_minutes: Maximum duration for the session

        Yields:
            PenetrationTestingClient: The client instance
        """
        try:
            # Wait for backend to be ready
            if not self.wait_for_backend():
                raise RuntimeError("Backend not ready")

            # Activate penetration testing mode
            if not self.activate_penetration_testing(timeout_minutes):
                raise RuntimeError("Failed to activate penetration testing mode")

            yield self

        finally:
            # Always deactivate on exit
            self.deactivate_penetration_testing()


# Global client instance
_penetration_client: PenetrationTestingClient | None = None


def get_penetration_client() -> PenetrationTestingClient:
    """Get the global penetration testing client instance."""
    global _penetration_client
    if _penetration_client is None:
        _penetration_client = PenetrationTestingClient()
    return _penetration_client


def activate_penetration_testing(timeout_minutes: int = 30) -> bool:
    """
    Activate penetration testing mode.

    Args:
        timeout_minutes: Maximum duration for the session

    Returns:
        bool: True if successfully activated
    """
    client = get_penetration_client()
    return client.activate_penetration_testing(timeout_minutes)


def deactivate_penetration_testing() -> bool:
    """
    Deactivate penetration testing mode.

    Returns:
        bool: True if successfully deactivated
    """
    client = get_penetration_client()
    return client.deactivate_penetration_testing()


@contextmanager
def penetration_testing_session(timeout_minutes: int = 30):
    """
    Context manager for penetration testing sessions.

    Args:
        timeout_minutes: Maximum duration for the session

    Yields:
        PenetrationTestingClient: The client instance
    """
    client = get_penetration_client()
    with client.penetration_testing_session(timeout_minutes) as session:
        yield session


# Convenience functions for use in exploit modules
def start_penetration_testing(timeout_minutes: int = 30) -> bool:
    """Start penetration testing session."""
    return activate_penetration_testing(timeout_minutes)


def stop_penetration_testing() -> bool:
    """Stop penetration testing session."""
    return deactivate_penetration_testing()


def is_penetration_testing_active() -> bool:
    """Check if penetration testing is currently active."""
    client = get_penetration_client()
    status = client.get_status()
    return status is not None and status.get("active", False)
