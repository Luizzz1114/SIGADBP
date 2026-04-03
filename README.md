# SIGADBP — Sistema Integral de Gestion Administrativa de Bienes Publicos

Sistema web para la gestion integral de bienes publicos, personal, presupuestos y operaciones administrativas. Incluye panel de control con metricas en tiempo real, indicadores de gestion (KPIs) y notificaciones via WebSocket.

---

## Tabla de Contenidos

- [Tecnologias](#tecnologias)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Base de Datos](#base-de-datos)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [API REST — Endpoints](#api-rest--endpoints)
- [WebSockets](#websockets)
- [Modulos del Sistema](#modulos-del-sistema)
- [Roles de Usuario](#roles-de-usuario)
- [Tareas Programadas (Cron Jobs)](#tareas-programadas-cron-jobs)
- [Scripts Disponibles](#scripts-disponibles)

---

## Tecnologias

### Backend
| Tecnologia | Version | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.x | Framework HTTP |
| PostgreSQL | 14+ | Base de datos relacional |
| Socket.io | 4.x | Comunicacion en tiempo real |
| JWT | 9.x | Autenticacion por tokens |
| bcrypt | 6.x | Hashing de contrasenas |
| node-cron | 4.x | Tareas programadas |
| dotenv | 17.x | Variables de entorno |
| nodemon | 3.x | Recarga automatica (dev) |

### Frontend
| Tecnologia | Version | Uso |
|---|---|---|
| Vue 3 | 3.5.x | Framework SPA reactivo |
| Vite | 7.x | Bundler y servidor de desarrollo |
| Vue Router | 4.x | Navegacion SPA |
| PrimeVue | 4.x | Libreria de componentes UI |
| TailwindCSS | 4.x | Framework de estilos utilitarios |
| Axios | 1.x | Cliente HTTP |
| Socket.io Client | 4.x | Cliente WebSocket |
| Zod | 4.x | Validacion de formularios |
| NProgress | 0.2.x | Barra de progreso de carga |

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura de **capas** (Controller - Service - Repository) en el backend y una estructura modular en el frontend.

```
SIGADBP/
├── client/                          # Frontend (Vue 3 + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Configuracion de Axios y Socket.io
│   │   │   ├── axios.js             # Instancia de Axios con interceptores
│   │   │   └── socket.js            # Conexion WebSocket
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── Cargos/
│   │   │   ├── Dependencias/
│   │   │   ├── Desincorporaciones/
│   │   │   ├── Graficos/            # Componentes de graficos (Area, Bar, Donut, etc.)
│   │   │   ├── Incorporaciones/
│   │   │   ├── InventarioBienes/
│   │   │   ├── Mantenimientos/
│   │   │   ├── Movimientos/
│   │   │   ├── PanelControl/        # Widgets del dashboard
│   │   │   ├── Personal/
│   │   │   ├── Presupuestos/
│   │   │   ├── Usuarios/
│   │   │   ├── Breadcrumbs.vue
│   │   │   ├── Card.vue
│   │   │   ├── Cell.vue
│   │   │   ├── Cronometro.vue
│   │   │   ├── CustomTag.vue
│   │   │   ├── DialogDelete.vue
│   │   │   ├── Header.vue
│   │   │   ├── MiniCard.vue
│   │   │   ├── MoneyCard.vue
│   │   │   ├── MoneyInput.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Table.vue
│   │   ├── layout/                  # Layouts de pagina
│   │   │   ├── LoginLayout.vue
│   │   │   └── MainLayout.vue
│   │   ├── plugins/
│   │   │   └── primevue.js          # Configuracion de PrimeVue
│   │   ├── router/
│   │   │   └── index.js             # Definicion de rutas y guards
│   │   ├── services/                # Servicios HTTP (1 por modulo)
│   │   ├── utils/                   # Utilidades, schemas Zod, formatters
│   │   ├── views/                   # Vistas principales
│   │   │   ├── KPIs/                # Vistas de indicadores por modulo
│   │   │   ├── Login/
│   │   │   └── *.vue                # Vistas CRUD de cada modulo
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend (Express 5 + PostgreSQL)
│   ├── src/
│   │   ├── config/
│   │   │   ├── bd.sql               # Script DDL (tablas, triggers, vistas, datos)
│   │   │   └── database.js          # Conexion y auto-inicializacion de BD
│   │   ├── controllers/             # Controladores HTTP (1 por modulo)
│   │   ├── jobs/
│   │   │   └── scheduler.js         # Tareas cron programadas
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js    # Verificacion JWT (HTTP y Socket.io)
│   │   ├── repositories/            # Capa de acceso a datos (queries SQL)
│   │   ├── routes/                  # Definicion de rutas Express
│   │   ├── services/                # Logica de negocio
│   │   └── index.js                 # Punto de entrada del servidor
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Requisitos Previos

Asegurate de tener instalado:

- **Node.js** >= 18.x — [Descargar](https://nodejs.org/)
- **npm** >= 9.x (viene con Node.js)
- **PostgreSQL** >= 14.x — [Descargar](https://www.postgresql.org/download/)

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/Luizzz1114/SIGADBP.git
cd SIGADBP
```

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../client
npm install
```

---

## Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` con las siguientes variables:

```env
# Base de datos PostgreSQL
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=sigadbp
PG_PASSWORD=tu_contrasena
PG_PORT=5432

# Servidor
PORT=3000

# JWT
JWT_SECRET=tu_clave_secreta_segura
```

Crea un archivo `.env` en la carpeta `client/` (o usa `.env.local`) con:

```env
# URL del API backend
VITE_API_URL=http://localhost:3000/api-sigadbp

# URL del servidor WebSocket
VITE_SOCKET_URL=http://localhost:3000
```

---

## Ejecucion

### Modo desarrollo

**Backend** (con recarga automatica via Nodemon):
```bash
cd server
npm run dev
```
El servidor estara disponible en `http://localhost:3000/api-sigadbp`

**Frontend** (con Vite HMR):
```bash
cd client
npm run dev
```
El frontend estara disponible en `http://localhost:5173`

### Modo produccion

**Backend:**
```bash
cd server
npm start
```

**Frontend** (generar build):
```bash
cd client
npm run build
npm run preview
```

---

## Base de Datos

La base de datos se **inicializa automaticamente** al arrancar el servidor por primera vez:

1. El servidor verifica si la base de datos definida en `PG_DATABASE` existe.
2. Si no existe, la crea automaticamente.
3. Ejecuta el script `server/src/config/bd.sql` que contiene:
   - Creacion de todas las tablas
   - Triggers para sincronizacion de estatus
   - Vistas SQL para consultas complejas
   - Datos iniciales (estados, municipios, parroquias, cargos, indicadores)

> **Nota:** El usuario de PostgreSQL (`PG_USER`) debe tener permisos para crear bases de datos.

---

## Estructura de la Base de Datos

El sistema utiliza **18 tablas** organizadas en 9 dominios:

### 1. Geografia
| Tabla | Descripcion |
|---|---|
| `Estados` | Estados de Venezuela |
| `Municipios` | Municipios (FK a Estados) |
| `Parroquias` | Parroquias (FK a Municipios) |

### 2. Organizacion y Personal
| Tabla | Descripcion |
|---|---|
| `Dependencias` | Departamentos/oficinas de la organizacion |
| `Cargos` | Cargos laborales con tipo |
| `Personal` | Empleados con datos personales |
| `HistorialCargos` | Historial de asignaciones cargo-dependencia |
| `Usuarios` | Cuentas de acceso al sistema |

### 3. Finanzas y Bienes
| Tabla | Descripcion |
|---|---|
| `Presupuestos` | Partidas presupuestarias por semestre |
| `Incorporaciones` | Registros de entrada de bienes |
| `Bienes` | Inventario de bienes nacionales |

### 4. Especializaciones de Bienes
| Tabla | Descripcion |
|---|---|
| `Muebles` | Datos especificos de mobiliario |
| `Tecnologicos` | Datos de equipos tecnologicos (serial, specs) |
| `Vehiculos` | Datos de vehiculos (placa, serial carroceria) |

### 5. Mantenimiento
| Tabla | Descripcion |
|---|---|
| `Mantenimientos` | Registros de mantenimiento de bienes |
| `Gastos` | Gastos asociados a mantenimiento/bienes |

### 6. Movimientos y Desincorporaciones
| Tabla | Descripcion |
|---|---|
| `Movimientos` | Transferencias de bienes entre dependencias |
| `DetallesMovimientos` | Bienes incluidos en cada movimiento |
| `Desincorporaciones` | Retiro de bienes del inventario |
| `DetallesDesincorporacion` | Bienes desincorporados con tipo |

### 7. Evaluaciones e Indicadores
| Tabla | Descripcion |
|---|---|
| `Evaluaciones` | Evaluaciones del personal |
| `Indicadores` | Definicion de KPIs |
| `Metricas` | Valores historicos de cada indicador |

### Triggers Automaticos
- **`tr_mantenimiento_sincronizar_estatus`**: Actualiza el estatus del bien cuando un mantenimiento cambia de estado.
- **`tr_mantenimiento_eliminar`**: Revierte el estatus del bien al eliminar un mantenimiento en proceso.

---

## API REST — Endpoints

Base URL: `/api-sigadbp`

### Autenticacion
| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| `POST` | `/usuarios/login` | Iniciar sesion | No |
| `POST` | `/usuarios/recuperar-contrasena` | Recuperar contrasena por pregunta de seguridad | No |
| `PUT` | `/usuarios/cambiar-contrasena` | Cambiar contrasena (con token de recuperacion) | Si |

### Usuarios
| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| `GET` | `/usuarios` | Listar usuarios | Si |
| `POST` | `/usuarios` | Crear usuario | Si |
| `PUT` | `/usuarios` | Actualizar usuario | Si |
| `POST` | `/usuarios/username-correo` | Validar username/correo unicos | Si |

### Bienes
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/bienes` | Listar todos los bienes |
| `GET` | `/bienes/:id` | Obtener bien por ID |
| `POST` | `/bienes` | Registrar nuevo bien |
| `PUT` | `/bienes` | Actualizar bien |
| `DELETE` | `/bienes/:id` | Eliminar bien |
| `GET` | `/bienes/operativos` | Listar bienes operativos |
| `GET` | `/bienes/no-asignados` | Listar bienes sin asignar |
| `POST` | `/bienes/validar-numero` | Validar numero de bien unico |
| `GET` | `/bienes/metricas/resumen` | Resumen general de metricas |
| `GET` | `/bienes/metricas/categorias` | Metricas por categoria |
| `GET` | `/bienes/metricas/estatus` | Metricas por estatus |
| `GET` | `/bienes/metricas/dependencias` | Metricas por dependencia |
| `GET` | `/bienes/metricas/no-identificados` | Bienes no identificados |
| `GET` | `/bienes/metricas/disponibilidad-dependencia` | Disponibilidad por dependencia |

### Personal
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/personal` | Listar personal |
| `GET` | `/personal/:id` | Obtener por ID |
| `POST` | `/personal` | Registrar personal |
| `PUT` | `/personal` | Actualizar personal |
| `DELETE` | `/personal/:id` | Eliminar personal |
| `GET` | `/personal/sin-usuario` | Personal sin cuenta de usuario |
| `POST` | `/personal/validar-cedula` | Validar cedula unica |

### Dependencias
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/dependencias` | Listar dependencias |
| `GET` | `/dependencias/:id` | Obtener por ID |
| `POST` | `/dependencias` | Crear dependencia |
| `PUT` | `/dependencias` | Actualizar dependencia |
| `DELETE` | `/dependencias/:id` | Eliminar dependencia |
| `GET` | `/dependencias/responsables` | Listar responsables |
| `POST` | `/dependencias/validar-nombre` | Validar nombre unico |

### Cargos
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/cargos` | Listar cargos |
| `GET` | `/cargos/:id` | Obtener por ID |
| `POST` | `/cargos` | Crear cargo |
| `PUT` | `/cargos` | Actualizar cargo |
| `DELETE` | `/cargos/:id` | Eliminar cargo |
| `POST` | `/cargos/validar-nombre` | Validar nombre unico |

### Presupuestos
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/presupuestos` | Listar presupuestos |
| `GET` | `/presupuestos/:id` | Obtener por ID |
| `POST` | `/presupuestos` | Crear presupuesto |
| `PUT` | `/presupuestos` | Actualizar presupuesto |
| `DELETE` | `/presupuestos/:id` | Eliminar presupuesto |
| `GET` | `/presupuestos/activos` | Listar activos |
| `GET` | `/presupuestos/activos-mantenimiento` | Activos para mantenimiento |
| `POST` | `/presupuestos/validar-codigo` | Validar codigo unico |
| `GET` | `/presupuestos/metricas/resumen` | Resumen de metricas |

### Incorporaciones
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/incorporaciones` | Listar incorporaciones |
| `GET` | `/incorporaciones/:id` | Obtener por ID |
| `POST` | `/incorporaciones` | Crear incorporacion |
| `PUT` | `/incorporaciones` | Actualizar incorporacion |
| `DELETE` | `/incorporaciones/:id` | Eliminar incorporacion |

### Desincorporaciones
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/desincorporaciones` | Listar desincorporaciones |
| `GET` | `/desincorporaciones/:id` | Obtener por ID |
| `POST` | `/desincorporaciones` | Crear desincorporacion |
| `PUT` | `/desincorporaciones` | Actualizar desincorporacion |
| `DELETE` | `/desincorporaciones/:id` | Eliminar desincorporacion |

### Movimientos
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/movimientos` | Listar movimientos |
| `GET` | `/movimientos/:id` | Obtener por ID |
| `POST` | `/movimientos` | Crear movimiento |
| `PUT` | `/movimientos` | Actualizar movimiento |
| `DELETE` | `/movimientos/:id` | Eliminar movimiento |

### Mantenimientos
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/mantenimientos` | Listar mantenimientos |
| `GET` | `/mantenimientos/:id` | Obtener por ID |
| `POST` | `/mantenimientos` | Crear mantenimiento |
| `PUT` | `/mantenimientos` | Actualizar mantenimiento |
| `DELETE` | `/mantenimientos/:id` | Eliminar mantenimiento |

### Evaluaciones
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/evaluaciones` | Listar evaluaciones |
| `POST` | `/evaluaciones` | Crear evaluacion |
| `PUT` | `/evaluaciones` | Actualizar evaluacion |
| `DELETE` | `/evaluaciones/:id` | Eliminar evaluacion |

### Indicadores / Metricas
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/metricas` | Listar indicadores |
| `GET` | `/metricas/:id` | Obtener indicador con historico |

### Ubicacion (Geografia)
| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/ubicacion/estados` | Listar estados |
| `GET` | `/ubicacion/municipios/:idEstado` | Municipios por estado |
| `GET` | `/ubicacion/parroquias/:idMunicipio` | Parroquias por municipio |

---

## WebSockets

El sistema utiliza Socket.io para comunicacion en tiempo real:

- **Autenticacion**: Los clientes se conectan enviando el token JWT en `socket.auth.token`. El servidor valida el token con el middleware `verificarTokenSocket`.
- **Evento `sesion_forzada`**: Permite al servidor expulsar sesiones activas (ej. al actualizar un usuario o cambiar su contrasena).
- **Salas**: Cada usuario se une automaticamente a la sala `sala_usuario_{id}` para recibir notificaciones personalizadas.

---

## Modulos del Sistema

| Modulo | Descripcion | KPIs |
|---|---|---|
| **Panel de Control** | Dashboard con resumen general, graficos de estatus, categorias y distribucion por dependencia | - |
| **Inventario de Bienes** | CRUD de bienes nacionales (muebles, tecnologicos, vehiculos) con categorias y estatus | Si |
| **Incorporaciones** | Registro de entradas de bienes con orden de compra, factura y proveedor | - |
| **Desincorporaciones** | Retiro de bienes del inventario con tipo y responsable | Si |
| **Movimientos** | Transferencias de bienes entre dependencias con cedente y receptor | - |
| **Mantenimiento** | Gestion de mantenimientos con seguimiento de estatus, gastos y presupuesto | Si |
| **Presupuestos** | Partidas presupuestarias por semestre con control de gastos y disponibilidad | Si |
| **Dependencias** | Gestion de dependencias/oficinas con ubicacion geografica | - |
| **Cargos** | Catalogo de cargos laborales | - |
| **Personal** | Gestion de empleados con historial de cargos, evaluaciones y bienes asignados | Si |
| **Usuarios** | Administracion de cuentas de acceso con roles y preguntas de seguridad | - |

---

## Roles de Usuario

El sistema maneja 3 roles con diferentes niveles de acceso:

| Rol | Acceso |
|---|---|
| **Administrador** | Acceso completo a todos los modulos, incluyendo presupuestos, dependencias, cargos, personal y usuarios |
| **Supervisor** | Acceso a inventario, incorporaciones, desincorporaciones, movimientos, mantenimiento y sus estadisticas |
| **Operador** | Acceso basico a inventario, incorporaciones y mantenimiento |

> El control de acceso por roles se aplica actualmente en el frontend a traves del router guard.

---

## Tareas Programadas (Cron Jobs)

El sistema ejecuta tareas automaticas mediante `node-cron`:

### Diaria (23:59 — Zona horaria: America/Caracas)
Se ejecuta la noche previa al primer dia de cada mes:
- **IAOM**: Indicador de Antiguedad Operativa Mensual

### Semestral (30 de mayo y 30 de noviembre)
Se calculan los siguientes indicadores de gestion:
- **IIET**: Indice de Inversion en Equipos Tecnologicos
- **IIM**: Indice de Inversion en Mantenimiento
- **IIMB**: Indice de Inversion en Mobiliario
- **ICP**: Indice de Capacitacion del Personal
- **IPS**: Indice de Productividad Semestral

Adicionalmente, se desactivan automaticamente los presupuestos del semestre correspondiente.

---

## Scripts Disponibles

### Backend (`server/`)
| Comando | Descripcion |
|---|---|
| `npm run dev` | Inicia el servidor con Nodemon (recarga automatica) |
| `npm start` | Inicia el servidor en modo produccion |

### Frontend (`client/`)
| Comando | Descripcion |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite con HMR |
| `npm run build` | Genera el build de produccion en `dist/` |
| `npm run preview` | Previsualiza el build de produccion |

---

## Licencia

Este proyecto es de uso privado.
