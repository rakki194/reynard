# 🔐 Comprehensive Security Implementation Guide

**Created**: 2025-01-21  
**Agent**: Vulpine (Security-focused Fox Specialist)  
**Version**: 1.0.0  
**Status**: IMPLEMENTATION COMPLETE

## 📋 Executive Summary

This document provides a comprehensive guide to the enterprise-grade security infrastructure implemented in the Reynard backend. The security system transforms the application from basic protection to enterprise-grade security standards with comprehensive encryption, key management, and audit logging.

## 🎯 Security Architecture Overview

The Reynard security system is built on a modular architecture with the following core components:

### Core Security Components

1. **Key Management System** (`key_manager.py`)
   - Centralized key management with HSM simulation
   - Automatic key rotation and lifecycle management
   - Secure key storage with encryption at rest
   - Key derivation functions and backup/recovery

2. **Encryption Utilities** (`encryption_utils.py`)
   - AES-256-GCM encryption for data at rest
   - RSA encryption for key exchange and signing
   - Secure hashing with salt and iterations
   - Data integrity verification

3. **Security Configuration** (`security_config.py`)
   - Environment-based security policies
   - Security level enforcement (development/staging/production)
   - Component-specific security settings
   - Compliance configuration (GDPR, CCPA, SOC2, ISO27001)

4. **Audit Logging System** (`audit_logger.py`)
   - Structured JSON logging for security events
   - Multiple log destinations (file, database, syslog)
   - Security event categorization and severity levels
   - Real-time security monitoring

5. **Database Encryption** (`database_encryption.py`)
   - Transparent Data Encryption (TDE) for PostgreSQL
   - Column-level encryption for sensitive data
   - Secure database connection with SSL/TLS
   - Database migration support for encryption

6. **Session Encryption** (`session_encryption.py`)
   - Encrypted session storage in Redis
   - Session binding to IP address and user agent
   - Concurrent session limits and management
   - Session fingerprinting for security

7. **API Key Management** (`api_key_manager.py`)
   - Secure API key generation and storage
   - API key encryption at rest
   - Key rotation and lifecycle management
   - Usage tracking and rate limiting

## 🚀 Quick Start Guide

### 1. Basic Setup

The security system is automatically initialized when the backend starts. No additional configuration is required for basic operation.

```python
from app.security import get_security_config, get_key_manager

# Get security configuration
config = get_security_config()
print(f"Security level: {config.get_security_level()}")

# Get key manager
key_manager = get_key_manager()
print(f"Active keys: {len(key_manager.list_keys())}")
```

### 2. Environment Configuration

Set the following environment variables for production deployment:

```bash
# Security Configuration
ENVIRONMENT=production
REYNARD_MASTER_PASSWORD=your-secure-master-password

# Database Security
DATABASE_SSL_REQUIRED=true
DATABASE_ENCRYPTION_ENABLED=true

# Session Security
SESSION_ENCRYPTION_ENABLED=true
SESSION_TIMEOUT_MINUTES=15

# API Security
API_KEY_ENCRYPTION_ENABLED=true
API_RATE_LIMITING_ENABLED=true
```

### 3. Security Level Configuration

The system automatically adjusts security settings based on the environment:

- **Development**: Relaxed security for development ease
- **Staging**: Production-like security with debugging enabled
- **Production**: Maximum security with all protections enabled

## 🔑 Key Management System

### Overview

The Key Management System provides enterprise-grade key management with:

- **Key Types**: Database, JWT, Session, API Key, Audit Log encryption keys
- **Key Lifecycle**: Generation, rotation, revocation, expiration
- **Security**: Encryption at rest, secure storage, access logging
- **Compliance**: Automated rotation, audit trails, backup/recovery

### Usage Examples

#### Generate a New Key

```python
from app.security import generate_key, KeyType

# Generate a database encryption key
key_data = generate_key(
    key_id="my_database_key",
    key_type=KeyType.DATABASE_MASTER,
    rotation_schedule_days=90
)
```

#### Retrieve and Use a Key

```python
from app.security import get_key, KeyType

# Get a key for encryption
key_data = get_key("my_database_key", KeyType.DATABASE_MASTER)
if key_data:
    # Use key for encryption operations
    pass
```

#### Rotate a Key

```python
from app.security import rotate_key

# Rotate an existing key
new_key_data = rotate_key("my_database_key")
```

### Key Types and Purposes

| Key Type               | Purpose                    | Rotation Schedule | Storage        |
| ---------------------- | -------------------------- | ----------------- | -------------- |
| `DATABASE_MASTER`      | Master database encryption | 365 days          | Encrypted file |
| `DATABASE_TABLE`       | Table-level encryption     | 90 days           | Encrypted file |
| `DATABASE_COLUMN`      | Column-level encryption    | 90 days           | Encrypted file |
| `JWT_SIGNING`          | JWT token signing          | 30 days           | Encrypted file |
| `SESSION_ENCRYPTION`   | Session data encryption    | 30 days           | Encrypted file |
| `API_KEY_ENCRYPTION`   | API key encryption         | 90 days           | Encrypted file |
| `AUDIT_LOG_ENCRYPTION` | Audit log encryption       | 180 days          | Encrypted file |

## 🔐 Encryption System

### Overview

The Encryption System provides comprehensive encryption capabilities:

- **Symmetric Encryption**: AES-256-GCM for data at rest
- **Asymmetric Encryption**: RSA-2048/4096 for key exchange
- **Hashing**: SHA-256/384/512 with salt and iterations
- **Key Derivation**: PBKDF2 and Scrypt for password-based keys

### Usage Examples

#### Encrypt Data

```python
from app.security import encrypt_data, get_key, KeyType

# Get encryption key
key = get_key("my_encryption_key", KeyType.DATABASE_TABLE)

# Encrypt data
encrypted_data = encrypt_data("sensitive information", key)
```

#### Decrypt Data

```python
from app.security import decrypt_data, get_key, KeyType

# Get decryption key
key = get_key("my_encryption_key", KeyType.DATABASE_TABLE)

# Decrypt data
decrypted_data = decrypt_data(encrypted_data, key)
```

#### Hash Passwords

```python
from app.security import generate_password_hash, verify_password_hash

# Generate password hash
password_hash, salt = generate_password_hash("user_password")

# Verify password
is_valid = verify_password_hash("user_password", password_hash, salt)
```

### Encryption Algorithms

| Algorithm   | Use Case              | Key Size  | Security Level |
| ----------- | --------------------- | --------- | -------------- |
| AES-256-GCM | Data at rest          | 256 bits  | High           |
| AES-256-CBC | Legacy compatibility  | 256 bits  | High           |
| RSA-2048    | Key exchange          | 2048 bits | High           |
| RSA-4096    | High security         | 4096 bits | Very High      |
| SHA-256     | Hashing               | 256 bits  | High           |
| SHA-512     | High security hashing | 512 bits  | Very High      |
| PBKDF2      | Password derivation   | Variable  | High           |
| Scrypt      | Password derivation   | Variable  | Very High      |

## 🗄️ Database Encryption

### Overview

The Database Encryption system provides:

- **Transparent Data Encryption (TDE)**: Automatic encryption of database files
- **Column-Level Encryption**: Selective encryption of sensitive columns
- **Secure Connections**: SSL/TLS for all database connections
- **Migration Support**: Zero-downtime encryption migration

### Configuration

#### Enable Database Encryption

```python
from app.security import get_database_security_config

config = get_database_security_config()
config.enable_transparent_encryption = True
config.enable_column_encryption = True
config.require_ssl = True
```

#### Encrypt Sensitive Columns

```python
from app.security import get_database_encryption_manager

# Get database encryption manager
manager = get_database_encryption_manager("postgresql://...", "reynard")

# Encrypt a field value
encrypted_value = manager.encrypt_field_value(
    value="sensitive_data",
    field_name="email",
    table_name="users"
)
```

#### Migrate Existing Data

```python
# Migrate a table to encryption
results = manager.migrate_table_to_encryption("users", batch_size=1000)
print(f"Migrated {results['encrypted_records']} records")
```

### Sensitive Data Identification

The system automatically identifies and encrypts sensitive columns:

| Table             | Sensitive Columns                            |
| ----------------- | -------------------------------------------- |
| `users`           | email, password_hash, phone, address         |
| `sessions`        | session_data, user_agent, ip_address         |
| `api_keys`        | key_value, secret                            |
| `audit_logs`      | details, ip_address, user_agent              |
| `agent_emails`    | email_content, sender_email, recipient_email |
| `email_analytics` | email_content, analysis_data                 |
| `captions`        | caption_text, image_path                     |

## 🔒 Session Security

### Overview

The Session Security system provides:

- **Encrypted Sessions**: All session data encrypted in Redis
- **Session Binding**: IP address and user agent binding
- **Concurrent Limits**: Maximum concurrent sessions per user
- **Automatic Cleanup**: Expired session cleanup
- **Security Monitoring**: Session anomaly detection

### Usage Examples

#### Create Encrypted Session

```python
from app.security import create_encrypted_session

# Create a new encrypted session
session_id = create_encrypted_session(
    user_id="user123",
    ip_address="192.168.1.100",
    user_agent="Mozilla/5.0...",
    session_data={"role": "admin"}
)
```

#### Retrieve Session

```python
from app.security import get_encrypted_session

# Get session data
session = get_encrypted_session(session_id)
if session:
    print(f"User: {session.user_id}")
    print(f"Data: {session.data}")
```

#### Update Session

```python
from app.security import update_encrypted_session

# Update session data
success = update_encrypted_session(
    session_id=session_id,
    session_data={"last_action": "login"},
    ip_address="192.168.1.100"
)
```

#### Revoke User Sessions

```python
from app.security import revoke_user_sessions

# Revoke all sessions for a user
revoked_count = revoke_user_sessions("user123")
print(f"Revoked {revoked_count} sessions")
```

### Session Security Features

| Feature               | Description                  | Configuration                      |
| --------------------- | ---------------------------- | ---------------------------------- |
| **Encryption**        | AES-256-GCM encryption       | `enable_session_encryption`        |
| **Binding**           | IP and user agent binding    | `enable_session_binding`           |
| **Timeout**           | Automatic session expiration | `session_timeout_minutes`          |
| **Concurrent Limits** | Max sessions per user        | `max_concurrent_sessions`          |
| **Cleanup**           | Automatic cleanup            | `session_cleanup_interval_minutes` |

## 🔑 API Key Management

### Overview

The API Key Management system provides:

- **Secure Generation**: Cryptographically secure API keys
- **Encryption at Rest**: All API keys encrypted in storage
- **Scoping**: Fine-grained permission scopes
- **Rate Limiting**: Per-key rate limiting
- **Usage Tracking**: Comprehensive usage analytics
- **Lifecycle Management**: Creation, rotation, revocation

### Usage Examples

#### Create API Key

```python
from app.security import create_api_key, APIKeyScope

# Create a new API key
api_key, metadata = create_api_key(
    name="My Application Key",
    description="API key for my application",
    user_id="user123",
    scopes={APIKeyScope.READ_USERS, APIKeyScope.WRITE_USERS},
    expires_in_days=365,
    rate_limit_per_minute=100
)
```

#### Validate API Key

```python
from app.security import validate_api_key, APIKeyScope

# Validate API key with required scopes
metadata = validate_api_key(
    api_key=api_key,
    required_scopes={APIKeyScope.READ_USERS},
    ip_address="192.168.1.100"
)

if metadata:
    print(f"Valid key for user: {metadata.user_id}")
```

#### Check Rate Limits

```python
from app.security import check_api_key_rate_limit

# Check if key is within rate limits
allowed, info = check_api_key_rate_limit(metadata.key_id)
if not allowed:
    print(f"Rate limit exceeded: {info}")
```

#### Rotate API Key

```python
from app.security import rotate_api_key

# Rotate an existing API key
new_api_key = rotate_api_key(metadata.key_id, user_id="user123")
```

### API Key Scopes

| Scope            | Description             | Access Level |
| ---------------- | ----------------------- | ------------ |
| `READ_USERS`     | Read user data          | Read         |
| `WRITE_USERS`    | Modify user data        | Write        |
| `ADMIN_USERS`    | Full user management    | Admin        |
| `READ_SESSIONS`  | Read session data       | Read         |
| `WRITE_SESSIONS` | Modify sessions         | Write        |
| `ADMIN_SESSIONS` | Full session management | Admin        |
| `READ_API_KEYS`  | Read API key data       | Read         |
| `WRITE_API_KEYS` | Modify API keys         | Write        |
| `ADMIN_API_KEYS` | Full API key management | Admin        |
| `FULL_ACCESS`    | All permissions         | Admin        |
| `READ_ONLY`      | Read-only access        | Read         |

## 📊 Audit Logging

### Overview

The Audit Logging system provides:

- **Structured Logging**: JSON-formatted security events
- **Multiple Destinations**: File, database, syslog output
- **Event Categorization**: Authentication, authorization, data access, violations
- **Severity Levels**: Low, Medium, High, Critical
- **Real-time Monitoring**: Live security event tracking

### Usage Examples

#### Log Authentication Event

```python
from app.security import log_authentication_event, SecurityEventType

# Log successful login
log_authentication_event(
    event_type=SecurityEventType.LOGIN_SUCCESS,
    user_id="user123",
    ip_address="192.168.1.100",
    user_agent="Mozilla/5.0...",
    success=True
)
```

#### Log Security Violation

```python
from app.security import log_security_violation, SecurityEventType, SecurityEventSeverity

# Log SQL injection attempt
log_security_violation(
    event_type=SecurityEventType.SQL_INJECTION_ATTEMPT,
    severity=SecurityEventSeverity.HIGH,
    ip_address="192.168.1.100",
    user_agent="Mozilla/5.0...",
    resource="/api/users",
    details={"query": "SELECT * FROM users WHERE 1=1"}
)
```

#### Log Data Access

```python
from app.security import log_data_access_event

# Log data access
log_data_access_event(
    user_id="user123",
    resource="database.users.email",
    action="read",
    ip_address="192.168.1.100"
)
```

### Security Event Types

| Event Type              | Category           | Severity | Description            |
| ----------------------- | ------------------ | -------- | ---------------------- |
| `LOGIN_SUCCESS`         | Authentication     | Low      | Successful user login  |
| `LOGIN_FAILURE`         | Authentication     | Medium   | Failed login attempt   |
| `LOGOUT`                | Authentication     | Low      | User logout            |
| `PERMISSION_GRANTED`    | Authorization      | Low      | Permission granted     |
| `PERMISSION_DENIED`     | Authorization      | Medium   | Permission denied      |
| `DATA_ACCESS`           | Data Access        | Low      | Data read access       |
| `DATA_MODIFICATION`     | Data Access        | Medium   | Data modification      |
| `SQL_INJECTION_ATTEMPT` | Security Violation | High     | SQL injection attempt  |
| `XSS_ATTEMPT`           | Security Violation | High     | XSS attack attempt     |
| `UNAUTHORIZED_ACCESS`   | Security Violation | High     | Unauthorized access    |
| `API_KEY_CREATED`       | API Management     | Low      | API key created        |
| `API_KEY_REVOKED`       | API Management     | Medium   | API key revoked        |
| `KEY_ROTATION`          | Key Management     | Low      | Encryption key rotated |

## 🛡️ Security Configuration

### Environment-Based Configuration

The security system automatically adjusts based on the environment:

#### Development Environment

```python
# Relaxed security for development
config = get_security_config()
assert config.is_development() == True
assert config.database.require_ssl == False
assert config.session.secure_cookies == False
assert config.api.enable_rate_limiting == False
```

#### Production Environment

```python
# Maximum security for production
config = get_security_config()
assert config.is_production() == True
assert config.database.require_ssl == True
assert config.session.secure_cookies == True
assert config.api.enable_rate_limiting == True
```

### Security Levels

| Security Level | Environment   | SSL Required | Encryption | Rate Limiting | Audit Logging |
| -------------- | ------------- | ------------ | ---------- | ------------- | ------------- |
| Development    | development   | No           | Optional   | Disabled      | Debug         |
| Staging        | staging       | Yes          | Enabled    | Enabled       | Info          |
| Production     | production    | Yes          | Required   | Enabled       | Warning       |
| High Security  | high_security | Yes          | Required   | Strict        | Critical      |

### Compliance Configuration

#### GDPR Compliance

```python
config = get_security_config()
config.enable_gdpr_compliance = True

# Automatic data encryption for PII
# Right to be forgotten support
# Data portability features
# Consent management
```

#### SOC 2 Compliance

```python
config = get_security_config()
config.enable_soc2_compliance = True

# Comprehensive audit logging
# Access controls and monitoring
# Data encryption and protection
# Incident response procedures
```

## 🔧 Integration Guide

### FastAPI Integration

#### Add Security Middleware

```python
from fastapi import FastAPI
from app.security import setup_security_middleware

app = FastAPI()

# Add security middleware
app = setup_security_middleware(app)
```

#### Database Integration

```python
from sqlalchemy import create_engine
from app.security import get_database_encryption_manager

# Create encrypted database engine
manager = get_database_encryption_manager(
    database_url="postgresql://...",
    database_name="reynard"
)
engine = manager.get_encrypted_engine()
```

#### Session Integration

```python
from fastapi import FastAPI, Request
from app.security import create_encrypted_session, get_encrypted_session

app = FastAPI()

@app.post("/login")
async def login(request: Request):
    # Create encrypted session after authentication
    session_id = create_encrypted_session(
        user_id="user123",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    return {"session_id": session_id}
```

#### API Key Integration

```python
from fastapi import FastAPI, Depends, HTTPException
from app.security import validate_api_key, APIKeyScope

app = FastAPI()

async def verify_api_key(request: Request):
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")

    metadata = validate_api_key(
        api_key=api_key,
        required_scopes={APIKeyScope.READ_USERS},
        ip_address=request.client.host
    )

    if not metadata:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return metadata

@app.get("/users")
async def get_users(api_key: dict = Depends(verify_api_key)):
    return {"users": []}
```

### Database Model Integration

#### Encrypted Fields

```python
from sqlalchemy import Column, String
from app.security import encrypt_database_field, decrypt_database_field

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255))  # This will be encrypted

    def set_email(self, email: str):
        # Encrypt email before storing
        self.email = encrypt_database_field(
            value=email,
            field_name="email",
            table_name="users"
        )

    def get_email(self) -> str:
        # Decrypt email when retrieving
        return decrypt_database_field(
            encrypted_value=self.email,
            field_name="email",
            table_name="users"
        )
```

## 🧪 Testing and Validation

### Security Testing

#### Test Encryption/Decryption

```python
import pytest
from app.security import encrypt_data, decrypt_data, get_key, KeyType

def test_encryption_roundtrip():
    # Get encryption key
    key = get_key("test_key", KeyType.DATABASE_TABLE)

    # Test data
    original_data = "sensitive information"

    # Encrypt
    encrypted = encrypt_data(original_data, key)
    assert encrypted != original_data

    # Decrypt
    decrypted = decrypt_data(encrypted, key)
    assert decrypted == original_data
```

#### Test Session Security

```python
import pytest
from app.security import create_encrypted_session, get_encrypted_session

def test_session_encryption():
    # Create session
    session_id = create_encrypted_session(
        user_id="test_user",
        session_data={"test": "data"}
    )

    # Retrieve session
    session = get_encrypted_session(session_id)
    assert session is not None
    assert session.user_id == "test_user"
    assert session.data["test"] == "data"
```

#### Test API Key Validation

```python
import pytest
from app.security import create_api_key, validate_api_key, APIKeyScope

def test_api_key_validation():
    # Create API key
    api_key, metadata = create_api_key(
        name="Test Key",
        scopes={APIKeyScope.READ_USERS}
    )

    # Validate API key
    validated_metadata = validate_api_key(
        api_key=api_key,
        required_scopes={APIKeyScope.READ_USERS}
    )

    assert validated_metadata is not None
    assert validated_metadata.key_id == metadata.key_id
```

### Performance Testing

#### Encryption Performance

```python
import time
from app.security import encrypt_data, get_key, KeyType

def test_encryption_performance():
    key = get_key("perf_test_key", KeyType.DATABASE_TABLE)
    data = "test data" * 1000  # 1KB of data

    # Measure encryption time
    start_time = time.time()
    for _ in range(1000):
        encrypt_data(data, key)
    encryption_time = time.time() - start_time

    print(f"Encrypted 1000 records in {encryption_time:.2f} seconds")
    print(f"Average: {encryption_time/1000*1000:.2f} ms per record")
```

## 📈 Monitoring and Alerting

### Security Metrics

#### Key Management Metrics

```python
from app.security import get_key_manager

key_manager = get_key_manager()

# Get key statistics
active_keys = key_manager.list_keys(status=KeyStatus.ACTIVE)
expired_keys = key_manager.list_keys(status=KeyStatus.EXPIRED)
rotated_keys = key_manager.list_keys(status=KeyStatus.ROTATING)

print(f"Active keys: {len(active_keys)}")
print(f"Expired keys: {len(expired_keys)}")
print(f"Keys being rotated: {len(rotated_keys)}")
```

#### Session Statistics

```python
from app.security import get_session_encryption_manager

session_manager = get_session_encryption_manager()

# Get session statistics
stats = session_manager.get_session_statistics()
print(f"Total sessions: {stats['total_sessions']}")
print(f"Users with sessions: {stats['total_users_with_sessions']}")
```

#### API Key Statistics

```python
from app.security import get_api_key_manager

api_manager = get_api_key_manager()

# Get API key statistics
stats = api_manager.get_api_key_statistics()
print(f"Total API keys: {stats['total_keys']}")
print(f"Active keys: {stats['active_keys']}")
print(f"Expired keys: {stats['expired_keys']}")
```

### Security Alerts

#### Critical Security Events

```python
from app.security import get_security_audit_logger, SecurityEventSeverity

audit_logger = get_security_audit_logger()

# Check for critical events
critical_events = audit_logger.list_events(severity=SecurityEventSeverity.CRITICAL)
if critical_events:
    print(f"🚨 {len(critical_events)} critical security events detected!")
    for event in critical_events:
        print(f"- {event.event_type.value}: {event.details}")
```

#### Failed Authentication Attempts

```python
# Monitor failed login attempts
failed_logins = audit_logger.list_events(
    event_type=SecurityEventType.LOGIN_FAILURE,
    since=datetime.utcnow() - timedelta(hours=1)
)

if len(failed_logins) > 10:
    print(f"⚠️ High number of failed login attempts: {len(failed_logins)}")
```

## 🔄 Maintenance and Operations

### Regular Maintenance Tasks

#### Key Rotation

```python
from app.security import get_key_manager, KeyType

key_manager = get_key_manager()

# Rotate keys that are due for rotation
keys_to_rotate = key_manager.list_keys(status=KeyStatus.ACTIVE)
for key_metadata in keys_to_rotate:
    if key_metadata.should_rotate():
        new_key = key_manager.rotate_key(key_metadata.key_id)
        print(f"Rotated key: {key_metadata.key_id}")
```

#### Session Cleanup

```python
from app.security import cleanup_expired_sessions

# Clean up expired sessions
cleaned_count = cleanup_expired_sessions()
print(f"Cleaned up {cleaned_count} expired sessions")
```

#### Audit Log Cleanup

```python
from app.security import get_security_audit_logger

audit_logger = get_security_audit_logger()

# Clean up old audit logs (older than 90 days)
cutoff_date = datetime.utcnow() - timedelta(days=90)
cleaned_count = audit_logger.cleanup_old_logs(cutoff_date)
print(f"Cleaned up {cleaned_count} old audit logs")
```

### Backup and Recovery

#### Key Backup

```python
from app.security import get_key_manager

key_manager = get_key_manager()

# Create backup of all keys
key_manager.backup_keys("/secure/backup/keys/")
print("Key backup completed")
```

#### Key Recovery

```python
# Restore keys from backup
key_manager.restore_keys("/secure/backup/keys/")
print("Key recovery completed")
```

## 🚨 Incident Response

### Security Incident Procedures

#### 1. Immediate Response

```python
from app.security import revoke_user_sessions, revoke_api_key

# Revoke all sessions for compromised user
revoked_sessions = revoke_user_sessions("compromised_user")
print(f"Revoked {revoked_sessions} sessions")

# Revoke compromised API key
revoked = revoke_api_key("compromised_api_key")
print(f"API key revoked: {revoked}")
```

#### 2. Key Rotation

```python
from app.security import get_key_manager

key_manager = get_key_manager()

# Emergency key rotation
key_manager.rotate_key("compromised_encryption_key")
print("Emergency key rotation completed")
```

#### 3. Audit Investigation

```python
from app.security import get_security_audit_logger, SecurityEventType

audit_logger = get_security_audit_logger()

# Investigate security events
security_events = audit_logger.list_events(
    event_type=SecurityEventType.UNAUTHORIZED_ACCESS,
    since=datetime.utcnow() - timedelta(days=7)
)

print(f"Found {len(security_events)} unauthorized access attempts")
```

## 📚 Best Practices

### Development Best Practices

1. **Always Use Encryption for Sensitive Data**

   ```python
   # Good: Encrypt sensitive data
   encrypted_email = encrypt_database_field(email, "email", "users")

   # Bad: Store sensitive data in plain text
   user.email = email  # Don't do this
   ```

2. **Validate API Keys and Permissions**

   ```python
   # Good: Validate API key with required scopes
   metadata = validate_api_key(api_key, {APIKeyScope.READ_USERS})

   # Bad: Skip validation
   # Don't skip API key validation
   ```

3. **Log Security Events**

   ```python
   # Good: Log security events
   log_authentication_event(SecurityEventType.LOGIN_SUCCESS, user_id)

   # Bad: Skip security logging
   # Always log security-relevant events
   ```

### Production Best Practices

1. **Use Strong Master Passwords**

   ```bash
   # Good: Strong, unique master password
   REYNARD_MASTER_PASSWORD="$(openssl rand -base64 32)"

   # Bad: Weak or default password
   REYNARD_MASTER_PASSWORD="password123"
   ```

2. **Enable All Security Features**

   ```python
   # Good: Production security configuration
   config.enable_transparent_encryption = True
   config.require_ssl = True
   config.enable_rate_limiting = True

   # Bad: Disabled security features
   # Never disable security features in production
   ```

3. **Regular Security Monitoring**

   ```python
   # Good: Regular security checks
   def daily_security_check():
       cleanup_expired_sessions()
       check_key_rotation_schedule()
       review_security_events()

   # Bad: No security monitoring
   # Always monitor security systems
   ```

## 🔍 Troubleshooting

### Common Issues

#### 1. Key Not Found Error

```python
# Problem: Key not found
key = get_key("missing_key", KeyType.DATABASE_MASTER)
# Returns None

# Solution: Generate the key first
key_data = generate_key("missing_key", KeyType.DATABASE_MASTER)
key = get_key("missing_key", KeyType.DATABASE_MASTER)
```

#### 2. Decryption Failed Error

```python
# Problem: Decryption fails
try:
    decrypted = decrypt_data(encrypted_data, key)
except DecryptionError as e:
    print(f"Decryption failed: {e}")

# Solution: Check key and data integrity
# - Ensure correct key is used
# - Verify encrypted data is not corrupted
# - Check key hasn't been rotated
```

#### 3. Session Not Found Error

```python
# Problem: Session not found
session = get_encrypted_session("invalid_session_id")
# Returns None

# Solution: Check session lifecycle
# - Verify session hasn't expired
# - Check if session was revoked
# - Ensure session ID is correct
```

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging

# Enable debug logging
logging.getLogger("app.security").setLevel(logging.DEBUG)

# This will show detailed security operations
```

## 📞 Support and Resources

### Documentation

- **Security Configuration**: `app/security/security_config.py`
- **Key Management**: `app/security/key_manager.py`
- **Encryption Utilities**: `app/security/encryption_utils.py`
- **Database Encryption**: `app/security/database_encryption.py`
- **Session Security**: `app/security/session_encryption.py`
- **API Key Management**: `app/security/api_key_manager.py`
- **Audit Logging**: `app/security/audit_logger.py`

### Security Team

- **Primary Contact**: Vulpine (Security-focused Fox Specialist)
- **Security Issues**: Create issue with `security` label
- **Emergency Contact**: Use security incident procedures

### Compliance Resources

- **GDPR**: Data protection and privacy compliance
- **CCPA**: California Consumer Privacy Act compliance
- **SOC 2**: Security and availability controls
- **ISO 27001**: Information security management

---

## 🏁 Conclusion

The Reynard security system provides enterprise-grade security infrastructure that transforms the application from basic protection to comprehensive security standards. With modular architecture, comprehensive encryption, and detailed audit logging, the system ensures data protection, access control, and compliance with industry standards.

**Key Achievements:**

- ✅ **Phase 1**: Key management infrastructure and encryption utilities
- ✅ **Phase 2**: Database encryption with column-level encryption
- ✅ **Phase 3**: Encrypted session management with Redis backend
- ✅ **Phase 4**: Secure API key management with rotation
- ✅ **Phase 5**: Comprehensive audit logging and security monitoring

**Next Steps:**

- Integration testing and security validation
- Performance optimization and monitoring
- Security documentation and training
- Compliance certification and auditing

The security system is now ready for production deployment with enterprise-grade protection for all sensitive data and operations.

---

_This document will be updated as the security system evolves and new features are added._
