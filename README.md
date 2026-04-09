# Sistema de Gestión de Incidencias IT – Universidad de Piura

Aplicación web para gestionar incidencias tecnológicas, construida con **Next.js 16**, **PostgreSQL** y **Prisma 7**.

## Usuarios de demostración

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| `administradorit` | `admin123` | Administrador IT | Dashboard con lista de incidencias |
| `estudianteudep` | `user123` | Reportador (Estudiante) | Chat para crear incidencias |
| `profesorudep` | `user123` | Reportador (Profesor) | Chat para crear incidencias |
| `rectorudep` | `user123` | Reportador (Rector) | Chat para crear incidencias |

## Requisitos previos

- Node.js 18+
- PostgreSQL (local o Vercel Postgres en producción)

## Guía de instalación local (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/edcisa/chatbot-helpdesk-university-of-piura.git
cd chatbot-helpdesk-university-of-piura
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y define:

- `DATABASE_URL`: cadena de conexión de PostgreSQL
- `JWT_SECRET`: clave secreta para autenticación (cámbiala en producción)

Ejemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/piura_incidencias?schema=public"
JWT_SECRET="cambia-esta-clave-en-produccion"
```

### 4. Preparar la base de datos

Tienes dos opciones:

#### Opción A: PostgreSQL local (recomendada)

1. Crea una base de datos llamada `piura_incidencias`.
2. Ejecuta migraciones y seed:

```bash
npm run db:migrate
npm run db:seed
```

#### Opción B: Prisma Dev (sin instalar PostgreSQL manualmente)

1. Inicia servidor de Prisma Dev:

```bash
npx prisma dev --name piura --detach
```

2. Obtén la URL TCP del servidor:

```bash
npx prisma dev ls
```

3. Copia la URL `postgres://...` en `DATABASE_URL` del `.env`.
4. Sincroniza esquema y carga datos demo:

```bash
npx prisma db push
npm run db:seed
```

### 5. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 6. Iniciar sesión con usuarios de prueba

- Administrador IT: `administradorit` / `admin123`
- Estudiante: `estudianteudep` / `user123`
- Profesor: `profesorudep` / `user123`
- Rector: `rectorudep` / `user123`

## Troubleshooting rápido

### Error `P1017 Server has closed the connection`

- Verifica que `DATABASE_URL` apunte a una base de datos activa.
- Si usas Prisma Dev, revisa puertos con `npx prisma dev ls` y actualiza `.env`.

### Error `Repository not found` al clonar/push

- Revisa owner y nombre exacto del repo.
- URL correcta de este proyecto: `https://github.com/edcisa/chatbot-helpdesk-university-of-piura`

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
