# reynard-auth

Complete authentication and user management system for SolidJS applications with JWT tokens,
password strength analysis, and comprehensive security features.

## 🚀 Features

- **🔐 JWT Authentication**: Complete token-based authentication with refresh tokens
- **📝 Login & Registration**: Ready-to-use forms with validation and error handling
- **🔑 Password Security**: Advanced password strength analysis using zxcvbn
- **👤 User Management**: Profile management, password changes, and user preferences
- **🛡️ Security**: Automatic token refresh, secure storage, and CSRF protection
- **🎨 Theming**: Seamless integration with Reynard's design system
- **♿ Accessibility**: Screen reader friendly with proper ARIA labels
- **📱 Responsive**: Mobile-first design with touch-friendly interactions
- **⚡ Performance**: Optimized with automatic token management and caching

## 📦 Installation

```bash
pnpm install reynard-auth reynard-core reynard-components jwt-decode @zxcvbn-ts/core solid-js
```

## 🎯 Quick Start

### Basic Setup

```tsx
import { AuthProvider, LoginForm, RegisterForm } from "reynard-auth";
import { createSignal, Show } from "solid-js";

function App() {
  const [showLogin, setShowLogin] = createSignal(true);

  return (
    <AuthProvider
      config={{
        apiBaseUrl: "/api",
        autoRefresh: true,
        loginRedirectPath: "/dashboard",
      }}
      callbacks={{
        onLoginSuccess: user => console.log("Welcome:", user.username),
        onLogout: () => console.log("Goodbye!"),
        onSessionExpired: () => console.log("Session expired"),
      }}
    >
      <div class="app">
        <Show when={showLogin()}>
          <LoginForm
            onLogin={async credentials => {
              // Handle login with your API
              console.log("Login attempt:", credentials);
            }}
            onRegisterClick={() => setShowLogin(false)}
          />
        </Show>

        <Show when={!showLogin()}>
          <RegisterForm
            onRegister={async data => {
              // Handle registration with your API
              console.log("Register attempt:", data);
            }}
            onLoginClick={() => setShowLogin(true)}
          />
        </Show>
      </div>
    </AuthProvider>
  );
}
```

### Using the Auth Hook

```tsx
import { useAuth } from "reynard-auth";

function Dashboard() {
  const auth = useAuth();

  return (
    <div>
      <h1>Welcome, {auth.user()?.username}!</h1>
      <button onClick={auth.logout}>Sign Out</button>
    </div>
  );
}
```

## 📚 Components

### AuthProvider

Context provider that manages authentication state and provides auth methods.

```tsx
<AuthProvider
  config={{
    apiBaseUrl: "/api",
    loginEndpoint: "/auth/login",
    refreshEndpoint: "/auth/refresh",
    autoRefresh: true,
    refreshThresholdMinutes: 10,
  }}
  callbacks={{
    onLoginSuccess: (user, tokens) => {
      console.log("Login successful:", user);
      localStorage.setItem("user_preferences", JSON.stringify(user.preferences));
    },
    onLogout: () => {
      localStorage.removeItem("user_preferences");
      window.location.href = "/";
    },
    onSessionExpired: () => {
      notify("Your session has expired. Please log in again.", "warning");
    },
  }}
  requireAuth={false}
  loginPath="/login"
  fallback={() => <div>Loading authentication...</div>}
>
  <App />
</AuthProvider>
```

### LoginForm

Complete login form with validation and error handling.

```tsx
<LoginForm
  loading={loginMutation.pending}
  error={loginError()}
  showRememberMe={true}
  showForgotPassword={true}
  onLogin={async credentials => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const { user, accessToken, refreshToken } = await response.json();
        auth.login({ user, accessToken, refreshToken });
        navigate("/dashboard");
      } else {
        const error = await response.json();
        setLoginError(error.message);
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
    }
  }}
  onForgotPassword={() => navigate("/forgot-password")}
  onRegisterClick={() => navigate("/register")}
/>
```

### RegisterForm

Registration form with password strength checking and validation.

```tsx
<RegisterForm
  loading={registerMutation.pending}
  error={registerError()}
  requireEmail={true}
  requireFullName={true}
  showTermsAcceptance={true}
  onRegister={async data => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccessMessage("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        const error = await response.json();
        setRegisterError(error.message);
      }
    } catch (error) {
      setRegisterError("Registration failed. Please try again.");
    }
  }}
  onLoginClick={() => navigate("/login")}
  onTermsClick={() => navigate("/terms")}
  onPrivacyClick={() => navigate("/privacy")}
/>
```

### PasswordStrengthMeter

Advanced password strength indicator with detailed feedback.

```tsx
function PasswordField() {
  const [password, setPassword] = createSignal("");

  return (
    <div>
      <input
        type="password"
        value={password()}
        onInput={e => setPassword(e.target.value)}
        placeholder="Enter password"
      />

      <PasswordStrengthMeter
        password={password()}
        userInputs={["john@example.com", "john_doe"]} // Don't use these in password
        showRequirements={true}
        showSuggestions={true}
        showCrackTime={true}
        useAdvanced={true} // Use zxcvbn for advanced analysis
      />
    </div>
  );
}
```

## 🎛️ Composables

### useAuth

Main authentication hook with complete state management.

```tsx
function UserProfile() {
  const auth = useAuth({
    config: {
      autoRefresh: true,
      refreshThresholdMinutes: 5,
    },
    callbacks: {
      onTokenRefresh: tokens => {
        console.log("Tokens refreshed");
      },
    },
  });

  const handleUpdateProfile = async () => {
    try {
      await auth.updateProfile({
        fullName: "John Doe",
        email: "john@example.com",
      });
      notify("Profile updated successfully!", "success");
    } catch (error) {
      notify("Failed to update profile", "error");
    }
  };

  return (
    <div>
      <Show when={auth.isAuthenticated()}>
        <h2>Welcome, {auth.user()?.username}!</h2>
        <p>Role: {auth.user()?.role}</p>
        <button onClick={handleUpdateProfile}>Update Profile</button>
        <button onClick={auth.logout}>Sign Out</button>
      </Show>

      <Show when={auth.isLoading()}>
        <div>Loading...</div>
      </Show>

      <Show when={auth.error()}>
        <div class="error">{auth.error()}</div>
      </Show>
    </div>
  );
}
```

### usePasswordStrength

Advanced password strength analysis with zxcvbn.

```tsx
function PasswordInput() {
  const [password, setPassword] = createSignal("");

  const strength = usePasswordStrength(() => password(), {
    useAdvanced: true,
    minScore: 3,
    userInputs: ["username", "email@domain.com"],
    customDictionary: ["company", "product"],
  });

  return (
    <div>
      <input type="password" value={password()} onInput={e => setPassword(e.target.value)} />

      <div class="strength-indicator">
        <div
          class="strength-bar"
          style={{
            width: `${strength.strengthProgress()}%`,
            "background-color": strength.strengthColor(),
          }}
        />
        <span style={{ color: strength.strengthColor() }}>{strength.strengthLabel()}</span>
      </div>

      <Show when={!strength.isAcceptable()}>
        <div class="strength-feedback">
          <p>{strength.feedback()}</p>
          <ul>
            <For each={strength.strength().suggestions}>{suggestion => <li>{suggestion}</li>}</For>
          </ul>
        </div>
      </Show>

      <div class="requirements">
        <For each={strength.requirements()}>
          {req => (
            <div class={req.met ? "met" : "unmet"}>
              {req.met ? "✓" : "○"} {req.label}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
```

## 🔧 Configuration

### Authentication Configuration

```typescript
const authConfig: AuthConfiguration = {
  // API endpoints
  apiBaseUrl: "/api",
  loginEndpoint: "/auth/login",
  registerEndpoint: "/auth/register",
  refreshEndpoint: "/auth/refresh",
  profileEndpoint: "/auth/profile",

  // Token management
  tokenStorageKey: "auth_token",
  refreshTokenStorageKey: "refresh_token",
  autoRefresh: true,
  refreshThresholdMinutes: 10,

  // Navigation
  loginRedirectPath: "/dashboard",
  logoutRedirectPath: "/login",

  // Features
  enableRememberMe: true,
  sessionTimeoutMinutes: 30,
};
```

### Validation Rules

```typescript
const customValidation: ValidationRules = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  customPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  usernamePattern: /^[a-zA-Z0-9_-]{3,20}$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
```

## 🛡️ Security Features

### Automatic Token Refresh

```tsx
// Tokens are automatically refreshed when they're close to expiring
const auth = useAuth({
  config: {
    autoRefresh: true,
    refreshThresholdMinutes: 10, // Refresh 10 minutes before expiry
  },
  callbacks: {
    onTokenRefresh: tokens => {
      console.log("Tokens refreshed automatically");
    },
    onSessionExpired: () => {
      notify("Session expired. Please log in again.", "warning");
      navigate("/login");
    },
  },
});
```

### Security Best Practices

#### 1. **Token Validation & Sanitization**

```tsx
import { validateToken, sanitizeUserInput } from "reynard-auth";

// Always validate tokens before use
const isValidToken = validateToken(token, {
  verifySignature: true,
  checkExpiration: true,
  allowedIssuers: ["your-app.com"],
});

// Sanitize all user inputs
const cleanUsername = sanitizeUserInput(username, {
  maxLength: 50,
  allowedChars: /^[a-zA-Z0-9_-]+$/,
  trimWhitespace: true,
});
```

#### 2. **Rate Limiting & Brute Force Protection**

```tsx
import { RateLimiter, BruteForceProtection } from "reynard-auth";

// Implement rate limiting for login attempts
const rateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
});

// Brute force protection
const bruteForceProtection = new BruteForceProtection({
  maxFailedAttempts: 3,
  lockoutDurationMs: 10 * 60 * 1000, // 10 minutes
  progressiveDelay: true,
});

// Usage in login handler
const handleLogin = async credentials => {
  const clientId = getClientIdentifier(); // IP + User-Agent hash

  if (await rateLimiter.isBlocked(clientId)) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  if (await bruteForceProtection.isLocked(credentials.identifier)) {
    throw new Error("Account temporarily locked due to failed attempts.");
  }

  try {
    const result = await authenticate(credentials);
    await rateLimiter.reset(clientId);
    await bruteForceProtection.reset(credentials.identifier);
    return result;
  } catch (error) {
    await rateLimiter.recordAttempt(clientId);
    await bruteForceProtection.recordFailedAttempt(credentials.identifier);
    throw error;
  }
};
```

#### 3. **CSRF Protection**

```tsx
import { CSRFProtection } from "reynard-auth";

// Generate CSRF token
const csrfToken = CSRFProtection.generateToken();

// Include in forms
<form onSubmit={handleSubmit}>
  <input type="hidden" name="csrf_token" value={csrfToken} />
  {/* form fields */}
</form>;

// Validate in API calls
const validateCSRF = (token: string) => {
  return CSRFProtection.validateToken(token, {
    maxAge: 3600000, // 1 hour
    requireSecure: true, // HTTPS only
  });
};
```

#### 4. **Secure Session Management**

```tsx
import { SecureSessionManager } from "reynard-auth";

const sessionManager = new SecureSessionManager({
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  slidingExpiration: true,
  secureCookies: true,
  httpOnly: true,
  sameSite: "strict",
});

// Track user activity
const trackActivity = () => {
  sessionManager.updateLastActivity();
};

// Check session validity
const isSessionValid = () => {
  return sessionManager.isValid() && !sessionManager.isExpired();
};
```

### Secure Token Storage

```typescript
import { TokenManager, SecureStorage } from "reynard-auth";

// Secure token management
const tokenManager = TokenManager.getInstance("app_token", "app_refresh");

// Store tokens securely
tokenManager.setTokens(accessToken, refreshToken);

// Check token validity
if (tokenManager.hasAccessToken() && !isTokenExpired(tokenManager.getAccessToken()!)) {
  console.log("Valid token available");
}

// Secure storage for sensitive data
const storage = new SecureStorage("app_");
storage.set("user_preferences", JSON.stringify(preferences));
```

### Password Security

```tsx
import { validatePassword, calculatePasswordStrength, hashPassword } from "reynard-auth";

// Validate password against rules
const validation = validatePassword(password, {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
});

if (!validation.isValid) {
  console.log("Password errors:", validation.errors);
}

// Calculate strength
const strength = calculatePasswordStrength(password);
console.log(`Password strength: ${strength.feedback} (${strength.score}/4)`);

// Hash password before transmission (optional)
const hashedPassword = await hashPassword(password);
```

## 🔐 Advanced Usage

### Custom Auth Provider

```tsx
function CustomAuthProvider(props: { children: any }) {
  const auth = useAuth({
    config: {
      apiBaseUrl: import.meta.env.VITE_API_URL,
      autoRefresh: true,
    },
    callbacks: {
      onLoginSuccess: (user, tokens) => {
        // Track login event
        analytics.track("user_login", { userId: user.id });

        // Set user context for error reporting
        errorReporting.setUser(user);

        // Update last login time
        localStorage.setItem("last_login", new Date().toISOString());
      },

      onLogout: () => {
        // Clear analytics
        analytics.reset();
        errorReporting.clearUser();

        // Clear app data
        localStorage.clear();

        // Redirect to landing page
        window.location.href = "/";
      },

      onSessionExpired: () => {
        toast.error("Your session has expired. Please log in again.");

        // Track session expiry
        analytics.track("session_expired");
      },

      onUnauthorized: () => {
        toast.warning("Access denied. Please check your permissions.");
      },
    },
  });

  return <AuthProvider value={auth}>{props.children}</AuthProvider>;
}
```

### Protected Routes

```tsx
import { withAuth, useAuthContext } from "reynard-auth";

// Higher-order component approach
const ProtectedDashboard = withAuth(Dashboard, {
  redirectTo: "/login",
  fallback: () => <div>Checking authentication...</div>,
});

// Hook approach
function AdminPanel() {
  const auth = useAuthContext();

  // Check role-based access
  if (!hasPermission(auth.user()?.role || "guest", "admin")) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return <div>Admin panel content</div>;
}

// Route guard approach (with your router)
function AuthGuard(props: { children: any; requireRole?: UserRole }) {
  const auth = useAuthContext();

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) {
      navigate("/login");
    }

    if (props.requireRole && !hasPermission(auth.user()?.role || "guest", props.requireRole)) {
      navigate("/unauthorized");
    }
  });

  if (auth.isLoading()) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated()) {
    return null; // Will redirect
  }

  return <>{props.children}</>;
}
```

### API Integration

```tsx
// Custom auth fetch wrapper
function useAuthenticatedApi() {
  const auth = useAuthContext();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await auth.authFetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => apiCall(endpoint),
    post: (endpoint: string, data: any) =>
      apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (endpoint: string, data: any) =>
      apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (endpoint: string) =>
      apiCall(endpoint, {
        method: "DELETE",
      }),
  };
}

// Usage in components
function UsersList() {
  const api = useAuthenticatedApi();
  const [users] = createResource(async () => {
    return await api.get("/users");
  });

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      // Refetch users list
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div>
      <For each={users()}>
        {user => (
          <div>
            {user.username}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </div>
        )}
      </For>
    </div>
  );
}
```

## 📊 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  User,
  UserRole,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthConfiguration,
  PasswordStrength,
  ValidationRules,
} from "reynard-auth";

// Type-safe user management
const updateUser = (userId: string, updates: Partial<User>): Promise<User> => {
  return api.put(`/users/${userId}`, updates);
};

// Role-based access control
const hasAdminAccess = (user: User): boolean => {
  return hasPermission(user.role, "admin");
};

// Custom validation
const customValidation: ValidationRules = {
  minLength: 8,
  customPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
};
```

## 🧪 Testing

Testing utilities and examples:

```tsx
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AuthProvider, LoginForm } from "reynard-auth";

describe("LoginForm", () => {
  test("handles login submission", async () => {
    const mockLogin = vi.fn();

    render(() => (
      <AuthProvider>
        <LoginForm onLogin={mockLogin} />
      </AuthProvider>
    ));

    // Fill in the form
    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: "testuser",
        password: "password123",
        rememberMe: false,
      });
    });
  });
});
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with 🔐 for secure SolidJS applications** 🛡️🦊
