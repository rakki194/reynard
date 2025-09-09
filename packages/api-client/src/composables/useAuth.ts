/**
 * Authentication composable for Reynard API
 */

import { createSignal, createResource } from 'solid-js';
import type { LoginRequest, RegisterRequest, User } from '../generated/index.js';

export interface UseAuthOptions {
  basePath?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = createSignal<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  const login = async (credentials: LoginRequest) => {
    // Stub implementation
    console.log('Login attempt:', credentials);
    return { success: true, user: null };
  };

  const register = async (data: RegisterRequest) => {
    // Stub implementation
    console.log('Register attempt:', data);
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
    logout
  };
}