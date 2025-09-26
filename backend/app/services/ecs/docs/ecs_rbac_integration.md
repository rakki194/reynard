# 🔐 ECS RBAC Integration Documentation

## Overview

The ECS (Entity Component System) world has been successfully integrated with the unified RBAC (Role-Based Access Control) system, replacing isolated social role management with a comprehensive, enterprise-grade access control solution.

## Key Changes

### 1. Service Architecture

**Before:**

- Isolated social role management in ECS components
- No centralized access control for ECS operations
- Limited permission checking for world and simulation operations

**After:**

- Unified `RBACECSService` integrated with Gatekeeper RBAC system
- Centralized access control for all ECS operations
- Comprehensive permission checking for agents, groups, worlds, and simulations

### 2. Access Control Model

#### Social Roles → RBAC Roles Mapping

| ECS Social Role | New RBAC Role           | Description                                  |
| --------------- | ----------------------- | -------------------------------------------- |
| `LEADER`        | `ecs_social_leader`     | Can lead groups and influence others         |
| `FOLLOWER`      | `ecs_social_follower`   | Can follow leaders and participate in groups |
| `MEDIATOR`      | `ecs_social_mediator`   | Can resolve conflicts and mediate disputes   |
| `OUTCAST`       | `ecs_social_outcast`    | Limited social interactions                  |
| `NEUTRAL`       | `ecs_social_neutral`    | Standard social interactions                 |
| `INFLUENCER`    | `ecs_social_influencer` | Can influence others and spread ideas        |
| `MENTOR`        | `ecs_social_mentor`     | Can teach and guide others                   |
| `STUDENT`       | `ecs_social_student`    | Can learn from mentors                       |

#### Group Types → RBAC Roles Mapping

| ECS Group Type | New RBAC Role         | Description                              |
| -------------- | --------------------- | ---------------------------------------- |
| `WORK`         | `ecs_group_work`      | Can participate in work-related groups   |
| `SOCIAL`       | `ecs_group_social`    | Can participate in social groups         |
| `INTEREST`     | `ecs_group_interest`  | Can participate in interest-based groups |
| `FAMILY`       | `ecs_group_family`    | Can participate in family groups         |
| `COMMUNITY`    | `ecs_group_community` | Can participate in community groups      |

#### Social Status → RBAC Roles Mapping

| ECS Social Status | New RBAC Role              | Description                    |
| ----------------- | -------------------------- | ------------------------------ |
| `ACCEPTED`        | `ecs_status_accepted`      | Well-accepted in the community |
| `ISOLATED`        | `ecs_status_isolated`      | Limited community interaction  |
| `CONTROVERSIAL`   | `ecs_status_controversial` | Mixed community reception      |
| `INFLUENTIAL`     | `ecs_status_influential`   | High community influence       |
| `LEADER`          | `ecs_status_leader`        | Recognized community leader    |

### 3. Permission Structure

#### Social Interaction Permissions

- **`ecs:social:interact`** - Basic social interaction
- **`ecs:social:connect`** - Form social connections
- **`ecs:social:disconnect`** - Remove social connections
- **`ecs:social:influence`** - Influence other agents
- **`ecs:social:lead`** - Lead groups and communities
- **`ecs:social:mediate`** - Mediate conflicts
- **`ecs:social:mentor`** - Mentor other agents
- **`ecs:social:learn`** - Learn from others

#### Group Management Permissions

- **`ecs:group:join`** - Join groups
- **`ecs:group:leave`** - Leave groups
- **`ecs:group:create`** - Create new groups
- **`ecs:group:delete`** - Delete groups
- **`ecs:group:manage`** - Manage group settings
- **`ecs:group:view`** - View group information
- **`ecs:group:invite`** - Invite members to groups
- **`ecs:group:kick`** - Remove members from groups

#### World Management Permissions

- **`ecs:world:view`** - View world state and agents
- **`ecs:world:create`** - Create new worlds
- **`ecs:world:update`** - Update world settings
- **`ecs:world:delete`** - Delete worlds
- **`ecs:world:manage`** - Full world management

#### Simulation Control Permissions

- **`ecs:simulation:control`** - Control simulation parameters
- **`ecs:simulation:accelerate_time`** - Accelerate time in simulation
- **`ecs:simulation:pause`** - Pause simulation
- **`ecs:simulation:resume`** - Resume simulation
- **`ecs:simulation:reset`** - Reset simulation state
- **`ecs:simulation:configure`** - Configure simulation settings

### 4. Service Integration

#### RBACECSService

The new `RBACECSService` provides:

- **Social Permission Checking:** Integrated with Gatekeeper RBAC system
- **Group Permission Management:** Role-based group access control
- **World Access Control:** Comprehensive world-level permissions
- **Simulation Control:** Fine-grained simulation operation permissions
- **Caching:** Permission results cached for performance
- **Audit Logging:** All access attempts logged through unified system

#### Key Methods

```python
# Check social permissions
await rbac_service.check_social_permission(
    user_id="user123",
    agent_id="agent456",
    operation="interact",
    target_agent_id="agent789"
)

# Check group permissions
await rbac_service.check_group_permission(
    user_id="user123",
    group_id="group456",
    operation="join",
    agent_id="agent789"
)

# Check world permissions
await rbac_service.check_world_permission(
    user_id="user123",
    world_id="world456",
    operation="view"
)

# Assign social roles
await rbac_service.assign_social_role(
    user_id="user123",
    agent_id="agent456",
    social_role=SocialRole.LEADER,
    group_id="group789"
)
```

### 5. ECS System Integration

#### Updated SocialSystem

The ECS `SocialSystem` now includes:

- **RBAC Integration:** All social operations check RBAC permissions
- **Role Assignment:** Automatic RBAC role assignment for social roles
- **Group Management:** RBAC-controlled group creation and management
- **Leadership Changes:** RBAC role updates when leadership changes

#### Key Changes

```python
# Initialize RBAC service
await social_system.initialize_rbac()

# Create groups with RBAC checks
await social_system._create_social_group(
    leader=leader_entity,
    members=member_entities,
    user_id="user123"
)

# Leadership changes with RBAC updates
await social_system._change_group_leader(
    group=social_group,
    new_leader=new_leader_entity,
    user_id="user123"
)
```

### 6. Migration Process

#### Migration Script

The `ecs_rbac_migration.py` script handles:

1. **Role Creation:** Creates ECS-specific roles in the RBAC system
2. **Permission Creation:** Creates granular permissions for ECS operations
3. **Role-Permission Assignment:** Maps permissions to appropriate roles
4. **User Assignment:** Assigns default roles to existing users
5. **Social Role Migration:** Migrates existing social role configurations
6. **Group Management Migration:** Migrates group management to RBAC
7. **World Access Migration:** Migrates world access controls to RBAC

#### Running the Migration

```bash
# Run the migration script
python -m app.services.ecs.migrations.ecs_rbac_migration

# Or import and run programmatically
from app.services.ecs.migrations.ecs_rbac_migration import run_ecs_rbac_migration
await run_ecs_rbac_migration()
```

### 7. Configuration

#### Environment Variables

```bash
# Enable ECS RBAC integration
ECS_RBAC_ENABLED=true

# RBAC configuration
ECS_RBAC_CACHE_ENABLED=true
ECS_RBAC_CACHE_TTL=300  # 5 minutes
ECS_RBAC_AUDIT_ENABLED=true
ECS_RBAC_RETENTION_DAYS=365
```

#### Service Configuration

```python
config = {
    "ecs_rbac_enabled": True,
    "cache_enabled": True,
    "cache_ttl": 300,
    "audit_enabled": True,
    "retention_days": 365,
}
```

### 8. Monitoring and Metrics

#### ECS RBAC Metrics

The system tracks comprehensive metrics:

- `access_checks` - Total permission checks performed
- `access_granted` - Successful access attempts
- `access_denied` - Denied access attempts
- `cache_hits` - Cache hit rate for permission checks
- `cache_misses` - Cache miss rate
- `audit_events` - Total audit events logged
- `rbac_errors` - RBAC system errors
- `agent_operations` - Agent-related operations
- `group_operations` - Group-related operations
- `world_operations` - World-related operations
- `simulation_operations` - Simulation-related operations

#### Health Checks

```python
# Check ECS RBAC service health
health_status = await ecs_rbac_service.get_metrics()
print(health_status)
# {
#     "service": "ecs_rbac",
#     "metrics": {...},
#     "cache_size": 56,
#     "audit_logs_count": 1234,
#     "rbac_connected": true,
#     "rbac_ecs_service_available": true
# }
```

### 9. Security Features

#### Audit Logging

All ECS operations are now logged through the unified RBAC audit system:

- **Social Operations:** Interactions, connections, influence attempts
- **Group Operations:** Joins, leaves, creation, management
- **World Operations:** Access, creation, updates, deletion
- **Simulation Operations:** Control, time acceleration, pause/resume

#### Caching

Permission results are cached for performance:

- **Cache Key:** `{user_id}:{operation_type}:{operation}:{resource_id}`
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

1. **Always Pass User Context:** Include `user_id` in all ECS operations
2. **Handle Permission Errors:** Implement proper error handling for permission denials
3. **Use Appropriate Roles:** Choose the correct social role for operations
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
   - Review social role requirements

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

# Check ECS RBAC service health
health = await ecs_rbac_service.get_metrics()
print(health)

# Get audit logs
logs = await ecs_rbac_service.get_audit_logs(
    user_id="user123",
    hours=24
)
print(logs)
```

### 12. Future Enhancements

#### Planned Features

1. **Dynamic Social Roles:** Context-aware social role evaluation
2. **Advanced Group Management:** Hierarchical group structures
3. **Real-time Monitoring:** Live dashboards for ECS RBAC metrics
4. **Automated Role Assignment:** ML-based social role recommendations
5. **Compliance Reporting:** Automated compliance and audit reports

#### Integration Opportunities

1. **RAG System:** Unified access control for RAG operations
2. **Email System:** Consistent email access control
3. **Notes System:** Unified note sharing permissions
4. **MCP Tools:** Tool-specific access controls

## Conclusion

The ECS RBAC integration provides a robust, scalable, and secure access control system that unifies all ECS operations with the rest of the Reynard ecosystem. The migration maintains backward compatibility while providing enhanced security, performance, and audit capabilities.

For questions or issues, refer to the troubleshooting section or contact the development team.
