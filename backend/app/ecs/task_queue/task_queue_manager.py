"""Task Queue Manager for ECS World

Manages task queues, resource allocation, and task execution coordination.
Leverages existing ThreadPoolExecutorManager for robust task execution.
"""

import asyncio
import logging
import time
from typing import Any, Callable
from uuid import UUID

from ...utils.executor import get_global_executor
from ...utils.executor_types import ExecutorConfig
from ..components.task_components import (
    TaskPriority,
    TaskRequestComponent,
    TaskResultComponent,
    TaskStatus,
    TaskType,
)

logger = logging.getLogger(__name__)


class TaskQueueManager:
    """Manages task queues, resource allocation, and task execution.

    Provides priority-based task queuing with agent-specific routing,
    resource allocation and throttling mechanisms, and task dependency
    management. Integrates with existing ThreadPoolExecutorManager.
    """

    def __init__(self, config: ExecutorConfig | None = None):
        """Initialize the task queue manager.

        Args:
            config: Configuration for the underlying executor
        """
        self.initialized = False
        self.config = config or ExecutorConfig()

        # Task queues organized by priority
        self.task_queues: dict[TaskPriority, asyncio.Queue] = {
            priority: asyncio.Queue() for priority in TaskPriority
        }

        # Task tracking
        self.active_tasks: dict[str, TaskRequestComponent] = {}
        self.completed_tasks: dict[str, TaskResultComponent] = {}
        self.failed_tasks: dict[str, TaskResultComponent] = {}

        # Resource management
        self.max_concurrent_tasks = self.config.max_workers * 2
        self.current_concurrent_tasks = 0
        self.resource_limits: dict[str, float] = {
            "cpu": 80.0,  # 80% CPU limit
            "memory": 70.0,  # 70% memory limit
            "io": 60.0,  # 60% I/O limit
        }

        # Worker management
        self.worker_tasks: list[asyncio.Task] = []
        self.executor = None

        # Statistics
        self.total_tasks_submitted = 0
        self.total_tasks_completed = 0
        self.total_tasks_failed = 0
        self.start_time = time.time()

        # Task registry for different task types
        self.task_registry: dict[TaskType, Callable] = {}

    async def initialize(self) -> bool:
        """Initialize the task queue manager."""
        try:
            if self.initialized:
                return True

            # Initialize the global executor
            self.executor = await get_global_executor(self.config)

            # Start worker tasks for each priority level
            for priority in TaskPriority:
                for i in range(self.config.max_workers):
                    task = asyncio.create_task(
                        self._worker(f"worker-{priority.name.lower()}-{i}")
                    )
                    self.worker_tasks.append(task)

            self.initialized = True
            logger.info(
                f"Task queue manager initialized with {self.config.max_workers} workers per priority"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to initialize task queue manager: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the task queue manager."""
        try:
            if not self.initialized:
                return True

            # Cancel all worker tasks
            for task in self.worker_tasks:
                task.cancel()

            # Wait for workers to finish
            await asyncio.gather(*self.worker_tasks, return_exceptions=True)

            # Clear task queues
            for queue in self.task_queues.values():
                while not queue.empty():
                    try:
                        queue.get_nowait()
                    except asyncio.QueueEmpty:
                        break

            self.worker_tasks.clear()
            self.active_tasks.clear()
            self.completed_tasks.clear()
            self.failed_tasks.clear()

            self.initialized = False
            logger.info("Task queue manager shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down task queue manager: {e}")
            return False

    async def submit_task(
        self,
        agent_id: str,
        task_type: TaskType,
        task_name: str,
        parameters: dict[str, Any],
        priority: TaskPriority = TaskPriority.NORMAL,
        timeout: float = 30.0,
        dependencies: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Submit a task to the queue.

        Args:
            agent_id: ID of the agent requesting the task
            task_type: Type of task to execute
            task_name: Name/identifier of the task
            parameters: Task execution parameters
            priority: Task priority level
            timeout: Task timeout in seconds
            dependencies: List of task IDs this task depends on
            metadata: Additional metadata for the task

        Returns:
            Task ID if successful, None if submission failed
        """
        if not self.initialized:
            raise RuntimeError("Task queue manager not initialized")

        # Create task request component
        task_request = TaskRequestComponent(
            agent_id=agent_id,
            task_type=task_type,
            task_name=task_name,
            parameters=parameters,
            priority=priority,
            timeout=timeout,
            dependencies=dependencies,
            metadata=metadata,
        )

        # Check resource availability
        if not await self._check_resource_availability(task_request):
            logger.warning(f"Insufficient resources for task {task_request.task_id}")
            return None

        # Add to appropriate priority queue
        await self.task_queues[priority].put(task_request)
        self.active_tasks[task_request.task_id] = task_request
        self.total_tasks_submitted += 1

        logger.info(
            f"Task {task_request.task_id} submitted by agent {agent_id} "
            f"with priority {priority.name}"
        )

        return task_request.task_id

    async def get_task_status(self, task_id: str) -> dict[str, Any]:
        """Get the status of a task.

        Args:
            task_id: ID of the task to check

        Returns:
            Dictionary containing task status information
        """
        # Check active tasks
        if task_id in self.active_tasks:
            task = self.active_tasks[task_id]
            return {
                "task_id": task_id,
                "status": task.status.value,
                "agent_id": task.agent_id,
                "task_type": task.task_type.value,
                "task_name": task.task_name,
                "priority": task.priority.value,
                "created_at": task.created_at,
                "queued_at": task.queued_at,
                "started_at": task.started_at,
                "retry_count": task.retry_count,
                "error_message": task.error_message,
            }

        # Check completed tasks
        if task_id in self.completed_tasks:
            result = self.completed_tasks[task_id]
            return {
                "task_id": task_id,
                "status": result.status.value,
                "execution_time": result.execution_time,
                "completed_at": result.completed_at,
                "result_data": result.result_data,
                "error_message": result.error_message,
            }

        # Check failed tasks
        if task_id in self.failed_tasks:
            result = self.failed_tasks[task_id]
            return {
                "task_id": task_id,
                "status": result.status.value,
                "execution_time": result.execution_time,
                "completed_at": result.completed_at,
                "error_message": result.error_message,
            }

        return {"task_id": task_id, "status": "not_found"}

    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task.

        Args:
            task_id: ID of the task to cancel

        Returns:
            True if task was cancelled, False if not found or already completed
        """
        if task_id not in self.active_tasks:
            return False

        task = self.active_tasks[task_id]
        task.status = TaskStatus.CANCELLED
        task.completed_at = time.time()

        # Move to completed tasks
        result = TaskResultComponent(task_id)
        result.set_result(
            result_data=None,
            execution_time=0.0,
            status=TaskStatus.CANCELLED,
            error_message="Task cancelled by user",
        )

        self.completed_tasks[task_id] = result
        del self.active_tasks[task_id]

        logger.info(f"Task {task_id} cancelled")
        return True

    async def get_agent_tasks(self, agent_id: str) -> list[dict[str, Any]]:
        """Get all tasks for a specific agent.

        Args:
            agent_id: ID of the agent

        Returns:
            List of task information dictionaries
        """
        agent_tasks = []

        # Check active tasks
        for task_id, task in self.active_tasks.items():
            if task.agent_id == agent_id:
                agent_tasks.append(await self.get_task_status(task_id))

        # Check completed tasks
        for task_id, result in self.completed_tasks.items():
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                if task.agent_id == agent_id:
                    agent_tasks.append(await self.get_task_status(task_id))

        # Check failed tasks
        for task_id, result in self.failed_tasks.items():
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                if task.agent_id == agent_id:
                    agent_tasks.append(await self.get_task_status(task_id))

        return agent_tasks

    async def get_queue_statistics(self) -> dict[str, Any]:
        """Get comprehensive queue statistics.

        Returns:
            Dictionary containing queue statistics
        """
        current_time = time.time()
        uptime = current_time - self.start_time

        # Calculate queue sizes
        queue_sizes = {}
        for priority, queue in self.task_queues.items():
            queue_sizes[priority.name.lower()] = queue.qsize()

        return {
            "initialized": self.initialized,
            "uptime_seconds": uptime,
            "total_tasks_submitted": self.total_tasks_submitted,
            "total_tasks_completed": self.total_tasks_completed,
            "total_tasks_failed": self.total_tasks_failed,
            "active_tasks": len(self.active_tasks),
            "completed_tasks": len(self.completed_tasks),
            "failed_tasks": len(self.failed_tasks),
            "current_concurrent_tasks": self.current_concurrent_tasks,
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "queue_sizes": queue_sizes,
            "success_rate": (
                self.total_tasks_completed
                / max(1, self.total_tasks_completed + self.total_tasks_failed)
            ),
            "throughput_per_minute": (
                self.total_tasks_completed / max(1, uptime / 60.0)
            ),
        }

    async def _worker(self, worker_name: str) -> None:
        """Worker task that processes tasks from the queue.

        Args:
            worker_name: Name of the worker
        """
        logger.info(f"Started task queue worker: {worker_name}")

        try:
            while True:
                # Get task from highest priority queue that has tasks
                task = None
                for priority in reversed(
                    list(TaskPriority)
                ):  # Start with highest priority
                    try:
                        task = self.task_queues[priority].get_nowait()
                        break
                    except asyncio.QueueEmpty:
                        continue

                # If no tasks in any queue, wait for one
                if task is None:
                    # Wait for any queue to have a task
                    tasks = [
                        asyncio.create_task(queue.get())
                        for queue in self.task_queues.values()
                    ]
                    done, pending = await asyncio.wait(
                        tasks, return_when=asyncio.FIRST_COMPLETED
                    )

                    # Cancel pending tasks
                    for pending_task in pending:
                        pending_task.cancel()

                    # Get the completed task
                    if done:
                        task = done.pop().result()

                if task is None:
                    continue

                # Check if we can start the task
                if self.current_concurrent_tasks >= self.max_concurrent_tasks:
                    # Put task back in queue and wait
                    await self.task_queues[task.priority].put(task)
                    await asyncio.sleep(0.1)
                    continue

                # Process the task
                await self._process_task(task, worker_name)

        except asyncio.CancelledError:
            logger.info(f"Task queue worker {worker_name} cancelled")
        except Exception as e:
            logger.error(f"Error in task queue worker {worker_name}: {e}")

    async def _process_task(self, task: TaskRequestComponent, worker_name: str) -> None:
        """Process a single task.

        Args:
            task: The task to process
            worker_name: Name of the worker processing the task
        """
        task_id = task.task_id
        start_time = time.time()

        try:
            # Update task status
            task.status = TaskStatus.RUNNING
            task.started_at = start_time
            self.current_concurrent_tasks += 1

            logger.info(f"Processing task {task_id} in {worker_name}")

            # Check dependencies
            if not await self._check_dependencies(task):
                task.status = TaskStatus.FAILED
                task.error_message = "Dependencies not satisfied"
                raise Exception("Dependencies not satisfied")

            # Execute the task
            result = await self._execute_task(task)

            # Create result component
            result_component = TaskResultComponent(task_id)
            execution_time = time.time() - start_time

            result_component.set_result(
                result_data=result,
                execution_time=execution_time,
                status=TaskStatus.COMPLETED,
            )

            # Move to completed tasks
            self.completed_tasks[task_id] = result_component
            self.total_tasks_completed += 1

            logger.info(f"Task {task_id} completed in {execution_time:.2f}s")

        except Exception as e:
            logger.error(f"Error processing task {task_id}: {e}")

            # Handle retry logic
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                task.status = TaskStatus.PENDING
                task.error_message = str(e)

                # Put task back in queue for retry
                await self.task_queues[task.priority].put(task)
                logger.info(f"Task {task_id} queued for retry {task.retry_count}")
            else:
                # Task failed permanently
                task.status = TaskStatus.FAILED
                task.error_message = str(e)
                task.completed_at = time.time()

                result_component = TaskResultComponent(task_id)
                execution_time = time.time() - start_time
                result_component.set_result(
                    result_data=None,
                    execution_time=execution_time,
                    status=TaskStatus.FAILED,
                    error_message=str(e),
                )

                self.failed_tasks[task_id] = result_component
                self.total_tasks_failed += 1

        finally:
            # Clean up
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
            self.current_concurrent_tasks = max(0, self.current_concurrent_tasks - 1)

    async def _execute_task(self, task: TaskRequestComponent) -> Any:
        """Execute a task using the appropriate handler.

        Args:
            task: The task to execute

        Returns:
            Task execution result
        """
        # Get task handler from registry
        handler = self.task_registry.get(task.task_type)
        if not handler:
            raise ValueError(f"No handler registered for task type {task.task_type}")

        # Execute task with timeout
        try:
            if self.executor:
                result = await self.executor.execute(
                    handler,
                    task.parameters,
                    timeout=task.timeout,
                )
            else:
                # Fallback to direct execution
                result = await asyncio.wait_for(
                    handler(task.parameters),
                    timeout=task.timeout,
                )
            return result

        except asyncio.TimeoutError:
            raise Exception(f"Task {task.task_id} timed out after {task.timeout}s")

    async def _check_dependencies(self, task: TaskRequestComponent) -> bool:
        """Check if task dependencies are satisfied.

        Args:
            task: The task to check dependencies for

        Returns:
            True if all dependencies are satisfied
        """
        for dep_id in task.dependencies:
            # Check if dependency is completed
            if dep_id not in self.completed_tasks:
                return False

            # Check if dependency was successful
            dep_result = self.completed_tasks[dep_id]
            if dep_result.status != TaskStatus.COMPLETED:
                return False

        return True

    async def _check_resource_availability(self, task: TaskRequestComponent) -> bool:
        """Check if resources are available for the task.

        Args:
            task: The task to check resources for

        Returns:
            True if resources are available
        """
        # Simple resource check - can be enhanced with actual resource monitoring
        if self.current_concurrent_tasks >= self.max_concurrent_tasks:
            return False

        # Check specific resource requirements if specified
        for resource, limit in task.resource_requirements.items():
            if resource in self.resource_limits:
                # Simple check - in real implementation, would check actual usage
                if limit > self.resource_limits[resource]:
                    return False

        return True

    def register_task_handler(self, task_type: TaskType, handler: Callable) -> None:
        """Register a handler for a specific task type.

        Args:
            task_type: Type of task to handle
            handler: Function to handle the task
        """
        self.task_registry[task_type] = handler
        logger.info(f"Registered handler for task type {task_type.value}")
