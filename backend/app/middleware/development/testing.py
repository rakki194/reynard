"""Testing support middleware for development and testing scenarios.

This module provides testing support functionality that enhances the development
experience with testing utilities, mock data injection, and testing-specific
features for the Reynard framework.
"""

import json
import logging
from collections.abc import Awaitable, Callable
from typing import Any, Dict, Optional

from fastapi import Request, Response

from ..core.base import BaseMiddleware

logger = logging.getLogger(__name__)


class TestingSupportConfig:
    """Configuration for testing support middleware."""

    def __init__(
        self,
        enabled: bool = True,
        environment: str = "development",
        mock_data_enabled: bool = True,
        test_headers_enabled: bool = True,
        debug_responses_enabled: bool = True,
        performance_tracking_enabled: bool = True,
        skip_paths: Optional[list[str]] = None,
    ):
        """Initialize testing support configuration.

        Args:
            enabled: Whether testing support is enabled
            environment: Current environment
            mock_data_enabled: Whether to enable mock data injection
            test_headers_enabled: Whether to add test headers
            debug_responses_enabled: Whether to add debug response info
            performance_tracking_enabled: Whether to track performance
            skip_paths: Paths to skip for testing support
        """
        self.enabled = enabled
        self.environment = environment
        self.mock_data_enabled = mock_data_enabled
        self.test_headers_enabled = test_headers_enabled
        self.debug_responses_enabled = debug_responses_enabled
        self.performance_tracking_enabled = performance_tracking_enabled
        self.skip_paths = skip_paths or [
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/favicon.ico",
            "/health",
            "/api/health",
            "/",
        ]


class TestingSupportMiddleware(BaseMiddleware):
    """Testing support middleware for development and testing.

    Provides comprehensive testing support including mock data injection,
    test headers, debug responses, and performance tracking for development
    and testing scenarios.
    """

    def __init__(
        self,
        app: Callable,
        name: str = "testing_support",
        config: Optional[TestingSupportConfig] = None,
        **kwargs,
    ):
        """Initialize the testing support middleware.

        Args:
            app: The ASGI application
            name: Middleware name
            config: Testing support configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)

        # Set up configuration
        if config is None:
            config = TestingSupportConfig()

        self.config = config
        self.logger = logging.getLogger(f"middleware.{name}")

        # Testing data
        self._mock_data: Dict[str, Any] = {}
        self._performance_metrics: Dict[str, list] = {}
        self._test_scenarios: Dict[str, Any] = {}

    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request and apply testing support features.

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response: The HTTP response
        """
        # Check if testing support is enabled
        if not self.config.enabled or not self._is_testing_environment():
            return await call_next(request)

        # Skip certain paths
        if self._should_skip_path(request.url.path):
            return await call_next(request)

        # Start performance tracking
        start_time = self._start_performance_tracking(request)

        # Apply testing features
        self._apply_testing_features(request)

        # Process the request
        response = await call_next(request)

        # End performance tracking
        self._end_performance_tracking(request, start_time)

        # Add testing headers and debug info
        self._add_testing_headers(response, request)

        return response

    def _is_testing_environment(self) -> bool:
        """Check if running in a testing environment.

        Returns:
            True if in testing environment
        """
        return self.config.environment.lower() in [
            "development",
            "dev",
            "testing",
            "test",
            "staging",
        ]

    def _should_skip_path(self, path: str) -> bool:
        """Check if path should be skipped for testing support.

        Args:
            path: The request path

        Returns:
            True if path should be skipped
        """
        return any(skip_path in path for skip_path in self.config.skip_paths)

    def _start_performance_tracking(self, request: Request) -> float:
        """Start performance tracking for the request.

        Args:
            request: The HTTP request

        Returns:
            Start time timestamp
        """
        if not self.config.performance_tracking_enabled:
            return 0.0

        import time

        start_time = time.time()

        # Store start time in request state
        request.state.testing_start_time = start_time

        return start_time

    def _end_performance_tracking(self, request: Request, start_time: float) -> None:
        """End performance tracking for the request.

        Args:
            request: The HTTP request
            start_time: Start time timestamp
        """
        if not self.config.performance_tracking_enabled or start_time == 0.0:
            return

        import time

        end_time = time.time()
        duration = end_time - start_time

        # Store performance metrics
        path = request.url.path
        if path not in self._performance_metrics:
            self._performance_metrics[path] = []

        self._performance_metrics[path].append(
            {
                "timestamp": end_time,
                "duration": duration,
                "method": request.method,
                "status_code": getattr(request.state, "response_status", 200),
            }
        )

        # Keep only recent metrics (last 100 per path)
        if len(self._performance_metrics[path]) > 100:
            self._performance_metrics[path] = self._performance_metrics[path][-100:]

    def _apply_testing_features(self, request: Request) -> None:
        """Apply testing features to the request.

        Args:
            request: The HTTP request
        """
        # Check for mock data injection
        if self.config.mock_data_enabled:
            self._inject_mock_data(request)

        # Check for test scenario activation
        self._activate_test_scenario(request)

    def _inject_mock_data(self, request: Request) -> None:
        """Inject mock data into the request if specified.

        Args:
            request: The HTTP request
        """
        # Check for mock data headers
        mock_data_header = request.headers.get("X-Test-Mock-Data")
        if mock_data_header:
            try:
                mock_data = json.loads(mock_data_header)
                request.state.mock_data = mock_data
                self.logger.debug(f"Injected mock data: {mock_data}")
            except json.JSONDecodeError:
                self.logger.warning(f"Invalid mock data JSON: {mock_data_header}")

        # Check for predefined mock data scenarios
        mock_scenario = request.headers.get("X-Test-Mock-Scenario")
        if mock_scenario and mock_scenario in self._mock_data:
            request.state.mock_data = self._mock_data[mock_scenario]
            self.logger.debug(f"Applied mock scenario: {mock_scenario}")

    def _activate_test_scenario(self, request: Request) -> None:
        """Activate a test scenario if specified.

        Args:
            request: The HTTP request
        """
        test_scenario = request.headers.get("X-Test-Scenario")
        if test_scenario and test_scenario in self._test_scenarios:
            scenario_config = self._test_scenarios[test_scenario]
            request.state.test_scenario = scenario_config
            self.logger.debug(f"Activated test scenario: {test_scenario}")

    def _add_testing_headers(self, response: Response, request: Request) -> None:
        """Add testing headers to the response.

        Args:
            response: The HTTP response
            request: The HTTP request
        """
        if not self.config.test_headers_enabled:
            return

        # Add basic testing headers
        response.headers["X-Testing-Middleware"] = "TestingSupportMiddleware"
        response.headers["X-Testing-Environment"] = self.config.environment

        # Add debug response info
        if self.config.debug_responses_enabled:
            self._add_debug_response_info(response, request)

        # Add performance info
        if self.config.performance_tracking_enabled:
            self._add_performance_info(response, request)

    def _add_debug_response_info(self, response: Response, request: Request) -> None:
        """Add debug response information.

        Args:
            response: The HTTP response
            request: The HTTP request
        """
        debug_info = {
            "path": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "content_type": response.headers.get("content-type", "unknown"),
            "content_length": response.headers.get("content-length", "unknown"),
        }

        # Add mock data info if present
        if hasattr(request.state, "mock_data"):
            debug_info["mock_data_injected"] = True

        # Add test scenario info if present
        if hasattr(request.state, "test_scenario"):
            debug_info["test_scenario_active"] = True

        response.headers["X-Debug-Info"] = json.dumps(debug_info)

    def _add_performance_info(self, response: Response, request: Request) -> None:
        """Add performance information to the response.

        Args:
            response: The HTTP response
            request: The HTTP request
        """
        if hasattr(request.state, "testing_start_time"):
            import time

            duration = time.time() - request.state.testing_start_time
            response.headers["X-Response-Time"] = f"{duration:.4f}s"

            # Add performance metrics for this path
            path = request.url.path
            if path in self._performance_metrics:
                recent_metrics = self._performance_metrics[path][
                    -10:
                ]  # Last 10 requests
                avg_duration = sum(m["duration"] for m in recent_metrics) / len(
                    recent_metrics
                )
                response.headers["X-Avg-Response-Time"] = f"{avg_duration:.4f}s"

    def add_mock_data(self, scenario_name: str, mock_data: Dict[str, Any]) -> None:
        """Add mock data for a test scenario.

        Args:
            scenario_name: Name of the test scenario
            mock_data: Mock data to inject
        """
        self._mock_data[scenario_name] = mock_data
        self.logger.info(f"Added mock data for scenario: {scenario_name}")

    def remove_mock_data(self, scenario_name: str) -> bool:
        """Remove mock data for a test scenario.

        Args:
            scenario_name: Name of the test scenario

        Returns:
            True if scenario was removed, False if not found
        """
        if scenario_name in self._mock_data:
            del self._mock_data[scenario_name]
            self.logger.info(f"Removed mock data for scenario: {scenario_name}")
            return True
        return False

    def add_test_scenario(
        self, scenario_name: str, scenario_config: Dict[str, Any]
    ) -> None:
        """Add a test scenario configuration.

        Args:
            scenario_name: Name of the test scenario
            scenario_config: Scenario configuration
        """
        self._test_scenarios[scenario_name] = scenario_config
        self.logger.info(f"Added test scenario: {scenario_name}")

    def remove_test_scenario(self, scenario_name: str) -> bool:
        """Remove a test scenario configuration.

        Args:
            scenario_name: Name of the test scenario

        Returns:
            True if scenario was removed, False if not found
        """
        if scenario_name in self._test_scenarios:
            del self._test_scenarios[scenario_name]
            self.logger.info(f"Removed test scenario: {scenario_name}")
            return True
        return False

    def get_performance_metrics(self, path: Optional[str] = None) -> Dict[str, Any]:
        """Get performance metrics.

        Args:
            path: Specific path to get metrics for (optional)

        Returns:
            Performance metrics
        """
        if path:
            return self._performance_metrics.get(path, [])

        # Return summary for all paths
        summary = {}
        for path, metrics in self._performance_metrics.items():
            if metrics:
                avg_duration = sum(m["duration"] for m in metrics) / len(metrics)
                summary[path] = {
                    "request_count": len(metrics),
                    "avg_duration": avg_duration,
                    "min_duration": min(m["duration"] for m in metrics),
                    "max_duration": max(m["duration"] for m in metrics),
                }

        return summary

    def clear_performance_metrics(self, path: Optional[str] = None) -> None:
        """Clear performance metrics.

        Args:
            path: Specific path to clear (optional)
        """
        if path:
            if path in self._performance_metrics:
                del self._performance_metrics[path]
                self.logger.info(f"Cleared performance metrics for path: {path}")
        else:
            self._performance_metrics.clear()
            self.logger.info("Cleared all performance metrics")

    def get_testing_summary(self) -> Dict[str, Any]:
        """Get a summary of testing support status.

        Returns:
            Dictionary with testing support summary
        """
        return {
            "enabled": self.config.enabled,
            "environment": self.config.environment,
            "mock_data_scenarios": len(self._mock_data),
            "test_scenarios": len(self._test_scenarios),
            "performance_tracking_enabled": self.config.performance_tracking_enabled,
            "tracked_paths": len(self._performance_metrics),
            "mock_data_enabled": self.config.mock_data_enabled,
            "test_headers_enabled": self.config.test_headers_enabled,
            "debug_responses_enabled": self.config.debug_responses_enabled,
        }

    def update_testing_config(self, **kwargs) -> None:
        """Update testing support configuration.

        Args:
            **kwargs: Configuration parameters to update
        """
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
                self.logger.info(f"Updated testing config: {key} = {value}")


def create_testing_support_middleware(
    app: Callable, environment: str = "development", **config_kwargs
) -> TestingSupportMiddleware:
    """Create a testing support middleware instance.

    Args:
        app: The ASGI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters

    Returns:
        Configured testing support middleware instance
    """
    config = TestingSupportConfig(environment=environment)

    # Update config with any provided parameters
    for key, value in config_kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)

    return TestingSupportMiddleware(app, config=config)


def setup_testing_support_middleware(
    app, environment: str = "development", **config_kwargs
) -> None:
    """Setup testing support middleware for a FastAPI application.

    Args:
        app: The FastAPI application
        environment: The environment (development, staging, production)
        **config_kwargs: Additional configuration parameters
    """
    testing_middleware = create_testing_support_middleware(
        app, environment, **config_kwargs
    )

    # Add the middleware to the FastAPI app
    app.add_middleware(
        TestingSupportMiddleware, config=testing_middleware.config, **config_kwargs
    )

    logger.info(
        f"Testing support middleware setup complete for {environment} environment"
    )
