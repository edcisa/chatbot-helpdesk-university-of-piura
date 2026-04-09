"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Rol = "ADMIN_IT" | "REPORTADOR";
type PerfilUsuario = "ESTUDIANTE" | "PROFESOR" | "RECTOR" | "ADMINISTRATIVO" | "OTRO";

interface Usuario {
  userId: number;
  username: string;
  rol: Rol;
  perfil: PerfilUsuario;
  nombre: string;
}

type TipoIncidencia = "HARDWARE" | "SOFTWARE" | "RED" | "ACCESO" | "OTRO";
type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
type AreaIT =
  | "MESA_AYUDA"
  | "INFRAESTRUCTURA"
  | "SISTEMAS"
  | "REDES"
  | "SEGURIDAD"
  | "AUDIOVISUALES"
  | "LABORATORIOS";

interface IncidenciaData {
  titulo: string;
  descripcion: string;
  areaIT: AreaIT;
  tipo: TipoIncidencia;
  prioridad: Prioridad;
  ubicacion: string;
}

type ChatStep =
  | "SALUDO"
  | "ASK_INTENCION"
  | "ASK_CONSULTA"
  | "ASK_AREA_IT"
  | "ASK_TITULO"
  | "ASK_TIPO"
  | "ASK_UBICACION"
  | "ASK_DESCRIPCION"
  | "ASK_PRIORIDAD"
  | "CONFIRMAR"
  | "DONE";

interface Mensaje {
  id: number;
  origen: "bot" | "user";
  texto: string;
}

const BOT_NOMBRE = "UDEP Soporte";

const TIPOS: { valor: TipoIncidencia; etiqueta: string }[] = [
  { valor: "HARDWARE", etiqueta: "Hardware" },
  { valor: "SOFTWARE", etiqueta: "Software" },
  { valor: "RED", etiqueta: "Red / Conectividad" },
  { valor: "ACCESO", etiqueta: "Acceso / Credenciales" },
  { valor: "OTRO", etiqueta: "Otro" },
];

const PRIORIDADES: { valor: Prioridad; etiqueta: string; color: string }[] = [
  { valor: "BAJA", etiqueta: "Baja", color: "bg-green-100 text-green-800 border-green-200" },
  { valor: "MEDIA", etiqueta: "Media", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { valor: "ALTA", etiqueta: "Alta", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { valor: "CRITICA", etiqueta: "Crítica", color: "bg-red-100 text-red-800 border-red-200" },
];

const AREAS_IT: { valor: AreaIT; etiqueta: string }[] = [
  { valor: "MESA_AYUDA", etiqueta: "Mesa de ayuda" },
  { valor: "INFRAESTRUCTURA", etiqueta: "Infraestructura" },
  { valor: "SISTEMAS", etiqueta: "Sistemas y plataformas" },
  { valor: "REDES", etiqueta: "Redes y conectividad" },
  { valor: "SEGURIDAD", etiqueta: "Seguridad informática" },
  { valor: "AUDIOVISUALES", etiqueta: "Audiovisuales" },
  { valor: "LABORATORIOS", etiqueta: "Laboratorios" },
];

let msgCounter = 0;
function crearMensaje(origen: "bot" | "user", texto: string): Mensaje {
  return { id: msgCounter++, origen, texto };
}

export default function ReportarPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [paso, setPaso] = useState<ChatStep>("SALUDO");
  const [incidencia, setIncidencia] = useState<Partial<IncidenciaData>>({});
  const [enviando, setEnviando] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Verificar autenticación
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.usuario) {
          router.push("/");
          return;
        }
        setUsuario(data.usuario);
        setLoadingAuth(false);
        // Mensaje de bienvenida
        setMensajes([
          crearMensaje(
            "bot",
              `Hola, ${data.usuario.nombre}. Soy ${BOT_NOMBRE}, tu asistente de soporte IT de la Universidad de Piura.\n\n¿Qué necesitas hacer hoy?`
          ),
        ]);
        setPaso("ASK_INTENCION");
      })
      .catch(() => router.push("/"))
      .finally(() => setLoadingAuth(false));
  }, [router]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  function agregarBot(texto: string) {
    setMensajes((prev) => [...prev, crearMensaje("bot", texto)]);
  }

  function agregarUser(texto: string) {
    setMensajes((prev) => [...prev, crearMensaje("user", texto)]);
  }

  function procesarRespuesta(respuesta: string, mostrarComoMensaje = true) {
    if (mostrarComoMensaje) {
      agregarUser(respuesta);
    }

    switch (paso) {
      case "ASK_INTENCION": {
        const valor = respuesta.trim().toLowerCase();
        if (
          valor === "1" ||
          valor === "consulta" ||
          valor === "hacer una consulta" ||
          valor === "tengo una consulta"
        ) {
          setPaso("ASK_CONSULTA");
          setTimeout(() => {
            agregarBot(
              "Perfecto. Cuéntame tu consulta y te guío con el siguiente paso."
            );
          }, 300);
          return;
        }

        if (
          valor === "2" ||
          valor === "incidencia" ||
          valor === "reportar incidencia" ||
          valor === "quiero poner una incidencia"
        ) {
          setPaso("ASK_AREA_IT");
          setTimeout(() => {
            agregarBot(
              "Excelente. Primero, elige el área IT a la que corresponde tu incidencia:"
            );
          }, 300);
          return;
        }

        agregarBot("Elige una opción: 1) Hacer una consulta o 2) Reportar una incidencia.");
        break;
      }

      case "ASK_AREA_IT": {
        const num = parseInt(respuesta.trim());
        let areaIT: AreaIT | undefined;
        if (!isNaN(num) && num >= 1 && num <= AREAS_IT.length) {
          areaIT = AREAS_IT[num - 1].valor;
        } else {
          const match = AREAS_IT.find(
            (a) =>
              a.etiqueta.toLowerCase() === respuesta.trim().toLowerCase() ||
              a.valor.toLowerCase() === respuesta.trim().toLowerCase()
          );
          areaIT = match?.valor;
        }

        if (!areaIT) {
          agregarBot("No reconocí esa área. Por favor elige una opción válida.");
          return;
        }

        setIncidencia((prev) => ({ ...prev, areaIT }));
        setPaso("ASK_TITULO");
        setTimeout(() => {
          agregarBot("Perfecto. ¿Cuál es el título o resumen breve del problema?");
        }, 300);
        break;
      }

      case "ASK_CONSULTA": {
        const consulta = respuesta.trim();
        if (consulta.length < 5) {
          agregarBot("Cuéntame un poco más de detalle para poder orientarte mejor.");
          return;
        }
        setPaso("DONE");
        agregarBot(
          `Gracias por tu consulta. Te recomiendo revisar primero la sección de \"Mis incidencias\" para ver estados y respuestas del equipo IT.\n\nSi prefieres, también puedes registrar una incidencia nueva desde \"Nueva incidencia\".`
        );
        break;
      }

      case "ASK_TITULO": {
        const titulo = respuesta.trim();
        if (titulo.length < 5) {
          agregarBot("Por favor escribe un título más descriptivo (al menos 5 caracteres).");
          return;
        }
        setIncidencia((prev) => ({ ...prev, titulo }));
        setPaso("ASK_TIPO");
        setTimeout(() => {
          agregarBot(
            "Entendido. ¿Qué tipo de incidencia es?\n\nSelecciona una opción de la lista o escribe el número:"
          );
        }, 300);
        break;
      }

      case "ASK_TIPO": {
        const num = parseInt(respuesta.trim());
        let tipo: TipoIncidencia | undefined;
        if (!isNaN(num) && num >= 1 && num <= TIPOS.length) {
          tipo = TIPOS[num - 1].valor;
        } else {
          const match = TIPOS.find(
            (t) =>
              t.etiqueta.toLowerCase() === respuesta.trim().toLowerCase() ||
              t.valor.toLowerCase() === respuesta.trim().toLowerCase()
          );
          tipo = match?.valor;
        }
        if (!tipo) {
          agregarBot("No reconocí ese tipo. Por favor elige una opción válida (1–5).");
          return;
        }
        setIncidencia((prev) => ({ ...prev, tipo }));
        setPaso("ASK_UBICACION");
        setTimeout(() => {
          agregarBot("¿Dónde ocurrió el problema? Indica el edificio, aula o laboratorio.");
        }, 300);
        break;
      }

      case "ASK_UBICACION": {
        const ubicacion = respuesta.trim();
        if (ubicacion.length < 3) {
          agregarBot("Por favor indica la ubicación con más detalle.");
          return;
        }
        setIncidencia((prev) => ({ ...prev, ubicacion }));
        setPaso("ASK_DESCRIPCION");
        setTimeout(() => {
          agregarBot(
            "Perfecto. Ahora cuéntame con más detalle qué está pasando exactamente. Entre más información, más rápido podremos ayudarte."
          );
        }, 300);
        break;
      }

      case "ASK_DESCRIPCION": {
        const descripcion = respuesta.trim();
        if (descripcion.length < 10) {
          agregarBot("Por favor describe el problema con un poco más de detalle.");
          return;
        }
        setIncidencia((prev) => ({ ...prev, descripcion }));
        setPaso("ASK_PRIORIDAD");
        setTimeout(() => {
          agregarBot(
            "¿Cuál es la prioridad de esta incidencia?\n\nSelecciona una opción:"
          );
        }, 300);
        break;
      }

      case "ASK_PRIORIDAD": {
        const num = parseInt(respuesta.trim());
        let prioridad: Prioridad | undefined;
        if (!isNaN(num) && num >= 1 && num <= PRIORIDADES.length) {
          prioridad = PRIORIDADES[num - 1].valor;
        } else {
          const match = PRIORIDADES.find(
            (p) =>
              p.etiqueta.toLowerCase() === respuesta.trim().toLowerCase() ||
              p.valor.toLowerCase() === respuesta.trim().toLowerCase()
          );
          prioridad = match?.valor;
        }
        if (!prioridad) {
          agregarBot("Por favor elige una prioridad válida (1–4).");
          return;
        }
        setIncidencia((prev) => ({ ...prev, prioridad }));
        setPaso("CONFIRMAR");
        setTimeout(() => {
          agregarBot(
            `Perfecto. Aquí está el resumen de tu incidencia antes de enviarla:\n\nResponde "sí" para confirmar o "no" para cancelar.`
          );
        }, 300);
        break;
      }

      case "CONFIRMAR": {
        const resp = respuesta.trim().toLowerCase();
        if (resp === "sí" || resp === "si" || resp === "s" || resp === "yes") {
          enviarIncidencia();
        } else if (resp === "no" || resp === "n") {
          agregarBot(
            "Incidencia cancelada. Si quieres reportar una nueva incidencia, recarga la página."
          );
          setPaso("DONE");
        } else {
          agregarBot('Por favor responde "sí" para confirmar o "no" para cancelar.');
        }
        break;
      }
    }
  }

  async function enviarIncidencia() {
    setEnviando(true);
    try {
      const res = await fetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidencia),
      });
      const data = await res.json();
      if (res.ok) {
        setPaso("DONE");
        agregarBot(
          `Incidencia registrada exitosamente. Se le ha asignado el ID #${data.incidencia.id}.\n\nEl equipo de IT la revisará pronto. ¿Tienes otra incidencia que reportar?`
        );
        setTimeout(() => {
          agregarBot(
            'Si quieres reportar otra incidencia, haz clic en "Nueva incidencia" arriba.'
          );
        }, 1000);
      } else {
        agregarBot(`Error al registrar: ${data.error}. Por favor intenta de nuevo.`);
      }
    } catch {
      agregarBot("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    msgCounter = 0;
    setIncidencia({});
    setPaso("ASK_INTENCION");
    setMensajes([
      crearMensaje(
        "bot",
        `Hola de nuevo, ${usuario?.nombre}.\n\n¿Qué necesitas hacer ahora?`
      ),
    ]);
  }

  async function cerrarSesion() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || enviando || paso === "DONE") return;
    const texto = input.trim();
    setInput("");
    procesarRespuesta(texto);
  }

  function seleccionarOpcion(valor: string) {
    setInput("");
    procesarRespuesta(valor, false);
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e8b84b] rounded-full flex items-center justify-center font-bold text-[#1e3a5f] text-sm select-none">
            U
          </div>
          <div>
            <p className="text-xs opacity-70 leading-none">Universidad de Piura</p>
            <p className="font-semibold text-sm leading-tight">{BOT_NOMBRE}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/mis-incidencias")}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            Mis incidencias
          </button>
          <button
            onClick={reiniciar}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            + Nueva incidencia
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4 gap-4">
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1" style={{ minHeight: 0, maxHeight: "calc(100vh - 200px)" }}>
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.origen === "bot" ? "justify-start" : "justify-end"}`}
            >
              {msg.origen === "bot" && (
                <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
                  U
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                  msg.origen === "bot"
                    ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    : "bg-[#1e3a5f] text-white rounded-tr-none"
                }`}
              >
                {msg.texto}
                {/* Resumen de incidencia en confirmación */}
                {msg.origen === "bot" && paso === "CONFIRMAR" && msg.id === mensajes[mensajes.length - 1]?.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                    <p><span className="font-semibold text-gray-600">Título:</span> {incidencia.titulo}</p>
                    <p><span className="font-semibold text-gray-600">Tipo:</span> {TIPOS.find(t => t.valor === incidencia.tipo)?.etiqueta}</p>
                    <p><span className="font-semibold text-gray-600">Ubicación:</span> {incidencia.ubicacion}</p>
                    <p><span className="font-semibold text-gray-600">Descripción:</span> {incidencia.descripcion}</p>
                    <p><span className="font-semibold text-gray-600">Prioridad:</span> {PRIORIDADES.find(p => p.valor === incidencia.prioridad)?.etiqueta}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Botones de opciones rápidas */}
        {paso === "ASK_INTENCION" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => seleccionarOpcion("consulta")}
              className="p-4 bg-white border border-gray-200 rounded-xl text-left hover:bg-blue-50 hover:border-blue-300 transition"
            >
              <p className="text-sm font-semibold text-gray-800">Hacer una consulta</p>
              <p className="text-xs text-gray-500 mt-1">Tengo una duda y necesito orientación</p>
            </button>
            <button
              onClick={() => seleccionarOpcion("incidencia")}
              className="p-4 bg-[#1e3a5f] text-white border border-[#1e3a5f] rounded-xl text-left hover:bg-[#2e5090] transition"
            >
              <p className="text-sm font-semibold">Reportar una incidencia</p>
              <p className="text-xs text-white/80 mt-1">Quiero registrar un problema técnico</p>
            </button>
          </div>
        )}

        {paso === "ASK_TIPO" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIPOS.map((t, i) => (
              <button
                key={t.valor}
                onClick={() => seleccionarOpcion(String(i + 1))}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 transition text-left"
              >
                <span>{t.etiqueta}</span>
              </button>
            ))}
          </div>
        )}

        {paso === "ASK_AREA_IT" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AREAS_IT.map((a, i) => (
              <button
                key={a.valor}
                onClick={() => seleccionarOpcion(String(i + 1))}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 transition text-left"
              >
                {a.etiqueta}
              </button>
            ))}
          </div>
        )}

        {paso === "ASK_PRIORIDAD" && (
          <div className="grid grid-cols-2 gap-2">
            {PRIORIDADES.map((p, i) => (
              <button
                key={p.valor}
                onClick={() => seleccionarOpcion(String(i + 1))}
                className={`px-3 py-2 border rounded-lg text-sm font-medium hover:opacity-80 transition ${p.color}`}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        )}

        {paso === "CONFIRMAR" && (
          <div className="flex gap-2">
            <button
              onClick={() => seleccionarOpcion("sí")}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Confirmar y enviar
            </button>
            <button
              onClick={() => seleccionarOpcion("no")}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Input de texto */}
        {paso !== "DONE" && paso !== "ASK_INTENCION" && paso !== "ASK_AREA_IT" && paso !== "ASK_TIPO" && paso !== "ASK_PRIORIDAD" && paso !== "CONFIRMAR" && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu respuesta..."
              disabled={enviando}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || enviando}
              className="bg-[#1e3a5f] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#2e5090] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? "..." : "➤"}
            </button>
          </form>
        )}

        {paso === "DONE" && (
          <button
            onClick={reiniciar}
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2e5090] transition-colors"
          >
            + Reportar otra incidencia
          </button>
        )}
      </div>
    </div>
  );
}
