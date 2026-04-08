import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear usuarios demo
  const hashAdmin = await bcrypt.hash("admin123", 12);
  const hashUser = await bcrypt.hash("user123", 12);

  const adminit = await prisma.usuario.upsert({
    where: { username: "administradorit" },
    update: {},
    create: {
      username: "administradorit",
      passwordHash: hashAdmin,
      rol: "ADMIN_IT",
      nombre: "Administrador IT",
    },
  });

  const reportador = await prisma.usuario.upsert({
    where: { username: "reportador" },
    update: {},
    create: {
      username: "reportador",
      passwordHash: hashUser,
      rol: "REPORTADOR",
      nombre: "Juan Pérez",
    },
  });

  console.log(`✅ Usuario admin IT creado: ${adminit.username}`);
  console.log(`✅ Usuario reportador creado: ${reportador.username}`);

  // Crear incidencias de ejemplo
  const ejemplos = [
    {
      titulo: "Proyector del Aula A-201 no enciende",
      descripcion:
        "El proyector del aula A-201 no enciende desde el lunes. Se intentó reiniciar pero no responde. El botón de encendido parpadea en rojo.",
      tipo: "HARDWARE" as const,
      prioridad: "MEDIA" as const,
      ubicacion: "Edificio A, Aula 201",
      usuarioId: reportador.id,
    },
    {
      titulo: "Sin acceso al sistema de notas desde campus WiFi",
      descripcion:
        "No se puede acceder al portal de notas cuando se usa la red WiFi del campus. Desde redes externas funciona bien. El error que aparece es 'Connection timeout'.",
      tipo: "RED" as const,
      prioridad: "ALTA" as const,
      ubicacion: "Biblioteca Central",
      usuarioId: reportador.id,
    },
    {
      titulo: "Computadoras del Lab B-105 con virus",
      descripcion:
        "Varias PCs del laboratorio B-105 muestran ventanas emergentes sospechosas y el antivirus fue deshabilitado. Posible infección por malware.",
      tipo: "SOFTWARE" as const,
      prioridad: "CRITICA" as const,
      estado: "EN_PROGRESO" as const,
      ubicacion: "Edificio B, Laboratorio 105",
      usuarioId: reportador.id,
    },
    {
      titulo: "Olvidé contraseña del correo institucional",
      descripcion:
        "No puedo ingresar a mi correo institucional, indica que mi contraseña expiró pero no me llega el correo de restablecimiento.",
      tipo: "ACCESO" as const,
      prioridad: "BAJA" as const,
      estado: "RESUELTA" as const,
      ubicacion: "Facultad de Ingeniería",
      usuarioId: reportador.id,
    },
  ];

  for (const ej of ejemplos) {
    await prisma.incidencia.create({ data: ej });
  }

  console.log(`✅ ${ejemplos.length} incidencias de ejemplo creadas`);
  console.log("\n🎉 Seed completado exitosamente!\n");
  console.log("Credenciales de acceso:");
  console.log("  🛡️  Administrador IT: administradorit / admin123");
  console.log("  👤  Reportador:       reportador / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
