<h1 align="center">SIGADBP</h1>
<h3 align="center">Sistema Integral de Gestión Administrativa de Bienes Públicos</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Socket.io-4.x-010101?logo=socketdotio&logoColor=white" alt="Socket.io" />
</p>

<p align="center">
  Plataforma web para la gestión integral de bienes nacionales, personal, presupuestos y operaciones administrativas de <strong>Mercal — Estado Sucre</strong>. Incluye panel de control con métricas en tiempo real, indicadores clave de gestión (KPIs) con cálculo automatizado, y notificaciones vía WebSocket.
</p>

---

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución](#ejecución)
- [Base de Datos](#base-de-datos)
- [Modelo de Datos](#modelo-de-datos)
- [API REST — Referencia de Endpoints](#api-rest--referencia-de-endpoints)
- [WebSockets](#websockets)
- [Módulos del Sistema](#módulos-del-sistema)
- [Roles y Permisos](#roles-y-permisos)
- [Tareas Programadas (Cron Jobs)](#tareas-programadas-cron-jobs)
- [Indicadores de Gestión (KPIs)](#indicadores-de-gestión-kpis)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue en Producción](#despliegue-en-producción)

---

## Características Principales

- **Panel de control interactivo** con resumen general, gráficos de estatus, distribución por categoría y por dependencia.
- **Gestión completa de bienes nacionales** — registro, clasificación (muebles, tecnológicos, vehículos), asignación a personal y dependencias, y seguimiento de estatus.
- **Incorporaciones y desincorporaciones** — control de entrada y salida de bienes con documentación (orden de compra, factura, proveedor).
- **Movimientos entre dependencias** — transferencias de bienes con registro de cedente, receptor, origen y destino.
- **Mantenimiento de bienes** — seguimiento de mantenimientos con duración, gastos asociados y vinculación a presupuestos.
- **Presupuestos semestrales** — partidas presupuestarias con control de gastos, disponibilidad y desactivación automática al cierre del semestre.
- **Gestión de personal** — datos personales, historial de cargos, antigüedad, evaluaciones de capacitación y satisfacción.
- **Indicadores de gestión (KPIs)** — cálculo automatizado mensual y semestral con historial de métricas y visualización gráfica.
- **Autenticación JWT** con recuperación de contraseña por pregunta de seguridad y cronómetro de expiración.
- **Notificaciones en tiempo real** vía WebSocket (Socket.io) — expulsión de sesión, alertas del sistema.
- **Modo oscuro** con persistencia en localStorage.
- **Interfaz responsive** — funcional en escritorio y dispositivos móviles con sidebar colapsable.
- **Validación de formularios** con Zod en el frontend.
- **Auto-inicialización de base de datos** — el sistema crea y configura la BD automáticamente en el primer arranque.

---

## Tecnologías

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Entorno de ejecución JavaScript |
| [Express](https://expressjs.com/) | 5.x | Framework web HTTP |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | Base de datos relacional |
| [Socket.io](https://socket.io/) | 4.x | Comunicación bidireccional en tiempo real |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.x | Generación y verificación de tokens JWT |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | 6.x | Hashing seguro de contraseñas |
| [node-cron](https://github.com/node-cron/node-cron) | 4.x | Programación de tareas periódicas |
| [pg](https://node-postgres.com/) | 8.x | Cliente PostgreSQL para Node.js |
| [cors](https://github.com/expressjs/cors) | 2.x | Manejo de Cross-Origin Resource Sharing |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | 1.x | Parseo de cookies HTTP |
| [dotenv](https://github.com/motdotla/dotenv) | 17.x | Carga de variables de entorno |
| [nodemon](https://nodemon.io/) | 3.x | Recarga automática en desarrollo |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Vue 3](https://vuejs.org/) | 3.5.x | Framework SPA con Composition API |
| [Vite](https://vite.dev/) | 7.x | Bundler ultrarrápido y servidor de desarrollo |
| [Vue Router](https://router.vuejs.org/) | 4.x | Enrutamiento SPA con guards de navegación |
| [PrimeVue](https://primevue.org/) | 4.x | Librería de componentes UI (tablas, formularios, diálogos) |
| [TailwindCSS](https://tailwindcss.com/) | 4.x | Framework de estilos utilitarios |
| [Axios](https://axios-http.com/) | 1.x | Cliente HTTP con interceptores |
| [Socket.io Client](https://socket.io/docs/v4/client-api/) | 4.x | Cliente WebSocket |
| [Zod](https://zod.dev/) | 4.x | Validación y tipado de esquemas |
| [NProgress](https://ricostacruz.com/nprogress/) | 0.2.x | Barra de progreso de carga HTTP |

---

## Arquitectura del Proyecto

El backend sigue una arquitectura en **3 capas** (Controller → Service → Repository) con separación clara de responsabilidades. El frontend usa una estructura modular con componentes, servicios, vistas y utilidades.

```
SIGADBP/
│
├── client/                              # Frontend — Vue 3 + Vite
│   ├── src/
│   │   ├── api/                         # Capa de comunicación
│   │   │   ├── axios.js                 # Instancia Axios con interceptores (auth, errores, NProgress)
│   │   │   └── socket.js               # Conexión Socket.io con listeners globales
│   │   │
│   │   ├── components/                  # Componentes reutilizables por módulo
│   │   │   ├── Cargos/                  # CargoEdit, CargoRegister
│   │   │   ├── Dependencias/            # DependenciaEdit, DependenciaRegister, DependenciaView
│   │   │   ├── Desincorporaciones/      # DesincorporacionEdit, DesincorporacionRegister, DesincorporacionView
│   │   │   ├── Graficos/               # AreaChart, BarChart, DonutChart, HorizontalBarChart,
│   │   │   │                            # MultiBarChart, StackedBarChart, DistributionBar
│   │   │   ├── Incorporaciones/         # IncorporacionEdit, IncorporacionRegister, IncorporacionView
│   │   │   ├── InventarioBienes/        # BienesEdit, BienesRegister, BienesView
│   │   │   ├── Mantenimientos/          # MantenimientoEdit, MantenimientoRegister, MantenimientoView
│   │   │   ├── Movimientos/             # MovimientoEdit, MovimientoRegister, MovimientoView
│   │   │   ├── PanelControl/            # BienesEstatus, BienesPorCategoria, BienesPorDependencia
│   │   │   ├── Personal/               # PersonalEdit, PersonalRegister, PersonalView, PersonalEncuesta
│   │   │   ├── Presupuestos/            # PresupuestoEdit, PresupuestoRegister, PresupuestoView, PresupuestosResumen
│   │   │   ├── Usuarios/               # UsuarioEdit, UsuarioRegister, UsuarioView, UsuarioProfile
│   │   │   ├── Breadcrumbs.vue          # Navegación de migas de pan
│   │   │   ├── Card.vue                 # Tarjeta de métrica del dashboard
│   │   │   ├── Cell.vue                 # Celda personalizada para tablas
│   │   │   ├── Cronometro.vue           # Temporizador para recuperación de contraseña
│   │   │   ├── CustomTag.vue            # Etiqueta de estatus con colores dinámicos
│   │   │   ├── DialogDelete.vue         # Diálogo de confirmación para eliminar registros
│   │   │   ├── Header.vue              # Barra superior con menú y perfil
│   │   │   ├── MiniCard.vue             # Tarjeta compacta de estadística
│   │   │   ├── MoneyCard.vue            # Tarjeta de monto monetario
│   │   │   ├── MoneyInput.vue           # Input formateado para montos
│   │   │   ├── Sidebar.vue              # Menú lateral colapsable con filtrado por rol
│   │   │   └── Table.vue               # Componente de tabla reutilizable
│   │   │
│   │   ├── layout/                      # Layouts de página
│   │   │   ├── LoginLayout.vue          # Layout para login y recuperación
│   │   │   └── MainLayout.vue           # Layout principal con sidebar, header y modo oscuro
│   │   │
│   │   ├── plugins/
│   │   │   └── primevue.js              # Configuración global de PrimeVue y tema
│   │   │
│   │   ├── router/
│   │   │   └── index.js                 # Rutas, guards de autenticación y autorización por rol
│   │   │
│   │   ├── services/                    # Servicios HTTP (1 archivo por módulo)
│   │   │   ├── bienes.services.js
│   │   │   ├── cargos.services.js
│   │   │   ├── dependencias.services.js
│   │   │   ├── desincorporaciones.services.js
│   │   │   ├── evaluaciones.services.js
│   │   │   ├── incorporaciones.services.js
│   │   │   ├── mantenimiento.services.js
│   │   │   ├── metricas.services.js
│   │   │   ├── movimientos.services.js
│   │   │   ├── personal.services.js
│   │   │   ├── presupuestos.services.js
│   │   │   ├── ubicacion.services.js
│   │   │   └── usuarios.services.js
│   │   │
│   │   ├── utils/                       # Utilidades, esquemas Zod, formateadores
│   │   │   ├── bienes.utils.js          # Columnas, opciones de formulario, esquemas
│   │   │   ├── cargos.utils.js
│   │   │   ├── dependencias.utils.js
│   │   │   ├── desincorporaciones.utils.js
│   │   │   ├── fetch.utils.js           # Utilidades de carga de datos
│   │   │   ├── formatters.js            # Formateadores de fecha, moneda, etc.
│   │   │   ├── graficos.formatter.js    # Formateadores para gráficos
│   │   │   ├── incorporaciones.utils.js
│   │   │   ├── login.utils.js           # Esquemas Zod de login y recuperación
│   │   │   ├── mantenimiento.utils.js
│   │   │   ├── movimientos.utils.js
│   │   │   ├── personal.utils.js
│   │   │   ├── presupuestos.utils.js
│   │   │   ├── useNotificaciones.js     # Composable para notificaciones toast
│   │   │   └── usuarios.utils.js
│   │   │
│   │   ├── views/                       # Vistas principales (1 por módulo)
│   │   │   ├── KPIs/                    # Vistas de indicadores de gestión
│   │   │   │   ├── BienesGeneralKPIs.vue
│   │   │   │   ├── BienesPorDependenciasKPIs.vue
│   │   │   │   ├── DesincorporacionesKPIs.vue
│   │   │   │   ├── InventarioBienesKPIs.vue
│   │   │   │   ├── MantenimientoKPIs.vue
│   │   │   │   ├── PersonalKPIs.vue
│   │   │   │   └── PresupuestosKPIs.vue
│   │   │   ├── Login/
│   │   │   │   ├── Login.vue
│   │   │   │   └── RecuperarContrasena.vue
│   │   │   ├── Cargos.vue
│   │   │   ├── Dependencias.vue
│   │   │   ├── Desincorporaciones.vue
│   │   │   ├── Incorporaciones.vue
│   │   │   ├── Inicio.vue               # Panel de control / Dashboard
│   │   │   ├── InventarioBienes.vue
│   │   │   ├── Mantenimiento.vue
│   │   │   ├── Movimientos.vue
│   │   │   ├── Personal.vue
│   │   │   ├── Presupuestos.vue
│   │   │   └── Usuarios.vue
│   │   │
│   │   ├── App.vue                      # Componente raíz
│   │   └── main.js                      # Punto de entrada de la aplicación
│   │
│   ├── package.json
│   └── vite.config.js                   # Configuración de Vite con plugins
│
├── server/                              # Backend — Express 5 + PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   │   ├── bd.sql                   # DDL completo: tablas, triggers, vistas, datos iniciales
│   │   │   └── database.js              # Conexión al pool y auto-inicialización de la BD
│   │   │
│   │   ├── controllers/                 # Capa de controladores (1 por entidad)
│   │   │   ├── bienesController.js
│   │   │   ├── cargosController.js
│   │   │   ├── dependenciasController.js
│   │   │   ├── desincorporacionesController.js
│   │   │   ├── evaluacionesController.js
│   │   │   ├── incorporacionesController.js
│   │   │   ├── indicadoresController.js
│   │   │   ├── mantenimientosController.js
│   │   │   ├── movimientosController.js
│   │   │   ├── personalController.js
│   │   │   ├── presupuestosController.js
│   │   │   ├── ubicacionController.js
│   │   │   └── usuariosController.js
│   │   │
│   │   ├── jobs/
│   │   │   └── scheduler.js             # Cron jobs: cálculo de KPIs y cierre de semestre
│   │   │
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js        # Verificación de JWT para HTTP y Socket.io
│   │   │
│   │   ├── repositories/               # Capa de acceso a datos (queries SQL parametrizados)
│   │   │   ├── bienesRepositorio.js
│   │   │   ├── cargosRepositorio.js
│   │   │   ├── dependenciasRepositorio.js
│   │   │   ├── desincorporacionesRepositorio.js
│   │   │   ├── evaluacionesRepositorio.js
│   │   │   ├── gastosRepositorio.js
│   │   │   ├── incorporacionesRepositorio.js
│   │   │   ├── indicadoresRepositorio.js
│   │   │   ├── mantenimientosRepositorio.js
│   │   │   ├── movimientosRepositorio.js
│   │   │   ├── mueblesRepositorio.js
│   │   │   ├── personalRepositorio.js
│   │   │   ├── presupuestosRepositorio.js
│   │   │   ├── tecnologicosRepositorio.js
│   │   │   ├── ubicacionRepositorio.js
│   │   │   ├── usuariosRepositorio.js
│   │   │   └── vehiculosRepositorio.js
│   │   │
│   │   ├── routes/                      # Definición de rutas Express
│   │   │   ├── index.js                 # Router principal — monta todos los sub-routers
│   │   │   ├── bienesRouter.js
│   │   │   ├── cargosRouter.js
│   │   │   ├── dependenciasRouter.js
│   │   │   ├── desincorporacionesRouter.js
│   │   │   ├── evaluacionesRouter.js
│   │   │   ├── incorporacionesRouter.js
│   │   │   ├── indicadoresRouter.js
│   │   │   ├── mantenimientosRouter.js
│   │   │   ├── movimientosRouter.js
│   │   │   ├── personalRouter.js
│   │   │   ├── presupuestosRouter.js
│   │   │   ├── ubicacionRouter.js
│   │   │   └── usuariosRouter.js
│   │   │
│   │   ├── services/                    # Capa de lógica de negocio
│   │   │   ├── bienesServices.js
│   │   │   ├── cargosService.js
│   │   │   ├── dependenciasService.js
│   │   │   ├── desincorporacionesService.js
│   │   │   ├── evaluacionesService.js
│   │   │   ├── incorporacionesService.js
│   │   │   ├── indicadoresServices.js   # Lógica de cálculo de todos los KPIs
│   │   │   ├── mantenimientosService.js
│   │   │   ├── movimientosService.js
│   │   │   ├── personalService.js
│   │   │   ├── presupuestosService.js
│   │   │   ├── ubicacionService.js
│   │   │   └── usuariosService.js
│   │   │
│   │   └── index.js                     # Punto de entrada: Express + Socket.io + Cron
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org/) |
| npm | 9.x | Incluido con Node.js |
| PostgreSQL | 14.x | [postgresql.org/download](https://www.postgresql.org/download/) |

> **Importante:** El usuario de PostgreSQL debe tener permisos para **crear bases de datos**, ya que el sistema se auto-inicializa al primer arranque.

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Luizzz1114/SIGADBP.git
cd SIGADBP
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurar variables de entorno

#### Backend — `server/.env`

Crea un archivo `.env` dentro de la carpeta `server/` con el siguiente contenido:

```env
# ── Base de datos PostgreSQL ──
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=sigadbp
PG_PASSWORD=tu_contraseña_de_postgres
PG_PORT=5432

# ── Servidor ──
PORT=3000

# ── Autenticación JWT ──
JWT_SECRET=una_clave_secreta_larga_y_segura
```

| Variable | Descripción |
|---|---|
| `PG_USER` | Usuario de PostgreSQL |
| `PG_HOST` | Host del servidor de base de datos |
| `PG_DATABASE` | Nombre de la base de datos (se crea automáticamente si no existe) |
| `PG_PASSWORD` | Contraseña del usuario de PostgreSQL |
| `PG_PORT` | Puerto de PostgreSQL (por defecto `5432`) |
| `PORT` | Puerto donde se ejecutará el servidor Express (por defecto `3000`) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT. Usa una cadena larga y aleatoria |

#### Frontend — `client/.env`

Crea un archivo `.env` (o `.env.local`) dentro de la carpeta `client/`:

```env
# ── Conexión al backend ──
VITE_API_URL=http://localhost:3000/api-sigadbp
VITE_SOCKET_URL=http://localhost:3000
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API REST del backend |
| `VITE_SOCKET_URL` | URL del servidor WebSocket |

---

## Ejecución

### Modo desarrollo

Abre dos terminales y ejecuta cada servidor por separado:

**Terminal 1 — Backend** (con recarga automática vía Nodemon):
```bash
cd server
npm run dev
```
> El servidor estará disponible en `http://localhost:3000/api-sigadbp`

**Terminal 2 — Frontend** (con Hot Module Replacement de Vite):
```bash
cd client
npm run dev
```
> La aplicación estará disponible en `http://localhost:5173`

### Modo producción

**Backend:**
```bash
cd server
npm start
```

**Frontend** (generar y previsualizar el build):
```bash
cd client
npm run build      # Genera la carpeta dist/
npm run preview    # Sirve el build en un servidor local
```

---

## Base de Datos

### Inicialización automática

La base de datos se configura **automáticamente** al arrancar el backend por primera vez:

1. El servidor verifica si la base de datos definida en `PG_DATABASE` existe en PostgreSQL.
2. Si **no existe**, la crea con `CREATE DATABASE`.
3. Ejecuta el script `server/src/config/bd.sql` que incluye:
   - Creación de las 23 tablas del sistema
   - 2 triggers para sincronización automática de estatus
   - 21 vistas SQL para consultas y métricas complejas
   - Datos iniciales: 1 estado, 15 municipios, 53 parroquias, 18 dependencias, 21 cargos, 16 empleados, 15 indicadores de gestión y datos de ejemplo

> **No es necesario ejecutar scripts SQL manualmente.** Solo asegúrate de que PostgreSQL esté corriendo y que las credenciales en `.env` sean correctas.

### Conexión

El backend utiliza un pool de conexiones de `pg` (`node-postgres`). La configuración se encuentra en `server/src/config/database.js` y exporta el pool como módulo por defecto para uso en los repositorios.

---

## Modelo de Datos

El sistema utiliza **23 tablas** organizadas en 9 dominios, con 2 triggers y 21 vistas SQL:

### 1. Geografía

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Estados` | Estados de Venezuela | — |
| `Municipios` | Municipios | FK → Estados |
| `Parroquias` | Parroquias | FK → Municipios |

### 2. Organización y Personal

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Dependencias` | Departamentos, oficinas, módulos y centros de acopio | FK → Parroquias |
| `Cargos` | Cargos laborales con tipo de responsabilidad patrimonial | — |
| `Personal` | Empleados con datos personales y estatus | — |
| `HistorialCargos` | Historial de asignaciones de cargo y dependencia por empleado | FK → Personal, Cargos, Dependencias |
| `Usuarios` | Cuentas de acceso al sistema con rol y pregunta de seguridad | FK → Personal |

### 3. Finanzas y Bienes

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Presupuestos` | Partidas presupuestarias por semestre con montos en USD y Bs | — |
| `Incorporaciones` | Entradas de bienes con orden de compra, factura y proveedor | FK → Dependencias, Personal |
| `Bienes` | Inventario de bienes nacionales con categoría y estatus | FK → Incorporaciones, Dependencias, Personal |

### 4. Especialización de Bienes

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Muebles` | Tipo y material del mobiliario | PK/FK → Bienes |
| `Tecnologicos` | Especificaciones técnicas y serial | PK/FK → Bienes |
| `Vehiculos` | Color, placa y serial de carrocería | PK/FK → Bienes |

> Las tablas de especialización usan **herencia por tabla** — la clave primaria es también la clave foránea a `Bienes` con `ON DELETE CASCADE`.

### 5. Mantenimiento y Gastos

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Mantenimientos` | Registros de mantenimiento con tipo, duración y estado posterior | FK → Bienes |
| `Gastos` | Montos de gasto vinculados a bienes, mantenimientos y presupuestos | FK → Presupuestos, Bienes, Mantenimientos |

### 6. Movimientos

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Movimientos` | Transferencias de bienes entre dependencias | FK → Personal (cedente, receptor), Dependencias (origen, destino) |
| `DetallesMovimientos` | Bienes incluidos en cada movimiento | FK → Movimientos, Bienes |

### 7. Desincorporaciones

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Desincorporaciones` | Retiro de bienes del inventario activo | FK → Dependencias, Personal |
| `DetallesDesincorporacion` | Bienes desincorporados con tipo (deterioro, obsolescencia, etc.) | FK → Desincorporaciones, Bienes |

### 8. Evaluaciones del Personal

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Evaluaciones` | Evaluaciones de capacitación y satisfacción por semestre | FK → Personal |

### 9. Indicadores de Gestión

| Tabla | Descripción | Relaciones |
|---|---|---|
| `Indicadores` | Definición de KPIs con perspectiva, meta y frecuencia | — |
| `Metricas` | Valores históricos de cada indicador con período y detalles | FK → Indicadores |

### Triggers Automáticos

| Trigger | Evento | Descripción |
|---|---|---|
| `tr_mantenimiento_sincronizar_estatus` | `AFTER INSERT OR UPDATE` en Mantenimientos | Cambia el estatus del bien a «En mantenimiento» cuando se inicia un mantenimiento, y lo revierte a «Operativo» o «No asignado» cuando finaliza |
| `tr_mantenimiento_eliminar` | `AFTER DELETE` en Mantenimientos | Revierte el estatus del bien cuando se elimina un mantenimiento que estaba en proceso |

### Vistas SQL (selección destacada)

| Vista | Propósito |
|---|---|
| `vistaBienes` | Información completa de bienes con datos de especialización, responsable y dependencia |
| `vistaPersonal` | Personal con cargo actual, dependencia, antigüedad y bienes asignados |
| `vistaUsuarios` | Usuarios con datos del empleado asociado |
| `vistaPresupuestos` | Presupuestos con total de gastos y disponibilidad calculada |
| `vistaMantenimiento` | Mantenimientos con datos del bien, gasto, presupuesto y responsable |
| `vistaMovimientos` | Movimientos con dependencias de origen/destino y personal cedente/receptor |
| `vistaDesincorporaciones` | Desincorporaciones con cantidad de bienes y datos del responsable |
| `vistaIncorporaciones` | Incorporaciones con cantidad de bienes y gasto total |
| `vistaMetricasBasicas` | Contadores del dashboard (bienes totales, incorporaciones/desincorporaciones/movimientos/mantenimientos del mes) |
| `vistaBienesPorEstatus` | Distribución porcentual de bienes por estatus |
| `vistaBienesPorCategoria` | Distribución porcentual de bienes por categoría |
| `vistaBienesPorDependencia` | Distribución de bienes por dependencia con desglose por categoría |
| `vistaIndicadores` | Indicadores con historial de métricas en formato JSON |

---

## API REST — Referencia de Endpoints

**URL base:** `/api-sigadbp`

### Autenticación (`/usuarios`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/usuarios/login` | Iniciar sesión — devuelve token JWT | No |
| `POST` | `/usuarios/recuperar-contrasena` | Verificar identidad por pregunta de seguridad | No |
| `PUT` | `/usuarios/cambiar-contrasena` | Cambiar contraseña (con token temporal de 10 min) | Sí (token temporal) |

### Usuarios (`/usuarios`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/usuarios` | Listar todos los usuarios | Sí |
| `POST` | `/usuarios` | Crear nuevo usuario | Sí |
| `PUT` | `/usuarios` | Actualizar usuario | Sí |
| `POST` | `/usuarios/username-correo` | Validar que username y correo sean únicos | Sí |

### Bienes (`/bienes`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/bienes` | Listar todos los bienes |
| `GET` | `/bienes/:id` | Obtener bien por ID |
| `POST` | `/bienes` | Registrar nuevo bien |
| `PUT` | `/bienes` | Actualizar bien existente |
| `DELETE` | `/bienes/:id` | Eliminar bien |
| `GET` | `/bienes/operativos` | Listar bienes con estatus operativo |
| `GET` | `/bienes/no-asignados` | Listar bienes sin asignar a personal/dependencia |
| `POST` | `/bienes/validar-numero` | Validar que el número de bien sea único |
| `GET` | `/bienes/metricas/resumen` | Resumen general de métricas de bienes |
| `GET` | `/bienes/metricas/categorias` | Distribución de bienes por categoría |
| `GET` | `/bienes/metricas/estatus` | Distribución de bienes por estatus |
| `GET` | `/bienes/metricas/dependencias` | Distribución de bienes por dependencia |
| `GET` | `/bienes/metricas/no-identificados` | Bienes sin número de identificación |
| `GET` | `/bienes/metricas/disponibilidad-dependencia` | Disponibilidad operativa por dependencia |

### Personal (`/personal`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/personal` | Listar todo el personal |
| `GET` | `/personal/:id` | Obtener empleado por ID |
| `POST` | `/personal` | Registrar nuevo empleado |
| `PUT` | `/personal` | Actualizar datos del empleado |
| `DELETE` | `/personal/:id` | Eliminar empleado |
| `GET` | `/personal/sin-usuario` | Listar empleados que no tienen cuenta de usuario |
| `POST` | `/personal/validar-cedula` | Validar que la cédula sea única |

### Dependencias (`/dependencias`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/dependencias` | Listar dependencias |
| `GET` | `/dependencias/:id` | Obtener dependencia por ID |
| `POST` | `/dependencias` | Crear nueva dependencia |
| `PUT` | `/dependencias` | Actualizar dependencia |
| `DELETE` | `/dependencias/:id` | Eliminar dependencia |
| `GET` | `/dependencias/responsables` | Listar responsables patrimoniales por dependencia |
| `POST` | `/dependencias/validar-nombre` | Validar que el nombre sea único |

### Cargos (`/cargos`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/cargos` | Listar todos los cargos |
| `GET` | `/cargos/:id` | Obtener cargo por ID |
| `POST` | `/cargos` | Crear cargo |
| `PUT` | `/cargos` | Actualizar cargo |
| `DELETE` | `/cargos/:id` | Eliminar cargo |
| `POST` | `/cargos/validar-nombre` | Validar que el nombre sea único |

### Presupuestos (`/presupuestos`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/presupuestos` | Listar todos los presupuestos |
| `GET` | `/presupuestos/:id` | Obtener presupuesto por ID |
| `POST` | `/presupuestos` | Crear partida presupuestaria |
| `PUT` | `/presupuestos` | Actualizar presupuesto |
| `DELETE` | `/presupuestos/:id` | Eliminar presupuesto |
| `GET` | `/presupuestos/activos` | Listar presupuestos activos del semestre actual |
| `GET` | `/presupuestos/activos-mantenimiento` | Presupuestos activos con disponibilidad para gastos de mantenimiento |
| `POST` | `/presupuestos/validar-codigo` | Validar que el código de partida sea único |
| `GET` | `/presupuestos/metricas/resumen` | Resumen de ejecución presupuestaria |

### Incorporaciones (`/incorporaciones`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/incorporaciones` | Listar incorporaciones |
| `GET` | `/incorporaciones/:id` | Obtener incorporación por ID con bienes asociados |
| `POST` | `/incorporaciones` | Registrar incorporación con bienes y gastos |
| `PUT` | `/incorporaciones` | Actualizar incorporación |
| `DELETE` | `/incorporaciones/:id` | Eliminar incorporación |

### Desincorporaciones (`/desincorporaciones`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/desincorporaciones` | Listar desincorporaciones |
| `GET` | `/desincorporaciones/:id` | Obtener desincorporación por ID con bienes |
| `POST` | `/desincorporaciones` | Registrar desincorporación con bienes |
| `PUT` | `/desincorporaciones` | Actualizar desincorporación |
| `DELETE` | `/desincorporaciones/:id` | Eliminar desincorporación |

### Movimientos (`/movimientos`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/movimientos` | Listar movimientos |
| `GET` | `/movimientos/:id` | Obtener movimiento por ID con bienes transferidos |
| `POST` | `/movimientos` | Registrar movimiento de bienes |
| `PUT` | `/movimientos` | Actualizar movimiento |
| `DELETE` | `/movimientos/:id` | Eliminar movimiento |

### Mantenimientos (`/mantenimientos`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/mantenimientos` | Listar mantenimientos |
| `GET` | `/mantenimientos/:id` | Obtener mantenimiento por ID |
| `POST` | `/mantenimientos` | Registrar mantenimiento con gasto opcional |
| `PUT` | `/mantenimientos` | Actualizar mantenimiento |
| `DELETE` | `/mantenimientos/:id` | Eliminar mantenimiento |

### Evaluaciones (`/evaluaciones`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/evaluaciones` | Listar evaluaciones del personal |
| `POST` | `/evaluaciones` | Registrar evaluación de capacitación y satisfacción |
| `PUT` | `/evaluaciones` | Actualizar evaluación |
| `DELETE` | `/evaluaciones/:id` | Eliminar evaluación |

### Indicadores / Métricas (`/metricas`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/metricas` | Listar todos los indicadores de gestión con historial |
| `GET` | `/metricas/:id` | Obtener indicador específico con métricas históricas |

### Ubicación Geográfica (`/ubicacion`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/ubicacion/estados` | Listar estados |
| `GET` | `/ubicacion/municipios/:idEstado` | Listar municipios de un estado |
| `GET` | `/ubicacion/parroquias/:idMunicipio` | Listar parroquias de un municipio |

---

## WebSockets

El sistema utiliza **Socket.io** para comunicación bidireccional en tiempo real entre el servidor y los clientes conectados.

### Autenticación de WebSocket

El cliente envía el token JWT al conectarse a través de `socket.auth.token`. El servidor lo valida con el middleware `verificarTokenSocket` antes de permitir la conexión.

```js
// Cliente (Vue)
socket.auth = { token };
socket.connect();
```

### Eventos

| Evento | Dirección | Descripción |
|---|---|---|
| `sesion_forzada` | Servidor → Cliente | Expulsa la sesión activa del usuario (ej: al actualizar credenciales de un usuario desde el módulo de administración). El cliente limpia `localStorage`, desconecta el socket y redirige al login |
| `connect_error` | Sistema → Cliente | Errores de conexión. Si el error es `NO_TOKEN`, `INVALID_TOKEN` o `USER_NOT_FOUND`, se cierra la sesión automáticamente |

### Salas

Cada usuario autenticado se une automáticamente a una sala privada `sala_usuario_{id}`, lo que permite enviar notificaciones dirigidas a un usuario específico desde el backend.

---

## Módulos del Sistema

| Módulo | Descripción | Estadísticas |
|---|---|---|
| **Panel de Control** | Dashboard con tarjetas de resumen, gráfico de bienes por estatus (donut), distribución por categoría (barras horizontales) y distribución por dependencia (tabla visual). Accesos rápidos filtrados por rol | — |
| **Inventario de Bienes** | CRUD completo de bienes nacionales. Clasificación en 3 categorías: Muebles, Tecnológicos y Vehículos. Asignación a personal y dependencias. Índice único para número de bien | Sí |
| **Incorporaciones** | Registro de entrada de bienes al patrimonio. Asociación con orden de compra, factura, proveedor, dependencia y responsable. Vinculación de gastos a presupuestos | — |
| **Desincorporaciones** | Retiro de bienes del inventario activo. Registro del tipo de desincorporación (deterioro, obsolescencia, etc.) por cada bien | Sí |
| **Movimientos** | Transferencias de bienes entre dependencias. Registro de cedente, receptor, dependencia de origen y destino. Detalle de bienes transferidos | — |
| **Mantenimiento** | Gestión del ciclo de vida de mantenimientos (En proceso → Finalizado). Seguimiento de duración, estado posterior del bien, gastos asociados y vinculación a presupuesto | Sí |
| **Presupuestos** | Partidas presupuestarias por semestre con montos en USD y Bs. Control de gastos ejecutados vs. disponibilidad. Desactivación automática al cierre del semestre | Sí |
| **Dependencias** | Gestión de las unidades organizativas (oficinas, módulos, centros de acopio) con ubicación geográfica (estado, municipio, parroquia) | — |
| **Cargos** | Catálogo de cargos laborales con tipo de responsabilidad patrimonial | — |
| **Personal** | Gestión de empleados con datos personales, historial de cargos, antigüedad calculada, bienes asignados y evaluaciones semestrales | Sí |
| **Usuarios** | Administración de cuentas de acceso. Asignación de roles, pregunta de seguridad, y flujo de recuperación de contraseña con token temporal | — |

---

## Roles y Permisos

El sistema implementa 3 roles con diferentes niveles de acceso. El menú lateral (sidebar) se filtra automáticamente según el rol del usuario autenticado.

| Rol | Módulos Accesibles |
|---|---|
| **Administrador** | Todos los módulos: Panel de Control, Inventario, Incorporaciones, Desincorporaciones, Movimientos, Mantenimiento, Presupuestos, Dependencias, Cargos, Personal, Usuarios |
| **Supervisor** | Panel de Control, Inventario, Incorporaciones, Desincorporaciones, Movimientos, Mantenimiento |
| **Operador** | Panel de Control, Inventario, Incorporaciones, Mantenimiento |

> **Nota:** El control de acceso por roles se aplica actualmente a nivel del frontend mediante guards del Vue Router. Las rutas del backend no tienen restricción por rol.

---

## Tareas Programadas (Cron Jobs)

El sistema ejecuta tareas automáticas mediante **node-cron** (zona horaria: `America/Caracas`):

### Tarea diaria — 23:59

Se ejecuta la noche previa al **primer día de cada mes**:

| Indicador | Nombre | Descripción |
|---|---|---|
| IAOM | Antigüedad Operativa Mensual | Calcula la antigüedad promedio de los bienes operativos |

### Tarea semestral — 30 de mayo y 30 de noviembre

Se calculan los siguientes indicadores de gestión:

| Indicador | Nombre | Descripción |
|---|---|---|
| IIET | Inversión en Equipos Tecnológicos | % del presupuesto ejecutado en equipos tecnológicos |
| IIM | Inversión en Mantenimiento | % del presupuesto ejecutado en mantenimiento |
| IIMB | Inversión en Mobiliario | % del presupuesto ejecutado en mobiliario |
| ICP | Capacitación del Personal | % del personal capacitado en el semestre |
| IPS | Productividad Semestral | % de satisfacción del personal en el semestre |

Adicionalmente, al cierre de cada semestre se **desactivan automáticamente** los presupuestos del período correspondiente (Semestre I en mayo, Semestre II en noviembre).

---

## Indicadores de Gestión (KPIs)

El sistema calcula y registra **15 indicadores clave** agrupados en perspectivas del Cuadro de Mando Integral:

### Perspectiva Financiera
- **IIET** — Índice de Inversión en Equipos Tecnológicos
- **IIM** — Índice de Inversión en Mantenimiento
- **IIMB** — Índice de Inversión en Mobiliario

### Perspectiva de Procesos Internos
- **IBEO** — Índice de Bienes en Estado Operativo
- **ICMI** — Índice de Cumplimiento de Mantenimiento Interno
- **IBODP** — Índice de Bienes Operativos por Dependencia Primaria
- **ITPMB** — Índice de Tiempo Promedio de Mantenimiento de Bienes
- **IDD** — Índice de Desincorporación y Deterioro
- **ITDB** — Índice de Tasa de Desincorporación de Bienes
- **IBNI** — Índice de Bienes No Identificados
- **TDRB** — Tasa de Disponibilidad Real de Bienes
- **IAOM** — Índice de Antigüedad Operativa Mensual

### Perspectiva de Formación y Crecimiento
- **ICP** — Índice de Capacitación del Personal
- **IPS** — Índice de Productividad Semestral

Cada indicador tiene un valor **meta** y un umbral de **peligro** definido, con historial de métricas que permite visualizar tendencias a lo largo del tiempo.

---

## Scripts Disponibles

### Backend (`server/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con **Nodemon** (recarga automática al guardar cambios) |
| `npm start` | Inicia el servidor en modo producción con Node.js directamente |

### Frontend (`client/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo **Vite** con HMR en `http://localhost:5173` |
| `npm run build` | Genera el build optimizado de producción en la carpeta `dist/` |
| `npm run preview` | Sirve localmente el build de producción para previsualización |

---

## Despliegue en Producción

### Frontend

1. Generar el build de producción:
   ```bash
   cd client
   npm run build
   ```
2. La carpeta `dist/` generada contiene archivos estáticos que se pueden servir con cualquier servidor web (Nginx, Apache, Vercel, Netlify, etc.).
3. Asegúrate de configurar las variables `VITE_API_URL` y `VITE_SOCKET_URL` apuntando al dominio del backend en producción **antes** de ejecutar el build.
4. Si usas Vue Router en modo `history`, configura tu servidor web para redirigir todas las rutas al `index.html`.

   **Ejemplo de configuración para Nginx:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       root /ruta/al/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Backend

1. Asegúrate de que PostgreSQL esté accesible desde el entorno de producción.
2. Configura las variables de entorno del archivo `.env` con los valores de producción.
3. Inicia el servidor:
   ```bash
   cd server
   npm start
   ```
4. Se recomienda usar un gestor de procesos como **PM2** para mantener el servidor activo:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name sigadbp-api
   pm2 save
   ```

---

## Licencia

Este proyecto es de uso privado e institucional.
