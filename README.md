# Sistema de Gestión de Incidencias IT – Universidad de Piura

Aplicación web para gestionar incidencias tecnológicas, construida con **Next.js 16**, **PostgreSQL** y **Prisma 7**.

## Usuarios de demostración

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| `administradorit` | `admin123` | Administrador IT | Dashboard con lista de incidencias |
| `reportador` | `user123` | Reportador | Chat para crear incidencias |

## Requisitos previos

- Node.js 18+
- PostgreSQL (local o Vercel Postgres en producción)

## Configuración local

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL de PostgreSQL

# 2. Instalar dependencias
npm install

# 3. Crear tablas y cargar datos de demo
npm run db:setup

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:generate` | Regenerar cliente Prisma |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Insertar datos de demo |
| `npm run db:setup` | Migrate + Seed (primera vez) |

## Despliegue en Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Crear una base de datos Postgres desde el dashboard de Vercel
3. Configurar las variables de entorno `DATABASE_URL` y `JWT_SECRET`
4. Deploy automático en cada push a `main`

## Estructura del proyecto

```
app/
├── page.tsx              # Login
├── dashboard/page.tsx    # Panel del Administrador IT
├── reportar/page.tsx     # Chat para reportar incidencias
└── api/
    ├── auth/login/       # POST: iniciar sesión
    ├── auth/session/     # GET/DELETE: sesión actual
    └── incidencias/      # GET (lista) / POST (crear)
        └── [id]/         # PATCH (cambiar estado)
lib/
├── db.ts                 # Cliente Prisma (singleton)
└── auth.ts               # JWT con jose
prisma/
├── schema.prisma         # Modelos: Usuario, Incidencia
└── seed.ts               # Usuarios y datos demo
```
