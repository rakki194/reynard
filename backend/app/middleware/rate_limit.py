#!/usr/bin/env python3
"""Rate Limiting Middleware for DDoS Protection

Advanced rate limiting with IP-based and user-based limits.
"""

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with sliding window."""

    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients: Dict[str, Deque[float]] = defaultdict(lambda: deque())

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old requests
        client_requests = self.clients[client_ip]
        while client_requests and client_requests[0] <= now - self.period:
            client_requests.popleft()

        # Check rate limit
        if len(client_requests) >= self.calls:
            raise HTTPException(
                status_code=429, detail="Rate limit exceeded. Please try again later."
            )

        # Add current request
        client_requests.append(now)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(
            self.calls - len(client_requests)
        )
        response.headers["X-RateLimit-Reset"] = str(int(now + self.period))

        return response
