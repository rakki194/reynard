"""
Thread Pool Executor Types for Reynard Backend

Type definitions and enums for the thread pool executor system.
"""

from dataclasses import dataclass
from enum import Enum


class ExecutorState(Enum):
    """Executor state enumeration."""

    IDLE = "idle"
    RUNNING = "running"
    SHUTTING_DOWN = "shutting_down"
    SHUTDOWN = "shutdown"


@dataclass
class ExecutorConfig:
    """Configuration for the thread pool executor."""

    max_workers: int = 4
    enable_performance_monitoring: bool = True
    auto_cleanup: bool = True
    default_timeout: float = 30.0
    max_retries: int = 3
    retry_delay: float = 1.0


@dataclass
class ExecutorStats:
    """Statistics for the executor."""

    active_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    average_execution_time: float = 0.0
    total_execution_time: float = 0.0
    max_concurrent_tasks: int = 0
    current_concurrent_tasks: int = 0


@dataclass
class TaskInfo:
    """Information about a running task."""

    task_id: str
    function_name: str
    start_time: float
    timeout: float
    retry_count: int = 0
    max_retries: int = 3
