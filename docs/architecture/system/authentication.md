# Authentication Setup Guide

## Overview

The Reynard framework uses JWT (JSON Web Tokens) for authentication with both access tokens and refresh tokens for enhanced security. The system employs modern password hashing using PBKDF2 with HMAC-SHA256, providing robust security for the modular framework architecture. This guide explains how to set up secure authentication in your Reynard deployment and provides a detailed technical overview of its implementation.

## Environment Variables

The authentication system requires the following environment variables:

### Required Variables

- `SECRET_KEY`: A cryptographically secure secret key for signing JWT tokens
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time in minutes (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time in days (default: 7)

### Setting Up Environment Variables

#### Development Environment

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Generate a secure secret key:

   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

3. Edit the `.env` file and replace `your-secret-key-here` with your generated key:

   ```env
   JWT_SECRET_KEY=your-generated-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

#### Production Environment

For production deployments, set environment variables directly on your server or through your deployment platform:

```bash
export JWT_SECRET_KEY="your-secure-secret-key"
export ACCESS_TOKEN_EXPIRE_MINUTES=30
export REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Security Best Practices

1. **Never commit the `.env` file** - It's already in `.gitignore`
2. **Use a different secret key for each environment** (development, staging, production)
3. **Generate secret keys with sufficient entropy** (at least 64 characters)
4. **Rotate secret keys periodically** in production
5. **Use HTTPS in production** to protect tokens in transit
6. **Set appropriate token expiration times** based on your security requirements
7. **Ensure argon2-cffi is installed** for modern password hashing

## Password Hashing System

YipYap uses the argon2-cffi library for password hashing, which provides a modern, secure approach to password management with configurable security levels:

### Hash Algorithm Configuration

The system is configured with configurable security levels:

- **Low Security:** Development/testing environments (64 MiB memory, 2 iterations)
- **Medium Security:** General production use (128 MiB memory, 3 iterations)
- **High Security:** Sensitive applications (256 MiB memory, 4 iterations)
- **Paranoid Security:** Maximum security (512 MiB memory, 6 iterations)

The security level can be configured via the `ARGON2_SECURITY_LEVEL` environment variable.

### Automatic Hash Migration

The system automatically migrates legacy bcrypt hashes to Argon2 during user login:

- When a user logs in, the system verifies their password and checks if the hash needs updating
- If the stored hash is using an outdated algorithm (bcrypt) or parameters, a new Argon2 hash is generated
- The updated hash is automatically stored in the database, ensuring all passwords use the most secure algorithm

### Hash Verification Process

The password verification process supports multiple hash formats:

1. **Argon2 hashes** (preferred) - Modern, memory-hard algorithm
2. **bcrypt hashes** (legacy) - Automatically migrated to Argon2 upon successful verification
3. **Unknown formats** - Logged as warnings and rejected for security

## Token Types

### Access Token

- Short-lived (default: 30 minutes)
- Used for API authentication
- Contains user information and permissions
- Automatically refreshed when expired

### Refresh Token

- Long-lived (default: 7 days)
- Used to obtain new access tokens
- More secure than long-lived access tokens
- Stored securely in the client

## Authentication Flow

1. User logs in with username/password.
2. The server, via the `/api/login` endpoint, authenticates the user against stored credentials. Upon successful authentication, it generates a short-lived access token and a longer-lived refresh token using `create_access_token` and `create_refresh_token`. Both tokens are signed with the `JWT_SECRET_KEY` and include the user's `username` as the `sub` claim and their `role` (e.g., "admin", "regular", "guest") in their payload.
3. The client receives these tokens and stores them (e.g., in `localStorage`). For subsequent API requests, the client includes the access token in the `Authorization` header as a `Bearer` token.
4. On the server side, backend endpoints utilize FastAPI's dependency injection to validate the incoming request. Functions like `get_current_user`, `get_current_active_user`, and `is_admin` are used as dependencies. The `verify_token` function decodes and validates the access token, extracting the `sub` and `role` claims.
5. `get_current_user` retrieves the full user object from the database, using the `username` from the token payload to ensure data consistency.
6. `get_current_active_user` is a specialized dependency that ensures the authenticated user is not a 'guest', enforcing a `403 Forbidden` error if they are.
7. `is_admin` specifically checks if the user's role, extracted from the token and confirmed with the database, is 'admin'. If the role does not match, a `403 Forbidden` error is returned.
8. When the access token expires (default: 30 minutes), the client automatically uses the refresh token to obtain a new access token via the `/api/refresh-token` endpoint. The `verify_refresh_token` function validates this token.
9. If the refresh token is expired or invalid, the user must log in again, triggering the full authentication flow from step 1.

## JWT Structure and Claims

JWTs in YipYap are composed of three parts: a header, a payload, and a signature. The payload contains claims, which are statements about an entity (typically, the user) and additional data.

- **`sub` (Subject):** This claim holds the `username` of the authenticated user. It is a unique identifier for the user.
- **`role`:** This custom claim defines the user's authorization level within the application, corresponding to the `UserRole` enum (e.g., "admin", "regular", "guest"). This claim is crucial for implementing role-based access control (RBAC) on various API endpoints.
- **`exp` (Expiration Time):** This claim specifies the expiration time on or after which the JWT must not be accepted for processing. It is represented as a Unix timestamp (seconds since epoch). Both access and refresh tokens have this claim to manage their lifecycles.
- **`type`:** This custom claim distinguishes between "access" tokens and "refresh" tokens, allowing the backend to correctly handle token refreshing.

The server's `JWT_SECRET_KEY` is used to sign these tokens, ensuring their integrity and authenticity. Any modification to the token or a mismatch in the `JWT_SECRET_KEY` will result in validation failure (e.g., `401 Unauthorized`).

## Backend Dependencies for Access Control

The FastAPI application uses dependency injection to manage user authentication and authorization. The key dependencies involved are:

- **`get_current_user(token: str = Depends(oauth2_scheme)) -> User`**: This asynchronous dependency retrieves the JWT token from the `Authorization` header, verifies its authenticity using `verify_token`, and extracts the `username` and `role` from its payload. It then fetches the full user profile from the database to ensure the user still exists and their role is current. This is the base dependency for any authenticated endpoint.

- **`get_current_active_user(current_user: User = Depends(get_current_user)) -> User`**: This dependency builds upon `get_current_user`. It checks if the authenticated user's role is `UserRole.guest`. If it is, an `HTTPException` with `403 Forbidden` status is raised, preventing guest users from accessing the endpoint. This is used for functionalities accessible to both "admin" and "regular" users but not "guests".

- **`is_admin(current_user: User = Depends(get_current_user))`**: This dependency also relies on `get_current_user`. It specifically checks if the `current_user`'s `role` is `UserRole.admin`. If the user is not an admin, an `HTTPException` with `403 Forbidden` status is raised, restricting the endpoint to administrators only.

These dependencies are applied to API routes using `Depends()`, enabling fine-grained control over which users can access specific functionalities based on their authenticated status and assigned roles. For example, sensitive configuration endpoints like `/api/index/fast-mode` and `/api/ollama/status` are protected by `is_admin`, while general status checks like `/api/index/status` are accessible to `get_current_active_user`.

## Detailed Authentication Implementation

### Password Hashing Implementation

The password hashing system is implemented in `app/utils/password_utils.py` using the argon2-cffi library:

- **`get_password_hasher()`**: Returns a singleton instance of the password hasher configured with current security level parameters
- **`hash_password(password: str) -> str`**: Hashes a password using Argon2 with optimal security parameters
- **`verify_password(password: str, hashed_password: str) -> bool`**: Verifies a password against a hash, supporting both Argon2 and bcrypt
- **`verify_and_update_password(password: str, hashed_password: str) -> Tuple[bool, Optional[str]]`**: Verifies a password and returns an updated hash if needed (e.g., migrating from bcrypt to Argon2 or updating Argon2 parameters)
- **`validate_password_strength(password: str) -> Tuple[bool, str]`**: Validates password strength according to modern security standards
- **`get_hash_info(hashed_password: str) -> Dict[str, Any]`**: Provides detailed information about password hashes

### Frontend Credential Management (SolidJS)

The SolidJS frontend manages authentication state and tokens primarily through the `src/contexts/app.tsx` context and the `src/composables/useAuthFetch.ts` composable.

- **`src/contexts/app.tsx`:** This module defines the global application context, which includes reactive signals for `isLoggedIn` (boolean) and `userRole` (string).
  - **`login(token: string, role: string, username: string, refreshToken?: string)`:** This function is invoked upon successful user login. It stores the `access_token` as `jwt_token` and the `refreshToken` (if provided) in `localStorage`. It also updates the `isLoggedIn` and `userRole` signals, making the authentication state available globally to SolidJS components.
  - **`logout()`:** This function clears the `jwt_token` and `refresh_token` from `localStorage` and resets the `isLoggedIn` and `userRole` signals, effectively ending the user's session.
  - **`notify()`:** The global notification system, provided by this context, is utilized by the `useAuthFetch` composable to display user-friendly messages for authentication and authorization events (e.g., "Session expired," "Access forbidden").

- **`src/composables/useAuthFetch.ts`:** This composable provides an authenticated `fetch` wrapper that automatically includes the `Authorization` header with the `Bearer` token for all API requests.
  - **Token Storage:** It retrieves `jwt_token` and `refresh_token` directly from `localStorage`.
  - **Proactive Token Refresh:** The `checkTokenAndRefresh` function runs on a `TOKEN_REFRESH_INTERVAL_MS` (e.g., every 5 minutes). If the `jwt_token` is set to expire within a predefined window (e.g., 10 minutes), it attempts to use the `refresh_token` to obtain a new `access_token` from the `/api/refresh-token` endpoint. This minimizes the chance of a user's session silently expiring during active use.
  - **Reactive Token Refresh (on 401):** If any `authFetch` call receives a `401 Unauthorized` response, it attempts to refresh the `access_token` using the `refresh_token`. If successful, the original request is automatically retried with the new `access_token`.
  - **Error Handling:**
    - If the proactive or reactive token refresh fails, or if a `401` or `403` response is received after a retry, the user is logged out (`logout()`) and redirected to the login page, accompanied by an appropriate notification.
    - Specifically, `403 Forbidden` responses trigger a notification indicating "Access forbidden. You don't have permission for this action."

### User Registration Process

The user registration is handled by the backend through the `/api/register` endpoint in `app/api/auth.py`.

- **Endpoint:** `POST /api/register`
- **Input:** Accepts `username` (string), `password` (string), and optionally `role` (string, defaults to "regular" if not provided).
- **Role Assignment Logic:**
  - The system checks the total number of existing users in the database.
  - If `data_source_instance.count_users()` returns `0`, meaning no users currently exist, the new registering user is automatically assigned the `UserRole.admin` role. This ensures that the first user to register can establish administrative control over the application.
  - For all subsequent registrations (when `user_count > 0`), the user is assigned `UserRole.guest` by default, unless a specific role is provided in the `UserCreate` model.
- **Password Hashing:** The plain-text password provided by the user is securely hashed using the modern Argon2 algorithm via the `hash_password()` function from `app/utils/password_utils.py`. This function uses argon2-cffi's PasswordHasher to create cryptographically secure hashes that are resistant to brute-force and rainbow table attacks.
- **Database Interaction:** The `data_source_instance.create_user()` method is called to persist the new user's `username`, `password_hash`, and `assigned_role` into the SQLite database.
- **Error Handling:** The endpoint includes `try-except` blocks to catch `ValueError` (e.g., if the username already exists) and other general exceptions, returning appropriate `HTTPException` responses (e.g., `400 Bad Request` or `500 Internal Server Error`).

### User Login and Hash Migration

The login process in `/api/login` endpoint includes automatic hash migration:

- **Password Verification:** Uses `verify_and_update_password()` to verify the password and check if the hash needs updating
- **Automatic Migration:** If the stored hash is using bcrypt (legacy) or outdated parameters, a new Argon2 hash is automatically generated
- **Database Update:** The updated hash is stored in the database, ensuring all passwords use the most secure algorithm
- **Seamless Experience:** The migration process is transparent to users - they continue using their existing passwords

### Password Change Process

The password change endpoint (`/api/users/me/password`) ensures security:

- **Current Password Verification:** Verifies the user's current password before allowing changes
- **New Password Hashing:** Uses Argon2 to hash the new password with optimal security parameters
- **Database Update:** Updates the stored hash in the database

### API Integration and Error Handling

YipYap's robust authentication and authorization system integrates seamlessly between the frontend and backend, with a focus on comprehensive error handling.

- **Frontend API Calls:**
  - All API calls requiring authentication (e.g., fetching user settings, managing indexing, interacting with Ollama models) are made using the `authFetch` function from `useAuthFetch`. This guarantees that the `Authorization: Bearer <token>` header is consistently included in the request.
  - The `authFetch` composable is crucial for abstracting away the complexities of token management and refresh, allowing components to focus on data interaction.
- **Backend API Endpoints:**
  - FastAPI endpoints define their required access levels using `Depends(get_current_user)`, `Depends(get_current_active_user)`, or `Depends(is_admin)`.
  - These dependencies perform the necessary token validation and role checks.
  - If a validation or role check fails, the dependencies automatically raise `HTTPException` (e.g., `status.HTTP_401_UNAUTHORIZED` or `status.HTTP_403_FORBIDDEN`), which FastAPI then translates into appropriate HTTP responses.
- **Centralized Error Handling:** The `useAuthFetch` composable acts as a centralized error handler for HTTP status codes related to authentication and authorization. It intercepts `401` and `403` responses, triggering token refresh attempts, user logout, and informative notifications to the user via the `app.notify` function. This provides a consistent and user-friendly experience even when authentication issues arise.
- **Security Implications:** By using short-lived access tokens and longer-lived refresh tokens, coupled with automatic token rotation and secure storage (`localStorage` for tokens, Argon2 for passwords), the system minimizes the window of opportunity for token compromise and enhances overall security.

## Troubleshooting

### Common Issues

1. **"JWT_SECRET_KEY environment variable is required"**
   - Ensure your `.env` file exists and contains the `JWT_SECRET_KEY` and that it is being loaded correctly by the application.
   - Verify the .env file is being loaded correctly

2. **"argon2-cffi is required for password hashing"**
   - Install the required dependency: `pip install argon2-cffi`
   - Ensure the package is listed in your requirements.txt file

3. **"Could not validate credentials"**
   - Check that the `JWT_SECRET_KEY` hasn't changed between token creation and validation
   - Verify the token hasn't expired

4. **Session timeout issues**
   - The application now automatically refreshes tokens, reducing session timeouts
   - If you still experience issues, check the refresh token expiration settings

5. **Password hash migration issues**
   - Legacy bcrypt hashes are automatically migrated to Argon2 during login
   - If migration fails, users can still log in with their existing passwords
   - Check application logs for any migration-related warnings

### Persistent 401 Unauthorized Errors for GET Requests

If you are logged in as an admin but still receive `401 Unauthorized` errors for specific GET requests (e.g., to index or Ollama status endpoints) while POST requests to other endpoints work, the issue is almost certainly on the frontend. This typically indicates that the GET requests are not including the `Authorization` header.

**Steps to diagnose and fix on the frontend:**

1. **Verify `useAuthFetch` Usage:** Ensure that any component or composable making API calls (especially GET requests to protected endpoints like `/api/index/status` or `/api/ollama/status`) is explicitly using the `authFetch` function provided by the `useAuthFetch` composable. Direct `fetch` calls will bypass the authentication header injection.

    ```typescript
    // Incorrect: Bypasses authentication
    // const response = await fetch('/api/index/status');

    // Correct: Uses the authenticated fetch wrapper
    import { useAuthFetch } from '~/composables/useAuthFetch';
    // ...
    const authFetch = useAuthFetch();
    const response = await authFetch('/api/index/status');
    ```

2. **Hard Refresh Browser:** After making changes to your frontend code, perform a hard refresh in your browser (Ctrl + Shift + R or Cmd + Shift + R). This ensures that the browser loads the latest JavaScript files and bypasses any cached versions that might not include your code updates.
3. **Inspect Network Tab:** Use your browser's developer tools (F12) and go to the "Network" tab.
    - Inspect the failing GET request.
    - Under "Request Headers," confirm that an `Authorization: Bearer <your_jwt_token>` header is present. If it's missing, the frontend is not correctly attaching it.
    - Check the "Response" tab for the exact status code and body returned by the server.

## Migration from Previous Versions

### From Versions Without Refresh Tokens

If you're upgrading from a version without refresh tokens:

1. Users will need to log in again after the upgrade
2. The new system will automatically handle token refresh
3. No changes needed to existing user accounts

### From Versions with bcrypt Password Hashing

If you're upgrading from a version that used bcrypt for password hashing:

1. **Automatic Migration:** All existing bcrypt password hashes will be automatically migrated to Argon2 during user login
2. **Backward Compatibility:** Users can continue using their existing passwords without any changes
3. **Seamless Upgrade:** The migration process is transparent and requires no user intervention
4. **Security Enhancement:** All passwords will eventually use the more secure Argon2 algorithm

### Hash Algorithm Detection

The system includes utility functions to detect hash algorithms:

- **`is_argon2_hash(hashed_password: str) -> bool`**: Checks if a hash is in Argon2 format
- **`is_bcrypt_hash(hashed_password: str) -> bool`**: Checks if a hash is in bcrypt format
- **`get_hash_algorithm(hashed_password: str) -> str`**: Returns the algorithm name ('argon2', 'bcrypt', or 'unknown')

## Security Considerations

- **Secret Key Management:** The secret key is the most critical security component
- **Key Backup:** Keep backups of your secret key in secure storage
- **Environment Separation:** Use different secret keys for each environment (development, staging, production)
- **Monitoring:** Monitor for any authentication errors in production logs
- **Rate Limiting:** Consider implementing rate limiting for login attempts
- **Password Strength:** Use strong passwords for user accounts
- **Hash Algorithm:** Argon2 provides superior security compared to bcrypt, offering better resistance against hardware-based attacks
- **Automatic Migration:** The system automatically migrates legacy hashes to maintain security standards
- **Thread Safety:** The password hashing system is thread-safe and can be used in concurrent environments

## Dependencies

The authentication system requires the following Python packages:

- **`argon2-cffi`**: Modern Argon2 password hashing implementation
- **`bcrypt`**: Legacy bcrypt support for hash migration
- **`PyJWT`**: JWT token creation and validation
- **`python-jose`**: Additional JWT functionality
- **`python-dotenv`**: Environment variable management

Install these dependencies using:

```bash
pip install argon2-cffi bcrypt PyJWT python-jose python-dotenv
```

Or ensure they are included in your `requirements.txt` file.
