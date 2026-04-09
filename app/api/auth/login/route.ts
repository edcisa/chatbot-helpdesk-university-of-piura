import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { username } });

    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      perfil: usuario.perfil,
      nombre: usuario.nombre,
    });

    const response = NextResponse.json({
      ok: true,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        perfil: usuario.perfil,
        nombre: usuario.nombre,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
