"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/store/toast";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setRefreshToken } = useAuthStore();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      let ok = false;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          data = await response.json();
          ok = true;
        } else {
          try {
            const errData = await response.json();
            setError(errData.error || "Credenciales inválidas");
            toast.error(errData.error || "Login fallido");
          } catch {
            // response body not json
          }
        }
      } catch (err) {
        console.warn("API login failed, falling back to mock login:", err);
      }

      if (!ok) {
        // Mock fallback login for client-only / static-only mockup environment
        if (email === "admin@blockfit.local") {
          data = {
            data: {
              access_token: "mock-access-token",
              refresh_token: "mock-refresh-token"
            }
          };
          ok = true;
          setError("");
        } else {
          setError(error || "Credenciales inválidas (para demo use admin@blockfit.local)");
          toast.error("Login fallido");
          setLoading(false);
          return;
        }
      }

      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("refresh_token", data.data.refresh_token);

      setToken(data.data.access_token);
      setRefreshToken(data.data.refresh_token);

      toast.success("¡Login exitoso (Modo Demo)!");
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Ocurrió un error inesperado");
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="mb-8 flex flex-col items-center">
            <img src="/logo.png" alt="BLOCK" className="h-24 object-contain mb-4" />
            <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">Panel de Administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blockfit.local"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 10 characters"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 disabled:bg-slate-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-center">
              Demo credentials: admin@blockfit.local
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
