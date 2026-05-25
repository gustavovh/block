"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ChevronRight, Package, Cpu, Box, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAdminApi } from "@/hooks/useApi";
import type { Build } from "@workspace/admin-sdk";

export default function BuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const api = useAdminApi();

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await api.getBuilds();
        setBuilds(response.data || []);
      } catch (error) {
        console.error("Failed to fetch builds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  const filteredBuilds = builds.filter((b) =>
    b.version.toLowerCase().includes(search.toLowerCase()) ||
    b.platform.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "building":
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-600/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-600/20 text-red-400 border-red-500/30";
      case "building":
        return "bg-primary/20 text-primary border-primary/30";
      case "cancelled":
        return "bg-slate-600/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-yellow-600/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Builds</h1>
          <p className="text-slate-400 mt-1">Manage application builds and artifacts</p>
        </div>
        <Link
          href="/builds/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Build
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by version or platform..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Builds List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading builds...</p>
          </div>
        ) : filteredBuilds.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No builds found matching your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Build
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBuilds.map((build) => (
                  <tr key={build.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 border border-slate-700">
                          <Box className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-primary transition-colors">v{build.version}</p>
                          <p className="text-xs text-slate-500 font-mono uppercase">{build.id.split("-")[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Cpu className="w-4 h-4 text-slate-500" />
                        <span className="capitalize">{build.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(build.status)}`}>
                        {getStatusIcon(build.status)}
                        {build.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(build.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/builds/${build.id}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                      >
                        Details
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
