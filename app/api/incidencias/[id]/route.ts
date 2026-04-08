import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.rol !== "ADMIN_IT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { estado } = body;

  const estadosValidos = ["ABIERTA", "EN_PROGRESO", "RESUELTA", "CERRADA"];
  if (!estadosValidos.includes(estado)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  const incidencia = await prisma.incidencia.update({
    where: { id: parseInt(id) },
    data: { estado },
  });

  return NextResponse.json({ ok: true, incidencia });
}
