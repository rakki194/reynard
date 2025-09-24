# Reynard Auth Composables

SolidJS composables and components for authentication in the Reynard ecosystem. This package provides reactive authentication state management and pre-built UI components for SolidJS applications.

## Features

- **Reactive State**: SolidJS signals for authentication state
- **Pre-built Components**: LoginForm, RegisterForm, and PasswordStrengthMeter
- **Context Provider**: AuthProvider for app-wide authentication state
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Validation Integration**: Built-in form validation with reynard-validation
- **Theme Integration**: Styled components that work with Reynard themes

## Installation

```bash
pnpm add reynard-auth-composables
```

## Basic Usage

### Setup AuthProvider

```typescript
import { AuthProvider } from "reynard-auth-composables";

function App() {
  return (
    <AuthProvider
      config={{
        apiBaseUrl: "https://api.example.com",
        autoRefresh: true,
        enableRememberMe: true,
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}
```

### Use Authentication State

```typescript
import { useAuth } from "reynard-auth-composables";

function UserProfile() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <h2>Welcome, {user()?.username}!</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in</p>
          <button onClick={() => login({ identifier: "user", password: "pass" })}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}
```

## Components

### LoginForm

A complete login form with validation and error handling:

```typescript
import { LoginForm } from "reynard-auth-composables";

function LoginPage() {
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Handle successful login
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      loading={isLoading()}
      showRememberMe={true}
      requireEmail={false}
    />
  );
}
```

#### LoginForm Props

```typescript
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  showRememberMe?: boolean;
  requireEmail?: boolean;
  className?: string;
}
```

### RegisterForm

A complete registration form with validation:

```typescript
import { RegisterForm } from "reynard-auth-composables";

function RegisterPage() {
  const handleRegister = async (data) => {
    try {
      await register(data);
      // Handle successful registration
    } catch (error) {
      // Handle registration error
    }
  };

  return (
    <RegisterForm
      onRegister={handleRegister}
      loading={isLoading()}
      requireEmail={true}
      requireFullName={true}
    />
  );
}
```

#### RegisterForm Props

```typescript
interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<void>;
  loading?: boolean;
  requireEmail?: boolean;
  requireFullName?: boolean;
  className?: string;
}
```

### PasswordStrengthMeter

A password strength indicator component:

```typescript
import { PasswordStrengthMeter } from "reynard-auth-composables";

function PasswordField() {
  const [password, setPassword] = createSignal("");

  return (
    <div>
      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthMeter password={password()} />
    </div>
  );
}
```

#### PasswordStrengthMeter Props

```typescript
interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}
```

## Composables

### useAuth

The main authentication composable that provides reactive state and actions:

```typescript
import { useAuth } from "reynard-auth-composables";

function MyComponent() {
  const {
    // State
    authState,
    user,
    isAuthenticated,
    isLoading,
    error,
    isRefreshing,

    // Actions
    login,
    register,
    logout,
    refreshTokens,
    changePassword,
    initialize,

    // Utilities
    tokenManager,
  } = useAuth();

  // Use the state and actions
  return (
    <div>
      {isAuthenticated() ? (
        <p>Welcome, {user()?.username}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

#### useAuth Return Value

```typescript
interface UseAuthReturn {
  // State
  authState: Accessor<AuthState>;
  user: Accessor<User | null>;
  isAuthenticated: Accessor<boolean>;
  isLoading: Accessor<boolean>;
  error: Accessor<string | null>;
  isRefreshing: Accessor<boolean>;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  initialize: () => Promise<void>;

  // Utilities
  tokenManager: AuthTokenManager;
}
```

### usePasswordStrength

A composable for password strength analysis:

```typescript
import { usePasswordStrength } from "reynard-auth-composables";

function PasswordField() {
  const [password, setPassword] = createSignal("");
  const { strength, score, feedback } = usePasswordStrength(password);

  return (
    <div>
      <input
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.target.value)}
      />
      <div>Strength: {strength()}</div>
      <div>Score: {score()}/4</div>
      {feedback().length > 0 && (
        <ul>
          {feedback().map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Context Provider

### AuthProvider

The AuthProvider component provides authentication context to your entire application:

```typescript
import { AuthProvider } from "reynard-auth-composables";

function App() {
  return (
    <AuthProvider
      config={{
        apiBaseUrl: "https://api.example.com",
        autoRefresh: true,
        enableRememberMe: true,
        refreshThreshold: 300,
      }}
      callbacks={{
        onLoginSuccess: (user) => console.log("Welcome:", user.username),
        onLogout: () => console.log("Goodbye!"),
        onSessionExpired: () => console.log("Session expired"),
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}
```

#### AuthProvider Props

```typescript
interface AuthProviderProps {
  config: AuthConfig;
  callbacks?: {
    onLoginSuccess?: (user: User) => void;
    onLogout?: () => void;
    onSessionExpired?: () => void;
    onError?: (error: string) => void;
  };
  fallback?: Component;
  children: any;
}
```

## Form Validation

The components integrate with reynard-validation for form validation:

```typescript
import { validateEmail, validateUsername } from "reynard-validation";

// Email validation
const emailResult = validateEmail("user@example.com");
if (!emailResult.isValid) {
  console.error(emailResult.error);
}

// Username validation
const usernameResult = validateUsername("myusername");
if (!usernameResult.isValid) {
  console.error(usernameResult.error);
}
```

## Styling

The components are styled to work with Reynard themes and can be customized:

```typescript
import { LoginForm } from "reynard-auth-composables";

function StyledLoginForm() {
  return (
    <LoginForm
      onLogin={handleLogin}
      className="custom-login-form"
      // Components use CSS classes that can be overridden
    />
  );
}
```

### CSS Classes

- `.login-form` - Main login form container
- `.register-form` - Main registration form container
- `.password-strength-meter` - Password strength meter container
- `.form-field` - Individual form field
- `.form-error` - Error message styling
- `.form-button` - Form button styling

## Error Handling

The composables provide comprehensive error handling:

```typescript
import { useAuth } from "reynard-auth-composables";

function LoginComponent() {
  const { login, error, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Success
    } catch (err) {
      // Error is automatically set in the error signal
      console.error("Login failed:", error());
    }
  };

  return (
    <div>
      {error() && <div class="error">{error()}</div>}
      <LoginForm onLogin={handleLogin} loading={isLoading()} />
    </div>
  );
}
```

## Integration Examples

### With React Router

```typescript
import { useAuth } from "reynard-auth-composables";
import { Navigate } from "@solidjs/router";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? children : <Navigate href="/login" />;
}
```

### With Notifications

```typescript
import { useAuth } from "reynard-auth-composables";
import { useNotifications } from "reynard-core";

function LoginComponent() {
  const { login } = useAuth();
  const { notify } = useNotifications();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      notify("Login successful!", "success");
    } catch (error) {
      notify("Login failed", "error");
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}
```

## Testing

The composables include test utilities for SolidJS testing:

```typescript
import { render, screen } from "@solidjs/testing-library";
import { AuthProvider } from "reynard-auth-composables";

function TestComponent() {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated() ? "Authenticated" : "Not authenticated"}</div>;
}

test("shows authentication state", () => {
  render(() => (
    <AuthProvider config={{ apiBaseUrl: "http://localhost:3000" }}>
      <TestComponent />
    </AuthProvider>
  ));

  expect(screen.getByText("Not authenticated")).toBeInTheDocument();
});
```

## API Reference

### Components

- `AuthProvider` - Authentication context provider
- `LoginForm` - Pre-built login form
- `RegisterForm` - Pre-built registration form
- `PasswordStrengthMeter` - Password strength indicator

### Composables

- `useAuth` - Main authentication composable
- `usePasswordStrength` - Password strength analysis

### Types

- `AuthProviderProps` - AuthProvider configuration
- `LoginFormProps` - LoginForm configuration
- `RegisterFormProps` - RegisterForm configuration
- `UseAuthReturn` - useAuth return type

## License

MIT License - see LICENSE file for details.
