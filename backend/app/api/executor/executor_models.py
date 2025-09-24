"""Executor API Models for Reynard Backend

Pydantic models for executor API endpoints.
"""

from pydantic import BaseModel, Field


class ExecutorConfigRequest(BaseModel):
    max_workers: int | None = Field(default=4, ge=1, le=16)
    enable_performance_monitoring: bool | None = Field(default=True)
    auto_cleanup: bool | None = Field(default=True)
    default_timeout: float | None = Field(default=30.0, ge=1.0, le=300.0)
    max_retries: int | None = Field(default=3, ge=0, le=10)
    retry_delay: float | None = Field(default=1.0, ge=0.1, le=10.0)


class ExecutorStatsResponse(BaseModel):
    active_tasks: int
    completed_tasks: int
    failed_tasks: int
    average_execution_time: float
    total_execution_time: float
    max_concurrent_tasks: int
    current_concurrent_tasks: int


class TaskInfoResponse(BaseModel):
    task_id: str
    function_name: str
    start_time: float
    timeout: float
    retry_count: int
    max_retries: int


class ExecutorStateResponse(BaseModel):
    state: str
    initialized: bool


class TaskExecutionRequest(BaseModel):
    function_name: str = Field(..., description="Name of the function to execute")
    timeout: float | None = Field(default=None, ge=1.0, le=300.0)
    retries: int | None = Field(default=None, ge=0, le=10)
