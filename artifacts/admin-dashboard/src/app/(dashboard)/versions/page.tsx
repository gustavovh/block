"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Release {
  id: string;
  version: string;
  status: "draft" | "published" | "deprecated" | "blocked";
  released_at: string | null;
  mandatory: boolean;
}

export default function VersionsPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("/api/admin/releases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReleases(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch releases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const filteredReleases = releases.filter((r) =>
    r.version.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-600/20 text-green-400";
      case "draft":
        return "bg-yellow-600/20 text-yellow-400";
      case "deprecated":
        return "bg-orange-600/20 text-orange-400";
      case "blocked":
        return "bg-red-600/20 text-red-400";
      default:
        return "bg-slate-600/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Versions</h1>
          <p className="text-slate-400 mt-1">Manage releases and updates</p>
        </div>
        <Link
          href="/versions/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Release
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search versions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Releases Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filteredReleases.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No releases found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Version
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Released
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{release.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                        {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {release.released_at
                        ? new Date(release.released_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {release.mandatory && (
                        <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded font-medium">
                          Mandatory
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/versions/${release.id}`}
                        className="inline-flex items-center gap-2 text-primary hover:text-blue-300 transition-colors"
                      >
                        View
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
