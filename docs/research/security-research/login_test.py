import json

import requests

BASE_URL = "http://localhost:7001"  # Corrected to backend port 7001


def test_login_endpoint():
    print("--- Testing /api/login endpoint ---")

    # Test case 1: Valid credentials (replace with actual valid credentials if known, or skip if not for now)
    # For a blackhat test, we'd typically try to bypass, so we'll focus on that.
    print("\n[+] Attempting login with invalid credentials...")
    invalid_credentials = {"username": "nonexistentuser", "password": "wrongpassword"}
    try:
        response = requests.post(f"{BASE_URL}/api/login", json=invalid_credentials)
        print(f"    Status Code: {response.status_code}")
        print(f"    Response: {response.json()}")
        if response.status_code == 401:
            print(
                "    [OK] Login failed as expected for invalid credentials (Status 401 Unauthorized)."
            )
        else:
            print(
                "    [WARNING] Unexpected status code for invalid credentials. Expected 401."
            )
    except requests.exceptions.ConnectionError as e:
        print(
            f"    [ERROR] Could not connect to the backend. Please ensure it's running on {BASE_URL}. Error: {e}"
        )
        return
    except Exception as e:
        print(f"    [ERROR] An unexpected error occurred: {e}")

    # Test case 2: Empty credentials
    print("\n[+] Attempting login with empty credentials...")
    empty_credentials = {"username": "", "password": ""}
    response = requests.post(f"{BASE_URL}/api/login", json=empty_credentials)
    print(f"    Status Code: {response.status_code}")
    print(f"    Response: {response.json()}")
    if response.status_code == 400:
        print(
            "    [OK] Login failed as expected for empty credentials (Status 400 Bad Request)."
        )
    else:
        print(
            "    [WARNING] Unexpected status code for empty credentials. Expected 400."
        )

    # Test case 3: SQL Injection attempt in username
    print("\n[+] Attempting SQL Injection in username field...")
    sql_injection_username = {"username": "' OR '1'='1", "password": "anypassword"}
    response = requests.post(f"{BASE_URL}/api/login", json=sql_injection_username)
    print(f"    Status Code: {response.status_code}")
    print(f"    Response: {response.json()}")
    if response.status_code in [401, 400]:
        print("    [OK] SQL Injection attempt in username failed as expected.")
    else:
        print(
            "    [WARNING] SQL Injection attempt in username might have succeeded or returned unexpected status."
        )

    # Test case 4: SQL Injection attempt in password
    print("\n[+] Attempting SQL Injection in password field...")
    sql_injection_password = {"username": "testuser", "password": "' OR '1'='1"}
    response = requests.post(f"{BASE_URL}/api/login", json=sql_injection_password)
    print(f"    Status Code: {response.status_code}")
    print(f"    Response: {response.json()}")
    if response.status_code in [401, 400]:
        print("    [OK] SQL Injection attempt in password failed as expected.")
    else:
        print(
            "    [WARNING] SQL Injection attempt in password might have succeeded or returned unexpected status."
        )

    # Test case 5: SQL Injection attempt with "OR 1=1" in username and empty password
    print(
        "\n[+] Attempting SQL Injection with ' OR 1=1' in username and empty password..."
    )
    sql_injection_bypass = {"username": "' OR 1=1 --", "password": ""}
    response = requests.post(f"{BASE_URL}/api/login", json=sql_injection_bypass)
    print(f"    Status Code: {response.status_code}")
    print(f"    Response: {response.json()}")
    if response.status_code in [401, 400]:
        print(
            "    [OK] SQL Injection bypass attempt in username with empty password failed as expected."
        )
    else:
        print(
            "    [WARNING] SQL Injection bypass attempt in username with empty password might have succeeded or returned unexpected status."
        )

    # Test case 6: Accessing a protected endpoint without authentication after login attempts
    print(
        "\n[+] Attempting to access /api/config without authentication after login attempts..."
    )
    try:
        response = requests.get(f"{BASE_URL}/api/config")
        print(f"    Status Code: {response.status_code}")
        print(f"    Response: {response.json()}")
        if response.status_code == 401 or response.status_code == 403:
            print(
                "    [OK] Access to /api/config is restricted as expected (authentication/authorization required)."
            )
        else:
            print(
                f"    [WARNING] Unexpected status code {response.status_code} for /api/config (expected 401/403)."
            )
    except requests.exceptions.ConnectionError as e:
        print(
            f"    [ERROR] Could not connect to the backend. Please ensure it's running on {BASE_URL}. Error: {e}"
        )
    except json.JSONDecodeError:
        print(
            f"    [ERROR] Failed to decode JSON response. Response content: {response.text}"
        )
    except Exception as e:
        print(f"    [ERROR] An unexpected error occurred: {e}")

    print("\n--- /api/login endpoint testing complete ---")


if __name__ == "__main__":
    test_login_endpoint()
