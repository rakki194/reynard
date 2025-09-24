import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthOrchestrator } from "../auth-orchestrator";
import { TokenManager } from "../token-manager";
import { createAuthClient } from "../auth-client";
import { DEFAULT_AUTH_CONFIG } from "../types";

// Mock the auth-client
vi.mock("../auth-client", () => ({
  createAuthClient: vi.fn(),
}));

// Mock the token-manager
vi.mock("../token-manager", () => ({
  TokenManager: {
    getInstance: vi.fn(),
  },
}));

describe("AuthOrchestrator", () => {
  let mockTokenManager: any;
  let mockAuthClient: any;
  let mockAuthState: any;
  let mockUpdateAuthState: any;
  let mockCallbacks: any;

  beforeEach(() => {
    mockTokenManager = {
      getAccessToken: vi.fn(() => "access-token"),
      getRefreshToken: vi.fn(() => "refresh-token"),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      validateToken: vi.fn(() => ({ error: null })),
    };

    mockAuthClient = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshTokens: vi.fn(),
      changePassword: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    mockAuthState = vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }));

    mockUpdateAuthState = vi.fn();
    mockCallbacks = {
      onLoginSuccess: vi.fn(),
      onLoginError: vi.fn(),
      onLogout: vi.fn(),
    };

    (TokenManager.getInstance as any).mockReturnValue(mockTokenManager);
    (createAuthClient as any).mockReturnValue(mockAuthClient);
  });

  describe("createAuthOrchestrator", () => {
    it("should create auth orchestrator with default config", () => {
      const orchestrator = createAuthOrchestrator(
        DEFAULT_AUTH_CONFIG,
        mockCallbacks,
        mockAuthState,
        mockUpdateAuthState
      );

      expect(orchestrator).toBeDefined();
      expect(orchestrator.authState).toBeDefined();
      expect(orchestrator.authClient).toBeDefined();
      expect(orchestrator.tokenManager).toBeDefined();
      expect(orchestrator.initialize).toBeDefined();
    });

    it("should create auth orchestrator with custom config", () => {
      const customConfig = {
        ...DEFAULT_AUTH_CONFIG,
        apiBaseUrl: "https://custom-api.com",
        loginEndpoint: "/custom/login",
      };

      const orchestrator = createAuthOrchestrator(
        customConfig,
        mockCallbacks,
        mockAuthState,
        mockUpdateAuthState
      );

      expect(orchestrator).toBeDefined();
      expect(createAuthClient).toHaveBeenCalledWith(
        customConfig,
        mockTokenManager,
        mockAuthState,
        mockUpdateAuthState,
        mockCallbacks
      );
    });
  });

  describe("orchestrator functionality", () => {
    let orchestrator: any;

    beforeEach(() => {
      orchestrator = createAuthOrchestrator(
        DEFAULT_AUTH_CONFIG,
        mockCallbacks,
        mockAuthState,
        mockUpdateAuthState
      );
    });

    it("should return auth state function", () => {
      expect(orchestrator.authState).toBe(mockAuthState);
    });

    it("should return auth client", () => {
      expect(orchestrator.authClient).toBe(mockAuthClient);
    });

    it("should return token manager", () => {
      expect(orchestrator.tokenManager).toBe(mockTokenManager);
    });

    it("should initialize authentication state with valid token", async () => {
      const mockUser = { id: "1", username: "test" };
      mockTokenManager.getAccessToken.mockReturnValue("valid-token");
      mockTokenManager.validateToken.mockReturnValue({ error: null });
      mockAuthClient.getCurrentUser.mockResolvedValue(mockUser);

      await orchestrator.initialize();

      expect(mockTokenManager.getAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.validateToken).toHaveBeenCalledWith("valid-token");
      expect(mockAuthClient.getCurrentUser).toHaveBeenCalled();
      expect(mockUpdateAuthState).toHaveBeenCalledWith({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it("should handle initialization when no valid token", async () => {
      mockTokenManager.getAccessToken.mockReturnValue(null);

      await orchestrator.initialize();

      expect(mockTokenManager.getAccessToken).toHaveBeenCalled();
      expect(mockUpdateAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it("should handle initialization when token is invalid", async () => {
      mockTokenManager.getAccessToken.mockReturnValue("invalid-token");
      mockTokenManager.validateToken.mockReturnValue({ error: "Token expired" });

      await orchestrator.initialize();

      expect(mockTokenManager.getAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.validateToken).toHaveBeenCalledWith("invalid-token");
      expect(mockUpdateAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it("should handle initialization when no user is found", async () => {
      mockTokenManager.getAccessToken.mockReturnValue("valid-token");
      mockTokenManager.validateToken.mockReturnValue({ error: null });
      mockAuthClient.getCurrentUser.mockResolvedValue(null);

      await orchestrator.initialize();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(mockUpdateAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Initialization failed");
      mockTokenManager.getAccessToken.mockReturnValue("valid-token");
      mockTokenManager.validateToken.mockReturnValue({ error: null });
      mockAuthClient.getCurrentUser.mockRejectedValue(error);

      await orchestrator.initialize();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(mockUpdateAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });
});
