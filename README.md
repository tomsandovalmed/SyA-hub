# S&A Tool Hub (SyA-hub)

Plataforma web de herramientas de análisis y generación de informes ejecutivos de S&A Chile.
Incluye un intérprete de logs Perfmon de SQL Server (módulos SII y TGR), un portal de informes
para clientes y un panel de administración de usuarios con control de acceso por roles (RBAC).

El manual completo (instalación, características, RBAC y credenciales) está en
[`docs/Manual_SyA_Hub.pdf`](docs/Manual_SyA_Hub.pdf) (fuente LaTeX en `docs/Manual_SyA_Hub.tex`).

## Requisitos

- Node.js 20 o superior (probado con Node 26) y npm.

## Uso rápido

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo con recarga en caliente -> http://localhost:3000
npm run lint         # verificación de tipos (tsc --noEmit)
npm run build        # compila y ofusca el frontend + empaqueta el servidor en /dist
npm run start        # sirve la versión compilada desde /dist
npm run clean        # elimina /dist
```

> Si existe la carpeta `dist/`, el servidor sirve siempre la versión compilada aunque se use
> `npm run dev`. Ejecute `npm run clean` para volver al modo desarrollo.

## Credenciales de demostración

| Rol    | Correo                    | Contraseña  |
|--------|---------------------------|-------------|
| ADMIN  | admin@sachile.cl          | admin123    |
| WORKER | worker@sachile.cl         | worker123   |
| CLIENT | cliente.sii@sachile.cl    | client123   |
| CLIENT | cliente.tgr@sachile.cl    | client123   |

Se definen en `src/config/auth.ts`. Son datos simulados en memoria: **no usar en producción**.

## Exponer públicamente (opcional)

```bash
cloudflared tunnel --url http://localhost:3000
npx localtunnel --port 3000
```
