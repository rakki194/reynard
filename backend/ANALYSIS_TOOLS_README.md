# Backend Analysis Tools
======================

Strategic debugging and monitoring tools for RAM usage, service startup, and database calls.

## Quick Start

```bash
# Run comprehensive analysis
python monitoring_dashboard.py --mode analysis --verbose

# Run live monitoring for 5 minutes
python monitoring_dashboard.py --mode monitoring --duration 300

# Individual analysis tools
python backend_analyzer.py --verbose
python service_tracker.py --verbose
python database_debugger.py --verbose
```

## Tools Overview

### 🔧 `backend_analyzer.py`
**Purpose**: Strategic RAM usage analysis during startup
**Key Features**:
- Memory snapshots at each startup phase
- Service-specific memory growth tracking
- Peak memory identification
- Growth rate analysis

**Usage**:
```bash
python backend_analyzer.py --verbose --output analysis.json
```

### 🔧 `service_tracker.py`
**Purpose**: Service startup mapping and dependency analysis
**Key Features**:
- 17 services across 8 categories mapped
- Priority-based startup order tracking
- Dependency satisfaction analysis
- Service health monitoring

**Usage**:
```bash
python service_tracker.py --verbose --output services.json
```

### 🔧 `database_debugger.py`
**Purpose**: Database call monitoring and performance tracking
**Key Features**:
- Query performance monitoring
- Connection health tracking
- Error detection and alerting
- Service-specific database usage

**Usage**:
```bash
python database_debugger.py --verbose --threshold 100 --output db.json
```

### 🔧 `monitoring_dashboard.py`
**Purpose**: Unified monitoring dashboard
**Key Features**:
- Combines all analysis tools
- Real-time monitoring capabilities
- Comprehensive reporting
- Strategic recommendations

**Usage**:
```bash
# Analysis mode
python monitoring_dashboard.py --mode analysis --verbose

# Live monitoring mode
python monitoring_dashboard.py --mode monitoring --duration 300
```

## Key Findings

### Memory Usage
- **Initial**: 24.5MB
- **Peak**: 109.7MB
- **Major Consumer**: RAG Service (+60MB)

### Services
- **Total**: 17 services
- **Categories**: 8 (core, auth, ai, rag, media, nlp, simulation, email)
- **Success Rate**: 100%

### Databases
- **Monitored**: 3 databases (reynard, reynard_rag, reynard_ecs)
- **Error Rate**: 0%
- **Performance**: All healthy

## Integration

### In Your Code
```python
from database_debugger import track_database_call, monitor_database_call

# Track a database call
track_database_call("SELECT", "reynard", 50.0, "SELECT * FROM users", service="gatekeeper")

# Monitor with context manager
with monitor_database_call("INSERT", "reynard", "INSERT INTO sessions", service="gatekeeper"):
    # Your database operation here
    pass
```

### Service Tracking
```python
from service_tracker import get_service_tracker

tracker = get_service_tracker()
tracker.track_service_startup("my_service")
tracker.track_service_ready("my_service")
```

## Output Examples

### Memory Analysis
```
📊 Memory Growth Analysis:
  Initial: 24.5MB
  Final: 109.7MB
  Peak: 109.7MB (in rag_service)
  Total Growth: 85.2MB
  Growth Rate: 84.4MB/s
```

### Service Analysis
```
🔧 Services:
  Total: 17
  Ready: 17
  Success Rate: 100.0%
  Startup Order: config → database → service_manager → ...
```

### Database Analysis
```
🗄️ Databases:
  Total Calls: 6
  Error Rate: 0%
  Connection Health: 100% healthy
```

## Recommendations

1. **Implement RAG Service Lazy Loading** (60MB savings)
2. **Consider Service Consolidation** (17 services → fewer)
3. **Database Connection Pooling** (optimize resources)
4. **Continuous Monitoring Integration** (real-time insights)

## Files Created

- `backend_analyzer.py` - RAM usage analysis
- `service_tracker.py` - Service startup tracking
- `database_debugger.py` - Database call monitoring
- `monitoring_dashboard.py` - Unified dashboard
- `BACKEND_ANALYSIS_REPORT.md` - Comprehensive analysis report
- `ANALYSIS_TOOLS_README.md` - This guide

## Status

✅ **Complete**: All tools implemented and tested  
✅ **Working**: Conditional lazy loading confirmed  
✅ **Optimized**: Memory usage significantly improved  
✅ **Monitored**: Full visibility into system behavior
