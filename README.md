<h1 align="center">SIGADBP</h1>
<h3 align="center">Sistema Integral de Gestión y Apoyo a las Decisiones sobre los Bienes Públicos</h3>

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
  Sistema de información basado en KPIs para la gestión de bienes públicos en la Unidad de Administración de Mercal - Estado Sucre
</p>

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
- [Generación de Reportes](#generación-de-reportes)
- [Seguridad](#seguridad)
- [Roles y Permisos](#roles-y-permisos)
- [Tareas Programadas (Cron Jobs)](#tareas-programadas-cron-jobs)
- [Indicadores de Gestión (KPIs)](#indicadores-de-gestión-kpis)
- [Scripts Disponibles](#scripts-disponibles)
- [Autores](#autores)




## Características Principales

- **Panel de control interactivo** con resumen general, gráficos de estatus, distribución por categoría y por dependencia.
- **Gestión completa de bienes nacionales** — registro, clasificación (muebles, tecnológicos, vehículos), asignación a personal y dependencias, y seguimiento de estatus.
- **Incorporaciones y desincorporaciones** — control de entrada y salida de bienes con documentación (orden de compra, factura, proveedor).
- **Movimientos entre dependencias** — transferencias de bienes con registro de cedente, receptor, origen y destino.
- **Mantenimiento de bienes** — seguimiento de mantenimientos con duración, gastos asociados y vinculación a presupuestos.
- **Presupuestos semestrales** — partidas presupuestarias con control de gastos, disponibilidad y desactivación automática al cierre del semestre.
- **Gestión de personal** — datos personales, historial de cargos, antigüedad, evaluaciones de capacitación y satisfacción.
- **Indicadores de gestión (KPIs)** — cálculo automatizado mensual y semestral con historial de métricas y visualización gráfica para la toma de decisiones.
- **Generación de reportes en Excel** — exportación de inventarios, incorporaciones, desincorporaciones y movimientos en formato .xlsx con formato profesional.
- **Autenticación JWT** con recuperación de contraseña por pregunta de seguridad y cronómetro de expiración.
- **Perfil de usuario** — visualización de información personal y laboral, edición de datos (username, correo, contraseña, pregunta de seguridad).
- **Control de acceso basado en roles (RBAC)** — middleware de autenticación en backend con verificación de token y permisos por rol en todas las rutas protegidas.
- **Notificaciones en tiempo real** vía WebSocket (Socket.io) — expulsión de sesión, alertas del sistema.
- **Modo oscuro** con persistencia en localStorage.
- **Interfaz responsive** — funcional en escritorio y dispositivos móviles con sidebar colapsable.
- **Validación de formularios** con Zod en el frontend.
- **Auto-inicialización de base de datos** — el sistema crea y configura la BD automáticamente en el primer arranque.
- **Seguridad mejorada** — rate limiting para endpoints de autenticación, protección con Helmet, validación robusta de datos.




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
| [ExcelJS](https://github.com/exceljs/exceljs) | 4.x | Generación de reportes en formato Excel |
| [pg](https://node-postgres.com/) | 8.x | Cliente PostgreSQL para Node.js |
| [cors](https://github.com/expressjs/cors) | 2.x | Manejo de Cross-Origin Resource Sharing |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | 1.x | Parseo de cookies HTTP |
| [dotenv](https://github.com/motdotla/dotenv) | 17.x | Carga de variables de entorno |
| [express-rate-limit](https://github.com/expressjs/express-rate-limit) | 8.x | Protección contra ataques de fuerza bruta |
| [helmet](https://github.com/helmetjs/helmet) | 8.x | Headers HTTP de seguridad |
| [nodemon](https://nodemon.io/) | 3.x | Recarga automática en desarrollo |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Vue 3](https://vuejs.org/) | 3.5.x | Framework SPA con Composition API |
| [Vite](https://vite.dev/) | 7.x | Bundler ultrarrápido y servidor de desarrollo |
| [Vue Router](https://router.vuejs.org/) | 4.x | Enrutamiento SPA con guards de navegación |
| [PrimeVue](https://primevue.org/) | 4.x | Librería de componentes UI |
| [@primeuix/themes](https://primevue.org/themes) | 2.x | Temas de PrimeVue (Aura, Lara, etc.) |
| [@primevue/forms](https://primevue.org/forms) | 4.x | Integración de Zod con PrimeVue |
| [TailwindCSS](https://tailwindcss.com/) | 4.x | Framework de estilos utilitarios |
| [Axios](https://axios-http.com/) | 1.x | Cliente HTTP con interceptores |
| [Socket.io Client](https://socket.io/docs/v4/client-api/) | 4.x | Cliente WebSocket |
| [Zod](https://zod.dev/) | 4.x | Validación y tipado de esquemas |
| [NProgress](https://ricostacruz.com/nprogress/) | 0.2.x | Barra de progreso de carga HTTP |
| [file-saver](https://github.com/eligrey/FileSaver.js/) | 2.x | Descarga de archivos desde el navegador |




## Arquitectura del Proyecto

El backend sigue una arquitectura en **3 capas** (Controller → Service → Repository) con separación clara de responsabilidades. El frontend usa una estructura modular con componentes, servicios, vistas y utilidades.

```
SIGADBP/
│
├── client/                      # Frontend — Vue 3 + Vite
│   ├── src/
│   │   ├── api/                 # Capa de comunicación (Axios + Socket.io globales)
│   │   ├── components/          # Componentes reutilizables agrupados por módulo
│   │   ├── layout/              # Layouts base de la aplicación (Main, Login)
│   │   ├── plugins/             # Configuración global de librerías (PrimeVue)
│   │   ├── router/              # Enrutamiento y guards de autorización por rol
│   │   ├── services/            # Servicios HTTP (1 archivo por módulo/entidad)
│   │   ├── utils/               # Esquemas Zod de validación, formateadores y composables
│   │   ├── views/               # Vistas principales de módulos y KPIs
│   │   ├── App.vue              # Componente raíz
│   │   └── main.js              # Punto de entrada de la aplicación
│   ├── vite.config.js           # Configuración de Vite
│   └── package.json
│
├── server/                      # Backend — Express 5 + PostgreSQL
│   ├── src/
│   │   ├── config/              # Conexión a BD y scripts DDL (tablas, triggers, vistas)
│   │   ├── controllers/         # Controladores HTTP (1 por entidad)
│   │   ├── jobs/                # Tareas programadas (Cron jobs para KPIs y cierres)
│   │   ├── middlewares/         # Capa de seguridad (Verificación JWT HTTP/Sockets, Rate Limit)
│   │   ├── repositories/        # Capa de acceso a datos (Queries SQL parametrizados)
│   │   ├── routes/              # Definición de rutas y sub-rutas Express
│   │   ├── services/            # Lógica de negocio y cálculos complejos
│   │   ├── templates/           # Plantillas Excel para reportes
│   │   └── index.js             # Punto de entrada (Express + Socket.io + Cron)
│   └── package.json
│
└── README.md
```




## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org/) |
| npm | 9.x | Incluido con Node.js |
| PostgreSQL | 14.x | [postgresql.org/download](https://www.postgresql.org/download/) |

> **Importante:** El usuario de PostgreSQL debe tener permisos para **crear bases de datos**, ya que el sistema se auto-inicializa al primer arranque.




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

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/bienes` | Listar todos los bienes | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/:id` | Obtener bien por ID | Sí | Admin, Supervisor, Analista |
| `POST` | `/bienes` | Registrar nuevo bien | Sí | Admin, Supervisor |
| `PUT` | `/bienes` | Actualizar bien existente | Sí | Admin, Supervisor |
| `DELETE` | `/bienes/:id` | Eliminar bien | Sí | Admin |
| `GET` | `/bienes/operativos` | Listar bienes con estatus operativo | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/no-asignados` | Listar bienes sin asignar | Sí | Admin, Supervisor, Analista |
| `POST` | `/bienes/validar-numero` | Validar número de bien único | Sí | Admin, Supervisor |
| `GET` | `/bienes/metricas/resumen` | Resumen de métricas de bienes | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/metricas/categorias` | Distribución por categoría | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/metricas/estatus` | Distribución por estatus | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/metricas/dependencias` | Distribución por dependencia | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/metricas/no-identificados` | Bienes sin identificación | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/metricas/disponibilidad-dependencia` | Disponibilidad operativa | Sí | Admin, Supervisor, Analista |
| `GET` | `/bienes/reporte/:idDependencia` | Generar reporte Excel | Sí | Admin, Supervisor |

### Personal (`/personal`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/personal` | Listar todo el personal | Sí | Admin, Supervisor, Analista |
| `GET` | `/personal/:id` | Obtener empleado por ID | Sí | Admin, Supervisor, Analista |
| `POST` | `/personal` | Registrar nuevo empleado | Sí | Admin |
| `PUT` | `/personal` | Actualizar datos del empleado | Sí | Admin, Supervisor |
| `DELETE` | `/personal/:id` | Eliminar empleado | Sí | Admin |
| `GET` | `/personal/sin-usuario` | Empleados sin cuenta de usuario | Sí | Admin |
| `POST` | `/personal/validar-cedula` | Validar cédula única | Sí | Admin, Supervisor |
| `GET` | `/personal/historial` | Historial completo de cargos | Sí | Admin, Supervisor |

### Dependencias (`/dependencias`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/dependencias` | Listar dependencias | Sí | Admin, Supervisor, Analista |
| `GET` | `/dependencias/:id` | Obtener dependencia por ID | Sí | Admin, Supervisor, Analista |
| `POST` | `/dependencias` | Crear nueva dependencia | Sí | Admin |
| `PUT` | `/dependencias` | Actualizar dependencia | Sí | Admin |
| `DELETE` | `/dependencias/:id` | Eliminar dependencia | Sí | Admin |
| `GET` | `/dependencias/responsables` | Responsables patrimoniales | Sí | Admin, Supervisor, Analista |
| `POST` | `/dependencias/validar-nombre` | Validar nombre único | Sí | Admin |

### Cargos (`/cargos`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/cargos` | Listar todos los cargos | Sí | Admin, Supervisor, Analista |
| `GET` | `/cargos/:id` | Obtener cargo por ID | Sí | Admin, Supervisor, Analista |
| `POST` | `/cargos` | Crear cargo | Sí | Admin |
| `PUT` | `/cargos` | Actualizar cargo | Sí | Admin |
| `DELETE` | `/cargos/:id` | Eliminar cargo | Sí | Admin |
| `POST` | `/cargos/validar-nombre` | Validar nombre único | Sí | Admin

### Presupuestos (`/presupuestos`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/presupuestos` | Listar todos los presupuestos | Sí | Admin, Supervisor |
| `GET` | `/presupuestos/:id` | Obtener presupuesto por ID | Sí | Admin, Supervisor |
| `POST` | `/presupuestos` | Crear partida presupuestaria | Sí | Admin |
| `PUT` | `/presupuestos` | Actualizar presupuesto | Sí | Admin |
| `DELETE` | `/presupuestos/:id` | Eliminar presupuesto | Sí | Admin |
| `GET` | `/presupuestos/activos` | Presupuestos activos del semestre | Sí | Admin, Supervisor |
| `GET` | `/presupuestos/activos-mantenimiento` | Disponibles para mantenimiento | Sí | Admin, Supervisor |
| `POST` | `/presupuestos/validar-codigo` | Validar código de partida único | Sí | Admin |
| `GET` | `/presupuestos/metricas/resumen` | Resumen de ejecución presupuestaria | Sí | Admin, Supervisor |

### Incorporaciones (`/incorporaciones`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/incorporaciones` | Listar incorporaciones | Sí | Admin, Supervisor, Analista |
| `GET` | `/incorporaciones/:id` | Incorporación con bienes asociados | Sí | Admin, Supervisor, Analista |
| `POST` | `/incorporaciones` | Registrar con bienes y gastos | Sí | Admin, Supervisor |
| `PUT` | `/incorporaciones` | Actualizar incorporación | Sí | Admin, Supervisor |
| `DELETE` | `/incorporaciones/:id` | Eliminar incorporación | Sí | Admin |
| `GET` | `/incorporaciones/reporte/:id` | Generar reporte Excel | Sí | Admin, Supervisor |

### Desincorporaciones (`/desincorporaciones`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/desincorporaciones` | Listar desincorporaciones | Sí | Admin, Supervisor, Analista |
| `GET` | `/desincorporaciones/:id` | Desincorporación con bienes | Sí | Admin, Supervisor, Analista |
| `POST` | `/desincorporaciones` | Registrar con bienes | Sí | Admin, Supervisor |
| `PUT` | `/desincorporaciones` | Actualizar desincorporación | Sí | Admin, Supervisor |
| `DELETE` | `/desincorporaciones/:id` | Eliminar desincorporación | Sí | Admin |
| `GET` | `/desincorporaciones/reporte/:id` | Generar reporte Excel | Sí | Admin, Supervisor |

### Movimientos (`/movimientos`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/movimientos` | Listar movimientos | Sí | Admin, Supervisor, Analista |
| `GET` | `/movimientos/:id` | Movimiento con bienes transferidos | Sí | Admin, Supervisor, Analista |
| `POST` | `/movimientos` | Registrar transferencia | Sí | Admin, Supervisor |
| `PUT` | `/movimientos` | Actualizar movimiento | Sí | Admin, Supervisor |
| `DELETE` | `/movimientos/:id` | Eliminar movimiento | Sí | Admin |
| `GET` | `/movimientos/reporte/:id` | Generar reporte Excel | Sí | Admin, Supervisor |

### Mantenimientos (`/mantenimientos`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/mantenimientos` | Listar mantenimientos | Sí | Admin, Supervisor, Analista |
| `GET` | `/mantenimientos/:id` | Obtener mantenimiento por ID | Sí | Admin, Supervisor, Analista |
| `POST` | `/mantenimientos` | Registrar con gasto opcional | Sí | Admin, Supervisor |
| `PUT` | `/mantenimientos` | Actualizar mantenimiento | Sí | Admin, Supervisor |
| `DELETE` | `/mantenimientos/:id` | Eliminar mantenimiento | Sí | Admin |

### Evaluaciones (`/evaluaciones`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/evaluaciones` | Listar evaluaciones del personal | Sí | Admin, Supervisor |
| `POST` | `/evaluaciones` | Registrar evaluación | Sí | Admin, Supervisor |
| `PUT` | `/evaluaciones` | Actualizar evaluación | Sí | Admin, Supervisor |
| `DELETE` | `/evaluaciones/:id` | Eliminar evaluación | Sí | Admin |

### Indicadores / Métricas (`/metricas`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/metricas` | Listar indicadores con historial | Sí | Admin, Supervisor |
| `GET` | `/metricas/:id` | Indicador específico con métricas | Sí | Admin, Supervisor |

### Ubicación Geográfica (`/ubicacion`)

| Método | Ruta | Descripción | JWT | Roles |
|---|---|---|---|---|
| `GET` | `/ubicacion` | Listar ubicaciones geográficas | Sí | Admin, Supervisor, Analista |
| `GET` | `/ubicacion/estados` | Listar estados | Sí | Admin, Supervisor, Analista |
| `GET` | `/ubicacion/municipios/:idEstado` | Municipios de un estado | Sí | Admin, Supervisor, Analista |
| `GET` | `/ubicacion/parroquias/:idMunicipio` | Parroquias de un municipio | Sí | Admin, Supervisor, Analista |




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
| `sesion_forzada` | Servidor → Cliente | Expulsa la sesión activa del usuario (ej: al eliminar un usuario). El cliente limpia `localStorage`, desconecta el socket y redirige al login |
| `connect_error` | Sistema → Cliente | Errores de conexión. Si el error es `NO_TOKEN`, `INVALID_TOKEN` o `USER_NOT_FOUND`, se cierra la sesión automáticamente |

### Salas

Cada usuario autenticado se une automáticamente a una sala privada `sala_usuario_{id}`, lo que permite enviar notificaciones dirigidas a un usuario específico desde el backend.




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

### Vistas especializadas del Personal

El módulo de Personal incluye funcionalidades adicionales para el seguimiento del ciclo de vida laboral de los empleados:

| Vista | Descripción |
|---|---|
| **Historial de Cargos** | Consulta del historial completo de asignaciones de cargo y dependencia por empleado, con fechas de inicio y fin, y datos del cargo asignado |



## Generación de Reportes

El sistema permite exportar información en **formato Excel (.xlsx)** para múltiples módulos, facilitando la generación de informes y la documentación oficial.

### Módulos con exportación

| Módulo | Descripción del reporte |
|---|---|
| **Inventario de Bienes** | Listado completo de bienes nacionales con categoría, estatus, responsable, dependencia, especificaciones técnicas y seriales |
| **Incorporaciones** | Reporte de bienes incorporados al patrimonio con orden de compra, factura, proveedor, monto gastado y fecha de incorporación |
| **Desincorporaciones** | Reporte de bienes desincorporados con tipo de desincorporación, motivo, responsable y fecha de retiro |
| **Movimientos** | Reporte de transferencias entre dependencias con cedente, receptor, bienes transferidos, origen y destino |

### Implementación técnica

Los reportes se generan usando la librería **ExcelJS** en el backend. Cada módulo tiene un endpoint dedicado que construye el libro Excel con múltiples hojas, formato profesional, encabezados estilizados y datos organizados en tablas.

```
server/
└── src/
    └── templates/                 # Plantillas base para formato Excel
        ├── formato_inventario.xlsx
        ├── formato_incorporacion.xlsx
        ├── formato_desincorporacion.xlsx
        └── formato_movimiento.xlsx
```

Los reportes se envían directamente al cliente como descarga de archivo con el tipo MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.



## Seguridad

El sistema implementa múltiples capas de protección para garantizar la seguridad de los datos y el acceso:

### Rate Limiting

Se aplica **rate limiting** a los endpoints de autenticación para prevenir ataques de fuerza bruta:

| Endpoint | Límite | Ventana |
|---|---|---|
| `POST /usuarios/login` | 5 solicitudes | 15 minutos |
| `POST /usuarios/recuperar-contrasena` | 3 solicitudes | 15 minutos |

Al superar el límite, el servidor responde con código `429 Too Many Requests`.

### Helmet

Se utiliza **Helmet** para configurar headers HTTP de seguridad:
- `contentSecurityPolicy` — Control del contenido que puede cargar la página
- `crossOriginEmbedderPolicy` — Protección contra ataques tipo MIME sniffing
- `crossOriginOpenerPolicy` — Aislamiento del contexto de navegación
- `crossOriginResourcePolicy` — Control de recursos cross-origin
- `dnsPrefetchControl` — Prevención de prefetch DNS en enlaces externos
- `frameguard` — Protección contra clickjacking (X-Frame-Options)
- `hidePoweredBy` — Oculta el header X-Powered-By
- `hsts` — HTTP Strict Transport Security
- `ieNoOpen` — Protección para IE8+
- `noSniff` — Previene MIME type sniffing
- `originAgentCluster` — Configuración del cluster de agentes de origen
- `permissionsPolicy` — Control de características del navegador

### Validación de datos

- **Zod** en el frontend para validación de formularios
- **Esquemas de validación** en cada servicio del backend
- **Queries parametrizados** en los repositorios para prevenir inyección SQL
- **Validación de uniqueness** en endpoints críticos (cédula, username, email, número de bien, código de partida)

### Control de acceso basado en roles (RBAC)

El sistema implementa un middleware de autenticación en el backend que verifica el token JWT y los permisos del usuario en todas las rutas protegidas. Los roles se asignan a nivel de usuario y determinan qué acciones pueden realizar.

### Autenticación y sesiones

- Tokens JWT con expiración configurable
- Tokens temporales de 10 minutos para recuperación de contraseña
- Expulsión de sesiones vía WebSocket cuando se elimina un usuario
- Middleware de autenticación en todas las rutas del backend que requieren un token válido




## Roles y Permisos

El sistema implementa 3 roles con diferentes niveles de acceso. El menú lateral (sidebar) se filtra automáticamente según el rol del usuario autenticado.

| Rol | Módulos Accesibles |
|---|---|
| **Administrador** | Todos los módulos: Panel de Control, Inventario, Incorporaciones, Desincorporaciones, Movimientos, Mantenimiento, Presupuestos, Dependencias, Cargos, Personal, Usuarios |
| **Supervisor** | Panel de Control, Inventario, Incorporaciones, Desincorporaciones, Movimientos, Mantenimiento |
| **Analista** | Panel de Control, Inventario, Incorporaciones, Mantenimiento |

El control de acceso se aplica tanto en el **frontend** (guards del Vue Router) como en el **backend** (middleware de autenticación) para garantizar la seguridad en todos los niveles.

### Protección de rutas en el Backend

Todas las rutas del backend (excepto `/usuarios` para login y recuperación de contraseña) están protegidas con el middleware `verificarToken` que:

1. Extrae el token JWT del header `Authorization: Bearer <token>`
2. Verifica la validez del token contra `JWT_SECRET`
3. Confirma que el usuario aún existe en la base de datos
4. Adjunta los datos del usuario decoded a `req.user`

```javascript
// server/src/routes/index.js
router.use(verificarToken); // Aplica a todas las rutas debajo

router.use('/cargos', CargosRouter);
router.use('/personal', PersonalRouter);
router.use('/bienes', BienesRouter);
// ... demás rutas
```

Además, rutas sensibles como `DELETE /bienes/:id` tienen protección adicional por rol:

```javascript
// server/src/routes/bienesRouter.js
.delete(verificarRolAdmin, BienesController.eliminar);
```

Middlewares de rol disponibles:

| Middleware | Descripción |
|---|---|
| `verificarToken` | Verifica token JWT válido |
| `verificarRolAdmin` | Restringe a rol Administrador |
| `verificarRolAdminSup` | Restringe a roles Administrador o Supervisor |




## Tareas Programadas (Cron Jobs)

El sistema ejecuta tareas automáticas mediante **node-cron** (zona horaria: `America/Caracas`):

### 1. Tareas mensuales

Se ejecutan la noche previa al **primer día de cada mes** para calcular y registrar el histórico de los siguientes indicadores de gestión operativos:

| Indicador | Nombre | Descripción |
|---|---|---|
| **%TDRB** | % Tasa de Disponibilidad Real de Bienes | % de bienes operativos asignados a la dependencia |
| **IAOM** | Índice de Afectación Operativa por Mantenimiento | % de bienes de la dependencia que se encuentran en mantenimiento |
| **ICMI** | Índice de Crecimiento Mensual de Inventario | Crecimiento porcentual del inventario respecto al mes anterior |
| **%IBEO** | % Bienes en Estado Operativo | % de bienes en estado operativo respecto al total de activos |
| **%IBNI** | % Bienes No Identificados | % de bienes activos sin número de identificación |
| **%ITDB** | % Tasa de Desincorporación de Bienes | % de bienes desincorporados respecto al total general |
| **%IDD** | % Desincorporaciones por Deterioro | % de desincorporaciones que fueron causadas por deterioro |
| **%IBODP** | % Bienes Operativos Después del Mantenimiento | % de bienes que quedan operativos tras salir de mantenimiento |
| **ITPMB** | Tiempo Promedio de Mantenimiento | Promedio de días que los bienes estuvieron en mantenimiento |

### 2. Tareas semestrales — 30 de mayo y 30 de noviembre

Se calculan los siguientes indicadores de gestión para las perspectivas de Presupuesto y Formación:

| Indicador | Nombre | Descripción |
|---|---|---|
| **%IIET** | % Inversión en Equipos Tecnológicos | % del presupuesto ejecutado en equipos tecnológicos |
| **%IIM** | % Inversión en Muebles | % del presupuesto ejecutado en muebles |
| **%IIMB** | % Inversión en Mantenimiento de Bienes | % del presupuesto ejecutado en mantenimiento de bienes |
| **%ICP** | % Capacitación del Personal | % del personal de la unidad capacitado en el semestre |
| **%IPS** | % Personal Satisfecho | % de personal satisfecho en la unidad durante el semestre |

Adicionalmente, al cierre de cada semestre se **desactivan automáticamente** los presupuestos del período correspondiente (Semestre I en mayo, Semestre II en noviembre).




## Indicadores de Gestión (KPIs)

El sistema calcula y registra **14 indicadores clave de gestión** alineados al Cuadro de Mando Integral, distribuidos en 4 perspectivas estratégicas:

### 1. Perspectiva: Planificación y Presupuesto
*   **%IIET** — % Inversión en Equipos Tecnológicos
*   **%IIM** — % Inversión en Muebles
*   **%IIMB** — % Inversión en Mantenimiento de Bienes

### 2. Perspectiva: Usuarios
*   **%TDRB** — % Tasa de Disponibilidad Real de Bienes
*   **IAOM** — Índice de Afectación Operativa por Mantenimiento

### 3. Perspectiva: Procesos Internos
*   **ICMI** — Índice de Crecimiento Mensual de Inventario
*   **%IBEO** — % Bienes en Estado Operativo
*   **%IBNI** — % Bienes No Identificados
*   **%ITDB** — % Tasa de Desincorporación de Bienes
*   **%IDD** — % Desincorporaciones por Deterioro
*   **%IBODP** — % Bienes Operativos Después del Mantenimiento
*   **ITPMB** — Tiempo Promedio de Mantenimiento de Bienes

### 4. Perspectiva: Formación y Crecimiento
*   **%ICP** — % Capacitación del Personal
*   **%IPS** — % Personal Satisfecho

Cada indicador tiene un valor **meta** y un umbral de **peligro** definido, con historial de métricas que permite visualizar tendencias a lo largo del tiempo.




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




## Autores

Luis Reinaldo Cortesía Henríquez y Gilberto Jose Zapata Rios