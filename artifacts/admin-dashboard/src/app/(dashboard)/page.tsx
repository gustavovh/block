"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, MessageCircle, RefreshCw, Users } from "lucide-react";
import { useAdminApi } from "@/hooks/useApi";

type CoachDashboard = {
  totals: {
    roster: number;
    active_today: number;
    inactive_3d: number;
    adherence_drop: number;
    attention_required: number;
  };
  attention_required: Array<{ id: string; name: string; reason: string }>;
  recent_sessions: Array<{ id: string; athlete_id: string; athlete_name: string; date: string; time?: string | null }>;
  recent_feedbacks: Array<{ id: string; athlete_id: string; athlete_name: string; type: string; content: string; date: string }>;
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-primary/20 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const api = useAdminApi();
  const [dashboard, setDashboard] = useState<CoachDashboard | null>(null);
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coachResponse, athletesResponse] = await Promise.all([
          api.getCoachDashboard(),
          api.getAthletes(),
        ]);

        setDashboard((coachResponse as any).data ?? null);
        setAthletes(((athletesResponse as any).data ?? []).map((athlete: any) => ({
          id: athlete.id,
          name: athlete.name,
        })));
      } catch (error) {
        console.error("Failed to fetch coach dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const sendFeedback = async () => {
    if (!selectedAthleteId || !feedbackText.trim()) {
      setFeedbackError("Selecciona atleta y escribe feedback.");
      return;
    }

    try {
      setSendingFeedback(true);
      setFeedbackError(null);
      await api.createAthleteObservation(selectedAthleteId, {
        type: "Progreso",
        content: feedbackText.trim(),
      });
      setFeedbackText("");
      const coachResponse = await api.getCoachDashboard();
      setDashboard((coachResponse as any).data ?? null);
    } catch (error: any) {
      setFeedbackError(error?.message || "No se pudo enviar feedback.");
    } finally {
      setSendingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard del Entrenador</h1>
        <p className="text-slate-400 mt-1">Operacion diaria para adherencia y acompanamiento atleta.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={Users}
          label="Atletas"
          value={dashboard?.totals.roster || 0}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Activos Hoy"
          value={dashboard?.totals.active_today || 0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Sin Entrenar 3+ Dias"
          value={dashboard?.totals.inactive_3d || 0}
        />
        <StatCard
          icon={RefreshCw}
          label="Caída de Adherencia"
          value={dashboard?.totals.adherence_drop || 0}
        />
        <StatCard
          icon={MessageCircle}
          label="Requieren Atención"
          value={dashboard?.totals.attention_required || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Atletas Que Requieren Atencion</h2>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {(dashboard?.attention_required || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-amber-300">{item.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/athletes/${item.id}`} className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold">
                    Abrir Perfil
                  </Link>
                </div>
              </div>
            ))}
            {!dashboard?.attention_required?.length && (
              <p className="text-sm text-slate-400">Sin alertas prioritarias por ahora.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Feedback Rapido</h2>
          <div className="space-y-3">
            <select
              value={selectedAthleteId}
              onChange={(event) => setSelectedAthleteId(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
            >
              <option value="">Seleccionar atleta</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            <textarea
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              placeholder="Ej: Excelente sesion hoy. Mañana subimos carga en sentadilla."
              className="w-full h-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
            />
            {feedbackError ? <p className="text-xs text-red-400">{feedbackError}</p> : null}
            <button
              onClick={sendFeedback}
              disabled={sendingFeedback}
              className="w-full rounded-xl bg-primary hover:bg-blue-700 disabled:bg-blue-900/40 text-white py-2 text-sm font-semibold"
            >
              {sendingFeedback ? "Enviando..." : "Enviar Observacion"}
            </button>
            <p className="text-xs text-slate-400">
              Acciones rápidas: enviar observación, registrar sesión y activar seguimiento.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ultimas Sesiones</h2>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {(dashboard?.recent_sessions || []).map((session) => (
              <div key={session.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm text-white font-semibold">{session.athlete_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(session.date).toLocaleDateString("es")} {session.time ? `· ${session.time}` : ""}
                  </p>
                </div>
                <Link href={`/athletes/${session.athlete_id}`} className="text-xs px-3 py-1 rounded-lg bg-slate-700 text-white font-semibold">
                  Ajustar Rutina
                </Link>
              </div>
            ))}
            {!dashboard?.recent_sessions?.length && (
              <p className="text-sm text-slate-400">Aun no hay sesiones registradas.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ultimos Feedbacks Enviados</h2>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {(dashboard?.recent_feedbacks || []).map((feedback) => (
              <div key={feedback.id} className="bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-white font-semibold">{feedback.athlete_name}</p>
                  <span className="text-[10px] uppercase tracking-wider text-blue-300">{feedback.type}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{feedback.content}</p>
                <p className="text-[11px] text-slate-500 mt-1">{new Date(feedback.date).toLocaleString("es")}</p>
              </div>
            ))}
            {!dashboard?.recent_feedbacks?.length && (
              <p className="text-sm text-slate-400">No enviaste feedbacks recientes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
