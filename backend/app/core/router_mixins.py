"""
Router Mixins for Reynard Backend Services

This module provides reusable mixins that can be combined with
BaseServiceRouter to add specific functionality to service routers.
"""

import logging
from typing import Any

from fastapi import File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

from .error_handler import service_error_handler
from .exceptions import ValidationError
from .streaming_mixin import StreamingResponseMixin as EnhancedStreamingResponseMixin

logger = logging.getLogger(__name__)


class ConfigEndpointMixin:
    """
    Mixin that provides configuration endpoints for services.
    """

    def setup_config_endpoints(self, config_model: type[BaseModel]) -> None:
        """
        Setup configuration endpoints for the service.

        Args:
            config_model: Pydantic model for configuration
        """

        @self.router.get("/config")
        async def get_config():
            """Get current service configuration."""
            try:
                service = self.get_service()
                if hasattr(service, "get_config"):
                    config = service.get_config()
                    return config
                raise HTTPException(
                    status_code=501,
                    detail="Configuration not supported by this service",
                )
            except Exception as e:
                logger.error(f"Failed to get config for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="get_config", error=e, service_name=self.service_name
                )

        @self.router.put("/config")
        async def update_config(config: config_model):
            """Update service configuration."""
            try:
                service = self.get_service()
                if hasattr(service, "update_config"):
                    result = service.update_config(config.dict())
                    return {
                        "success": True,
                        "message": "Configuration updated",
                        "result": result,
                    }
                raise HTTPException(
                    status_code=501,
                    detail="Configuration updates not supported by this service",
                )
            except Exception as e:
                logger.error(f"Failed to update config for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="update_config", error=e, service_name=self.service_name
                )

        @self.router.post("/config/validate")
        async def validate_config(config: config_model):
            """Validate configuration without applying it."""
            try:
                # Basic validation is done by Pydantic
                return {"valid": True, "message": "Configuration is valid"}
            except Exception as e:
                logger.error(f"Config validation failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="validate_config", error=e, service_name=self.service_name
                )


# Use the enhanced streaming mixin
StreamingResponseMixin = EnhancedStreamingResponseMixin


class FileUploadMixin:
    """
    Mixin that provides file upload capabilities.
    """

    def setup_file_upload_endpoints(self) -> None:
        """Setup file upload endpoints."""

        @self.router.post("/upload")
        async def upload_file(file: UploadFile = File(...)):
            """Upload a file to the service."""
            try:
                service = self.get_service()
                if hasattr(service, "upload_file"):
                    result = await service.upload_file(file)
                    return {
                        "success": True,
                        "message": "File uploaded successfully",
                        "result": result,
                    }
                raise HTTPException(
                    status_code=501, detail="File upload not supported by this service"
                )
            except Exception as e:
                logger.error(f"File upload failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="upload_file", error=e, service_name=self.service_name
                )

        @self.router.post("/upload/batch")
        async def upload_files(files: list[UploadFile] = File(...)):
            """Upload multiple files to the service."""
            try:
                service = self.get_service()
                if hasattr(service, "upload_files"):
                    results = await service.upload_files(files)
                    return {
                        "success": True,
                        "message": f"Uploaded {len(files)} files",
                        "results": results,
                    }
                raise HTTPException(
                    status_code=501,
                    detail="Batch file upload not supported by this service",
                )
            except Exception as e:
                logger.error(f"Batch file upload failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="upload_files", error=e, service_name=self.service_name
                )

    def validate_file_type(self, file: UploadFile, allowed_types: list[str]) -> bool:
        """
        Validate file type.

        Args:
            file: Uploaded file
            allowed_types: List of allowed MIME types

        Returns:
            bool: True if file type is allowed

        Raises:
            ValidationError: If file type is not allowed
        """
        if file.content_type not in allowed_types:
            raise ValidationError(
                message=f"File type '{file.content_type}' not allowed. Allowed types: {allowed_types}",
                details={
                    "file_type": file.content_type,
                    "allowed_types": allowed_types,
                },
            )
        return True

    def validate_file_size(self, file: UploadFile, max_size: int) -> bool:
        """
        Validate file size.

        Args:
            file: Uploaded file
            max_size: Maximum file size in bytes

        Returns:
            bool: True if file size is within limits

        Raises:
            ValidationError: If file size exceeds limits
        """
        if file.size and file.size > max_size:
            raise ValidationError(
                message=f"File size {file.size} bytes exceeds maximum {max_size} bytes",
                details={"file_size": file.size, "max_size": max_size},
            )
        return True


class MetricsMixin:
    """
    Mixin that provides metrics collection capabilities.
    """

    def __init__(self):
        self._metrics: dict[str, Any] = {
            "requests_total": 0,
            "requests_by_endpoint": {},
            "errors_total": 0,
            "errors_by_type": {},
            "response_times": [],
            "active_connections": 0,
        }

    def setup_metrics_endpoints(self) -> None:
        """Setup metrics endpoints."""

        @self.router.get("/metrics")
        async def get_metrics():
            """Get service metrics."""
            try:
                return {
                    "service": self.service_name,
                    "metrics": self._metrics,
                    "timestamp": self._get_timestamp(),
                }
            except Exception as e:
                logger.error(f"Failed to get metrics for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="get_metrics", error=e, service_name=self.service_name
                )

        @self.router.get("/metrics/reset")
        async def reset_metrics():
            """Reset service metrics."""
            try:
                self._reset_metrics()
                return {"success": True, "message": "Metrics reset successfully"}
            except Exception as e:
                logger.error(f"Failed to reset metrics for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="reset_metrics", error=e, service_name=self.service_name
                )

    def record_request(self, endpoint: str, response_time: float) -> None:
        """
        Record a request metric.

        Args:
            endpoint: The endpoint that was called
            response_time: Response time in seconds
        """
        self._metrics["requests_total"] += 1

        if endpoint not in self._metrics["requests_by_endpoint"]:
            self._metrics["requests_by_endpoint"][endpoint] = 0
        self._metrics["requests_by_endpoint"][endpoint] += 1

        self._metrics["response_times"].append(response_time)

        # Keep only last 1000 response times
        if len(self._metrics["response_times"]) > 1000:
            self._metrics["response_times"] = self._metrics["response_times"][-1000:]

    def record_error(self, error_type: str) -> None:
        """
        Record an error metric.

        Args:
            error_type: Type of error that occurred
        """
        self._metrics["errors_total"] += 1

        if error_type not in self._metrics["errors_by_type"]:
            self._metrics["errors_by_type"][error_type] = 0
        self._metrics["errors_by_type"][error_type] += 1

    def _reset_metrics(self) -> None:
        """Reset all metrics."""
        self._metrics = {
            "requests_total": 0,
            "requests_by_endpoint": {},
            "errors_total": 0,
            "errors_by_type": {},
            "response_times": [],
            "active_connections": 0,
        }

    def _get_timestamp(self) -> float:
        """Get current timestamp."""
        import time

        return time.time()


class RateLimitingMixin:
    """
    Mixin that provides rate limiting capabilities.
    """

    def __init__(self):
        self._rate_limits: dict[str, dict[str, Any]] = {}

    def setup_rate_limiting_endpoints(self) -> None:
        """Setup rate limiting endpoints."""

        @self.router.get("/rate-limits")
        async def get_rate_limits():
            """Get current rate limits."""
            try:
                return {
                    "service": self.service_name,
                    "rate_limits": self._rate_limits,
                    "timestamp": self._get_timestamp(),
                }
            except Exception as e:
                logger.error(f"Failed to get rate limits for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="get_rate_limits", error=e, service_name=self.service_name
                )

    def set_rate_limit(self, endpoint: str, requests_per_minute: int) -> None:
        """
        Set rate limit for an endpoint.

        Args:
            endpoint: The endpoint to limit
            requests_per_minute: Maximum requests per minute
        """
        self._rate_limits[endpoint] = {
            "requests_per_minute": requests_per_minute,
            "requests": [],
            "last_reset": self._get_timestamp(),
        }

    def check_rate_limit(self, endpoint: str) -> bool:
        """
        Check if request is within rate limit.

        Args:
            endpoint: The endpoint being accessed

        Returns:
            bool: True if request is allowed

        Raises:
            HTTPException: If rate limit exceeded
        """
        if endpoint not in self._rate_limits:
            return True

        rate_limit = self._rate_limits[endpoint]
        current_time = self._get_timestamp()

        # Clean old requests (older than 1 minute)
        rate_limit["requests"] = [
            req_time
            for req_time in rate_limit["requests"]
            if current_time - req_time < 60
        ]

        # Check if limit exceeded
        if len(rate_limit["requests"]) >= rate_limit["requests_per_minute"]:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded for {endpoint}. Limit: {rate_limit['requests_per_minute']} requests per minute",
            )

        # Record this request
        rate_limit["requests"].append(current_time)
        return True

    def _get_timestamp(self) -> float:
        """Get current timestamp."""
        import time

        return time.time()


class ValidationMixin:
    """
    Mixin that provides input validation capabilities.
    """

    def validate_request(
        self, request_model: type[BaseModel], data: dict[str, Any]
    ) -> BaseModel:
        """
        Validate request data against a model.

        Args:
            request_model: Pydantic model to validate against
            data: Data to validate

        Returns:
            BaseModel: Validated model instance

        Raises:
            ValidationError: If validation fails
        """
        try:
            return request_model(**data)
        except Exception as e:
            raise ValidationError(
                message=f"Request validation failed: {e!s}",
                details={"validation_errors": str(e)},
            )

    def validate_query_params(
        self, params: dict[str, Any], required_params: list[str]
    ) -> None:
        """
        Validate query parameters.

        Args:
            params: Query parameters
            required_params: List of required parameter names

        Raises:
            ValidationError: If required parameters are missing
        """
        missing_params = [param for param in required_params if param not in params]
        if missing_params:
            raise ValidationError(
                message=f"Missing required query parameters: {missing_params}",
                details={"missing_params": missing_params},
            )
