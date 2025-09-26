#!/usr/bin/env python3
"""🦊 Mock API Server for Cloudflare Outage Testing

This server simulates the Tenant Service API that was overwhelmed
during the Cloudflare outage. It provides endpoints that can be
spammed to test infinite loop detection.
"""

import json
import logging
import os
import sys
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse


# Configure detailed logging
def setup_logging():
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "results",
        "effects",
        "backend-logs",
    )
    os.makedirs(log_dir, exist_ok=True)

    # Create timestamped log file
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = os.path.join(log_dir, f"backend-{timestamp}.log")

    # Configure logging with both file and console output
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[logging.FileHandler(log_file), logging.StreamHandler(sys.stdout)],
    )

    logger = logging.getLogger(__name__)
    logger.info(f"🦊 Backend logging initialized - Log file: {log_file}")
    return logger, log_file


logger, log_file = setup_logging()

# Global state to persist across requests
_global_state = {
    "request_count": 0,
    "start_time": time.time(),
    "rate_limit_window": 10,  # 10 seconds
    "rate_limit_requests": 5,  # 5 requests per 10 seconds (for testing)
    "request_timestamps": [],  # Track request timestamps for rate limiting
    "circuit_breaker_threshold": 10,  # Circuit breaker after 10 failures
    "circuit_breaker_failures": 0,
    "circuit_breaker_reset_time": 0,
    "circuit_breaker_timeout": 30,  # 30 seconds
    "rate_limiting_enabled": True,
    "circuit_breaker_enabled": True,
    "failure_simulation_enabled": True,
    "failure_rate": 0.05,  # 5% failure rate by default
    # Enhanced protection mechanisms
    "rapid_request_detection_enabled": True,
    "rapid_request_threshold": 3,  # 3 requests in 1 second triggers protection
    "rapid_request_window": 1,  # 1 second window
    "rapid_request_timestamps": [],  # Track rapid requests
    "request_pattern_detection_enabled": True,
    "identical_request_threshold": 5,  # 5 identical requests triggers protection
    "request_cache": {},  # Cache recent requests to detect patterns
    "cache_window": 5,  # 5 seconds cache window
}


class MockAPIHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def log_message(self, format, *args):
        # Custom logging to track API calls
        logger.info(f"{self.client_address[0]} - {format % args}")

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS",
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def check_rate_limit(self):
        """Check if request exceeds rate limit"""
        current_time = time.time()

        # Clean old timestamps
        old_count = len(_global_state["request_timestamps"])
        _global_state["request_timestamps"] = [
            ts
            for ts in _global_state["request_timestamps"]
            if current_time - ts < _global_state["rate_limit_window"]
        ]
        cleaned_count = old_count - len(_global_state["request_timestamps"])

        if cleaned_count > 0:
            logger.debug(
                f"🧹 Cleaned {cleaned_count} old timestamps from rate limit window",
            )

        # Check if we're over the limit
        if (
            len(_global_state["request_timestamps"])
            >= _global_state["rate_limit_requests"]
        ):
            logger.warning(
                f"🚫 RATE LIMIT EXCEEDED: {len(_global_state['request_timestamps'])} requests in {_global_state['rate_limit_window']}s (limit: {_global_state['rate_limit_requests']})",
            )
            logger.warning(
                f"🚫 Rate limit details: window={_global_state['rate_limit_window']}s, limit={_global_state['rate_limit_requests']}, current={len(_global_state['request_timestamps'])}",
            )
            return False

        # Add current request timestamp
        _global_state["request_timestamps"].append(current_time)
        remaining = _global_state["rate_limit_requests"] - len(
            _global_state["request_timestamps"],
        )
        logger.debug(
            f"✅ Rate limit check passed: {len(_global_state['request_timestamps'])}/{_global_state['rate_limit_requests']} requests, {remaining} remaining",
        )
        return True

    def check_circuit_breaker(self):
        """Check if circuit breaker is open"""
        current_time = time.time()

        # Reset circuit breaker if timeout has passed
        if (
            _global_state["circuit_breaker_failures"]
            >= _global_state["circuit_breaker_threshold"]
        ):
            if (
                current_time - _global_state["circuit_breaker_reset_time"]
                > _global_state["circuit_breaker_timeout"]
            ):
                logger.info(
                    f"🔄 CIRCUIT BREAKER RESET: {_global_state['circuit_breaker_failures']} failures cleared, allowing requests again",
                )
                _global_state["circuit_breaker_failures"] = 0
                _global_state["circuit_breaker_reset_time"] = 0
            else:
                remaining_time = _global_state["circuit_breaker_timeout"] - (
                    current_time - _global_state["circuit_breaker_reset_time"]
                )
                logger.warning(
                    f"⚡ CIRCUIT BREAKER OPEN: blocking requests for {remaining_time:.1f}s (failures: {_global_state['circuit_breaker_failures']}/{_global_state['circuit_breaker_threshold']})",
                )
                return False

        if _global_state["circuit_breaker_failures"] > 0:
            logger.debug(
                f"🔧 Circuit breaker status: {_global_state['circuit_breaker_failures']}/{_global_state['circuit_breaker_threshold']} failures",
            )

        return True

    def check_rapid_request_detection(self):
        """Check for rapid request patterns (infinite loop detection)"""
        if not _global_state["rapid_request_detection_enabled"]:
            return True

        current_time = time.time()

        # Clean old timestamps
        _global_state["rapid_request_timestamps"] = [
            ts
            for ts in _global_state["rapid_request_timestamps"]
            if current_time - ts < _global_state["rapid_request_window"]
        ]

        # Check if we're over the rapid request threshold
        if (
            len(_global_state["rapid_request_timestamps"])
            >= _global_state["rapid_request_threshold"]
        ):
            logger.warning(
                f"🚨 RAPID REQUEST DETECTED: {len(_global_state['rapid_request_timestamps'])} requests in {_global_state['rapid_request_window']}s (threshold: {_global_state['rapid_request_threshold']})",
            )
            logger.warning(
                "🚨 This indicates a potential infinite loop or API spam attack!",
            )
            return False

        # Add current request timestamp
        _global_state["rapid_request_timestamps"].append(current_time)
        logger.debug(
            f"✅ Rapid request check passed: {len(_global_state['rapid_request_timestamps'])}/{_global_state['rapid_request_threshold']} requests in {_global_state['rapid_request_window']}s",
        )
        return True

    def check_request_pattern_detection(self, path, method):
        """Check for identical request patterns (infinite loop detection)"""
        if not _global_state["request_pattern_detection_enabled"]:
            return True

        current_time = time.time()
        request_key = f"{method}:{path}"

        # Clean old cache entries
        _global_state["request_cache"] = {
            k: v
            for k, v in _global_state["request_cache"].items()
            if current_time - v["last_seen"] < _global_state["cache_window"]
        }

        # Check if this request pattern exists
        if request_key in _global_state["request_cache"]:
            _global_state["request_cache"][request_key]["count"] += 1
            _global_state["request_cache"][request_key]["last_seen"] = current_time

            # Check if we've exceeded the threshold
            if (
                _global_state["request_cache"][request_key]["count"]
                >= _global_state["identical_request_threshold"]
            ):
                logger.warning(
                    f"🚨 IDENTICAL REQUEST PATTERN DETECTED: {request_key} called {_global_state['request_cache'][request_key]['count']} times in {_global_state['cache_window']}s",
                )
                logger.warning(
                    "🚨 This indicates a potential infinite loop in the frontend!",
                )
                return False
        else:
            # Add new request pattern
            _global_state["request_cache"][request_key] = {
                "count": 1,
                "last_seen": current_time,
                "first_seen": current_time,
            }

        logger.debug(
            f"✅ Request pattern check passed: {request_key} count={_global_state['request_cache'].get(request_key, {}).get('count', 0)}",
        )
        return True

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Increment request counter
        _global_state["request_count"] += 1

        logger.info(
            f"🌐 REQUEST #{_global_state['request_count']}: {self.command} {path} from {self.client_address[0]}",
        )

        # Check circuit breaker first (if enabled)
        if (
            _global_state["circuit_breaker_enabled"]
            and not self.check_circuit_breaker()
        ):
            logger.error(
                f"❌ REQUEST #{_global_state['request_count']} BLOCKED: Circuit breaker open",
            )
            self.send_error(503, "Service Unavailable - Circuit Breaker Open")
            return

        # Check rate limit (if enabled)
        if _global_state["rate_limiting_enabled"] and not self.check_rate_limit():
            logger.error(
                f"❌ REQUEST #{_global_state['request_count']} BLOCKED: Rate limit exceeded",
            )
            self.send_error(429, "Too Many Requests - Rate Limit Exceeded")
            return

        # Check rapid request detection (if enabled) - NEW PROTECTION
        if (
            _global_state["rapid_request_detection_enabled"]
            and not self.check_rapid_request_detection()
        ):
            logger.error(
                f"❌ REQUEST #{_global_state['request_count']} BLOCKED: Rapid request pattern detected",
            )
            self.send_error(429, "Too Many Requests - Rapid Request Pattern Detected")
            return

        # Check request pattern detection (if enabled) - NEW PROTECTION
        if _global_state[
            "request_pattern_detection_enabled"
        ] and not self.check_request_pattern_detection(path, self.command):
            logger.error(
                f"❌ REQUEST #{_global_state['request_count']} BLOCKED: Identical request pattern detected",
            )
            self.send_error(
                429,
                "Too Many Requests - Identical Request Pattern Detected",
            )
            return

        logger.info(
            f"✅ REQUEST #{_global_state['request_count']} PASSED: All safeguards cleared",
        )

        # Simulate the Tenant Service API endpoints
        if path == "/api/v1/organizations":
            self.handle_organizations()
        elif path == "/api/v1/user-permissions":
            self.handle_user_permissions()
        elif path == "/api/v1/tenant-info":
            self.handle_tenant_info()
        elif path == "/api/v1/health":
            self.handle_health()
        elif path == "/api/v1/stats":
            self.handle_stats()
        elif path == "/api/v1/control/reset":
            self.handle_reset()
        elif path == "/api/v1/control/configure":
            self.handle_configure()
        elif path == "/api/v1/control/status":
            self.handle_control_status()
        else:
            logger.warning(
                f"⚠️ REQUEST #{_global_state['request_count']} NOT FOUND: {path}",
            )
            self.send_error(404, "Not Found")

    def handle_organizations(self):
        """Handle /api/v1/organizations - the endpoint that was spammed in Cloudflare outage"""
        # Simulate some processing time
        time.sleep(0.1)

        # Simulate failures based on configurable failure rate
        if _global_state["failure_simulation_enabled"] and (
            _global_state["request_count"] % int(1 / _global_state["failure_rate"]) == 0
        ):
            _global_state["circuit_breaker_failures"] += 1
            if (
                _global_state["circuit_breaker_failures"]
                >= _global_state["circuit_breaker_threshold"]
            ):
                _global_state["circuit_breaker_reset_time"] = time.time()
                logger.warning(
                    f"⚡ Circuit breaker triggered after {_global_state['circuit_breaker_failures']} failures",
                )
            logger.error(
                f"💥 Simulated failure for request #{_global_state['request_count']} (failure rate: {_global_state['failure_rate']})",
            )
            self.send_error(500, "Internal Server Error - Tenant Service Overloaded")
            return

        # Reset circuit breaker on successful request
        if _global_state["circuit_breaker_failures"] > 0:
            _global_state["circuit_breaker_failures"] = max(
                0,
                _global_state["circuit_breaker_failures"] - 1,
            )

        response_data = {
            "organizations": [
                {
                    "id": "org-123",
                    "name": "Test Organization",
                    "status": "active",
                    "created_at": "2025-01-01T00:00:00Z",
                },
            ],
            "request_count": _global_state["request_count"],
            "timestamp": time.time(),
            "rate_limit_remaining": max(
                0,
                _global_state["rate_limit_requests"]
                - len(_global_state["request_timestamps"]),
            ),
            "circuit_breaker_status": (
                "closed"
                if _global_state["circuit_breaker_failures"]
                < _global_state["circuit_breaker_threshold"]
                else "open"
            ),
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-RateLimit-Limit", str(_global_state["rate_limit_requests"]))
        self.send_header(
            "X-RateLimit-Remaining",
            str(
                max(
                    0,
                    _global_state["rate_limit_requests"]
                    - len(_global_state["request_timestamps"]),
                ),
            ),
        )
        self.send_header(
            "X-RateLimit-Reset",
            str(int(time.time() + _global_state["rate_limit_window"])),
        )
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_user_permissions(self):
        """Handle /api/v1/user-permissions"""
        time.sleep(0.05)

        response_data = {
            "permissions": ["read", "write", "admin"],
            "user_id": "user-456",
            "request_count": self.request_count,
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_tenant_info(self):
        """Handle /api/v1/tenant-info"""
        time.sleep(0.03)

        response_data = {
            "tenant_id": "tenant-789",
            "status": "active",
            "features": ["dashboard", "api", "analytics"],
            "request_count": self.request_count,
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_health(self):
        """Handle /api/v1/health - for health checks"""
        response_data = {
            "status": "healthy",
            "uptime": time.time() - _global_state["start_time"],
            "request_count": _global_state["request_count"],
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_stats(self):
        """Handle /api/v1/stats - for monitoring"""
        response_data = {
            "total_requests": _global_state["request_count"],
            "uptime": time.time() - _global_state["start_time"],
            "requests_per_second": (
                _global_state["request_count"]
                / (time.time() - _global_state["start_time"])
                if time.time() > _global_state["start_time"]
                else 0
            ),
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_reset(self):
        """Handle /api/v1/control/reset - Reset all counters and state"""
        logger.info("🔄 RESET REQUEST: Resetting all server state")

        # Reset all counters and state
        _global_state["request_count"] = 0
        _global_state["start_time"] = time.time()
        _global_state["request_timestamps"] = []
        _global_state["circuit_breaker_failures"] = 0
        _global_state["circuit_breaker_reset_time"] = 0
        _global_state["rapid_request_timestamps"] = []
        _global_state["request_cache"] = {}

        response_data = {
            "status": "reset",
            "message": "All server state has been reset",
            "timestamp": time.time(),
            "reset_counters": {
                "request_count": _global_state["request_count"],
                "circuit_breaker_failures": _global_state["circuit_breaker_failures"],
                "rate_limit_timestamps": len(_global_state["request_timestamps"]),
                "rapid_request_timestamps": len(
                    _global_state["rapid_request_timestamps"],
                ),
                "request_cache_size": len(_global_state["request_cache"]),
            },
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_configure(self):
        """Handle /api/v1/control/configure - Configure server settings"""
        if self.command == "POST":
            # Parse POST data
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                try:
                    config = json.loads(post_data.decode("utf-8"))

                    # Update configuration
                    if "rate_limiting_enabled" in config:
                        _global_state["rate_limiting_enabled"] = config[
                            "rate_limiting_enabled"
                        ]
                        logger.info(
                            f"🔧 Rate limiting {'enabled' if _global_state['rate_limiting_enabled'] else 'disabled'}",
                        )

                    if "circuit_breaker_enabled" in config:
                        _global_state["circuit_breaker_enabled"] = config[
                            "circuit_breaker_enabled"
                        ]
                        logger.info(
                            f"🔧 Circuit breaker {'enabled' if _global_state['circuit_breaker_enabled'] else 'disabled'}",
                        )

                    if "failure_simulation_enabled" in config:
                        _global_state["failure_simulation_enabled"] = config[
                            "failure_simulation_enabled"
                        ]
                        logger.info(
                            f"🔧 Failure simulation {'enabled' if _global_state['failure_simulation_enabled'] else 'disabled'}",
                        )

                    if "failure_rate" in config:
                        _global_state["failure_rate"] = config["failure_rate"]
                        logger.info(
                            f"🔧 Failure rate set to {_global_state['failure_rate']}",
                        )

                    if "rate_limit_requests" in config:
                        _global_state["rate_limit_requests"] = config[
                            "rate_limit_requests"
                        ]
                        logger.info(
                            f"🔧 Rate limit requests set to {_global_state['rate_limit_requests']}",
                        )

                    if "circuit_breaker_threshold" in config:
                        _global_state["circuit_breaker_threshold"] = config[
                            "circuit_breaker_threshold"
                        ]
                        logger.info(
                            f"🔧 Circuit breaker threshold set to {_global_state['circuit_breaker_threshold']}",
                        )

                    if "rapid_request_detection_enabled" in config:
                        _global_state["rapid_request_detection_enabled"] = config[
                            "rapid_request_detection_enabled"
                        ]
                        logger.info(
                            f"🔧 Rapid request detection {'enabled' if _global_state['rapid_request_detection_enabled'] else 'disabled'}",
                        )

                    if "rapid_request_threshold" in config:
                        _global_state["rapid_request_threshold"] = config[
                            "rapid_request_threshold"
                        ]
                        logger.info(
                            f"🔧 Rapid request threshold set to {_global_state['rapid_request_threshold']}",
                        )

                    if "request_pattern_detection_enabled" in config:
                        _global_state["request_pattern_detection_enabled"] = config[
                            "request_pattern_detection_enabled"
                        ]
                        logger.info(
                            f"🔧 Request pattern detection {'enabled' if _global_state['request_pattern_detection_enabled'] else 'disabled'}",
                        )

                    if "identical_request_threshold" in config:
                        _global_state["identical_request_threshold"] = config[
                            "identical_request_threshold"
                        ]
                        logger.info(
                            f"🔧 Identical request threshold set to {_global_state['identical_request_threshold']}",
                        )

                    response_data = {
                        "status": "configured",
                        "message": "Server configuration updated",
                        "timestamp": time.time(),
                        "configuration": {
                            "rate_limiting_enabled": _global_state[
                                "rate_limiting_enabled"
                            ],
                            "circuit_breaker_enabled": _global_state[
                                "circuit_breaker_enabled"
                            ],
                            "failure_simulation_enabled": _global_state[
                                "failure_simulation_enabled"
                            ],
                            "failure_rate": _global_state["failure_rate"],
                            "rate_limit_requests": _global_state["rate_limit_requests"],
                            "circuit_breaker_threshold": _global_state[
                                "circuit_breaker_threshold"
                            ],
                            "rapid_request_detection_enabled": _global_state[
                                "rapid_request_detection_enabled"
                            ],
                            "rapid_request_threshold": _global_state[
                                "rapid_request_threshold"
                            ],
                            "request_pattern_detection_enabled": _global_state[
                                "request_pattern_detection_enabled"
                            ],
                            "identical_request_threshold": _global_state[
                                "identical_request_threshold"
                            ],
                        },
                    }

                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(response_data).encode())
                    return

                except json.JSONDecodeError:
                    self.send_error(400, "Invalid JSON")
                    return

        # GET request - return current configuration
        response_data = {
            "status": "current_config",
            "timestamp": time.time(),
            "configuration": {
                "rate_limiting_enabled": _global_state["rate_limiting_enabled"],
                "circuit_breaker_enabled": _global_state["circuit_breaker_enabled"],
                "failure_simulation_enabled": _global_state[
                    "failure_simulation_enabled"
                ],
                "failure_rate": _global_state["failure_rate"],
                "rate_limit_requests": _global_state["rate_limit_requests"],
                "circuit_breaker_threshold": _global_state["circuit_breaker_threshold"],
                "rate_limit_window": _global_state["rate_limit_window"],
                "circuit_breaker_timeout": _global_state["circuit_breaker_timeout"],
                "rapid_request_detection_enabled": _global_state[
                    "rapid_request_detection_enabled"
                ],
                "rapid_request_threshold": _global_state["rapid_request_threshold"],
                "rapid_request_window": _global_state["rapid_request_window"],
                "request_pattern_detection_enabled": _global_state[
                    "request_pattern_detection_enabled"
                ],
                "identical_request_threshold": _global_state[
                    "identical_request_threshold"
                ],
                "cache_window": _global_state["cache_window"],
            },
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def handle_control_status(self):
        """Handle /api/v1/control/status - Get detailed server status"""
        current_time = time.time()

        # Calculate current rate limit status
        recent_requests = [
            ts
            for ts in _global_state["request_timestamps"]
            if current_time - ts < _global_state["rate_limit_window"]
        ]
        rate_limit_remaining = max(
            0,
            _global_state["rate_limit_requests"] - len(recent_requests),
        )

        # Calculate circuit breaker status
        circuit_breaker_open = (
            _global_state["circuit_breaker_failures"]
            >= _global_state["circuit_breaker_threshold"]
        )
        circuit_breaker_reset_time_remaining = 0
        if circuit_breaker_open:
            circuit_breaker_reset_time_remaining = max(
                0,
                _global_state["circuit_breaker_timeout"]
                - (current_time - _global_state["circuit_breaker_reset_time"]),
            )

        response_data = {
            "status": "detailed_status",
            "timestamp": current_time,
            "uptime": current_time - _global_state["start_time"],
            "counters": {
                "total_requests": _global_state["request_count"],
                "circuit_breaker_failures": _global_state["circuit_breaker_failures"],
                "rate_limit_timestamps": len(_global_state["request_timestamps"]),
                "rapid_request_timestamps": len(
                    _global_state["rapid_request_timestamps"],
                ),
                "request_cache_size": len(_global_state["request_cache"]),
            },
            "rate_limiting": {
                "enabled": _global_state["rate_limiting_enabled"],
                "window_seconds": _global_state["rate_limit_window"],
                "max_requests": _global_state["rate_limit_requests"],
                "current_requests": len(recent_requests),
                "remaining_requests": rate_limit_remaining,
                "status": (
                    "active"
                    if len(recent_requests) < _global_state["rate_limit_requests"]
                    else "exceeded"
                ),
            },
            "circuit_breaker": {
                "enabled": _global_state["circuit_breaker_enabled"],
                "threshold": _global_state["circuit_breaker_threshold"],
                "current_failures": _global_state["circuit_breaker_failures"],
                "timeout_seconds": _global_state["circuit_breaker_timeout"],
                "status": "open" if circuit_breaker_open else "closed",
                "reset_time_remaining": circuit_breaker_reset_time_remaining,
            },
            "failure_simulation": {
                "enabled": _global_state["failure_simulation_enabled"],
                "failure_rate": _global_state["failure_rate"],
            },
            "rapid_request_detection": {
                "enabled": _global_state["rapid_request_detection_enabled"],
                "threshold": _global_state["rapid_request_threshold"],
                "window_seconds": _global_state["rapid_request_window"],
                "current_requests": len(
                    [
                        ts
                        for ts in _global_state["rapid_request_timestamps"]
                        if current_time - ts < _global_state["rapid_request_window"]
                    ],
                ),
                "status": (
                    "active"
                    if len(
                        [
                            ts
                            for ts in _global_state["rapid_request_timestamps"]
                            if current_time - ts < _global_state["rapid_request_window"]
                        ],
                    )
                    < _global_state["rapid_request_threshold"]
                    else "triggered"
                ),
            },
            "request_pattern_detection": {
                "enabled": _global_state["request_pattern_detection_enabled"],
                "identical_request_threshold": _global_state[
                    "identical_request_threshold"
                ],
                "cache_window_seconds": _global_state["cache_window"],
                "current_cache_size": len(_global_state["request_cache"]),
            },
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        logger.info(f"🌐 POST REQUEST: {path} from {self.client_address[0]}")

        if path == "/api/v1/control/configure":
            self.handle_configure()
        else:
            self.send_error(404, "Not Found")


class MockAPIServer:
    def __init__(self, port=12526):
        self.port = port
        self.server = None
        self.thread = None

    def start(self):
        """Start the mock API server"""
        try:
            self.server = HTTPServer(("localhost", self.port), MockAPIHandler)
            self.thread = threading.Thread(target=self.server.serve_forever)
            self.thread.daemon = True
            self.thread.start()
            logger.info(f"🦊 Mock API Server started on port {self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to start mock API server: {e}")
            return False

    def stop(self):
        """Stop the mock API server"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            logger.info("🦊 Mock API Server stopped")

    def get_stats(self):
        """Get server statistics"""
        try:
            import requests

            response = requests.get(
                f"http://localhost:{self.port}/api/v1/stats",
                timeout=1,
            )
            return response.json()
        except:
            return {"error": "Server not responding"}


if __name__ == "__main__":
    import sys

    port = 12526
    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    server = MockAPIServer(port)

    try:
        if server.start():
            logger.info("🦊 Mock API Server running. Press Ctrl+C to stop.")
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        logger.info("🦊 Shutting down...")
        server.stop()
