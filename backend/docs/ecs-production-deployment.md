# ECS Memory & Interaction System Production Deployment Guide

_Comprehensive guide for deploying the ECS Memory & Interaction System in production environments_

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Security Configuration](#security-configuration)
7. [Backup and Recovery](#backup-and-recovery)
8. [Scaling Strategies](#scaling-strategies)
9. [Troubleshooting Guide](#troubleshooting-guide)

## Deployment Overview

The ECS Memory & Interaction System is designed for high-availability production deployment with the following key characteristics:

- **High Availability**: 99.9% uptime target
- **Scalability**: Support for 10,000+ concurrent agents
- **Performance**: < 100ms API response times
- **Reliability**: Automated failover and recovery
- **Security**: Enterprise-grade security measures

## Infrastructure Requirements

### 1. Minimum System Requirements

```yaml
# Production infrastructure requirements
production_requirements:
  application_servers:
    count: 3
    cpu: "4 cores"
    memory: "8GB"
    storage: "100GB SSD"
    network: "1Gbps"

  database_servers:
    count: 2 # Primary + Replica
    cpu: "8 cores"
    memory: "16GB"
    storage: "500GB SSD"
    network: "1Gbps"

  cache_servers:
    count: 2 # Redis cluster
    cpu: "2 cores"
    memory: "4GB"
    storage: "50GB SSD"
    network: "1Gbps"

  load_balancer:
    count: 2 # HA pair
    cpu: "2 cores"
    memory: "4GB"
    network: "1Gbps"
```

### 2. Cloud Provider Recommendations

#### AWS Configuration

```yaml
# AWS infrastructure configuration
aws_infrastructure:
  ec2_instances:
    application:
      instance_type: "c5.2xlarge"
      count: 3
      availability_zones: ["us-west-2a", "us-west-2b", "us-west-2c"]

    database:
      instance_type: "r5.2xlarge"
      count: 2
      availability_zones: ["us-west-2a", "us-west-2b"]

  rds:
    engine: "postgresql"
    version: "13.7"
    instance_class: "db.r5.xlarge"
    storage: "500GB"
    multi_az: true

  elasticache:
    engine: "redis"
    node_type: "cache.r5.large"
    num_cache_nodes: 2

  load_balancer:
    type: "application"
    scheme: "internet-facing"
    listeners:
      - port: 80
        protocol: "HTTP"
      - port: 443
        protocol: "HTTPS"
```

#### Google Cloud Configuration

```yaml
# GCP infrastructure configuration
gcp_infrastructure:
  compute_instances:
    application:
      machine_type: "c2-standard-8"
      count: 3
      zones: ["us-central1-a", "us-central1-b", "us-central1-c"]

    database:
      machine_type: "c2-standard-8"
      count: 2
      zones: ["us-central1-a", "us-central1-b"]

  cloud_sql:
    database_version: "POSTGRES_13"
    tier: "db-custom-8-32768"
    storage_size: "500GB"
    availability_type: "REGIONAL"

  memorystore:
    tier: "STANDARD_HA"
    memory_size_gb: 4

  load_balancer:
    type: "HTTP(S)"
    global: true
```

## Database Setup

### 1. PostgreSQL Configuration

```sql
-- Production PostgreSQL configuration
-- postgresql.conf optimizations

# Memory settings
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Connection settings
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# Logging settings
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Performance settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. Database Schema Optimization

```sql
-- Optimized database schema for production
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_memories_agent_importance
ON memories(agent_id, importance DESC)
WHERE importance > 0.1;

CREATE INDEX CONCURRENTLY idx_interactions_agents_time
ON interactions(source_agent_id, target_agent_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_relationships_strength
ON relationships(source_agent_id, strength DESC)
WHERE strength > 0.0;

CREATE INDEX CONCURRENTLY idx_knowledge_agent_topic
ON knowledge(agent_id, topic)
WHERE topic IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_social_network_agent_type
ON social_networks(agent_id, connection_type);

-- Partition large tables by date
CREATE TABLE memories_2024_01 PARTITION OF memories
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE memories_2024_02 PARTITION OF memories
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create materialized views for complex queries
CREATE MATERIALIZED VIEW agent_relationship_summary AS
SELECT
    source_agent_id,
    COUNT(*) as total_relationships,
    AVG(strength) as avg_strength,
    MAX(strength) as max_strength
FROM relationships
GROUP BY source_agent_id;

CREATE UNIQUE INDEX ON agent_relationship_summary(source_agent_id);
```

### 3. Database Backup Strategy

```bash
#!/bin/bash
# Database backup script

# Configuration
DB_HOST="localhost"
DB_NAME="ecs_production"
DB_USER="ecs_user"
BACKUP_DIR="/backups/postgresql"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/ecs_full_$(date +%Y%m%d_%H%M%S).dump"

# Incremental backup (WAL files)
pg_basebackup -h $DB_HOST -U $DB_USER \
    -D "$BACKUP_DIR/wal_$(date +%Y%m%d_%H%M%S)" \
    -Ft -z -P

# Cleanup old backups
find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "wal_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "Backup completed: $(date)"
```

## Application Deployment

### 1. Docker Configuration

```dockerfile
# Multi-stage Dockerfile for production
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create application user
RUN useradd -m -u 1000 ecsuser

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=ecsuser:ecsuser . .

# Switch to non-root user
USER ecsuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2. Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  ecs-backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ECS_DATABASE_URL=postgresql://ecs_user:${DB_PASSWORD}@postgres:5432/ecs_production
      - ECS_REDIS_URL=redis://redis:6379/0
      - ECS_LOG_LEVEL=INFO
      - ECS_WORKERS=4
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
        reservations:
          memory: 1G
          cpus: "0.5"

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=ecs_production
      - POSTGRES_USER=ecs_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ecs-backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecs-backend
  labels:
    app: ecs-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecs-backend
  template:
    metadata:
      labels:
        app: ecs-backend
    spec:
      containers:
        - name: ecs-backend
          image: ecs-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: ECS_DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: ecs-secrets
                  key: database-url
            - name: ECS_REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: ecs-secrets
                  key: redis-url
          resources:
            requests:
              memory: "1Gi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
      volumes:
        - name: config-volume
          configMap:
            name: ecs-config
---
apiVersion: v1
kind: Service
metadata:
  name: ecs-backend-service
spec:
  selector:
    app: ecs-backend
  ports:
    - port: 80
      targetPort: 8000
  type: LoadBalancer
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecs-config
data:
  app.conf: |
    [database]
    pool_size = 20
    max_overflow = 30

    [cache]
    redis_timeout = 5
    cache_ttl = 300

    [logging]
    level = INFO
    format = json
---
apiVersion: v1
kind: Secret
metadata:
  name: ecs-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  redis-url: <base64-encoded-redis-url>
```

## Monitoring and Alerting

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "ecs_rules.yml"

scrape_configs:
  - job_name: "ecs-backend"
    static_configs:
      - targets: ["ecs-backend-service:80"]
    metrics_path: /metrics
    scrape_interval: 5s
    scrape_timeout: 10s

  - job_name: "postgres"
    static_configs:
      - targets: ["postgres-exporter:9187"]

  - job_name: "redis"
    static_configs:
      - targets: ["redis-exporter:9121"]

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

### 2. Grafana Dashboards

```json
{
  "dashboard": {
    "title": "ECS Memory & Interaction System",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Agents",
        "type": "singlestat",
        "targets": [
          {
            "expr": "ecs_active_agents_total",
            "legendFormat": "Active Agents"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "ecs_memory_usage_bytes",
            "legendFormat": "Memory Usage"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_activity_count",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

### 3. Alert Rules

```yaml
# ecs_rules.yml
groups:
  - name: ecs-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighMemoryUsage
        expr: ecs_memory_usage_percent > 90
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis cache is not responding"
```

## Security Configuration

### 1. SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name ecs.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ecs.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://ecs-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### 2. Application Security

```python
# Security middleware configuration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

# Security middleware
app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["ecs.example.com", "*.example.com"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ecs.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/agents/{agent_id}/memories")
@limiter.limit("100/minute")
async def get_agent_memories(request: Request, agent_id: str):
    # Implementation here
    pass
```

## Backup and Recovery

### 1. Automated Backup Script

```bash
#!/bin/bash
# Comprehensive backup script

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Database backup
echo "Starting database backup..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/$DATE/database.dump"

# Redis backup
echo "Starting Redis backup..."
redis-cli --rdb "$BACKUP_DIR/$DATE/redis.rdb"

# Application configuration backup
echo "Backing up configuration..."
cp -r /app/config "$BACKUP_DIR/$DATE/"

# SSL certificates backup
echo "Backing up SSL certificates..."
cp -r /etc/nginx/ssl "$BACKUP_DIR/$DATE/"

# Create backup manifest
cat > "$BACKUP_DIR/$DATE/manifest.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "version": "$(git rev-parse HEAD)",
    "components": {
        "database": "database.dump",
        "redis": "redis.rdb",
        "config": "config/",
        "ssl": "ssl/"
    }
}
EOF

# Compress backup
echo "Compressing backup..."
tar -czf "$BACKUP_DIR/ecs_backup_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Upload to cloud storage (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/ecs_backup_$DATE.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
fi

# Cleanup old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "ecs_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

### 2. Recovery Procedures

```bash
#!/bin/bash
# Recovery script

set -e

BACKUP_FILE=$1
RECOVERY_DIR="/tmp/recovery"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Extract backup
echo "Extracting backup..."
mkdir -p $RECOVERY_DIR
tar -xzf "$BACKUP_FILE" -C $RECOVERY_DIR

# Stop services
echo "Stopping services..."
docker-compose down

# Restore database
echo "Restoring database..."
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --clean --if-exists \
    "$RECOVERY_DIR/database.dump"

# Restore Redis
echo "Restoring Redis..."
redis-cli flushall
redis-cli --pipe < "$RECOVERY_DIR/redis.rdb"

# Restore configuration
echo "Restoring configuration..."
cp -r "$RECOVERY_DIR/config" /app/

# Restore SSL certificates
echo "Restoring SSL certificates..."
cp -r "$RECOVERY_DIR/ssl" /etc/nginx/

# Start services
echo "Starting services..."
docker-compose up -d

# Verify recovery
echo "Verifying recovery..."
sleep 30
curl -f http://localhost:8000/health || {
    echo "Recovery verification failed"
    exit 1
}

echo "Recovery completed successfully"
```

## Scaling Strategies

### 1. Horizontal Scaling

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ecs-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ecs-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 2. Database Scaling

```yaml
# PostgreSQL read replicas
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-replica
spec:
  replicas: 2
  selector:
    matchLabels:
      app: postgres-replica
  template:
    metadata:
      labels:
        app: postgres-replica
    spec:
      containers:
        - name: postgres
          image: postgres:13
          env:
            - name: POSTGRES_DB
              value: ecs_production
            - name: POSTGRES_USER
              value: ecs_user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ecs-secrets
                  key: database-password
            - name: PGUSER
              value: postgres
          command:
            - bash
            - -c
            - |
              # Wait for primary to be ready
              until pg_isready -h postgres-primary; do sleep 1; done

              # Create replica
              pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replicator -v -P -W

              # Configure as replica
              echo "standby_mode = 'on'" >> /var/lib/postgresql/data/recovery.conf
              echo "primary_conninfo = 'host=postgres-primary port=5432 user=replicator'" >> /var/lib/postgresql/data/recovery.conf

              # Start PostgreSQL
              postgres
```

## Troubleshooting Guide

### 1. Common Issues

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Check application memory
curl http://localhost:8000/metrics | grep memory

# Restart services if needed
docker-compose restart ecs-backend
```

#### Database Connection Issues

```bash
# Check database connectivity
pg_isready -h localhost -p 5432

# Check connection pool
psql -h localhost -U ecs_user -d ecs_production -c "SELECT * FROM pg_stat_activity;"

# Check database logs
docker logs postgres
```

#### Redis Connection Issues

```bash
# Check Redis connectivity
redis-cli ping

# Check Redis memory usage
redis-cli info memory

# Check Redis logs
docker logs redis
```

### 2. Performance Debugging

```python
# Performance debugging script
import time
import psutil
import requests

def check_system_health():
    """Check overall system health."""
    print("=== System Health Check ===")

    # CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    print(f"CPU Usage: {cpu_percent}%")

    # Memory usage
    memory = psutil.virtual_memory()
    print(f"Memory Usage: {memory.percent}%")

    # Disk usage
    disk = psutil.disk_usage('/')
    print(f"Disk Usage: {disk.percent}%")

    # Network I/O
    network = psutil.net_io_counters()
    print(f"Network I/O: {network.bytes_sent} bytes sent, {network.bytes_recv} bytes received")

def check_application_health():
    """Check application health."""
    print("\n=== Application Health Check ===")

    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def check_database_performance():
    """Check database performance."""
    print("\n=== Database Performance Check ===")

    try:
        response = requests.get('http://localhost:8000/metrics', timeout=5)
        metrics = response.text

        # Extract database metrics
        for line in metrics.split('\n'):
            if 'pg_stat_activity' in line or 'pg_database_size' in line:
                print(line)
    except Exception as e:
        print(f"Database Check Failed: {e}")

if __name__ == "__main__":
    check_system_health()
    check_application_health()
    check_database_performance()
```

## Conclusion

This production deployment guide provides comprehensive strategies for deploying the ECS Memory & Interaction System in production environments. Key areas covered include:

1. **Infrastructure Requirements**: Detailed specifications for production hardware and cloud configurations
2. **Database Setup**: Optimized PostgreSQL configuration and backup strategies
3. **Application Deployment**: Containerization and orchestration best practices
4. **Monitoring and Alerting**: Comprehensive observability setup with Prometheus and Grafana
5. **Security Configuration**: SSL/TLS, rate limiting, and security headers
6. **Backup and Recovery**: Automated backup procedures and disaster recovery
7. **Scaling Strategies**: Horizontal and vertical scaling approaches
8. **Troubleshooting**: Common issues and debugging procedures

By following this guide, the ECS system can be deployed with high availability, performance, and reliability in production environments.
