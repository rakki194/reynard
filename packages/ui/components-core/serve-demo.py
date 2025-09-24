#!/usr/bin/env python3
"""Simple HTTP server to serve the Badge component demo
"""

import http.server
import os
import socketserver
import sys
import webbrowser
from pathlib import Path


def main():
    # Change to the directory containing the demo file
    demo_dir = Path(__file__).parent
    os.chdir(demo_dir)

    PORT = 8080

    # Try to find an available port
    for port in range(8080, 8090):
        try:
            with socketserver.TCPServer(
                ("", port), http.server.SimpleHTTPRequestHandler,
            ) as httpd:
                print("🦊 Reynard Badge Demo Server")
                print(f"📡 Serving at: http://localhost:{port}")
                print(f"📄 Demo page: http://localhost:{port}/badge-demo.html")
                print(f"📁 Serving from: {demo_dir}")
                print("🚀 Opening browser...")
                print("⏹️  Press Ctrl+C to stop the server")
                print("-" * 50)

                # Open browser
                webbrowser.open(f"http://localhost:{port}/badge-demo.html")

                # Start server
                httpd.serve_forever()
        except OSError:
            continue

    print("❌ Could not find an available port (8080-8089)")
    sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
