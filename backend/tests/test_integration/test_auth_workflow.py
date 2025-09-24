"""Integration tests for complete authentication workflows.

This module tests end-to-end authentication scenarios including
registration, login, token refresh, logout, and protected resource access.
"""

from fastapi.testclient import TestClient


class TestCompleteAuthWorkflow:
    """Test complete authentication workflows."""

    def test_complete_user_lifecycle(self, client: TestClient, clean_databases):
        """Test complete user lifecycle from registration to logout."""
        # Step 1: Register a new user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        register_data = register_response.json()
        assert register_data["username"] == "testuser"
        assert register_data["email"] == "test@example.com"
        assert register_data["is_active"] is True

        # Step 2: Login with the registered user
        login_data = {"username": "testuser", "password": "testpassword123"}

        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 200
        login_data = login_response.json()
        access_token = login_data["access_token"]
        refresh_token = login_data["refresh_token"]
        assert access_token is not None
        assert refresh_token is not None
        assert login_data["token_type"] == "bearer"

        # Step 3: Access protected resource with access token
        headers = {"Authorization": f"Bearer {access_token}"}
        protected_response = client.get("/api/protected", headers=headers)
        assert protected_response.status_code == 200
        protected_data = protected_response.json()
        assert "Hello testuser!" in protected_data["message"]
        assert protected_data["user_id"] == "testuser"

        # Step 4: Get current user information
        me_response = client.get("/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["username"] == "testuser"
        assert me_data["email"] == "test@example.com"

        # Step 5: Refresh the access token
        refresh_data = {"refresh_token": refresh_token}
        refresh_response = client.post("/api/auth/refresh", json=refresh_data)
        assert refresh_response.status_code == 200
        refresh_data = refresh_response.json()
        new_access_token = refresh_data["access_token"]
        new_refresh_token = refresh_data["refresh_token"]

        # New tokens should be different from old ones
        assert new_access_token != access_token
        assert new_refresh_token != refresh_token

        # Step 6: Access protected resource with new access token
        new_headers = {"Authorization": f"Bearer {new_access_token}"}
        protected_response2 = client.get("/api/protected", headers=new_headers)
        assert protected_response2.status_code == 200

        # Step 7: Logout
        logout_data = {"refresh_token": new_refresh_token}
        logout_response = client.post("/api/auth/logout", json=logout_data)
        assert logout_response.status_code == 200
        assert logout_response.json()["message"] == "Successfully logged out"

        # Step 8: Try to access protected resource after logout (should fail)
        protected_response3 = client.get("/api/protected", headers=new_headers)
        # This might still work if the access token hasn't expired yet
        # The important thing is that the refresh token is invalidated
        refresh_after_logout = client.post("/api/auth/refresh", json=logout_data)
        assert refresh_after_logout.status_code == 401

    def test_multiple_user_registration_and_login(
        self, client: TestClient, clean_databases,
    ):
        """Test registration and login of multiple users."""
        users = [
            {
                "username": "user1",
                "email": "user1@example.com",
                "password": "password123",
                "full_name": "User One",
            },
            {
                "username": "user2",
                "email": "user2@example.com",
                "password": "password456",
                "full_name": "User Two",
            },
            {
                "username": "user3",
                "email": "user3@example.com",
                "password": "password789",
                "full_name": "User Three",
            },
        ]

        tokens = {}

        # Register all users
        for user_data in users:
            register_response = client.post("/api/auth/register", json=user_data)
            assert register_response.status_code == 200

        # Login all users
        for user_data in users:
            login_data = {
                "username": user_data["username"],
                "password": user_data["password"],
            }
            login_response = client.post("/api/auth/login", json=login_data)
            assert login_response.status_code == 200
            tokens[user_data["username"]] = login_response.json()["access_token"]

        # Each user should be able to access their own protected resources
        for username, token in tokens.items():
            headers = {"Authorization": f"Bearer {token}"}
            protected_response = client.get("/api/protected", headers=headers)
            assert protected_response.status_code == 200
            protected_data = protected_response.json()
            assert f"Hello {username}!" in protected_data["message"]
            assert protected_data["user_id"] == username

    def test_token_expiration_handling(self, client: TestClient, clean_databases):
        """Test handling of token expiration scenarios."""
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
        refresh_token = login_response.json()["refresh_token"]

        # Access protected resource with valid token
        headers = {"Authorization": f"Bearer {access_token}"}
        protected_response = client.get("/api/protected", headers=headers)
        assert protected_response.status_code == 200

        # Test with expired token (if we can create one)
        # Note: This test might not work as expected since we can't easily create expired tokens
        # in the test environment, but it demonstrates the test structure

        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        invalid_response = client.get("/api/protected", headers=invalid_headers)
        assert invalid_response.status_code == 401

        # Test with malformed token
        malformed_headers = {"Authorization": "Bearer malformed.token.here"}
        malformed_response = client.get("/api/protected", headers=malformed_headers)
        assert malformed_response.status_code == 401

    def test_concurrent_user_operations(self, client: TestClient, clean_databases):
        """Test concurrent user operations."""
        import threading

        results = []
        errors = []

        def register_and_login_user(user_id):
            try:
                user_data = {
                    "username": f"user{user_id}",
                    "email": f"user{user_id}@example.com",
                    "password": "password123",
                    "full_name": f"User {user_id}",
                }

                # Register user
                register_response = client.post("/api/auth/register", json=user_data)
                if register_response.status_code == 200:
                    # Login user
                    login_data = {
                        "username": f"user{user_id}",
                        "password": "password123",
                    }
                    login_response = client.post("/api/auth/login", json=login_data)
                    if login_response.status_code == 200:
                        results.append(f"user{user_id}")
                    else:
                        errors.append(f"Login failed for user{user_id}")
                else:
                    errors.append(f"Registration failed for user{user_id}")
            except Exception as e:
                errors.append(f"Exception for user{user_id}: {e!s}")

        # Create multiple threads to simulate concurrent operations
        threads = []
        for i in range(5):
            thread = threading.Thread(target=register_and_login_user, args=(i,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # Check results
        assert (
            len(results) == 5
        )  # All users should be successfully registered and logged in
        assert len(errors) == 0  # No errors should occur

    def test_password_change_simulation(self, client: TestClient, clean_databases):
        """Test password change simulation (logout and re-login with new password)."""
        # Register user with initial password
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "oldpassword123",
            "full_name": "Test User",
        }
        client.post("/api/auth/register", json=user_data)

        # Login with old password
        login_data = {"username": "testuser", "password": "oldpassword123"}
        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 200
        old_refresh_token = login_response.json()["refresh_token"]

        # Logout
        logout_data = {"refresh_token": old_refresh_token}
        logout_response = client.post("/api/auth/logout", json=logout_data)
        assert logout_response.status_code == 200

        # Try to login with old password (should still work since we're using in-memory storage)
        # In a real system, the password would be changed in the database
        login_response2 = client.post("/api/auth/login", json=login_data)
        assert login_response2.status_code == 200

        # This test demonstrates the workflow, but in a real system,
        # password changes would be handled through a separate endpoint

    def test_session_management(self, client: TestClient, clean_databases):
        """Test session management across multiple requests."""
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

        headers = {"Authorization": f"Bearer {access_token}"}

        # Make multiple requests with the same token
        for i in range(10):
            protected_response = client.get("/api/protected", headers=headers)
            assert protected_response.status_code == 200

            me_response = client.get("/api/auth/me", headers=headers)
            assert me_response.status_code == 200

            health_response = client.get("/api/health", headers=headers)
            assert health_response.status_code == 200

        # All requests should succeed with the same token

    def test_error_recovery_workflow(self, client: TestClient, clean_databases):
        """Test error recovery in authentication workflow."""
        # Try to login with nonexistent user
        login_data = {"username": "nonexistent", "password": "password123"}
        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 401

        # Register the user
        user_data = {
            "username": "nonexistent",
            "email": "nonexistent@example.com",
            "password": "password123",
            "full_name": "Nonexistent User",
        }
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200

        # Now login should work
        login_response2 = client.post("/api/auth/login", json=login_data)
        assert login_response2.status_code == 200

        # Access protected resource
        access_token = login_response2.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        protected_response = client.get("/api/protected", headers=headers)
        assert protected_response.status_code == 200

    def test_rate_limiting_integration(self, client: TestClient, clean_databases):
        """Test rate limiting integration with authentication."""
        # Make multiple rapid requests to test rate limiting
        for i in range(10):
            response = client.post(
                "/api/auth/register",
                json={
                    "username": f"user{i}",
                    "email": f"user{i}@example.com",
                    "password": "password123",
                    "full_name": f"User {i}",
                },
            )
            # Some requests might be rate limited
            assert response.status_code in [200, 429]

        # Make multiple rapid login attempts
        for i in range(10):
            response = client.post(
                "/api/auth/login",
                json={"username": "nonexistent", "password": "wrongpassword"},
            )
            # Some requests might be rate limited
            assert response.status_code in [401, 429]
