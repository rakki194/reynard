# GitHub CLI Workflow Guide

A comprehensive guide for using GitHub CLI (`gh`) to interact with GitHub profiles and repositories efficiently.

## Overview

GitHub CLI provides a much simpler and more secure way to interact with GitHub's API compared to manual curl commands and token extraction. This guide covers the essential workflows for profile management and repository access.

## Prerequisites

- GitHub CLI installed (`gh`)
- GitHub account with appropriate permissions
- Personal Access Token (PAT) or GitHub authentication

## Installation

### Install GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# macOS
brew install gh

# Windows
winget install GitHub.cli

# Or download from: https://cli.github.com/
```

## Authentication

### Method 1: Interactive Login (Recommended)

```bash
gh auth login
```

This will guide you through:

- Choosing GitHub.com or GitHub Enterprise
- Selecting authentication method (HTTPS or SSH)
- Choosing login method (web browser or token)

### Method 2: Token Authentication

```bash
# Using a personal access token
gh auth login --with-token < <(echo "your_token_here")

# Or from file
gh auth login --with-token < token.txt
```

### Method 3: Extract Token from Shell Configuration

If you have your GitHub token stored in your shell configuration file (like `~/.zshrc` or `~/.bashrc`), you can extract it programmatically:

```bash
# Extract token from the first line of ~/.zshrc that contains GH_TOKEN
TOKEN=$(grep "^export GH_TOKEN=" ~/.zshrc | head -1 | cut -d'=' -f2)
gh auth login --with-token < <(echo "$TOKEN")

# Alternative: Extract from any line containing GH_TOKEN
TOKEN=$(grep "GH_TOKEN=" ~/.zshrc | head -1 | sed 's/.*GH_TOKEN=//')
gh auth login --with-token < <(echo "$TOKEN")

# One-liner for quick authentication
gh auth login --with-token < <(grep "^export GH_TOKEN=" ~/.zshrc | cut -d'=' -f2)
```

**Example shell configuration format:**

```bash
# In ~/.zshrc or ~/.bashrc
export GH_TOKEN=github_pat_11ABC123...
```

**Security Note:** This method assumes your shell configuration file is secure and not accessible to other users. Always ensure proper file permissions (`chmod 600 ~/.zshrc`).

### Verify Authentication

```bash
gh auth status
```

## Core Workflows

### 1. Get User Profile Information

```bash
# Get your own profile
gh api user

# Get another user's profile
gh api users/username

# Get specific fields using jq
gh api user --jq '.login, .public_repos, .followers'
```

### 2. Access Profile README

```bash
# Get your profile README (base64 encoded)
gh api repos/$(gh api user -q .login)/$(gh api user -q .login)/readme

# Decode and display the content
gh api repos/$(gh api user -q .login)/$(gh api user -q .login)/readme --jq '.content' | base64 -d

# For a specific user
gh api repos/username/username/readme --jq '.content' | base64 -d
```

### 3. Repository Information

```bash
# List your repositories
gh repo list

# Get repository details
gh api repos/owner/repo

# Get repository README
gh api repos/owner/repo/readme --jq '.content' | base64 -d
```

### 4. Advanced API Queries

```bash
# Get user's public repositories
gh api users/username/repos

# Get repository statistics
gh api repos/owner/repo/stats/contributors

# Get repository languages
gh api repos/owner/repo/languages
```

## JSON Processing with jq

GitHub CLI integrates well with `jq` for data processing:

```bash
# Extract specific fields
gh api user --jq '.login, .name, .email'

# Filter repositories by criteria
gh api user/repos --jq '.[] | select(.private == false) | .name'

# Count public repositories
gh api user/repos --jq '[.[] | select(.private == false)] | length'
```

## Security Best Practices

### Token Management

1. **Use Environment Variables**

   ```bash
   export GITHUB_TOKEN="your_token_here"
   gh auth login --with-token < <(echo "$GITHUB_TOKEN")
   ```

2. **Token Permissions**
   - Only grant necessary permissions
   - Use fine-grained personal access tokens when possible
   - Regularly rotate tokens

3. **Avoid Hardcoding**
   - Never commit tokens to version control
   - Use `.env` files or secure credential storage
   - Consider using GitHub's built-in credential manager

### Secure Workflows

```bash
# Check current authentication
gh auth status

# Logout when done
gh auth logout

# Switch between accounts
gh auth switch
```

## Common Use Cases

### 1. Profile README Management

```bash
# View your current profile README
gh api repos/$(gh api user -q .login)/$(gh api user -q .login)/readme --jq '.content' | base64 -d

# Update profile README (requires file)
gh api repos/$(gh api user -q .login)/$(gh api user -q .login)/contents/README.md \
  --method PUT \
  --field message="Update profile README" \
  --field content="$(base64 -i README.md)"
```

### 2. Repository Statistics

```bash
# Get repository overview
gh api repos/owner/repo --jq '.name, .description, .stargazers_count, .forks_count'

# Get recent commits
gh api repos/owner/repo/commits --jq '.[0:5] | .[] | .commit.message'
```

### 3. Organization Management

```bash
# List organization repositories
gh api orgs/orgname/repos

# Get organization members
gh api orgs/orgname/members
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   ```bash
   # Re-authenticate
   gh auth logout
   gh auth login
   ```

2. **Permission Denied**
   - Check token permissions
   - Verify repository access
   - Ensure correct username/organization

3. **Rate Limiting**

   ```bash
   # Check rate limit status
   gh api rate_limit
   ```

### Debug Mode

```bash
# Enable debug output
gh api user --debug

# Verbose output
gh api user -v
```

## Integration Examples

### Quick Setup Script

```bash
#!/bin/bash
# Quick GitHub CLI setup from existing shell configuration
setup_gh_auth() {
    if command -v gh &> /dev/null; then
        # Extract token from ~/.zshrc if it exists
        if [ -f ~/.zshrc ] && grep -q "GH_TOKEN=" ~/.zshrc; then
            echo "Found GitHub token in ~/.zshrc, authenticating..."
            gh auth login --with-token < <(grep "^export GH_TOKEN=" ~/.zshrc | cut -d'=' -f2)
            echo "GitHub CLI authenticated successfully!"
        else
            echo "No GitHub token found in ~/.zshrc"
            echo "Run: gh auth login"
        fi
    else
        echo "GitHub CLI not installed. Install with: brew install gh"
    fi
}

# Run the setup
setup_gh_auth
```

### Shell Scripts

```bash
#!/bin/bash
# Get user statistics
USERNAME=$(gh api user -q .login)
REPO_COUNT=$(gh api user -q .public_repos)
FOLLOWERS=$(gh api user -q .followers)

echo "User: $USERNAME"
echo "Public Repositories: $REPO_COUNT"
echo "Followers: $FOLLOWERS"
```

### Profile README Workflow

```bash
#!/bin/bash
# Complete workflow: authenticate and get profile README
# 1. Authenticate from shell config
gh auth login --with-token < <(grep "^export GH_TOKEN=" ~/.zshrc | cut -d'=' -f2)

# 2. Get profile information
echo "=== Profile Information ==="
gh api user --jq '.login, .name, .public_repos, .followers'

# 3. Get and display profile README
echo -e "\n=== Profile README ==="
gh api repos/$(gh api user -q .login)/$(gh api user -q .login)/readme --jq '.content' | base64 -d
```

### Automation Scripts

```bash
#!/bin/bash
# Backup all repository READMEs
mkdir -p readme_backups
gh repo list --json name --jq '.[].name' | while read repo; do
  gh api repos/$(gh api user -q .login)/$repo/readme --jq '.content' | base64 -d > "readme_backups/${repo}.md"
done
```

## Advanced Features

### Custom API Endpoints

```bash
# Access any GitHub API endpoint
gh api /user/starred
gh api /notifications
gh api /user/issues
```

### Pagination

```bash
# Handle paginated results
gh api repos/owner/repo/issues --paginate
```

### Conditional Requests

```bash
# Use ETags for caching
gh api repos/owner/repo --header 'If-None-Match: "etag_value"'
```

## Comparison: GitHub CLI vs Manual Methods

| Feature         | GitHub CLI         | Manual curl           |
| --------------- | ------------------ | --------------------- |
| Authentication  | Built-in           | Manual headers        |
| JSON Processing | Native jq support  | Manual parsing        |
| Error Handling  | User-friendly      | Raw HTTP errors       |
| Rate Limiting   | Automatic handling | Manual management     |
| Security        | Token management   | Manual token handling |
| Usability       | Simple commands    | Complex syntax        |

## Conclusion

GitHub CLI provides a much more efficient and secure way to interact with GitHub's API. The built-in authentication, JSON processing, and error handling make it the preferred method for most GitHub automation tasks.

### Key Benefits

- **Simplified Authentication**: No need to manually manage tokens in headers
- **Better Security**: Built-in credential management
- **Improved Usability**: Clean, intuitive commands
- **Enhanced Debugging**: Better error messages and debug modes
- **Native Integration**: Works seamlessly with other GitHub tools

### Next Steps

- Explore `gh` command-line help: `gh --help`
- Check out GitHub CLI documentation: <https://cli.github.com/>
- Practice with your own repositories and profile
- Integrate into your development workflows

---

_This guide demonstrates the power and simplicity of GitHub CLI for common GitHub operations while maintaining security best practices._
