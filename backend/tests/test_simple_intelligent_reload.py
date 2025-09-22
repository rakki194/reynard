"""
🧪 Tests for Simple Intelligent Service Reload System

This module contains tests for the simplified intelligent reload system,
focusing on file change detection and service mapping.
"""

import os
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI

from app.core.intelligent_reload import (
    ServiceReloadManager,
    get_reload_excludes,
    get_reload_manager,
    should_use_intelligent_reload,
)


class TestServiceReloadManager:
    """Test the ServiceReloadManager class."""

    @pytest.fixture
    def app(self):
        """Create a mock FastAPI app."""
        return FastAPI()

    @pytest.fixture
    def reload_manager(self, app):
        """Create a ServiceReloadManager instance."""
        return ServiceReloadManager(app)

    def test_init(self, app):
        """Test ServiceReloadManager initialization."""
        manager = ServiceReloadManager(app)

        assert manager.app == app
        assert isinstance(manager.service_file_mappings, dict)
        assert "ecs_world" in manager.service_file_mappings
        assert "gatekeeper" in manager.service_file_mappings
        assert "comfy" in manager.service_file_mappings

    def test_service_file_mappings(self, reload_manager):
        """Test that service file mappings are correctly configured."""
        mappings = reload_manager.service_file_mappings

        # Test ECS world mapping
        assert "ecs_world" in mappings
        assert "app/ecs/**/*.py" in mappings["ecs_world"]
        assert "app/ecs/**/*.json" in mappings["ecs_world"]

        # Test gatekeeper mapping
        assert "gatekeeper" in mappings
        assert "gatekeeper/**/*.py" in mappings["gatekeeper"]
        assert "app/auth/**/*.py" in mappings["gatekeeper"]
        assert "app/security/**/*.py" in mappings["gatekeeper"]

        # Test other services
        assert "comfy" in mappings
        assert "nlweb" in mappings
        assert "rag" in mappings
        assert "search" in mappings
        assert "ollama" in mappings
        assert "tts" in mappings
        assert "image_processing" in mappings
        assert "ai_email_response" in mappings

    def test_should_reload_service_ecs(self, reload_manager):
        """Test ECS service reload detection."""
        # Test ECS Python files
        assert (
            reload_manager.should_reload_service("app/ecs/world.py", "ecs_world")
            is True
        )
        assert (
            reload_manager.should_reload_service("app/ecs/service.py", "ecs_world")
            is True
        )
        assert (
            reload_manager.should_reload_service(
                "app/ecs/endpoints/agents.py", "ecs_world"
            )
            is True
        )
        assert (
            reload_manager.should_reload_service("app/ecs/database.py", "ecs_world")
            is True
        )

        # Test ECS JSON files
        assert (
            reload_manager.should_reload_service("app/ecs/config.json", "ecs_world")
            is True
        )
        assert (
            reload_manager.should_reload_service(
                "app/ecs/data/agents.json", "ecs_world"
            )
            is True
        )

        # Test ECS YAML files
        assert (
            reload_manager.should_reload_service("app/ecs/config.yaml", "ecs_world")
            is True
        )
        assert (
            reload_manager.should_reload_service("app/ecs/data/agents.yml", "ecs_world")
            is True
        )

        # Test non-ECS files
        assert (
            reload_manager.should_reload_service("app/ecs/world.py", "gatekeeper")
            is False
        )
        assert reload_manager.should_reload_service("main.py", "ecs_world") is False

    def test_should_reload_service_gatekeeper(self, reload_manager):
        """Test gatekeeper service reload detection."""
        # Test gatekeeper files
        assert (
            reload_manager.should_reload_service(
                "gatekeeper/api/routes.py", "gatekeeper"
            )
            is True
        )
        assert (
            reload_manager.should_reload_service("gatekeeper/auth/jwt.py", "gatekeeper")
            is True
        )

        # Test auth files
        assert (
            reload_manager.should_reload_service(
                "app/auth/user_service.py", "gatekeeper"
            )
            is True
        )
        assert (
            reload_manager.should_reload_service(
                "app/auth/password_utils.py", "gatekeeper"
            )
            is True
        )

        # Test security files
        assert (
            reload_manager.should_reload_service(
                "app/security/input_validator.py", "gatekeeper"
            )
            is True
        )
        assert (
            reload_manager.should_reload_service(
                "app/security/security_config.py", "gatekeeper"
            )
            is True
        )

        # Test non-gatekeeper files
        assert (
            reload_manager.should_reload_service("app/ecs/world.py", "gatekeeper")
            is False
        )
        assert reload_manager.should_reload_service("main.py", "gatekeeper") is False

    def test_should_reload_service_comfy(self, reload_manager):
        """Test ComfyUI service reload detection."""
        # Test ComfyUI API files
        assert (
            reload_manager.should_reload_service("app/api/comfy/generate.py", "comfy")
            is True
        )
        assert (
            reload_manager.should_reload_service("app/api/comfy/models.py", "comfy")
            is True
        )

        # Test ComfyUI service files
        assert (
            reload_manager.should_reload_service(
                "app/services/comfy/comfy_service.py", "comfy"
            )
            is True
        )
        assert (
            reload_manager.should_reload_service(
                "app/services/comfy/workflow.py", "comfy"
            )
            is True
        )

        # Test non-ComfyUI files
        assert (
            reload_manager.should_reload_service("app/ecs/world.py", "comfy") is False
        )
        assert reload_manager.should_reload_service("main.py", "comfy") is False

    def test_get_affected_services_single(self, reload_manager):
        """Test getting affected services for single service changes."""
        # Test ECS changes
        affected = reload_manager.get_affected_services("app/ecs/world.py")
        assert "ecs_world" in affected
        assert len(affected) == 1

        # Test gatekeeper changes
        affected = reload_manager.get_affected_services("gatekeeper/api/routes.py")
        assert "gatekeeper" in affected
        assert len(affected) == 1

        # Test ComfyUI changes
        affected = reload_manager.get_affected_services("app/api/comfy/generate.py")
        assert "comfy" in affected
        assert len(affected) == 1

    def test_get_affected_services_multiple(self, reload_manager):
        """Test getting affected services for files that might affect multiple services."""
        # Test RAG service files
        affected = reload_manager.get_affected_services(
            "app/services/initial_indexing.py"
        )
        assert "rag" in affected

        # Test AI email response files
        affected = reload_manager.get_affected_services(
            "app/services/ai_email_response_service.py"
        )
        assert "ai_email_response" in affected

    def test_get_affected_services_none(self, reload_manager):
        """Test getting affected services for files that don't affect any services."""
        # Test core files
        affected = reload_manager.get_affected_services("main.py")
        assert len(affected) == 0

        affected = reload_manager.get_affected_services("app/core/config.py")
        assert len(affected) == 0

        affected = reload_manager.get_affected_services("app/core/app_factory.py")
        assert len(affected) == 0

    def test_log_reload_attempt(self, reload_manager, caplog):
        """Test logging reload attempts."""
        with caplog.at_level("INFO"):
            reload_manager.log_reload_attempt("ecs_world")

        assert "Would reload service: ecs_world" in caplog.text


class TestUtilityFunctions:
    """Test utility functions for simple intelligent reload."""

    def test_get_reload_manager_singleton(self):
        """Test that get_reload_manager returns a singleton."""
        app1 = FastAPI()
        app2 = FastAPI()

        manager1 = get_reload_manager(app1)
        manager2 = get_reload_manager(app2)

        # Should return the same instance
        assert manager1 is manager2

    def test_should_use_intelligent_reload_default(self):
        """Test default intelligent reload setting."""
        # Clear environment variable
        if "INTELLIGENT_RELOAD" in os.environ:
            del os.environ["INTELLIGENT_RELOAD"]

        # Should default to True
        assert should_use_intelligent_reload() is True

    def test_should_use_intelligent_reload_enabled(self):
        """Test intelligent reload enabled."""
        os.environ["INTELLIGENT_RELOAD"] = "true"
        assert should_use_intelligent_reload() is True

        os.environ["INTELLIGENT_RELOAD"] = "True"
        assert should_use_intelligent_reload() is True

        os.environ["INTELLIGENT_RELOAD"] = "TRUE"
        assert should_use_intelligent_reload() is True

    def test_should_use_intelligent_reload_disabled(self):
        """Test intelligent reload disabled."""
        os.environ["INTELLIGENT_RELOAD"] = "false"
        assert should_use_intelligent_reload() is False

        os.environ["INTELLIGENT_RELOAD"] = "False"
        assert should_use_intelligent_reload() is False

        os.environ["INTELLIGENT_RELOAD"] = "FALSE"
        assert should_use_intelligent_reload() is False

    def test_get_reload_excludes_intelligent_enabled(self):
        """Test reload excludes with intelligent reload enabled."""
        os.environ["INTELLIGENT_RELOAD"] = "true"

        excludes = get_reload_excludes()

        # Should not exclude ECS files when intelligent reload is enabled
        assert "app/ecs/**/*.py" not in excludes
        assert "*.pyc" in excludes
        assert "__pycache__/**/*" in excludes

        # Should exclude test files and directories
        assert "tests/**/*" in excludes
        assert "test/**/*" in excludes
        assert "**/tests/**/*" in excludes
        assert "**/test/**/*" in excludes
        assert "**/__tests__/**/*" in excludes
        assert "**/test_*.py" in excludes
        assert "**/*_test.py" in excludes
        assert "**/conftest.py" in excludes

    def test_get_reload_excludes_intelligent_disabled(self):
        """Test reload excludes with intelligent reload disabled."""
        os.environ["INTELLIGENT_RELOAD"] = "false"

        excludes = get_reload_excludes()

        # Should exclude ECS files when intelligent reload is disabled
        assert "app/ecs/**/*.py" in excludes
        assert "*.pyc" in excludes
        assert "__pycache__/**/*" in excludes

        # Should exclude test files and directories
        assert "tests/**/*" in excludes
        assert "test/**/*" in excludes
        assert "**/tests/**/*" in excludes
        assert "**/test/**/*" in excludes
        assert "**/__tests__/**/*" in excludes
        assert "**/test_*.py" in excludes
        assert "**/*_test.py" in excludes
        assert "**/conftest.py" in excludes


class TestFilePatternMatching:
    """Test file pattern matching functionality."""

    @pytest.fixture
    def reload_manager(self):
        """Create a ServiceReloadManager instance."""
        app = FastAPI()
        return ServiceReloadManager(app)

    def test_python_file_patterns(self, reload_manager):
        """Test Python file pattern matching."""
        # Test ECS Python files
        test_files = [
            "app/ecs/world.py",
            "app/ecs/service.py",
            "app/ecs/endpoints/agents.py",
            "app/ecs/database/models.py",
            "app/ecs/services/agent_manager.py",
        ]

        for file_path in test_files:
            assert reload_manager.should_reload_service(file_path, "ecs_world") is True

    def test_json_file_patterns(self, reload_manager):
        """Test JSON file pattern matching."""
        # Test ECS JSON files
        test_files = [
            "app/ecs/config.json",
            "app/ecs/data/agents.json",
            "app/ecs/schemas/agent_schema.json",
        ]

        for file_path in test_files:
            assert reload_manager.should_reload_service(file_path, "ecs_world") is True

    def test_yaml_file_patterns(self, reload_manager):
        """Test YAML file pattern matching."""
        # Test ECS YAML files
        test_files = [
            "app/ecs/config.yaml",
            "app/ecs/data/agents.yml",
            "app/ecs/schemas/agent_schema.yaml",
        ]

        for file_path in test_files:
            assert reload_manager.should_reload_service(file_path, "ecs_world") is True

    def test_nested_directory_patterns(self, reload_manager):
        """Test nested directory pattern matching."""
        # Test deeply nested ECS files
        test_files = [
            "app/ecs/services/agents/manager.py",
            "app/ecs/endpoints/v1/agents.py",
            "app/ecs/database/migrations/001_create_agents.py",
            "app/ecs/utils/helpers/validation.py",
        ]

        for file_path in test_files:
            assert reload_manager.should_reload_service(file_path, "ecs_world") is True

    def test_non_matching_files(self, reload_manager):
        """Test files that should not match any service patterns."""
        # Test files that should not match ECS patterns
        test_files = [
            "main.py",
            "app/core/config.py",
            "app/core/app_factory.py",
            "gatekeeper/api/routes.py",
            "app/api/comfy/generate.py",
            "app/services/rag/rag_service.py",
        ]

        for file_path in test_files:
            assert reload_manager.should_reload_service(file_path, "ecs_world") is False


class TestIntegration:
    """Integration tests for the simple intelligent reload system."""

    @pytest.fixture
    def reload_manager(self):
        """Create a ServiceReloadManager instance."""
        app = FastAPI()
        return ServiceReloadManager(app)

    def test_complete_ecs_workflow(self, reload_manager):
        """Test complete ECS file change workflow."""
        # Simulate ECS file change
        file_path = "app/ecs/world.py"

        # Check if service should reload
        should_reload = reload_manager.should_reload_service(file_path, "ecs_world")
        assert should_reload is True

        # Get affected services
        affected_services = reload_manager.get_affected_services(file_path)
        assert "ecs_world" in affected_services
        assert len(affected_services) == 1

    def test_complete_gatekeeper_workflow(self, reload_manager):
        """Test complete gatekeeper file change workflow."""
        # Simulate gatekeeper file change
        file_path = "gatekeeper/api/routes.py"

        # Check if service should reload
        should_reload = reload_manager.should_reload_service(file_path, "gatekeeper")
        assert should_reload is True

        # Get affected services
        affected_services = reload_manager.get_affected_services(file_path)
        assert "gatekeeper" in affected_services
        assert len(affected_services) == 1

    def test_multiple_service_changes(self, reload_manager):
        """Test handling multiple service file changes."""
        # Simulate changes to multiple services
        file_changes = [
            "app/ecs/world.py",
            "gatekeeper/api/routes.py",
            "app/api/comfy/generate.py",
        ]

        all_affected = set()
        for file_path in file_changes:
            affected = reload_manager.get_affected_services(file_path)
            all_affected.update(affected)

        # Should affect multiple services
        assert "ecs_world" in all_affected
        assert "gatekeeper" in all_affected
        assert "comfy" in all_affected
        assert len(all_affected) == 3

    def test_no_service_changes(self, reload_manager):
        """Test handling files that don't affect any services."""
        # Simulate core file changes
        file_changes = [
            "main.py",
            "app/core/config.py",
            "app/core/app_factory.py",
        ]

        for file_path in file_changes:
            affected = reload_manager.get_affected_services(file_path)
            assert len(affected) == 0

    def test_comprehensive_service_coverage(self, reload_manager):
        """Test that all expected services are covered."""
        expected_services = [
            "ecs_world",
            "gatekeeper",
            "comfy",
            "nlweb",
            "rag",
            "search",
            "ollama",
            "tts",
            "image_processing",
            "ai_email_response",
        ]

        # Check that all services are in file mappings
        for service in expected_services:
            assert service in reload_manager.service_file_mappings

    def test_deep_nested_file_patterns(self, reload_manager):
        """Test file pattern matching for deeply nested files."""
        # Test deeply nested ECS files
        nested_files = [
            "app/ecs/services/agents/manager.py",
            "app/ecs/endpoints/v1/agents.py",
            "app/ecs/database/migrations/001_create_agents.py",
            "app/ecs/utils/helpers/validation.py",
            "app/ecs/models/agents/personality.py",
            "app/ecs/systems/breeding/genetics.py",
        ]

        for file_path in nested_files:
            affected_services = reload_manager.get_affected_services(file_path)
            assert (
                "ecs_world" in affected_services
            ), f"File {file_path} should affect ECS world service"

    def test_mixed_file_types(self, reload_manager):
        """Test file pattern matching for different file types."""
        # Test different file types for ECS
        file_types = [
            "app/ecs/config.py",
            "app/ecs/config.json",
            "app/ecs/config.yaml",
            "app/ecs/config.yml",
        ]

        for file_path in file_types:
            affected_services = reload_manager.get_affected_services(file_path)
            assert (
                "ecs_world" in affected_services
            ), f"File {file_path} should affect ECS world service"
