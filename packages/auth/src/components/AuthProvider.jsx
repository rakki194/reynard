/**
 * Auth Provider Component
 * Context provider for authentication state and methods
 */
import { createContext, useContext, createEffect } from "solid-js";
import { useAuth } from "../composables/useAuth";
const AuthContext = createContext();
export const AuthProvider = (props) => {
  const {
    children,
    fallback: Fallback,
    requireAuth = false,
    loginPath = "/login",
    ...authOptions
  } = props;
  const auth = useAuth({
    ...authOptions,
    autoInit: true,
  });
  // Handle auth redirects
  createEffect(() => {
    if (requireAuth && !auth.isLoading() && !auth.isAuthenticated()) {
      // In a real app, you would use your router here
      console.warn("Authentication required. Redirect to:", loginPath);
      if (typeof window !== "undefined") {
        window.location.href = loginPath;
      }
    }
  });
  const contextValue = {
    // State
    authState: auth.authState,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isRefreshing: auth.isRefreshing,
    // Actions
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    refreshTokens: auth.refreshTokens,
    changePassword: auth.changePassword,
    updateProfile: auth.updateProfile,
    initialize: auth.initialize,
    // Utilities
    authFetch: auth.authFetch,
  };
  // Show loading fallback while initializing
  if (auth.isLoading() && Fallback) {
    return <Fallback />;
  }
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
/**
 * Higher-order component to require authentication
 */
export function withAuth(WrappedComponent, options = {}) {
  return (props) => {
    const auth = useAuthContext();
    const { fallback: Fallback, redirectTo = "/login" } = options;
    createEffect(() => {
      if (!auth.isLoading() && !auth.isAuthenticated()) {
        if (typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
      }
    });
    if (auth.isLoading()) {
      return Fallback ? <Fallback /> : <div>Loading...</div>;
    }
    if (!auth.isAuthenticated()) {
      return Fallback ? <Fallback /> : <div>Authentication required</div>;
    }
    return <WrappedComponent {...props} />;
  };
}
