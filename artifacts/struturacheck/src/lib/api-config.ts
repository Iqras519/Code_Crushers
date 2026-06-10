/**
 * API Configuration
 * Handles initialization and configuration of the API client
 */

import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuth } from "./auth";
import { mockApi } from "./mock-api";

export function configureApiClient() {
  const useMockApi = 
    import.meta.env.VITE_USE_MOCK_API === "true" || 
    window.location.hostname.endsWith(".github.io");

  if (useMockApi) {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" 
        ? input 
        : input instanceof URL 
          ? input.toString() 
          : input.url;

      const url = new URL(urlStr, window.location.origin);
      const path = url.pathname;
      const method = (init?.method || "GET").toUpperCase();

      try {
        if (path === "/api/auth/login" && method === "POST") {
          const body = JSON.parse(init?.body as string);
          const res = await mockApi.login(body.email, body.password);
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/auth/register" && method === "POST") {
          const body = JSON.parse(init?.body as string);
          const res = await mockApi.register(body.name, body.email, body.password, body.role);
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/stats/summary" && method === "GET") {
          const res = await mockApi.getStatsSummary();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/stats/history" && method === "GET") {
          const res = await mockApi.getStatsHistory();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/stats/distribution" && method === "GET") {
          const res = await mockApi.getDefectDistribution();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/analyses" && method === "GET") {
          const res = await mockApi.listAnalyses();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/analyses" && method === "POST") {
          const body = JSON.parse(init?.body as string);
          const res = {
            id: Math.floor(Math.random() * 1000),
            name: body.name || "New Facade Analysis",
            createdAt: new Date().toISOString(),
            severity: "low",
            status: "completed",
            defectsFound: 2,
          };
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path.startsWith("/api/analyses/") && method === "GET") {
          const id = Number(path.split("/").pop());
          const res = await mockApi.getAnalysis(id);
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path.startsWith("/api/analyses/") && method === "DELETE") {
          return new Response(null, { status: 204 });
        }

        if (path === "/api/recommendations" && method === "GET") {
          const res = await mockApi.getRecommendations();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/healthz" && method === "GET") {
          const res = await mockApi.getHealth();
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (path === "/api/images/upload" && method === "POST") {
          const res = { id: Math.floor(Math.random() * 1000), url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop" };
          return new Response(JSON.stringify(res), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || "Mock error" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return originalFetch(input, init);
    };
  } else {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      setBaseUrl(apiUrl);
    }
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
