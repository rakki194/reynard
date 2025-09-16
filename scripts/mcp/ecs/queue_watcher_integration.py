#!/usr/bin/env python3
"""
ECS Queue Watcher Integration
============================

Integration between ECS event system and queue-watcher for monitoring
and processing ECS events. Provides real-time monitoring of agent
breeding, lifecycle events, and simulation updates.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from .event_system import ECSEvent, ECSEventSystem, ECSEventType
from .notification_handler import ECSNotificationHandler

logger = logging.getLogger(__name__)


class ECSQueueWatcher:
    """Queue watcher for ECS events."""

    def __init__(self, data_dir: Path, watch_interval: float = 1.0):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Event system
        self.event_system = ECSEventSystem(self.data_dir)
        self.event_system.enable_queue_integration()

        # Notification handler
        self.notification_handler = ECSNotificationHandler(self.data_dir)

        # Queue monitoring
        self.watch_interval = watch_interval
        self.running = False
        self.last_processed_time = time.time()

        # Event processing stats
        self.stats = {
            "events_processed": 0,
            "notifications_sent": 0,
            "errors": 0,
            "start_time": time.time(),
        }

        # Register notification handler
        self._register_handlers()

        logger.info(f"ECS Queue Watcher initialized (watch_interval={watch_interval}s)")

    def _register_handlers(self) -> None:
        """Register event handlers."""
        # Register notification handler for breeding events
        breeding_events = [
            ECSEventType.AGENT_CREATED,
            ECSEventType.BREEDING_SUCCESSFUL,
            ECSEventType.OFFSPRING_CREATED,
            ECSEventType.AGENT_MATURED,
            ECSEventType.AGENT_DIED,
        ]

        for event_type in breeding_events:
            self.event_system.register_handler(
                event_type, self.notification_handler.handle_event
            )

        logger.info(f"Registered handlers for {len(breeding_events)} event types")

    async def start_watching(self) -> None:
        """Start watching for ECS events."""
        self.running = True
        logger.info("ECS Queue Watcher started")

        try:
            while self.running:
                await self._process_events()
                await asyncio.sleep(self.watch_interval)
        except Exception as e:
            logger.error(f"Queue watcher error: {e}")
            self.stats["errors"] += 1
        finally:
            logger.info("ECS Queue Watcher stopped")

    def stop_watching(self) -> None:
        """Stop watching for ECS events."""
        self.running = False
        logger.info("ECS Queue Watcher stop requested")

    async def _process_events(self) -> None:
        """Process events from the queue."""
        queue_file = self.event_system.queue_file

        if not queue_file.exists():
            return

        try:
            # Read queue file
            with open(queue_file) as f:
                queue_data = json.load(f)

            if not queue_data:
                return

            # Process events
            processed_count = 0
            for event_data in queue_data:
                try:
                    event = self._dict_to_event(event_data)
                    if event:
                        await self._process_event(event)
                        processed_count += 1
                except Exception as e:
                    logger.error(f"Failed to process event: {e}")
                    self.stats["errors"] += 1

            # Clear processed events
            if processed_count > 0:
                with open(queue_file, "w") as f:
                    json.dump([], f)

                self.stats["events_processed"] += processed_count
                logger.debug(f"Processed {processed_count} events")

        except Exception as e:
            logger.error(f"Failed to process queue: {e}")
            self.stats["errors"] += 1

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

    async def _process_event(self, event: ECSEvent) -> None:
        """Process a single event."""
        # Log event
        logger.info(
            f"Processing event: {event.event_type.value} for agent {event.agent_id}"
        )

        # Send notification
        try:
            self.notification_handler.handle_event(event)
            self.stats["notifications_sent"] += 1
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            self.stats["errors"] += 1

        # Update last processed time
        self.last_processed_time = time.time()

    def get_stats(self) -> Dict[str, Any]:
        """Get queue watcher statistics."""
        uptime = time.time() - self.stats["start_time"]

        return {
            "running": self.running,
            "uptime_seconds": uptime,
            "watch_interval": self.watch_interval,
            "events_processed": self.stats["events_processed"],
            "notifications_sent": self.stats["notifications_sent"],
            "errors": self.stats["errors"],
            "events_per_second": self.stats["events_processed"] / uptime
            if uptime > 0
            else 0,
            "last_processed": self.last_processed_time,
        }

    def get_event_stats(self) -> Dict[str, Any]:
        """Get event system statistics."""
        return self.event_system.get_event_stats()

    def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics."""
        return self.notification_handler.get_notification_stats()


class ECSMonitoringDashboard:
    """Simple monitoring dashboard for ECS events."""

    def __init__(self, queue_watcher: ECSQueueWatcher):
        self.queue_watcher = queue_watcher

    async def run_dashboard(self, update_interval: float = 5.0) -> None:
        """Run monitoring dashboard."""
        logger.info("ECS Monitoring Dashboard started")

        try:
            while self.queue_watcher.running:
                self._display_stats()
                await asyncio.sleep(update_interval)
        except KeyboardInterrupt:
            logger.info("Dashboard interrupted by user")
        finally:
            logger.info("ECS Monitoring Dashboard stopped")

    def _display_stats(self) -> None:
        """Display current statistics."""
        stats = self.queue_watcher.get_stats()
        event_stats = self.queue_watcher.get_event_stats()
        notification_stats = self.queue_watcher.get_notification_stats()

        print("\n" + "=" * 60)
        print("🦊 ECS QUEUE WATCHER MONITORING DASHBOARD")
        print("=" * 60)
        print(f"Status: {'🟢 Running' if stats['running'] else '🔴 Stopped'}")
        print(f"Uptime: {stats['uptime_seconds']:.1f}s")
        print(f"Watch Interval: {stats['watch_interval']}s")
        print(f"Events Processed: {stats['events_processed']}")
        print(f"Notifications Sent: {stats['notifications_sent']}")
        print(f"Errors: {stats['errors']}")
        print(f"Events/sec: {stats['events_per_second']:.2f}")

        print("\n📊 Event Statistics:")
        for event_type, count in event_stats.items():
            if event_type not in ["total_events", "handlers_registered"]:
                print(f"  {event_type}: {count}")

        print("\n📱 Notification Statistics:")
        print(f"  Enabled: {notification_stats['enabled']}")
        print(f"  Total Sent: {notification_stats['total_notifications']}")
        print(f"  Success Rate: {notification_stats['success_rate']:.1%}")

        print("=" * 60)


async def main():
    """Main function for queue watcher integration."""
    print("🦊 ECS Queue Watcher Integration")
    print("=" * 40)

    # Create queue watcher
    data_dir = Path("/tmp/ecs_queue_watcher")
    queue_watcher = ECSQueueWatcher(data_dir, watch_interval=0.5)

    # Create monitoring dashboard
    dashboard = ECSMonitoringDashboard(queue_watcher)

    try:
        # Start queue watcher and dashboard concurrently
        await asyncio.gather(
            queue_watcher.start_watching(), dashboard.run_dashboard(update_interval=3.0)
        )
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        queue_watcher.stop_watching()
        print("ECS Queue Watcher Integration stopped")


if __name__ == "__main__":
    asyncio.run(main())
