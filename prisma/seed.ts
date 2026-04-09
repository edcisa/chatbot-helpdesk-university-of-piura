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
    update: {
      rol: "ADMIN_IT",
      perfil: "ADMINISTRATIVO",
      nombre: "Administrador IT",
      passwordHash: hashAdmin,
    },
    create: {
      username: "administradorit",
      passwordHash: hashAdmin,
      rol: "ADMIN_IT",
      perfil: "ADMINISTRATIVO",
      nombre: "Administrador IT",
    },
  });

  const estudiante = await prisma.usuario.upsert({
    where: { username: "estudianteudep" },
    update: {
      rol: "REPORTADOR",
      perfil: "ESTUDIANTE",
      nombre: "María Estudiante",
      passwordHash: hashUser,
    },
    create: {
      username: "estudianteudep",
      passwordHash: hashUser,
      rol: "REPORTADOR",
      perfil: "ESTUDIANTE",
      nombre: "María Estudiante",
    },
  });

  const profesor = await prisma.usuario.upsert({
    where: { username: "profesorudep" },
    update: {
      rol: "REPORTADOR",
      perfil: "PROFESOR",
      nombre: "Carlos Profesor",
      passwordHash: hashUser,
    },
    create: {
      username: "profesorudep",
      passwordHash: hashUser,
      rol: "REPORTADOR",
      perfil: "PROFESOR",
      nombre: "Carlos Profesor",
    },
  });

  const rector = await prisma.usuario.upsert({
    where: { username: "rectorudep" },
    update: {
      rol: "REPORTADOR",
      perfil: "RECTOR",
      nombre: "Rector UDEP",
      passwordHash: hashUser,
    },
    create: {
      username: "rectorudep",
      passwordHash: hashUser,
      rol: "REPORTADOR",
      perfil: "RECTOR",
      nombre: "Rector UDEP",
    },
  });

  const reportadorLegacy = await prisma.usuario.upsert({
    where: { username: "reportador" },
    update: {
      rol: "REPORTADOR",
      perfil: "ESTUDIANTE",
      nombre: "Juan Pérez",
      passwordHash: hashUser,
    },
    create: {
      username: "reportador",
      passwordHash: hashUser,
      rol: "REPORTADOR",
      perfil: "ESTUDIANTE",
      nombre: "Juan Pérez",
    },
  });

  console.log(`✅ Usuario admin IT creado: ${adminit.username}`);
  console.log(`✅ Usuario estudiante creado: ${estudiante.username}`);
  console.log(`✅ Usuario profesor creado: ${profesor.username}`);
  console.log(`✅ Usuario rector creado: ${rector.username}`);
  console.log(`✅ Usuario reportador legado creado: ${reportadorLegacy.username}`);

  // Crear incidencias de ejemplo
  const ejemplos = [
    {
      titulo: "Proyector del Aula A-201 no enciende",
      descripcion:
        "El proyector del aula A-201 no enciende desde el lunes. Se intentó reiniciar pero no responde. El botón de encendido parpadea en rojo.",
      areaIT: "AUDIOVISUALES" as const,
      tipo: "HARDWARE" as const,
      prioridad: "MEDIA" as const,
      ubicacion: "Edificio A, Aula 201",
      usuarioId: profesor.id,
    },
    {
      titulo: "Sin acceso al sistema de notas desde campus WiFi",
      descripcion:
        "No se puede acceder al portal de notas cuando se usa la red WiFi del campus. Desde redes externas funciona bien. El error que aparece es 'Connection timeout'.",
      areaIT: "REDES" as const,
      tipo: "RED" as const,
      prioridad: "ALTA" as const,
      ubicacion: "Biblioteca Central",
      usuarioId: estudiante.id,
    },
    {
      titulo: "Computadoras del Lab B-105 con virus",
      descripcion:
        "Varias PCs del laboratorio B-105 muestran ventanas emergentes sospechosas y el antivirus fue deshabilitado. Posible infección por malware.",
      areaIT: "SEGURIDAD" as const,
      tipo: "SOFTWARE" as const,
      prioridad: "CRITICA" as const,
      estado: "EN_PROGRESO" as const,
      ubicacion: "Edificio B, Laboratorio 105",
      usuarioId: estudiante.id,
    },
    {
      titulo: "Olvidé contraseña del correo institucional",
      descripcion:
        "No puedo ingresar a mi correo institucional, indica que mi contraseña expiró pero no me llega el correo de restablecimiento.",
      areaIT: "MESA_AYUDA" as const,
      tipo: "ACCESO" as const,
      prioridad: "BAJA" as const,
      estado: "RESUELTA" as const,
      ubicacion: "Facultad de Ingeniería",
      usuarioId: rector.id,
    },
  ];

  for (const ej of ejemplos) {
    await prisma.incidencia.create({ data: ej });
  }

  console.log(`✅ ${ejemplos.length} incidencias de ejemplo creadas`);
  console.log("\n🎉 Seed completado exitosamente!\n");
  console.log("Credenciales de acceso:");
  console.log("  🛡️  Administrador IT: administradorit / admin123");
  console.log("  🎓 Estudiante:        estudianteudep / user123");
  console.log("  👨‍🏫 Profesor:          profesorudep / user123");
  console.log("  🏛️  Rector:            rectorudep / user123");
  console.log("  👤 Reportador legado: reportador / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
