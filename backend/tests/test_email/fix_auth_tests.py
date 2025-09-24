#!/usr/bin/env python3

import re

# Read the test file
with open("test_advanced_email_routes.py") as f:
    content = f.read()

# Pattern to find test functions that need updating
test_pattern = r"(@pytest\.mark\.asyncio\s+async def test_\w+\(self, )(client)(, mock_auth_dependency\):.*?)(\s+with patch\(\'app\.api\.email_routes\.get_current_active_user\', return_value=mock_auth_dependency\(\)\):)"


def replace_auth(match):
    start = match.group(1)  # @pytest.mark.asyncio async def test_xxx(self,
    client_param = match.group(2)  # client
    rest_params = match.group(3)  # , mock_auth_dependency):
    before_patch = match.group(4)  # content before patch

    # Replace client with app, client and add dependency override setup
    new_start = start + "app, " + client_param + rest_params
    new_before_patch = before_patch.replace(
        "with patch('app.api.email_routes.get_current_active_user', return_value=mock_auth_dependency()):",
        """from app.auth.user_service import get_current_active_user
        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:""",
    )

    return new_start + new_before_patch


# Apply the replacement
updated_content = re.sub(test_pattern, replace_auth, content, flags=re.DOTALL)

# Also need to add finally blocks at the end of each test
# This is trickier, so let's do it step by step

print("Updated test file with new authentication pattern")
print(
    "Note: You'll need to manually add 'finally: app.dependency_overrides.clear()' blocks to each test",
)

# Write the updated content
with open("test_advanced_email_routes_updated.py", "w") as f:
    f.write(updated_content)
