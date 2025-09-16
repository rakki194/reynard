#!/usr/bin/env python3
"""
ECS Event System
================

Event system for ECS world that provides hooks for various actions.
Integrates with queue-watcher for monitoring and notifications.

Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)


class ECSEventType(Enum):
    """Types of ECS events that can be monitored."""

    AGENT_CREATED = "agent_created"
    AGENT_DIED = "agent_died"
    AGENT_MATURED = "agent_matured"
    BREEDING_ATTEMPTED = "breeding_attempted"
    BREEDING_SUCCESSFUL = "breeding_successful"
    BREEDING_FAILED = "breeding_failed"
    OFFSPRING_CREATED = "offspring_created"
    LINEAGE_UPDATED = "lineage_updated"
    SIMULATION_UPDATED = "simulation_updated"
    TIME_ACCELERATED = "time_accelerated"
    WORLD_SAVED = "world_saved"
    WORLD_LOADED = "world_loaded"


@dataclass
class ECSEvent:
    """ECS event data structure."""

    event_type: ECSEventType
    timestamp: datetime
    agent_id: Optional[str] = None
    parent1_id: Optional[str] = None
    parent2_id: Optional[str] = None
    offspring_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for serialization."""
        result = asdict(self)
        result["event_type"] = self.event_type.value
        # Handle both datetime and float timestamps
        if hasattr(self.timestamp, "isoformat"):
            result["timestamp"] = self.timestamp.isoformat()
        else:
            result["timestamp"] = datetime.fromtimestamp(self.timestamp).isoformat()
        return result


class ECSEventSystem:
    """Event system for ECS world monitoring and notifications."""

    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Event storage
        self.events_file = self.data_dir / "ecs_events.json"
        self.events: List[ECSEvent] = []

        # Event handlers
        self.handlers: Dict[ECSEventType, List[Callable[[ECSEvent], None]]] = {
            event_type: [] for event_type in ECSEventType
        }

        # Queue integration
        self.queue_enabled = False
        self.queue_file = self.data_dir / "ecs_event_queue.json"

        # Load existing events
        self._load_events()

        logger.info(
            f"ECS Event System initialized with {len(self.events)} existing events"
        )

    def _load_events(self) -> None:
        """Load events from storage."""
        if self.events_file.exists():
            try:
                with open(self.events_file) as f:
                    data = json.load(f)
                    for event_data in data:
                        event = self._dict_to_event(event_data)
                        if event:
                            self.events.append(event)
            except Exception as e:
                logger.warning(f"Failed to load events: {e}")

    def _save_events(self) -> None:
        """Save events to storage."""
        try:
            with open(self.events_file, "w") as f:
                json.dump([event.to_dict() for event in self.events], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save events: {e}")

    def _dict_to_event(self, data: Dict[str, Any]) -> Optional[ECSEvent]:
        """Convert dictionary to ECSEvent."""
        try:
            return ECSEvent(
                event_type=ECSEventType(data["event_type"]),
                timestamp=datetime.fromisoformat(data["timestamp"]),
                agent_id=data.get("agent_id"),
                parent1_id=data.get("parent1_id"),
                parent2_id=data.get("parent2_id"),
                offspring_id=data.get("offspring_id"),
                data=data.get("data"),
            )
        except Exception as e:
            logger.warning(f"Failed to convert dict to event: {e}")
            return None

    def emit_event(self, event: ECSEvent) -> None:
        """Emit an event to all registered handlers."""
        # Add to events list
        self.events.append(event)

        # Save to storage
        self._save_events()

        # Add to queue if enabled
        if self.queue_enabled:
            self._add_to_queue(event)

        # Notify handlers
        handlers = self.handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Event handler failed: {e}")

        logger.debug(
            f"Emitted event: {event.event_type.value} for agent {event.agent_id}"
        )

    def _add_to_queue(self, event: ECSEvent) -> None:
        """Add event to queue for external processing."""
        try:
            queue_data = []
            if self.queue_file.exists():
                with open(self.queue_file) as f:
                    queue_data = json.load(f)

            queue_data.append(event.to_dict())

            with open(self.queue_file, "w") as f:
                json.dump(queue_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to add event to queue: {e}")

    def register_handler(
        self, event_type: ECSEventType, handler: Callable[[ECSEvent], None]
    ) -> None:
        """Register an event handler."""
        self.handlers[event_type].append(handler)
        logger.info(f"Registered handler for {event_type.value}")

    def unregister_handler(
        self, event_type: ECSEventType, handler: Callable[[ECSEvent], None]
    ) -> None:
        """Unregister an event handler."""
        if handler in self.handlers[event_type]:
            self.handlers[event_type].remove(handler)
            logger.info(f"Unregistered handler for {event_type.value}")

    def enable_queue_integration(self) -> None:
        """Enable queue integration for external processing."""
        self.queue_enabled = True
        logger.info("Queue integration enabled")

    def disable_queue_integration(self) -> None:
        """Disable queue integration."""
        self.queue_enabled = False
        logger.info("Queue integration disabled")

    def get_events(
        self, event_type: Optional[ECSEventType] = None, limit: int = 100
    ) -> List[ECSEvent]:
        """Get recent events, optionally filtered by type."""
        events = self.events
        if event_type:
            events = [e for e in events if e.event_type == event_type]

        return events[-limit:] if limit > 0 else events

    def get_event_stats(self) -> Dict[str, Any]:
        """Get statistics about events."""
        stats = {}
        for event_type in ECSEventType:
            count = len([e for e in self.events if e.event_type == event_type])
            stats[event_type.value] = count

        stats["total_events"] = len(self.events)
        stats["handlers_registered"] = sum(
            len(handlers) for handlers in self.handlers.values()
        )

        return stats

    def clear_events(self) -> None:
        """Clear all events."""
        self.events.clear()
        self._save_events()
        logger.info("All events cleared")

    def clear_queue(self) -> None:
        """Clear the event queue."""
        if self.queue_file.exists():
            self.queue_file.unlink()
        logger.info("Event queue cleared")
