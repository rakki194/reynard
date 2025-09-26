# Advanced RBAC Features Documentation

## Overview

The Advanced RBAC (Role-Based Access Control) system extends the core RBAC functionality with sophisticated features for enterprise-grade access control. This document provides comprehensive documentation for all advanced features.

## Table of Contents

1. [Conditional Permissions](#conditional-permissions)
2. [Dynamic Role Assignment](#dynamic-role-assignment)
3. [Role Delegation](#role-delegation)
4. [Permission Inheritance](#permission-inheritance)
5. [Permission Overrides](#permission-overrides)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Conditional Permissions

Conditional permissions allow you to apply additional access controls based on time, IP address, device type, and other contextual factors.

### Time-Based Permissions

Control access based on time constraints:

```python
from gatekeeper.models.rbac import TimeCondition
from datetime import datetime, timezone

# Allow access only during business hours (9 AM - 5 PM, Monday-Friday)
time_condition = TimeCondition(
    start_time=datetime(2024, 1, 1, 9, 0, 0, tzinfo=timezone.utc),
    end_time=datetime(2024, 1, 1, 17, 0, 0, tzinfo=timezone.utc),
    days_of_week=[0, 1, 2, 3, 4],  # Monday to Friday
    hours_of_day=list(range(9, 17))  # 9 AM to 5 PM
)
```

### IP-Based Permissions

Control access based on IP addresses and CIDR blocks:

```python
from gatekeeper.models.rbac import IPCondition

# Allow access only from specific IPs and networks
ip_condition = IPCondition(
    allowed_ips=["192.168.1.100", "10.0.0.50"],
    blocked_ips=["192.168.1.200"],
    allowed_cidrs=["192.168.1.0/24", "10.0.0.0/8"],
    blocked_cidrs=["192.168.2.0/24"]
)
```

### Device-Based Permissions

Control access based on device type and user agent:

```python
from gatekeeper.models.rbac import DeviceCondition

# Allow access only from desktop/laptop with specific browsers
device_condition = DeviceCondition(
    allowed_device_types=["desktop", "laptop"],
    allowed_user_agents=["Chrome", "Firefox"],
    blocked_user_agents=["Bot", "Crawler"],
    require_device_verification=False
)
```

### Creating Conditional Permissions

```python
from gatekeeper.services.advanced_rbac_service import AdvancedRBACService

# Create conditional permission
conditional_permission = await advanced_rbac_service.create_conditional_permission(
    permission_id="note:read",
    time_conditions=time_condition,
    ip_conditions=ip_condition,
    device_conditions=device_condition
)
```

### Checking Conditional Permissions

```python
# Check permission with context
result = await advanced_rbac_service.check_conditional_permission(
    username="john_doe",
    resource_type="note",
    resource_id="note_123",
    operation="read",
    client_ip="192.168.1.100",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    device_type="desktop"
)

if result.granted and result.conditions_met:
    print("Access granted with all conditions met")
else:
    print(f"Access denied: {result.reason}")
```

## Dynamic Role Assignment

Dynamic role assignment allows automatic role assignment based on rules and triggers.

### Role Assignment Rules

Create rules that automatically assign roles based on conditions:

```python
from gatekeeper.models.rbac import RoleAssignmentRule

# Rule to assign "premium_user" role to users created after a certain date
rule = await advanced_rbac_service.create_role_assignment_rule(
    name="premium_user_auto_assignment",
    trigger_type="user_created",
    target_role_id="premium_user",
    conditions={
        "user_created_after": "2024-01-01T00:00:00Z",
        "user_metadata": {
            "subscription_type": "premium"
        }
    },
    description="Automatically assign premium role to new premium subscribers"
)
```

### Trigger Types

- **`user_created`**: Triggered when a new user is created
- **`time_based`**: Triggered at specific times
- **`condition_met`**: Triggered when specific conditions are met

### Processing Rules

```python
# Process rules for a user when they are created
assigned_roles = await advanced_rbac_service.process_role_assignment_rules(
    username="new_user",
    trigger_type="user_created"
)

print(f"Auto-assigned roles: {assigned_roles}")
```

### Rule Conditions

Rules can evaluate various conditions:

```python
conditions = {
    # Time-based conditions
    "user_created_after": "2024-01-01T00:00:00Z",
    "user_created_before": "2024-12-31T23:59:59Z",

    # Role-based conditions
    "user_role": "basic_user",

    # Metadata-based conditions
    "user_metadata": {
        "department": "engineering",
        "level": "senior"
    }
}
```

## Role Delegation

Role delegation allows users to temporarily delegate their roles to other users.

### Delegating Roles

```python
# Delegate "project_manager" role for 7 days
success = await advanced_rbac_service.delegate_role(
    delegator_username="alice_manager",
    delegatee_username="bob_developer",
    role_name="project_manager",
    expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    context={
        "type": "project",
        "id": "project_123",
        "reason": "Alice is on vacation"
    }
)
```

### Revoking Delegations

```python
# Revoke a delegation
success = await advanced_rbac_service.revoke_delegation("delegation_123")
```

### Delegation Features

- **Temporary**: Delegations can have expiration dates
- **Contextual**: Delegations can be limited to specific contexts (projects, teams, etc.)
- **Auditable**: All delegation activities are logged
- **Revocable**: Delegations can be revoked at any time

## Permission Inheritance

Permission inheritance allows roles to inherit permissions from parent roles in a hierarchy.

### Role Hierarchy

Create hierarchical relationships between roles:

```python
from gatekeeper.models.rbac import RoleHierarchy

# Create hierarchy: admin -> manager -> user
hierarchy = await advanced_rbac_service.create_role_hierarchy(
    parent_role_id="admin",
    child_role_id="manager",
    inheritance_type="full"  # Inherit all permissions
)

hierarchy = await advanced_rbac_service.create_role_hierarchy(
    parent_role_id="manager",
    child_role_id="user",
    inheritance_type="partial",  # Inherit only specific permissions
    inherited_permissions=["note:read", "note:create"],
    excluded_permissions=["note:delete"]
)
```

### Inheritance Types

- **`full`**: Inherit all permissions from parent (except excluded ones)
- **`partial`**: Inherit only specified permissions
- **`none`**: No inheritance

### Getting Inherited Permissions

```python
# Get all permissions for a role (including inherited)
permissions = await advanced_rbac_service.get_inherited_permissions("user")

for permission in permissions:
    print(f"Permission: {permission['name']} - {permission['resource_type']}:{permission['operation']}")
```

## Permission Overrides

Permission overrides allow you to grant, deny, or modify permissions for specific roles.

### Creating Overrides

```python
from gatekeeper.models.rbac import PermissionOverride

# Deny a specific permission for a role
override = await advanced_rbac_service.create_permission_override(
    role_id="user",
    permission_id="note:delete",
    override_type="deny",
    override_conditions={
        "context": "sensitive_notes",
        "reason": "Users cannot delete sensitive notes"
    }
)

# Grant a permission that would normally be denied
override = await advanced_rbac_service.create_permission_override(
    role_id="user",
    permission_id="admin:manage",
    override_type="grant",
    override_conditions={
        "context": "emergency_access",
        "expires_at": "2024-12-31T23:59:59Z"
    }
)
```

### Override Types

- **`grant`**: Grant permission even if not normally allowed
- **`deny`**: Deny permission even if normally allowed
- **`modify`**: Modify permission conditions

### Checking Permissions with Inheritance and Overrides

```python
# Check permission including inheritance and overrides
result = await advanced_rbac_service.check_permission_with_inheritance(
    username="john_doe",
    resource_type="note",
    resource_id="note_123",
    operation="delete"
)

if result.granted:
    print("Permission granted")
else:
    print(f"Permission denied: {result.reason}")
```

## API Reference

### Conditional Permissions

#### Create Conditional Permission

```http
POST /api/v1/advanced-rbac/conditional-permissions
Content-Type: application/json

{
  "permission_id": "note:read",
  "time_conditions": {
    "start_time": "2024-01-01T09:00:00Z",
    "end_time": "2024-01-01T17:00:00Z",
    "days_of_week": [0, 1, 2, 3, 4],
    "hours_of_day": [9, 10, 11, 12, 13, 14, 15, 16]
  },
  "ip_conditions": {
    "allowed_ips": ["192.168.1.100"],
    "allowed_cidrs": ["192.168.1.0/24"]
  },
  "device_conditions": {
    "allowed_device_types": ["desktop", "laptop"],
    "allowed_user_agents": ["Chrome", "Firefox"]
  }
}
```

#### Check Conditional Permission

```http
POST /api/v1/advanced-rbac/permissions/check
Content-Type: application/json

{
  "username": "john_doe",
  "resource_type": "note",
  "resource_id": "note_123",
  "operation": "read",
  "client_ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "device_type": "desktop"
}
```

### Dynamic Role Assignment

#### Create Role Assignment Rule

```http
POST /api/v1/advanced-rbac/role-assignment-rules
Content-Type: application/json

{
  "name": "premium_user_auto_assignment",
  "description": "Auto-assign premium role to new premium subscribers",
  "trigger_type": "user_created",
  "target_role_id": "premium_user",
  "conditions": {
    "user_created_after": "2024-01-01T00:00:00Z",
    "user_metadata": {
      "subscription_type": "premium"
    }
  }
}
```

#### Process Role Assignment Rules

```http
POST /api/v1/advanced-rbac/role-assignment-rules/process/john_doe?trigger_type=user_created
```

### Role Delegation

#### Delegate Role

```http
POST /api/v1/advanced-rbac/role-delegations
Content-Type: application/json

{
  "delegator_username": "alice_manager",
  "delegatee_username": "bob_developer",
  "role_name": "project_manager",
  "expires_at": "2024-12-31T23:59:59Z",
  "context": {
    "type": "project",
    "id": "project_123",
    "reason": "Alice is on vacation"
  }
}
```

#### Revoke Delegation

```http
DELETE /api/v1/advanced-rbac/role-delegations/delegation_123
```

### Permission Inheritance

#### Create Role Hierarchy

```http
POST /api/v1/advanced-rbac/role-hierarchies
Content-Type: application/json

{
  "parent_role_id": "admin",
  "child_role_id": "manager",
  "inheritance_type": "full"
}
```

#### Get Inherited Permissions

```http
GET /api/v1/advanced-rbac/role-hierarchies/manager/inherited-permissions
```

### Permission Overrides

#### Create Permission Override

```http
POST /api/v1/advanced-rbac/permission-overrides
Content-Type: application/json

{
  "role_id": "user",
  "permission_id": "note:delete",
  "override_type": "deny",
  "override_conditions": {
    "context": "sensitive_notes",
    "reason": "Users cannot delete sensitive notes"
  }
}
```

## Usage Examples

### Example 1: Time-Restricted Access

```python
# Create a permission that only works during business hours
time_condition = TimeCondition(
    days_of_week=[0, 1, 2, 3, 4],  # Monday to Friday
    hours_of_day=list(range(9, 17))  # 9 AM to 5 PM
)

await advanced_rbac_service.create_conditional_permission(
    permission_id="sensitive_data:read",
    time_conditions=time_condition
)
```

### Example 2: IP-Whitelisted Admin Access

```python
# Only allow admin access from office IPs
ip_condition = IPCondition(
    allowed_cidrs=["192.168.1.0/24", "10.0.0.0/8"]
)

await advanced_rbac_service.create_conditional_permission(
    permission_id="admin:manage",
    ip_conditions=ip_condition
)
```

### Example 3: Automatic Role Assignment

```python
# Auto-assign "senior_developer" role to users with 5+ years experience
rule = await advanced_rbac_service.create_role_assignment_rule(
    name="senior_developer_auto_assignment",
    trigger_type="condition_met",
    target_role_id="senior_developer",
    conditions={
        "user_metadata": {
            "experience_years": {"$gte": 5}
        }
    }
)
```

### Example 4: Temporary Role Delegation

```python
# Delegate project management role for a week
success = await advanced_rbac_service.delegate_role(
    delegator_username="project_manager",
    delegatee_username="senior_developer",
    role_name="project_manager",
    expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    context={"project_id": "urgent_project_123"}
)
```

### Example 5: Role Hierarchy with Selective Inheritance

```python
# Create hierarchy: admin -> manager -> user
# Manager inherits most admin permissions
await advanced_rbac_service.create_role_hierarchy(
    parent_role_id="admin",
    child_role_id="manager",
    inheritance_type="partial",
    inherited_permissions=[
        "user:read", "user:update", "project:create", "project:read", "project:update"
    ],
    excluded_permissions=["user:delete", "system:manage"]
)

# User inherits basic permissions from manager
await advanced_rbac_service.create_role_hierarchy(
    parent_role_id="manager",
    child_role_id="user",
    inheritance_type="partial",
    inherited_permissions=["project:read", "user:read"]
)
```

## Best Practices

### 1. Conditional Permissions

- **Use specific time ranges**: Avoid overly broad time conditions
- **Test IP conditions**: Ensure CIDR blocks are correctly configured
- **Device verification**: Use device verification for sensitive operations
- **Fallback permissions**: Always have fallback permissions for critical operations

### 2. Dynamic Role Assignment

- **Clear conditions**: Make rule conditions explicit and well-documented
- **Test rules**: Thoroughly test rules before deploying to production
- **Monitor assignments**: Set up monitoring for automatic role assignments
- **Review regularly**: Regularly review and update assignment rules

### 3. Role Delegation

- **Set expiration dates**: Always set reasonable expiration dates for delegations
- **Use context**: Provide clear context for delegations
- **Monitor usage**: Monitor delegated role usage
- **Revoke promptly**: Revoke delegations when no longer needed

### 4. Permission Inheritance

- **Keep hierarchies simple**: Avoid overly complex role hierarchies
- **Document inheritance**: Clearly document what permissions are inherited
- **Test inheritance**: Test permission inheritance thoroughly
- **Use overrides sparingly**: Use permission overrides only when necessary

### 5. Security Considerations

- **Principle of least privilege**: Grant minimum necessary permissions
- **Regular audits**: Conduct regular permission audits
- **Monitor access**: Monitor all access attempts and permission checks
- **Secure defaults**: Use secure default configurations

## Troubleshooting

### Common Issues

#### 1. Conditional Permissions Not Working

**Problem**: Time-based or IP-based conditions are not being enforced.

**Solutions**:

- Check timezone settings in time conditions
- Verify IP address format and CIDR notation
- Ensure client IP is being passed correctly
- Check device type detection

#### 2. Role Assignment Rules Not Triggering

**Problem**: Automatic role assignment rules are not being processed.

**Solutions**:

- Verify rule conditions are correctly formatted
- Check that trigger events are being fired
- Ensure rules are active
- Review rule processing logs

#### 3. Permission Inheritance Issues

**Problem**: Roles are not inheriting expected permissions.

**Solutions**:

- Check role hierarchy configuration
- Verify inheritance type settings
- Review excluded permissions
- Test inheritance with simple examples

#### 4. Delegation Not Working

**Problem**: Role delegations are not being applied.

**Solutions**:

- Check delegation expiration dates
- Verify delegator has the role to delegate
- Ensure delegation context is correct
- Review delegation logs

### Debugging Tips

1. **Enable detailed logging**: Set logging level to DEBUG for RBAC operations
2. **Use audit logs**: Review audit logs for permission check details
3. **Test incrementally**: Test features one at a time
4. **Use API endpoints**: Use API endpoints to test functionality
5. **Check backend implementation**: Ensure backend supports advanced features

### Performance Considerations

1. **Cache permissions**: Cache frequently accessed permissions
2. **Optimize queries**: Optimize database queries for permission checks
3. **Limit conditions**: Avoid overly complex conditional logic
4. **Monitor performance**: Monitor permission check performance
5. **Use indexes**: Ensure proper database indexes for RBAC tables

## Conclusion

The Advanced RBAC system provides powerful features for enterprise-grade access control. By following best practices and understanding the system's capabilities, you can implement sophisticated access control policies that meet your organization's security requirements.

For additional support or questions, please refer to the main RBAC documentation or contact the development team.
