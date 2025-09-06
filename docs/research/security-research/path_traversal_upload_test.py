import io
import os
import sys
import json
import argparse
import requests

# Configuration
BASE_URL = os.environ.get("YIPYAP_BASE_URL", "http://localhost:7000")
USERNAME = os.environ.get("YIPYAP_USERNAME", "")  # set or pass via env/args
PASSWORD = os.environ.get("YIPYAP_PASSWORD", "")  # set or pass via env/args

# Target write outside ROOT_DIR (PoC targets project folder to avoid system files)
POC_ABS_TARGET = "/home/kade/code/yipyap/blackhat/traversal_poc.png"
# From default ROOT_DIR (/home/kade/datasets) this should be reachable with one '..'
TRAVERSAL_FILENAME = "../code/yipyap/blackhat/traversal_poc.png"

# Minimal valid PNG bytes (1x1)
DUMMY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\nIDATx\xda\x63\x60\x00\x00\x00\x02\x00\x01\x0b\xe7\x02\x9d\x00\x00\x00\x00IEND\xaeB`\x82"
)


def login(username: str, password: str) -> str | None:
    try:
        resp = requests.post(
            f"{BASE_URL}/api/login",
            json={"username": username, "password": password},
            timeout=10,
        )
        if resp.status_code != 200:
            print(f"[!] Login failed ({resp.status_code}): {resp.text}")
            return None
        data = resp.json()
        return data.get("access_token")
    except requests.RequestException as e:
        print(f"[!] Login error: {e}")
        return None


def test_path_traversal_upload(token: str) -> bool:
    url = f"{BASE_URL}/api/upload"
    headers = {"Authorization": f"Bearer {token}"}

    # Construct multipart with crafted filename containing '..'
    files = {
        # (filename, fileobj, content_type)
        "files": (TRAVERSAL_FILENAME, io.BytesIO(DUMMY_PNG), "image/png"),
    }

    print(f"[+] POST {url} with filename='{TRAVERSAL_FILENAME}' → expecting rejection if safe")
    try:
        resp = requests.post(url, files=files, headers=headers, timeout=20)
        print(f"    Status: {resp.status_code}")
        try:
            print(f"    Body: {json.dumps(resp.json(), indent=2)}")
        except Exception:
            print(f"    Body: {resp.text[:500]}")

        existed_before = os.path.exists(POC_ABS_TARGET)
        # Check on-disk effect only after request
        exists_after = os.path.exists(POC_ABS_TARGET)
        if exists_after and not existed_before:
            print(
                f"    [VULNERABLE] File was written outside ROOT_DIR at {POC_ABS_TARGET} via filename traversal."
            )
            return False
        elif exists_after and existed_before:
            print(
                f"    [POTENTIALLY VULNERABLE] Target file exists; cannot confirm creation. Manually verify timestamps."
            )
            return False
        else:
            if resp.status_code in (400, 403):
                print("    [OK] Upload rejected, traversal appears mitigated.")
            else:
                print("    [INFO] No file observed; review server-side validation.")
            return True
    except requests.RequestException as e:
        print(f"[!] Request error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Test upload path traversal via crafted filename")
    parser.add_argument("--username", default=USERNAME)
    parser.add_argument("--password", default=PASSWORD)
    args = parser.parse_args()

    if not args.username or not args.password:
        print("[!] Provide credentials via --username/--password or YIPYAP_USERNAME/YIPYAP_PASSWORD env vars")
        sys.exit(2)

    token = login(args.username, args.password)
    if not token:
        sys.exit(1)

    ok = test_path_traversal_upload(token)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
