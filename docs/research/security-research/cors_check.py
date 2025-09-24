import argparse
import os

import requests

BASE_URL = os.environ.get("YIPYAP_BASE_URL", "http://localhost:7000")


def check_cors(url: str) -> None:
    print(f"[+] Checking CORS preflight at {url}")
    headers = {
        "Origin": "http://evil.example.com",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization, Content-Type",
    }
    try:
        resp = requests.options(url, headers=headers, timeout=10)
        print(f"    Status: {resp.status_code}")
        acao = resp.headers.get("Access-Control-Allow-Origin")
        acac = resp.headers.get("Access-Control-Allow-Credentials")
        acam = resp.headers.get("Access-Control-Allow-Methods")
        acah = resp.headers.get("Access-Control-Allow-Headers")
        print(f"    ACAO: {acao}")
        print(f"    ACAC: {acac}")
        print(f"    ACAM: {acam}")
        print(f"    ACAH: {acah}")
        if acao == "*" and acac == "true":
            print("    [VULNERABLE] Allow-Origin '*' with credentials true is unsafe.")
        elif acao == "*":
            print(
                "    [WARNING] Allow-Origin '*' is permissive; restrict in production.",
            )
        else:
            print("    [OK] Allow-Origin is restricted.")
    except requests.RequestException as e:
        print(f"    [!] Request error: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Check CORS headers for permissiveness",
    )
    parser.add_argument(
        "--path", default="/api/ready", help="Path to send OPTIONS preflight against",
    )
    args = parser.parse_args()

    url = f"{BASE_URL}{args.path}"
    check_cors(url)


if __name__ == "__main__":
    main()
