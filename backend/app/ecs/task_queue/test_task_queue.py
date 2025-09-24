"""Test script for Task Queue System

Simple test to verify the task queue system works correctly.
"""

import asyncio
import logging
from typing import Any

from ..components.task_components import TaskPriority, TaskType
from .task_queue_manager import TaskQueueManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_computational_task(parameters: dict[str, Any]) -> Any:
    """Test computational task handler."""
    operation = parameters.get("operation", "add")
    values = parameters.get("values", [1, 2, 3, 4, 5])
    
    if operation == "add":
        return sum(values)
    elif operation == "multiply":
        result = 1
        for value in values:
            result *= value
        return result
    else:
        raise ValueError(f"Unknown operation: {operation}")


async def test_task_queue_system():
    """Test the task queue system."""
    logger.info("Starting task queue system test...")
    
    # Create task queue manager
    manager = TaskQueueManager()
    
    try:
        # Initialize the manager
        if not await manager.initialize():
            logger.error("Failed to initialize task queue manager")
            return
            
        logger.info("Task queue manager initialized successfully")
        
        # Register test task handler
        manager.register_task_handler(TaskType.COMPUTATIONAL, test_computational_task)
        
        # Submit test tasks
        task_ids = []
        
        # Submit a simple addition task
        task_id1 = await manager.submit_task(
            agent_id="test-agent-1",
            task_type=TaskType.COMPUTATIONAL,
            task_name="test-addition",
            parameters={"operation": "add", "values": [1, 2, 3, 4, 5]},
            priority=TaskPriority.NORMAL,
        )
        task_ids.append(task_id1)
        logger.info(f"Submitted addition task: {task_id1}")
        
        # Submit a multiplication task
        task_id2 = await manager.submit_task(
            agent_id="test-agent-2",
            task_type=TaskType.COMPUTATIONAL,
            task_name="test-multiplication",
            parameters={"operation": "multiply", "values": [2, 3, 4]},
            priority=TaskPriority.HIGH,
        )
        task_ids.append(task_id2)
        logger.info(f"Submitted multiplication task: {task_id2}")
        
        # Wait for tasks to complete
        await asyncio.sleep(2)
        
        # Check task status
        for task_id in task_ids:
            status = await manager.get_task_status(task_id)
            logger.info(f"Task {task_id} status: {status}")
            
        # Get queue statistics
        stats = await manager.get_queue_statistics()
        logger.info(f"Queue statistics: {stats}")
        
        logger.info("Task queue system test completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during test: {e}")
        
    finally:
        # Shutdown the manager
        await manager.shutdown()
        logger.info("Task queue manager shutdown")


if __name__ == "__main__":
    asyncio.run(test_task_queue_system())
