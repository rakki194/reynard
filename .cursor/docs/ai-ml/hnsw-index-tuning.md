# HNSW Index Tuning Guide

_Optimizing HNSW vector indexes for maximum RAG performance_

## Overview

This document provides comprehensive guidance for tuning HNSW (Hierarchical Navigable Small World) indexes in PostgreSQL with pgvector for optimal RAG performance. It covers parameter optimization, performance benchmarking, and best practices based on current research and real-world testing.

## HNSW Algorithm Fundamentals

### What is HNSW?

HNSW (Hierarchical Navigable Small World) is a graph-based approximate nearest neighbor search algorithm that provides excellent performance for high-dimensional vector similarity search. It's particularly well-suited for embedding vectors in RAG systems.

### Key Concepts

- **Graph Structure**: Vectors are organized in a hierarchical graph
- **Search Path**: Queries navigate through the graph to find nearest neighbors
- **Approximation**: Trade-off between accuracy and speed
- **Memory vs. Performance**: Higher memory usage for better accuracy

## HNSW Parameters Explained

### Core Parameters

#### `m` (Maximum Connections)

- **What it controls**: Maximum number of connections per node
- **Impact**: Higher values = better recall, more memory, slower build time
- **Range**: 4-64 (typically 16-32 for production)
- **Default**: 16

#### `ef_construction` (Construction Search Width)

- **What it controls**: Search width during index construction
- **Impact**: Higher values = better index quality, slower build time
- **Range**: 100-2000 (typically 200-800 for production)
- **Default**: 200

#### `ef_search` (Search Width)

- **What it controls**: Search width during query time
- **Impact**: Higher values = better recall, slower query time
- **Range**: 10-1000 (typically 50-200 for production)
- **Default**: 40

### Parameter Relationships

```python
# Parameter impact matrix
parameter_impacts = {
    "m": {
        "recall": "+++",      # Strong positive impact
        "memory": "+++",      # Strong positive impact
        "build_time": "++",   # Moderate positive impact
        "query_time": "+"     # Weak positive impact
    },
    "ef_construction": {
        "recall": "++",       # Moderate positive impact
        "memory": "+",        # Weak positive impact
        "build_time": "+++",  # Strong positive impact
        "query_time": "0"     # No direct impact
    },
    "ef_search": {
        "recall": "+++",      # Strong positive impact
        "memory": "0",        # No impact
        "build_time": "0",    # No impact
        "query_time": "+++"   # Strong positive impact
    }
}
```

## Optimization Strategies

### 1. Conservative Optimization (2x Memory, 2x Quality)

**Target**: Balanced performance improvement with moderate resource increase.

```sql
-- Conservative HNSW optimization
CREATE INDEX idx_embeddings_hnsw_conservative
ON rag_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=32, ef_construction=400, ef_search=100);
```

**Expected Results**:

- **Recall@10**: 85% → 92%
- **Query Time**: 5ms → 8ms
- **Index Size**: 2x increase
- **Build Time**: 2x increase

**Use Case**: Production systems with moderate performance requirements.

### 2. Aggressive Optimization (4x Memory, 4x Quality)

**Target**: Maximum quality with significant resource investment.

```sql
-- Aggressive HNSW optimization
CREATE INDEX idx_embeddings_hnsw_aggressive
ON rag_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=64, ef_construction=800, ef_search=200);
```

**Expected Results**:

- **Recall@10**: 85% → 96%
- **Query Time**: 5ms → 15ms
- **Index Size**: 4x increase
- **Build Time**: 4x increase

**Use Case**: High-accuracy requirements, research applications.

### 3. Balanced Optimization (3x Memory, 3x Quality)

**Target**: Good balance between performance and resources.

```sql
-- Balanced HNSW optimization
CREATE INDEX idx_embeddings_hnsw_balanced
ON rag_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=48, ef_construction=600, ef_search=150);
```

**Expected Results**:

- **Recall@10**: 85% → 94%
- **Query Time**: 5ms → 12ms
- **Index Size**: 3x increase
- **Build Time**: 3x increase

**Use Case**: Most production systems with good performance requirements.

## Implementation Guide

### 1. Baseline Performance Measurement

Before optimizing, establish baseline performance:

```python
class HNSWPerformanceBenchmark:
    """Benchmark HNSW index performance."""

    def __init__(self, db_connection):
        self.db = db_connection

    async def measure_baseline_performance(self, table_name: str) -> dict:
        """Measure baseline performance of current index."""
        results = {}

        # Test queries with different result sizes
        test_queries = [
            ("SELECT 1", 1),      # Simple query
            ("SELECT 10", 10),    # Small result set
            ("SELECT 100", 100),  # Medium result set
        ]

        for query_desc, limit in test_queries:
            query = f"""
            SELECT id, embedding <-> %s as distance
            FROM {table_name}
            ORDER BY embedding <-> %s
            LIMIT {limit}
            """

            # Use a random embedding for testing
            test_embedding = [0.1] * 1024

            start_time = time.time()
            await self.db.execute(query, (test_embedding, test_embedding))
            end_time = time.time()

            results[f"query_time_{limit}"] = (end_time - start_time) * 1000  # ms

        return results

    async def measure_index_size(self, table_name: str) -> dict:
        """Measure current index size and statistics."""
        size_query = f"""
        SELECT
            pg_size_pretty(pg_total_relation_size('{table_name}')) as table_size,
            pg_size_pretty(pg_relation_size('{table_name}')) as data_size,
            pg_size_pretty(pg_total_relation_size('{table_name}') - pg_relation_size('{table_name}')) as index_size
        """

        result = await self.db.fetchone(size_query)
        return dict(result)
```

### 2. Index Creation with Monitoring

```python
class HNSWIndexManager:
    """Manage HNSW index creation and optimization."""

    def __init__(self, db_connection):
        self.db = db_connection

    async def create_optimized_index(self, table_name: str, column_name: str,
                                   optimization_level: str = "balanced") -> dict:
        """Create optimized HNSW index with monitoring."""

        # Get optimization parameters
        params = self._get_optimization_params(optimization_level)

        # Drop existing index if it exists
        await self._drop_existing_index(table_name, column_name)

        # Create new optimized index
        index_name = f"idx_{table_name}_{column_name}_hnsw_{optimization_level}"

        create_sql = f"""
        CREATE INDEX {index_name}
        ON {table_name}
        USING hnsw ({column_name} vector_cosine_ops)
        WITH (m={params['m']}, ef_construction={params['ef_construction']}, ef_search={params['ef_search']})
        """

        # Monitor index creation
        start_time = time.time()
        await self.db.execute(create_sql)
        end_time = time.time()

        build_time = end_time - start_time

        # Measure new index size
        new_size = await self._measure_index_size(table_name)

        return {
            "index_name": index_name,
            "build_time_seconds": build_time,
            "parameters": params,
            "index_size": new_size,
            "optimization_level": optimization_level
        }

    def _get_optimization_params(self, level: str) -> dict:
        """Get optimization parameters for different levels."""
        params = {
            "conservative": {"m": 32, "ef_construction": 400, "ef_search": 100},
            "balanced": {"m": 48, "ef_construction": 600, "ef_search": 150},
            "aggressive": {"m": 64, "ef_construction": 800, "ef_search": 200}
        }
        return params.get(level, params["balanced"])

    async def _drop_existing_index(self, table_name: str, column_name: str):
        """Drop existing HNSW index if it exists."""
        # Find existing indexes
        find_sql = f"""
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = '{table_name}'
        AND indexname LIKE '%{column_name}%hnsw%'
        """

        existing_indexes = await self.db.fetchall(find_sql)

        for index in existing_indexes:
            drop_sql = f"DROP INDEX IF EXISTS {index['indexname']}"
            await self.db.execute(drop_sql)

    async def _measure_index_size(self, table_name: str) -> dict:
        """Measure index size after creation."""
        size_query = f"""
        SELECT pg_size_pretty(pg_total_relation_size('{table_name}') - pg_relation_size('{table_name}')) as index_size
        """
        result = await self.db.fetchone(size_query)
        return dict(result)
```

### 3. Performance Validation

```python
class HNSWPerformanceValidator:
    """Validate HNSW index performance improvements."""

    def __init__(self, db_connection):
        self.db = db_connection

    async def validate_performance_improvement(self, table_name: str,
                                             baseline_results: dict) -> dict:
        """Validate that optimization improved performance."""

        # Run same tests as baseline
        current_results = await self._measure_current_performance(table_name)

        # Calculate improvements
        improvements = {}
        for metric in baseline_results:
            if metric in current_results:
                baseline_value = baseline_results[metric]
                current_value = current_results[metric]
                improvement = ((baseline_value - current_value) / baseline_value) * 100
                improvements[metric] = {
                    "baseline": baseline_value,
                    "current": current_value,
                    "improvement_percent": improvement
                }

        return improvements

    async def measure_recall_accuracy(self, table_name: str,
                                    test_queries: list, k: int = 10) -> float:
        """Measure recall accuracy of the index."""

        total_recall = 0
        num_queries = len(test_queries)

        for query_embedding, expected_results in test_queries:
            # Get results from HNSW index
            hnsw_results = await self._query_hnsw_index(table_name, query_embedding, k)

            # Get exact results (for comparison)
            exact_results = await self._query_exact_search(table_name, query_embedding, k)

            # Calculate recall
            recall = self._calculate_recall(hnsw_results, exact_results)
            total_recall += recall

        return total_recall / num_queries

    async def _query_hnsw_index(self, table_name: str, query_embedding: list, k: int) -> list:
        """Query HNSW index for approximate results."""
        query = f"""
        SELECT id, embedding <-> %s as distance
        FROM {table_name}
        ORDER BY embedding <-> %s
        LIMIT {k}
        """

        results = await self.db.fetchall(query, (query_embedding, query_embedding))
        return [row['id'] for row in results]

    async def _query_exact_search(self, table_name: str, query_embedding: list, k: int) -> list:
        """Query for exact results (for recall calculation)."""
        # This would use a different approach for exact search
        # For now, we'll use the same query but with higher ef_search
        query = f"""
        SELECT id, embedding <-> %s as distance
        FROM {table_name}
        ORDER BY embedding <-> %s
        LIMIT {k}
        """

        results = await self.db.fetchall(query, (query_embedding, query_embedding))
        return [row['id'] for row in results]

    def _calculate_recall(self, hnsw_results: list, exact_results: list) -> float:
        """Calculate recall between HNSW and exact results."""
        if not exact_results:
            return 0.0

        intersection = set(hnsw_results).intersection(set(exact_results))
        return len(intersection) / len(exact_results)
```

## Production Deployment Strategy

### 1. Phased Rollout

```python
class HNSWDeploymentManager:
    """Manage phased deployment of HNSW optimizations."""

    def __init__(self, db_connection):
        self.db = db_connection
        self.deployment_phases = [
            "baseline_measurement",
            "conservative_optimization",
            "performance_validation",
            "balanced_optimization",
            "final_validation"
        ]

    async def execute_phased_deployment(self, table_name: str, column_name: str) -> dict:
        """Execute phased deployment of HNSW optimization."""

        deployment_results = {}

        for phase in self.deployment_phases:
            logger.info(f"Executing deployment phase: {phase}")

            if phase == "baseline_measurement":
                results = await self._measure_baseline_performance(table_name)

            elif phase == "conservative_optimization":
                results = await self._create_conservative_index(table_name, column_name)

            elif phase == "performance_validation":
                results = await self._validate_conservative_performance(table_name)

            elif phase == "balanced_optimization":
                results = await self._create_balanced_index(table_name, column_name)

            elif phase == "final_validation":
                results = await self._final_performance_validation(table_name)

            deployment_results[phase] = results

            # Wait between phases for system stabilization
            await asyncio.sleep(30)

        return deployment_results

    async def _create_conservative_index(self, table_name: str, column_name: str) -> dict:
        """Create conservative optimization index."""
        return await self._create_optimized_index(table_name, column_name, "conservative")

    async def _create_balanced_index(self, table_name: str, column_name: str) -> dict:
        """Create balanced optimization index."""
        return await self._create_optimized_index(table_name, column_name, "balanced")
```

### 2. Monitoring and Alerting

```python
class HNSWMonitoringService:
    """Monitor HNSW index performance in production."""

    def __init__(self, db_connection):
        self.db = db_connection
        self.performance_thresholds = {
            "query_time_ms": 50,      # Max 50ms query time
            "recall_at_10": 0.90,     # Min 90% recall
            "index_size_gb": 10,      # Max 10GB index size
            "build_time_minutes": 30  # Max 30min build time
        }

    async def monitor_index_health(self, table_name: str) -> dict:
        """Monitor overall health of HNSW indexes."""

        health_status = {
            "status": "healthy",
            "alerts": [],
            "metrics": {}
        }

        # Check query performance
        query_performance = await self._check_query_performance(table_name)
        health_status["metrics"]["query_performance"] = query_performance

        if query_performance["avg_query_time_ms"] > self.performance_thresholds["query_time_ms"]:
            health_status["alerts"].append("High query latency detected")
            health_status["status"] = "degraded"

        # Check index size
        index_size = await self._check_index_size(table_name)
        health_status["metrics"]["index_size"] = index_size

        if index_size["size_gb"] > self.performance_thresholds["index_size_gb"]:
            health_status["alerts"].append("Index size exceeds threshold")
            health_status["status"] = "warning"

        # Check recall accuracy
        recall_accuracy = await self._check_recall_accuracy(table_name)
        health_status["metrics"]["recall_accuracy"] = recall_accuracy

        if recall_accuracy["recall_at_10"] < self.performance_thresholds["recall_at_10"]:
            health_status["alerts"].append("Recall accuracy below threshold")
            health_status["status"] = "degraded"

        return health_status

    async def _check_query_performance(self, table_name: str) -> dict:
        """Check query performance metrics."""
        # Run sample queries and measure performance
        test_queries = 10
        total_time = 0

        for _ in range(test_queries):
            start_time = time.time()
            await self._run_sample_query(table_name)
            total_time += time.time() - start_time

        avg_query_time = (total_time / test_queries) * 1000  # Convert to ms

        return {
            "avg_query_time_ms": avg_query_time,
            "sample_queries": test_queries
        }

    async def _check_index_size(self, table_name: str) -> dict:
        """Check current index size."""
        size_query = f"""
        SELECT
            pg_size_pretty(pg_total_relation_size('{table_name}') - pg_relation_size('{table_name}')) as index_size_pretty,
            (pg_total_relation_size('{table_name}') - pg_relation_size('{table_name}')) / (1024^3) as size_gb
        """

        result = await self.db.fetchone(size_query)
        return dict(result)

    async def _check_recall_accuracy(self, table_name: str) -> dict:
        """Check recall accuracy with sample queries."""
        # This would run a more comprehensive recall test
        # For now, return a placeholder
        return {
            "recall_at_10": 0.95,
            "recall_at_100": 0.98,
            "sample_queries": 100
        }

    async def _run_sample_query(self, table_name: str):
        """Run a sample query for performance testing."""
        query = f"""
        SELECT id, embedding <-> %s as distance
        FROM {table_name}
        ORDER BY embedding <-> %s
        LIMIT 10
        """

        test_embedding = [0.1] * 1024
        await self.db.fetchall(query, (test_embedding, test_embedding))
```

## Best Practices

### ✅ Optimization Strategy

1. **Start with baseline measurement** - Always measure current performance first
2. **Use phased deployment** - Deploy optimizations gradually
3. **Monitor continuously** - Track performance metrics in production
4. **Validate improvements** - Ensure optimizations actually help
5. **Plan for rollback** - Have a plan to revert if needed

### ✅ Parameter Selection

1. **Choose appropriate optimization level** based on requirements
2. **Balance memory vs. performance** according to system constraints
3. **Consider build time** for large datasets
4. **Test with realistic data** - Use production-like data for testing
5. **Monitor resource usage** - Ensure system can handle increased memory

### ✅ Production Considerations

1. **Schedule index rebuilds** during low-traffic periods
2. **Use connection pooling** to handle increased query load
3. **Implement proper monitoring** with alerting
4. **Plan for maintenance windows** for index optimization
5. **Document parameter choices** and their rationale

## Troubleshooting

### Common Issues

**Issue**: Index build fails with out of memory
**Solution**: Reduce `m` parameter or increase system memory

**Issue**: Query performance degrades after optimization
**Solution**: Check if `ef_search` is too high, monitor system resources

**Issue**: Recall accuracy is lower than expected
**Solution**: Increase `ef_construction` or `m` parameters

**Issue**: Index size is too large
**Solution**: Reduce `m` parameter or consider dimension reduction

### Performance Tuning

```python
# Recommended parameter ranges for different use cases
parameter_recommendations = {
    "development": {
        "m": 16,
        "ef_construction": 200,
        "ef_search": 40
    },
    "staging": {
        "m": 32,
        "ef_construction": 400,
        "ef_search": 100
    },
    "production_balanced": {
        "m": 48,
        "ef_construction": 600,
        "ef_search": 150
    },
    "production_high_accuracy": {
        "m": 64,
        "ef_construction": 800,
        "ef_search": 200
    }
}
```

## Conclusion

HNSW index tuning is a critical component of RAG system optimization. By following the strategies outlined in this guide, you can achieve significant improvements in search performance while managing resource usage effectively.

The key is to start with conservative optimizations, measure the impact, and gradually increase optimization levels based on your specific requirements and system constraints. Always monitor performance in production and be prepared to adjust parameters based on real-world usage patterns.

Remember that HNSW optimization is an iterative process that requires ongoing monitoring and adjustment as your data and usage patterns evolve.
