#!/usr/bin/env python3
"""
Test script for the Reynard FastAPI backend
This script tests the authentication endpoints and JWT functionality
"""

import json
import sys
from typing import Any, Dict

import requests

BASE_URL = "http://localhost:8000"


def test_health_check() -> bool:
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        return False


def test_user_registration() -> Dict[str, Any]:
    """Test user registration"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
    }

    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        if response.status_code == 200:
            print("✅ User registration passed")
            return response.json()
        else:
            print(
                f"❌ User registration failed: {response.status_code} - {response.text}"
            )
            return {}
    except Exception as e:
        print(f"❌ User registration error: {e}")
        return {}


def test_user_login() -> Dict[str, Any]:
    """Test user login"""
    login_data = {"username": "testuser", "password": "testpassword123"}

    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ User login passed")
            return response.json()
        else:
            print(f"❌ User login failed: {response.status_code} - {response.text}")
            return {}
    except Exception as e:
        print(f"❌ User login error: {e}")
        return {}


def test_protected_route(access_token: str) -> bool:
    """Test a protected route with JWT token"""
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(f"{BASE_URL}/api/protected", headers=headers)
        if response.status_code == 200:
            print("✅ Protected route access passed")
            return True
        else:
            print(
                f"❌ Protected route access failed: {response.status_code} - {response.text}"
            )
            return False
    except Exception as e:
        print(f"❌ Protected route error: {e}")
        return False


def test_user_info(access_token: str) -> bool:
    """Test getting user information"""
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        if response.status_code == 200:
            print("✅ User info retrieval passed")
            return True
        else:
            print(
                f"❌ User info retrieval failed: {response.status_code} - {response.text}"
            )
            return False
    except Exception as e:
        print(f"❌ User info error: {e}")
        return False


def test_token_refresh(refresh_token: str) -> bool:
    """Test token refresh"""
    refresh_data = {"refresh_token": refresh_token}

    try:
        response = requests.post(f"{BASE_URL}/api/auth/refresh", json=refresh_data)
        if response.status_code == 200:
            print("✅ Token refresh passed")
            return True
        else:
            print(f"❌ Token refresh failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Token refresh error: {e}")
        return False


def main():
    """Run all tests"""
    print("🦊 Testing Reynard FastAPI Backend")
    print("=" * 50)

    # Test health check
    if not test_health_check():
        sys.exit(1)

    # Test user registration
    user_info = test_user_registration()
    if not user_info:
        sys.exit(1)

    # Test user login
    login_response = test_user_login()
    if not login_response:
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
