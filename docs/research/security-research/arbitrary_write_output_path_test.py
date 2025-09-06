import os
import sys
import json
import argparse
import requests
from pathlib import Path

BASE_URL = os.environ.get("YIPYAP_BASE_URL", "http://localhost:7000")
USERNAME = os.environ.get("YIPYAP_USERNAME", "")
PASSWORD = os.environ.get("YIPYAP_PASSWORD", "")

# Try a few endpoints that accept output_path
ENDPOINTS = [
    ("/api/audio/generate-waveform", {"audio_path": "nonexistent.wav", "output_path": "/home/kade/code/yipyap/blackhat/out_waveform.png", "width": 10, "height": 10}),
    ("/api/audio/convert", {"source_path": "nonexistent.wav", "output_path": "/home/kade/code/yipyap/blackhat/out_audio.mp3", "target_format": "mp3"}),
    ("/api/video/generate-thumbnail", {"video_path": "nonexistent.mp4", "output_path": "/home/kade/code/yipyap/blackhat/out_thumb.jpg", "time": 0.0, "width": 2, "height": 2}),
    ("/api/text/convert", {"source_path": "nonexistent.txt", "output_path": "/home/kade/code/yipyap/blackhat/out_text.html", "target_format": "html"}),
]

TARGETS = [
    "/home/kade/code/yipyap/blackhat/out_waveform.png",
    "/home/kade/code/yipyap/blackhat/out_audio.mp3",
    "/home/kade/code/yipyap/blackhat/out_thumb.jpg",
    "/home/kade/code/yipyap/blackhat/out_text.html",
]


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
        return resp.json().get("access_token")
    except requests.RequestException as e:
        print(f"[!] Login error: {e}")
        return None


def probe_endpoint(token: str, path: str, payload: dict) -> None:
    url = f"{BASE_URL}{path}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"[+] POST {url} with output_path={payload.get('output_path')}")

    existed_before = Path(payload.get("output_path", "")).exists()

    try:
        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=15)
        print(f"    Status: {resp.status_code}")
        try:
            print(f"    Body: {json.dumps(resp.json(), indent=2)[:400]}")
        except Exception:
            print(f"    Body: {resp.text[:400]}")
    except requests.RequestException as e:
        print(f"    [!] Request error: {e}")
    finally:
        exists_after = Path(payload.get("output_path", "")).exists()
        if exists_after and not existed_before:
            print("    [VULNERABLE] Endpoint wrote outside ROOT_DIR using absolute output_path.")
        elif exists_after and existed_before:
            print("    [POTENTIALLY VULNERABLE] Target file pre-existed; verify timestamps.")
        else:
            print("    [OK] No file created outside ROOT_DIR.")


def main():
    parser = argparse.ArgumentParser(description="Probe output_path writes outside ROOT_DIR")
    parser.add_argument("--username", default=USERNAME)
    parser.add_argument("--password", default=PASSWORD)
    args = parser.parse_args()

    token = login(args.username, args.password)
    if not token:
        print("[!] Cannot authenticate; aborting.")
        sys.exit(1)

    # Cleanup any leftover test files
    for t in TARGETS:
        try:
            if Path(t).exists():
                Path(t).unlink()
        except Exception:
            pass

    for ep, payload in ENDPOINTS:
        probe_endpoint(token, ep, payload)


if __name__ == "__main__":
    main()
