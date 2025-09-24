#!/usr/bin/env python3
"""
Unit tests for Version Service.
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from services.version_service import VersionService


class TestVersionService:
    """Test cases for VersionService."""

    def test_init_with_custom_project_root(self, temp_dir: Path):
        """Test initialization with custom project root."""
        service = VersionService(project_root=temp_dir)
        assert service.project_root == temp_dir

    def test_init_with_default_project_root(self):
        """Test initialization with default project root."""
        with patch("services.version_service.Path") as mock_path:
            mock_path.return_value.parent.parent.parent = Path("/test/project/root")
            service = VersionService()
            assert service.project_root == Path("/test/project/root")

    @pytest.mark.asyncio
    async def test_get_python_version_success(self, temp_dir: Path):
        """Test getting Python version successfully."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = "Python 3.13.7\n"
            mock_run.return_value = mock_result

            version = await service.get_python_version()

            assert version == "3.13.7"
            mock_run.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_python_version_failure(self, temp_dir: Path):
        """Test getting Python version when command fails."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 1
            mock_result.stdout = "Error: command not found"
            mock_run.return_value = mock_result

            version = await service.get_python_version()

            assert version == service.NOT_AVAILABLE

    @pytest.mark.asyncio
    async def test_get_node_version_success(self, temp_dir: Path):
        """Test getting Node.js version successfully."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = "v24.7.0\n"
            mock_run.return_value = mock_result

            version = await service.get_node_version()

            assert version == "v24.7.0"
            mock_run.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_node_version_failure(self, temp_dir: Path):
        """Test getting Node.js version when command fails."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 1
            mock_result.stdout = "Error: command not found"
            mock_run.return_value = mock_result

            version = await service.get_node_version()

            assert version == service.NOT_AVAILABLE

    @pytest.mark.asyncio
    async def test_get_typescript_version_success(self, temp_dir: Path):
        """Test getting TypeScript version successfully."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = "Version 5.9.2\n"
            mock_run.return_value = mock_result

            version = await service.get_typescript_version()

            assert version == "5.9.2"
            mock_run.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_typescript_version_failure(self, temp_dir: Path):
        """Test getting TypeScript version when command fails."""
        service = VersionService(project_root=temp_dir)

        with patch("subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.returncode = 1
            mock_result.stdout = "Error: command not found"
            mock_run.return_value = mock_result

            version = await service.get_typescript_version()

            assert version == service.NOT_AVAILABLE

    @pytest.mark.asyncio
    async def test_get_versions_all_success(self, temp_dir: Path):
        """Test getting all versions successfully."""
        service = VersionService(project_root=temp_dir)

        with (
            patch.object(service, "get_python_version", return_value="3.13.7"),
            patch.object(service, "get_node_version", return_value="v24.7.0"),
            patch.object(service, "get_typescript_version", return_value="5.9.2"),
        ):
            versions = await service.get_versions()

            assert versions["python"] == "3.13.7"
            assert versions["node"] == "v24.7.0"
            assert versions["typescript"] == "5.9.2"

    @pytest.mark.asyncio
    async def test_get_versions_mixed_results(self, temp_dir: Path):
        """Test getting versions with mixed success/failure."""
        service = VersionService(project_root=temp_dir)

        with (
            patch.object(service, "get_python_version", return_value="3.13.7"),
            patch.object(
                service, "get_node_version", return_value=service.NOT_AVAILABLE
            ),
            patch.object(service, "get_typescript_version", return_value="5.9.2"),
        ):
            versions = await service.get_versions()

            assert versions["python"] == "3.13.7"
            assert versions["node"] == service.NOT_AVAILABLE
            assert versions["typescript"] == "5.9.2"

    @pytest.mark.asyncio
    async def test_get_versions_all_failure(self, temp_dir: Path):
        """Test getting versions when all commands fail."""
        service = VersionService(project_root=temp_dir)

        with (
            patch.object(
                service, "get_python_version", return_value=service.NOT_AVAILABLE
            ),
            patch.object(
                service, "get_node_version", return_value=service.NOT_AVAILABLE
            ),
            patch.object(
                service, "get_typescript_version", return_value=service.NOT_AVAILABLE
            ),
        ):
            versions = await service.get_versions()

            assert versions["python"] == service.NOT_AVAILABLE
            assert versions["node"] == service.NOT_AVAILABLE
            assert versions["typescript"] == service.NOT_AVAILABLE

    def test_format_version_output_python(self, temp_dir: Path):
        """Test formatting Python version output."""
        service = VersionService(project_root=temp_dir)

        # Test with standard Python output
        version = service._format_version_output("Python 3.13.7\n", "python")
        assert version == "3.13.7"

        # Test with version only
        version = service._format_version_output("3.13.7\n", "python")
        assert version == "3.13.7"

    def test_format_version_output_node(self, temp_dir: Path):
        """Test formatting Node.js version output."""
        service = VersionService(project_root=temp_dir)

        # Test with standard Node output
        version = service._format_version_output("v24.7.0\n", "node")
        assert version == "v24.7.0"

        # Test with version only
        version = service._format_version_output("24.7.0\n", "node")
        assert version == "24.7.0"

    def test_format_version_output_typescript(self, temp_dir: Path):
        """Test formatting TypeScript version output."""
        service = VersionService(project_root=temp_dir)

        # Test with standard TypeScript output
        version = service._format_version_output("Version 5.9.2\n", "typescript")
        assert version == "5.9.2"

        # Test with version only
        version = service._format_version_output("5.9.2\n", "typescript")
        assert version == "5.9.2"

    def test_format_version_output_empty(self, temp_dir: Path):
        """Test formatting empty version output."""
        service = VersionService(project_root=temp_dir)

        version = service._format_version_output("", "python")
        assert version == service.NOT_AVAILABLE

        version = service._format_version_output("\n", "python")
        assert version == service.NOT_AVAILABLE
