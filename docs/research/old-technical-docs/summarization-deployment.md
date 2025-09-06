# Summarization System Deployment Guide

This guide covers deploying the YipYap summarization system across different environments, including development, staging, and production configurations.

## Overview

The summarization system is designed to be flexible and scalable across different deployment scenarios. It supports various configurations for different use cases and performance requirements.

## Environment Variables

### Core Summarization Settings

```bash
# Enable/disable summarization system
SUMMARIZATION_ENABLED=true

# Default model for summarization
SUMMARIZATION_DEFAULT_MODEL=qwen3:8b

# Cache configuration
SUMMARIZATION_CACHE_DIR=cache/summarization
SUMMARIZATION_CACHE_TTL_HOURS=24

# Performance settings
SUMMARIZATION_MAX_CONCURRENT=3
SUMMARIZATION_MAX_TOKENS_PER_BATCH=10000
SUMMARIZATION_MAX_BATCH_SIZE=10

# Generation parameters
SUMMARIZATION_DEFAULT_TEMPERATURE=0.3
SUMMARIZATION_DEFAULT_TOP_P=0.9
SUMMARIZATION_MAX_TEXT_LENGTH=16000

# Quality settings
SUMMARIZATION_QUALITY_THRESHOLD=0.7
SUMMARIZATION_QUALITY_METRICS_ENABLED=true
SUMMARIZATION_AUTO_REGENERATION_ENABLED=true
SUMMARIZATION_AUTO_REGENERATION_THRESHOLD=0.6

# Feature toggles
SUMMARIZATION_ENABLE_STREAMING=true
SUMMARIZATION_ENABLE_CACHING=true
SUMMARIZATION_ENABLE_PARALLEL_PROCESSING=true
SUMMARIZATION_ENABLE_PERSONALIZATION=true
SUMMARIZATION_ENABLE_CROSS_LANGUAGE=true
SUMMARIZATION_ENABLE_CONTEXTUAL=true

# Rate limiting
SUMMARIZATION_RATE_LIMIT_PER_MINUTE=100
SUMMARIZATION_STREAM_RATE_LIMIT_PER_MINUTE=10
SUMMARIZATION_BATCH_RATE_LIMIT_PER_MINUTE=5

# Health monitoring
SUMMARIZATION_HEALTH_CHECK_INTERVAL=60
SUMMARIZATION_RECONNECT_MAX_ATTEMPTS=3
SUMMARIZATION_RECONNECT_BASE_DELAY_S=1.0
SUMMARIZATION_RECONNECT_MAX_DELAY_S=30.0

# Storage paths
SUMMARIZATION_PREFERENCE_STORAGE_PATH=cache/summarization/preferences
```

## Development Environment

### Local Development Setup

1. **Clone and Setup**:

   ```bash
   git clone https://github.com/rakki194/yipyap
   cd yipyap
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   Create a `.env` file in the project root:

   ```bash
   # Development settings
   ENVIRONMENT=development
   DEV_PORT=7000
   ROOT_DIR=$HOME/datasets
   
   # Summarization settings for development
   SUMMARIZATION_ENABLED=true
   SUMMARIZATION_DEFAULT_MODEL=qwen3:8b
   SUMMARIZATION_CACHE_DIR=cache/summarization
   SUMMARIZATION_MAX_CONCURRENT=2
   SUMMARIZATION_ENABLE_STREAMING=true
   SUMMARIZATION_ENABLE_CACHING=true
   SUMMARIZATION_RATE_LIMIT_PER_MINUTE=50
   SUMMARIZATION_QUALITY_METRICS_ENABLED=true
   SUMMARIZATION_ENABLE_PERSONALIZATION=true
   ```

3. **Start Development Server**:

   ```bash
   DEV_PORT=7000 ROOT_DIR=$HOME/datasets NODE_ENV=development python -m app
   ```

4. **Verify Installation**:
   - Open <http://localhost:7000>
   - Navigate to a text file
   - Test summarization functionality

### Development with Docker

1. **Docker Compose Setup**:

   ```yaml
   # docker-compose.dev.yml
   services:
     yipyap-backend:
       build:
         context: .
         dockerfile: Dockerfile
       environment:
         ENVIRONMENT: development
         DEV_PORT: 7000
         ROOT_DIR: /app/images
         SUMMARIZATION_ENABLED: true
         SUMMARIZATION_DEFAULT_MODEL: qwen3:8b
         SUMMARIZATION_CACHE_DIR: /app/cache/summarization
         SUMMARIZATION_MAX_CONCURRENT: 2
         SUMMARIZATION_ENABLE_STREAMING: true
         SUMMARIZATION_ENABLE_CACHING: true
       volumes:
         - ./data:/app/data
         - ./cache:/app/cache
         - ./models:/app/models
       ports:
         - "7001:7001"
   ```

2. **Start with Docker**:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Staging Environment

### Staging Configuration

1. **Environment Variables**:

   ```bash
   # Staging settings
   ENVIRONMENT=staging
   SUMMARIZATION_ENABLED=true
   SUMMARIZATION_DEFAULT_MODEL=qwen3:8b
   SUMMARIZATION_CACHE_DIR=/var/cache/yipyap/summarization
   SUMMARIZATION_CACHE_TTL_HOURS=12
   SUMMARIZATION_MAX_CONCURRENT=5
   SUMMARIZATION_MAX_TOKENS_PER_BATCH=15000
   SUMMARIZATION_MAX_BATCH_SIZE=15
   SUMMARIZATION_DEFAULT_TEMPERATURE=0.4
   SUMMARIZATION_DEFAULT_TOP_P=0.85
   SUMMARIZATION_QUALITY_THRESHOLD=0.75
   SUMMARIZATION_ENABLE_STREAMING=true
   SUMMARIZATION_ENABLE_CACHING=true
   SUMMARIZATION_ENABLE_PARALLEL_PROCESSING=true
   SUMMARIZATION_RATE_LIMIT_PER_MINUTE=200
   SUMMARIZATION_STREAM_RATE_LIMIT_PER_MINUTE=20
   SUMMARIZATION_BATCH_RATE_LIMIT_PER_MINUTE=10
   SUMMARIZATION_HEALTH_CHECK_INTERVAL=30
   SUMMARIZATION_ENABLE_PERSONALIZATION=true
   SUMMARIZATION_ENABLE_CROSS_LANGUAGE=true
   SUMMARIZATION_ENABLE_CONTEXTUAL=true
   SUMMARIZATION_QUALITY_METRICS_ENABLED=true
   SUMMARIZATION_AUTO_REGENERATION_ENABLED=true
   ```

2. **Docker Compose for Staging**:

   ```yaml
   # docker-compose.staging.yml
   version: '3.8'
   services:
     yipyap:
       image: yipyap:staging
       environment:
         ENVIRONMENT: staging
         SUMMARIZATION_ENABLED: true
         SUMMARIZATION_DEFAULT_MODEL: qwen3:8b
         SUMMARIZATION_CACHE_DIR: /var/cache/yipyap/summarization
         SUMMARIZATION_MAX_CONCURRENT: 5
         SUMMARIZATION_RATE_LIMIT_PER_MINUTE: 200
         SUMMARIZATION_ENABLE_STREAMING: true
         SUMMARIZATION_ENABLE_CACHING: true
         SUMMARIZATION_ENABLE_PARALLEL_PROCESSING: true
         SUMMARIZATION_QUALITY_METRICS_ENABLED: true
       volumes:
         - /var/cache/yipyap:/var/cache/yipyap
         - /var/log/yipyap:/var/log/yipyap
         - /var/data/yipyap:/var/data/yipyap
       ports:
         - "8080:8080"
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

3. **Deploy to Staging**:

   ```bash
   # Build staging image
   docker build -t yipyap:staging .
   
   # Deploy with docker-compose
   docker-compose -f docker-compose.staging.yml up -d
   
   # Check logs
   docker-compose -f docker-compose.staging.yml logs -f
   ```

## Production Environment

### Production Configuration

1. **High-Performance Settings**:

   ```bash
   # Production settings
   ENVIRONMENT=production
   SUMMARIZATION_ENABLED=true
   SUMMARIZATION_DEFAULT_MODEL=qwen3:8b
   SUMMARIZATION_CACHE_DIR=/var/cache/yipyap/summarization
   SUMMARIZATION_CACHE_TTL_HOURS=48
   SUMMARIZATION_MAX_CONCURRENT=10
   SUMMARIZATION_MAX_TOKENS_PER_BATCH=20000
   SUMMARIZATION_MAX_BATCH_SIZE=20
   SUMMARIZATION_DEFAULT_TEMPERATURE=0.3
   SUMMARIZATION_DEFAULT_TOP_P=0.9
   SUMMARIZATION_MAX_TEXT_LENGTH=20000
   SUMMARIZATION_QUALITY_THRESHOLD=0.8
   SUMMARIZATION_ENABLE_STREAMING=true
   SUMMARIZATION_ENABLE_CACHING=true
   SUMMARIZATION_ENABLE_PARALLEL_PROCESSING=true
   SUMMARIZATION_RATE_LIMIT_PER_MINUTE=500
   SUMMARIZATION_STREAM_RATE_LIMIT_PER_MINUTE=50
   SUMMARIZATION_BATCH_RATE_LIMIT_PER_MINUTE=20
   SUMMARIZATION_HEALTH_CHECK_INTERVAL=15
   SUMMARIZATION_RECONNECT_MAX_ATTEMPTS=5
   SUMMARIZATION_RECONNECT_BASE_DELAY_S=0.5
   SUMMARIZATION_RECONNECT_MAX_DELAY_S=60.0
   SUMMARIZATION_ENABLE_PERSONALIZATION=true
   SUMMARIZATION_ENABLE_CROSS_LANGUAGE=true
   SUMMARIZATION_ENABLE_CONTEXTUAL=true
   SUMMARIZATION_QUALITY_METRICS_ENABLED=true
   SUMMARIZATION_AUTO_REGENERATION_ENABLED=true
   SUMMARIZATION_AUTO_REGENERATION_THRESHOLD=0.7
   ```

2. **Production Docker Compose**:

   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     yipyap:
       image: yipyap:latest
       environment:
         ENVIRONMENT: production
         SUMMARIZATION_ENABLED: true
         SUMMARIZATION_DEFAULT_MODEL: qwen3:8b
         SUMMARIZATION_CACHE_DIR: /var/cache/yipyap/summarization
         SUMMARIZATION_MAX_CONCURRENT: 10
         SUMMARIZATION_RATE_LIMIT_PER_MINUTE: 500
         SUMMARIZATION_ENABLE_STREAMING: true
         SUMMARIZATION_ENABLE_CACHING: true
         SUMMARIZATION_ENABLE_PARALLEL_PROCESSING: true
         SUMMARIZATION_QUALITY_METRICS_ENABLED: true
         SUMMARIZATION_ENABLE_PERSONALIZATION: true
         SUMMARIZATION_ENABLE_CROSS_LANGUAGE: true
         SUMMARIZATION_ENABLE_CONTEXTUAL: true
       volumes:
         - /var/cache/yipyap:/var/cache/yipyap
         - /var/log/yipyap:/var/log/yipyap
         - /var/data/yipyap:/var/data/yipyap
         - /var/models/yipyap:/var/models/yipyap
       ports:
         - "80:8080"
         - "443:8443"
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
         interval: 15s
         timeout: 5s
         retries: 3
         start_period: 60s
       deploy:
         resources:
           limits:
             memory: 8G
             cpus: '4.0'
           reservations:
             memory: 4G
             cpus: '2.0'
   ```

3. **Production Deployment**:

   ```bash
   # Build production image
   docker build -t yipyap:latest .
   
   # Deploy with docker-compose
   docker-compose -f docker-compose.prod.yml up -d
   
   # Monitor deployment
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Check health
   curl http://localhost/api/health
   ```

## Kubernetes Deployment

### Kubernetes Configuration

1. **ConfigMap for Environment Variables**:

   ```yaml
   # k8s/configmap.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: yipyap-summarization-config
   data:
     SUMMARIZATION_ENABLED: "true"
     SUMMARIZATION_DEFAULT_MODEL: "qwen3:8b"
     SUMMARIZATION_CACHE_DIR: "/var/cache/yipyap/summarization"
     SUMMARIZATION_MAX_CONCURRENT: "10"
     SUMMARIZATION_RATE_LIMIT_PER_MINUTE: "500"
     SUMMARIZATION_ENABLE_STREAMING: "true"
     SUMMARIZATION_ENABLE_CACHING: "true"
     SUMMARIZATION_ENABLE_PARALLEL_PROCESSING: "true"
     SUMMARIZATION_QUALITY_METRICS_ENABLED: "true"
     SUMMARIZATION_ENABLE_PERSONALIZATION: "true"
     SUMMARIZATION_ENABLE_CROSS_LANGUAGE: "true"
     SUMMARIZATION_ENABLE_CONTEXTUAL: "true"
   ```

2. **Deployment Configuration**:

   ```yaml
   # k8s/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: yipyap
     labels:
       app: yipyap
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: yipyap
     template:
       metadata:
         labels:
           app: yipyap
       spec:
         containers:
         - name: yipyap
           image: yipyap:latest
           ports:
           - containerPort: 8080
           envFrom:
           - configMapRef:
               name: yipyap-summarization-config
           resources:
             requests:
               memory: "4Gi"
               cpu: "2"
             limits:
               memory: "8Gi"
               cpu: "4"
           volumeMounts:
           - name: cache-volume
             mountPath: /var/cache/yipyap
           - name: data-volume
             mountPath: /var/data/yipyap
           - name: models-volume
             mountPath: /var/models/yipyap
           livenessProbe:
             httpGet:
               path: /api/health
               port: 8080
             initialDelaySeconds: 60
             periodSeconds: 15
           readinessProbe:
             httpGet:
               path: /api/health
               port: 8080
             initialDelaySeconds: 30
             periodSeconds: 10
         volumes:
         - name: cache-volume
           persistentVolumeClaim:
             claimName: yipyap-cache-pvc
         - name: data-volume
           persistentVolumeClaim:
             claimName: yipyap-data-pvc
         - name: models-volume
           persistentVolumeClaim:
             claimName: yipyap-models-pvc
   ```

3. **Service Configuration**:

   ```yaml
   # k8s/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: yipyap-service
   spec:
     selector:
       app: yipyap
     ports:
     - protocol: TCP
       port: 80
       targetPort: 8080
     type: LoadBalancer
   ```

4. **Deploy to Kubernetes**:

   ```bash
   # Apply configurations
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   
   # Check deployment status
   kubectl get pods -l app=yipyap
   kubectl get services -l app=yipyap
   
   # Check logs
   kubectl logs -l app=yipyap -f
   ```

## Cloud Deployment

### AWS Deployment

1. **ECS Task Definition**:

   ```json
   {
     "family": "yipyap",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "2048",
     "memory": "4096",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "yipyap",
         "image": "yipyap:latest",
         "portMappings": [
           {
             "containerPort": 8080,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "ENVIRONMENT",
             "value": "production"
           },
           {
             "name": "SUMMARIZATION_ENABLED",
             "value": "true"
           },
           {
             "name": "SUMMARIZATION_DEFAULT_MODEL",
             "value": "qwen3:8b"
           },
           {
             "name": "SUMMARIZATION_MAX_CONCURRENT",
             "value": "10"
           },
           {
             "name": "SUMMARIZATION_RATE_LIMIT_PER_MINUTE",
             "value": "500"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/yipyap",
             "awslogs-region": "us-west-2",
             "awslogs-stream-prefix": "ecs"
           }
         },
         "healthCheck": {
           "command": ["CMD-SHELL", "curl -f http://localhost:8080/api/health || exit 1"],
           "interval": 15,
           "timeout": 5,
           "retries": 3,
           "startPeriod": 60
         }
       }
     ]
   }
   ```

2. **Deploy to ECS**:

   ```bash
   # Create ECS cluster
   aws ecs create-cluster --cluster-name yipyap-cluster
   
   # Register task definition
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   
   # Create service
   aws ecs create-service \
     --cluster yipyap-cluster \
     --service-name yipyap-service \
     --task-definition yipyap:1 \
     --desired-count 3 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### Google Cloud Run

1. **Deploy to Cloud Run**:

   ```bash
   # Build and push image
   docker build -t gcr.io/PROJECT_ID/yipyap .
   docker push gcr.io/PROJECT_ID/yipyap
   
   # Deploy to Cloud Run
   gcloud run deploy yipyap \
     --image gcr.io/PROJECT_ID/yipyap \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 4Gi \
     --cpu 2 \
     --max-instances 10 \
     --set-env-vars "ENVIRONMENT=production,SUMMARIZATION_ENABLED=true,SUMMARIZATION_DEFAULT_MODEL=qwen3:8b,SUMMARIZATION_MAX_CONCURRENT=10"
   ```

## Performance Tuning

### Resource Optimization

1. **Memory Settings**:

   ```bash
   # For high-memory workloads
   SUMMARIZATION_MAX_CONCURRENT=5
   SUMMARIZATION_MAX_TOKENS_PER_BATCH=8000
   SUMMARIZATION_MAX_BATCH_SIZE=8
   
   # For high-throughput workloads
   SUMMARIZATION_MAX_CONCURRENT=15
   SUMMARIZATION_MAX_TOKENS_PER_BATCH=12000
   SUMMARIZATION_MAX_BATCH_SIZE=12
   ```

2. **Cache Optimization**:

   ```bash
   # Increase cache TTL for better performance
   SUMMARIZATION_CACHE_TTL_HOURS=72
   
   # Use Redis for distributed caching
   SUMMARIZATION_CACHE_REDIS_URL=redis://redis:6379
   ```

3. **Rate Limiting**:

   ```bash
   # Adjust based on expected load
   SUMMARIZATION_RATE_LIMIT_PER_MINUTE=1000
   SUMMARIZATION_STREAM_RATE_LIMIT_PER_MINUTE=100
   SUMMARIZATION_BATCH_RATE_LIMIT_PER_MINUTE=50
   ```

## Monitoring and Alerting

### Health Checks

1. **Health Check Endpoint**:

   ```bash
   # Check summarization service health
   curl http://localhost:8080/api/summarize/health
   
   # Expected response
   {
     "status": "healthy",
     "services": {
       "summarization_manager": "healthy",
       "ollama_service": "healthy",
       "cache_manager": "healthy"
     },
     "metrics": {
       "total_requests": 1234,
       "cache_hit_rate": 0.85,
       "average_response_time": 2.3
     }
   }
   ```

2. **Prometheus Metrics**:

   ```bash
   # Enable metrics endpoint
   SUMMARIZATION_METRICS_ENABLED=true
   
   # Access metrics
   curl http://localhost:8080/metrics
   ```

### Logging Configuration

1. **Structured Logging**:

   ```bash
   # Enable structured logging
   SUMMARIZATION_STRUCTURED_LOGGING=true
   SUMMARIZATION_LOG_LEVEL=INFO
   
   # Log to file
   SUMMARIZATION_LOG_FILE=/var/log/yipyap/summarization.log
   ```

2. **Log Rotation**:

   ```bash
   # Configure log rotation
   /var/log/yipyap/summarization.log {
     daily
     rotate 30
     compress
     delaycompress
     missingok
     notifempty
     create 644 yipyap yipyap
   }
   ```

## Security Considerations

### Environment Security

1. **Secrets Management**:

   ```bash
   # Use environment variables for secrets
   SUMMARIZATION_API_KEY=${SUMMARIZATION_API_KEY}
   SUMMARIZATION_DB_PASSWORD=${SUMMARIZATION_DB_PASSWORD}
   ```

2. **Network Security**:

   ```bash
   # Restrict network access
   SUMMARIZATION_ALLOWED_ORIGINS=https://yourdomain.com
   SUMMARIZATION_RATE_LIMIT_PER_IP=50
   ```

3. **Data Privacy**:

   ```bash
   # Enable data redaction
   SUMMARIZATION_REDACT_SENSITIVE_DATA=true
   SUMMARIZATION_LOG_REDACTION=true
   ```

## Troubleshooting

### Common Issues

1. **High Memory Usage**:

   ```bash
   # Reduce concurrent operations
   SUMMARIZATION_MAX_CONCURRENT=3
   SUMMARIZATION_MAX_TOKENS_PER_BATCH=5000
   ```

2. **Slow Response Times**:

   ```bash
   # Enable caching
   SUMMARIZATION_ENABLE_CACHING=true
   SUMMARIZATION_CACHE_TTL_HOURS=24
   
   # Increase concurrent operations
   SUMMARIZATION_MAX_CONCURRENT=8
   ```

3. **Service Unavailable**:

   ```bash
   # Check Ollama service
   curl http://localhost:11434/api/tags
   
   # Restart summarization service
   docker-compose restart yipyap
   ```

### Debug Mode

1. **Enable Debug Logging**:

   ```bash
   SUMMARIZATION_LOG_LEVEL=DEBUG
   SUMMARIZATION_DEBUG_MODE=true
   ```

2. **Performance Profiling**:

   ```bash
   SUMMARIZATION_PROFILING_ENABLED=true
   SUMMARIZATION_PROFILING_OUTPUT=/tmp/summarization_profile.json
   ```

This deployment guide provides comprehensive instructions for deploying the summarization system across different environments. Adjust the configurations based on your specific requirements and infrastructure constraints.
