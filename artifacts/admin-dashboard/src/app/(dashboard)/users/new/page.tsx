"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Mail, Lock, Shield } from "lucide-react";
import { useAdminApi } from "@/hooks/useApi";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
  { value: "super_admin", label: "Super Admin" },
];

export default function NewAdminUserPage() {
  const router = useRouter();
  const api = useAdminApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.createUser(formData as any);
      router.push("/users");
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/users" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">New Admin User</h1>
          <p className="text-slate-400">Create an admin account with role permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

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
              placeholder="Administrator Name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
              placeholder="admin@example.com"
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
              minLength={10}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
              placeholder="At least 10 characters"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Role</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link href="/users" className="flex-1 text-center py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-blue-900/50 text-white py-4 rounded-2xl font-bold transition-all"
          >
            {loading ? "Creating..." : <><Save className="w-5 h-5" />Create User</>}
          </button>
        </div>
      </form>
    </div>
  );
}
