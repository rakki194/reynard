# Argon2-CFFI Password Hashing Implementation

## Overview

YipYap now uses `argon2-cffi` as the primary password hashing library, replacing the previous `pwdlib` implementation. This upgrade provides superior performance, enhanced security features, and better control over hashing parameters.

## Why Argon2-CFFI?

### Advantages over pwdlib

1. **Direct Implementation**: `argon2-cffi` is a direct Python binding to the official Argon2 reference implementation, providing better performance and reliability.

2. **Fine-grained Control**: Offers precise control over all Argon2 parameters (time_cost, memory_cost, parallelism, hash_len, salt_len).

3. **Better Error Handling**: More specific exception types and better error messages for debugging.

4. **Active Development**: More actively maintained with regular security updates and performance improvements.

5. **Memory Efficiency**: Optimized memory usage and better handling of large memory costs.

6. **Thread Safety**: Excellent thread safety for concurrent password hashing operations.

### Security Benefits

- **Memory-Hard**: Argon2 is designed to be memory-hard, making it resistant to hardware-based attacks (ASICs, FPGAs).
- **Configurable Security**: Multiple security levels allow tuning based on deployment environment and security requirements.
- **Future-Proof**: Easy parameter updates as hardware capabilities evolve.

## Configuration

### Environment Variables

The system supports the following environment variables for configuration:

```bash
# Security level (low, medium, high, paranoid)
ARGON2_SECURITY_LEVEL=medium

# JWT configuration (existing)
JWT_SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Security Levels

The implementation provides four predefined security levels:

#### Low Security (Development/Testing)

```python
{
    "time_cost": 2,
    "memory_cost": 2**16,  # 64 MiB
    "parallelism": 1,
    "hash_len": 32,
    "salt_len": 16
}
```

- **Use Case**: Development environments, testing, CI/CD
- **Hash Time**: ~50-100ms
- **Memory Usage**: 64 MiB

#### Medium Security (General Use)

```python
{
    "time_cost": 3,
    "memory_cost": 2**17,  # 128 MiB
    "parallelism": 2,
    "hash_len": 32,
    "salt_len": 16
}
```

- **Use Case**: Production applications, general web services
- **Hash Time**: ~100-200ms
- **Memory Usage**: 128 MiB

#### High Security (Sensitive Applications)

```python
{
    "time_cost": 4,
    "memory_cost": 2**18,  # 256 MiB
    "parallelism": 4,
    "hash_len": 32,
    "salt_len": 16
}
```

- **Use Case**: Financial applications, healthcare systems, government systems
- **Hash Time**: ~200-400ms
- **Memory Usage**: 256 MiB

#### Paranoid Security (Maximum Security)

```python
{
    "time_cost": 6,
    "memory_cost": 2**19,  # 512 MiB
    "parallelism": 8,
    "hash_len": 32,
    "salt_len": 16
}
```

- **Use Case**: High-value targets, military systems, critical infrastructure
- **Hash Time**: ~400-800ms
- **Memory Usage**: 512 MiB

## Implementation Details

### Core Functions

#### Password Hashing

```python
from app.utils.password_utils import hash_password

# Hash a password with current security level
hashed = hash_password("user_password")
```

#### Password Verification

```python
from app.utils.password_utils import verify_password

# Verify a password against stored hash
is_valid = verify_password("user_password", stored_hash)
```

#### Hash Migration

```python
from app.utils.password_utils import verify_and_update_password

# Verify and get updated hash if needed
is_valid, updated_hash = verify_and_update_password("user_password", stored_hash)
if updated_hash:
    # Store the updated hash in database
    await update_user_password(username, updated_hash)
```

### Advanced Features

#### Password Strength Validation

```python
from app.utils.password_utils import validate_password_strength

is_strong, reason = validate_password_strength("user_password")
if not is_strong:
    print(f"Password is weak: {reason}")
```

#### Hash Analysis

```python
from app.utils.password_utils import get_hash_info

info = get_hash_info(stored_hash)
print(f"Algorithm: {info['algorithm']}")
print(f"Variant: {info['variant']}")
print(f"Parameters: {info['parameters']}")
print(f"Needs Update: {info['needs_update']}")
```

#### Performance Benchmarking

```python
from app.utils.password_utils import benchmark_hash_time

results = benchmark_hash_time("test_password", iterations=10)
for level, time_taken in results.items():
    print(f"{level}: {time_taken:.3f}s average")
```

## Migration from pwdlib

### Automatic Migration

The system automatically migrates existing hashes:

1. **Legacy bcrypt hashes**: Automatically converted to Argon2 during user login
2. **Outdated Argon2 parameters**: Updated to current security level parameters
3. **Seamless user experience**: No user intervention required

### Manual Migration

For bulk migration of existing hashes:

```python
from app.utils.password_utils import verify_and_update_password
from app.data_access import get_data_source

async def migrate_all_passwords():
    data_source = get_data_source()
    users = await data_source.get_all_users()
    
    for user in users:
        # This will trigger migration if needed
        is_valid, updated_hash = verify_and_update_password(
            user.password, user.password_hash
        )
        if updated_hash:
            await data_source.update_user_password(user.username, updated_hash)
```

## Security Considerations

### Parameter Selection

- **Time Cost**: Higher values increase computation time
- **Memory Cost**: Higher values increase memory usage (must be power of 2)
- **Parallelism**: Higher values increase CPU usage
- **Hash Length**: 32 bytes (256 bits) is recommended
- **Salt Length**: 16 bytes (128 bits) is recommended

### Best Practices

1. **Environment-Specific Configuration**: Use different security levels for development, staging, and production
2. **Regular Parameter Updates**: Review and update parameters as hardware capabilities improve
3. **Monitoring**: Monitor hash performance and adjust parameters as needed
4. **Backup Strategy**: Ensure secure backup of password hashes
5. **Rate Limiting**: Implement rate limiting for login attempts

### Threat Model

Argon2 protects against:

- **Brute Force Attacks**: High computational cost
- **Rainbow Table Attacks**: Unique salts for each password
- **Hardware Attacks**: Memory-hard design resists ASIC/FPGA attacks
- **Timing Attacks**: Constant-time verification
- **Side-Channel Attacks**: Memory access patterns are data-independent

## Performance Optimization

### Thread Safety

The implementation is fully thread-safe and can handle concurrent password hashing operations efficiently.

### Memory Management

- Automatic cleanup of temporary memory
- Efficient memory allocation for large memory costs
- No memory leaks in long-running applications

### Caching

The password hasher instance is cached as a singleton to avoid repeated initialization overhead.

## Troubleshooting

### Common Issues

1. **Import Error**: Ensure `argon2-cffi` is installed

   ```bash
   pip install argon2-cffi
   ```

2. **Memory Issues**: Reduce memory_cost for resource-constrained environments

   ```bash
   export ARGON2_SECURITY_LEVEL=low
   ```

3. **Performance Issues**: Adjust security level based on server capabilities

   ```bash
   export ARGON2_SECURITY_LEVEL=medium
   ```

4. **Migration Failures**: Check logs for specific error messages and ensure bcrypt is available for legacy hash verification

### Debugging

Enable debug logging to troubleshoot issues:

```python
import logging
logging.getLogger('app.utils.password_utils').setLevel(logging.DEBUG)
```

### Performance Monitoring

Monitor hash performance in production:

```python
from app.utils.password_utils import benchmark_hash_time

# Run benchmark periodically
results = benchmark_hash_time("test_password")
logger.info(f"Hash performance: {results}")
```

## API Reference

### Core Functions

#### `hash_password(password: str) -> str`

Hash a password using Argon2 with current security parameters.

#### `verify_password(password: str, hashed_password: str) -> bool`

Verify a password against a stored hash.

#### `verify_and_update_password(password: str, hashed_password: str) -> Tuple[bool, Optional[str]]`

Verify a password and return updated hash if needed.

#### `validate_password_strength(password: str) -> Tuple[bool, str]`

Validate password strength according to security standards.

#### `get_hash_info(hashed_password: str) -> Dict[str, Any]`

Get detailed information about a password hash.

#### `benchmark_hash_time(password: str, iterations: int = 10) -> Dict[str, float]`

Benchmark hash performance for different security levels.

### Utility Functions

#### `is_argon2_hash(hashed_password: str) -> bool`

Check if a hash is in Argon2 format.

#### `is_bcrypt_hash(hashed_password: str) -> bool`

Check if a hash is in bcrypt format.

#### `get_hash_algorithm(hashed_password: str) -> str`

Determine the algorithm used for a password hash.

#### `get_hash_variant(hashed_password: str) -> Optional[str]`

Get the specific Argon2 variant used in a hash.

#### `generate_secure_salt(length: int = 16) -> bytes`

Generate a cryptographically secure salt.

### Configuration Functions

#### `get_security_level() -> SecurityLevel`

Get the current security level from environment variable.

#### `get_argon2_params() -> Dict[str, Any]`

Get Argon2 parameters based on the current security level.

## Dependencies

### Required Packages

```bash
pip install argon2-cffi bcrypt
```

### Package Versions

- `argon2-cffi>=23.0.0`: Modern Argon2 implementation
- `bcrypt>=4.0.0`: Legacy bcrypt support for migration

### Optional Dependencies

- `cffi>=1.0.1`: Required by argon2-cffi
- `pycparser`: Required by cffi

## Future Enhancements

### Planned Features

1. **Adaptive Parameters**: Automatic parameter adjustment based on server performance
2. **Hash Rotation**: Periodic hash re-computation for enhanced security
3. **Multi-Factor Authentication**: Integration with TOTP/HOTP systems
4. **Password History**: Prevention of password reuse
5. **Breach Detection**: Integration with breach databases

### Security Improvements

1. **Quantum Resistance**: Preparation for post-quantum cryptography
2. **Hardware Security**: Integration with TPM/HSM modules
3. **Zero-Knowledge Proofs**: Enhanced privacy-preserving authentication

## Conclusion

The argon2-cffi implementation provides a robust, secure, and performant password hashing solution for YipYap. With configurable security levels, automatic migration, and comprehensive error handling, it offers significant improvements over the previous pwdlib implementation while maintaining backward compatibility.

The system is designed to be future-proof, allowing easy parameter updates as security requirements evolve and hardware capabilities improve.
