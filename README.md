# TaskFlow API

REST API para gestión de tareas y proyectos en equipo. Permite organizar el trabajo en proyectos, crear tareas con prioridades y estados, asignarlas a miembros del equipo y agregar comentarios.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript strict |
| Framework HTTP | Fastify 5 |
| ORM | Drizzle ORM |
| Base de datos | SQLite (`better-sqlite3`) |
| Validación | Zod 4 |
| Autenticación | JWT (`jsonwebtoken`) |
| Hashing | bcryptjs |
| Logging | Pino |
| Documentación | OpenAPI 3.0 + Swagger UI (`@asteasolutions/zod-to-openapi`) |
| Testing | Vitest |

## Arquitectura

El proyecto sigue **Arquitectura Hexagonal (Ports & Adapters)**. El dominio (entidades, use cases, puertos) no tiene dependencias de infraestructura. Los adaptadores HTTP y de persistencia se conectan al dominio a través de interfaces.

```
src/
├── domain/
│   ├── entities/          # User, Project, Task, Comment
│   ├── value-objects/     # TaskStatus, Priority, ProjectStatus, UserRole
│   ├── ports/             # Interfaces de repositorios y use cases
│   ├── use-cases/         # Lógica de aplicación
│   └── errors/            # DomainError, NotFoundError, ValidationError, etc.
├── adapters/
│   ├── driving/http/      # Controllers, routes, schemas Zod, middlewares
│   └── driven/
│       ├── persistence/   # Repositorios Drizzle + migraciones
│       └── security/      # JwtService, BcryptPasswordHasher
└── infrastructure/
    ├── config/env.ts      # Validación de variables de entorno con Zod
    ├── container.ts       # Wiring de dependencias
    ├── server.ts          # Configuración de Fastify
    └── logger.ts          # Instancia Pino singleton
```

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3003
NODE_ENV=development
JWT_SECRET=your-super-secret-key-minimum-32-characters
DATABASE_PATH=./data/taskflow.db
LOG_LEVEL=info
```

| Variable | Tipo | Descripción |
|---|---|---|
| `PORT` | number | Puerto del servidor (default: 3003) |
| `NODE_ENV` | `development` \| `production` \| `test` | Entorno de ejecución |
| `JWT_SECRET` | string (min 32 chars) | Secreto para firmar tokens JWT |
| `DATABASE_PATH` | string | Ruta al archivo SQLite |
| `LOG_LEVEL` | `error` \| `warn` \| `info` \| `debug` \| `silent` | Nivel de logging |

## Base de datos

```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Poblar con datos de prueba
npm run seed
```

## Desarrollo

```bash
npm run dev
```

El servidor inicia en `http://localhost:3003`. La documentación Swagger UI está disponible en `http://localhost:3003/docs`.

## Producción

```bash
npm run build
npm start
```

## Tests

```bash
# Modo watch
npm test

# Ejecución única con cobertura
npm run test:coverage
```

El proyecto tiene tres niveles de tests:

| Tipo | Qué cubre |
|---|---|
| Unit | Entidades, value objects, use cases (repositorios en memoria) |
| Integration | Repositorios Drizzle con SQLite `:memory:` |
| E2E | Rutas HTTP completas con Fastify `inject()` y SQLite `:memory:` |

---

## Endpoints

Todos los endpoints excepto `/auth/register` y `/auth/login` requieren autenticación mediante header:

```
Authorization: Bearer <token>
```

Las respuestas de error siguen el formato **RFC 7807**:

```json
{
  "type": "https://taskflow.api/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Task with id 'abc-123' does not exist"
}
```

---

### Auth

#### `POST /auth/register`

Registra un nuevo usuario.

**Body**
```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "securepassword"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `201` | Usuario registrado |
| `400` | Body inválido |
| `409` | El email ya está registrado |

---

#### `POST /auth/login`

Autentica un usuario y devuelve un token JWT.

**Body**
```json
{
  "email": "juan@example.com",
  "password": "securepassword"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Token JWT |
| `400` | Body inválido |
| `401` | Credenciales incorrectas |

---

### Users

#### `GET /users/list`

Lista todos los usuarios registrados. Solo accesible por usuarios con rol `ADMIN`.

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Array de usuarios |
| `401` | Token inválido o expirado |
| `403` | El usuario no tiene rol ADMIN |

---

#### `GET /users/:id`

Obtiene un usuario por su ID.

**Parámetros**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | UUID | ID del usuario |

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Usuario encontrado |
| `400` | ID con formato inválido |
| `401` | Token inválido o expirado |
| `404` | Usuario no encontrado |

---

### Projects

#### `POST /projects`

Crea un nuevo proyecto. El usuario autenticado se convierte automáticamente en el owner.

**Body**
```json
{
  "name": "Nombre del proyecto",
  "description": "Descripción del proyecto"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `201` | Proyecto creado |
| `400` | Body inválido |
| `401` | Token inválido o expirado |

---

#### `GET /projects`

Lista todos los proyectos. Permite filtrar por estado.

**Query params**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `status` | `ACTIVE` \| `ARCHIVED` | Filtra por estado (opcional) |

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Array de proyectos |
| `401` | Token inválido o expirado |

---

#### `GET /projects/:id`

Obtiene un proyecto por su ID.

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Proyecto encontrado |
| `400` | ID con formato inválido |
| `401` | Token inválido o expirado |
| `404` | Proyecto no encontrado |

---

#### `PATCH /projects/:id/archive`

Archiva un proyecto. Solo el owner puede realizar esta acción. Un proyecto archivado no puede reactivarse.

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Proyecto archivado |
| `401` | Token inválido o expirado |
| `403` | El usuario no es el owner del proyecto |
| `404` | Proyecto no encontrado |

---

### Tasks

#### `POST /tasks`

Crea una nueva tarea. El proyecto debe estar en estado `ACTIVE`.

**Body**
```json
{
  "title": "Título de la tarea",
  "description": "Descripción",
  "projectId": "uuid-del-proyecto",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "dueDate": "2026-12-31T00:00:00.000Z"
}
```

`dueDate` es opcional. No puede ser una fecha en el pasado.

**Respuestas**
| Status | Descripción |
|---|---|
| `201` | Tarea creada |
| `400` | Body inválido o proyecto archivado |
| `401` | Token inválido o expirado |
| `404` | Proyecto no encontrado |

---

#### `GET /tasks`

Lista tareas. Requiere `projectId` como filtro obligatorio.

**Query params**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `projectId` | UUID | ID del proyecto (obligatorio) |
| `status` | `TODO` \| `IN_PROGRESS` \| `REVIEW` \| `DONE` | Filtra por estado (opcional) |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` | Filtra por prioridad (opcional) |
| `assigneeId` | UUID | Filtra por usuario asignado (opcional) |

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Array de tareas |
| `400` | Parámetros inválidos |
| `401` | Token inválido o expirado |

---

#### `GET /tasks/:id`

Obtiene una tarea por su ID.

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Tarea encontrada |
| `400` | ID con formato inválido |
| `401` | Token inválido o expirado |
| `404` | Tarea no encontrada |

---

#### `PATCH /tasks/:id`

Actualiza el estado de una tarea. Las transiciones válidas son:

```
TODO → IN_PROGRESS → REVIEW → DONE
                 ↑       ↓
              REVIEW → IN_PROGRESS
```

No se puede saltar estados ni retroceder desde `DONE`.

**Body**
```json
{
  "status": "IN_PROGRESS"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Tarea actualizada |
| `400` | Transición de estado inválida |
| `401` | Token inválido o expirado |
| `404` | Tarea no encontrada |

---

#### `PATCH /tasks/:id/assign`

Asigna un usuario a una tarea.

**Body**
```json
{
  "userId": "uuid-del-usuario"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `200` | Tarea asignada |
| `401` | Token inválido o expirado |
| `404` | Tarea no encontrada |

---

### Comments

#### `POST /comments`

Agrega un comentario a una tarea. El autor es el usuario autenticado.

**Body**
```json
{
  "content": "Contenido del comentario",
  "taskId": "uuid-de-la-tarea"
}
```

**Respuestas**
| Status | Descripción |
|---|---|
| `201` | Comentario creado |
| `400` | Body inválido |
| `401` | Token inválido o expirado |

---

#### `DELETE /comments/:id`

Elimina un comentario. Un usuario solo puede eliminar sus propios comentarios. Los usuarios con rol `ADMIN` pueden eliminar cualquier comentario.

**Respuestas**
| Status | Descripción |
|---|---|
| `204` | Comentario eliminado |
| `401` | Token inválido o expirado |
| `403` | El comentario no pertenece al usuario |
| `404` | Comentario no encontrado |
