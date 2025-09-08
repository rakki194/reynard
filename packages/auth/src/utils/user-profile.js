/**
 * User Profile Management
 * Handles user profile operations and data fetching
 */
import { createResource } from "solid-js";
import { parseApiResponse } from "./api-utils";
/**
 * Creates user profile management functions
 */
export const createUserProfileManager = (config, authState, updateAuthState, authFetch) => {
    // Get current user profile
    const [userProfile] = createResource(() => authState().isAuthenticated, async (isAuthenticated) => {
        if (!isAuthenticated)
            return null;
        try {
            const response = await authFetch(config.profileEndpoint);
            const result = await parseApiResponse(response);
            if (result.success && result.data) {
                updateAuthState({ user: result.data });
                return result.data;
            }
            return null;
        }
        catch (error) {
            console.error("Failed to fetch user profile:", error);
            return null;
        }
    });
    // Update user profile
    const updateProfile = async (profileData) => {
        updateAuthState({ isLoading: true, error: null });
        try {
            const response = await authFetch(config.profileEndpoint, {
                method: "PUT",
                body: JSON.stringify(profileData),
            });
            const result = await parseApiResponse(response);
            if (result.success && result.data) {
                updateAuthState({
                    user: result.data,
                    isLoading: false,
                });
            }
            else {
                const errorMessage = result.error || "Profile update failed";
                updateAuthState({
                    isLoading: false,
                    error: errorMessage,
                });
                throw new Error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Profile update failed";
            updateAuthState({
                isLoading: false,
                error: errorMessage,
            });
            throw error;
        }
    };
    return {
        userProfile,
        updateProfile,
    };
};
