/**
 * Authentication composable for Reynard API
 */
import type { UserLogin, UserCreate } from "../generated/index.js";
export interface UseAuthOptions {
    basePath?: string;
}
export declare function useAuth(options?: UseAuthOptions): {
    user: import("solid-js").Accessor<any>;
    isAuthenticated: import("solid-js").Accessor<boolean>;
    login: (credentials: UserLogin) => Promise<{
        success: boolean;
        user: any;
    }>;
    register: (data: UserCreate) => Promise<{
        success: boolean;
        user: any;
    }>;
    logout: () => Promise<void>;
};
