# Pruebas TDD - SIGADBP Backend

Este directorio contiene las pruebas unitarias siguiendo la metodología TDD (Test-Driven Development) de XP (Extreme Programming).

## Estructura

```
tests/
├── setup.js                    # Configuración global de pruebas
├── mocks/                      # Mocks para repositorios y servicios
│   └── repositories.js
├── authMiddleware.test.js      # Pruebas del middleware de autenticación
├── usuariosService.test.js     # Pruebas del servicio de usuarios
├── bienesServices.test.js      # Pruebas del servicio de bienes
├── incorporacionesService.test.js  # Pruebas del servicio de incorporaciones
└── desincorporacionesService.test.js # Pruebas del servicio de desincorporaciones
```

## Pruebas Implementadas

### 1. AuthMiddleware (authMiddleware.test.js)
Pruebas para el middleware de autenticación HTTP y WebSocket:

**verificarToken (HTTP):**
- ✓ Rechaza request sin token (401)
- ✓ Rechaza request con token expirado (403)
- ✓ Rechaza request con token de usuario inexistente (401)
- ✓ Acepta request con token válido y usuario existente

**verificarTokenSocket (WebSocket):**
- ✓ Rechaza conexión sin token (NO_TOKEN)
- ✓ Rechaza conexión con token inválido (INVALID_TOKEN)
- ✓ Rechaza conexión si el usuario no existe (USER_NOT_FOUND)
- ✓ Acepta conexión con token válido y usuario existente

### 2. UsuariosService (usuariosService.test.js)
Pruebas para el servicio de gestión de usuarios:

**listar:**
- ✓ Lista todos los usuarios correctamente

**validarUsernameCorreo:**
- ✓ Valida username y correo únicos
- ✓ Indica cuando el username ya existe

**iniciarSesion:**
- ✓ Retorna error cuando el usuario no existe
- ✓ Retorna error cuando la contraseña es incorrecta
- ✓ Inicia sesión exitosamente con credenciales válidas

**recuperarContrasena:**
- ✓ Retorna error cuando el usuario no existe
- ✓ Retorna error cuando la pregunta es incorrecta
- ✓ Verifica usuario y genera token para recuperación

**crear:**
- ✓ Crea un usuario con contraseña encriptada (bcrypt)

**actualizar:**
- ✓ Actualiza usuario sin cambiar contraseña vacía
- ✓ Actualiza usuario con nueva contraseña encriptada

**eliminar:**
- ✓ Lanza error ULTIMO_ADMIN si es el último administrador

### 3. BienesServices (bienesServices.test.js)
Pruebas para el servicio de gestión de bienes:

**listar/listarOperativos:**
- ✓ Lista todos los bienes
- ✓ Lista bienes operativos
- ✓ Retorna array vacío si no hay bienes

**validarNumeroBienUnico:**
- ✓ Retorna true si el número de bien ya existe
- ✓ Retorna false si el número de bien es único

**crear:**
- ✓ Crea un bien mueble correctamente
- ✓ Crea un bien tecnológico correctamente
- ✓ Lanza error si la categoría es inválida
- ✓ Hace rollback en caso de error

**actualizar:**
- ✓ Actualiza un bien mueble correctamente

**eliminar:**
- ✓ Elimina un bien correctamente

**métricas:**
- ✓ Obtiene métricas por categoría
- ✓ Obtiene métricas por estatus
- ✓ Obtiene resumen de métricas generales

### 4. IncorporacionesService (incorporacionesService.test.js)
Pruebas para el servicio de incorporaciones:

**listar:**
- ✓ Lista todas las incorporaciones

**obtenerPorId:**
- ✓ Obtiene incorporación por ID con sus bienes

**crear:**
- ✓ Crea una incorporación con bienes
- ✓ Omite gasto si el monto es 0
- ✓ Hace rollback si hay error en la creación

**actualizar:**
- ✓ Actualiza incorporación y vincula nuevos bienes

**eliminar:**
- ✓ Elimina incorporación y desvincular bienes

**generarReporte:**
- ✓ Genera reporte Excel con datos correctos

### 5. DesincorporacionesService (desincorporacionesService.test.js)
Pruebas para el servicio de desincorporaciones:

**listar:**
- ✓ Lista todas las desincorporaciones

**desincorporacionMetricas:**
- ✓ Obtiene métricas de desincorporaciones

**obtenerPorId:**
- ✓ Obtiene desincorporación por ID con sus bienes

**crear:**
- ✓ Crea una desincorporación con bienes
- ✓ Crea sin bienes si el array está vacío
- ✓ Hace rollback si hay error

**actualizar:**
- ✓ Actualiza desincorporación y crea nuevos detalles

**eliminar:**
- ✓ Elimina desincorporación y restaura bienes

**generarReporte:**
- ✓ Genera reporte Excel con datos correctos

## Cómo Ejecutar las Pruebas

### Requisitos Previos
1. Node.js 18+ instalado
2. Dependencias del proyecto instaladas (`npm install`)

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas una vez
npm test

# Ejecutar pruebas en modo watch (auto-reload)
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas de autenticación
npm test -- authMiddleware

# Solo pruebas de usuarios
npm test -- usuariosService

# Solo pruebas de bienes
npm test -- bienesServices
```

## Configuración de Testing

El archivo `vitest.config.js` contiene la configuración:

- **Entorno:** Node.js
- **Patrón de archivos:** `*.test.js`
- **Timeout:** 10000ms
- **Cobertura:** Incluye services y middlewares, excluye config y tests

## Notas de Implementación

### mocks/repositories.js
Proporciona datos mock y funciones de mock para simular el comportamiento de los repositorios sin necesidad de una base de datos real.

### mockPool
El mock de la base de datos permite simular conexiones y transacciones sin requerir PostgreSQL.

### ExcelJS Mock
Las pruebas de generación de reportes usan mocks de ExcelJS para evitar dependencias externas.

## Recomendaciones para Completar las Pruebas

1. **Configurar Base de Datos de Test:** Para pruebas completas, configurar una base de datos PostgreSQL de test
2. **Integrar con CI/CD:** Agregar las pruebas al pipeline de integración continua
3. **Ampliar Cobertura:** Agregar pruebas para controllers y más edge cases
4. **Tests de Integración:** Crear tests que prueben la integración completa de los endpoints

## Archivos Creados

- `vitest.config.js` - Configuración de Vitest
- `tests/setup.js` - Configuración global de pruebas
- `tests/mocks/repositories.js` - Mocks de repositorios
- `tests/*.test.js` - Archivos de pruebas para cada servicio/middleware
- `package.json` - Scripts actualizados con comandos de testing