"use client";

import { useEffect, useState } from "react";
import { Settings, Flag, Globe, Plus, Save, RotateCcw, AlertCircle } from "lucide-react";
import { useAdminApi } from "@/hooks/useApi";

type ConfigType = "settings" | "feature-flags" | "remote-config";

export default function ConfigsPage() {
  const [activeTab, setActiveTab] = useState<ConfigType>("settings");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useAdminApi();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === "settings") response = await api.getSettings();
        else if (activeTab === "feature-flags") response = await api.getFeatureFlags();
        else response = await api.getRemoteConfigs();

        const payload = response && typeof response === "object" && "data" in response ? response.data : response;
        setData(Array.isArray(payload) ? payload : payload ? [payload] : []);
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, api]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuration</h1>
          <p className="text-slate-400 mt-1">Manage global app behavior and feature rollouts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        <TabButton 
          active={activeTab === "settings"} 
          onClick={() => setActiveTab("settings")}
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
        />
        <TabButton 
          active={activeTab === "feature-flags"} 
          onClick={() => setActiveTab("feature-flags")}
          icon={<Flag className="w-4 h-4" />}
          label="Feature Flags"
        />
        <TabButton 
          active={activeTab === "remote-config"} 
          onClick={() => setActiveTab("remote-config")}
          icon={<Globe className="w-4 h-4" />}
          label="Remote Config"
        />
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm min-h-[400px]">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading {activeTab.replace("-", " ")}...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No configuration found for {activeTab.replace("-", " ")}</p>
            <button className="mt-4 text-primary hover:text-blue-300 font-medium flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Create your first entry
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h2>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
            
            <div className="space-y-4">
              {data.map((item: any) => (
                <div key={item.key || item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary font-bold">{item.key}</span>
                        {item.enabled !== undefined && (
                          <span className={`w-2 h-2 rounded-full ${item.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{item.description || "No description provided"}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-4">
                    {activeTab === "settings" && (
                      <div className="flex-1">
                        <input 
                          type="text" 
                          defaultValue={JSON.stringify(item.value)} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-primary"
                        />
                      </div>
                    )}
                    
                    {activeTab === "feature-flags" && (
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                            style={{ width: `${item.rollout_percentage}%` }} 
                          />
                        </div>
                        <span className="text-sm font-bold text-white w-12 text-right">{item.rollout_percentage}%</span>
                      </div>
                    )}

                    {activeTab === "remote-config" && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Versions:</span>
                        <code className="text-xs bg-slate-900 px-2 py-1 rounded text-blue-300 border border-slate-700">
                          {item.version_constraints || "All"}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
