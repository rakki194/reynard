declare module "reynard-auth" {
  import { Component } from "solid-js";

  export interface AuthProviderProps {
    children: any;
  }

  export interface LoginFormProps {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }

  export interface RegisterFormProps {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }

  export interface AuthContext {
    isAuthenticated: () => boolean;
    user: () => any;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    register: (userData: any) => Promise<void>;
  }

  export const AuthProvider: Component<AuthProviderProps>;
  export const LoginForm: Component<LoginFormProps>;
  export const RegisterForm: Component<RegisterFormProps>;
  export const useAuth: () => AuthContext;
}
