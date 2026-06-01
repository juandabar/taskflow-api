# TaskFlow API — Proyecto de Aprendizaje

## Propósito del proyecto

Proyecto educativo para aprender en profundidad sobre:
- **Arquitectura Hexagonal** (Ports & Adapters) — foco principal
- **OpenAPI 3.0 + Swagger UI**
- **Testing** (unitario, integración, e2e)
- **Auth con JWT** — protección de rutas, contexto de usuario en use cases
- **Structured Logging con Pino** — logging profesional con niveles y contexto estructurado
- **Validación de entorno al startup** — Zod aplicado a variables de entorno
- **Formato de error consistente** — contrato único para todas las respuestas de error
- Drizzle ORM con SQLite (simulación de base de datos SQL sin Docker)
- TypeScript estricto en Node.js

> **Importante:** El usuario desarrolla el código por cuenta propia. Claude solo guía, explica conceptos, y responde preguntas. No generar código completo salvo que el usuario lo pida explícitamente para un fragmento pequeño y específico.

---

## Lógica de Negocio: Sistema de Gestión de Tareas y Proyectos

### Dominio

Una plataforma donde equipos pueden organizar su trabajo en **Proyectos**, cada uno con **Tareas** asignables a miembros y con **Comentarios**.

### Entidades del dominio

| Entidad | Atributos clave |
|---|---|
| **User** | id, name, email, passwordHash, role (ADMIN \| MEMBER), createdAt |
| **Project** | id, name, description, ownerId, status (ACTIVE \| ARCHIVED), createdAt |
| **Task** | id, title, description, projectId, assigneeId?, status (TODO \| IN_PROGRESS \| REVIEW \| DONE), priority (LOW \| MEDIUM \| HIGH \| CRITICAL), dueDate?, createdAt |
| **Comment** | id, content, taskId, authorId, createdAt |

### Reglas de negocio (esto vive en el dominio, no en la infraestructura)

1. No se pueden agregar tareas a un proyecto con status `ARCHIVED`.
2. Las transiciones de estado de una tarea deben seguir la máquina de estados: `TODO → IN_PROGRESS → REVIEW → DONE`. No se puede saltar estados ni retroceder salvo de `REVIEW` a `IN_PROGRESS`.
3. Solo el dueño de un proyecto puede archivarlo o eliminarlo.
4. La `dueDate` de una tarea no puede ser en el pasado al momento de crearla.
5. Un usuario solo puede eliminar sus propios comentarios (excepto ADMIN, que puede eliminar cualquiera).
6. El email de un usuario debe ser único en el sistema.
7. Un proyecto archivado no puede reactivarse (simplifica el modelo, buena restricción para practicar).

### Casos de uso principales (Use Cases / Application Services)

**Auth**
- `RegisterUser` — valida email único, hashea password
- `LoginUser` — valida credenciales, devuelve JWT firmado

**Users**
- `GetUserById`
- `ListUsers`

**Projects**
- `CreateProject` — el creador se convierte en owner
- `ArchiveProject` — solo el owner puede; verifica regla de no-reactivación
- `GetProjectById`
- `ListProjects` — filterable por status

**Tasks**
- `CreateTask` — valida que el proyecto esté ACTIVE, valida dueDate
- `UpdateTaskStatus` — aplica la máquina de estados
- `AssignTask` — asigna un user a una task
- `GetTaskById`
- `ListTasksByProject` — filterable por status, priority, assignee

**Comments**
- `AddComment`
- `DeleteComment` — aplica la regla de autorización

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript (strict) |
| Framework HTTP | Fastify o Express (a elección) |
| ORM | Drizzle ORM |
| Base de datos | **SQLite via `better-sqlite3`** — el archivo `.db` vive en el proyecto |
| Validación | Zod |
| OpenAPI | `@asteasolutions/zod-to-openapi` o `fastify-swagger` + `@fastify/swagger-ui` |
| Testing | Vitest |
| Auth | JWT con `jsonwebtoken` — protección de rutas y contexto de usuario |
| Logging | Pino — structured logging con niveles (error, warn, info, debug) |
| Config de entorno | Zod schema sobre `process.env` — validación al startup |

### Por qué SQLite y no Docker

SQLite almacena la base de datos en un único archivo local (ej: `data/taskflow.db`). Drizzle ORM tiene soporte de primera clase para SQLite con `better-sqlite3`. Es SQL real, con todas las ventajas de tipo, migraciones, y relaciones — solo que sin servidor separado. Ideal para desarrollo y aprendizaje.

---

## Arquitectura Hexagonal — Estructura de Carpetas

```
src/
├── domain/                        # Núcleo puro — sin dependencias externas
│   ├── entities/                  # Task.ts, User.ts, Project.ts, Comment.ts
│   ├── value-objects/             # TaskStatus.ts, Priority.ts, UserRole.ts
│   ├── ports/                     # Interfaces (contratos)
│   │   ├── driving/               # Puertos primarios (lo que entra al dominio)
│   │   │   └── ITaskUseCases.ts   # (opcional, algunos prefieren poner use-cases aquí)
│   │   └── driven/                # Puertos secundarios (lo que el dominio necesita)
│   │       ├── IUserRepository.ts
│   │       ├── IProjectRepository.ts
│   │       ├── ITaskRepository.ts
│   │       └── ICommentRepository.ts
│   ├── use-cases/                 # Casos de uso (lógica de aplicación)
│   │   ├── user/
│   │   ├── project/
│   │   ├── task/
│   │   └── comment/
│   └── errors/                    # DomainError.ts, NotFoundError.ts, etc.
│
├── adapters/
│   ├── driving/                   # Adaptadores primarios — los que "manejan" la app
│   │   └── http/
│   │       ├── controllers/       # UserController.ts, TaskController.ts, etc.
│   │       ├── middlewares/       # authGuard.ts — verifica JWT y adjunta userId al request
│   │       ├── routes/            # userRoutes.ts, taskRoutes.ts, etc.
│   │       ├── schemas/           # Schemas Zod para validar req/res + OpenAPI
│   │       └── errorHandler.ts    # Global error handler — mapea DomainErrors a HTTP + formato RFC 7807
│   └── driven/                    # Adaptadores secundarios — los que "sirven" al dominio
│       └── persistence/
│           └── drizzle/
│               ├── schema/        # Definición de tablas Drizzle
│               ├── migrations/    # Migraciones generadas por Drizzle Kit
│               └── repositories/  # DrizzleUserRepository.ts, etc. (implementan los puertos)
│
└── infrastructure/                # Bootstrapping, configuración, DI
    ├── config/
    │   └── env.ts                 # Schema Zod de process.env — falla rápido si falta algo
    ├── logger.ts                  # Instancia Pino singleton — importado por adaptadores
    ├── container.ts               # Wiring: instancia repositorios + use-cases
    └── server.ts                  # Crea y configura el servidor HTTP
```

### El principio clave de la arquitectura

```
HTTP Request
     ↓
[Controller] → llama al → [Use Case] → llama al → [Repository Port (interfaz)]
                                                          ↓
                                              [Drizzle Repository (implementación)]
                                                          ↓
                                                      [SQLite]
```

El dominio (`use-cases`, `entities`, `ports`) **no importa nada de Express/Fastify, ni de Drizzle, ni de SQLite**. Si mañana cambias de SQLite a PostgreSQL, solo cambias los adaptadores `driven/`. Si cambias de Express a Fastify, solo cambias los adaptadores `driving/`.

---

## OpenAPI + Swagger

- Definir schemas Zod para cada request/response.
- Usar una librería que genere la spec OpenAPI desde los schemas Zod (evita duplicar la definición).
- Servir Swagger UI en `/docs`.
- Cada ruta debe estar documentada con: descripción, parámetros, body, posibles respuestas (200, 400, 404, 409, etc.).

---

## Testing — Estrategia por capas

| Tipo | Qué testea | Cómo |
|---|---|---|
| **Unit tests** | Entidades, value objects, use cases | Mocks de los repositories (implementaciones falsas en memoria) |
| **Integration tests** | Repositories Drizzle | SQLite en memoria (`:memory:`) — no tocan disco |
| **E2E tests** | Rutas HTTP completas | Levanta el servidor con SQLite en memoria, hace requests reales |

La separación hexagonal facilita enormemente el testing: los use cases se testean en puro TypeScript, sin HTTP ni base de datos real.

---

## Auth con JWT

- `POST /auth/register` y `POST /auth/login` son las únicas rutas públicas.
- El middleware `authGuard` vive en `adapters/driving/http/middlewares/` — verifica el token, extrae el `userId`, y lo adjunta al request. El dominio nunca toca JWT.
- Los use cases reciben el `userId` del usuario autenticado como parámetro explícito (no lo leen de ningún contexto global). Esto los mantiene puros y fáciles de testear.
- El JWT_SECRET se lee desde `infrastructure/config/env.ts` — nunca hardcodeado.
- Expiración recomendada para aprendizaje: `1h`.

**Flujo de autorización en hexagonal:**
```
Request → authGuard (verifica JWT, extrae userId)
              ↓
         Controller (pasa userId al use case)
              ↓
         Use Case (aplica regla: ¿este userId tiene permiso?)
```

---

## Structured Logging con Pino

- Crear una instancia Pino en `infrastructure/logger.ts` y exportarla como singleton.
- Los **adaptadores** (controllers, middlewares, repositories) pueden importar el logger.
- Los **use cases y entidades** NO loggean — son lógica pura. El logging es una preocupación de infraestructura.
- Niveles a usar: `error` (fallas inesperadas), `warn` (situaciones anómalas no fatales), `info` (eventos de negocio: "user registered", "task status updated"), `debug` (detalles para desarrollo).
- En tests configurar el nivel en `silent` para no ensuciar la salida.
- El logger debe incluir contexto estructurado: `{ userId, projectId, action }` — no strings concatenados.

---

## Validación de Variables de Entorno

Crear `infrastructure/config/env.ts` con un schema Zod que parsea `process.env` al iniciar la app. Si falta una variable requerida o tiene un valor inválido, la app lanza un error claro y **no arranca**.

Variables mínimas del proyecto:

| Variable | Tipo | Descripción |
|---|---|---|
| `PORT` | number (default 3000) | Puerto del servidor |
| `NODE_ENV` | `development` \| `production` \| `test` | Ambiente |
| `JWT_SECRET` | string (min 32 chars) | Secreto para firmar tokens |
| `DATABASE_PATH` | string | Ruta al archivo SQLite (ej: `./data/taskflow.db`) |
| `LOG_LEVEL` | `error`\|`warn`\|`info`\|`debug` (default `info`) | Nivel de logging |

El resto del código importa estas variables desde `env.ts` — nunca accede a `process.env` directamente.

---

## Formato de Error Consistente

Basado en **RFC 7807 — Problem Details for HTTP APIs**. Todas las respuestas de error tienen esta forma:

```json
{
  "type": "https://taskflow.api/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Task with id 'abc-123' does not exist"
}
```

- `type` — URI que identifica el tipo de error (puede ser relativo al dominio del proyecto).
- `title` — descripción corta del tipo de error (no cambia entre instancias del mismo error).
- `status` — código HTTP.
- `detail` — descripción específica de esta instancia del error.

**Mapeo de errores de dominio → HTTP** (vive en `errorHandler.ts`, no en el dominio):

| Error de dominio | HTTP Status |
|---|---|
| `NotFoundError` | 404 |
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `ConflictError` | 409 (ej: email duplicado) |
| Error no reconocido | 500 |

---

## Convenciones del proyecto

- TypeScript strict: `strict: true`, sin `any` implícito.
- Errores de dominio explícitos: clases que extienden `DomainError`, no strings sueltos.
- Repositories son interfaces en el dominio; las implementaciones Drizzle no conocen los use cases.
- No hay lógica de negocio en los controllers — solo transforman HTTP ↔ domain.
- Los schemas Zod sirven como fuente única de verdad para validación Y documentación OpenAPI.
- Archivos nombrados en `PascalCase` para clases/entidades, `camelCase` para funciones/módulos.

---

## Orden de desarrollo sugerido

1. Configuración base (tsconfig strict, estructura de carpetas, package.json)
2. `infrastructure/config/env.ts` — validación de entorno con Zod (lo primero que corre al iniciar)
3. `infrastructure/logger.ts` — instancia Pino singleton
4. Dominio puro: entidades, value objects, errores de dominio, ports (interfaces)
5. Use cases con repositories en memoria (sin base de datos aún)
6. Unit tests de use cases
7. Implementación Drizzle: schema SQLite, migrations, repositories
8. Integration tests de repositories con SQLite `:memory:`
9. Adaptadores HTTP: controllers, routes, schemas Zod, `errorHandler.ts`
10. Auth: `LoginUser` use case + `authGuard` middleware
11. Wiring en `container.ts`
12. OpenAPI: conectar schemas Zod con la spec, servir Swagger UI en `/docs`
13. E2E tests de rutas (incluidas rutas protegidas con JWT)
