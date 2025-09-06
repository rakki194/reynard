import { createSignal, onCleanup, onMount } from 'solid-js';

const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

interface DecodedToken {
  exp: number; // Expiration time in Unix timestamp (seconds)
}

export interface AuthFetchOptions {
  logout?: () => void;
  notify?: (message: string, type?: 'error' | 'success' | 'info' | 'warning') => void;
  navigate?: (path: string) => void;
  refreshTokenUrl?: string;
  tokenStorageKey?: string;
  refreshTokenStorageKey?: string;
}

let isUnauthorizedNotificationShown = false;
let isRefreshingToken = false;
let refreshPromise: Promise<any> | null = null;

/**
 * Creates an authenticated fetch function with automatic token refresh
 * 
 * @param options Configuration options for auth behavior
 * @returns Object containing authFetch function and token refresh utilities
 */
export function createAuthFetch(options: AuthFetchOptions = {}) {
  const {
    logout,
    notify,
    navigate,
    refreshTokenUrl = '/api/refresh-token',
    tokenStorageKey = 'jwt_token',
    refreshTokenStorageKey = 'refresh_token'
  } = options;

  // Simple JWT decode function (basic implementation)
  const decodeToken = (token: string): DecodedToken | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return {
        exp: payload.exp
      };
    } catch {
      return null;
    }
  };

  // Function to check token expiry and refresh if needed
  const checkTokenAndRefresh = async () => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token) return;

    try {
      const decoded = decodeToken(token);
      if (!decoded) {
        logout?.();
        notify?.('Invalid token. Please log in again.', 'error');
        navigate?.('/login');
        return;
      }

      const currentTime = Date.now() / 1000;
      
      // Refresh if token expires within the next 10 minutes (600 seconds)
      if (decoded.exp - currentTime < 600) {
        if (isRefreshingToken && refreshPromise) {
          console.log('Token refresh already in progress, waiting...');
          await refreshPromise;
          return;
        }

        console.log('Attempting to proactively refresh token...');
        isRefreshingToken = true;

        refreshPromise = (async () => {
          const refreshToken = localStorage.getItem(refreshTokenStorageKey);
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(refreshTokenUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${refreshToken}`,
                },
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const newToken = refreshData.access_token;
                localStorage.setItem(tokenStorageKey, newToken);
                console.log('Token proactively refreshed successfully.');
                isUnauthorizedNotificationShown = false;
              } else {
                console.warn('Proactive token refresh failed, logging out.');
                logout?.();
                if (!isUnauthorizedNotificationShown) {
                  notify?.('Session expired. Please log in again.', 'error');
                  isUnauthorizedNotificationShown = true;
                }
                navigate?.('/login');
              }
            } catch (refreshError) {
              console.error('Proactive token refresh error:', refreshError);
              logout?.();
              if (!isUnauthorizedNotificationShown) {
                notify?.('Session expired. Please log in again.', 'error');
                isUnauthorizedNotificationShown = true;
              }
              navigate?.('/login');
            }
          } else {
            console.warn('No refresh token available for proactive refresh, logging out.');
            logout?.();
            if (!isUnauthorizedNotificationShown) {
              notify?.('Session expired. Please log in again.', 'error');
              isUnauthorizedNotificationShown = true;
            }
            navigate?.('/login');
          }
        })();

        try {
          await refreshPromise;
        } finally {
          isRefreshingToken = false;
          refreshPromise = null;
        }
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
      logout?.();
      if (!isUnauthorizedNotificationShown) {
        notify?.('Invalid token. Please log in again.', 'error');
        isUnauthorizedNotificationShown = true;
      }
      navigate?.('/login');
    }
  };

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let token = localStorage.getItem(tokenStorageKey);
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const options: RequestInit = {
      ...init,
      headers,
    };

    try {
      const response = await fetch(input, options);

      if (response.status === 401) {
        const refreshToken = localStorage.getItem(refreshTokenStorageKey);

        if (refreshToken) {
          if (isRefreshingToken && refreshPromise) {
            console.log('Token refresh already in progress, waiting...');
            await refreshPromise;

            const newToken = localStorage.getItem(tokenStorageKey);
            if (newToken) {
              const newHeaders = new Headers(init?.headers);
              newHeaders.set('Authorization', `Bearer ${newToken}`);

              const retryOptions: RequestInit = {
                ...init,
                headers: newHeaders,
              };

              const retryResponse = await fetch(input, retryOptions);

              if (retryResponse.status === 401 || retryResponse.status === 403) {
                logout?.();
                if (!isUnauthorizedNotificationShown) {
                  notify?.('Session expired. Please log in again.', 'error');
                  isUnauthorizedNotificationShown = true;
                }
                navigate?.('/login');
                throw new Error('Authentication failed after refresh');
              }

              return retryResponse;
            }
          }

          try {
            isRefreshingToken = true;

            refreshPromise = (async () => {
              const refreshResponse = await fetch(refreshTokenUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${refreshToken}`,
                },
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const newToken = refreshData.access_token;

                localStorage.setItem(tokenStorageKey, newToken);
                isUnauthorizedNotificationShown = false;

                const newHeaders = new Headers(init?.headers);
                newHeaders.set('Authorization', `Bearer ${newToken}`);

                const retryOptions: RequestInit = {
                  ...init,
                  headers: newHeaders,
                };

                const retryResponse = await fetch(input, retryOptions);

                if (retryResponse.status === 401 || retryResponse.status === 403) {
                  logout?.();
                  if (!isUnauthorizedNotificationShown) {
                    notify?.('Session expired. Please log in again.', 'error');
                    isUnauthorizedNotificationShown = true;
                  }
                  navigate?.('/login');
                  throw new Error('Authentication failed after refresh');
                }

                return retryResponse;
              } else {
                throw new Error('Token refresh failed');
              }
            })();

            const result = await refreshPromise;
            return result;
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            logout?.();
            if (!isUnauthorizedNotificationShown) {
              notify?.('Session expired. Please log in again.', 'error');
              isUnauthorizedNotificationShown = true;
            }
            navigate?.('/login');
            throw new Error('Authentication error');
          } finally {
            isRefreshingToken = false;
            refreshPromise = null;
          }
        } else {
          logout?.();
          if (!isUnauthorizedNotificationShown) {
            notify?.('Session expired. Please log in again.', 'error');
            isUnauthorizedNotificationShown = true;
          }
          navigate?.('/login');
          throw new Error('Authentication error');
        }
      } else if (response.status === 403) {
        notify?.("Access forbidden. You don't have permission for this action.", 'error');
        throw new Error('Authorization error');
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error: any) {
      if (
        error.name !== 'AbortError' &&
        error.name !== 'DOMException' &&
        error.message !== 'The operation was aborted.'
      ) {
        console.error('Auth fetch error:', error);
      }
      throw error;
    }
  };

  return { authFetch, checkTokenAndRefresh };
}

/**
 * SolidJS composable for authenticated fetch with automatic token refresh
 * 
 * @param options Configuration options for auth behavior
 * @param isLoggedIn Signal indicating if user is logged in
 * @returns Authenticated fetch function
 */
export function useAuthFetch(
  options: AuthFetchOptions = {},
  isLoggedIn: () => boolean = () => Boolean(localStorage.getItem('jwt_token'))
) {
  let refreshTimer: number | undefined;

  const { authFetch, checkTokenAndRefresh } = createAuthFetch(options);

  onMount(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return;
    }

    if (isLoggedIn() && !refreshTimer) {
      refreshTimer = window.setInterval(checkTokenAndRefresh, TOKEN_REFRESH_INTERVAL_MS);
    }
  });

  onCleanup(() => {
    if (refreshTimer) {
      window.clearInterval(refreshTimer);
      refreshTimer = undefined;
    }
  });

  return authFetch;
}