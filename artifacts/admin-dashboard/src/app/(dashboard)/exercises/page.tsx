"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Dumbbell, Play, Edit2, Trash2, Video, FileText } from "lucide-react";
import { useAdminApi } from "@/hooks/useApi";
import type { Exercise } from "@workspace/admin-sdk";
import { Dialog } from "@/components/ui/dialog";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const api = useAdminApi();

  const getExerciseImage = (name: string, customUrl?: string | null) => {
    if (customUrl && customUrl.trim().startsWith("http")) {
      return customUrl;
    }
    
    const n = name.toLowerCase();
    
    // Chest / Pecho
    if (
      n.includes("pecho") || 
      n.includes("banca") || 
      n.includes("aperturas") || 
      n.includes("cruces") || 
      n.includes("flexiones")
    ) {
      return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop";
    }
    
    // Legs / Piernas
    if (
      n.includes("sentadilla") || 
      n.includes("pierna") || 
      n.includes("prensa") || 
      n.includes("zancada") || 
      n.includes("estocada") || 
      n.includes("talones") ||
      n.includes("femoral")
    ) {
      return "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop";
    }
    
    // Back / Espalda
    if (
      n.includes("muerto") || 
      n.includes("espalda") || 
      n.includes("remo") || 
      n.includes("dominadas") || 
      n.includes("jalón") || 
      n.includes("lat pull")
    ) {
      return "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400&auto=format&fit=crop";
    }
    
    // Shoulders / Hombros
    if (
      n.includes("hombro") || 
      n.includes("militar") || 
      n.includes("laterales") || 
      n.includes("pájaros") ||
      n.includes("vuelos")
    ) {
      return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop";
    }
    
    // Arms / Brazos
    if (
      n.includes("brazo") || 
      n.includes("bíceps") || 
      n.includes("biceps") || 
      n.includes("tríceps") || 
      n.includes("triceps") || 
      n.includes("fondos") ||
      n.includes("curl")
    ) {
      return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop";
    }
    
    // Core / Abdomen
    if (
      n.includes("plancha") || 
      n.includes("crunch") || 
      n.includes("abdomen") || 
      n.includes("abdominal") || 
      n.includes("core")
    ) {
      return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop";
    }

    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop";
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formMuscleGroup, setFormMuscleGroup] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFormError(null);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.uploadFile(file.name, base64Data);
          if (res.success && res.url) {
            setFormVideoUrl(res.url);
          } else {
            setFormError("No se pudo cargar el archivo");
          }
        } catch (err: any) {
          setFormError(err.message || "Error al subir el archivo al servidor");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setFormError("Error al leer el archivo local");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFormError("Error al procesar el archivo");
      setUploading(false);
    }
  };


  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await api.getExercises();
        setExercises(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch exercises:", err);
        setError(err.message || "Failed to load exercise library");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const resetForm = (ex?: Exercise) => {
    setFormName(ex ? ex.name : "");
    setFormMuscleGroup(ex ? ex.muscle_group || "" : "Pecho");
    setFormDescription(ex ? ex.description || "" : "");
    setFormVideoUrl(ex ? ex.video_url || "" : "");
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setSelectedExercise(ex);
    resetForm(ex);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (ex: Exercise) => {
    setSelectedExercise(ex);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      
      const response = await api.createExercise({
        name: formName,
        muscle_group: formMuscleGroup || null,
        description: formDescription || null,
        video_url: formVideoUrl || null,
      });
      
      if (response.success && response.data) {
        setExercises((prev) => [response.data, ...prev]);
        setIsCreateOpen(false);
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to create exercise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    try {
      setSubmitting(true);
      setFormError(null);
      
      const response = await api.updateExercise(selectedExercise.id, {
        name: formName,
        muscle_group: formMuscleGroup || null,
        description: formDescription || null,
        video_url: formVideoUrl || null,
      });
      
      if (response.success && response.data) {
        setExercises((prev) =>
          prev.map((ex) => (ex.id === selectedExercise.id ? response.data : ex))
        );
        setIsEditOpen(false);
        setSelectedExercise(null);
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to update exercise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedExercise) return;
    try {
      setSubmitting(true);
      const response = await api.deleteExercise(selectedExercise.id);
      if (response.success) {
        setExercises((prev) => prev.filter((ex) => ex.id !== selectedExercise.id));
        setIsDeleteOpen(false);
        setSelectedExercise(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete exercise");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.muscle_group?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Exercise Library</h1>
          <p className="text-slate-400 mt-1">Manage global exercise definitions and media</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-lg shadow-orange-950/20"
        >
          <Plus className="w-5 h-5" />
          New Exercise
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name or muscle group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl h-64 animate-pulse" />
          ))
        ) : filteredExercises.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <Dumbbell className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-400">No exercises found in the library</p>
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const imageUrl = getExerciseImage(ex.name, ex.video_url);
            return (
              <div key={ex.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col">
                {/* Media Preview Placeholder */}
                <div className="h-40 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={ex.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 z-0" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop";
                    }} 
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors z-10" />
                  <Dumbbell className="w-12 h-12 text-slate-700/30 group-hover:scale-110 transition-transform z-20" />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-slate-700">
                      {ex.muscle_group || "General"}
                    </span>
                  </div>
                </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{ex.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 italic">
                  {ex.description || "No description provided for this exercise."}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(ex)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(ex)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="text-xs font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Crear Nuevo Ejercicio"
        description="Agrega una nueva definición de ejercicio a la biblioteca de BLOCK"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-sm font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Ejercicio</label>
            <div className="relative">
              <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                placeholder="Ej. Sentadilla con Barra"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grupo Muscular</label>
            <select
              value={formMuscleGroup}
              onChange={(e) => setFormMuscleGroup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            >
              <option value="Pecho">Pecho</option>
              <option value="Espalda">Espalda</option>
              <option value="Piernas">Piernas</option>
              <option value="Hombros">Hombros</option>
              <option value="Brazos">Brazos</option>
              <option value="Core">Core</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descripción / Instrucciones</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm h-24 resize-none"
                placeholder="Describe cómo se ejecuta el ejercicio..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Imagen / GIF del Ejercicio (URL o Archivo)</label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                  placeholder="Ej. https://images.unsplash.com/... o subir archivo"
                />
              </div>
              <label className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl px-4 py-3 font-semibold text-sm cursor-pointer transition-colors relative flex items-center justify-center min-w-[120px]">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Subir GIF/Img</span>
                )}
                <input
                  type="file"
                  accept="image/*,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
            {formVideoUrl && formVideoUrl.startsWith("http") && (
              <div className="mt-3 border border-slate-800 rounded-2xl overflow-hidden h-28 w-full relative bg-slate-950 flex items-center justify-center">
                <img src={formVideoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>


          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-primary hover:bg-orange-600 disabled:bg-slate-800 text-white rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Editar Ejercicio"
        description="Actualiza la definición global del ejercicio en BLOCK"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-sm font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Ejercicio</label>
            <div className="relative">
              <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                placeholder="Ej. Sentadilla con Barra"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grupo Muscular</label>
            <select
              value={formMuscleGroup}
              onChange={(e) => setFormMuscleGroup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            >
              <option value="Pecho">Pecho</option>
              <option value="Espalda">Espalda</option>
              <option value="Piernas">Piernas</option>
              <option value="Hombros">Hombros</option>
              <option value="Brazos">Brazos</option>
              <option value="Core">Core</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descripción / Instrucciones</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm h-24 resize-none"
                placeholder="Describe cómo se ejecuta el ejercicio..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Imagen / GIF del Ejercicio (URL o Archivo)</label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                  placeholder="Ej. https://images.unsplash.com/... o subir archivo"
                />
              </div>
              <label className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl px-4 py-3 font-semibold text-sm cursor-pointer transition-colors relative flex items-center justify-center min-w-[120px]">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Subir GIF/Img</span>
                )}
                <input
                  type="file"
                  accept="image/*,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
            {formVideoUrl && formVideoUrl.startsWith("http") && (
              <div className="mt-3 border border-slate-800 rounded-2xl overflow-hidden h-28 w-full relative bg-slate-950 flex items-center justify-center">
                <img src={formVideoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>


          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-primary hover:bg-orange-600 disabled:bg-slate-800 text-white rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Eliminar Ejercicio"
        description="Esta acción es irreversible y eliminará el ejercicio de la biblioteca"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            ¿Estás completamente seguro de que deseas eliminar el ejercicio{" "}
            <strong className="text-white">"{selectedExercise?.name}"</strong>?
            Los programas de entrenamiento que lo utilicen perderán esta definición.
          </p>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 text-white rounded-xl font-semibold transition-all text-sm flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
