/**
 * API Configuration
 * Handles initialization and configuration of the API client
 */

import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuth } from "./auth";

export function configureApiClient() {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Set base URL if provided
  if (apiUrl) {
    setBaseUrl(apiUrl);
  }

  // Set auth token getter
  setAuthTokenGetter(() => {
    // This will be called by the API client before each request
    // Get token from localStorage (which is managed by AuthProvider)
    return localStorage.getItem("visionbuild_token");
  });
}

/**
 * Hook to get current API configuration
 */
export function useApiConfig() {
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

  return {
    apiUrl,
    useMockApi,
    isAuthenticated: !!token,
  };
}

/**
 * Get API base URL with fallback
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || "/api";
}

/**
 * Check if API is available
 */
export async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/healthz`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
