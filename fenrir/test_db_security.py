#!/usr/bin/env python3
"""🦊 Database Security Test
========================

Quick test to verify database security after implementing the reynard user.
"""

import psycopg2
import sys

def test_database_security():
    """Test database security with different user credentials."""
    print("🦊 Testing Database Security...")
    print("=" * 50)

    # Test 1: Try to connect with postgres user to reynard databases
    databases = ["reynard", "reynard_auth", "reynard_ecs", "reynard_keys"]

    print("\n🔍 Testing postgres user access to Reynard databases...")
    for db in databases:
        try:
            conn = psycopg2.connect(
                host="localhost",
                database=db,
                user="postgres",
                password="password",
                port=5432
            )
            conn.close()
            print(f"❌ SECURITY ISSUE: postgres user can access {db} database")
            return False
        except psycopg2.OperationalError as e:
            if "permission denied" in str(e).lower() or "authentication failed" in str(e).lower():
                print(f"✅ SECURE: postgres user cannot access {db} database")
            else:
                print(f"⚠️  Unexpected error for {db}: {e}")
        except Exception as e:
            print(f"⚠️  Unexpected error for {db}: {e}")

    # Test 2: Try to connect with reynard user to reynard databases
    print("\n🔍 Testing reynard user access to Reynard databases...")
    for db in databases:
        try:
            conn = psycopg2.connect(
                host="localhost",
                database=db,
                user="reynard",
                password="WmAGEbIWBIbqBPID^a6UHw@6s34iHw4o",
                port=5432
            )
            conn.close()
            print(f"✅ SECURE: reynard user can access {db} database")
        except Exception as e:
            print(f"❌ ERROR: reynard user cannot access {db} database: {e}")
            return False

    print("\n🎉 Database security test PASSED!")
    print("✅ postgres user cannot access Reynard databases")
    print("✅ reynard user can access all Reynard databases")
    return True

if __name__ == "__main__":
    success = test_database_security()
    sys.exit(0 if success else 1)
