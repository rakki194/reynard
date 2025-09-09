"""
Executor API Models for Reynard Backend

Pydantic models for executor API endpoints.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ExecutorConfigRequest(BaseModel):
    max_workers: Optional[int] = Field(default=4, ge=1, le=16)
    enable_performance_monitoring: Optional[bool] = Field(default=True)
    auto_cleanup: Optional[bool] = Field(default=True)
    default_timeout: Optional[float] = Field(default=30.0, ge=1.0, le=300.0)
    max_retries: Optional[int] = Field(default=3, ge=0, le=10)
    retry_delay: Optional[float] = Field(default=1.0, ge=0.1, le=10.0)


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
    timeout: Optional[float] = Field(default=None, ge=1.0, le=300.0)
    retries: Optional[int] = Field(default=None, ge=0, le=10)
