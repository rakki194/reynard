#!/usr/bin/env python3
"""
ECS Breeding Notifications Example
==================================

Example application that demonstrates ECS breeding event notifications
using notify-send. Shows how to integrate the event system with
desktop notifications for real-time monitoring of agent breeding.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path

# Add the MCP scripts directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from reynard_ecs_world import ECSEventType, ECSNotificationHandler, WorldSimulation

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class BreedingNotificationDemo:
    """Demo application for ECS breeding notifications."""

    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Initialize world simulation
        self.world = WorldSimulation(self.data_dir)

        # Initialize notification handler
        self.notification_handler = ECSNotificationHandler(self.data_dir)

        # Register event handlers
        self._register_event_handlers()

        logger.info("Breeding Notification Demo initialized")

    def _register_event_handlers(self) -> None:
        """Register event handlers for notifications."""
        # Register notification handler for all event types
        for event_type in ECSEventType:
            self.world.event_system.register_handler(
                event_type, self.notification_handler.handle_event
            )

        logger.info("Event handlers registered")

    def create_breeding_population(self) -> None:
        """Create a population of agents for breeding."""
        logger.info("Creating breeding population...")

        # Create initial agents with different spirits
        agents = []
        spirits = ["fox", "wolf", "otter"]
        styles = ["foundation", "exo", "hybrid"]

        for i in range(6):  # Create 6 agents
            spirit = spirits[i % len(spirits)]
            style = styles[i % len(styles)]
            agent_id = f"breeder-{i + 1}"

            agent = self.world.create_agent_with_inheritance(
                agent_id, spirit=spirit, style=style
            )
            agents.append(agent)

            # Make agents mature for breeding
            lifecycle = agent.get_component("LifecycleComponent")
            if lifecycle:
                lifecycle.age = 25.0  # Adult age
                lifecycle.life_stage = "adult"

            # Enable reproduction
            reproduction = agent.get_component("ReproductionComponent")
            if reproduction:
                reproduction.can_reproduce = True

        logger.info(f"Created {len(agents)} mature agents for breeding")
        return agents

    def simulate_breeding_events(self, duration_seconds: int = 60) -> None:
        """Simulate breeding events over time."""
        logger.info(f"Starting breeding simulation for {duration_seconds} seconds...")

        start_time = time.time()
        update_count = 0

        while time.time() - start_time < duration_seconds:
            # Update simulation
            self.world.update_simulation(1.0)
            update_count += 1

            # Occasionally create offspring manually to demonstrate notifications
            if update_count % 20 == 0:  # Every 20 updates
                self._create_demo_offspring()

            # Sleep briefly to allow notifications to be processed
            time.sleep(0.1)

        logger.info(f"Simulation completed after {update_count} updates")

    def _create_demo_offspring(self) -> None:
        """Create offspring manually to demonstrate notifications."""
        try:
            # Get available agents
            entities = list(self.world.world.entities.values())
            if len(entities) < 2:
                return

            # Select two random agents as parents
            import random

            parent1, parent2 = random.sample(entities, 2)

            # Create offspring
            offspring_id = f"offspring-{int(time.time())}"
            offspring = self.world.create_agent_with_inheritance(
                offspring_id,
                spirit="fox",  # Default spirit
                style="foundation",
                parent1_id=parent1.id,
                parent2_id=parent2.id,
            )

            logger.info(
                f"Created offspring {offspring_id} from {parent1.id} and {parent2.id}"
            )

        except Exception as e:
            logger.error(f"Failed to create demo offspring: {e}")

    def demonstrate_time_acceleration(self) -> None:
        """Demonstrate time acceleration notifications."""
        logger.info("Demonstrating time acceleration notifications...")

        # Test different acceleration levels
        accelerations = [1.0, 5.0, 10.0, 25.0, 50.0]

        for accel in accelerations:
            self.world.accelerate_time(accel)
            time.sleep(1)  # Wait to see notification

        # Reset to normal speed
        self.world.accelerate_time(1.0)

    def show_notification_stats(self) -> None:
        """Show notification statistics."""
        stats = self.notification_handler.get_notification_stats()
        event_stats = self.world.event_system.get_event_stats()

        print("\n" + "=" * 50)
        print("ECS BREEDING NOTIFICATION STATS")
        print("=" * 50)
        print(f"Notifications Enabled: {stats['enabled']}")
        print(f"Total Notifications Sent: {stats['total_notifications']}")
        print(f"Successful Notifications: {stats['successful_notifications']}")
        print(f"Success Rate: {stats['success_rate']:.1%}")
        print(f"Notification Timeout: {stats['timeout_ms']}ms")

        print("\nEvent Statistics:")
        for event_type, count in event_stats.items():
            if event_type != "total_events" and event_type != "handlers_registered":
                print(f"  {event_type}: {count}")

        print(f"\nTotal Events: {event_stats['total_events']}")
        print(f"Handlers Registered: {event_stats['handlers_registered']}")
        print("=" * 50)


async def main():
    """Main demo function."""
    print("🦊 ECS Breeding Notifications Demo")
    print("=" * 40)

    # Create demo instance
    data_dir = Path("/tmp/ecs_breeding_demo")
    demo = BreedingNotificationDemo(data_dir)

    try:
        # Create breeding population
        demo.create_breeding_population()

        # Demonstrate time acceleration
        demo.demonstrate_time_acceleration()

        # Run breeding simulation
        print("\nStarting breeding simulation...")
        print("Watch for desktop notifications!")
        demo.simulate_breeding_events(duration_seconds=30)

        # Show statistics
        demo.show_notification_stats()

    except KeyboardInterrupt:
        print("\nDemo interrupted by user")
    except Exception as e:
        logger.error(f"Demo failed: {e}")
    finally:
        print("\nDemo completed!")


if __name__ == "__main__":
    asyncio.run(main())
