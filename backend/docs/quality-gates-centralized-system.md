# Centralized Quality Gates System

🦊 *whiskers twitch with systematic precision* A comprehensive, database-backed quality gates system for the Reynard ecosystem, replacing JSON file-based configuration with enterprise-grade PostgreSQL storage.

## Overview

The centralized quality gates system provides:

- **PostgreSQL Storage**: All quality gates stored in `reynard_e2e` database
- **REST API**: Full CRUD operations via FastAPI endpoints
- **CLI Management**: Command-line tools for gate management
- **Environment Support**: Development, staging, and production environments
- **Evaluation History**: Complete audit trail of all evaluations
- **Analytics**: Statistics and reporting capabilities
- **Integration**: Seamless integration with existing Reynard tools

## Architecture

```mermaid
graph TB
    CLI[CLI Tools] --> API[FastAPI Endpoints]
    API --> Service[Quality Gates Service]
    Service --> DB[(PostgreSQL Database)]
    
    CLI --> Manager[DatabaseQualityGateManager]
    Manager --> API
    
    Service --> Models[SQLAlchemy Models]
    Models --> DB
    
    subgraph "Database Tables"
        DB --> QG[quality_gates]
        DB --> QGC[quality_gate_conditions]
        DB --> QGE[quality_gate_evaluations]
        DB --> QGCR[quality_gate_condition_results]
        DB --> QGENV[quality_gate_environments]
    end
```

## Database Schema

### Core Tables

#### `quality_gates`
- **id**: UUID primary key
- **gate_id**: Unique string identifier
- **name**: Human-readable gate name
- **description**: Optional description
- **environment**: Environment type (development, staging, production, all)
- **enabled**: Boolean flag
- **is_default**: Default gate flag
- **created_at/updated_at**: Timestamps

#### `quality_gate_conditions`
- **id**: UUID primary key
- **quality_gate_id**: Foreign key to quality_gates
- **metric**: Metric name to evaluate
- **operator**: Comparison operator (GT, LT, EQ, NE, GTE, LTE)
- **threshold**: Threshold value
- **error_threshold**: Optional error threshold
- **warning_threshold**: Optional warning threshold
- **description**: Condition description
- **enabled**: Boolean flag

#### `quality_gate_evaluations`
- **id**: UUID primary key
- **quality_gate_id**: Foreign key to quality_gates
- **evaluation_id**: Unique evaluation identifier
- **environment**: Environment evaluated
- **status**: Result status (PASSED, FAILED, WARN)
- **overall_score**: Overall score percentage
- **passed_conditions**: Number of passed conditions
- **total_conditions**: Total number of conditions
- **failed_conditions**: Number of failed conditions
- **warning_conditions**: Number of warning conditions
- **metrics_data**: JSONB with evaluation metrics
- **evaluated_at**: Evaluation timestamp

#### `quality_gate_condition_results`
- **id**: UUID primary key
- **evaluation_id**: Foreign key to evaluations
- **condition_id**: Foreign key to conditions
- **status**: Condition result status
- **actual_value**: Actual metric value
- **threshold**: Threshold value
- **message**: Result message
- **created_at**: Result timestamp

#### `quality_gate_environments`
- **id**: UUID primary key
- **environment**: Environment name
- **default_gate_id**: Default gate for environment
- **enabled**: Environment enabled flag
- **created_at/updated_at**: Timestamps

## API Endpoints

### Quality Gate CRUD

```http
POST   /api/quality-gates/                    # Create gate
GET    /api/quality-gates/                    # List gates
GET    /api/quality-gates/{gate_id}           # Get specific gate
PUT    /api/quality-gates/{gate_id}           # Update gate
DELETE /api/quality-gates/{gate_id}           # Delete gate
```

### Evaluation

```http
POST   /api/quality-gates/evaluate            # Evaluate gates
GET    /api/quality-gates/evaluations         # Get evaluation history
GET    /api/quality-gates/stats               # Get evaluation statistics
```

### Environment Management

```http
GET    /api/quality-gates/environments/{env}  # Get environment config
PUT    /api/quality-gates/environments/{env}  # Update environment config
```

### Initialization

```http
POST   /api/quality-gates/initialize          # Initialize default gates
POST   /api/quality-gates/reynard-defaults    # Create Reynard gates
```

### Health Check

```http
GET    /api/quality-gates/health              # Service health check
```

## CLI Usage

### Quality Gate Management

```bash
# List all quality gates
reynard-code-quality quality-gate-mgmt --action list

# Show specific gate
reynard-code-quality quality-gate-mgmt --action show --gate-id reynard-development

# Create new gate
reynard-code-quality quality-gate-mgmt --action create \
  --gate-id custom-gate \
  --name "Custom Gate" \
  --environment development \
  --description "Custom quality gate"

# Update gate
reynard-code-quality quality-gate-mgmt --action update \
  --gate-id custom-gate \
  --name "Updated Gate" \
  --disabled

# Delete gate
reynard-code-quality quality-gate-mgmt --action delete --gate-id custom-gate

# Initialize default gates
reynard-code-quality quality-gate-mgmt --action init

# Show statistics
reynard-code-quality quality-gate-mgmt --action stats \
  --gate-id reynard-development \
  --environment development

# Show evaluation history
reynard-code-quality quality-gate-mgmt --action history \
  --gate-id reynard-development \
  --environment development
```

### Quality Gate Evaluation

```bash
# Evaluate quality gates
reynard-code-quality quality-gate \
  --environment development \
  --project /path/to/project

# Evaluate with custom metrics file
reynard-code-quality quality-gate \
  --environment production \
  --metrics metrics.json
```

## Environment Variables

```bash
# Backend connection
REYNARD_BACKEND_URL=http://localhost:8000
REYNARD_API_KEY=your-api-key

# Database connection (backend)
E2E_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_e2e
```

## Setup and Installation

### 1. Database Migration

```bash
cd backend
python scripts/setup_quality_gates.py
```

### 2. Initialize Default Gates

```bash
# Via CLI
reynard-code-quality quality-gate-mgmt --action init

# Via API
curl -X POST http://localhost:8000/api/quality-gates/initialize
```

### 3. Verify Installation

```bash
# List gates
reynard-code-quality quality-gate-mgmt --action list

# Test evaluation
reynard-code-quality quality-gate --environment development
```

## Default Quality Gates

The system comes with three pre-configured quality gates:

### Reynard Development Gate
- **Environment**: development
- **Conditions**:
  - No bugs (bugs = 0)
  - No vulnerabilities (vulnerabilities = 0)
  - Code smells < 50
  - Cyclomatic complexity < 500
  - Maintainability index > 60
  - Lines of code < 100,000

### Reynard Production Gate
- **Environment**: production
- **Conditions**:
  - No bugs (bugs = 0)
  - No vulnerabilities (vulnerabilities = 0)
  - Code smells < 20
  - Cyclomatic complexity < 200
  - Maintainability index > 80
  - Line coverage > 80%
  - Branch coverage > 70%

### Reynard Modularity Gate
- **Environment**: all
- **Conditions**:
  - Max file lines < 250
  - Max test file lines < 300
  - Average file complexity < 10

## Integration Examples

### TypeScript/JavaScript

```typescript
import { DatabaseQualityGateManager } from './DatabaseQualityGateManager';

const manager = new DatabaseQualityGateManager(
  'http://localhost:8000',
  'your-api-key'
);

// Evaluate quality gates
const metrics = {
  bugs: 0,
  vulnerabilities: 0,
  codeSmells: 25,
  cyclomaticComplexity: 150,
  maintainabilityIndex: 75
};

const results = await manager.evaluateQualityGates(metrics, 'development');

// Check results
const hasFailures = results.some(gate => gate.status === 'FAILED');
if (hasFailures) {
  console.error('Quality gates failed!');
  process.exit(1);
}
```

### Python

```python
import requests

# Evaluate quality gates
response = requests.post(
    'http://localhost:8000/api/quality-gates/evaluate',
    json={
        'metrics': {
            'bugs': 0,
            'vulnerabilities': 0,
            'codeSmells': 25
        },
        'environment': 'development'
    }
)

results = response.json()
has_failures = any(gate['status'] == 'FAILED' for gate in results)

if has_failures:
    print('Quality gates failed!')
    exit(1)
```

## Testing

### Run All Tests

```bash
# Frontend tests (Vitest)
cd packages/dev-tools/code-quality
npm test

# Backend tests (pytest)
cd backend
python -m pytest tests/test_quality_gates_*.py -v
```

### Test Coverage

```bash
# Frontend coverage
npm run test:coverage

# Backend coverage
python -m pytest --cov=app.services.quality_gates --cov-report=html
```

## Migration from JSON Files

The system automatically migrates from the old JSON file approach:

1. **Automatic Detection**: The system detects existing JSON files
2. **Data Import**: Quality gates are imported into the database
3. **Fallback Mode**: If backend is unavailable, falls back to local analysis
4. **Cleanup**: JSON files can be safely removed after migration

## Performance Considerations

- **Database Indexing**: All tables have appropriate indexes for performance
- **Connection Pooling**: SQLAlchemy connection pooling for efficiency
- **Caching**: Consider Redis caching for frequently accessed gates
- **Batch Operations**: Support for bulk gate operations
- **Pagination**: Large result sets are paginated

## Security

- **API Authentication**: Bearer token authentication
- **Input Validation**: All inputs validated via Pydantic models
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **Environment Isolation**: Separate gates for different environments
- **Audit Trail**: Complete evaluation history for compliance

## Monitoring and Observability

- **Health Checks**: Built-in health check endpoints
- **Metrics**: Evaluation statistics and trends
- **Logging**: Comprehensive logging throughout the system
- **Error Handling**: Graceful error handling and reporting
- **Performance Metrics**: Response time and throughput monitoring

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   ```bash
   # Check backend status
   curl http://localhost:8000/api/health
   
   # Verify environment variables
   echo $REYNARD_BACKEND_URL
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql $E2E_DATABASE_URL -c "SELECT 1;"
   
   # Run migrations
   python scripts/setup_quality_gates.py
   ```

3. **Quality Gate Evaluation Failures**
   ```bash
   # Check gate configuration
   reynard-code-quality quality-gate-mgmt --action show --gate-id reynard-development
   
   # View evaluation history
   reynard-code-quality quality-gate-mgmt --action history
   ```

### Debug Mode

```bash
# Enable debug logging
export REYNARD_DEBUG=true
reynard-code-quality quality-gate --environment development
```

## Contributing

1. **Code Style**: Follow existing patterns and conventions
2. **Testing**: Add tests for all new functionality
3. **Documentation**: Update documentation for API changes
4. **Migration**: Ensure backward compatibility
5. **Performance**: Consider performance impact of changes

## Roadmap

- [ ] **Web UI**: Browser-based gate management interface
- [ ] **Advanced Analytics**: Machine learning-based quality insights
- [ ] **Integration**: CI/CD pipeline integration
- [ ] **Notifications**: Slack/email notifications for gate failures
- [ ] **Templates**: Pre-built gate templates for common scenarios
- [ ] **Multi-tenancy**: Support for multiple projects/organizations

---

*This system represents a significant upgrade from JSON file-based configuration to a robust, scalable, enterprise-grade quality gates solution integrated with the Reynard ecosystem.*
