"""Task Queue System for ECS World

ECS system for processing agent task requests and managing task lifecycle.
Integrates with existing ECS systems (Memory, Interaction, Social).
"""

import logging
from typing import Any

from ..components.task_components import (
    TaskPriority,
    TaskRequestComponent,
    TaskResultComponent,
    TaskStatus,
    TaskType,
)
from ..core.system import System
from ..task_queue.task_queue_manager import TaskQueueManager

logger = logging.getLogger(__name__)


class TaskQueueSystem(System):
    """ECS system for processing agent task requests and managing task lifecycle.

    Handles task submission, execution, and result management within the ECS world.
    Integrates with existing ECS systems for comprehensive agent task management.
    """

    def __init__(self, world) -> None:
        """Initialize the task queue system.

        Args:
            world: The ECS world this system belongs to
        """
        super().__init__(world)
        self.task_manager = TaskQueueManager()
        self.initialized = False

        # System statistics
        self.total_tasks_processed = 0
        self.total_agents_served = 0
        self.last_processing_time = 0.0
        self.processing_interval = 0.1  # Process every 100ms

        # Integration with other systems
        self.memory_system = None
        self.interaction_system = None
        self.social_system = None

    async def initialize(self) -> bool:
        """Initialize the task queue system."""
        try:
            if self.initialized:
                return True

            # Initialize the task manager
            if not await self.task_manager.initialize():
                logger.error("Failed to initialize task manager")
                return False

            # Register default task handlers
            await self._register_default_handlers()

            # Find and reference other systems
            self._find_related_systems()

            self.initialized = True
            logger.info("Task queue system initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize task queue system: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the task queue system."""
        try:
            if not self.initialized:
                return True

            # Shutdown the task manager
            await self.task_manager.shutdown()

            self.initialized = False
            logger.info("Task queue system shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down task queue system: {e}")
            return False

    def update(self, delta_time: float) -> None:
        """Update the task queue system.

        Args:
            delta_time: Time elapsed since last update
        """
        if not self.initialized:
            return

        self.last_processing_time += delta_time

        # Process task queue operations at regular intervals
        if self.last_processing_time >= self.processing_interval:
            self._process_task_operations(delta_time)
            self.last_processing_time = 0.0

    def _process_task_operations(self, delta_time: float) -> None:
        """Process task queue operations for all agents.

        Args:
            delta_time: Time elapsed since last processing
        """
        # Get all entities with task request components
        entities = self.get_entities_with_components(TaskRequestComponent)

        for entity in entities:
            task_comp = entity.get_component(TaskRequestComponent)
            if task_comp:
                self._process_agent_task(entity, task_comp, delta_time)

        # Process completed tasks and update results
        self._process_completed_tasks()

    def _process_agent_task(
        self,
        entity,
        task_comp: TaskRequestComponent,
        delta_time: float,
    ) -> None:
        """Process a task for a specific agent.

        Args:
            entity: The agent entity
            task_comp: The task request component
            delta_time: Time elapsed since last processing
        """
        # Update task status based on current state
        if task_comp.status == TaskStatus.PENDING:
            # Task is ready to be submitted
            self._submit_agent_task(entity, task_comp)
        elif task_comp.status == TaskStatus.RUNNING:
            # Task is currently running - monitor progress
            self._monitor_running_task(entity, task_comp, delta_time)
        elif task_comp.status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
            # Task is finished - process results
            self._process_finished_task(entity, task_comp)

    def _submit_agent_task(self, entity, task_comp: TaskRequestComponent) -> None:
        """Submit a task to the task manager.

        Args:
            entity: The agent entity
            task_comp: The task request component
        """
        try:
            # Submit task to the task manager
            task_id = self.task_manager.submit_task(
                agent_id=entity.id,
                task_type=task_comp.task_type,
                task_name=task_comp.task_name,
                parameters=task_comp.parameters,
                priority=task_comp.priority,
                timeout=task_comp.timeout,
                dependencies=task_comp.dependencies,
                metadata=task_comp.metadata,
            )

            if task_id:
                task_comp.status = TaskStatus.QUEUED
                task_comp.queued_at = task_comp._get_current_time()
                self.total_tasks_processed += 1

                # Store memory of task submission
                if self.memory_system:
                    self.memory_system.store_memory_for_agent(
                        agent_id=entity.id,
                        memory_type="task",
                        content=f"Submitted task {task_comp.task_name} with ID {task_id}",
                        importance=0.3,
                    )

                logger.debug(f"Task {task_id} submitted for agent {entity.id}")
            else:
                task_comp.status = TaskStatus.FAILED
                task_comp.error_message = "Failed to submit task to queue"

        except Exception as e:
            logger.error(f"Error submitting task for agent {entity.id}: {e}")
            task_comp.status = TaskStatus.FAILED
            task_comp.error_message = str(e)

    def _monitor_running_task(
        self,
        entity,
        task_comp: TaskRequestComponent,
        delta_time: float,
    ) -> None:
        """Monitor a running task.

        Args:
            entity: The agent entity
            task_comp: The task request component
            delta_time: Time elapsed since last processing
        """
        # Check for timeout
        if task_comp.started_at:
            elapsed_time = task_comp._get_current_time() - task_comp.started_at
            if elapsed_time > task_comp.timeout:
                task_comp.status = TaskStatus.TIMEOUT
                task_comp.error_message = f"Task timed out after {elapsed_time:.2f}s"

                # Store memory of timeout
                if self.memory_system:
                    self.memory_system.store_memory_for_agent(
                        agent_id=entity.id,
                        memory_type="task",
                        content=f"Task {task_comp.task_name} timed out",
                        importance=0.5,
                    )

    def _process_finished_task(self, entity, task_comp: TaskRequestComponent) -> None:
        """Process a finished task and create result component.

        Args:
            entity: The agent entity
            task_comp: The task request component
        """
        # Get task result from task manager
        task_status = self.task_manager.get_task_status(task_comp.task_id)

        if task_status and task_status.get("status") in ["completed", "failed"]:
            # Create result component
            result_comp = TaskResultComponent(task_comp.task_id)

            if task_status["status"] == "completed":
                result_comp.set_result(
                    result_data=task_status.get("result_data"),
                    execution_time=task_status.get("execution_time", 0.0),
                    status=TaskStatus.COMPLETED,
                )

                # Store successful task memory
                if self.memory_system:
                    self.memory_system.store_memory_for_agent(
                        agent_id=entity.id,
                        memory_type="task",
                        content=f"Successfully completed task {task_comp.task_name}",
                        importance=0.4,
                    )
            else:
                result_comp.set_result(
                    result_data=None,
                    execution_time=task_status.get("execution_time", 0.0),
                    status=TaskStatus.FAILED,
                    error_message=task_status.get("error_message"),
                )

                # Store failed task memory
                if self.memory_system:
                    self.memory_system.store_memory_for_agent(
                        agent_id=entity.id,
                        memory_type="task",
                        content=f"Task {task_comp.task_name} failed: {task_status.get('error_message', 'Unknown error')}",
                        importance=0.6,
                    )

            # Add result component to entity
            entity.add_component(result_comp)

            # Remove task request component
            entity.remove_component(TaskRequestComponent)

            logger.debug(f"Task {task_comp.task_id} finished for agent {entity.id}")

    def _process_completed_tasks(self) -> None:
        """Process completed tasks and update agent states."""
        # This method can be extended to handle post-task processing
        # such as updating agent capabilities, learning from results, etc.
        pass

    def _find_related_systems(self) -> None:
        """Find and reference related ECS systems."""
        # Find memory system
        for system in self.world.systems:
            if hasattr(system, '__class__') and 'Memory' in system.__class__.__name__:
                self.memory_system = system
                break

        # Find interaction system
        for system in self.world.systems:
            if (
                hasattr(system, '__class__')
                and 'Interaction' in system.__class__.__name__
            ):
                self.interaction_system = system
                break

        # Find social system
        for system in self.world.systems:
            if hasattr(system, '__class__') and 'Social' in system.__class__.__name__:
                self.social_system = system
                break

    async def _register_default_handlers(self) -> None:
        """Register default task handlers."""
        # Register computational task handler
        self.task_manager.register_task_handler(
            TaskType.COMPUTATIONAL,
            self._handle_computational_task,
        )

        # Register validation task handler
        self.task_manager.register_task_handler(
            TaskType.VALIDATION,
            self._handle_validation_task,
        )

        # Register processing task handler
        self.task_manager.register_task_handler(
            TaskType.PROCESSING,
            self._handle_processing_task,
        )

        # Register analysis task handler
        self.task_manager.register_task_handler(
            TaskType.ANALYSIS,
            self._handle_analysis_task,
        )

        logger.info("Default task handlers registered")

    async def _handle_computational_task(self, parameters: dict[str, Any]) -> Any:
        """Handle computational tasks.

        Args:
            parameters: Task parameters

        Returns:
            Task result
        """
        # Example computational task - can be extended with actual computation logic
        operation = parameters.get("operation", "add")
        values = parameters.get("values", [])

        if operation == "add":
            return sum(values)
        elif operation == "multiply":
            result = 1
            for value in values:
                result *= value
            return result
        elif operation == "fibonacci":
            n = parameters.get("n", 10)
            if n <= 1:
                return n
            a, b = 0, 1
            for _ in range(2, n + 1):
                a, b = b, a + b
            return b
        else:
            raise ValueError(f"Unknown computational operation: {operation}")

    async def _handle_validation_task(self, parameters: dict[str, Any]) -> Any:
        """Handle validation tasks.

        Args:
            parameters: Task parameters

        Returns:
            Validation result
        """
        # Example validation task
        data = parameters.get("data")
        validation_type = parameters.get("type", "basic")

        if validation_type == "basic":
            return {"valid": data is not None, "message": "Basic validation passed"}
        elif validation_type == "email":
            import re

            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            is_valid = bool(re.match(email_pattern, str(data)))
            return {
                "valid": is_valid,
                "message": f"Email validation: {'passed' if is_valid else 'failed'}",
            }
        else:
            raise ValueError(f"Unknown validation type: {validation_type}")

    async def _handle_processing_task(self, parameters: dict[str, Any]) -> Any:
        """Handle data processing tasks.

        Args:
            parameters: Task parameters

        Returns:
            Processing result
        """
        # Example processing task
        data = parameters.get("data", [])
        operation = parameters.get("operation", "sort")

        if operation == "sort":
            return sorted(data)
        elif operation == "filter":
            condition = parameters.get("condition", lambda x: True)
            return [item for item in data if condition(item)]
        elif operation == "transform":
            transform_func = parameters.get("transform", lambda x: x)
            return [transform_func(item) for item in data]
        else:
            raise ValueError(f"Unknown processing operation: {operation}")

    async def _handle_analysis_task(self, parameters: dict[str, Any]) -> Any:
        """Handle analysis tasks.

        Args:
            parameters: Task parameters

        Returns:
            Analysis result
        """
        # Example analysis task
        data = parameters.get("data", [])
        analysis_type = parameters.get("type", "statistics")

        if analysis_type == "statistics":
            if not data:
                return {"count": 0, "mean": 0, "min": 0, "max": 0}
            return {
                "count": len(data),
                "mean": sum(data) / len(data),
                "min": min(data),
                "max": max(data),
            }
        elif analysis_type == "trend":
            # Simple trend analysis
            if len(data) < 2:
                return {"trend": "insufficient_data"}
            first_half = data[: len(data) // 2]
            second_half = data[len(data) // 2 :]
            first_avg = sum(first_half) / len(first_half)
            second_avg = sum(second_half) / len(second_half)
            if second_avg > first_avg * 1.1:
                return {"trend": "increasing"}
            elif second_avg < first_avg * 0.9:
                return {"trend": "decreasing"}
            else:
                return {"trend": "stable"}
        else:
            raise ValueError(f"Unknown analysis type: {analysis_type}")

    def submit_task_for_agent(
        self,
        agent_id: str,
        task_type: TaskType,
        task_name: str,
        parameters: dict[str, Any],
        priority: TaskPriority = TaskPriority.NORMAL,
        timeout: float = 30.0,
        dependencies: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> str | None:
        """Submit a task for a specific agent.

        Args:
            agent_id: ID of the agent
            task_type: Type of task to execute
            task_name: Name/identifier of the task
            parameters: Task execution parameters
            priority: Task priority level
            timeout: Task timeout in seconds
            dependencies: List of task IDs this task depends on
            metadata: Additional metadata for the task

        Returns:
            Task ID if successful, None if agent not found
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            logger.warning(f"Agent {agent_id} not found for task submission")
            return None

        # Create task request component
        task_comp = TaskRequestComponent(
            agent_id=agent_id,
            task_type=task_type,
            task_name=task_name,
            parameters=parameters,
            priority=priority,
            timeout=timeout,
            dependencies=dependencies,
            metadata=metadata,
        )

        # Add task component to agent entity
        entity.add_component(task_comp)

        logger.info(f"Task {task_comp.task_id} created for agent {agent_id}")
        return task_comp.task_id

    def get_agent_task_status(self, agent_id: str) -> list[dict[str, Any]]:
        """Get task status for a specific agent.

        Args:
            agent_id: ID of the agent

        Returns:
            List of task status information
        """
        entity = self.world.get_entity(agent_id)
        if not entity:
            return []

        tasks = []

        # Get task request components
        task_comp = entity.get_component(TaskRequestComponent)
        if task_comp:
            tasks.append(
                {
                    "task_id": task_comp.task_id,
                    "status": task_comp.status.value,
                    "task_name": task_comp.task_name,
                    "task_type": task_comp.task_type.value,
                    "priority": task_comp.priority.value,
                    "created_at": task_comp.created_at,
                    "error_message": task_comp.error_message,
                }
            )

        # Get task result components
        result_comp = entity.get_component(TaskResultComponent)
        if result_comp:
            tasks.append(
                {
                    "task_id": result_comp.task_id,
                    "status": result_comp.status.value,
                    "execution_time": result_comp.execution_time,
                    "completed_at": result_comp.completed_at,
                    "error_message": result_comp.error_message,
                }
            )

        return tasks

    def get_system_stats(self) -> dict[str, Any]:
        """Get comprehensive system statistics."""
        return {
            "initialized": self.initialized,
            "total_tasks_processed": self.total_tasks_processed,
            "total_agents_served": self.total_agents_served,
            "processing_interval": self.processing_interval,
            "last_processing_time": self.last_processing_time,
            "task_manager_stats": (
                self.task_manager.get_queue_statistics() if self.initialized else {}
            ),
            "related_systems": {
                "memory_system": self.memory_system is not None,
                "interaction_system": self.interaction_system is not None,
                "social_system": self.social_system is not None,
            },
        }
