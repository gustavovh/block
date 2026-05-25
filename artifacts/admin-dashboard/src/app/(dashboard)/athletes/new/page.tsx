"use client";

import { useState } from "react";
import { ArrowLeft, User, Mail, Lock, Shield, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/hooks/useApi";

export default function NewAthletePage() {
  const router = useRouter();
  const api = useAdminApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.createAthlete(formData);
      router.push("/athletes");
    } catch (err: any) {
      console.error("Failed to create athlete:", err);
      setError(err.message || "Failed to create athlete. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/athletes" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">New Athlete</h1>
          <p className="text-slate-400">Register a new member to the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link href="/athletes" className="flex-1 text-center py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-blue-900/50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Register Athlete
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
