"""Local Mermaid Service

A service that runs a local mermaid.ink server for reliable diagram rendering.
This eliminates dependency on external services and provides better control.
"""

import base64
import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any

import requests


class LocalMermaidService:
    """Local mermaid service that runs a mermaid.ink server instance.

    This service provides reliable diagram rendering without depending on
    external services by running a local mermaid.ink server.
    """

    def __init__(self, port: int = 3001, mermaid_ink_path: str | None = None):
        """Initialize the local mermaid service.

        Args:
            port: Port to run the mermaid.ink server on
            mermaid_ink_path: Path to the mermaid.ink directory

        """
        self.port = port
        self.base_url = f"http://localhost:{port}"
        self.mermaid_ink_path = (
            mermaid_ink_path or "/home/kade/runeset/reynard/third_party/mermaid.ink"
        )
        self.server_process = None
        self.server_ready = False
        self._start_server()

    def _start_server(self):
        """Start the mermaid.ink server in the background."""
        try:
            # Check if mermaid.ink directory exists
            if not Path(self.mermaid_ink_path).exists():
                raise FileNotFoundError(
                    f"Mermaid.ink directory not found: {self.mermaid_ink_path}",
                )

            # Start the server
            env = os.environ.copy()
            env["PORT"] = str(self.port)

            self.server_process = subprocess.Popen(
                ["node", "src/index.js"],
                cwd=self.mermaid_ink_path,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            # Wait for server to be ready
            self._wait_for_server()

        except Exception as e:
            raise RuntimeError(f"Failed to start mermaid.ink server: {e}") from e

    def _wait_for_server(self, timeout: int = 30):
        """Wait for the server to be ready."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{self.base_url}/", timeout=1)
                if response.status_code == 200:
                    self.server_ready = True
                    return
            except requests.exceptions.RequestException:
                pass
            time.sleep(0.5)

        raise RuntimeError(f"Server failed to start within {timeout} seconds")

    def _encode_diagram(self, diagram: str) -> str:
        """Encode a mermaid diagram for the API.

        Args:
            diagram: The mermaid diagram content

        Returns:
            Base64 encoded diagram

        """
        # Create the state object that mermaid.ink expects
        state = {"code": diagram, "mermaid": json.dumps({"theme": "default"})}

        # Encode as base64
        state_json = json.dumps(state)
        encoded = base64.urlsafe_b64encode(state_json.encode("utf-8")).decode("ascii")
        return encoded

    def render_to_svg(self, diagram: str) -> str:
        """Render a mermaid diagram to SVG format.

        Args:
            diagram: The mermaid diagram script

        Returns:
            SVG content as string

        Raises:
            RuntimeError: If rendering fails

        """
        if not self.server_ready:
            raise RuntimeError("Mermaid server is not ready")

        encoded_diagram = self._encode_diagram(diagram)
        url = f"{self.base_url}/svg/{encoded_diagram}"

        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to render diagram to SVG: {e}") from e

    def render_to_png(self, diagram: str) -> bytes:
        """Render a mermaid diagram to PNG format.

        Args:
            diagram: The mermaid diagram script

        Returns:
            PNG content as bytes

        Raises:
            RuntimeError: If rendering fails

        """
        if not self.server_ready:
            raise RuntimeError("Mermaid server is not ready")

        encoded_diagram = self._encode_diagram(diagram)
        url = f"{self.base_url}/img/{encoded_diagram}"

        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to render diagram to PNG: {e}") from e

    def save_svg(self, diagram: str, output_path: str) -> str:
        """Render and save a mermaid diagram as SVG.

        Args:
            diagram: The mermaid diagram script
            output_path: Path to save the SVG file

        Returns:
            Path to the saved file

        """
        svg_content = self.render_to_svg(diagram)

        # Ensure directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(svg_content)

        return output_path

    def save_png(self, diagram: str, output_path: str) -> str:
        """Render and save a mermaid diagram as PNG.

        Args:
            diagram: The mermaid diagram script
            output_path: Path to save the PNG file

        Returns:
            Path to the saved file

        """
        png_content = self.render_to_png(diagram)

        # Ensure directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "wb") as f:
            f.write(png_content)

        return output_path

    def validate_diagram(self, diagram: str) -> tuple[bool, str]:
        """Validate a mermaid diagram by attempting to render it.

        Args:
            diagram: The mermaid diagram script

        Returns:
            Tuple of (is_valid, error_message)

        """
        try:
            self.render_to_svg(diagram)
            return True, ""
        except Exception as e:
            return False, str(e)

    def get_diagram_stats(self, diagram: str) -> dict[str, Any]:
        """Get statistics about a mermaid diagram.

        Args:
            diagram: The mermaid diagram script

        Returns:
            Dictionary with diagram statistics

        """
        try:
            svg_content = self.render_to_svg(diagram)
            png_content = self.render_to_png(diagram)

            return {
                "valid": True,
                "svg_size": len(svg_content),
                "png_size": len(png_content),
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "error": None,
            }
        except Exception as e:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "error": str(e),
            }

    def shutdown(self):
        """Shutdown the mermaid server."""
        if self.server_process:
            self.server_process.terminate()
            self.server_process.wait()
            self.server_process = None
        self.server_ready = False

    def __del__(self):
        """Cleanup when the service is destroyed."""
        self.shutdown()
