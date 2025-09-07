import argparse

import requests


def test_unauthenticated_access(url, method="GET", data=None):
    """
    Tests for unauthenticated access to a given URL.
    :param url: The URL to test.
    :param method: The HTTP method to use ('GET' or 'POST').
    :param data: Dictionary of data to send with POST request.
    :return: True if access is restricted (e.g., 401, 403), False otherwise.
    """
    print(f"[+] Attempting to access {url} without authentication using {method}...")
    try:
        if method.upper() == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            response = requests.get(url, timeout=5)

        print(f"    Status Code: {response.status_code}")
        print(f"    Response: {response.json() if response.content else 'No content'}")

        if response.status_code in [401, 403]:
            print(
                f"    [OK] Access to {url} is restricted as expected (Status {response.status_code})."
            )
            return True
        else:
            print(
                f"    [FAIL] Unexpected status code {response.status_code}. Unauthenticated access might be possible."
            )
            return False
    except requests.exceptions.RequestException as e:
        print(f"    [ERROR] An error occurred: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Run security tests for API endpoints."
    )
    parser.add_argument(
        "--url", type=str, required=True, help="The URL of the API endpoint to test."
    )
    parser.add_argument(
        "--method",
        type=str,
        default="GET",
        choices=["GET", "POST"],
        help="The HTTP method to use (GET or POST). Defaults to GET.",
    )
    parser.add_argument(
        "--data",
        type=str,
        help='JSON string of data for POST requests (e.g., \'{"key": "value"}\').',
    )

    args = parser.parse_args()

    request_data = None
    if args.method.upper() == "POST" and args.data:
        import json

        try:
            request_data = json.loads(args.data)
        except json.JSONDecodeError:
            print("Error: Invalid JSON data provided for --data.")
            return

    print("--- Starting Security Test ---")
    test_unauthenticated_access(args.url, args.method, request_data)
    print("--- Security Test Complete ---")


if __name__ == "__main__":
    main()
