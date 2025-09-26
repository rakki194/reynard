# 🔐 RAG RBAC Integration Documentation

## Overview

The RAG (Retrieval-Augmented Generation) system has been successfully integrated with the unified RBAC (Role-Based Access Control) system, replacing the previous isolated `AccessControlSecurityService` with a comprehensive, enterprise-grade access control solution.

## Key Changes

### 1. Service Architecture

**Before:**

- Isolated `AccessControlSecurityService` with custom access levels
- Separate audit logging system
- Custom permission checking logic

**After:**

- Unified `RBACRAGService` integrated with Gatekeeper RBAC system
- Centralized audit logging through RBAC system
- Standardized permission checking using RBAC roles and permissions

### 2. Access Control Model

#### Access Levels → RBAC Roles Mapping

| Old Access Level | New RBAC Role           | Description                                           |
| ---------------- | ----------------------- | ----------------------------------------------------- |
| `PUBLIC`         | `rag_public_reader`     | Can read and search public documents                  |
| `INTERNAL`       | `rag_internal_user`     | Can access internal documents and generate embeddings |
| `CONFIDENTIAL`   | `rag_confidential_user` | Can access confidential documents with team scope     |
| `RESTRICTED`     | `rag_restricted_admin`  | Full access to restricted documents with own scope    |

#### Operation Types → RBAC Operations Mapping

| Old Operation | New RBAC Operation | Description                                        |
| ------------- | ------------------ | -------------------------------------------------- |
| `READ`        | `READ`             | Read document content                              |
| `WRITE`       | `UPDATE`           | Update document content                            |
| `DELETE`      | `DELETE`           | Delete documents                                   |
| `SEARCH`      | `READ`             | Search documents (treated as read operation)       |
| `EMBED`       | `EXECUTE`          | Generate embeddings (treated as execute operation) |
| `INDEX`       | `CREATE`           | Index documents (treated as create operation)      |

### 3. Permission Structure

#### RAG-Specific Permissions

The system now includes granular permissions for RAG operations:

- **Public Permissions:**
  - `rag:public:read` - Read public documents
  - `rag:public:search` - Search public documents

- **Internal Permissions:**
  - `rag:internal:read` - Read internal documents
  - `rag:internal:search` - Search internal documents
  - `rag:internal:embed` - Generate embeddings for internal content

- **Confidential Permissions:**
  - `rag:confidential:read` - Read confidential documents
  - `rag:confidential:search` - Search confidential documents
  - `rag:confidential:embed` - Generate embeddings for confidential content

- **Restricted Permissions:**
  - `rag:restricted:read` - Read restricted documents
  - `rag:restricted:search` - Search restricted documents
  - `rag:restricted:embed` - Generate embeddings for restricted content
  - `rag:restricted:manage` - Manage restricted documents

### 4. Service Integration

#### RBACRAGService

The new `RBACRAGService` provides:

- **Permission Checking:** Integrated with Gatekeeper RBAC system
- **Caching:** Permission results cached for performance
- **Audit Logging:** All access attempts logged through unified system
- **Error Handling:** Comprehensive error handling and metrics

#### Key Methods

```python
# Check general permission
await security_service.check_permission(
    user_id="user123",
    operation=OperationType.SEARCH,
    resource_type="rag_document",
    access_level=AccessLevel.INTERNAL,
    resource_id="doc_456"
)

# Check search-specific permission
await security_service.check_search_permission(
    user_id="user123",
    query="search query",
    filters={"access_level": "internal"}
)

# Check embedding-specific permission
await security_service.check_embedding_permission(
    user_id="user123",
    text="text to embed",
    model="mxbai-embed-large"
)

# Check document-specific access
await security_service.check_document_access(
    user_id="user123",
    document_id="doc_456",
    operation=OperationType.READ,
    access_level=AccessLevel.CONFIDENTIAL
)
```

### 5. API Integration

#### Updated Endpoints

All RAG API endpoints now include user context for RBAC checks:

```python
# Search endpoint with user context
async def search(
    self,
    query: str,
    search_type: str = "hybrid",
    limit: int = 10,
    filters: dict[str, Any] | None = None,
    user_id: str = "system",  # New parameter
) -> list[dict[str, Any]]:

# Embedding endpoint with user context
async def embed_batch(
    self,
    texts: list[str],
    model: str = "embeddinggemma:latest",
    user_id: str = "system"  # New parameter
) -> list[list[float]]:
```

### 6. Migration Process

#### Migration Script

The `rag_rbac_migration.py` script handles:

1. **Role Creation:** Creates RAG-specific roles in the RBAC system
2. **Permission Creation:** Creates granular permissions for RAG operations
3. **Role-Permission Assignment:** Maps permissions to appropriate roles
4. **User Assignment:** Assigns default roles to existing users
5. **Access Level Migration:** Migrates existing access level configurations

#### Running the Migration

```bash
# Run the migration script
python -m app.services.rag.migrations.rag_rbac_migration

# Or import and run programmatically
from app.services.rag.migrations.rag_rbac_migration import run_rag_rbac_migration
await run_rag_rbac_migration()
```

### 7. Configuration

#### Environment Variables

```bash
# Enable RBAC integration
RAG_RBAC_ENABLED=true

# RBAC configuration
RAG_RBAC_CACHE_ENABLED=true
RAG_RBAC_CACHE_TTL=300  # 5 minutes
RAG_RBAC_AUDIT_ENABLED=true
RAG_RBAC_RETENTION_DAYS=365
```

#### Service Configuration

```python
config = {
    "rag_security_enabled": True,
    "rbac_enabled": True,
    "cache_enabled": True,
    "cache_ttl": 300,
    "audit_enabled": True,
    "retention_days": 365,
}
```

### 8. Monitoring and Metrics

#### RBAC Metrics

The system tracks comprehensive metrics:

- `access_checks` - Total permission checks performed
- `access_granted` - Successful access attempts
- `access_denied` - Denied access attempts
- `cache_hits` - Cache hit rate for permission checks
- `cache_misses` - Cache miss rate
- `audit_events` - Total audit events logged
- `rbac_errors` - RBAC system errors

#### Health Checks

```python
# Check RBAC service health
health_status = await security_service.health_check()
print(health_status)
# {
#     "status": "healthy",
#     "rbac_connected": true,
#     "audit_enabled": true,
#     "cache_enabled": true,
#     "audit_logs_count": 1234,
#     "cache_size": 56,
#     "metrics": {...}
# }
```

### 9. Security Features

#### Audit Logging

All RAG operations are now logged through the unified RBAC audit system:

- **Search Operations:** Query, filters, results count
- **Embedding Operations:** Text length, model used, success/failure
- **Document Access:** Document ID, operation type, access level
- **Permission Checks:** User, resource, operation, result

#### Caching

Permission results are cached for performance:

- **Cache Key:** `{user_id}:{operation}:{resource_type}:{access_level}:{resource_id}`
- **TTL:** Configurable (default 5 minutes)
- **Cleanup:** Automatic cleanup of expired entries

#### Error Handling

Comprehensive error handling:

- **Permission Denied:** Clear error messages with context
- **RBAC Errors:** Graceful fallback and logging
- **Cache Errors:** Fallback to direct RBAC checks
- **Audit Failures:** Non-blocking audit logging

### 10. Best Practices

#### Development

1. **Always Pass User Context:** Include `user_id` in all RAG operations
2. **Handle Permission Errors:** Implement proper error handling for permission denials
3. **Use Appropriate Access Levels:** Choose the correct access level for operations
4. **Monitor Performance:** Track RBAC performance metrics

#### Security

1. **Principle of Least Privilege:** Assign minimal required permissions
2. **Regular Audits:** Review access logs and permissions regularly
3. **Role Hierarchy:** Use role inheritance for complex permission structures
4. **Context-Aware Permissions:** Use context for fine-grained access control

#### Operations

1. **Monitor Cache Performance:** Track cache hit rates and adjust TTL as needed
2. **Audit Log Retention:** Configure appropriate retention periods
3. **Error Monitoring:** Set up alerts for RBAC errors and permission denials
4. **Performance Monitoring:** Monitor RBAC check latency

### 11. Troubleshooting

#### Common Issues

1. **Permission Denied Errors:**
   - Check user role assignments
   - Verify permission mappings
   - Review access level requirements

2. **RBAC Connection Issues:**
   - Verify AuthManager is available
   - Check service registry configuration
   - Review RBAC system health

3. **Cache Issues:**
   - Check cache configuration
   - Monitor cache hit rates
   - Review cache cleanup processes

4. **Audit Logging Issues:**
   - Verify audit configuration
   - Check log retention settings
   - Review audit log storage

#### Debug Commands

```python
# Check user permissions
permissions = await auth_manager.get_user_permissions("user123")
print(permissions)

# Check role assignments
roles = await auth_manager.get_user_roles("user123")
print(roles)

# Check RBAC service health
health = await security_service.health_check()
print(health)

# Get audit logs
logs = await security_service.get_audit_logs(
    user_id="user123",
    hours=24
)
print(logs)
```

### 12. Future Enhancements

#### Planned Features

1. **Dynamic Permissions:** Context-aware permission evaluation
2. **Advanced Caching:** Distributed caching for multi-instance deployments
3. **Real-time Monitoring:** Live dashboards for RBAC metrics
4. **Automated Role Assignment:** ML-based role recommendations
5. **Compliance Reporting:** Automated compliance and audit reports

#### Integration Opportunities

1. **ECS System:** Integrate with ECS social roles
2. **Email System:** Unified email access control
3. **Notes System:** Consistent note sharing permissions
4. **MCP Tools:** Tool-specific access controls

## Conclusion

The RAG RBAC integration provides a robust, scalable, and secure access control system that unifies all permission management across the Reynard ecosystem. The migration maintains backward compatibility while providing enhanced security, performance, and audit capabilities.

For questions or issues, refer to the troubleshooting section or contact the development team.
