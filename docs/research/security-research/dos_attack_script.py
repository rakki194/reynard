import os
import random
import time

import requests

BASE_URL = "http://localhost:7000"

# --- Helper Functions ---


def create_dummy_file(filename: str, size_mb: int) -> str:
    """Creates a dummy file of a specified size in MB."""
    file_path = f"/tmp/{filename}"
    print(f"Creating dummy file: {file_path} of {size_mb} MB...")
    with open(file_path, "wb") as f:
        f.seek((size_mb * 1024 * 1024) - 1)
        f.write(b"\0")
    print(f"Dummy file created: {file_path}")
    return file_path


def delete_dummy_file(file_path: str):
    """Deletes a dummy file."""
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"Dummy file deleted: {file_path}")


def get_auth_token():
    """Retrieves an authentication token for an admin user.
    This assumes a valid admin user exists for testing purposes.
    In a real scenario, you'd securely obtain these credentials.
    """
    login_url = f"{BASE_URL}/api/login"
    admin_credentials = {
        "username": "admin",
        "password": "admin",
    }  # Replace with actual admin credentials
    try:
        response = requests.post(login_url, json=admin_credentials)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json().get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"Error getting auth token: {e}")
        return None


# --- Test Scenarios ---


async def test_large_file_upload(
    target_endpoint: str,
    file_size_mb: int,
    filename: str,
    is_profile_picture: bool = False,
):
    print(
        f"\n--- Testing large file upload to {target_endpoint} with {file_size_mb} MB file ---",
    )
    file_path = create_dummy_file(filename, file_size_mb)
    token = get_auth_token()

    if not token:
        print("Authentication token not obtained. Cannot proceed with upload test.")
        delete_dummy_file(file_path)
        return

    headers = {"Authorization": f"Bearer {token}"}

    try:
        with open(file_path, "rb") as f:
            files = {
                "file" if is_profile_picture else "files": (filename, f, "image/jpeg"),
            }
            print(f"Uploading {filename}...")
            response = requests.post(
                f"{BASE_URL}{target_endpoint}",
                files=files,
                headers=headers,
                timeout=300,
            )  # 5 min timeout
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")

            if response.status_code == 413:  # Payload Too Large
                print("    [OK] Server rejected upload due to payload too large.")
            elif (
                response.status_code == 400
                and "Unsupported image format" in response.text
            ):
                print(
                    "    [OK] Server rejected upload due to unsupported format (expected for large files).",
                )
            elif response.status_code == 200:
                print(
                    "    [WARNING] Large file upload succeeded. Consider reinforcing server-side size limits.",
                )
            else:
                print(
                    f"    [UNEXPECTED] Unexpected status code or error: {response.status_code}",
                )

    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error during upload: {e}. Is the backend running?")
    except requests.exceptions.Timeout:
        print("Request timed out. Server might be struggling with large file.")
    except Exception as e:
        print(f"An unexpected error occurred during upload: {e}")
    finally:
        delete_dummy_file(file_path)
    print("--- Large file upload test complete ---")


async def test_rapid_small_file_uploads(
    target_endpoint: str,
    num_files: int,
    file_size_kb: int,
    delay_between_uploads: float = 0.1,
):
    print(
        f"\n--- Testing rapid small file uploads to {target_endpoint} ({num_files} files, {file_size_kb} KB each) ---",
    )
    token = get_auth_token()

    if not token:
        print(
            "Authentication token not obtained. Cannot proceed with rapid upload test.",
        )
        return

    headers = {"Authorization": f"Bearer {token}"}
    successful_uploads = 0
    failed_uploads = 0
    file_paths = []

    try:
        for i in range(num_files):
            filename = f"small_file_{i}_{random.randint(1000, 9999)}.jpg"
            file_path = create_dummy_file(
                filename, file_size_kb / 1024,
            )  # Convert KB to MB
            file_paths.append(file_path)

            with open(file_path, "rb") as f:
                files = {"files": (filename, f, "image/jpeg")}
                try:
                    response = requests.post(
                        f"{BASE_URL}{target_endpoint}",
                        files=files,
                        headers=headers,
                        timeout=60,
                    )  # 1 min timeout
                    print(
                        f"Upload {i + 1}: Status Code: {response.status_code}, Response: {response.json()}",
                    )
                    if response.status_code == 200:
                        successful_uploads += 1
                    else:
                        failed_uploads += 1
                except requests.exceptions.RequestException as e:
                    print(f"Upload {i + 1}: Request failed: {e}")
                    failed_uploads += 1
            time.sleep(delay_between_uploads)

    except Exception as e:
        print(f"An unexpected error occurred during rapid uploads: {e}")
    finally:
        for fp in file_paths:
            delete_dummy_file(fp)
    print(
        f"--- Rapid small file upload test complete. Successful: {successful_uploads}, Failed: {failed_uploads} ---",
    )


if __name__ == "__main__":
    import asyncio

    async def main_tests():
        # Test large general file upload (e.g., to /api/upload)
        await test_large_file_upload(
            "/api/upload", 150, "very_large_image.jpg",
        )  # 150 MB, should be rejected by frontend MAX_FILE_SIZE (100MB)

        # Test large profile picture upload
        await test_large_file_upload(
            "/api/users/me/profile_picture",
            10,
            "large_profile_pic.jpg",
            is_profile_picture=True,
        )  # 10 MB

        # Test rapid small file uploads (e.g., to /api/upload)
        await test_rapid_small_file_uploads(
            "/api/upload", 50, 100,
        )  # 50 files, 100 KB each

    asyncio.run(main_tests())
