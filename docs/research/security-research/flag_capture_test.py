import requests
import json

BASE_URL = "http://localhost:7000"

def test_flag_capture():
    print("--- Testing /api/config for security flag ---")

    print("\n[+] Attempting to retrieve flag from /api/config (unauthenticated)...")
    try:
        response = requests.get(f"{BASE_URL}/api/config")
        print(f"    Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "security_flag" in data:
                flag = data["security_flag"]
                print(f"    [VULNERABILITY FOUND] Security Flag captured: {flag}")
                print("    The flag was accessible without authentication. This indicates an information disclosure vulnerability.")
            else:
                print("    [OK] Security Flag not found in unauthenticated /api/config response.")
        elif response.status_code == 401 or response.status_code == 403:
            print("    [OK] Access to /api/config is restricted as expected (authentication/authorization required).")
        else:
            print(f"    [WARNING] Unexpected status code {response.status_code} for /api/config.")
            print(f"    Response: {response.json()}")

    except requests.exceptions.ConnectionError as e:
        print(f"    [ERROR] Could not connect to the backend. Please ensure it's running on {BASE_URL}. Error: {e}")
    except json.JSONDecodeError:
        print(f"    [ERROR] Failed to decode JSON response. Response content: {response.text}")
    except Exception as e:
        print(f"    [ERROR] An unexpected error occurred: {e}")
        
    print("\n--- /api/config flag testing complete ---")

if __name__ == "__main__":
    test_flag_capture() 