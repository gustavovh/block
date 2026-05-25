"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ChevronRight, User as UserIcon, Activity, Calendar } from "lucide-react";
import Link from "next/link";
import { useAdminApi } from "@/hooks/useApi";
import type { Athlete } from "@workspace/admin-sdk";

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const api = useAdminApi();

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        const response = await api.getAthletes();
        setAthletes(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch athletes:", err);
        setError(err.message || "Failed to load athletes");
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  const filteredAthletes = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activa":
        return "bg-green-600/20 text-green-400 border-green-500/50";
      case "por_vencer":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-500/50";
      case "vencida":
        return "bg-red-600/20 text-red-400 border-red-500/50";
      default:
        return "bg-slate-600/20 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Atletas</h1>
          <p className="text-slate-400 mt-1">Administra miembros del gimnasio, rutinas y progresos</p>
        </div>
        <Link
          href="/athletes/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl transition-all font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Añadir Atleta
        </Link>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Buscar atletas por nombre, correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-sm"
        />
      </div>

      {/* Athletes Grid/List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Obteniendo registros del gimnasio...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <Activity className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-400 font-bold text-lg mb-2">Error de Sincronización</p>
            <p className="text-slate-400 max-w-xs mx-auto mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl transition-colors font-medium border border-slate-700"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
              <UserIcon className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium text-lg">No se encontraron atletas</p>
            <p className="text-slate-500 text-sm mt-1">Intenta con una búsqueda diferente o añade un nuevo atleta</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 border-b border-slate-700/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Atleta</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado del Plan</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cuerpo Actual</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Membresía</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredAthletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-primary/5 transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 border border-primary/30 group-hover:scale-110 transition-transform">
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors">{athlete.name}</p>
                          <p className="text-sm text-slate-500">{athlete.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(athlete.plan_status)}`}>
                        {athlete.plan_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm text-slate-300 font-semibold">{athlete.weight_kg || "--"} kg</span>
                        </div>
                        <div className="text-xs text-slate-500 pl-5">
                          {athlete.body_fat_pct ? `${athlete.body_fat_pct}% GC` : "Sin datos de GC"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {athlete.plan_expiry ? new Date(athlete.plan_expiry).toLocaleDateString() : "Sin vencimiento"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/athletes/${athlete.id}`}
                        className="inline-flex items-center gap-2 bg-slate-800 group-hover:bg-primary text-slate-300 group-hover:text-primary-foreground px-4 py-2 rounded-xl transition-all text-sm font-bold border border-slate-700 group-hover:border-primary shadow-sm"
                      >
                        Administrar
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
