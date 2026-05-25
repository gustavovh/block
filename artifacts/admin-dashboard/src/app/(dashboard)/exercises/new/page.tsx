"use client";

import { useState } from "react";
import { ArrowLeft, Dumbbell, Type, AlignLeft, Video, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/hooks/useApi";

export default function NewExercisePage() {
  const router = useRouter();
  const api = useAdminApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    muscle_group: "",
    description: "",
    video_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      // Note: We'll need to add createExercise to the SDK if not present, 
      // but for now let's assume we can at least navigate here.
      // const response = await api.createExercise(formData);
      // if (response.success) router.push("/exercises");
      
      // Mock success for now until SDK is fully ready
      setTimeout(() => router.push("/exercises"), 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/exercises" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">New Exercise</h1>
          <p className="text-slate-400">Add a new exercise to the global library</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Exercise Name</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Ex: Bench Press"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Muscle Group</label>
            <div className="relative">
              <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.muscle_group}
                onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Ex: Chest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                placeholder="Describe how to perform the exercise..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Video URL (Optional)</label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link href="/exercises" className="flex-1 text-center py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-900/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Exercise
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
