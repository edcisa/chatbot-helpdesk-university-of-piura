"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type EstadoIncidencia = "ABIERTA" | "EN_PROGRESO" | "RESUELTA" | "CERRADA";
type TipoIncidencia = "HARDWARE" | "SOFTWARE" | "RED" | "ACCESO" | "OTRO";
type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

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
  reportadoPor: { nombre: string; username: string };
}

interface Usuario {
  userId: number;
  username: string;
  rol: string;
  nombre: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoIncidencia | "TODAS">("TODAS");
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | "TODAS">("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<TipoIncidencia | "TODAS">("TODAS");
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.usuario || data.usuario.rol !== "ADMIN_IT") {
          router.push("/");
          return;
        }
        setUsuario(data.usuario);
        cargarIncidencias();
      })
      .catch(() => router.push("/"));
  }, [router]);

  async function cargarIncidencias() {
    try {
      const res = await fetch("/api/incidencias");
      const data = await res.json();
      if (res.ok) {
        setIncidencias(data.incidencias);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error al cargar las incidencias.");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id: number, estado: EstadoIncidencia) {
    setActualizandoId(id);
    try {
      const res = await fetch(`/api/incidencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        setIncidencias((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, estado } : inc))
        );
      }
    } finally {
      setActualizandoId(null);
    }
  }

  async function cerrarSesion() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  }

  const incidenciasFiltradas = incidencias.filter((inc) => {
    const matchEstado = filtroEstado === "TODAS" || inc.estado === filtroEstado;
    const matchPrioridad = filtroPrioridad === "TODAS" || inc.prioridad === filtroPrioridad;
    const matchTipo = filtroTipo === "TODAS" || inc.tipo === filtroTipo;
    const matchBusqueda =
      busqueda === "" ||
      inc.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inc.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      inc.reportadoPor.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchPrioridad && matchTipo && matchBusqueda;
  });

  const stats = {
    total: incidencias.length,
    abiertas: incidencias.filter((i) => i.estado === "ABIERTA").length,
    enProgreso: incidencias.filter((i) => i.estado === "EN_PROGRESO").length,
    resueltas: incidencias.filter((i) => i.estado === "RESUELTA").length,
    criticas: incidencias.filter((i) => i.prioridad === "CRITICA" && i.estado !== "CERRADA").length,
  };

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
        <div className="text-gray-500">Cargando incidencias...</div>
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
            <p className="font-semibold text-sm leading-tight">Panel de Incidencias IT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarIncidencias}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            Actualizar
          </button>
          <span className="text-xs opacity-70 hidden sm:inline">{usuario?.nombre}</span>
          <button
            onClick={cerrarSesion}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "bg-white border-gray-200 text-gray-700" },
            { label: "Abiertas", value: stats.abiertas, color: "bg-blue-50 border-blue-200 text-blue-800" },
            { label: "En progreso", value: stats.enProgreso, color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
            { label: "Resueltas", value: stats.resueltas, color: "bg-green-50 border-green-200 text-green-800" },
            { label: "Críticas activas", value: stats.criticas, color: "bg-red-50 border-red-200 text-red-800" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-xl p-4 text-center shadow-sm`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por titulo, ubicacion o reportador"
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoIncidencia | "TODAS")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] bg-white"
            >
              <option value="TODAS">Todos los estados</option>
              <option value="ABIERTA">Abierta</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="RESUELTA">Resuelta</option>
              <option value="CERRADA">Cerrada</option>
            </select>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as Prioridad | "TODAS")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] bg-white"
            >
              <option value="TODAS">Todas las prioridades</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoIncidencia | "TODAS")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] bg-white"
            >
              <option value="TODAS">Todos los tipos</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="RED">Red</option>
              <option value="ACCESO">Acceso</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Mostrando {incidenciasFiltradas.length} de {incidencias.length} incidencias
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {incidenciasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-sm">No hay incidencias con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {incidenciasFiltradas.map((inc) => (
              <article key={inc.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">Incidencia #{inc.id}</p>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mt-1">{inc.titulo}</h3>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatFecha(inc.creadoEn)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ESTADO_CONFIG[inc.estado].color}`}>
                    {ESTADO_CONFIG[inc.estado].label}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PRIORIDAD_CONFIG[inc.prioridad].color}`}>
                    Prioridad {PRIORIDAD_CONFIG[inc.prioridad].label}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                    Tipo {TIPO_LABEL[inc.tipo]}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</dt>
                    <dd className="text-gray-700 mt-1">{inc.ubicacion}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Reportado por</dt>
                    <dd className="text-gray-700 mt-1">{inc.reportadoPor.nombre} ({inc.reportadoPor.username})</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Creado</dt>
                    <dd className="text-gray-700 mt-1">{formatFecha(inc.creadoEn)}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Actualizado</dt>
                    <dd className="text-gray-700 mt-1">{formatFecha(inc.actualizadoEn)}</dd>
                  </div>
                </dl>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">
                    {inc.descripcion}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ABIERTA", "EN_PROGRESO", "RESUELTA", "CERRADA"] as EstadoIncidencia[]).map(
                      (estado) => (
                        <button
                          key={estado}
                          onClick={() => cambiarEstado(inc.id, estado)}
                          disabled={actualizandoId === inc.id || inc.estado === estado}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                            inc.estado === estado
                              ? `${ESTADO_CONFIG[estado].color} cursor-default`
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          }`}
                        >
                          {ESTADO_CONFIG[estado].label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
