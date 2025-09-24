import time

import requests

BASE_URL = "http://localhost:7000"
TARGET_ENDPOINT = "/api/login"


def test_rate_limiting(
    num_requests: int,
    delay_between_requests: float = 0.1,
    expected_status_code_on_block: int = 401,
):
    print(f"--- Testing rate limiting for {TARGET_ENDPOINT} ---")
    blocked_count = 0
    username = "testuser"
    password = "wrongpassword"

    for i in range(1, num_requests + 1):
        try:
            # For login, we need to send a POST request with credentials
            response = requests.post(
                f"{BASE_URL}{TARGET_ENDPOINT}",
                json={"username": username, "password": password},
            )
            print(
                f"Request {i}: Status Code: {response.status_code}, Response: {response.json()}",
            )

            if response.status_code == expected_status_code_on_block:
                blocked_count += 1
                print(
                    "    [POSSIBLE BLOCK] Expected 401 for invalid credentials. If repeated for many requests, it might indicate a block.",
                )
                # When rate limited, the response might still be 401, but the behavior changes (e.g., delay)
            if (
                response.status_code == 429
            ):  # Explicitly check for Too Many Requests status code
                print(
                    f"    [BLOCKED] Rate limit hit at request {i} with 429 Too Many Requests.",
                )
                blocked_count += 1
                time.sleep(
                    delay_between_requests * 5,
                )  # Longer delay to potentially reset

            time.sleep(delay_between_requests)
        except requests.exceptions.ConnectionError as e:
            print(f"Request {i}: Connection Error: {e}. Is the backend running?")
            break
        except Exception as e:
            print(f"Request {i}: An unexpected error occurred: {e}")
            break

    print(
        f"--- Rate limiting test complete. Total requests: {num_requests}, Blocked: {blocked_count} ---",
    )


if __name__ == "__main__":
    # The login rate limiter is 5 attempts in 10 minutes (600 seconds)
    # We'll send more than 5 requests to see if it blocks.
    NUM_REQUESTS_TO_SEND = 10
    DELAY_BETWEEN_REQUESTS = (
        1  # seconds (keep it low to hit the limit faster for testing)
    )

    test_rate_limiting(NUM_REQUESTS_TO_SEND, DELAY_BETWEEN_REQUESTS)
