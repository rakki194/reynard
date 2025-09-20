/**
 * Authentication composable for Reynard API
 */

import { createSignal, createResource } from "solid-js";
import type { SecureUserLogin, UserCreate, UserPublic } from "../generated/index";

export interface UseAuthOptions {
  basePath?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = createSignal<UserPublic | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  const login = async (credentials: SecureUserLogin) => {
    // Stub implementation
    console.log("Login attempt:", credentials);
    return { success: true, user: null };
  };

  const register = async (data: UserCreate) => {
    // Stub implementation
    console.log("Register attempt:", data);
    return { success: true, user: null };
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
