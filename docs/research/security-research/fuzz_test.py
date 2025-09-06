
import httpx
import random
import string

BASE_URL = "http://localhost:7000"

def generate_random_string(length):
    return ''.join(random.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(length))

def generate_malicious_path():
    payloads = [
        "../../../../../../etc/passwd",
        "C:\windows\system32\drivers\etc\hosts",
        "/proc/self/cmdline",
        "UNION SELECT NULL,NULL,NULL--",
        "' OR 1=1--",
        "<script>alert(1)</script>",
        "file:///etc/passwd",
        "http://evil.com",
        "\\share\evil.txt",
        "$(rm -rf /)",
        "index.php%00.txt",
        "foo%20bar",
        "fu%%bar",
        "fuzz%25ing",
        "a" * 2000, # Long string
        "\x00", # Null byte
        "\n", # Newline
        "\r\n", # CRLF
        "\\", # Backslash
        "\"", # Double quote
        "'", # Single quote
        "`", # Backtick
        "|", # Pipe
        "&", # Ampersand
        ";", # Semicolon
        "<", # Less than
        ">", # Greater than
        "(", # Parenthesis open
        ")", # Parenthesis close
        "{", # Curly brace open
        "}", # Curly brace close
        "[", # Square bracket open
        "]", # Square bracket close
        "*", # Asterisk
        "?", # Question mark
        "!", # Exclamation mark
        "@", # At symbol
        "#", # Hash
        "$", # Dollar sign
        "%", # Percent
        "^", # Caret
        "=", # Equals
        "+", # Plus
        ",", # Comma
        ".", # Dot
        "/", # Slash
        "~", # Tilde
    ]
    return random.choice(payloads)

def generate_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def generate_random_bytes(length):
    return bytes(random.randint(0, 255) for _ in range(length))

async def register_and_login_user(username, password):
    # Register user
    register_data = {"username": username, "password": password}
    try:
        register_response = httpx.post(f"{BASE_URL}/api/register", json=register_data, timeout=5)
        print(f"Registration for {username}: Status Code: {register_response.status_code}, Response: {register_response.text.strip()[:100]}...")
        if register_response.status_code not in [200, 201]:
            print(f"Failed to register user {username}. Skipping login.")
            return None
    except httpx.RequestError as e:
        print(f"Registration request failed for {username}: {e}")
        return None

    # Login user
    login_data = {"username": username, "password": password}
    try:
        login_response = httpx.post(f"{BASE_URL}/api/login", json=login_data, timeout=5)
        print(f"Login for {username}: Status Code: {login_response.status_code}, Response: {login_response.text.strip()[:100]}...")
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        else:
            print(f"Failed to login user {username}. Status: {login_response.status_code}")
            return None
    except httpx.RequestError as e:
        print(f"Login request failed for {username}: {e}")
        return None

async def register_and_login_admin_user(username, password):
    # Register user (should become admin if it's the first user)
    register_data = {"username": username, "password": password}
    try:
        register_response = httpx.post(f"{BASE_URL}/api/register", json=register_data, timeout=5)
        print(f"Admin Registration for {username}: Status Code: {register_response.status_code}, Response: {register_response.text.strip()[:100]}...")
        if register_response.status_code not in [200, 201]:
            print(f"Failed to register admin user {username}. Skipping login.")
            return None, None
    except httpx.RequestError as e:
        print(f"Admin Registration request failed for {username}: {e}")
        return None, None

    # Login user
    login_data = {"username": username, "password": password}
    try:
        login_response = httpx.post(f"{BASE_URL}/api/login", json=login_data, timeout=5)
        print(f"Admin Login for {username}: Status Code: {login_response.status_code}, Response: {login_response.text.strip()[:100]}...")
        if login_response.status_code == 200:
            return login_response.json().get("access_token"), login_response.json().get("refresh_token")
        else:
            print(f"Failed to login admin user {username}. Status: {login_response.status_code}")
            return None, None
    except httpx.RequestError as e:
        print(f"Admin Login request failed for {username}: {e}")
        return None, None

async def fuzz_engagement_record_endpoint():
    print("--- Fuzzing /api/engagement/record (POST) endpoint ---")
    engagement_types = ["view", "click", "like", "share", "invalid_type", "a"*50]
    for _ in range(10):
        fuzzed_username = generate_random_string(random.randint(1, 20))
        fuzzed_engagement_type = random.choice(engagement_types)
        fuzzed_value = random.choice([0.0, 1.0, -1.0, 1000.0, 0.001, "invalid_value"])
        fuzzed_metadata = random.choice([
            {},
            {"key": "value"},
            {"long_key": generate_random_string(100)},
            {"nested": {"data": 123}},
            "invalid_metadata_string",
            [],
        ])

        record_data = {
            "username": str(fuzzed_username),
            "engagement_type": str(fuzzed_engagement_type),
            "value": fuzzed_value,
            "metadata": fuzzed_metadata
        }

        try:
            response = await httpx.AsyncClient().post(f"{BASE_URL}/api/engagement/record", json=record_data, timeout=5)
            print(f"Record Engagement (User: '{fuzzed_username}', Type: '{fuzzed_engagement_type}', Value: {fuzzed_value}, Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Record Engagement request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during record engagement: {e}")
    print("--- Fuzzing /api/engagement/record (POST) endpoint complete ---\n")

async def fuzz_profile_picture_upload(headers):
    print("--- Fuzzing /api/users/me/profile_picture (POST) endpoint ---")
    if not headers:
        print("Skipping fuzz_profile_picture_upload. No authentication headers.")
        return
    content_types = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/octet-stream", "text/plain"]
    for _ in range(5):
        fuzzed_content_type = random.choice(content_types)
        fuzzed_filename = generate_random_string(10) + "." + random.choice(["png", "jpg", "webp", "gif", "txt"])
        fuzzed_file_content = generate_random_bytes(random.randint(10, 1024 * 10)) # 10 bytes to 10KB

        files = {"file": (fuzzed_filename, fuzzed_file_content, fuzzed_content_type)}
        try:
            response = await httpx.AsyncClient().post(f"{BASE_URL}/api/users/me/profile_picture", headers=headers, files=files, timeout=10)
            print(f"Upload File: '{fuzzed_filename}', Type: '{fuzzed_content_type}', Size: {len(fuzzed_file_content)} bytes, Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Upload request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during upload: {e}")
    print("--- Fuzzing /api/users/me/profile_picture (POST) endpoint complete ---\n")

async def fuzz_get_profile_picture(headers):
    print("--- Fuzzing /api/users/me/profile_picture (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_get_profile_picture. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/users/me/profile_picture", headers=headers, timeout=5)
        print(f"GET Profile Picture: Status Code: {response.status_code}, Content Length: {len(response.content) if response.content else 0}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET Profile Picture request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET Profile Picture: {e}")
    print("--- Fuzzing /api/users/me/profile_picture (GET) endpoint complete ---\n")

async def fuzz_update_user_profile(headers):
    print("--- Fuzzing /api/users/me/profile (PUT) endpoint ---")
    if not headers:
        print("Skipping fuzz_update_user_profile. No authentication headers.")
        return
    common_fuzz_values = ["", " ", "null", "undefined", "a" * 1000, "<script>alert('XSS')</script>"]
    for _ in range(10):
        fuzzed_username = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        profile_data = {"username": str(fuzzed_username)}
        try:
            response = await httpx.AsyncClient().put(f"{BASE_URL}/api/users/me/profile", headers=headers, json=profile_data, timeout=5)
            print(f"Update Profile Username: '{profile_data['username']}', Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Update profile request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during profile update: {e}")
    print("--- Fuzzing /api/users/me/profile (PUT) endpoint complete ---\n")

async def fuzz_change_user_password(headers):
    print("--- Fuzzing /api/users/me/password (PUT) endpoint ---")
    if not headers:
        print("Skipping fuzz_change_user_password. No authentication headers.")
        return
    common_fuzz_values = ["", " ", "null", "undefined", "a" * 1000, "<script>alert('XSS')</script>"]
    for _ in range(10):
        current_password_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        new_password_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        password_data = {"current_password": str(current_password_fuzz), "new_password": str(new_password_fuzz)}
        try:
            response = await httpx.AsyncClient().put(f"{BASE_URL}/api/users/me/password", headers=headers, json=password_data, timeout=5)
            print(f"Change Password (Current: '{password_data['current_password']}', New: '{password_data['new_password']}'): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Change password request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during password change: {e}")
    print("--- Fuzzing /api/users/me/password (PUT) endpoint complete ---\n")

async def fuzz_get_user_settings(headers):
    print("--- Fuzzing /api/users/me/settings (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_get_user_settings. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/users/me/settings", headers=headers, timeout=5)
        print(f"GET User Settings: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET User Settings request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET user settings: {e}")
    print("--- Fuzzing /api/users/me/settings (GET) endpoint complete ---\n")

async def fuzz_update_user_settings(headers):
    print("--- Fuzzing /api/users/me/settings (PUT) endpoint ---")
    if not headers:
        print("Skipping fuzz_update_user_settings. No authentication headers.")
        return
    # Fuzzing settings can involve various data types (string, int, bool, dict, list)
    setting_values = [
        "", " ", "null", "undefined", "0", "1", "true", "false",
        [], {}, {"key": "value"}, {"malicious": "<script>alert(1)</script>"},
        generate_random_string(50),
    ]
    for _ in range(10):
        fuzzed_setting = random.choice(setting_values)
        settings_data = {"settings": fuzzed_setting}
        try:
            response = await httpx.AsyncClient().put(f"{BASE_URL}/api/users/me/settings", headers=headers, json=settings_data, timeout=5)
            print(f"Update User Settings (Fuzzed Value: {str(fuzzed_setting)[:50]}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Update User Settings request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during update user settings: {e}")
    print("--- Fuzzing /api/users/me/settings (PUT) endpoint complete ---\n")

async def fuzz_get_my_yapcoins(headers):
    print("--- Fuzzing /api/users/me/yapcoins (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_get_my_yapcoins. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/users/me/yapcoins", headers=headers, timeout=5)
        print(f"GET My Yapcoins: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET My Yapcoins request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET my yapcoins: {e}")
    print("--- Fuzzing /api/users/me/yapcoins (GET) endpoint complete ---\n")

async def fuzz_admin_get_user_engagement_data(admin_headers):
    print("--- Fuzzing /api/engagement/users/{username} (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_get_user_engagement_data. No admin authentication headers.")
        return
    test_usernames = ["test_user_engagement", "non_existent_user", generate_random_string(20), "", "<script>alert(1)</script>"]

    # Register a user for testing engagement data retrieval
    target_username = "user_for_engagement_data_" + generate_random_string(5)
    await register_and_login_user(target_username, "password123")
    # Record some engagement for this user
    await httpx.AsyncClient().post(f"{BASE_URL}/api/engagement/record", json={
        "username": target_username, "engagement_type": "test_view", "value": 1.0
    }, timeout=5)

    for username in test_usernames + [target_username]:
        try:
            response = await httpx.AsyncClient().get(f"{BASE_URL}/api/engagement/users/{username}", headers=admin_headers, timeout=5)
            print(f"Admin Get User Engagement (User: '{username}'): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Admin Get User Engagement request failed for {username}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during admin get user engagement: {e}")
    print("--- Fuzzing /api/engagement/users/{username} (GET) endpoint complete ---\n")

async def fuzz_admin_get_all_user_engagement_data(admin_headers):
    print("--- Fuzzing /api/engagement/all (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_get_all_user_engagement_data. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/engagement/all", headers=admin_headers, timeout=5)
        print(f"Admin Get All User Engagement: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Admin Get All User Engagement request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during admin get all user engagement: {e}")
    print("--- Fuzzing /api/engagement/all (GET) endpoint complete ---\n")

async def fuzz_admin_delete_user_engagement_data(admin_headers):
    print("--- Fuzzing /api/engagement/users/{username} (DELETE) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_delete_user_engagement_data. No admin authentication headers.")
        return
    test_usernames = ["test_user_to_delete_engagement", "non_existent_user_delete", generate_random_string(20), "", "<script>alert(1)</script>"]

    # Register a user for testing engagement data deletion
    target_username = "user_to_delete_engagement_" + generate_random_string(5)
    await register_and_login_user(target_username, "password123")
    await httpx.AsyncClient().post(f"{BASE_URL}/api/engagement/record", json={
        "username": target_username, "engagement_type": "to_delete", "value": 1.0
    }, timeout=5)

    for username in test_usernames + [target_username]:
        try:
            response = await httpx.AsyncClient().delete(f"{BASE_URL}/api/engagement/users/{username}", headers=admin_headers, timeout=5)
            print(f"Admin Delete User Engagement (User: '{username}'): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Admin Delete User Engagement request failed for {username}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during admin delete user engagement: {e}")
    print("--- Fuzzing /api/engagement/users/{username} (DELETE) endpoint complete ---\n")

async def fuzz_admin_delete_all_user_engagement_data(admin_headers):
    print("--- Fuzzing /api/engagement/all (DELETE) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_delete_all_user_engagement_data. No admin authentication headers.")
        return
    # Create some users and engagement data to be deleted
    for i in range(3):
        username = f"user_for_delete_all_{i}"
        await register_and_login_user(username, "password123")
        await httpx.AsyncClient().post(f"{BASE_URL}/api/engagement/record", json={
            "username": username, "engagement_type": f"type_{i}", "value": float(i)
        }, timeout=5)

    try:
        response = await httpx.AsyncClient().delete(f"{BASE_URL}/api/engagement/all", headers=admin_headers, timeout=5)
        print(f"Admin Delete All User Engagement: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Admin Delete All User Engagement request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during admin delete all user engagement: {e}")
    print("--- Fuzzing /api/engagement/all (DELETE) endpoint complete ---\n")

async def fuzz_admin_get_engagement_insights(admin_headers):
    print("--- Fuzzing /api/engagement/insights (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_get_engagement_insights. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/engagement/insights", headers=admin_headers, timeout=10)
        print(f"Admin Get Engagement Insights: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Admin Get Engagement Insights request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during admin get engagement insights: {e}")
    print("--- Fuzzing /api/engagement/insights (GET) endpoint complete ---\n")

async def fuzz_refresh_token_endpoint(refresh_token):
    print("--- Fuzzing /api/refresh-token (POST) endpoint ---")
    if not refresh_token:
        print("No refresh token available. Skipping fuzz_refresh_token_endpoint.")
        return

    headers = {"Authorization": f"Bearer {refresh_token}"}
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/refresh-token", headers=headers, timeout=5)
        print(f"Refresh Token: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Refresh Token request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during refresh token: {e}")
    print("--- Fuzzing /api/refresh-token (POST) endpoint complete ---\n")

async def fuzz_admin_get_all_users(admin_headers):
    print("--- Fuzzing /api/admin/users (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_get_all_users. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/admin/users", headers=admin_headers, timeout=5)
        print(f"Admin Get All Users: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Admin Get All Users request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during admin get all users: {e}")
    print("--- Fuzzing /api/admin/users (GET) endpoint complete ---\n")

async def fuzz_admin_update_user_role(admin_headers):
    print("--- Fuzzing /api/admin/users/{username}/role (PUT) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_update_user_role. No admin authentication headers.")
        return
    roles = ["admin", "regular_user", "guest", "invalid_role"]
    test_usernames = ["test_user_for_role_change", generate_random_string(10)]

    # First, try to create a user to modify their role
    target_username = "user_to_change_role_" + generate_random_string(5)
    await register_and_login_user(target_username, "password123") # Register a user for role change

    for username in test_usernames + [target_username]:
        for role in roles:
            role_data = {"role": role}
            try:
                response = await httpx.AsyncClient().put(f"{BASE_URL}/api/admin/users/{username}/role", headers=admin_headers, json=role_data, timeout=5)
                print(f"Admin Update User Role (User: '{username}', Role: '{role}'): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"Admin Update User Role request failed for {username} with role {role}: {e}")
            except Exception as e:
                print(f"An unexpected error occurred during admin update user role for {username} with role {role}: {e}")
    print("--- Fuzzing /api/admin/users/{username}/role (PUT) endpoint complete ---\n")

async def fuzz_admin_manage_yapcoins(admin_headers):
    print("--- Fuzzing /api/admin/yapcoins (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_admin_manage_yapcoins. No admin authentication headers.")
        return
    amounts = [0, 1, -1, 1000, -1000, generate_random_int(-10000, 10000)]
    test_usernames = ["test_user_for_yapcoins", generate_random_string(10)]

    # First, try to create a user to modify their yapcoins
    target_username = "user_for_yapcoins_" + generate_random_string(5)
    await register_and_login_user(target_username, "password123") # Register a user for yapcoins

    for username in test_usernames + [target_username]:
        for amount in amounts:
            yapcoin_data = {"username": username, "amount": amount}
            try:
                response = await httpx.AsyncClient().post(f"{BASE_URL}/api/admin/yapcoins", headers=admin_headers, json=yapcoin_data, timeout=5)
                print(f"Admin Manage Yapcoins (User: '{username}', Amount: {amount}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"Admin Manage Yapcoins request failed for {username} with amount {amount}: {e}")
            except Exception as e:
                print(f"An unexpected error occurred during admin manage yapcoins for {username} with amount {amount}: {e}")
    print("--- Fuzzing /api/admin/yapcoins (POST) endpoint complete ---\n")

async def fuzz_get_indexing_status(headers):
    print("--- Fuzzing /api/index/status (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_get_indexing_status. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/index/status", headers=headers, timeout=5)
        print(f"GET Indexing Status: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET Indexing Status request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET indexing status: {e}")
    print("--- Fuzzing /api/index/status (GET) endpoint complete ---\n")

async def fuzz_start_indexing(admin_headers):
    print("--- Fuzzing /api/index/start (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_start_indexing. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/start", headers=admin_headers, timeout=5)
        print(f"Start Indexing: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Start Indexing request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during start indexing: {e}")
    print("--- Fuzzing /api/index/start (POST) endpoint complete ---\n")

async def fuzz_smart_start_indexing(admin_headers):
    print("--- Fuzzing /api/index/smart-start (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_smart_start_indexing. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/smart-start", headers=admin_headers, timeout=5)
        print(f"Smart Start Indexing: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Smart Start Indexing request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during smart start indexing: {e}")
    print("--- Fuzzing /api/index/smart-start (POST) endpoint complete ---\n")

async def fuzz_stop_indexing(admin_headers):
    print("--- Fuzzing /api/index/stop (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_stop_indexing. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/stop", headers=admin_headers, timeout=5)
        print(f"Stop Indexing: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Stop Indexing request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during stop indexing: {e}")
    print("--- Fuzzing /api/index/stop (POST) endpoint complete ---\n")

async def fuzz_pause_indexing(admin_headers):
    print("--- Fuzzing /api/index/pause (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_pause_indexing. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/pause", headers=admin_headers, timeout=5)
        print(f"Pause Indexing: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Pause Indexing request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during pause indexing: {e}")
    print("--- Fuzzing /api/index/pause (POST) endpoint complete ---\n")

async def fuzz_resume_indexing(admin_headers):
    print("--- Fuzzing /api/index/resume (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_resume_indexing. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/resume", headers=admin_headers, timeout=5)
        print(f"Resume Indexing: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Resume Indexing request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during resume indexing: {e}")
    print("--- Fuzzing /api/index/resume (POST) endpoint complete ---\n")

async def fuzz_get_fast_indexing_mode(admin_headers):
    print("--- Fuzzing /api/index/fast-mode (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_get_fast_indexing_mode. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/index/fast-mode", headers=admin_headers, timeout=5)
        print(f"GET Fast Indexing Mode: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET Fast Indexing Mode request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET fast indexing mode: {e}")
    print("--- Fuzzing /api/index/fast-mode (GET) endpoint complete ---\n")

async def fuzz_set_fast_indexing_mode(admin_headers):
    print("--- Fuzzing /api/index/fast-mode (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_set_fast_indexing_mode. No admin authentication headers.")
        return
    fuzz_values = [True, False, "true", "false", "1", "0", 1, 0, None, "invalid"]
    for val in fuzz_values:
        payload = {"fast_mode": val}
        try:
            response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/fast-mode", headers=admin_headers, json=payload, timeout=5)
            print(f"Set Fast Indexing Mode (Value: {val}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Set Fast Indexing Mode request failed for value {val}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during set fast indexing mode for value {val}: {e}")
    print("--- Fuzzing /api/index/fast-mode (POST) endpoint complete ---\n")

async def fuzz_get_indexing_enabled(admin_headers):
    print("--- Fuzzing /api/index/enabled (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_get_indexing_enabled. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/index/enabled", headers=admin_headers, timeout=5)
        print(f"GET Indexing Enabled: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET Indexing Enabled request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET indexing enabled: {e}")
    print("--- Fuzzing /api/index/enabled (GET) endpoint complete ---\n")

async def fuzz_set_indexing_enabled(admin_headers):
    print("--- Fuzzing /api/index/enabled (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_set_indexing_enabled. No admin authentication headers.")
        return
    fuzz_values = [True, False, "true", "false", "1", "0", 1, 0, None, "invalid"]
    for val in fuzz_values:
        payload = {"indexing_enabled": val}
        try:
            response = await httpx.AsyncClient().post(f"{BASE_URL}/api/index/enabled", headers=admin_headers, json=payload, timeout=5)
            print(f"Set Indexing Enabled (Value: {val}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Set Indexing Enabled request failed for value {val}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during set indexing enabled for value {val}: {e}")
    print("--- Fuzzing /api/index/enabled (POST) endpoint complete ---\n")

async def create_test_memory(headers, username, memory_type="preference", title_prefix="test_memory_", content_prefix="test_content_"):
    if not headers:
        print(f"Skipping create_test_memory for {username}. No authentication headers.")
        return None
    random_suffix = generate_random_string(8)
    title = f"{title_prefix}{random_suffix}"
    content = f"{content_prefix}{random_suffix}"
    memory_data = {
        "memory_type": memory_type,
        "title": title,
        "content": content,
        "importance": random.randint(1, 4),
        "confidence": round(random.uniform(0.1, 1.0), 2),
        "tags": [generate_random_string(5), generate_random_string(7)],
        "expires_in_days": random.choice([None, random.randint(1, 30)])
    }
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/memory", headers=headers, json=memory_data, timeout=5)
        if response.status_code == 200:
            memory_id = response.json().get("memory_id")
            print(f"Created test memory: {memory_id}")
            return memory_id
        else:
            print(f"Failed to create test memory (Status: {response.status_code}, Response: {response.text.strip()[:100]}).")
            return None
    except httpx.RequestError as e:
        print(f"Failed to create test memory: {e}")
        return None


async def fuzz_create_memory_endpoint(headers):
    print("--- Fuzzing /api/memory/ (POST) endpoint ---")
    if not headers:
        print("Skipping fuzz_create_memory_endpoint. No authentication headers.")
        return
    memory_types = ["preference", "behavior", "context", "skill", "pattern", "invalid_type", "a"*50]
    importance_levels = [1, 2, 3, 4, 0, 5, "invalid"]

    for _ in range(10):
        fuzzed_memory_type = random.choice(memory_types)
        fuzzed_title = generate_random_string(random.randint(1, 100))
        fuzzed_content = generate_random_string(random.randint(1, 500))
        fuzzed_importance = random.choice(importance_levels)
        fuzzed_confidence = random.choice([0.0, 0.5, 1.0, -0.1, 1.1, "invalid"])
        fuzzed_tags = random.choice([[], [generate_random_string(5), generate_random_string(7)], ["<script>alert(1)</script>"] * 3])
        fuzzed_expires_in_days = random.choice([None, 1, 30, -1, 366, "invalid"])

        memory_data = {
            "memory_type": fuzzed_memory_type,
            "title": fuzzed_title,
            "content": fuzzed_content,
            "importance": fuzzed_importance,
            "confidence": fuzzed_confidence,
            "tags": fuzzed_tags,
            "expires_in_days": fuzzed_expires_in_days
        }

        try:
            response = await httpx.AsyncClient().post(f"{BASE_URL}/api/memory", headers=headers, json=memory_data, timeout=5)
            print(f"Create Memory (Type: '{fuzzed_memory_type}', Title: '{fuzzed_title[:30]}...', Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Create Memory request failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during create memory: {e}")
    print("--- Fuzzing /api/memory/ (POST) endpoint complete ---\n")

async def fuzz_get_memory_by_id_endpoint(headers, admin_headers, test_user_memory_id=None, admin_user_memory_id=None):
    print("--- Fuzzing /api/memory/{memory_id} (GET) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_get_memory_by_id_endpoint. No authentication headers for regular or admin user.")
        return
    test_memory_ids = ["non_existent_id", generate_random_string(24), "<script>alert(1)</script>"]
    if test_user_memory_id: test_memory_ids.append(test_user_memory_id)
    if admin_user_memory_id: test_memory_ids.append(admin_user_memory_id)

    for memory_id in test_memory_ids:
        # Test with regular user headers
        if headers:
            try:
                response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/{memory_id}", headers=headers, timeout=5)
                print(f"GET Memory (ID: '{memory_id}', User: Regular): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"GET Memory request failed for ID '{memory_id}' (Regular User): {e}")
            except Exception as e:
                print(f"An unexpected error occurred during GET memory for ID '{memory_id}' (Regular User): {e}")

        # Test with admin headers (should also work if admin can access all memories or has their own)
        if admin_headers:
            try:
                response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/{memory_id}", headers=admin_headers, timeout=5)
                print(f"GET Memory (ID: '{memory_id}', User: Admin): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"GET Memory request failed for ID '{memory_id}' (Admin User): {e}")
            except Exception as e:
                print(f"An unexpected error occurred during GET memory for ID '{memory_id}' (Admin User): {e}")

    print("--- Fuzzing /api/memory/{memory_id} (GET) endpoint complete ---\n")

async def fuzz_list_memories_endpoint(headers, admin_headers):
    print("--- Fuzzing /api/memory/ (GET) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_list_memories_endpoint. No authentication headers for regular or admin user.")
        return
    memory_types = ["preference", "behavior", "context", "skill", "pattern", "invalid_type", "", "a"*20]
    limits = [1, 10, 100, 0, 101, -1]
    importance_thresholds = [1, 4, 0, 5, "invalid"]

    for mem_type in memory_types:
        for limit in limits:
            for importance in importance_thresholds:
                params = {"memory_type": mem_type, "limit": limit, "importance_threshold": importance}
                # Test with regular user headers
                if headers:
                    try:
                        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/", headers=headers, params=params, timeout=5)
                        print(f"List Memories (Type: '{mem_type}', Limit: {limit}, Importance: {importance}, User: Regular): Status Code: {response.status_code}, Total: {response.json().get("total", "N/A")}, Response: {response.text.strip()[:100]}...")
                    except httpx.RequestError as e:
                        print(f"List Memories request failed (Regular User): {e}")
                    except Exception as e:
                        print(f"An unexpected error occurred during list memories (Regular User): {e}")

                # Test with admin headers
                if admin_headers:
                    try:
                        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/", headers=admin_headers, params=params, timeout=5)
                        print(f"List Memories (Type: '{mem_type}', Limit: {limit}, Importance: {importance}, User: Admin): Status Code: {response.status_code}, Total: {response.json().get("total", "N/A")}, Response: {response.text.strip()[:100]}...")
                    except httpx.RequestError as e:
                        print(f"List Memories request failed (Admin User): {e}")
                    except Exception as e:
                        print(f"An unexpected error occurred during list memories (Admin User): {e}")
    print("--- Fuzzing /api/memory/ (GET) endpoint complete ---\n")

async def fuzz_search_memories_endpoint(headers, admin_headers):
    print("--- Fuzzing /api/memory/search/ (GET) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_search_memories_endpoint. No authentication headers for regular or admin user.")
        return
    search_queries = [generate_random_string(random.randint(1, 20)), "", "<script>alert(1)</script>", "test", "content", "null", "undefined"]
    memory_types = ["preference", "behavior", "invalid_type", ""]
    limits = [1, 10, 20, 0, 101, -1]

    for query in search_queries:
        for mem_type in memory_types:
            for limit in limits:
                params = {"q": query, "memory_type": mem_type, "limit": limit}
                # Test with regular user headers
                if headers:
                    try:
                        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/search/", headers=headers, params=params, timeout=5)
                        print(f"Search Memories (Query: '{query[:30]}...', Type: '{mem_type}', Limit: {limit}, User: Regular): Status Code: {response.status_code}, Total: {response.json().get("total", "N/A")}, Response: {response.text.strip()[:100]}...")
                    except httpx.RequestError as e:
                        print(f"Search Memories request failed (Regular User): {e}")
                    except Exception as e:
                        print(f"An unexpected error occurred during search memories (Regular User): {e}")

                # Test with admin headers
                if admin_headers:
                    try:
                        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/search/", headers=admin_headers, params=params, timeout=5)
                        print(f"Search Memories (Query: '{query[:30]}...', Type: '{mem_type}', Limit: {limit}, User: Admin): Status Code: {response.status_code}, Total: {response.json().get("total", "N/A")}, Response: {response.text.strip()[:100]}...")
                    except httpx.RequestError as e:
                        print(f"Search Memories request failed (Admin User): {e}")
                    except Exception as e:
                        print(f"An unexpected error occurred during search memories (Admin User): {e}")
    print("--- Fuzzing /api/memory/search/ (GET) endpoint complete ---\n")

async def fuzz_update_memory_endpoint(headers, admin_headers, test_user_memory_id=None, admin_user_memory_id=None):
    print("--- Fuzzing /api/memory/{memory_id} (PUT) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_update_memory_endpoint. No authentication headers for regular or admin user.")
        return
    test_memory_ids = ["non_existent_id", generate_random_string(24), "<script>alert(1)</script>"]
    if test_user_memory_id: test_memory_ids.append(test_user_memory_id)
    if admin_user_memory_id: test_memory_ids.append(admin_user_memory_id)

    update_fields = {
        "title": [None, generate_random_string(50), ""],
        "content": [None, generate_random_string(200), ""],
        "importance": [None, 1, 4, 0, 5, "invalid"],
        "confidence": [None, 0.1, 0.9, -0.1, 1.1, "invalid"],
        "tags": [None, [], ["new_tag", "another_tag"], ["<script>alert(1)</script>"]]
    }

    for memory_id in test_memory_ids:
        for _ in range(5): # Multiple updates per ID
            update_data = {}
            for field, values in update_fields.items():
                if random.random() < 0.7: # Randomly select fields to update
                    update_data[field] = random.choice(values)

            if not update_data: continue # Ensure at least one field is being updated

            # Test with regular user headers
            if headers:
                try:
                    response = await httpx.AsyncClient().put(f"{BASE_URL}/api/memory/{memory_id}", headers=headers, json=update_data, timeout=5)
                    print(f"Update Memory (ID: '{memory_id}', User: Regular, Data: {str(update_data)[:50]}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
                except httpx.RequestError as e:
                    print(f"Update Memory request failed for ID '{memory_id}' (Regular User): {e}")
                except Exception as e:
                    print(f"An unexpected error occurred during update memory for ID '{memory_id}' (Regular User): {e}")

            # Test with admin headers
            if admin_headers:
                try:
                    response = await httpx.AsyncClient().put(f"{BASE_URL}/api/memory/{memory_id}", headers=admin_headers, json=update_data, timeout=5)
                    print(f"Update Memory (ID: '{memory_id}', User: Admin, Data: {str(update_data)[:50]}): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
                except httpx.RequestError as e:
                    print(f"Update Memory request failed for ID '{memory_id}' (Admin User): {e}")
                except Exception as e:
                    print(f"An unexpected error occurred during update memory for ID '{memory_id}' (Admin User): {e}")
    print("--- Fuzzing /api/memory/{memory_id} (PUT) endpoint complete ---\n")

async def fuzz_delete_memory_endpoint(headers, admin_headers, test_user_memory_id=None, admin_user_memory_id=None):
    print("--- Fuzzing /api/memory/{memory_id} (DELETE) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_delete_memory_endpoint. No authentication headers for regular or admin user.")
        return
    # Prepare some memories to be deleted
    memories_to_delete_regular = [await create_test_memory(headers, "temp_user", title_prefix="delete_me_regular_") for _ in range(3)]
    memories_to_delete_admin = [await create_test_memory(admin_headers, "temp_admin", title_prefix="delete_me_admin_") for _ in range(3)]
    all_test_memory_ids = [mid for mid in memories_to_delete_regular + memories_to_delete_admin if mid is not None]

    # Add fuzzed/non-existent IDs
    fuzzed_ids = ["non_existent_id", generate_random_string(24), "<script>alert(1)</script>"]
    if test_user_memory_id: fuzzed_ids.append(test_user_memory_id)
    if admin_user_memory_id: fuzzed_ids.append(admin_user_memory_id)

    for memory_id in all_test_memory_ids + fuzzed_ids:
        if memory_id is None: continue
        # Test with regular user headers
        if headers:
            try:
                response = await httpx.AsyncClient().delete(f"{BASE_URL}/api/memory/{memory_id}", headers=headers, timeout=5)
                print(f"Delete Memory (ID: '{memory_id}', User: Regular): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"Delete Memory request failed for ID '{memory_id}' (Regular User): {e}")
            except Exception as e:
                print(f"An unexpected error occurred during delete memory for ID '{memory_id}' (Regular User): {e}")

        # Test with admin headers
        if admin_headers:
            try:
                response = await httpx.AsyncClient().delete(f"{BASE_URL}/api/memory/{memory_id}", headers=admin_headers, timeout=5)
                print(f"Delete Memory (ID: '{memory_id}', User: Admin): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
            except httpx.RequestError as e:
                print(f"Delete Memory request failed for ID '{memory_id}' (Admin User): {e}")
            except Exception as e:
                print(f"An unexpected error occurred during delete memory for ID '{memory_id}' (Admin User): {e}")
    print("--- Fuzzing /api/memory/{memory_id} (DELETE) endpoint complete ---\n")

async def fuzz_get_user_context_endpoint(headers, admin_headers):
    print("--- Fuzzing /api/memory/context/user (GET) endpoint ---")
    if not headers and not admin_headers:
        print("Skipping fuzz_get_user_context_endpoint. No authentication headers for regular or admin user.")
        return
    # This endpoint primarily returns data based on the authenticated user, so fuzzing parameters isn't as relevant.
    # We'll just test if it responds correctly with valid/invalid auth.
    if headers:
        try:
            response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/context/user", headers=headers, timeout=5)
            print(f"GET User Context (User: Regular): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"GET User Context request failed (Regular User): {e}")
        except Exception as e:
            print(f"An unexpected error occurred during GET user context (Regular User): {e}")

    if admin_headers:
        try:
            response = await httpx.AsyncClient().get(f"{BASE_URL}/api/memory/context/user", headers=admin_headers, timeout=5)
            print(f"GET User Context (User: Admin): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"GET User Context request failed (Admin User): {e}")
        except Exception as e:
            print(f"An unexpected error occurred during GET user context (Admin User): {e}")

    print("--- Fuzzing /api/memory/context/user (GET) endpoint complete ---\n")

async def fuzz_cleanup_memories_endpoint(admin_headers):
    print("--- Fuzzing /api/memory/cleanup (POST) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_cleanup_memories_endpoint. No admin authentication headers.")
        return
    # This is an admin-only endpoint without request body, so just test auth
    try:
        response = await httpx.AsyncClient().post(f"{BASE_URL}/api/memory/cleanup", headers=admin_headers, timeout=5)
        print(f"Cleanup Memories: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Cleanup Memories request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during cleanup memories: {e}")
    print("--- Fuzzing /api/memory/cleanup (POST) endpoint complete ---\n")

async def fuzz_get_memory_types_endpoint():
    print("--- Fuzzing /api/memory/types/ (GET) endpoint ---")
    # This is an unauthenticated endpoint without parameters
    try:
        response = httpx.get(f"{BASE_URL}/api/memory/types/", timeout=5)
        print(f"GET Memory Types: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"GET Memory Types request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during GET memory types: {e}")
    print("--- Fuzzing /api/memory/types/ (GET) endpoint complete ---\n")

async def fuzz_ollama_status(admin_headers):
    print("--- Fuzzing /api/ollama/status (GET) endpoint ---")
    if not admin_headers:
        print("Skipping fuzz_ollama_status. No admin authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/ollama/status", headers=admin_headers, timeout=5)
        print(f"Ollama Status: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Ollama Status request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during Ollama status check: {e}")
    print("--- Fuzzing /api/ollama/status (GET) endpoint complete ---\n")

async def fuzz_ollama_list_models(headers):
    print("--- Fuzzing /api/ollama/models (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_list_models. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/ollama/models", headers=headers, timeout=10)
        print(f"Ollama List Models: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Ollama List Models request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during Ollama list models: {e}")
    print("--- Fuzzing /api/ollama/models (GET) endpoint complete ---\n")

async def fuzz_ollama_pull_model(headers):
    print("--- Fuzzing /api/ollama/models/pull (POST) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_pull_model. No authentication headers.")
        return
    model_names = ["llama2", "nonexistent-model", "<script>alert(1)</script>", "a"*50]
    for model_name in model_names:
        payload = {"model_name": model_name}
        try:
            # Ollama /pull endpoint streams, so we consume it to avoid blocking
            async with httpx.AsyncClient().stream("POST", f"{BASE_URL}/api/ollama/models/pull", headers=headers, json=payload, timeout=30) as response:
                response_content = b""
                async for chunk in response.aiter_bytes():
                    response_content += chunk
            print(f"Ollama Pull Model ('{model_name}'): Status Code: {response.status_code}, Response: {response_content.decode()[:100]}...")
        except httpx.RequestError as e:
            print(f"Ollama Pull Model request failed for '{model_name}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred during Ollama pull model for '{model_name}': {e}")
    print("--- Fuzzing /api/ollama/models/pull (POST) endpoint complete ---\n")

async def fuzz_ollama_chat(headers):
    print("--- Fuzzing /api/ollama/chat (POST) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_chat. No authentication headers.")
        return
    messages = [
        "Hello, assistant!",
        "Tell me a very long story about a cat that saves the world. Make it at least 200 words.",
        "<script>alert(1)</script>",
        "",
        "tool_call: get_weather, location=London", # Malformed tool call
    ]
    models = [None, "llama2", "nonexistent-model", "a"*20]
    stream_options = [True, False]

    for msg in messages:
        for model in models:
            for stream in stream_options:
                chat_request_data = {
                    "message": msg,
                    "model": model,
                    "conversation_history": [
                        {"role": "user", "content": "What is your purpose?"},
                        {"role": "assistant", "content": "I am a helpful AI assistant."}
                    ],
                    "context": {"user_id": "fuzz_test_user", "session_id": "12345"},
                    "tools": [
                        {"name": "get_weather", "description": "Get weather for a location", "parameters": {"location": {"type": "string", "description": "City name"}}},
                        {"name": "malicious_tool", "description": "<script>alert(1)</script>", "parameters": {}}
                    ],
                    "stream": stream
                }
                try:
                    async with httpx.AsyncClient().stream("POST", f"{BASE_URL}/api/ollama/chat", headers=headers, json=chat_request_data, timeout=30) as response:
                        response_content = b""
                        async for chunk in response.aiter_bytes():
                            response_content += chunk
                    print(f"Ollama Chat (Msg: '{msg[:30]}...', Model: {model}, Stream: {stream}): Status Code: {response.status_code}, Response: {response_content.decode()[:100]}...")
                except httpx.RequestError as e:
                    print(f"Ollama Chat request failed: {e}")
                except Exception as e:
                    print(f"An unexpected error occurred during Ollama chat: {e}")
    print("--- Fuzzing /api/ollama/chat (POST) endpoint complete ---\n")

async def fuzz_ollama_assistant_models(headers):
    print("--- Fuzzing /api/ollama/assistant/models (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_assistant_models. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/ollama/assistant/models", headers=headers, timeout=5)
        print(f"Ollama Assistant Models: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Ollama Assistant Models request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during Ollama assistant models: {e}")
    print("--- Fuzzing /api/ollama/assistant/models (GET) endpoint complete ---\n")

async def fuzz_ollama_assistant_tools(headers):
    print("--- Fuzzing /api/ollama/assistant/tools (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_assistant_tools. No authentication headers.")
        return
    try:
        response = await httpx.AsyncClient().get(f"{BASE_URL}/api/ollama/assistant/tools", headers=headers, timeout=5)
        print(f"Ollama Assistant Tools: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Ollama Assistant Tools request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during Ollama assistant tools: {e}")
    print("--- Fuzzing /api/ollama/assistant/tools (GET) endpoint complete ---\n")

async def fuzz_ollama_ensure_model(headers):
    print("--- Fuzzing /api/ollama/assistant/ensure-model (POST) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_ensure_model. No authentication headers.")
        return
    model_names = ["llama2", "nonexistent-model", "<script>alert(1)</script>", "a"*50]
    for model_name in model_names:
        payload = {"model_name": model_name}
        try:
            # This endpoint also streams, consume it
            async with httpx.AsyncClient().stream("POST", f"{BASE_URL}/api/ollama/assistant/ensure-model", headers=headers, json=payload, timeout=30) as response:
                response_content = b""
                async for chunk in response.aiter_bytes():
                    response_content += chunk
            print(f"Ollama Ensure Model ('{model_name}'): Status Code: {response.status_code}, Response: {response_content.decode()[:100]}...")
        except httpx.RequestError as e:
            print(f"Ollama Ensure Model request failed for '{model_name}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred during Ollama ensure model for '{model_name}': {e}")
    print("--- Fuzzing /api/ollama/assistant/ensure-model (POST) endpoint complete ---\n")

async def fuzz_ollama_assistant_context(headers):
    print("--- Fuzzing /api/ollama/assistant/context/{path:path} (GET) endpoint ---")
    if not headers:
        print("Skipping fuzz_ollama_assistant_context. No authentication headers.")
        return
    paths = [
        "test/path/to/file.txt",
        "../../../../etc/passwd",
        "C:\windows\system32\drivers\etc\hosts",
        "/proc/self/cmdline",
        "<script>alert(1)</script>",
        generate_random_string(100),
        "", # Empty path
    ]
    for path in paths:
        try:
            # URL-encode the path to handle special characters correctly
            encoded_path = httpx.URL(path).path
            response = await httpx.AsyncClient().get(f"{BASE_URL}/api/ollama/assistant/context/{encoded_path}", headers=headers, timeout=5)
            print(f"Ollama Assistant Context (Path: '{path[:30]}...'): Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Ollama Assistant Context request failed for '{path}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred during Ollama assistant context for '{path}': {e}")
    print("--- Fuzzing /api/ollama/assistant/context/{path:path} (GET) endpoint complete ---\n")

async def fuzz_ollama_health_check():
    print("--- Fuzzing /api/ollama/health (GET) endpoint ---")
    try:
        response = httpx.get(f"{BASE_URL}/api/ollama/health", timeout=5)
        print(f"Ollama Health Check: Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
    except httpx.RequestError as e:
        print(f"Ollama Health Check request failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during Ollama health check: {e}")
    print("--- Fuzzing /api/ollama/health (GET) endpoint complete ---\n")

def fuzz_generate_caption():
    print("--- Fuzzing /api/generate-caption/{path} endpoint ---")
    for _ in range(20): # Send 20 fuzzed requests
        fuzzed_path = generate_malicious_path()
        url = f"{BASE_URL}/api/generate-caption/{fuzzed_path}"
        try:
            response = httpx.post(url, timeout=5) # Use POST as per blackhat.tex
            print(f"Path: '{fuzzed_path}', Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Request failed for path '{fuzzed_path}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred for path '{fuzzed_path}': {e}")
    print("--- Fuzzing /api/generate-caption/{path} endpoint complete ---\n")

def fuzz_login_endpoint():
    print("--- Fuzzing /api/login endpoint ---")
    common_fuzz_values = [
        "", # Empty string
        " ", # Space
        "null", "Null", "NULL", # Null-like strings
        "undefined", "Undefined", "UNDEFINED", # Undefined-like strings
        "0", "1", "-1", "99999999999999999999999999999999999999", # Numbers
        "true", "false", # Booleans
        "[]", "{}", # Empty array/object
        "' OR 1=1 --", # SQL Injection
        "' UNION SELECT 1,2,3--", # SQL Injection
        "admin'--", # SQL Injection
        "admin' #", # SQL Injection
        "' or '1'='1", # SQL Injection
        "\\", # Backslash for path traversal or escaping
        "/../", # Path traversal
        "<script>alert('XSS')</script>", # XSS
        "a" * 1000, # Long string
        "\x00", # Null byte
    ]

    for _ in range(10): # Send 10 fuzzed requests
        username_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        password_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])

        login_data = {
            "username": str(username_fuzz),
            "password": str(password_fuzz)
        }

        try:
            response = httpx.post(f"{BASE_URL}/api/login", json=login_data, timeout=5)
            print(f"Username: '{login_data['username']}', Password: '{login_data['password']}', Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Request failed for username '{login_data['username']}' and password '{login_data['password']}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred for username '{login_data['username']}' and password '{login_data['password']}': {e}")
    print("--- Fuzzing /api/login endpoint complete ---\n")

def fuzz_register_endpoint():
    print("--- Fuzzing /api/register endpoint ---")
    common_fuzz_values = [
        "", " ", "null", "undefined", "0", "1", "-1",
        "' OR 1=1--", "admin'--", "<script>alert('XSS')</script>",
        "a" * 1000, "\x00",
    ]
    for _ in range(10):
        username_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        password_fuzz = random.choice(common_fuzz_values + [generate_random_string(random.randint(1, 50))])
        register_data = {
            "username": str(username_fuzz),
            "password": str(password_fuzz)
        }
        try:
            response = httpx.post(f"{BASE_URL}/api/register", json=register_data, timeout=5)
            print(f"Register Username: '{register_data['username']}', Password: '{register_data['password']}', Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Register request failed for username '{register_data['username']}' and password '{register_data['password']}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred for register username '{register_data['username']}' and password '{register_data['password']}': {e}")
    print("--- Fuzzing /api/register endpoint complete ---\n")

def fuzz_browse_endpoint():
    print("--- Fuzzing /api/browse endpoint ---")
    for _ in range(20):
        fuzzed_path = generate_malicious_path()
        fuzzed_page = generate_random_int(0, 5) # Page can be 0 or negative for fuzzing
        fuzzed_page_size = generate_random_int(0, 600) # Page size can be 0, negative or very large
        url = f"{BASE_URL}/api/browse?path={fuzzed_path}&page={fuzzed_page}&page_size={fuzzed_page_size}"
        try:
            response = httpx.get(url, timeout=5)
            print(f"Path: '{fuzzed_path}', Page: {fuzzed_page}, Page Size: {fuzzed_page_size}, Status Code: {response.status_code}, Response: {response.text.strip()[:100]}...")
        except httpx.RequestError as e:
            print(f"Request failed for path '{fuzzed_path}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred for path '{fuzzed_path}': {e}")
    print("--- Fuzzing /api/browse endpoint complete ---\n")


# Main execution
if __name__ == "__main__":
    # Make main an async function to allow awaiting the async functions
    async def main():
        fuzz_generate_caption()
        fuzz_login_endpoint()
        fuzz_browse_endpoint()
        fuzz_register_endpoint()
        await fuzz_engagement_record_endpoint()

        test_username = "fuzz_user_" + generate_random_string(8)
        test_password = "fuzz_password_" + generate_random_string(8)
        auth_token = await register_and_login_user(test_username, test_password)
        test_user_memory_id = None
        headers = {} # Initialize headers

        if auth_token:
            headers = {"Authorization": f"Bearer {auth_token}"}
            print(f"Successfully obtained token for {test_username}: {auth_token[:30]}...")
            await fuzz_profile_picture_upload(headers)
            await fuzz_get_profile_picture(headers)
            await fuzz_update_user_profile(headers)
            await fuzz_change_user_password(headers)
            await fuzz_get_user_settings(headers)
            await fuzz_update_user_settings(headers)
            await fuzz_get_my_yapcoins(headers)
            await fuzz_get_indexing_status(headers)

            # Create a memory for the regular user to test ID-specific endpoints
            test_user_memory_id = await create_test_memory(headers, test_username)
            await fuzz_create_memory_endpoint(headers)
            await fuzz_list_memories_endpoint(headers, {}) # Pass empty dict for admin_headers as it's not needed for regular user test
            await fuzz_search_memories_endpoint(headers, {}) # Pass empty dict for admin_headers as it's not needed for regular user test
            await fuzz_get_user_context_endpoint(headers, {}) # Pass empty dict for admin_headers as it's not needed for regular user test
            await fuzz_ollama_list_models(headers)
            await fuzz_ollama_pull_model(headers) # This might require Ollama to be running and models to be available
            await fuzz_ollama_chat(headers)
            await fuzz_ollama_assistant_models(headers)
            await fuzz_ollama_assistant_tools(headers)
            await fuzz_ollama_ensure_model(headers)
            await fuzz_ollama_assistant_context(headers)

        else:
            print(f"Could not obtain token for {test_username}. Skipping authenticated endpoint fuzzing.")

        admin_username = "admin_fuzz_user_" + generate_random_string(8)
        admin_password = "admin_fuzz_password_" + generate_random_string(8)
        admin_auth_token, admin_refresh_token = await register_and_login_admin_user(admin_username, admin_password)
        admin_user_memory_id = None
        admin_headers = {} # Initialize admin_headers

        if admin_auth_token:
            admin_headers = {"Authorization": f"Bearer {admin_auth_token}"}
            print(f"Successfully obtained admin token for {admin_username}: {admin_auth_token[:30]}...")
            await fuzz_refresh_token_endpoint(admin_refresh_token)
            await fuzz_admin_get_all_users(admin_headers)
            await fuzz_admin_update_user_role(admin_headers)
            await fuzz_admin_manage_yapcoins(admin_headers)
            await fuzz_admin_get_user_engagement_data(admin_headers)
            await fuzz_admin_get_all_user_engagement_data(admin_headers)
            await fuzz_admin_delete_user_engagement_data(admin_headers)
            await fuzz_admin_delete_all_user_engagement_data(admin_headers)
            await fuzz_admin_get_engagement_insights(admin_headers)

            # Indexing Endpoints (Admin Only)
            await fuzz_start_indexing(admin_headers)
            await fuzz_smart_start_indexing(admin_headers)
            await fuzz_stop_indexing(admin_headers)
            await fuzz_pause_indexing(admin_headers)
            await fuzz_resume_indexing(admin_headers)
            await fuzz_get_fast_indexing_mode(admin_headers)
            await fuzz_set_fast_indexing_mode(admin_headers)
            await fuzz_get_indexing_enabled(admin_headers)
            await fuzz_set_indexing_enabled(admin_headers)

            # Create a memory for the admin user to test ID-specific endpoints
            admin_user_memory_id = await create_test_memory(admin_headers, admin_username)
            await fuzz_create_memory_endpoint(admin_headers)
            await fuzz_list_memories_endpoint({}, admin_headers) # Pass empty dict for regular user headers as it's not needed for admin user test
            await fuzz_search_memories_endpoint({}, admin_headers) # Pass empty dict for regular user headers as it's not needed for admin user test
            await fuzz_cleanup_memories_endpoint(admin_headers)
            await fuzz_ollama_status(admin_headers)

        else:
            print(f"Could not obtain admin token for {admin_username}. Skipping admin endpoint fuzzing.")

        # Fuzzing memory endpoints requiring specific IDs (after creation)
        await fuzz_get_memory_by_id_endpoint(headers, admin_headers, test_user_memory_id, admin_user_memory_id)
        await fuzz_update_memory_endpoint(headers, admin_headers, test_user_memory_id, admin_user_memory_id)
        await fuzz_delete_memory_endpoint(headers, admin_headers, test_user_memory_id, admin_user_memory_id)
        await fuzz_get_memory_types_endpoint()
        await fuzz_ollama_health_check()

    import asyncio
    asyncio.run(main()) 