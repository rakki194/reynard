import { createSignal, Show } from "solid-js";
import { LoginForm, RegisterForm, useAuth, AuthProvider } from "@reynard/auth";
import { Card, Button } from "@reynard/components";
import { useI18n, useNotifications } from "@reynard/core";
import type { LoginCredentials, RegisterData } from "@reynard/auth";

function AuthContent() {
  const { t } = useI18n();
  const { notify } = useNotifications();
  const { user, login, logout, register, isLoading } = useAuth();
  const [authMode, setAuthMode] = createSignal<"login" | "register">("login");

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      notify(t("auth.loginSuccess"), "success");
    } catch {
      notify(t("auth.loginError"), "error");
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data);
      notify(t("auth.registerSuccess"), "success");
    } catch {
      notify(t("auth.registerError"), "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      notify(t("auth.logoutSuccess"), "success");
    } catch {
      notify(t("auth.logoutError"), "error");
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{t("auth.title")}</h1>
        <Show when={user()}>
          <Button variant="secondary" onClick={handleLogout}>
            {t("auth.logout")}
          </Button>
        </Show>
      </div>

      <Show
        when={user()}
        fallback={
          <div class="max-w-md mx-auto">
            <Card>
              <div class="p-6">
                <div class="flex justify-center mb-6">
                  <div class="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={authMode() === "login" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setAuthMode("login")}
                    >
                      {t("auth.login")}
                    </Button>
                    <Button
                      variant={authMode() === "register" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setAuthMode("register")}
                    >
                      {t("auth.register")}
                    </Button>
                  </div>
                </div>

                <Show
                  when={authMode() === "login"}
                  fallback={
                    <RegisterForm
                      onRegister={handleRegister}
                      loading={isLoading()}
                    />
                  }
                >
                  <LoginForm onLogin={handleLogin} loading={isLoading()} />
                </Show>
              </div>
            </Card>
          </div>
        }
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4">
                {t("auth.profile.title")}
              </h2>
              <div class="space-y-3">
                <div>
                  <span class="font-medium">{t("auth.profile.name")}:</span>
                  <span class="ml-2">
                    {user()?.fullName || user()?.username || "N/A"}
                  </span>
                </div>
                <div>
                  <span class="font-medium">{t("auth.profile.email")}:</span>
                  <span class="ml-2">{user()?.email || "N/A"}</span>
                </div>
                <div>
                  <span class="font-medium">{t("auth.profile.role")}:</span>
                  <span class="ml-2">{user()?.role || "User"}</span>
                </div>
                <div>
                  <span class="font-medium">{t("auth.profile.joinDate")}:</span>
                  <span class="ml-2">
                    {user()?.createdAt
                      ? new Date(user()!.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4">
                {t("auth.session.title")}
              </h2>
              <div class="space-y-3">
                <div>
                  <span class="font-medium">{t("auth.session.status")}:</span>
                  <span class="ml-2 text-green-600">
                    {t("auth.session.active")}
                  </span>
                </div>
                <div>
                  <span class="font-medium">
                    {t("auth.session.lastLogin")}:
                  </span>
                  <span class="ml-2">
                    {user()?.lastLogin?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div>
                  <span class="font-medium">
                    {t("auth.session.tokenExpiry")}:
                  </span>
                  <span class="ml-2">
                    {user()?.lastLogin?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div class="pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => notify(t("auth.session.refreshed"), "info")}
                  >
                    {t("auth.session.refreshToken")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div class="p-6">
            <h2 class="text-lg font-semibold mb-4">
              {t("auth.security.title")}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">✓</div>
                <div class="text-sm font-medium">
                  {t("auth.security.emailVerified")}
                </div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">🔒</div>
                <div class="text-sm font-medium">
                  {t("auth.security.strongPassword")}
                </div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">⚠️</div>
                <div class="text-sm font-medium">
                  {t("auth.security.twoFactorDisabled")}
                </div>
              </div>
            </div>
            <div class="flex justify-center mt-6">
              <Button
                variant="primary"
                onClick={() =>
                  notify(t("auth.security.settingsOpened"), "info")
                }
              >
                {t("auth.security.manageSettings")}
              </Button>
            </div>
          </div>
        </Card>
      </Show>
    </div>
  );
}

export function Auth() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}
