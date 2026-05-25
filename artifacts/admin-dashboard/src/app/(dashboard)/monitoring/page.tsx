"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, HeartPulse, Search, User, Terminal, Calendar, Info } from "lucide-react";
import { useAdminApi } from "@/hooks/useApi";

type MonitoringType = "audit" | "errors" | "health";

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<MonitoringType>("audit");
  const [logs, setLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const api = useAdminApi();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "audit") {
          const res = await api.getAuditLogs();
          setLogs(res.data || []);
        } else if (activeTab === "errors") {
          const res = await api.getErrorLogs();
          setLogs(res.data || []);
        } else {
          const res = await api.getDashboardStats();
          setHealth(res);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, api]);

  const filteredLogs = logs.filter((log) => {
    const content = JSON.stringify(log).toLowerCase();
    return content.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Monitoring</h1>
          <p className="text-slate-400 mt-1">Audit trails, system errors and server health</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        <TabButton 
          active={activeTab === "audit"} 
          onClick={() => setActiveTab("audit")}
          icon={<Activity className="w-4 h-4" />}
          label="Audit Logs"
        />
        <TabButton 
          active={activeTab === "errors"} 
          onClick={() => setActiveTab("errors")}
          icon={<ShieldAlert className="w-4 h-4" />}
          label="Error Logs"
        />
        <TabButton 
          active={activeTab === "health"} 
          onClick={() => setActiveTab("health")}
          icon={<HeartPulse className="w-4 h-4" />}
          label="System Health"
        />
      </div>

      {activeTab !== "health" && (
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={`Search ${activeTab} logs...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm min-h-[400px]">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading {activeTab} data...</p>
          </div>
        ) : activeTab === "health" ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthCard 
              title="Database" 
              status={health?.database === "ok" ? "healthy" : "error"} 
              details="PostgreSQL 16"
            />
            <HealthCard 
              title="Cache" 
              status={health?.redis === "ok" ? "healthy" : "error"} 
              details="Redis 7-alpine"
            />
            <HealthCard 
              title="Server" 
              status="healthy" 
              details={`Uptime: ${Math.floor(process.uptime() / 60)}m`}
            />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-20 text-center">
            <Terminal className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No {activeTab} logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log, i) => (
              <div key={log.id || i} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {activeTab === "audit" ? (
                        <>
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/30">
                            {log.action}
                          </span>
                          <span className="text-sm font-semibold text-white">{log.resource_type}</span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider border border-red-500/30">
                            {log.severity || "error"}
                          </span>
                          <span className="text-sm font-semibold text-white">{log.message}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                      {log.user_name && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {log.user_name}
                        </div>
                      )}
                      {log.source && (
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          {log.source}
                        </div>
                      )}
                    </div>

                    {log.metadata && (
                      <div className="mt-2 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  
                  <button className="p-2 text-slate-600 hover:text-white transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        active 
          ? "bg-slate-800 text-white shadow-lg" 
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HealthCard({ title, status, details }: { title: string; status: "healthy" | "warning" | "error"; details: string }) {
  const colors = {
    healthy: "text-green-400 border-green-500/20 bg-green-500/5",
    warning: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    error: "text-red-400 border-red-500/20 bg-red-500/5",
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[status]} flex flex-col justify-between gap-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <div className={`w-3 h-3 rounded-full ${status === 'healthy' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`} />
      </div>
      <div>
        <p className="text-sm opacity-70 font-medium">{details}</p>
        <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">{status}</p>
      </div>
    </div>
  );
}
