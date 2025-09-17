# Peer Dependency Management Best Practices

**Date:** January 15, 2025
**Context:** Vite 7 and SolidJS compatibility issues
**Audience:** Development teams managing complex dependency trees

## Overview

This document outlines best practices for managing peer dependency warnings and conflicts in modern JavaScript projects, with specific focus on the Vite 7 and SolidJS ecosystem.

## Understanding Peer Dependencies

### What Are Peer Dependencies?

Peer dependencies are packages that a library expects to be provided by the consuming application rather than bundled with the library itself. They represent:

- **Shared Dependencies:** Common packages used across multiple libraries
- **Version Compatibility:** Specific version ranges that must be satisfied
- **Framework Requirements:** Dependencies on major frameworks or build tools

### Why Peer Dependencies Exist

1. **Avoid Duplication:** Prevent multiple versions of the same package
2. **Version Control:** Ensure compatible versions across the ecosystem
3. **Framework Integration:** Require specific framework versions for compatibility
4. **Plugin Architecture:** Allow plugins to work with host applications

## Best Practices for Managing Peer Dependencies

### 1. Regular Dependency Audits ⭐

**Automated Monitoring:**

```bash
# Check for outdated packages
pnpm outdated

# Audit for security issues
pnpm audit

# Check peer dependency status
pnpm list --depth=0

# Detailed dependency tree
pnpm list --depth=1
```

**Manual Reviews:**

- Review `package.json` files regularly
- Check for version mismatches
- Monitor breaking changes in major dependencies

### 2. Avoid Forceful Installation Flags ❌

**Never Use These Flags:**

```bash
# DON'T DO THIS
npm install --force
npm install --legacy-peer-deps
pnpm install --force
```

**Why These Are Dangerous:**

- **Silent Failures:** Hide real compatibility issues
- **Runtime Errors:** Cause unexpected behavior in production
- **Security Vulnerabilities:** Bypass security checks
- **Hard-to-Debug Issues:** Mask underlying problems

### 3. Version Compatibility Strategy 🎯

#### Option A: Update Dependencies (Recommended)

```bash
# Update to latest compatible versions
pnpm update package-name@latest

# Update all dependencies
pnpm update
```

#### Option B: Downgrade for Stability

```bash
# Downgrade to compatible version
pnpm add -D package-name@^6.0.0
```

#### Option C: Wait for Official Support

- Monitor package repositories for updates
- Check GitHub issues for compatibility requests
- Consider contributing to open source projects

### 4. Dependency Resolution Strategies

**Package Manager Configuration:**

```json
// .npmrc or .pnpmrc
auto-install-peers=true
strict-peer-dependencies=false
```

**Package.json Overrides:**

```json
{
  "pnpm": {
    "overrides": {
      "vite": "^6.0.0"
    }
  }
}
```

### 5. Testing and Validation

**Pre-Update Testing:**

```bash
# Test current setup
pnpm test
pnpm build
pnpm typecheck
```

**Post-Update Validation:**

```bash
# Verify functionality after updates
pnpm test
pnpm build
pnpm lint
pnpm typecheck
```

## Common Scenarios and Solutions

### Scenario 1: Outdated Plugin

**Problem:** Plugin hasn't been updated for new framework version
**Solution:**

1. Check for latest plugin version
2. Test if current version works despite warnings
3. Consider downgrading framework if stability is critical
4. Monitor plugin repository for updates

### Scenario 2: Conflicting Version Ranges

**Problem:** Multiple packages require different versions
**Solution:**

1. Identify the conflict source
2. Check if newer versions resolve conflicts
3. Use package manager overrides if necessary
4. Consider alternative packages

### Scenario 3: Breaking Changes

**Problem:** Major version updates introduce breaking changes
**Solution:**

1. Review changelog and migration guides
2. Update code to match new APIs
3. Test thoroughly after updates
4. Consider gradual migration strategy

## Monitoring and Maintenance

### Automated Tools

**Dependabot/Renovate:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Package Monitoring:**

- Subscribe to package release notifications
- Monitor security advisories
- Track breaking changes in major dependencies

### Manual Monitoring

**Regular Reviews:**

- Weekly dependency audits
- Monthly security scans
- Quarterly major version reviews
- Annual dependency cleanup

## Warning Types and Responses

### Non-Blocking Warnings

**Example:** Peer dependency version mismatch
**Response:** Monitor and update when possible

### Blocking Errors

**Example:** Missing required peer dependency
**Response:** Install missing dependency immediately

### Security Warnings

**Example:** Vulnerable dependency versions
**Response:** Update to secure versions immediately

## Project-Specific Considerations

### Monorepo Management

**Workspace Dependencies:**

```json
{
  "pnpm": {
    "overrides": {
      "vite": "workspace:*"
    }
  }
}
```

**Shared Dependencies:**

- Use workspace protocol for internal packages
- Maintain consistent versions across packages
- Centralize dependency management

### Framework-Specific Patterns

**React Projects:**

- Monitor React and React-DOM version alignment
- Watch for breaking changes in major versions
- Use compatible testing library versions

**Vue Projects:**

- Ensure Vue and Vue compiler versions match
- Monitor Vite plugin compatibility
- Check TypeScript integration

**SolidJS Projects:**

- Always use vite-plugin-solid
- Monitor SolidJS and plugin version alignment
- Test reactivity system after updates

## Emergency Procedures

### When Builds Break

1. **Immediate Response:**

   ```bash
   # Revert to last working state
   git checkout HEAD~1
   pnpm install
   ```

2. **Investigation:**
   - Check recent dependency updates
   - Review error messages
   - Test with minimal configuration

3. **Resolution:**
   - Pin problematic dependencies
   - Update incompatible packages
   - Consider alternative solutions

### When Security Issues Arise

1. **Immediate Response:**

   ```bash
   # Audit for vulnerabilities
   pnpm audit

   # Fix automatically where possible
   pnpm audit --fix
   ```

2. **Manual Review:**
   - Review security advisories
   - Update to secure versions
   - Test after security updates

## Conclusion

Effective peer dependency management requires:

- **Proactive Monitoring:** Regular audits and updates
- **Strategic Planning:** Version compatibility strategies
- **Thorough Testing:** Validation after changes
- **Community Engagement:** Contributing to ecosystem health

By following these best practices, development teams can maintain stable, secure, and up-to-date dependency trees while minimizing compatibility issues.

## Related Documentation

- [Vite 7 and SolidJS Compatibility Research](./vite-7-solidjs-compatibility-research.md)
- [Alternative Solutions and Workarounds](./vite-solidjs-alternative-solutions.md)
- [Dependency Update Strategy](./dependency-update-strategy.md)
