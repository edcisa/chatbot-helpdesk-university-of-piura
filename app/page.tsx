"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      if (data.usuario.rol === "ADMIN_IT") {
        router.push("/dashboard");
      } else {
        router.push("/reportar");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#2e5090] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] px-8 py-6 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#e8b84b] rounded-full flex items-center justify-center font-bold text-[#1e3a5f] text-lg select-none">
              U
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest opacity-75">Universidad de Piura</p>
              <h1 className="text-base font-bold leading-tight">Gestión de Incidencias IT</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#2e5090] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">
              Cuentas de demostración
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setUsername("administradorit"); setPassword("admin123"); }}
                className="text-left p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition cursor-pointer"
              >
                <p className="text-xs font-semibold text-blue-800">Administrador IT</p>
                <p className="text-xs text-blue-600 mt-0.5">administradorit / admin123</p>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("estudianteudep"); setPassword("user123"); }}
                className="text-left p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition cursor-pointer"
              >
                <p className="text-xs font-semibold text-green-800">Estudiante</p>
                <p className="text-xs text-green-600 mt-0.5">estudianteudep / user123</p>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("profesorudep"); setPassword("user123"); }}
                className="text-left p-3 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100 transition cursor-pointer"
              >
                <p className="text-xs font-semibold text-amber-800">Profesor</p>
                <p className="text-xs text-amber-700 mt-0.5">profesorudep / user123</p>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("rectorudep"); setPassword("user123"); }}
                className="text-left p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <p className="text-xs font-semibold text-slate-800">Rector</p>
                <p className="text-xs text-slate-700 mt-0.5">rectorudep / user123</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-white/40 text-xs text-center">
        © {new Date().getFullYear()} Universidad de Piura – Área de Tecnología
      </p>
    </div>
  );
}
