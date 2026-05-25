/**
 * API Routes - Proxy entre frontend y backend
 * Esto permite que Next.js maneje las peticiones al servidor admin
 */

import { getBackendApiUrl } from "@/lib/server-env";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const backendUrl = getBackendApiUrl();

  try {
    const response = await fetch(
      `${backendUrl}/api/admin/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
