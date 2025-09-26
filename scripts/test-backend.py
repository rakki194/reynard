#!/usr/bin/env python3
"""Test script for the Reynard FastAPI backend
This script tests the authentication endpoints and JWT functionality
"""

import sys
from typing import Any, cast

import requests

BASE_URL = "http://localhost:8000"
REQUEST_TIMEOUT = 10  # seconds


def test_health_check() -> bool:
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=REQUEST_TIMEOUT)
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        print(f"❌ Health check failed: {response.status_code}")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        return False


def test_user_registration() -> dict[str, Any] | None:
    """Test user registration"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            print("✅ User registration passed")
            return cast("dict[str, Any]", response.json())
        print(f"❌ User registration failed: {response.status_code} - {response.text}")
        return None
    except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
        print(f"❌ User registration error: {e}")
        return None


def test_user_login() -> dict[str, Any] | None:
    """Test user login"""
    login_data = {"username": "testuser", "password": "testpassword123"}

    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            print("✅ User login passed")
            return cast("dict[str, Any]", response.json())
        print(f"❌ User login failed: {response.status_code} - {response.text}")
        return None
    except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
        print(f"❌ User login error: {e}")
        return None


def test_protected_route(access_token: str) -> bool:
    """Test a protected route with JWT token"""
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(
            f"{BASE_URL}/api/protected",
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            print("✅ Protected route access passed")
            return True
        print(
            f"❌ Protected route access failed: {response.status_code} - {response.text}",
        )
        return False
    except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
        print(f"❌ Protected route error: {e}")
        return False


def test_user_info(access_token: str) -> bool:
    """Test getting user information"""
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            print("✅ User info retrieval passed")
            return True
        print(
            f"❌ User info retrieval failed: {response.status_code} - {response.text}",
        )
        return False
    except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
        print(f"❌ User info error: {e}")
        return False


def test_token_refresh(refresh_token: str) -> bool:
    """Test token refresh"""
    refresh_data = {"refresh_token": refresh_token}

    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/refresh",
            json=refresh_data,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            print("✅ Token refresh passed")
            return True
        print(f"❌ Token refresh failed: {response.status_code} - {response.text}")
        return False
    except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
        print(f"❌ Token refresh error: {e}")
        return False


def main() -> None:
    """Run all tests"""
    print("🦊 Testing Reynard FastAPI Backend")
    print("=" * 50)

    # Test health check
    if not test_health_check():
        sys.exit(1)

    # Test user registration
    user_info = test_user_registration()
    if user_info is None:
        sys.exit(1)

    # Test user login
    login_response = test_user_login()
    if login_response is None:
        sys.exit(1)

    access_token = login_response.get("access_token")
    refresh_token = login_response.get("refresh_token")

    if not access_token or not refresh_token:
        print("❌ No tokens received from login")
        sys.exit(1)

    # Test protected route
    if not test_protected_route(access_token):
        sys.exit(1)

    # Test user info
    if not test_user_info(access_token):
        sys.exit(1)

    # Test token refresh
    if not test_token_refresh(refresh_token):
        sys.exit(1)

    print("=" * 50)
    print("🎉 All tests passed! The backend is working correctly.")
    print(f"📚 API documentation: {BASE_URL}/api/docs")


if __name__ == "__main__":
    main()
