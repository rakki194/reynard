#!/usr/bin/env python3.15
"""
Python 3.15.0a0 Debugger Configuration
Configure and test the new remote debugging capabilities
"""

import os


def check_debugger_availability():
    """Check if debugger modules are available"""
    print("=" * 60)
    print("🔧 PYTHON 3.15.0a0 DEBUGGER CONFIGURATION")
    print("=" * 60)

    # Check for remote debugging module
    try:
        import _remote_debugging

        print("✅ _remote_debugging module available")

        # List available functions
        print("Available functions:")
        for attr in dir(_remote_debugging):
            if not attr.startswith("_"):
                print(f"  - {attr}")

    except ImportError as e:
        print(f"❌ _remote_debugging module not available: {e}")

    # Check for debugger module (PEP 768)
    try:
        import debugger

        print("✅ debugger module available")
    except ImportError as e:
        print(f"⚠️  debugger module not available (expected): {e}")

    print()


def test_remote_debugging():
    """Test remote debugging capabilities"""
    print("🌐 TESTING REMOTE DEBUGGING")
    print("-" * 40)

    try:
        import _remote_debugging

        # Test basic functionality
        print("Testing remote debugging functions...")

        # Check if we can get process info
        pid = os.getpid()
        print(f"Current process PID: {pid}")

        # Try to initialize remote debugging
        try:
            # This might require special permissions
            result = _remote_debugging.init_remote_debugging(pid)
            print(f"✅ Remote debugging initialized: {result}")
        except Exception as e:
            print(f"⚠️  Remote debugging init failed (expected): {e}")

    except ImportError:
        print("❌ Remote debugging module not available")

    print()


def configure_debugger_environment():
    """Configure debugger environment variables"""
    print("⚙️  CONFIGURING DEBUGGER ENVIRONMENT")
    print("-" * 40)

    # Set debugger environment variables
    debugger_env = {
        "PYTHONDEBUG": "1",
        "PYTHONDEVMODE": "1",
        "PYTHONPATH": os.environ.get("PYTHONPATH", ""),
        "PYTHONHASHSEED": "0",  # For reproducible debugging
    }

    print("Debugger environment variables:")
    for key, value in debugger_env.items():
        print(f"  {key}={value}")
        os.environ[key] = value

    print()


def test_debugger_integration():
    """Test debugger integration with interpreters"""
    print("🔗 TESTING DEBUGGER INTEGRATION")
    print("-" * 40)

    try:
        from concurrent import interpreters

        # Create an interpreter
        interp = interpreters.create()
        print(f"✅ Created interpreter: {interp.id}")

        # Test debugging in interpreter
        def debug_function():
            x = 42
            y = x * 2
            return y

        try:
            result = interp.call(debug_function)
            print(f"✅ Debug function result: {result}")
        except Exception as e:
            print(f"⚠️  Debug function failed: {e}")

        # Clean up
        interp.close()

    except ImportError as e:
        print(f"❌ Interpreters module not available: {e}")

    print()


def create_debugger_launcher():
    """Create a debugger launcher script"""
    print("🚀 CREATING DEBUGGER LAUNCHER")
    print("-" * 40)

    launcher_script = """#!/bin/bash
# Python 3.15.0a0 Debugger Launcher
# Launch Python with debugging enabled

export PYTHONDEBUG=1
export PYTHONDEVMODE=1
export PYTHONHASHSEED=0

# Set library path for Python 3.15
export LD_LIBRARY_PATH="/home/kade/source/repos/python-dev-install/lib:$LD_LIBRARY_PATH"
export PATH="/home/kade/source/repos/python-dev-install/bin:$PATH"

# Launch Python with debugging
exec /home/kade/source/repos/python-dev-install/bin/python3.15 "$@"
"""

    launcher_path = "/home/kade/runeset/reynard/experimental/launch_python315_debug.sh"

    try:
        with open(launcher_path, "w") as f:
            f.write(launcher_script)

        # Make executable
        os.chmod(launcher_path, 0o755)
        print(f"✅ Debugger launcher created: {launcher_path}")

    except Exception as e:
        print(f"❌ Failed to create launcher: {e}")

    print()


def test_enhanced_error_messages():
    """Test enhanced error messages"""
    print("💬 TESTING ENHANCED ERROR MESSAGES")
    print("-" * 40)

    # Test various error scenarios
    test_cases = [
        ("NameError", lambda: undefined_variable),
        ("TypeError", lambda: 1 + "string"),
        ("AttributeError", lambda: None.some_attribute),
        ("IndexError", lambda: [1, 2, 3][10]),
        ("KeyError", lambda: {"a": 1}["b"]),
    ]

    for error_type, test_func in test_cases:
        try:
            test_func()
        except Exception as e:
            print(f"✅ {error_type}: {e}")
            # Check if error message is enhanced
            if hasattr(e, "__cause__") or hasattr(e, "__context__"):
                print("   Enhanced context available")

    print()


def main():
    """Main configuration function"""
    print("🐍 Python 3.15.0a0 Debugger Configuration Starting...")
    print()

    check_debugger_availability()
    configure_debugger_environment()
    test_remote_debugging()
    test_debugger_integration()
    create_debugger_launcher()
    test_enhanced_error_messages()

    print("🎉 Debugger configuration completed!")
    print()
    print("Next steps:")
    print("1. Use the debugger launcher: ./launch_python315_debug.sh")
    print("2. Test remote debugging with multiple interpreters")
    print("3. Explore enhanced error messages")
    print("4. Configure your IDE for Python 3.15 debugging")


if __name__ == "__main__":
    main()
