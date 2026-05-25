"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";

/**
 * Componente protector de rutas
 * Verifica si el usuario está autenticado
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, hydrateFromStorage } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrateFromStorage();

    // Si no hay token y no estamos en login, redirigir
    if (!token && !localStorage.getItem("access_token") && !pathname.includes("/auth")) {
      router.push("/auth/login");
    }
  }, [token, pathname, router, hydrateFromStorage]);

  if (!token && !localStorage.getItem("access_token")) {
    return null;
  }

  return <>{children}</>;
}
