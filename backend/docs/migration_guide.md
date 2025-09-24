# 🦊 Backend Migration Guide

*Comprehensive guide for migrating to and maintaining the refactored backend architecture*

## Overview

This migration guide provides step-by-step instructions for migrating existing code to the new refactored architecture and maintaining it going forward. It covers both immediate migration tasks and long-term maintenance strategies.

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Service Migration](#service-migration)
4. [Configuration Migration](#configuration-migration)
5. [Health Check Migration](#health-check-migration)
6. [Security Migration](#security-migration)
7. [Testing Migration](#testing-migration)
8. [Deployment Migration](#deployment-migration)
9. [Post-Migration Validation](#post-migration-validation)
10. [Maintenance Guidelines](#maintenance-guidelines)

## Migration Strategy

### Phase 1: Foundation (Week 1)

- Set up core infrastructure components
- Migrate error handling and logging
- Establish configuration management

### Phase 2: Services (Week 2-3)

- Migrate individual services to new patterns
- Implement health checks and monitoring
- Add security middleware

### Phase 3: Integration (Week 4)

- Integrate all components
- Comprehensive testing
- Performance optimization

### Phase 4: Deployment (Week 5)

- Production deployment
- Monitoring and alerting
- Documentation and training

## Pre-Migration Checklist

### Environment Setup

- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Database migrations completed
- [ ] Environment variables configured

### Code Analysis

- [ ] Audit existing code for duplication
- [ ] Identify services to migrate
- [ ] Document current API endpoints
- [ ] List configuration parameters
- [ ] Identify health check requirements

### Testing Preparation

- [ ] Existing tests documented
- [ ] Test data prepared
- [ ] Performance baselines established
- [ ] Rollback plan created

## Service Migration

### Step 1: Create Service Router

**Before (Legacy Service)**:

```python
from fastapi import APIRouter, HTTPException
import logging

router = APIRouter(prefix="/api/legacy-service")
logger = logging.getLogger(__name__)

@router.get("/health")
async def health():
    try:
        # Manual health check
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@router.post("/process")
async def process_data(data: dict):
    try:
        result = await legacy_process(data)
        return {"success": True, "data": result}
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
```

**After (Refactored Service)**:

```python
from app.core.base_router import BaseServiceRouter
from app.core.router_mixins import ConfigEndpointMixin, StreamingResponseMixin
from app.core.logging_config import get_service_logger

logger = get_service_logger("legacy-service")

class LegacyServiceRouter(BaseServiceRouter, ConfigEndpointMixin, StreamingResponseMixin):
    def __init__(self):
        super().__init__(prefix="/api/legacy-service", tags=["legacy-service"])
        self._setup_endpoints()
    
    def _setup_endpoints(self):
        @self.router.get("/health")
        async def health():
            return await self._standard_async_operation(
                "health_check",
                self._perform_health_check,
                "Health check failed"
            )
        
        @self.router.post("/process")
        async def process_data(data: dict):
            return await self._standard_async_operation(
                "process_data",
                lambda: legacy_process(data),
                "Data processing failed"
            )
    
    async def _perform_health_check(self):
        # Health check implementation
        return {"status": "healthy"}

# Create router instance
legacy_service_router = LegacyServiceRouter()
```

### Step 2: Register Service

**Service Registration**:

```python
from app.core.enhanced_service_registry import get_enhanced_service_registry
from app.core.service_config_manager import get_service_config_manager

# Get managers
registry = get_enhanced_service_registry()
config_manager = get_service_config_manager()

# Register configuration
config_manager.register_service_config(
    "legacy-service",
    default_config={
        "timeout": 30,
        "retries": 3,
        "api_url": "http://localhost:8000"
    }
)

# Register service
registry.register_service(
    name="legacy-service",
    config=config_manager.get_config("legacy-service"),
    startup_func=init_legacy_service,
    shutdown_func=shutdown_legacy_service,
    health_check_func=health_check_legacy_service,
    dependencies=["database"],
    is_critical=True
)
```

### Step 3: Implement Service Functions

**Service Initialization**:

```python
async def init_legacy_service(config: dict) -> dict:
    """Initialize the legacy service."""
    try:
        # Initialize service components
        service_instance = {
            "config": config,
            "initialized_at": time.time(),
            "status": "running"
        }
        
        logger.info("Legacy service initialized successfully")
        return service_instance
        
    except Exception as e:
        logger.error(f"Legacy service initialization failed: {e}")
        raise

async def shutdown_legacy_service(instance: dict) -> None:
    """Shutdown the legacy service."""
    try:
        # Cleanup resources
        if instance:
            instance["status"] = "shutdown"
            instance["shutdown_at"] = time.time()
        
        logger.info("Legacy service shutdown completed")
        
    except Exception as e:
        logger.error(f"Legacy service shutdown failed: {e}")

async def health_check_legacy_service() -> bool:
    """Health check for legacy service."""
    try:
        # Perform health check
        # This could be a database query, API call, etc.
        return True
        
    except Exception as e:
        logger.error(f"Legacy service health check failed: {e}")
        return False
```

## Configuration Migration

### Step 1: Identify Configuration Parameters

**Audit existing configuration**:

```python
# Before: Scattered configuration
import os

RAG_DATABASE_URL = os.getenv("RAG_DATABASE_URL", "sqlite:///app.db")
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "30"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
ENABLE_CACHING = os.getenv("ENABLE_CACHING", "true").lower() == "true"
```

### Step 2: Create Configuration Schema

**Configuration Schema**:

```python
from app.core.service_config_manager import ServiceConfigSchema

# Define configuration schema
LegacyServiceConfigSchema = ServiceConfigSchema(
    required_fields=["rag_database_url", "api_timeout"],
    optional_fields=["max_retries", "enable_caching", "log_level"],
    field_types={
        "rag_database_url": str,
        "api_timeout": int,
        "max_retries": int,
        "enable_caching": bool,
        "log_level": str
    },
    field_defaults={
        "rag_database_url": "sqlite:///app.db",
        "api_timeout": 30,
        "max_retries": 3,
        "enable_caching": True,
        "log_level": "INFO"
    },
    validation_rules={
        "api_timeout": {"min": 1, "max": 300},
        "max_retries": {"min": 0, "max": 10},
        "log_level": {"choices": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]}
    }
)
```

### Step 3: Register Configuration

**Configuration Registration**:

```python
from app.core.service_config_manager import get_service_config_manager

config_manager = get_service_config_manager()

# Register service configuration
config_manager.register_service_config(
    "legacy-service",
    default_config={
        "rag_database_url": "sqlite:///app.db",
        "api_timeout": 30,
        "max_retries": 3,
        "enable_caching": True,
        "log_level": "INFO"
    },
    schema=LegacyServiceConfigSchema
)
```

### Step 4: Use Configuration

**Configuration Usage**:

```python
from app.core.service_config_manager import get_service_config_manager

config_manager = get_service_config_manager()

# Get validated configuration
config = config_manager.get_config("legacy-service")

# Use configuration
rag_database_url = config["rag_database_url"]
api_timeout = config["api_timeout"]
max_retries = config["max_retries"]
enable_caching = config["enable_caching"]
log_level = config["log_level"]
```

## Health Check Migration

### Step 1: Implement Health Check Function

**Basic Health Check**:

```python
async def health_check_legacy_service() -> bool:
    """Basic health check for legacy service."""
    try:
        # Check database connectivity
        # Check external API availability
        # Check internal service status
        return True
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return False
```

**Advanced Health Check**:

```python
from app.core.health_checks import HealthStatus

async def advanced_health_check_legacy_service() -> HealthStatus:
    """Advanced health check with detailed status."""
    try:
        # Check multiple components
        db_healthy = await check_database_health()
        api_healthy = await check_external_api_health()
        service_healthy = await check_internal_service_health()
        
        if not db_healthy:
            return HealthStatus.UNHEALTHY
        elif not api_healthy or not service_healthy:
            return HealthStatus.DEGRADED
        else:
            return HealthStatus.HEALTHY
            
    except Exception as e:
        logger.error(f"Advanced health check failed: {e}")
        return HealthStatus.UNHEALTHY
```

### Step 2: Register Health Check

**Health Check Registration**:

```python
# Register with service registry
registry.register_service(
    name="legacy-service",
    config=config,
    startup_func=init_legacy_service,
    shutdown_func=shutdown_legacy_service,
    health_check_func=advanced_health_check_legacy_service,  # Use advanced health check
    health_check_interval=30,  # Check every 30 seconds
    is_critical=True
)
```

### Step 3: Add Health Endpoints

**Health Endpoints**:

```python
class LegacyServiceRouter(BaseServiceRouter):
    def _setup_endpoints(self):
        @self.router.get("/health")
        async def health():
            return await self._standard_async_operation(
                "health_check",
                self._perform_health_check,
                "Health check failed"
            )
        
        @self.router.get("/health/detailed")
        async def detailed_health():
            return await self._standard_async_operation(
                "detailed_health_check",
                self._perform_detailed_health_check,
                "Detailed health check failed"
            )
    
    async def _perform_health_check(self):
        """Basic health check endpoint."""
        health_manager = get_health_check_manager()
        result = health_manager.get_health_status("legacy-service")
        
        if result:
            return {
                "status": result.status.value,
                "timestamp": result.timestamp,
                "response_time": result.response_time
            }
        else:
            return {"status": "unknown", "message": "No health data available"}
    
    async def _perform_detailed_health_check(self):
        """Detailed health check endpoint."""
        health_manager = get_health_check_manager()
        result = health_manager.get_health_status("legacy-service")
        
        if result:
            return {
                "status": result.status.value,
                "timestamp": result.timestamp,
                "response_time": result.response_time,
                "details": result.details,
                "dependencies": result.dependencies,
                "errors": result.errors,
                "warnings": result.warnings,
                "metrics": result.metrics
            }
        else:
            return {"status": "unknown", "message": "No health data available"}
```

## Security Migration

### Step 1: Add Security Middleware

**Security Middleware Integration**:

```python
from app.security.security_middleware import SecurityErrorHandler, AdaptiveRateLimiter
from app.middleware.input_validation_middleware import InputValidationMiddleware

# Initialize security components
security_handler = SecurityErrorHandler()
rate_limiter = AdaptiveRateLimiter(
    default_rate=100,  # requests per minute
    burst_rate=200,
    adaptive_enabled=True
)
validation_middleware = InputValidationMiddleware()

# Add to FastAPI app
app.add_middleware(validation_middleware)
```

### Step 2: Update Error Handling

**Security-Aware Error Handling**:

```python
from app.core.error_handler import ServiceErrorHandler

error_handler = ServiceErrorHandler()

@router.post("/sensitive-operation")
async def sensitive_operation(data: dict):
    return await self._standard_async_operation(
        "sensitive_operation",
        lambda: perform_sensitive_operation(data),
        "Sensitive operation failed",
        security_context={
            "user_id": get_current_user_id(),
            "ip_address": get_client_ip(),
            "operation_type": "sensitive"
        }
    )
```

### Step 3: Add Input Validation

**Input Validation**:

```python
from pydantic import BaseModel, validator

class ProcessDataRequest(BaseModel):
    data: str
    user_id: int
    
    @validator('data')
    def validate_data(cls, v):
        if len(v) > 10000:
            raise ValueError('Data too large')
        if '<script>' in v.lower():
            raise ValueError('Invalid data format')
        return v
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if v <= 0:
            raise ValueError('Invalid user ID')
        return v

@router.post("/process")
async def process_data(request: ProcessDataRequest):
    return await self._standard_async_operation(
        "process_data",
        lambda: legacy_process(request.dict()),
        "Data processing failed"
    )
```

## Testing Migration

### Step 1: Update Unit Tests

**Before (Legacy Tests)**:

```python
import pytest
from fastapi.testclient import TestClient

def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/api/legacy-service/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

**After (Refactored Tests)**:

```python
import pytest
from fastapi.testclient import TestClient
from app.core.enhanced_service_registry import EnhancedServiceRegistry

@pytest.fixture
def test_registry():
    registry = EnhancedServiceRegistry()
    # Register test service
    registry.register_service(
        name="test-service",
        config={"test": True},
        startup_func=test_startup,
        shutdown_func=test_shutdown
    )
    return registry

@pytest.mark.asyncio
async def test_health_endpoint(test_registry):
    # Initialize service
    await test_registry.initialize_service("test-service")
    
    # Test health endpoint
    client = TestClient(app)
    response = client.get("/api/legacy-service/health")
    assert response.status_code == 200
    
    health_data = response.json()
    assert "status" in health_data
    assert "timestamp" in health_data
    assert "response_time" in health_data
```

### Step 2: Add Integration Tests

**Integration Tests**:

```python
@pytest.mark.asyncio
async def test_service_lifecycle():
    """Test complete service lifecycle."""
    registry = EnhancedServiceRegistry()
    config_manager = ServiceConfigManager()
    
    # Register configuration
    config_manager.register_service_config(
        "test-service",
        default_config={"timeout": 30}
    )
    
    # Register service
    registry.register_service(
        name="test-service",
        config=config_manager.get_config("test-service"),
        startup_func=test_startup,
        shutdown_func=test_shutdown,
        health_check_func=test_health_check
    )
    
    # Test initialization
    success = await registry.initialize_service("test-service")
    assert success is True
    
    # Test health check
    health_manager = get_health_check_manager()
    health_result = await health_manager.perform_health_check("test-service")
    assert health_result.status == HealthStatus.HEALTHY
    
    # Test shutdown
    await registry.shutdown_service("test-service")
    service_info = registry.get_service_info("test-service")
    assert service_info.status == ServiceStatus.STOPPED
```

### Step 3: Add Performance Tests

**Performance Tests**:

```python
@pytest.mark.asyncio
async def test_service_performance():
    """Test service performance benchmarks."""
    registry = EnhancedServiceRegistry()
    
    # Register service
    registry.register_service(
        name="performance-test-service",
        config={"test": True},
        startup_func=test_startup,
        shutdown_func=test_shutdown
    )
    
    # Test initialization performance
    start_time = time.time()
    success = await registry.initialize_service("performance-test-service")
    end_time = time.time()
    
    assert success is True
    initialization_time = end_time - start_time
    assert initialization_time < 1.0  # Should initialize within 1 second
    
    # Test health check performance
    health_manager = get_health_check_manager()
    start_time = time.time()
    health_result = await health_manager.perform_health_check("performance-test-service")
    end_time = time.time()
    
    health_check_time = end_time - start_time
    assert health_check_time < 0.5  # Should complete within 500ms
```

## Deployment Migration

### Step 1: Update Docker Configuration

**Dockerfile Updates**:

```dockerfile
# Before
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# After
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Update Docker Compose

**Docker Compose Updates**:

```yaml
# Before
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - RAG_DATABASE_URL=postgresql://user:pass@db:5432/dbname

# After
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - RAG_DATABASE_URL=postgresql://user:pass@db:5432/dbname
      - SERVICE_CONFIG_VALIDATION_LEVEL=strict
      - HEALTH_CHECK_INTERVAL=30
      - ENABLE_HEALTH_AUTOMATION=true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      db:
        condition: service_healthy
```

### Step 3: Update Kubernetes Configuration

**Kubernetes Updates**:

```yaml
# Before
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:latest
        ports:
        - containerPort: 8000

# After
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: SERVICE_CONFIG_VALIDATION_LEVEL
          value: "strict"
        - name: HEALTH_CHECK_INTERVAL
          value: "30"
        - name: ENABLE_HEALTH_AUTOMATION
          value: "true"
        livenessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/service/backend
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Post-Migration Validation

### Step 1: Functional Testing

**Validation Checklist**:

- [ ] All services start successfully
- [ ] Health checks return healthy status
- [ ] API endpoints respond correctly
- [ ] Configuration is loaded and validated
- [ ] Error handling works as expected
- [ ] Logging is structured and informative
- [ ] Security middleware is active
- [ ] Rate limiting is working
- [ ] Input validation is enforced

### Step 2: Performance Testing

**Performance Validation**:

```python
# Performance test script
import asyncio
import time
import requests

async def validate_performance():
    """Validate system performance after migration."""
    
    # Test service initialization time
    start_time = time.time()
    # Initialize services
    end_time = time.time()
    init_time = end_time - start_time
    assert init_time < 10.0, f"Initialization too slow: {init_time}s"
    
    # Test API response times
    response_times = []
    for _ in range(100):
        start_time = time.time()
        response = requests.get("http://localhost:8000/health/")
        end_time = time.time()
        response_times.append(end_time - start_time)
    
    avg_response_time = sum(response_times) / len(response_times)
    assert avg_response_time < 0.5, f"Response time too slow: {avg_response_time}s"
    
    # Test health check performance
    start_time = time.time()
    response = requests.get("http://localhost:8000/health/services")
    end_time = time.time()
    health_check_time = end_time - start_time
    assert health_check_time < 1.0, f"Health check too slow: {health_check_time}s"

if __name__ == "__main__":
    asyncio.run(validate_performance())
```

### Step 3: Monitoring Setup

**Monitoring Configuration**:

```python
# Monitoring setup script
from app.core.health_checks import start_health_monitoring
from app.core.health_check_automation import start_health_automation

async def setup_monitoring():
    """Setup comprehensive monitoring."""
    
    # Start health monitoring
    await start_health_monitoring()
    print("✅ Health monitoring started")
    
    # Start health automation
    await start_health_automation()
    print("✅ Health automation started")
    
    # Verify monitoring endpoints
    import requests
    
    endpoints = [
        "/health/",
        "/health/services",
        "/health/metrics",
        "/health/predictive"
    ]
    
    for endpoint in endpoints:
        response = requests.get(f"http://localhost:8000{endpoint}")
        assert response.status_code == 200, f"Endpoint {endpoint} not working"
        print(f"✅ Endpoint {endpoint} working")

if __name__ == "__main__":
    asyncio.run(setup_monitoring())
```

## Maintenance Guidelines

### Daily Maintenance

**Health Monitoring**:

- Check system health dashboard
- Review health check metrics
- Monitor error rates and response times
- Check for predictive alerts

**Log Analysis**:

- Review error logs for issues
- Check for security alerts
- Monitor performance metrics
- Analyze usage patterns

### Weekly Maintenance

**Configuration Review**:

- Review service configurations
- Check for configuration drift
- Validate environment variables
- Update configuration schemas if needed

**Performance Analysis**:

- Analyze performance trends
- Review resource usage
- Check for bottlenecks
- Optimize slow operations

### Monthly Maintenance

**Security Review**:

- Review security logs
- Check for vulnerabilities
- Update security rules
- Test security automation

**Architecture Review**:

- Review service dependencies
- Check for new duplication
- Plan for scaling needs
- Update documentation

### Quarterly Maintenance

**Comprehensive Review**:

- Full system health assessment
- Performance benchmarking
- Security audit
- Architecture evolution planning

**Training and Documentation**:

- Update team training
- Refresh documentation
- Share lessons learned
- Plan improvements

## Troubleshooting

### Common Issues

#### Service Initialization Failures

```python
# Debug service initialization
registry = get_enhanced_service_registry()
service_info = registry.get_service_info("failing-service")
print(f"Service status: {service_info.status}")
print(f"Service errors: {service_info.error}")
print(f"Service dependencies: {service_info.dependencies}")
```

#### Health Check Failures

```python
# Debug health checks
health_manager = get_health_check_manager()
health_result = health_manager.get_health_status("unhealthy-service")
print(f"Health status: {health_result.status}")
print(f"Health details: {health_result.details}")
print(f"Health errors: {health_result.errors}")
```

#### Configuration Issues

```python
# Debug configuration
config_manager = get_service_config_manager()
config = config_manager.get_config("problematic-service")
print(f"Configuration: {config}")
print(f"Validation level: {config_manager.config_validation_level}")
```

#### Performance Issues

```python
# Debug performance
health_manager = get_health_check_manager()
metrics = health_manager.get_health_metrics()
print(f"Performance metrics: {metrics}")
```

### Recovery Procedures

#### Service Recovery

1. Check service status and errors
2. Review service dependencies
3. Restart service if needed
4. Verify health check passes
5. Monitor for recurring issues

#### Configuration Recovery

1. Check configuration validation
2. Review environment variables
3. Validate configuration schema
4. Update configuration if needed
5. Restart affected services

#### Health Check Recovery

1. Check health check implementation
2. Verify service dependencies
3. Review health check configuration
4. Test health check manually
5. Update health check if needed

## Conclusion

This migration guide provides a comprehensive approach to migrating to and maintaining the refactored backend architecture. By following these guidelines, teams can successfully migrate their services while maintaining high reliability and performance.

The key to successful migration is:

- **Gradual Migration**: Migrate services incrementally
- **Comprehensive Testing**: Test thoroughly at each step
- **Monitoring**: Monitor system health throughout migration
- **Documentation**: Keep documentation up to date
- **Training**: Ensure team is trained on new patterns

Remember that migration is not just a one-time event but an ongoing process of improvement and maintenance. Regular reviews and updates will ensure the system continues to meet evolving requirements.

---

*For additional support or questions, refer to the troubleshooting section or contact the development team.*
