#!/usr/bin/env python3.15
"""Explore the actual concurrent.interpreters API
"""

from concurrent import interpreters


def explore_api():
    """Explore the interpreters API"""
    print("=" * 60)
    print("🔍 EXPLORING CONCURRENT.INTERPRETERS API")
    print("=" * 60)

    # Check what's available in the module
    print("Available in interpreters module:")
    for name in dir(interpreters):
        if not name.startswith("_"):
            obj = getattr(interpreters, name)
            print(f"  {name}: {type(obj)}")

    print()

    # Try to create an interpreter
    try:
        interp = interpreters.create()
        print(f"✅ Created interpreter: {interp}")
        print(f"Type: {type(interp)}")

        # Check interpreter attributes
        print("Interpreter attributes:")
        for attr in dir(interp):
            if not attr.startswith("_"):
                try:
                    value = getattr(interp, attr)
                    print(f"  {attr}: {value}")
                except Exception as e:
                    print(f"  {attr}: <error: {e}>")

        # Try to run code
        try:
            result = interp.run("return 42")
            print(f"✅ Run result: {result}")
        except Exception as e:
            print(f"❌ Run error: {e}")

        # Try to close
        try:
            interp.close()
            print("✅ Interpreter closed")
        except Exception as e:
            print(f"❌ Close error: {e}")

    except Exception as e:
        print(f"❌ Create error: {e}")

    print()


if __name__ == "__main__":
    explore_api()
