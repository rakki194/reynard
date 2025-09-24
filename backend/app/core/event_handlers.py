"""🦊 Reynard Event Handlers
=========================

Advanced event processing and handling utilities for the Reynard backend services,
providing sophisticated event filtering, transformation, and processing capabilities.

This module provides:
- Event filtering and validation
- Event transformation and formatting
- Event routing and distribution
- Event persistence and replay
- Event analytics and monitoring
- Custom event processors

Key Features:
- Event Filtering: Advanced filtering with multiple criteria
- Event Transformation: Flexible data transformation and formatting
- Event Routing: Intelligent event routing and distribution
- Event Persistence: Event storage and replay capabilities
- Event Analytics: Real-time event analytics and monitoring
- Custom Processors: Extensible event processing framework

Author: Reynard Development Team
Version: 2.0.0 - Advanced event processing
"""

import asyncio
import json
import time
from abc import ABC, abstractmethod
from collections import defaultdict, deque
from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, Field

from .exceptions import ValidationError
from .logging_config import get_service_logger

logger = get_service_logger("event_handlers")


class EventFilter(BaseModel):
    """Event filter configuration."""

    name: str
    criteria: dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True
    priority: int = 0  # Higher priority filters run first


class EventTransformer(BaseModel):
    """Event transformer configuration."""

    name: str
    transform_func: str  # Function name to call
    parameters: dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True
    priority: int = 0


class EventProcessor(ABC):
    """Abstract base class for event processors."""

    @abstractmethod
    async def process(self, event: dict[str, Any]) -> dict[str, Any]:
        """Process an event and return the result."""

    @abstractmethod
    def can_handle(self, event: dict[str, Any]) -> bool:
        """Check if this processor can handle the event."""


class EventRouter:
    """Advanced event router with filtering and transformation."""

    def __init__(self, name: str = "default"):
        self.name = name
        self.filters: list[EventFilter] = []
        self.transformers: list[EventTransformer] = []
        self.processors: list[EventProcessor] = []
        self.routes: dict[str, list[Callable]] = defaultdict(list)
        self.event_history: deque = deque(maxlen=10000)  # Keep last 10k events
        self.metrics = {
            "events_processed": 0,
            "events_filtered": 0,
            "events_transformed": 0,
            "events_routed": 0,
            "processing_errors": 0,
        }

    def add_filter(self, filter_config: EventFilter):
        """Add an event filter."""
        self.filters.append(filter_config)
        self.filters.sort(key=lambda f: f.priority, reverse=True)
        logger.info(f"Added event filter: {filter_config.name}")

    def add_transformer(self, transformer_config: EventTransformer):
        """Add an event transformer."""
        self.transformers.append(transformer_config)
        self.transformers.sort(key=lambda t: t.priority, reverse=True)
        logger.info(f"Added event transformer: {transformer_config.name}")

    def add_processor(self, processor: EventProcessor):
        """Add an event processor."""
        self.processors.append(processor)
        logger.info(f"Added event processor: {processor.__class__.__name__}")

    def add_route(self, event_type: str, handler: Callable):
        """Add a route for specific event types."""
        self.routes[event_type].append(handler)
        logger.info(f"Added route for event type: {event_type}")

    async def process_event(self, event: dict[str, Any]) -> dict[str, Any]:
        """Process an event through the router pipeline."""
        start_time = time.time()

        try:
            # Store event in history
            self.event_history.append(
                {"event": event, "timestamp": time.time(), "router": self.name},
            )

            # Apply filters
            if not await self._apply_filters(event):
                self.metrics["events_filtered"] += 1
                return {"status": "filtered", "event": event}

            # Apply transformers
            transformed_event = await self._apply_transformers(event)
            if transformed_event != event:
                self.metrics["events_transformed"] += 1

            # Process with custom processors
            processed_event = await self._apply_processors(transformed_event)

            # Route to handlers
            await self._route_event(processed_event)

            self.metrics["events_processed"] += 1

            processing_time = time.time() - start_time
            logger.debug(f"Event processed in {processing_time:.3f}s")

            return {
                "status": "processed",
                "event": processed_event,
                "processing_time": processing_time,
            }

        except Exception as e:
            self.metrics["processing_errors"] += 1
            logger.error(f"Error processing event: {e}")
            return {"status": "error", "error": str(e), "event": event}

    async def _apply_filters(self, event: dict[str, Any]) -> bool:
        """Apply all enabled filters to the event."""
        for filter_config in self.filters:
            if not filter_config.enabled:
                continue

            if not await self._evaluate_filter(filter_config, event):
                logger.debug(f"Event filtered out by {filter_config.name}")
                return False

        return True

    async def _evaluate_filter(
        self, filter_config: EventFilter, event: dict[str, Any],
    ) -> bool:
        """Evaluate a single filter against an event."""
        criteria = filter_config.criteria

        # Type filter
        if "type" in criteria and event.get("type") != criteria["type"]:
            return False

        # Metadata filters
        if "metadata" in criteria:
            event_metadata = event.get("metadata", {})
            for key, value in criteria["metadata"].items():
                if event_metadata.get(key) != value:
                    return False

        # Data filters
        if "data" in criteria:
            event_data = event.get("data", {})
            for key, value in criteria["data"].items():
                if event_data.get(key) != value:
                    return False

        # Custom filter function
        if "function" in criteria:
            try:
                # This would need to be implemented with a registry of filter functions
                # For now, we'll skip custom functions
                pass
            except Exception as e:
                logger.error(f"Error in custom filter {filter_config.name}: {e}")
                return False

        return True

    async def _apply_transformers(self, event: dict[str, Any]) -> dict[str, Any]:
        """Apply all enabled transformers to the event."""
        transformed_event = event.copy()

        for transformer_config in self.transformers:
            if not transformer_config.enabled:
                continue

            try:
                transformed_event = await self._apply_transformer(
                    transformer_config, transformed_event,
                )
            except Exception as e:
                logger.error(f"Error in transformer {transformer_config.name}: {e}")
                # Continue with other transformers

        return transformed_event

    async def _apply_transformer(
        self, transformer_config: EventTransformer, event: dict[str, Any],
    ) -> dict[str, Any]:
        """Apply a single transformer to the event."""
        transform_func = transformer_config.transform_func
        parameters = transformer_config.parameters

        # Built-in transformers
        if transform_func == "add_timestamp":
            event["timestamp"] = time.time()

        elif transform_func == "add_metadata":
            if "metadata" not in event:
                event["metadata"] = {}
            event["metadata"].update(parameters.get("metadata", {}))

        elif transform_func == "format_data":
            if "data" in event and "format" in parameters:
                if parameters["format"] == "json":
                    event["data"] = json.dumps(event["data"])
                elif parameters["format"] == "string":
                    event["data"] = str(event["data"])

        elif transform_func == "filter_data":
            if "data" in event and "keys" in parameters:
                filtered_data = {}
                for key in parameters["keys"]:
                    if key in event["data"]:
                        filtered_data[key] = event["data"][key]
                event["data"] = filtered_data

        elif transform_func == "enrich_data":
            if "data" in event and "enrichment" in parameters:
                event["data"].update(parameters["enrichment"])

        return event

    async def _apply_processors(self, event: dict[str, Any]) -> dict[str, Any]:
        """Apply custom processors to the event."""
        processed_event = event.copy()

        for processor in self.processors:
            if processor.can_handle(processed_event):
                try:
                    processed_event = await processor.process(processed_event)
                except Exception as e:
                    logger.error(
                        f"Error in processor {processor.__class__.__name__}: {e}",
                    )
                    # Continue with other processors

        return processed_event

    async def _route_event(self, event: dict[str, Any]):
        """Route event to appropriate handlers."""
        event_type = event.get("type", "default")

        if event_type in self.routes:
            handlers = self.routes[event_type]
            for handler in handlers:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(event)
                    else:
                        handler(event)
                    self.metrics["events_routed"] += 1
                except Exception as e:
                    logger.error(f"Error in event handler: {e}")

    def get_metrics(self) -> dict[str, Any]:
        """Get router metrics."""
        return {
            "router_name": self.name,
            "metrics": self.metrics.copy(),
            "filters_count": len(self.filters),
            "transformers_count": len(self.transformers),
            "processors_count": len(self.processors),
            "routes_count": len(self.routes),
            "history_size": len(self.event_history),
        }

    def get_event_history(self, limit: int = 100) -> list[dict[str, Any]]:
        """Get recent event history."""
        return list(self.event_history)[-limit:]

    def clear_history(self):
        """Clear event history."""
        self.event_history.clear()
        logger.info("Event history cleared")


class EventValidator:
    """Event validation utilities."""

    @staticmethod
    def validate_event_structure(event: dict[str, Any]) -> bool:
        """Validate basic event structure."""
        required_fields = ["type", "data"]
        return all(field in event for field in required_fields)

    @staticmethod
    def validate_event_type(event: dict[str, Any], allowed_types: list[str]) -> bool:
        """Validate event type against allowed types."""
        event_type = event.get("type")
        return event_type in allowed_types

    @staticmethod
    def validate_event_data(event: dict[str, Any], schema: dict[str, Any]) -> bool:
        """Validate event data against a schema."""
        event_data = event.get("data", {})

        for field, field_type in schema.items():
            if field not in event_data:
                return False

            if not isinstance(event_data[field], field_type):
                return False

        return True


class EventAnalytics:
    """Event analytics and monitoring."""

    def __init__(self):
        self.event_counts: dict[str, int] = defaultdict(int)
        self.event_timestamps: list[float] = []
        self.processing_times: list[float] = []
        self.error_counts: dict[str, int] = defaultdict(int)

    def record_event(self, event: dict[str, Any], processing_time: float = 0.0):
        """Record an event for analytics."""
        event_type = event.get("type", "unknown")
        self.event_counts[event_type] += 1
        self.event_timestamps.append(time.time())
        self.processing_times.append(processing_time)

        # Keep only last 1000 timestamps and processing times
        if len(self.event_timestamps) > 1000:
            self.event_timestamps = self.event_timestamps[-1000:]
        if len(self.processing_times) > 1000:
            self.processing_times = self.processing_times[-1000:]

    def record_error(self, error_type: str):
        """Record an error for analytics."""
        self.error_counts[error_type] += 1

    def get_analytics(self) -> dict[str, Any]:
        """Get analytics data."""
        current_time = time.time()

        # Calculate events per second (last minute)
        recent_events = [ts for ts in self.event_timestamps if current_time - ts < 60]
        events_per_second = len(recent_events) / 60.0 if recent_events else 0.0

        # Calculate average processing time
        avg_processing_time = (
            sum(self.processing_times) / len(self.processing_times)
            if self.processing_times
            else 0.0
        )

        return {
            "event_counts": dict(self.event_counts),
            "events_per_second": events_per_second,
            "total_events": sum(self.event_counts.values()),
            "average_processing_time": avg_processing_time,
            "error_counts": dict(self.error_counts),
            "total_errors": sum(self.error_counts.values()),
        }


class EventPersistence:
    """Event persistence and replay capabilities."""

    def __init__(self, max_events: int = 10000):
        self.max_events = max_events
        self.persisted_events: deque = deque(maxlen=max_events)
        self.event_index: dict[str, list[int]] = defaultdict(list)

    def persist_event(self, event: dict[str, Any]):
        """Persist an event for later replay."""
        event_id = event.get("id", str(time.time()))
        event_with_id = {**event, "id": event_id}

        self.persisted_events.append(event_with_id)

        # Index by event type
        event_type = event.get("type", "unknown")
        self.event_index[event_type].append(len(self.persisted_events) - 1)

    def get_events_by_type(
        self, event_type: str, limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Get events by type."""
        if event_type not in self.event_index:
            return []

        indices = self.event_index[event_type][-limit:]
        return [
            self.persisted_events[i] for i in indices if i < len(self.persisted_events)
        ]

    def get_recent_events(self, limit: int = 100) -> list[dict[str, Any]]:
        """Get recent events."""
        return list(self.persisted_events)[-limit:]

    def replay_events(
        self, event_type: str | None = None, limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Replay events for testing or analysis."""
        if event_type:
            return self.get_events_by_type(event_type, limit)
        return self.get_recent_events(limit)


# Global event router instance
_global_event_router: EventRouter | None = None


def get_global_event_router() -> EventRouter:
    """Get the global event router instance."""
    global _global_event_router
    if _global_event_router is None:
        _global_event_router = EventRouter("global")
    return _global_event_router


def create_event_router(name: str) -> EventRouter:
    """Create a new event router."""
    return EventRouter(name)


# Built-in event processors
class LoggingEventProcessor(EventProcessor):
    """Event processor that logs events."""

    def __init__(self, log_level: str = "info"):
        self.log_level = log_level

    async def process(self, event: dict[str, Any]) -> dict[str, Any]:
        """Log the event."""
        if self.log_level == "debug":
            logger.debug(f"Event processed: {event}")
        elif self.log_level == "info":
            logger.info(f"Event processed: {event.get('type', 'unknown')}")
        elif self.log_level == "warning":
            logger.warning(f"Event processed: {event}")
        elif self.log_level == "error":
            logger.error(f"Event processed: {event}")

        return event

    def can_handle(self, event: dict[str, Any]) -> bool:
        """Can handle all events."""
        return True


class MetricsEventProcessor(EventProcessor):
    """Event processor that collects metrics."""

    def __init__(self, analytics: EventAnalytics):
        self.analytics = analytics

    async def process(self, event: dict[str, Any]) -> dict[str, Any]:
        """Collect metrics for the event."""
        self.analytics.record_event(event)
        return event

    def can_handle(self, event: dict[str, Any]) -> bool:
        """Can handle all events."""
        return True


class ValidationEventProcessor(EventProcessor):
    """Event processor that validates events."""

    def __init__(
        self, allowed_types: list[str], schema: dict[str, Any] | None = None,
    ):
        self.allowed_types = allowed_types
        self.schema = schema or {}

    async def process(self, event: dict[str, Any]) -> dict[str, Any]:
        """Validate the event."""
        if not EventValidator.validate_event_structure(event):
            raise ValidationError("Invalid event structure")

        if not EventValidator.validate_event_type(event, self.allowed_types):
            raise ValidationError(f"Event type not allowed: {event.get('type')}")

        if self.schema and not EventValidator.validate_event_data(event, self.schema):
            raise ValidationError("Event data does not match schema")

        return event

    def can_handle(self, event: dict[str, Any]) -> bool:
        """Can handle all events."""
        return True
