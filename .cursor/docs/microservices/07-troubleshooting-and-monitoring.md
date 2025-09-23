# Microservices Troubleshooting & Monitoring

> **Operational Excellence for Distributed Systems** 🦊

## Overview

This document provides comprehensive guidance for troubleshooting and monitoring microservices architectures. It covers common issues, debugging strategies, monitoring best practices, and operational procedures to ensure reliable service operation.

## Common Issues and Solutions

### 1. Service Communication Issues

#### Network Connectivity Problems

**Symptoms**:

- Service timeouts
- Connection refused errors
- Intermittent failures

**Diagnosis**:

```bash
# Check network connectivity
ping service-name
telnet service-name 8080
nslookup service-name

# Check DNS resolution
dig service-name
nslookup service-name

# Check firewall rules
iptables -L
ufw status
```

**Solutions**:

```yaml
# Kubernetes service configuration
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
```

#### Service Discovery Issues

**Symptoms**:

- Services can't find each other
- Load balancing failures
- Inconsistent service availability

**Diagnosis**:

```bash
# Check service registry
consul members
consul catalog services

# Check service health
curl http://consul:8500/v1/health/service/user-service

# Check DNS resolution
dig user-service.service.consul
```

**Solutions**:

```python
# Service discovery configuration
class ServiceDiscovery:
    def __init__(self, consul_host: str):
        self.consul = consul.Consul(host=consul_host)

    def register_service(self, service_name: str, port: int):
        self.consul.agent.service.register(
            name=service_name,
            service_id=f"{service_name}-{socket.gethostname()}",
            address=socket.gethostname(),
            port=port,
            check=consul.Check.http(f"http://{socket.gethostname()}:{port}/health")
        )

    def discover_service(self, service_name: str) -> List[str]:
        services = self.consul.health.service(service_name, passing=True)[1]
        return [f"{service['Service']['Address']}:{service['Service']['Port']}"
                for service in services]
```

### 2. Data Consistency Issues

#### Eventual Consistency Problems

**Symptoms**:

- Data inconsistencies between services
- Stale data in caches
- Inconsistent user experiences

**Diagnosis**:

```python
# Check data consistency
class DataConsistencyChecker:
    def check_user_order_consistency(self, user_id: int):
        user = self.user_service.get_user(user_id)
        orders = self.order_service.get_user_orders(user_id)

        inconsistencies = []
        for order in orders:
            if order.user_id != user.id:
                inconsistencies.append({
                    "order_id": order.id,
                    "expected_user_id": user.id,
                    "actual_user_id": order.user_id
                })

        return inconsistencies
```

**Solutions**:

```python
# Eventual consistency with compensation
class OrderService:
    def create_order(self, user_id: int, items: List[Item]):
        # Create order
        order = self.order_repository.create(user_id, items)

        # Publish event
        self.event_publisher.publish(OrderCreatedEvent(
            order_id=order.id,
            user_id=user_id,
            items=items
        ))

        # Schedule consistency check
        self.scheduler.schedule(
            self.check_order_consistency,
            order.id,
            delay=timedelta(minutes=5)
        )

        return order

    def check_order_consistency(self, order_id: int):
        order = self.order_repository.find_by_id(order_id)
        user = self.user_service.get_user(order.user_id)

        if not user:
            # Compensate for missing user
            self.order_repository.delete(order_id)
            self.event_publisher.publish(OrderCancelledEvent(order_id))
```

#### Database Connection Issues

**Symptoms**:

- Connection pool exhaustion
- Database timeouts
- Connection refused errors

**Diagnosis**:

```python
# Database connection monitoring
class DatabaseMonitor:
    def check_connection_health(self):
        metrics = {
            "active_connections": self.pool.get_size(),
            "idle_connections": self.pool.get_idle_size(),
            "max_connections": self.pool.get_max_size(),
            "connection_errors": self.pool.get_connection_errors()
        }

        if metrics["active_connections"] > metrics["max_connections"] * 0.9:
            logger.warning("Connection pool near capacity", **metrics)

        return metrics
```

**Solutions**:

```python
# Optimized connection pooling
class DatabaseService:
    def __init__(self):
        self.pool = asyncpg.create_pool(
            host="localhost",
            port=5432,
            database="users",
            user="user",
            password="password",
            min_size=10,
            max_size=50,
            max_queries=50000,
            max_inactive_connection_lifetime=300.0,
            command_timeout=30.0,
            server_settings={
                'application_name': 'user-service',
                'tcp_keepalives_idle': '600',
                'tcp_keepalives_interval': '30',
                'tcp_keepalives_count': '3'
            }
        )

    async def execute_with_retry(self, query: str, *args, max_retries=3):
        for attempt in range(max_retries):
            try:
                async with self.pool.acquire() as connection:
                    return await connection.fetch(query, *args)
            except asyncpg.exceptions.ConnectionDoesNotExistError:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
```

### 3. Performance Issues

#### High Latency

**Symptoms**:

- Slow response times
- Timeout errors
- Poor user experience

**Diagnosis**:

```python
# Performance monitoring
class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            "response_times": [],
            "error_rates": [],
            "throughput": []
        }

    def record_request(self, duration: float, success: bool):
        self.metrics["response_times"].append(duration)
        self.metrics["error_rates"].append(0 if success else 1)

        # Calculate percentiles
        p50 = np.percentile(self.metrics["response_times"], 50)
        p95 = np.percentile(self.metrics["response_times"], 95)
        p99 = np.percentile(self.metrics["response_times"], 99)

        logger.info("Performance metrics",
                   p50=p50, p95=p95, p99=p99,
                   error_rate=np.mean(self.metrics["error_rates"]))
```

**Solutions**:

```python
# Caching implementation
class CachedUserService:
    def __init__(self, redis_client, user_repository):
        self.redis = redis_client
        self.user_repository = user_repository
        self.cache_ttl = 3600

    async def get_user(self, user_id: int) -> User:
        cache_key = f"user:{user_id}"

        # Try cache first
        cached_user = await self.redis.get(cache_key)
        if cached_user:
            return User.parse_raw(cached_user)

        # Fetch from database
        user = await self.user_repository.find_by_id(user_id)
        if user:
            # Cache with TTL
            await self.redis.setex(
                cache_key,
                self.cache_ttl,
                user.json()
            )

        return user
```

#### Memory Leaks

**Symptoms**:

- Increasing memory usage
- Out of memory errors
- Service crashes

**Diagnosis**:

```python
# Memory monitoring
import psutil
import gc

class MemoryMonitor:
    def __init__(self):
        self.process = psutil.Process()
        self.memory_threshold = 0.8  # 80% of available memory

    def check_memory_usage(self):
        memory_info = self.process.memory_info()
        memory_percent = self.process.memory_percent()

        if memory_percent > self.memory_threshold * 100:
            logger.warning("High memory usage detected",
                          memory_percent=memory_percent,
                          memory_mb=memory_info.rss / 1024 / 1024)

            # Force garbage collection
            gc.collect()

            # Log memory after GC
            memory_info_after = self.process.memory_info()
            logger.info("Memory after GC",
                       memory_mb=memory_info_after.rss / 1024 / 1024)
```

**Solutions**:

```python
# Memory-efficient data processing
class EfficientDataProcessor:
    def process_large_dataset(self, data: List[dict]):
        # Process in chunks to avoid memory issues
        chunk_size = 1000
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            yield self.process_chunk(chunk)

    def process_chunk(self, chunk: List[dict]):
        # Process chunk and return results
        results = []
        for item in chunk:
            result = self.process_item(item)
            results.append(result)

        # Clear chunk from memory
        del chunk
        return results
```

## Monitoring Strategies

### 1. Health Checks

#### Comprehensive Health Monitoring

```python
# Health check implementation
class HealthChecker:
    def __init__(self):
        self.checks = {
            "database": self.check_database,
            "cache": self.check_cache,
            "external_apis": self.check_external_apis,
            "disk_space": self.check_disk_space,
            "memory": self.check_memory
        }

    async def check_health(self) -> dict:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }

        for check_name, check_func in self.checks.items():
            try:
                result = await check_func()
                health_status["checks"][check_name] = {
                    "status": "healthy" if result else "unhealthy",
                    "details": result
                }
            except Exception as e:
                health_status["checks"][check_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "unhealthy"

        return health_status

    async def check_database(self) -> bool:
        try:
            async with self.db_pool.acquire() as connection:
                await connection.fetchval("SELECT 1")
            return True
        except Exception:
            return False

    async def check_cache(self) -> bool:
        try:
            await self.redis.ping()
            return True
        except Exception:
            return False
```

#### Kubernetes Health Checks

```yaml
# Kubernetes health check configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  template:
    spec:
      containers:
        - name: user-service
          image: user-service:1.0.0
          ports:
            - containerPort: 8000
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /startup
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 30
```

### 2. Metrics Collection

#### Prometheus Metrics

```python
# Prometheus metrics implementation
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests',
                       ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds',
                            'HTTP request duration',
                            ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')
DATABASE_CONNECTIONS = Gauge('database_connections', 'Database connections',
                            ['state'])

class MetricsCollector:
    def __init__(self):
        start_http_server(8000)  # Start metrics server

    def record_request(self, method: str, endpoint: str,
                      duration: float, status_code: int):
        REQUEST_COUNT.labels(
            method=method,
            endpoint=endpoint,
            status=status_code
        ).inc()

        REQUEST_DURATION.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)

    def update_connections(self, active: int, idle: int):
        ACTIVE_CONNECTIONS.set(active)
        DATABASE_CONNECTIONS.labels(state='active').set(active)
        DATABASE_CONNECTIONS.labels(state='idle').set(idle)
```

#### Custom Business Metrics

```python
# Business metrics
class BusinessMetrics:
    def __init__(self):
        self.user_registrations = Counter('user_registrations_total',
                                         'Total user registrations')
        self.order_created = Counter('orders_created_total',
                                   'Total orders created')
        self.payment_processed = Counter('payments_processed_total',
                                       'Total payments processed',
                                       ['status'])
        self.revenue = Counter('revenue_total', 'Total revenue',
                             ['currency'])

    def record_user_registration(self, user_id: int):
        self.user_registrations.inc()
        logger.info("User registered", user_id=user_id)

    def record_order_created(self, order_id: int, amount: float):
        self.order_created.inc()
        logger.info("Order created", order_id=order_id, amount=amount)

    def record_payment_processed(self, payment_id: int, status: str, amount: float):
        self.payment_processed.labels(status=status).inc()
        if status == 'success':
            self.revenue.labels(currency='USD').inc(amount)
        logger.info("Payment processed",
                   payment_id=payment_id, status=status, amount=amount)
```

### 3. Logging and Tracing

#### Structured Logging

```python
# Structured logging implementation
import structlog
import logging

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class UserService:
    def create_user(self, user_data: dict):
        logger.info("Creating user",
                   user_email=user_data["email"],
                   request_id=self.get_request_id())

        try:
            user = self.user_repository.create(user_data)
            logger.info("User created successfully",
                       user_id=user.id,
                       user_email=user.email)
            return user
        except Exception as e:
            logger.error("Failed to create user",
                        user_email=user_data["email"],
                        error=str(e),
                        exc_info=True)
            raise
```

#### Distributed Tracing

```python
# Distributed tracing implementation
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Instrument HTTP clients
RequestsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()

class UserService:
    def get_user(self, user_id: int):
        with tracer.start_as_current_span("get_user") as span:
            span.set_attribute("user.id", user_id)

            try:
                user = self.user_repository.find_by_id(user_id)
                span.set_attribute("user.found", True)
                span.set_attribute("user.email", user.email)
                return user
            except Exception as e:
                span.set_attribute("error", True)
                span.set_attribute("error.message", str(e))
                raise
```

## Alerting and Incident Response

### 1. Alert Configuration

#### Prometheus Alerting Rules

```yaml
# prometheus-alerts.yml
groups:
  - name: microservices
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }} seconds"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"

      - alert: HighMemoryUsage
        expr: (process_resident_memory_bytes / 1024 / 1024) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }} MB"
```

#### AlertManager Configuration

```yaml
# alertmanager.yml
global:
  smtp_smarthost: "localhost:587"
  smtp_from: "alerts@example.com"

route:
  group_by: ["alertname"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: "web.hook"

receivers:
  - name: "web.hook"
    webhook_configs:
      - url: "http://localhost:5001/"
        send_resolved: true

  - name: "email"
    email_configs:
      - to: "admin@example.com"
        subject: "Alert: {{ .GroupLabels.alertname }}"
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
```

### 2. Incident Response Procedures

#### Incident Classification

```python
# Incident classification
class IncidentClassifier:
    SEVERITY_LEVELS = {
        "P1": {
            "description": "Critical - Service completely down",
            "response_time": "15 minutes",
            "escalation": "immediate"
        },
        "P2": {
            "description": "High - Service degraded, major functionality affected",
            "response_time": "1 hour",
            "escalation": "within 2 hours"
        },
        "P3": {
            "description": "Medium - Minor functionality affected",
            "response_time": "4 hours",
            "escalation": "within 24 hours"
        },
        "P4": {
            "description": "Low - Cosmetic issues, workarounds available",
            "response_time": "24 hours",
            "escalation": "within 48 hours"
        }
    }

    def classify_incident(self, error_rate: float, latency: float,
                         affected_users: int) -> str:
        if error_rate > 0.5 or affected_users > 10000:
            return "P1"
        elif error_rate > 0.1 or latency > 5.0 or affected_users > 1000:
            return "P2"
        elif error_rate > 0.05 or latency > 2.0 or affected_users > 100:
            return "P3"
        else:
            return "P4"
```

#### Incident Response Playbook

```python
# Incident response playbook
class IncidentResponse:
    def __init__(self):
        self.playbooks = {
            "database_connection_failure": self.handle_database_failure,
            "high_memory_usage": self.handle_memory_issue,
            "service_timeout": self.handle_timeout_issue,
            "external_api_failure": self.handle_external_api_failure
        }

    def handle_incident(self, incident_type: str, severity: str, details: dict):
        logger.info("Incident detected",
                   incident_type=incident_type,
                   severity=severity,
                   details=details)

        # Execute playbook
        if incident_type in self.playbooks:
            self.playbooks[incident_type](severity, details)
        else:
            self.handle_unknown_incident(severity, details)

    def handle_database_failure(self, severity: str, details: dict):
        if severity == "P1":
            # Immediate actions
            self.enable_read_only_mode()
            self.notify_on_call_engineer()
            self.create_incident_ticket()
        elif severity == "P2":
            # Standard actions
            self.check_connection_pool()
            self.restart_database_connections()
            self.monitor_recovery()

    def handle_memory_issue(self, severity: str, details: dict):
        if severity in ["P1", "P2"]:
            # Restart service to free memory
            self.restart_service()
            self.increase_memory_limits()
            self.investigate_memory_leak()
```

## Debugging Techniques

### 1. Log Analysis

#### Log Aggregation and Search

```bash
# ELK Stack log analysis
# Search for errors
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        {"match": {"level": "ERROR"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  }
}'

# Search for specific user
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        {"match": {"user_id": "123"}},
        {"range": {"@timestamp": {"gte": "now-24h"}}}
      ]
    }
  }
}'
```

#### Log Correlation

```python
# Log correlation analysis
class LogCorrelator:
    def correlate_logs(self, correlation_id: str) -> List[dict]:
        # Search for all logs with the same correlation ID
        query = {
            "query": {
                "term": {"correlation_id": correlation_id}
            },
            "sort": [{"@timestamp": {"order": "asc"}}]
        }

        response = self.elasticsearch.search(
            index="logs",
            body=query
        )

        return [hit["_source"] for hit in response["hits"]["hits"]]

    def analyze_request_flow(self, correlation_id: str):
        logs = self.correlate_logs(correlation_id)

        # Group logs by service
        service_logs = {}
        for log in logs:
            service = log.get("service", "unknown")
            if service not in service_logs:
                service_logs[service] = []
            service_logs[service].append(log)

        # Analyze the flow
        flow_analysis = {
            "correlation_id": correlation_id,
            "services_involved": list(service_logs.keys()),
            "total_duration": self.calculate_total_duration(logs),
            "errors": [log for log in logs if log.get("level") == "ERROR"]
        }

        return flow_analysis
```

### 2. Performance Profiling

#### Application Profiling

```python
# Performance profiling
import cProfile
import pstats
from functools import wraps

def profile_function(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()

        try:
            result = func(*args, **kwargs)
            return result
        finally:
            profiler.disable()

            # Save profile data
            stats = pstats.Stats(profiler)
            stats.dump_stats(f"profile_{func.__name__}.prof")

            # Log top functions
            stats.sort_stats('cumulative')
            stats.print_stats(10)

    return wrapper

# Usage
@profile_function
def create_user(self, user_data: dict):
    # Function implementation
    pass
```

#### Database Query Profiling

```python
# Database query profiling
class QueryProfiler:
    def __init__(self, connection):
        self.connection = connection
        self.query_stats = {}

    async def execute_with_profiling(self, query: str, *args):
        start_time = time.time()

        try:
            result = await self.connection.fetch(query, *args)
            execution_time = time.time() - start_time

            # Record query statistics
            self.record_query_stats(query, execution_time, len(result))

            return result
        except Exception as e:
            execution_time = time.time() - start_time
            self.record_query_stats(query, execution_time, 0, error=str(e))
            raise

    def record_query_stats(self, query: str, execution_time: float,
                          result_count: int, error: str = None):
        query_hash = hashlib.md5(query.encode()).hexdigest()

        if query_hash not in self.query_stats:
            self.query_stats[query_hash] = {
                "query": query,
                "count": 0,
                "total_time": 0,
                "min_time": float('inf'),
                "max_time": 0,
                "errors": 0
            }

        stats = self.query_stats[query_hash]
        stats["count"] += 1
        stats["total_time"] += execution_time
        stats["min_time"] = min(stats["min_time"], execution_time)
        stats["max_time"] = max(stats["max_time"], execution_time)

        if error:
            stats["errors"] += 1

        # Log slow queries
        if execution_time > 1.0:  # 1 second threshold
            logger.warning("Slow query detected",
                          query=query,
                          execution_time=execution_time,
                          result_count=result_count)
```

### 3. Distributed Debugging

#### Request Tracing

```python
# Distributed request tracing
class RequestTracer:
    def __init__(self):
        self.tracer = trace.get_tracer(__name__)

    def trace_request(self, request_id: str, service_name: str):
        span = self.tracer.start_span(f"{service_name}_request")
        span.set_attribute("request_id", request_id)
        span.set_attribute("service", service_name)
        return span

    def trace_service_call(self, span, target_service: str, operation: str):
        child_span = self.tracer.start_span(f"{target_service}_{operation}")
        child_span.set_attribute("target_service", target_service)
        child_span.set_attribute("operation", operation)
        return child_span

# Usage in service
class UserService:
    def __init__(self):
        self.tracer = RequestTracer()

    def get_user(self, user_id: int, request_id: str):
        with self.tracer.trace_request(request_id, "user-service") as span:
            span.set_attribute("user_id", user_id)

            # Call other services
            with self.tracer.trace_service_call(span, "order-service", "get_orders"):
                orders = self.order_service.get_user_orders(user_id)

            return self.user_repository.find_by_id(user_id)
```

## Operational Procedures

### 1. Deployment Procedures

#### Blue-Green Deployment

```bash
#!/bin/bash
# Blue-green deployment script

set -e

SERVICE_NAME="user-service"
BLUE_VERSION="v1.0.0"
GREEN_VERSION="v1.1.0"
NAMESPACE="production"

echo "Starting blue-green deployment for $SERVICE_NAME"

# Deploy green version
echo "Deploying green version $GREEN_VERSION"
kubectl apply -f k8s/green-deployment.yaml

# Wait for green deployment to be ready
echo "Waiting for green deployment to be ready"
kubectl rollout status deployment/$SERVICE_NAME-green -n $NAMESPACE

# Run health checks on green version
echo "Running health checks on green version"
kubectl port-forward service/$SERVICE_NAME-green 8080:80 -n $NAMESPACE &
PORT_FORWARD_PID=$!

sleep 5

# Health check
if curl -f http://localhost:8080/health; then
    echo "Green version health check passed"

    # Switch traffic to green
    echo "Switching traffic to green version"
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{"spec":{"selector":{"version":"green"}}}'

    # Wait for traffic to stabilize
    sleep 30

    # Verify green version is handling traffic
    if curl -f http://localhost:8080/health; then
        echo "Green version is handling traffic successfully"

        # Clean up blue version
        echo "Cleaning up blue version"
        kubectl delete deployment $SERVICE_NAME-blue -n $NAMESPACE

        echo "Blue-green deployment completed successfully"
    else
        echo "Green version failed to handle traffic, rolling back"
        kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{"spec":{"selector":{"version":"blue"}}}'
        exit 1
    fi
else
    echo "Green version health check failed, aborting deployment"
    kubectl delete deployment $SERVICE_NAME-green -n $NAMESPACE
    exit 1
fi

# Clean up port forward
kill $PORT_FORWARD_PID
```

#### Canary Deployment

```bash
#!/bin/bash
# Canary deployment script

set -e

SERVICE_NAME="user-service"
CANARY_VERSION="v1.1.0"
NAMESPACE="production"
CANARY_PERCENTAGE=10

echo "Starting canary deployment for $SERVICE_NAME"

# Deploy canary version
echo "Deploying canary version $CANARY_VERSION"
kubectl apply -f k8s/canary-deployment.yaml

# Wait for canary deployment to be ready
echo "Waiting for canary deployment to be ready"
kubectl rollout status deployment/$SERVICE_NAME-canary -n $NAMESPACE

# Configure canary traffic
echo "Configuring canary traffic ($CANARY_PERCENTAGE%)"
kubectl apply -f k8s/canary-traffic-split.yaml

# Monitor canary performance
echo "Monitoring canary performance for 10 minutes"
sleep 600

# Check canary metrics
CANARY_ERROR_RATE=$(kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/$NAMESPACE/pods | jq '.items[] | select(.metadata.labels.version=="canary") | .containers[0].usage.cpu')

if [ "$CANARY_ERROR_RATE" -lt "5" ]; then
    echo "Canary performance is good, promoting to full deployment"

    # Promote canary to full deployment
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{"spec":{"selector":{"version":"canary"}}}'

    # Clean up old version
    kubectl delete deployment $SERVICE_NAME-stable -n $NAMESPACE

    echo "Canary deployment completed successfully"
else
    echo "Canary performance is poor, rolling back"
    kubectl delete deployment $SERVICE_NAME-canary -n $NAMESPACE
    kubectl apply -f k8s/stable-traffic-split.yaml

    echo "Canary deployment rolled back"
    exit 1
fi
```

### 2. Rollback Procedures

#### Automated Rollback

```python
# Automated rollback implementation
class RollbackManager:
    def __init__(self, kubernetes_client):
        self.k8s = kubernetes_client
        self.rollback_thresholds = {
            "error_rate": 0.05,  # 5% error rate
            "latency": 2.0,      # 2 seconds
            "memory_usage": 0.8  # 80% memory usage
        }

    def check_rollback_conditions(self, service_name: str) -> bool:
        metrics = self.get_service_metrics(service_name)

        if (metrics["error_rate"] > self.rollback_thresholds["error_rate"] or
            metrics["latency"] > self.rollback_thresholds["latency"] or
            metrics["memory_usage"] > self.rollback_thresholds["memory_usage"]):
            return True

        return False

    def execute_rollback(self, service_name: str, namespace: str):
        logger.info("Executing rollback", service=service_name, namespace=namespace)

        # Get current deployment
        deployment = self.k8s.apps_v1.read_namespaced_deployment(
            name=service_name,
            namespace=namespace
        )

        # Rollback to previous version
        self.k8s.apps_v1.patch_namespaced_deployment_rollback(
            name=service_name,
            namespace=namespace,
            body={
                "spec": {
                    "rollbackTo": {
                        "revision": deployment.metadata.annotations.get("deployment.kubernetes.io/revision", "0")
                    }
                }
            }
        )

        # Wait for rollback to complete
        self.k8s.apps_v1.read_namespaced_deployment_status(
            name=service_name,
            namespace=namespace
        )

        logger.info("Rollback completed", service=service_name, namespace=namespace)
```

### 3. Disaster Recovery

#### Backup and Recovery

```bash
#!/bin/bash
# Database backup script

set -e

DATABASE_NAME="reynard"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DATABASE_NAME}_backup_$DATE.sql"

echo "Starting database backup for $DATABASE_NAME"

# Create backup
pg_dump -h localhost -U postgres -d $DATABASE_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "${BACKUP_FILE}.gz" s3://reynard-backups/database/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"
```

#### Service Recovery

```python
# Service recovery implementation
class ServiceRecovery:
    def __init__(self, kubernetes_client, consul_client):
        self.k8s = kubernetes_client
        self.consul = consul_client

    def recover_service(self, service_name: str, namespace: str):
        logger.info("Starting service recovery", service=service_name, namespace=namespace)

        # Check service status
        service_status = self.check_service_status(service_name, namespace)

        if service_status == "down":
            # Restart service
            self.restart_service(service_name, namespace)

            # Wait for service to be ready
            self.wait_for_service_ready(service_name, namespace)

            # Re-register service in Consul
            self.reregister_service(service_name, namespace)

            logger.info("Service recovery completed", service=service_name, namespace=namespace)
        else:
            logger.info("Service is already running", service=service_name, namespace=namespace)

    def restart_service(self, service_name: str, namespace: str):
        # Delete and recreate deployment
        self.k8s.apps_v1.delete_namespaced_deployment(
            name=service_name,
            namespace=namespace
        )

        # Wait for deletion to complete
        time.sleep(10)

        # Recreate deployment
        with open(f"k8s/{service_name}-deployment.yaml") as f:
            deployment = yaml.safe_load(f)

        self.k8s.apps_v1.create_namespaced_deployment(
            namespace=namespace,
            body=deployment
        )

    def wait_for_service_ready(self, service_name: str, namespace: str, timeout: int = 300):
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                deployment = self.k8s.apps_v1.read_namespaced_deployment_status(
                    name=service_name,
                    namespace=namespace
                )

                if deployment.status.ready_replicas == deployment.spec.replicas:
                    return True

                time.sleep(10)
            except Exception as e:
                logger.warning("Error checking service status", error=str(e))
                time.sleep(10)

        raise TimeoutError(f"Service {service_name} did not become ready within {timeout} seconds")
```

## Conclusion

Effective troubleshooting and monitoring of microservices requires:

1. **Comprehensive Monitoring** - Health checks, metrics, and logging
2. **Proactive Alerting** - Early detection of issues
3. **Systematic Debugging** - Structured approach to problem solving
4. **Automated Recovery** - Self-healing capabilities
5. **Documented Procedures** - Clear incident response playbooks

The key to successful microservices operations is to expect failures and design systems that can handle them gracefully. By implementing robust monitoring, alerting, and recovery mechanisms, you can ensure that your microservices architecture remains reliable and performant even in the face of inevitable failures.

---

**Related Documentation:**

- [Best Practices & Patterns](./06-best-practices-and-patterns.md) - Implementation best practices
- [Implementation Guide](./03-implementation-guide.md) - How to implement monitoring
- [Architecture Patterns](./02-architecture-patterns.md) - Design patterns for reliability
- [Reynard Microservices Analysis](./04-reynard-microservices-analysis.md) - Real-world examples
