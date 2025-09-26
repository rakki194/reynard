"""Task Components for ECS World

Task-related components for agent task queue management.
"""

import time
from enum import Enum
from typing import Any
from uuid import uuid4

from ..core.component import Component


class TaskStatus(Enum):
    """Task execution status enumeration."""

    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class TaskPriority(Enum):
    """Task priority levels."""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4
    CRITICAL = 5


class TaskType(Enum):
    """Task type enumeration."""

    COMPUTATIONAL = "computational"
    VALIDATION = "validation"
    PROCESSING = "processing"
    ANALYSIS = "analysis"
    CUSTOM = "custom"


class TaskRequestComponent(Component):
    """Component for agent task requests with metadata.

    Contains all information needed to process a task request
    from an agent, including parameters, priority, and dependencies.
    """

    def __init__(
        self,
        agent_id: str,
        task_type: TaskType,
        task_name: str,
        parameters: dict[str, Any],
        priority: TaskPriority = TaskPriority.NORMAL,
        timeout: float = 30.0,
        dependencies: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Initialize the task request component.

        Args:
            agent_id: ID of the agent requesting the task
            task_type: Type of task to execute
            task_name: Name/identifier of the task
            parameters: Task execution parameters
            priority: Task priority level
            timeout: Task timeout in seconds
            dependencies: List of task IDs this task depends on
            metadata: Additional metadata for the task
        """
        super().__init__()
        self.task_id = str(uuid4())
        self.agent_id = agent_id
        self.task_type = task_type
        self.task_name = task_name
        self.parameters = parameters or {}
        self.priority = priority
        self.timeout = timeout
        self.dependencies = dependencies or []
        self.metadata = metadata or {}

        # Task lifecycle tracking
        self.status = TaskStatus.PENDING
        self.created_at = time.time()
        self.queued_at: float | None = None
        self.started_at: float | None = None
        self.completed_at: float | None = None

        # Retry and error handling
        self.retry_count = 0
        self.max_retries = 3
        self.error_message: str | None = None

        # Resource allocation
        self.estimated_duration = 0.0
        self.resource_requirements: dict[str, Any] = {}

    def __repr__(self) -> str:
        """String representation of the task request component."""
        return (
            f"TaskRequestComponent("
            f"task_id={self.task_id[:8]}, "
            f"agent_id={self.agent_id}, "
            f"type={self.task_type.value}, "
            f"name={self.task_name}, "
            f"status={self.status.value}, "
            f"priority={self.priority.value}"
            f")"
        )


class TaskResultComponent(Component):
    """Component for task execution results and status.

    Contains the results of task execution, including output data,
    performance metrics, and execution status.
    """

    def __init__(self, task_id: str) -> None:
        """Initialize the task result component.

        Args:
            task_id: ID of the task this result belongs to
        """
        super().__init__()
        self.task_id = task_id
        self.status = TaskStatus.PENDING

        # Execution results
        self.result_data: Any = None
        self.error_message: str | None = None
        self.execution_log: list[str] = []

        # Performance metrics
        self.execution_time: float = 0.0
        self.cpu_usage: float = 0.0
        self.memory_usage: float = 0.0
        self.io_operations: int = 0

        # Timestamps
        self.started_at: float | None = None
        self.completed_at: float | None = None

        # Quality metrics
        self.success_rate: float = 1.0
        self.quality_score: float = 0.0

    def set_result(
        self,
        result_data: Any,
        execution_time: float,
        status: TaskStatus = TaskStatus.COMPLETED,
        error_message: str | None = None,
    ) -> None:
        """Set the task execution result.

        Args:
            result_data: The result data from task execution
            execution_time: Time taken to execute the task
            status: Final status of the task
            error_message: Error message if task failed
        """
        self.result_data = result_data
        self.execution_time = execution_time
        self.status = status
        self.error_message = error_message
        self.completed_at = time.time()

    def add_log_entry(self, message: str) -> None:
        """Add an entry to the execution log.

        Args:
            message: Log message to add
        """
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.execution_log.append(f"[{timestamp}] {message}")

    def __repr__(self) -> str:
        """String representation of the task result component."""
        return (
            f"TaskResultComponent("
            f"task_id={self.task_id[:8]}, "
            f"status={self.status.value}, "
            f"execution_time={self.execution_time:.2f}s"
            f")"
        )


class TaskQueueComponent(Component):
    """Component for queue state and management.

    Tracks the state of task queues, including queue statistics,
    resource allocation, and queue management information.
    """

    def __init__(self, queue_name: str, max_size: int = 1000) -> None:
        """Initialize the task queue component.

        Args:
            queue_name: Name of the queue
            max_size: Maximum number of tasks in the queue
        """
        super().__init__()
        self.queue_name = queue_name
        self.max_size = max_size

        # Queue state
        self.pending_tasks: list[str] = []  # Task IDs
        self.running_tasks: list[str] = []  # Task IDs
        self.completed_tasks: list[str] = []  # Task IDs
        self.failed_tasks: list[str] = []  # Task IDs

        # Queue statistics
        self.total_tasks_processed = 0
        self.total_tasks_failed = 0
        self.average_execution_time = 0.0
        self.total_execution_time = 0.0

        # Resource management
        self.current_load = 0.0
        self.max_concurrent_tasks = 10
        self.resource_utilization: dict[str, float] = {}

        # Performance metrics
        self.throughput_per_minute = 0.0
        self.success_rate = 1.0
        self.last_throughput_calculation = time.time()

    def add_task(self, task_id: str) -> bool:
        """Add a task to the queue.

        Args:
            task_id: ID of the task to add

        Returns:
            True if task was added, False if queue is full
        """
        if len(self.pending_tasks) >= self.max_size:
            return False

        self.pending_tasks.append(task_id)
        return True

    def move_task_to_running(self, task_id: str) -> bool:
        """Move a task from pending to running.

        Args:
            task_id: ID of the task to move

        Returns:
            True if task was moved, False if not found
        """
        if task_id in self.pending_tasks:
            self.pending_tasks.remove(task_id)
            self.running_tasks.append(task_id)
            return True
        return False

    def move_task_to_completed(self, task_id: str, execution_time: float) -> bool:
        """Move a task from running to completed.

        Args:
            task_id: ID of the task to move
            execution_time: Time taken to execute the task

        Returns:
            True if task was moved, False if not found
        """
        if task_id in self.running_tasks:
            self.running_tasks.remove(task_id)
            self.completed_tasks.append(task_id)

            # Update statistics
            self.total_tasks_processed += 1
            self.total_execution_time += execution_time
            self.average_execution_time = (
                self.total_execution_time / self.total_tasks_processed
            )

            return True
        return False

    def move_task_to_failed(self, task_id: str) -> bool:
        """Move a task from running to failed.

        Args:
            task_id: ID of the task to move

        Returns:
            True if task was moved, False if not found
        """
        if task_id in self.running_tasks:
            self.running_tasks.remove(task_id)
            self.failed_tasks.append(task_id)

            # Update statistics
            self.total_tasks_failed += 1
            self.success_rate = self.total_tasks_processed / (
                self.total_tasks_processed + self.total_tasks_failed
            )

            return True
        return False

    def get_queue_stats(self) -> dict[str, Any]:
        """Get comprehensive queue statistics.

        Returns:
            Dictionary containing queue statistics
        """
        current_time = time.time()

        # Calculate throughput if enough time has passed
        if current_time - self.last_throughput_calculation > 60.0:
            self.throughput_per_minute = len(self.completed_tasks) / 60.0
            self.last_throughput_calculation = current_time

        return {
            "queue_name": self.queue_name,
            "pending_tasks": len(self.pending_tasks),
            "running_tasks": len(self.running_tasks),
            "completed_tasks": len(self.completed_tasks),
            "failed_tasks": len(self.failed_tasks),
            "total_tasks_processed": self.total_tasks_processed,
            "total_tasks_failed": self.total_tasks_failed,
            "average_execution_time": self.average_execution_time,
            "success_rate": self.success_rate,
            "throughput_per_minute": self.throughput_per_minute,
            "current_load": self.current_load,
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "resource_utilization": self.resource_utilization,
        }

    def __repr__(self) -> str:
        """String representation of the task queue component."""
        return (
            f"TaskQueueComponent("
            f"name={self.queue_name}, "
            f"pending={len(self.pending_tasks)}, "
            f"running={len(self.running_tasks)}, "
            f"completed={len(self.completed_tasks)}"
            f")"
        )
