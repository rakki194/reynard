# Microservices Best Practices & Patterns

> **Industry-Proven Strategies for Distributed Systems Excellence** 🦊

## Overview

This document compiles industry best practices and proven patterns for building successful microservices architectures. These practices are derived from real-world experience and help avoid common pitfalls while maximizing the benefits of distributed systems.

## Service Design Best Practices

### 1. Service Boundaries

#### Domain-Driven Design (DDD) Approach

```
┌─────────────────────────────────────────────────────────────┐
│                Service Boundary Design                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   User      │  │   Order     │  │   Payment           │  │
│  │  Domain     │  │  Domain     │  │   Domain            │  │
│  │             │  │             │  │                     │  │
│  │ - Identity  │  │ - Order     │  │ - Payment           │  │
│  │ - Profile   │  │   Creation  │  │   Processing        │  │
│  │ - Auth      │  │ - Status    │  │ - Billing           │  │
│  │ - Preferences│  │ - History   │  │ - Refunds           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Best Practices**:

- **Identify Bounded Contexts** - Use DDD to find natural service boundaries
- **Single Responsibility** - Each service should have one clear purpose
- **Data Ownership** - Each service owns its data completely
- **Team Ownership** - Align services with team boundaries
- **Business Capabilities** - Group related business functions

#### Anti-Patterns to Avoid

- **God Service** - Services that handle too many responsibilities
- **Anemic Services** - Services with no business logic
- **Chatty Services** - Services that require many small calls
- **Shared Database** - Multiple services accessing the same database

### 2. API Design

#### RESTful API Best Practices

**Resource-Based URLs**

```http
# Good - Resource-based
GET    /api/v1/users/123
POST   /api/v1/users
PUT    /api/v1/users/123
DELETE /api/v1/users/123

# Bad - Action-based
GET    /api/v1/getUser?id=123
POST   /api/v1/createUser
PUT    /api/v1/updateUser
DELETE /api/v1/deleteUser
```

**HTTP Status Codes**

```http
200 OK           - Successful GET, PUT, PATCH
201 Created      - Successful POST
204 No Content   - Successful DELETE
400 Bad Request  - Client error (validation, malformed request)
401 Unauthorized - Authentication required
403 Forbidden    - Authorization failed
404 Not Found    - Resource not found
409 Conflict     - Resource conflict (duplicate, constraint violation)
422 Unprocessable Entity - Validation error
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
502 Bad Gateway  - Upstream service error
503 Service Unavailable - Service temporarily unavailable
504 Gateway Timeout - Upstream service timeout
```

**API Versioning Strategies**

```http
# URL Versioning (Recommended)
GET /api/v1/users/123
GET /api/v2/users/123

# Header Versioning
GET /api/users/123
Accept: application/vnd.api+json;version=1

# Query Parameter Versioning
GET /api/users/123?version=1
```

#### gRPC API Best Practices

**Protocol Buffer Design**

```protobuf
syntax = "proto3";

package user.v1;

// Service definition
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}

// Request/Response messages
message GetUserRequest {
  int32 user_id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  optional string phone = 3;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  optional string phone = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp updated_at = 6;
}

// List operations
message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  string next_page_token = 2;
}
```

### 3. Data Management

#### Database per Service Pattern

**Data Ownership Principles**

```
┌─────────────────────────────────────────────────────────────┐
│                Data Ownership Model                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ User        │  │ Order       │  │ Payment             │  │
│  │ Service     │  │ Service     │  │ Service             │  │
│  │             │  │             │  │                     │  │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────────────┐ │  │
│  │ │Users DB │ │  │ │Orders DB│ │  │ │ Payments DB     │ │  │
│  │ │         │ │  │ │         │ │  │ │                 │ │  │
│  │ │- id     │ │  │ │- id     │ │  │ │- id             │ │  │
│  │ │- name   │ │  │ │- user_id│ │  │ │- order_id       │ │  │
│  │ │- email  │ │  │ │- items  │ │  │ │- amount         │ │  │
│  │ │- profile│ │  │ │- status │ │  │ │- status         │ │  │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────────────┘ │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Best Practices**:

- **Own Your Data** - Each service owns its data completely
- **No Shared Databases** - Avoid shared databases between services
- **Schema Evolution** - Design for independent schema changes
- **Data Consistency** - Use eventual consistency patterns
- **Backup Strategy** - Independent backup and recovery

#### Data Consistency Patterns

**Eventual Consistency**

```python
# Eventual consistency example
class OrderService:
    def create_order(self, user_id: int, items: List[Item]):
        # Create order in local database
        order = self.order_repository.create(user_id, items)

        # Publish event for eventual consistency
        self.event_publisher.publish(OrderCreatedEvent(
            order_id=order.id,
            user_id=user_id,
            items=items,
            timestamp=datetime.utcnow()
        ))

        return order

class InventoryService:
    @event_listener(OrderCreatedEvent)
    def handle_order_created(self, event: OrderCreatedEvent):
        # Update inventory asynchronously
        for item in event.items:
            self.inventory_repository.decrease_stock(
                item.product_id,
                item.quantity
            )
```

**Saga Pattern**

```python
# Saga pattern implementation
class OrderSaga:
    def __init__(self):
        self.steps = [
            self.reserve_inventory,
            self.process_payment,
            self.ship_order,
            self.send_notification
        ]
        self.compensation_steps = [
            self.release_inventory,
            self.refund_payment,
            self.cancel_shipment,
            self.send_cancellation_notification
        ]

    async def execute(self, order_data: dict):
        completed_steps = []

        try:
            for step in self.steps:
                await step(order_data)
                completed_steps.append(step)
        except Exception as e:
            # Compensate for completed steps
            for step in reversed(completed_steps):
                await self.compensation_steps[self.steps.index(step)](order_data)
            raise e
```

## Communication Patterns

### 1. Synchronous Communication

#### HTTP/REST Best Practices

**Client Configuration**

```python
# HTTP client configuration
class APIClient:
    def __init__(self, base_url: str):
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
            headers={"User-Agent": "user-service/1.0.0"}
        )

    async def get_user(self, user_id: int) -> User:
        response = await self.client.get(f"/api/v1/users/{user_id}")
        response.raise_for_status()
        return User.parse_obj(response.json())
```

**Circuit Breaker Pattern**

```python
# Circuit breaker implementation
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    async def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
            else:
                raise CircuitBreakerOpenException()

        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"

            raise e
```

#### gRPC Best Practices

**Client Configuration**

```python
# gRPC client configuration
class UserServiceClient:
    def __init__(self, server_address: str):
        self.channel = grpc.aio.insecure_channel(
            server_address,
            options=[
                ('grpc.keepalive_time_ms', 30000),
                ('grpc.keepalive_timeout_ms', 5000),
                ('grpc.keepalive_permit_without_calls', True),
                ('grpc.http2.max_pings_without_data', 0),
                ('grpc.http2.min_time_between_pings_ms', 10000),
                ('grpc.http2.min_ping_interval_without_data_ms', 300000)
            ]
        )
        self.stub = user_pb2_grpc.UserServiceStub(self.channel)

    async def get_user(self, user_id: int) -> user_pb2.User:
        request = user_pb2.GetUserRequest(user_id=user_id)
        response = await self.stub.GetUser(request)
        return response
```

### 2. Asynchronous Communication

#### Event-Driven Architecture

**Event Publishing**

```python
# Event publishing
class EventPublisher:
    def __init__(self, message_broker):
        self.broker = message_broker

    async def publish_event(self, event: DomainEvent):
        message = {
            "event_type": event.__class__.__name__,
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "data": event.to_dict()
        }

        await self.broker.publish(
            topic=event.get_topic(),
            message=message
        )
```

**Event Consumption**

```python
# Event consumption
class EventConsumer:
    def __init__(self, message_broker):
        self.broker = message_broker
        self.handlers = {}

    def register_handler(self, event_type: str, handler: callable):
        self.handlers[event_type] = handler

    async def consume_events(self, topic: str):
        async for message in self.broker.consume(topic):
            try:
                event_type = message["event_type"]
                if event_type in self.handlers:
                    await self.handlers[event_type](message["data"])
            except Exception as e:
                logger.error(f"Error processing event: {e}")
                # Implement dead letter queue or retry logic
```

#### Message Queue Patterns

**Publisher-Subscriber**

```python
# Pub/Sub pattern
class PubSubService:
    async def publish(self, topic: str, message: dict):
        await self.redis.publish(topic, json.dumps(message))

    async def subscribe(self, topic: str, handler: callable):
        pubsub = self.redis.pubsub()
        await pubsub.subscribe(topic)

        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await handler(data)
```

**Message Queue with Acknowledgment**

```python
# Message queue with acknowledgment
class MessageQueueService:
    async def publish_message(self, queue: str, message: dict):
        await self.redis.lpush(queue, json.dumps(message))

    async def consume_message(self, queue: str, handler: callable):
        while True:
            message = await self.redis.brpop(queue, timeout=1)
            if message:
                try:
                    data = json.loads(message[1])
                    await handler(data)
                    # Message processed successfully
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    # Implement retry logic or dead letter queue
```

## Security Best Practices

### 1. Authentication and Authorization

#### JWT Implementation

```python
# JWT implementation
class JWTAuthService:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm

    def create_token(self, user_id: int, roles: List[str]) -> str:
        payload = {
            "user_id": user_id,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=24),
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise TokenExpiredException()
        except jwt.InvalidTokenError:
            raise InvalidTokenException()
```

#### OAuth2 Implementation

```python
# OAuth2 implementation
class OAuth2Service:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    async def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "read write",
            "state": state
        }
        return f"https://oauth.provider.com/authorize?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> dict:
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": redirect_uri
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth.provider.com/token",
                data=data
            )
            return response.json()
```

### 2. API Security

#### Rate Limiting

```python
# Rate limiting implementation
class RateLimiter:
    def __init__(self, redis_client, max_requests: int = 100, window: int = 3600):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window = window

    async def is_allowed(self, key: str) -> bool:
        current_time = int(time.time())
        window_start = current_time - self.window

        # Remove old entries
        await self.redis.zremrangebyscore(key, 0, window_start)

        # Count current requests
        current_requests = await self.redis.zcard(key)

        if current_requests < self.max_requests:
            # Add current request
            await self.redis.zadd(key, {str(current_time): current_time})
            await self.redis.expire(key, self.window)
            return True

        return False
```

#### Input Validation

```python
# Input validation
class InputValidator:
    def validate_user_data(self, data: dict) -> dict:
        schema = {
            "name": {"type": "string", "minlength": 1, "maxlength": 100},
            "email": {"type": "string", "format": "email"},
            "age": {"type": "integer", "minimum": 0, "maximum": 150}
        }

        validator = jsonschema.Draft7Validator(schema)
        errors = list(validator.iter_errors(data))

        if errors:
            raise ValidationError(errors)

        return data
```

### 3. Network Security

#### HTTPS Configuration

```python
# HTTPS configuration
class HTTPSConfig:
    def __init__(self):
        self.ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        self.ssl_context.load_cert_chain("cert.pem", "key.pem")
        self.ssl_context.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS")
        self.ssl_context.options |= ssl.OP_NO_SSLv2
        self.ssl_context.options |= ssl.OP_NO_SSLv3
        self.ssl_context.options |= ssl.OP_NO_TLSv1
        self.ssl_context.options |= ssl.OP_NO_TLSv1_1
```

#### Service-to-Service Authentication

```python
# Service-to-service authentication
class ServiceAuth:
    def __init__(self, service_name: str, private_key: str):
        self.service_name = service_name
        self.private_key = private_key

    def create_service_token(self) -> str:
        payload = {
            "service": self.service_name,
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, self.private_key, algorithm="RS256")

    def verify_service_token(self, token: str, public_key: str) -> dict:
        return jwt.decode(token, public_key, algorithms=["RS256"])
```

## Monitoring and Observability

### 1. Logging Best Practices

#### Structured Logging

```python
# Structured logging
import structlog

logger = structlog.get_logger()

class UserService:
    def create_user(self, user_data: dict):
        logger.info(
            "Creating user",
            user_email=user_data["email"],
            request_id=self.get_request_id(),
            service="user-service"
        )

        try:
            user = self.user_repository.create(user_data)
            logger.info(
                "User created successfully",
                user_id=user.id,
                user_email=user.email,
                request_id=self.get_request_id(),
                service="user-service"
            )
            return user
        except Exception as e:
            logger.error(
                "Failed to create user",
                user_email=user_data["email"],
                error=str(e),
                request_id=self.get_request_id(),
                service="user-service"
            )
            raise
```

#### Correlation IDs

```python
# Correlation ID implementation
class CorrelationIDMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))

            # Add correlation ID to context
            structlog.contextvars.clear_contextvars()
            structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

            # Add correlation ID to response headers
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    message["headers"].append([b"x-correlation-id", correlation_id.encode()])
                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)
```

### 2. Metrics Collection

#### Prometheus Metrics

```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')

class MetricsMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = time.time()
            request = Request(scope, receive)

            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    duration = time.time() - start_time
                    status_code = message["status"]

                    REQUEST_COUNT.labels(
                        method=request.method,
                        endpoint=request.url.path,
                        status=status_code
                    ).inc()

                    REQUEST_DURATION.labels(
                        method=request.method,
                        endpoint=request.url.path
                    ).observe(duration)

                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)
```

### 3. Distributed Tracing

#### OpenTelemetry Implementation

```python
# OpenTelemetry implementation
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Use tracing in services
class UserService:
    def get_user(self, user_id: int):
        with tracer.start_as_current_span("get_user") as span:
            span.set_attribute("user.id", user_id)

            try:
                user = self.user_repository.find_by_id(user_id)
                span.set_attribute("user.found", True)
                return user
            except Exception as e:
                span.set_attribute("error", True)
                span.set_attribute("error.message", str(e))
                raise
```

## Testing Strategies

### 1. Unit Testing

#### Service Unit Tests

```python
# Unit test example
import pytest
from unittest.mock import Mock, patch

class TestUserService:
    def setup_method(self):
        self.user_repository = Mock()
        self.event_publisher = Mock()
        self.user_service = UserService(
            user_repository=self.user_repository,
            event_publisher=self.event_publisher
        )

    def test_create_user_success(self):
        # Given
        user_data = {"name": "John Doe", "email": "john@example.com"}
        expected_user = User(id=1, name="John Doe", email="john@example.com")
        self.user_repository.create.return_value = expected_user

        # When
        result = self.user_service.create_user(user_data)

        # Then
        assert result.name == "John Doe"
        assert result.email == "john@example.com"
        self.user_repository.create.assert_called_once_with(user_data)
        self.event_publisher.publish.assert_called_once()

    def test_create_user_duplicate_email(self):
        # Given
        user_data = {"name": "John Doe", "email": "john@example.com"}
        self.user_repository.create.side_effect = DuplicateEmailException()

        # When & Then
        with pytest.raises(DuplicateEmailException):
            self.user_service.create_user(user_data)
```

### 2. Integration Testing

#### Service Integration Tests

```python
# Integration test example
import pytest
from httpx import AsyncClient

class TestUserAPI:
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client

    async def test_create_user(self, client):
        # Given
        user_data = {"name": "John Doe", "email": "john@example.com"}

        # When
        response = await client.post("/api/v1/users", json=user_data)

        # Then
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john@example.com"
        assert "id" in data

    async def test_get_user(self, client):
        # Given
        user_data = {"name": "John Doe", "email": "john@example.com"}
        create_response = await client.post("/api/v1/users", json=user_data)
        user_id = create_response.json()["id"]

        # When
        response = await client.get(f"/api/v1/users/{user_id}")

        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["name"] == "John Doe"
```

### 3. Contract Testing

#### Consumer-Driven Contracts

```python
# Contract test example
from pact import Consumer, Provider

def test_user_service_contract():
    # Given
    pact = Consumer("order-service").has_pact_with(Provider("user-service"))

    expected_user = {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }

    (pact
     .given("user exists")
     .upon_receiving("a request for user")
     .with_request("GET", "/api/v1/users/1")
     .will_respond_with(200, body=expected_user))

    with pact:
        # When
        response = requests.get("http://localhost:1234/api/v1/users/1")

        # Then
        assert response.status_code == 200
        assert response.json() == expected_user
```

## Deployment Best Practices

### 1. Containerization

#### Dockerfile Best Practices

```dockerfile
# Multi-stage build
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Add local packages to PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1.0.0
    spec:
      containers:
        - name: user-service
          image: user-service:1.0.0
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: user-service-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: user-service-secrets
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

### 3. CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
name: Deploy User Service

on:
  push:
    branches: [main]
    paths: ["user-service/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd user-service
          pip install -r requirements.txt
          pip install -r requirements-test.txt

      - name: Run tests
        run: |
          cd user-service
          pytest tests/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./user-service/coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          cd user-service
          docker build -t user-service:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push user-service:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/user-service user-service=user-service:${{ github.sha }}
          kubectl rollout status deployment/user-service
```

## Performance Optimization

### 1. Caching Strategies

#### Redis Caching

```python
# Redis caching implementation
class CachedUserService:
    def __init__(self, redis_client, user_repository):
        self.redis = redis_client
        self.user_repository = user_repository
        self.cache_ttl = 3600  # 1 hour

    async def get_user(self, user_id: int) -> User:
        cache_key = f"user:{user_id}"

        # Try cache first
        cached_user = await self.redis.get(cache_key)
        if cached_user:
            return User.parse_raw(cached_user)

        # Fetch from database
        user = await self.user_repository.find_by_id(user_id)
        if user:
            # Cache the result
            await self.redis.setex(
                cache_key,
                self.cache_ttl,
                user.json()
            )

        return user

    async def invalidate_user_cache(self, user_id: int):
        cache_key = f"user:{user_id}"
        await self.redis.delete(cache_key)
```

### 2. Database Optimization

#### Connection Pooling

```python
# Database connection pooling
class DatabaseService:
    def __init__(self):
        self.pool = asyncpg.create_pool(
            host="localhost",
            port=5432,
            database="users",
            user="user",
            password="password",
            min_size=10,
            max_size=20,
            max_queries=50000,
            max_inactive_connection_lifetime=300.0
        )

    async def execute_query(self, query: str, *args):
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)
```

#### Query Optimization

```python
# Query optimization
class OptimizedUserRepository:
    async def find_users_by_ids(self, user_ids: List[int]) -> List[User]:
        # Use IN clause for batch queries
        query = "SELECT * FROM users WHERE id = ANY($1)"
        rows = await self.connection.fetch(query, user_ids)
        return [User.from_row(row) for row in rows]

    async def find_users_with_pagination(self, page: int, size: int) -> List[User]:
        # Use LIMIT and OFFSET for pagination
        offset = (page - 1) * size
        query = "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2"
        rows = await self.connection.fetch(query, size, offset)
        return [User.from_row(row) for row in rows]
```

## Conclusion

These best practices and patterns provide a solid foundation for building successful microservices architectures. The key is to:

1. **Start Simple** - Begin with basic patterns and evolve as needed
2. **Measure Everything** - Implement comprehensive monitoring and observability
3. **Test Thoroughly** - Use multiple testing strategies
4. **Plan for Failure** - Design for resilience and fault tolerance
5. **Iterate Continuously** - Refine and improve based on real-world experience

Remember that microservices are not a silver bullet. They solve specific problems but introduce new challenges. Choose this architecture only when the benefits outweigh the costs, and always consider the trade-offs between complexity and benefits.

---

**Related Documentation:**

- [Implementation Guide](./03-implementation-guide.md) - Practical implementation steps
- [Architecture Patterns](./02-architecture-patterns.md) - Design patterns and approaches
- [Reynard Microservices Analysis](./04-reynard-microservices-analysis.md) - Real-world examples
- [Troubleshooting & Monitoring](./07-troubleshooting-and-monitoring.md) - Operational guidance
