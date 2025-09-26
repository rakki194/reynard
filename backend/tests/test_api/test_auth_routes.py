"""Tests for authentication API routes.

This module tests all authentication endpoints including registration,
login, logout, token refresh, and protected routes.
"""

from fastapi.testclient import TestClient


class TestAuthRegistration:
    """Test user registration endpoints."""

    def test_register_success(self, client: TestClient, clean_databases):
        """Test successful user registration."""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        response = client.post("/api/auth/register", json=user_data)

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert data["is_active"] is True
        assert "created_at" in data
        assert "password" not in data  # Password should not be returned

    def test_register_duplicate_username(self, client: TestClient, clean_databases):
        """Test registration with duplicate username."""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        # Register first user
        response1 = client.post("/api/auth/register", json=user_data)
        assert response1.status_code == 200

        # Try to register with same username
        response2 = client.post("/api/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "Username already registered" in response2.json()["detail"]

    def test_register_duplicate_email(self, client: TestClient, clean_databases):
        """Test registration with duplicate email."""
        user1_data = {
            "username": "testuser1",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User 1",
        }

        user2_data = {
            "username": "testuser2",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User 2",
        }

        # Register first user
        response1 = client.post("/api/auth/register", json=user1_data)
        assert response1.status_code == 200

        # Try to register with same email
        response2 = client.post("/api/auth/register", json=user2_data)
        assert response2.status_code == 400
        assert "Email already registered" in response2.json()["detail"]

    def test_register_invalid_email(self, client: TestClient, clean_databases):
        """Test registration with invalid email."""
        user_data = {
            "username": "testuser",
            "email": "invalid-email",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422

    def test_register_weak_password(self, client: TestClient, clean_databases):
        """Test registration with weak password."""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "123",  # Too short
            "full_name": "Test User",
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422

    def test_register_missing_fields(self, client: TestClient, clean_databases):
        """Test registration with missing required fields."""
        # Missing username
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422

    def test_register_empty_request(self, client: TestClient, clean_databases):
        """Test registration with empty request."""
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 422


class TestAuthLogin:
    """Test user login endpoints."""

    def test_login_success(self, client: TestClient, clean_databases):
        """Test successful user login."""
        # Register user first
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        # Login
        login_data = {"username": "testuser", "password": "testpassword123"}

        response = client.post("/api/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

    def test_login_wrong_password(self, client: TestClient, clean_databases):
        """Test login with wrong password."""
        # Register user first
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        # Try to login with wrong password
        login_data = {"username": "testuser", "password": "wrongpassword"}

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client: TestClient, clean_databases):
        """Test login with nonexistent user."""
        login_data = {"username": "nonexistent", "password": "testpassword123"}

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_missing_fields(self, client: TestClient, clean_databases):
        """Test login with missing fields."""
        # Missing password
        login_data = {"username": "testuser"}

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 422

    def test_login_empty_request(self, client: TestClient, clean_databases):
        """Test login with empty request."""
        response = client.post("/api/auth/login", json={})
        assert response.status_code == 422


class TestAuthTokenRefresh:
    """Test token refresh endpoints."""

    def test_refresh_token_success(self, client: TestClient, clean_databases):
        """Test successful token refresh."""
        # Register and login user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        login_data = {"username": "testuser", "password": "testpassword123"}
        login_response = client.post("/api/auth/login", json=login_data)
        refresh_token = login_response.json()["refresh_token"]

        # Refresh token
        refresh_data = {"refresh_token": refresh_token}

        response = client.post("/api/auth/refresh", json=refresh_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

        # New tokens should be valid (may be identical if generated at same time)
        assert data["access_token"] is not None
        assert data["refresh_token"] is not None

    def test_refresh_token_invalid(self, client: TestClient, clean_databases):
        """Test token refresh with invalid token."""
        refresh_data = {"refresh_token": "invalid_token"}

        response = client.post("/api/auth/refresh", json=refresh_data)
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]

    def test_refresh_token_missing(self, client: TestClient, clean_databases):
        """Test token refresh with missing token."""
        response = client.post("/api/auth/refresh", json={})
        assert response.status_code == 422


class TestAuthLogout:
    """Test user logout endpoints."""

    def test_logout_success(self, client: TestClient, clean_databases):
        """Test successful user logout."""
        # Register and login user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        login_data = {"username": "testuser", "password": "testpassword123"}
        login_response = client.post("/api/auth/login", json=login_data)
        refresh_token = login_response.json()["refresh_token"]

        # Logout
        logout_data = {"refresh_token": refresh_token}

        response = client.post("/api/auth/logout", json=logout_data)

        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"

    def test_logout_invalid_token(self, client: TestClient, clean_databases):
        """Test logout with invalid token."""
        logout_data = {"refresh_token": "invalid_token"}

        response = client.post("/api/auth/logout", json=logout_data)
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]

    def test_logout_missing_token(self, client: TestClient, clean_databases):
        """Test logout with missing token."""
        response = client.post("/api/auth/logout", json={})
        assert response.status_code == 422


class TestAuthMe:
    """Test current user information endpoint."""

    def test_me_success(self, client: TestClient, clean_databases):
        """Test successful current user retrieval."""
        # Register and login user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        login_data = {"username": "testuser", "password": "testpassword123"}
        login_response = client.post("/api/auth/login", json=login_data)
        access_token = login_response.json()["access_token"]

        # Get current user info
        headers = {"Authorization": f"Bearer {access_token}"}
        response = client.get("/api/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert data["is_active"] is True

    def test_me_no_token(self, client: TestClient, clean_databases):
        """Test current user retrieval without token."""
        response = client.get("/api/auth/me")
        assert response.status_code == 403

    def test_me_invalid_token(self, client: TestClient, clean_databases):
        """Test current user retrieval with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401

    def test_me_expired_token(self, client: TestClient, clean_databases, expired_token):
        """Test current user retrieval with expired token."""
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401


class TestProtectedRoutes:
    """Test protected route access."""

    def test_protected_route_success(self, client: TestClient, clean_databases):
        """Test successful access to protected route."""
        # Register and login user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        login_data = {"username": "testuser", "password": "testpassword123"}
        login_response = client.post("/api/auth/login", json=login_data)
        access_token = login_response.json()["access_token"]

        # Access protected route
        headers = {"Authorization": f"Bearer {access_token}"}
        response = client.get("/api/protected", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "Hello testuser!" in data["message"]
        assert data["user_id"] == 1  # Numeric user ID
        assert "timestamp" in data

    def test_protected_route_no_token(self, client: TestClient, clean_databases):
        """Test protected route access without token."""
        response = client.get("/api/protected")
        assert response.status_code == 403

    def test_protected_route_invalid_token(self, client: TestClient, clean_databases):
        """Test protected route access with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/protected", headers=headers)
        assert response.status_code == 401

    def test_protected_route_expired_token(
        self,
        client: TestClient,
        clean_databases,
        expired_token,
    ):
        """Test protected route access with expired token."""
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = client.get("/api/protected", headers=headers)
        assert response.status_code == 401


class TestHealthCheck:
    """Test health check endpoint."""

    def test_health_check(self, client: TestClient):
        """Test health check endpoint."""
        response = client.get("/api/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Reynard API is running"
        assert data["version"] == "1.0.0"
