"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EstadoIncidencia = "ABIERTA" | "EN_PROGRESO" | "RESUELTA" | "CERRADA";
type TipoIncidencia = "HARDWARE" | "SOFTWARE" | "RED" | "ACCESO" | "OTRO";
type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

interface Usuario {
  userId: number;
  username: string;
  rol: "ADMIN_IT" | "REPORTADOR";
  perfil: "ESTUDIANTE" | "PROFESOR" | "RECTOR" | "ADMINISTRATIVO" | "OTRO";
  nombre: string;
}

interface Incidencia {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: TipoIncidencia;
  prioridad: Prioridad;
  estado: EstadoIncidencia;
  ubicacion: string;
  creadoEn: string;
  actualizadoEn: string;
}

const ESTADO_CONFIG: Record<EstadoIncidencia, { label: string; color: string }> = {
  ABIERTA: { label: "Abierta", color: "bg-blue-100 text-blue-800 border-blue-200" },
  EN_PROGRESO: { label: "En progreso", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  RESUELTA: { label: "Resuelta", color: "bg-green-100 text-green-800 border-green-200" },
  CERRADA: { label: "Cerrada", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; color: string }> = {
  BAJA: { label: "Baja", color: "bg-green-100 text-green-700 border-green-200" },
  MEDIA: { label: "Media", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ALTA: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200" },
  CRITICA: { label: "Crítica", color: "bg-red-100 text-red-700 border-red-200" },
};

const TIPO_LABEL: Record<TipoIncidencia, string> = {
  HARDWARE: "Hardware",
  SOFTWARE: "Software",
  RED: "Red",
  ACCESO: "Acceso",
  OTRO: "Otro",
};

export default function MisIncidenciasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.usuario) {
          router.push("/");
          return;
        }
        setUsuario(data.usuario);
        return fetch("/api/incidencias/mis");
      })
      .then(async (res) => {
        if (!res) return;
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "No se pudieron cargar tus incidencias.");
          return;
        }
        setIncidencias(data.incidencias ?? []);
      })
      .catch(() => setError("No se pudieron cargar tus incidencias."))
      .finally(() => setLoading(false));
  }, [router]);

  async function cerrarSesion() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  }

  function formatFecha(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Cargando tus incidencias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e8b84b] rounded-full flex items-center justify-center font-bold text-[#1e3a5f] text-sm select-none">
            U
          </div>
          <div>
            <p className="text-xs opacity-70 leading-none">Universidad de Piura</p>
            <p className="font-semibold text-sm leading-tight">Mis Incidencias</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/reportar")}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            Nueva incidencia
          </button>
          <span className="text-xs opacity-70 hidden sm:block">{usuario?.nombre}</span>
          <button
            onClick={cerrarSesion}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {incidencias.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            Aun no has registrado incidencias.
          </div>
        ) : (
          incidencias.map((inc) => (
            <article key={inc.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">Incidencia #{inc.id}</p>
                  <h2 className="text-base font-semibold text-gray-900 mt-1">{inc.titulo}</h2>
                </div>
                <p className="text-xs text-gray-400">{formatFecha(inc.creadoEn)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ESTADO_CONFIG[inc.estado].color}`}>
                  Estado: {ESTADO_CONFIG[inc.estado].label}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PRIORIDAD_CONFIG[inc.prioridad].color}`}>
                  Prioridad: {PRIORIDAD_CONFIG[inc.prioridad].label}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                  Tipo: {TIPO_LABEL[inc.tipo]}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</dt>
                  <dd className="text-gray-700 mt-1">{inc.ubicacion}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">Última actualización</dt>
                  <dd className="text-gray-700 mt-1">{formatFecha(inc.actualizadoEn)}</dd>
                </div>
              </dl>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">
                  {inc.descripcion}
                </p>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
