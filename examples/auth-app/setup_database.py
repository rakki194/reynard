#!/usr/bin/env python3
"""
Database setup script for Reynard Auth App
Creates the database and initial tables using Gatekeeper
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the gatekeeper library to the path
sys.path.insert(0, str(Path(__file__).parent / "libraries" / "gatekeeper"))

from gatekeeper import AuthManager, TokenConfig, UserCreate, UserRole
from gatekeeper.backends.postgresql import PostgreSQLBackend


async def setup_database():
    """Setup the database and create initial admin user"""
    print("🚀 Setting up Reynard Auth Database...")
    
    # Database configuration
    database_url = os.getenv(
        "DATABASE_URL", 
        "postgresql://yipyap:yipyap@localhost:5432/yipyap"
    )
    
    print(f"📊 Using database: {database_url}")
    
    # Initialize PostgreSQL backend
    print("🔧 Initializing PostgreSQL backend...")
    backend = PostgreSQLBackend(
        database_url=database_url,
        echo=True  # Enable SQL logging for setup
    )
    
    # Test database connection
    print("🏥 Testing database connection...")
    is_healthy = await backend.health_check()
    if not is_healthy:
        print("❌ Database connection failed!")
        print("💡 Make sure PostgreSQL is running and accessible.")
        print("   Database URL:", database_url)
        print("\n📋 Setup instructions:")
        print("   1. Install PostgreSQL: sudo pacman -S postgresql")
        print("   2. Start PostgreSQL: sudo systemctl start postgresql")
        print("   3. Create database: sudo -u postgres createdb yipyap")
        print("   4. Create user: sudo -u postgres psql -c \"CREATE USER yipyap WITH PASSWORD 'yipyap';\"")
        print("   5. Grant privileges: sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE yipyap TO yipyap;\"")
        return False
    
    print("✅ Database connection successful!")
    
    # Configure token settings
    token_config = TokenConfig(
        secret_key="your-secret-key-here-change-in-production",
        algorithm="HS256",
        access_token_expire_minutes=30,
        refresh_token_expire_days=7,
    )
    
    # Initialize authentication manager
    print("🔐 Initializing authentication manager...")
    auth_manager = AuthManager(backend=backend, token_config=token_config)
    
    try:
        # Create admin user
        print("\n👤 Creating admin user...")
        admin_user = UserCreate(
            username="admin",
            password="Admin123!",
            email="admin@reynard.dev",
            full_name="Reynard Admin",
            role=UserRole.ADMIN,
        )
        
        try:
            admin = await auth_manager.create_user(admin_user)
            print(f"✅ Admin user created: {admin.username} (ID: {admin.id})")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ️  Admin user already exists")
            else:
                print(f"❌ Failed to create admin user: {e}")
        
        # Create demo user
        print("\n👤 Creating demo user...")
        demo_user = UserCreate(
            username="demo",
            password="Demo123!",
            email="demo@reynard.dev",
            full_name="Demo User",
            role=UserRole.REGULAR,
        )
        
        try:
            demo = await auth_manager.create_user(demo_user)
            print(f"✅ Demo user created: {demo.username} (ID: {demo.id})")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ️  Demo user already exists")
            else:
                print(f"❌ Failed to create demo user: {e}")
        
        # List all users
        print("\n📋 Current users in database:")
        users = await auth_manager.list_users()
        for user in users:
            print(f"   - {user.username} ({user.role}) - {user.email}")
        
        print("\n🎉 Database setup completed successfully!")
        print("\n💡 Test credentials:")
        print("   Admin: admin / Admin123!")
        print("   Demo:  demo / Demo123!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Setup error: {e}")
        return False
    
    finally:
        # Clean up
        print("\n🧹 Cleaning up...")
        await auth_manager.close()
        print("✅ Cleanup completed")


if __name__ == "__main__":
    success = asyncio.run(setup_database())
    if success:
        print("\n🚀 Ready to start the Reynard Auth App!")
        print("   Frontend: npm run dev")
        print("   Backend:  npm run backend")
    else:
        print("\n❌ Database setup failed. Please check the errors above.")
        sys.exit(1)
