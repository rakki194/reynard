#!/usr/bin/env python3

import re

# Read the test file
with open("test_advanced_email_routes.py") as f:
    content = f.read()

# First, update all function signatures that still use the old pattern
# Pattern: async def test_xxx(self, client, mock_auth_dependency):
content = re.sub(
    r"(async def test_\w+\(self, )(client)(, mock_auth_dependency\):)",
    r"\1app, \2\3",
    content,
)

# Second, replace all old auth patterns with new ones
old_auth_pattern = r"        with patch\('app\.api\.email_routes\.get_current_active_user', return_value=mock_auth_dependency\(\)\):"
new_auth_pattern = """        from app.auth.user_service import get_current_active_user
        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:"""

content = content.replace(old_auth_pattern, new_auth_pattern)

# Write the updated content
with open("test_advanced_email_routes.py", "w") as f:
    f.write(content)

print("Updated all authentication patterns in test file")
print(
    "Note: You still need to manually add 'finally: app.dependency_overrides.clear()' blocks",
)
