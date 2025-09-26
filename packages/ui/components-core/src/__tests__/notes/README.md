# Notes RBAC Components Test Suite

This directory contains comprehensive tests for the RBAC-enabled notes components that were converted from React to SolidJS.

## Test Structure

### Unit Tests

- **`NoteSharingModal.test.tsx`** - Tests for the note sharing modal component
- **`RoleBasedVisibility.test.tsx`** - Tests for the role-based visibility control component
- **`PermissionManagement.test.tsx`** - Tests for the permission management interface component

### Test Setup

- **`test-setup.ts`** - Test configuration, mocks, and utilities for notes components

## Test Coverage

### NoteSharingModal Tests

- ✅ **Rendering**: Modal visibility, user selection, permission display
- ✅ **User Selection**: Dropdown functionality, user filtering
- ✅ **Permission Selection**: Permission level changes, descriptions
- ✅ **Sharing Functionality**: Share button, loading states, success/error handling
- ✅ **Collaborator Management**: Permission updates, access revocation
- ✅ **Modal Controls**: Close functionality, form reset
- ✅ **Error Handling**: Network errors, permission errors

### RoleBasedVisibility Tests

- ✅ **Rendering**: Visibility controls, current settings display
- ✅ **Public Visibility Toggle**: Checkbox functionality, description updates
- ✅ **Scope Selection**: Dropdown changes, scope descriptions
- ✅ **Role-Based Access**: Role toggling, level sorting, descriptions
- ✅ **User-Specific Access**: User toggling, user information display
- ✅ **Save and Reset**: Change detection, save functionality, reset functionality
- ✅ **Error Handling**: Save errors, graceful degradation

### PermissionManagement Tests

- ✅ **Rendering**: Interface display, permission tables, audit logs
- ✅ **Add Permission**: User selection, permission level, form validation
- ✅ **Update Permission**: Permission level changes, loading states
- ✅ **Remove Permission**: Delete functionality, confirmation
- ✅ **Refresh Functionality**: Data refresh, loading states
- ✅ **Permission Status**: Active/inactive permissions
- ✅ **Audit Log**: Log display, timestamps, actions
- ✅ **Error Handling**: Add/update/remove errors

## Test Utilities

### Mock Data Factories

```typescript
// Create mock user data
const mockUser = createMockUser({
  id: "user-123",
  username: "test_user",
  displayName: "Test User",
  email: "test@example.com",
});

// Create mock role data
const mockRole = createMockRole({
  id: "role-123",
  displayName: "Admin",
  level: 100,
});

// Create mock permission data
const mockPermission = createMockPermission({
  id: "perm-123",
  permissionLevel: "editor",
});

// Create mock visibility settings
const mockVisibility = createMockVisibility({
  isPublic: true,
  scope: "global",
});
```

### Async Function Mocks

```typescript
// Mock successful async function
const mockSuccess = createMockAsyncFunction(true, 100);

// Mock async function with error
const mockError = createMockAsyncFunctionWithError(new Error("Test error"), 100);
```

### Test Utilities

```typescript
// Wait for async operations
await waitForAsyncOperation(100);

// Wait for component updates
await waitFor(() => {
  expect(screen.getByText("Expected Text")).toBeInTheDocument();
});
```

## Running Tests

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### E2E Tests

```bash
# Run e2e tests from project root
cd ../../../
pnpm test:e2e --grep "Notes RBAC"
```

## Test Patterns

### Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { setupStandardTest } from "reynard-testing";

describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    render(() => <ComponentName {...mockProps} />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle user interactions", async () => {
    render(() => <ComponentName {...mockProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
```

### Async Testing

```typescript
it("should handle async operations", async () => {
  const mockAsyncFunction = vi.fn().mockResolvedValue(true);

  render(() => <ComponentName onAsyncAction={mockAsyncFunction} />);

  const button = screen.getByRole("button");
  fireEvent.click(button);

  await waitFor(() => {
    expect(mockAsyncFunction).toHaveBeenCalled();
  });
});
```

### Error Testing

```typescript
it("should handle errors gracefully", async () => {
  const mockErrorFunction = vi.fn().mockRejectedValue(new Error("Test error"));

  render(() => <ComponentName onErrorAction={mockErrorFunction} />);

  const button = screen.getByRole("button");
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Mock Components

The test setup includes mocks for:

- **Icon**: Renders as `<span data-testid="icon-{name}">`
- **Modal**: Renders as a div with modal structure
- **Button**: Renders as a button with variant/size attributes
- **Card**: Renders as a div with card styling
- **Checkbox**: Renders as an input checkbox

## Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Test both success and error scenarios** for async operations
3. **Use proper async/await patterns** with `waitFor` for state changes
4. **Mock external dependencies** to isolate component behavior
5. **Test accessibility** with proper ARIA attributes and roles
6. **Use data-testid attributes** for reliable element selection
7. **Clean up mocks** in `beforeEach` to avoid test interference

## Coverage Goals

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Troubleshooting

### Common Issues

1. **Async operations not completing**: Use `waitFor` with proper timeouts
2. **Mock functions not being called**: Check mock setup and component props
3. **Elements not found**: Verify data-testid attributes and component rendering
4. **State not updating**: Ensure proper SolidJS reactive patterns are used

### Debug Tips

1. Use `screen.debug()` to see the current DOM state
2. Add `console.log` statements in test functions for debugging
3. Use `--reporter=verbose` for detailed test output
4. Check test setup files for proper mock configuration
