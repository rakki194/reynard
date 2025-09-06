/**
 * Reynard Auth App - Main Application Component
 * A comprehensive authentication demo with PostgreSQL backend
 */

import {
  Component,
  createSignal,
  Show,
} from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
} from "@reynard/core";
import { AuthProvider, useAuth } from "@reynard/auth";
import { LoginForm, RegisterForm } from "@reynard/auth";
import { ReynardProvider, useReynard } from "@reynard/themes";
import { Card, Button } from "@reynard/components";
import { 
  Person, 
  Shield, 
  SignOut, 
  Settings, 
  CheckmarkCircle,
  Warning,
  Info
} from "@reynard/fluent-icons";
import type { LoginCredentials, RegisterData } from "@reynard/auth";

type AuthMode = "login" | "register";

const AuthContent: Component = () => {
  const { theme } = useTheme();
  const { t } = useReynard();
  const auth = useAuth();
  const [authMode, setAuthMode] = createSignal<AuthMode>("login");
  const [error, setError] = createSignal<string>("");
  const [success, setSuccess] = createSignal<string>("");

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setError("");
      setSuccess("");
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: credentials.identifier,
          password: credentials.password,
        }),
      });

      if (response.ok) {
        const tokens = await response.json();
        // Store tokens and set user
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        
        // Get user info
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          auth.login({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
          setSuccess("Login successful! Welcome back!");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setError("");
      setSuccess("");
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          email: data.email,
          full_name: data.fullName,
          role: "regular",
        }),
      });

      if (response.ok) {
        setSuccess("Registration successful! Please log in with your new account.");
        setAuthMode("login");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      auth.logout();
      setSuccess("Logged out successfully!");
    }
  };

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <div class="header-title">
            <Shield size={32} />
            <h1>Reynard Auth Demo</h1>
          </div>
          <p>Authentication with PostgreSQL & Gatekeeper - Built with Reynard Framework</p>
          <div class="header-controls">
            <div class="theme-info">
              <Settings size={16} />
              <span>Theme: {theme()}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="app-main">
        <Show
          when={auth.isAuthenticated()}
          fallback={
            <Card class="auth-container">
              <Show when={error()}>
                <div class="error-message">
                  <Warning size={20} />
                  <span>{error()}</span>
                </div>
              </Show>
              
              <Show when={success()}>
                <div class="success-message">
                  <CheckmarkCircle size={20} />
                  <span>{success()}</span>
                </div>
              </Show>

              <div class="auth-tabs">
                <div class="tab-switcher">
                  <Button
                    variant={authMode() === "login" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAuthMode("login")}
                    class="tab-button"
                  >
                    <Person size={16} />
                    Login
                  </Button>
                  <Button
                    variant={authMode() === "register" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAuthMode("register")}
                    class="tab-button"
                  >
                    <Person size={16} />
                    Register
                  </Button>
                </div>

                <div class="auth-form">
                  <Show
                    when={authMode() === "login"}
                    fallback={
                      <RegisterForm
                        onRegister={handleRegister}
                        loading={auth.isLoading()}
                        requireEmail={true}
                        requireFullName={true}
                      />
                    }
                  >
                    <LoginForm
                      onLogin={handleLogin}
                      loading={auth.isLoading()}
                      showRememberMe={true}
                    />
                  </Show>
                </div>
              </div>
            </Card>
          }
        >
          <Card class="dashboard-container">
            <div class="dashboard-header">
              <div class="welcome-section">
                <CheckmarkCircle size={32} class="success-icon" />
                <div>
                  <h2>Welcome to your Dashboard!</h2>
                  <p>You are successfully authenticated with Reynard Auth and Gatekeeper.</p>
                </div>
              </div>
            </div>

            <div class="user-info-grid">
              <Card class="info-card">
                <div class="info-header">
                  <Person size={20} />
                  <h3>Username</h3>
                </div>
                <p>{auth.user()?.username || "N/A"}</p>
              </Card>
              
              <Card class="info-card">
                <div class="info-header">
                  <Info size={20} />
                  <h3>Email</h3>
                </div>
                <p>{auth.user()?.email || "N/A"}</p>
              </Card>
              
              <Card class="info-card">
                <div class="info-header">
                  <Person size={20} />
                  <h3>Full Name</h3>
                </div>
                <p>{auth.user()?.fullName || "N/A"}</p>
              </Card>
              
              <Card class="info-card">
                <div class="info-header">
                  <Shield size={20} />
                  <h3>Role</h3>
                </div>
                <p class="role-badge">{auth.user()?.role || "User"}</p>
              </Card>
              
              <Card class="info-card">
                <div class="info-header">
                  <Settings size={20} />
                  <h3>User ID</h3>
                </div>
                <p class="user-id">{auth.user()?.id || "N/A"}</p>
              </Card>
              
              <Card class="info-card">
                <div class="info-header">
                  <Info size={20} />
                  <h3>Created</h3>
                </div>
                <p>
                  {auth.user()?.createdAt 
                    ? new Date(auth.user()!.createdAt).toLocaleDateString()
                    : "N/A"
                  }
                </p>
              </Card>
            </div>

            <div class="dashboard-actions">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleLogout}
                class="logout-button"
              >
                <SignOut size={20} />
                Sign Out
              </Button>
            </div>
          </Card>
        </Show>
      </main>
    </div>
  );
};

const App: Component = () => {
  const themeModule = createTheme();
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider>
      <ThemeProvider value={themeModule}>
        <NotificationsProvider value={notificationsModule}>
          <AuthProvider
            config={{
              apiBaseUrl: "/api",
              autoRefresh: true,
              loginRedirectPath: "/dashboard",
            }}
            callbacks={{
              onLoginSuccess: (user) => console.log("Welcome:", user.username),
              onLogout: () => console.log("Goodbye!"),
              onSessionExpired: () => console.log("Session expired"),
            }}
          >
            <AuthContent />
          </AuthProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </ReynardProvider>
  );
};

export default App;
