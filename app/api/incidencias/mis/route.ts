import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const incidencias = await prisma.incidencia.findMany({
    where: { usuarioId: session.userId },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json({ incidencias });
}
