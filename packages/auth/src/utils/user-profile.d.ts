/**
 * User Profile Management
 * Handles user profile operations and data fetching
 */
import { createResource } from "solid-js";
import type { User, AuthState, AuthConfiguration } from "../types";
export interface UserProfileManager {
    userProfile: ReturnType<typeof createResource<User | null, boolean>>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
}
/**
 * Creates user profile management functions
 */
export declare const createUserProfileManager: (config: AuthConfiguration, authState: () => AuthState, updateAuthState: (updates: Partial<AuthState>) => void, authFetch: ReturnType<typeof import("./api-utils").createAuthFetch>) => UserProfileManager;
//# sourceMappingURL=user-profile.d.ts.map