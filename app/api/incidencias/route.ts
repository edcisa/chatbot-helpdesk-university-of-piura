import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "ADMIN_IT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const incidencias = await prisma.incidencia.findMany({
    include: {
      reportadoPor: {
        select: { nombre: true, username: true },
      },
    },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json({ incidencias });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { titulo, descripcion, tipo, prioridad, ubicacion } = body;

    if (!titulo || !descripcion || !ubicacion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const incidencia = await prisma.incidencia.create({
      data: {
        titulo,
        descripcion,
        tipo: tipo ?? "OTRO",
        prioridad: prioridad ?? "MEDIA",
        ubicacion,
        usuarioId: session.userId,
      },
    });

    return NextResponse.json({ ok: true, incidencia }, { status: 201 });
  } catch (error) {
    console.error("Error al crear incidencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
