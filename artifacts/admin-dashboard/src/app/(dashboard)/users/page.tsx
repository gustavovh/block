"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ChevronRight, User as UserIcon, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAdminApi } from "@/hooks/useApi";
import type { AdminUser } from "@workspace/admin-sdk";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const api = useAdminApi();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const response = await api.getUsers();
        setUsers(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "bg-purple-600/20 text-purple-400 border-purple-500/50";
      case "admin":
        return "bg-primary/20 text-primary border-primary/50";
      case "manager":
        return "bg-green-600/20 text-green-400 border-green-500/50";
      case "viewer":
        return "bg-slate-600/20 text-slate-400 border-slate-500/50";
      default:
        return "bg-slate-600/20 text-slate-400 border-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-slate-400 mt-1">Manage admin users and permissions</p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add User
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Users List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-primary hover:text-blue-300 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No users found matching your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-primary font-bold border border-slate-700">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getRoleColor(user.role)}`}>
                        <Shield className="w-3 h-3" />
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status || "active")}`} />
                        <span className="text-sm text-slate-300 capitalize">{user.status || "Active"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/users/${user.id}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                      >
                        Edit
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
