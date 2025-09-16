#!/usr/bin/env python3
"""
ECS Notification System Tests
=============================

Tests for the ECS notification system and queue watcher integration.
"""

import sys
from pathlib import Path

import pytest

# Add the MCP scripts directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ecs.event_system import ECSEvent, ECSEventSystem, ECSEventType
from ecs.notification_handler import ECSNotificationHandler
from ecs.queue_watcher_integration import ECSQueueWatcher


class TestECSNotifications:
    """Test suite for ECS notification system."""

    @pytest.fixture
    def temp_data_dir(self, tmp_path):
        """Create temporary data directory for tests."""
        return tmp_path / "test_ecs_notifications"

    @pytest.fixture
    def event_system(self, temp_data_dir):
        """Create event system for testing."""
        return ECSEventSystem(temp_data_dir)

    @pytest.fixture
    def notification_handler(self, temp_data_dir):
        """Create notification handler for testing."""
        return ECSNotificationHandler(temp_data_dir)

    def test_event_system_creation(self, temp_data_dir):
        """Test that event system can be created."""
        event_system = ECSEventSystem(temp_data_dir)
        assert event_system is not None
        assert event_system.data_dir == temp_data_dir

    def test_event_emission(self, event_system):
        """Test that events can be emitted."""
        event = ECSEvent(
            event_type=ECSEventType.AGENT_CREATED,
            timestamp=1234567890,
            agent_id="test-agent",
            data={"spirit": "fox", "style": "foundation"},
        )

        initial_count = len(event_system.events)
        event_system.emit_event(event)

        assert len(event_system.events) == initial_count + 1
        assert event_system.events[-1] == event

    def test_event_handler_registration(self, event_system):
        """Test that event handlers can be registered."""

        def test_handler(event):
            pass

        event_system.register_handler(ECSEventType.AGENT_CREATED, test_handler)

        assert test_handler in event_system.handlers[ECSEventType.AGENT_CREATED]

    def test_notification_handler_creation(self, temp_data_dir):
        """Test that notification handler can be created."""
        handler = ECSNotificationHandler(temp_data_dir)
        assert handler is not None
        assert handler.enabled == True

    def test_notification_handler_stats(self, notification_handler):
        """Test notification handler statistics."""
        stats = notification_handler.get_notification_stats()

        assert "enabled" in stats
        assert "total_notifications" in stats
        assert "successful_notifications" in stats
        assert "success_rate" in stats

    def test_queue_watcher_creation(self, temp_data_dir):
        """Test that queue watcher can be created."""
        watcher = ECSQueueWatcher(temp_data_dir)
        assert watcher is not None
        assert watcher.running == False

    def test_queue_watcher_stats(self, temp_data_dir):
        """Test queue watcher statistics."""
        watcher = ECSQueueWatcher(temp_data_dir)
        stats = watcher.get_stats()

        assert "running" in stats
        assert "uptime_seconds" in stats
        assert "events_processed" in stats
        assert "notifications_sent" in stats

    def test_event_types_coverage(self):
        """Test that all event types are covered."""
        # Test that all event types have urgency levels
        handler = ECSNotificationHandler(Path("/tmp/test"))

        for event_type in ECSEventType:
            assert event_type in handler.urgency_levels

    def test_event_serialization(self, event_system):
        """Test that events can be serialized and deserialized."""
        event = ECSEvent(
            event_type=ECSEventType.BREEDING_SUCCESSFUL,
            timestamp=1234567890,
            agent_id="test-agent",
            parent1_id="parent1",
            parent2_id="parent2",
            data={"compatibility": 0.8},
        )

        # Test serialization
        event_dict = event.to_dict()
        assert event_dict["event_type"] == "breeding_successful"
        assert event_dict["agent_id"] == "test-agent"
        assert event_dict["parent1_id"] == "parent1"
        assert event_dict["parent2_id"] == "parent2"

        # Test deserialization
        restored_event = event_system._dict_to_event(event_dict)
        assert restored_event is not None
        assert restored_event.event_type == ECSEventType.BREEDING_SUCCESSFUL
        assert restored_event.agent_id == "test-agent"

    def test_notification_handler_enable_disable(self, notification_handler):
        """Test notification handler enable/disable functionality."""
        assert notification_handler.enabled == True

        notification_handler.disable_notifications()
        assert notification_handler.enabled == False

        notification_handler.enable_notifications()
        assert notification_handler.enabled == True

    def test_event_system_queue_integration(self, event_system):
        """Test event system queue integration."""
        assert event_system.queue_enabled == False

        event_system.enable_queue_integration()
        assert event_system.queue_enabled == True

        event_system.disable_queue_integration()
        assert event_system.queue_enabled == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
