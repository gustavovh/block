import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { AdminApiClient } from "@workspace/admin-sdk";

/**
 * Hook para usar el cliente API
 * Maneja automáticamente tokens y refresh
 */
export function useAdminApi() {
  const { token, setToken } = useAuthStore();
  const clientRef = useRef<AdminApiClient | null>(null);

  // Robust token resolution
  const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  if (!clientRef.current) {
    clientRef.current = new AdminApiClient({
      baseURL:
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3001",
      token: currentToken || "",
      onTokenRefresh: async (newToken) => {
        setToken(newToken);
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", newToken);
        }
      },
    });
  }

  useEffect(() => {
    clientRef.current?.setToken(currentToken || "");
  }, [currentToken]);

  return clientRef.current;
}

/**
 * Hook para fetching con error handling
 */
export function useFetch<T>(url: string) {
  const { token } = useAuthStore();

  const fetch = useCallback(
    async (options?: RequestInit): Promise<T | null> => {
      try {
        const response = await window.fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options?.headers,
          },
        });

        if (response.status === 401) {
          // Token expirado
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error("Fetch error:", error);
        return null;
      }
    },
    [token]
  );

  return fetch;
}
