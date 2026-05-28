# Pruebas TDD - SIGADBP Frontend (Vue.js)

Este directorio contiene las pruebas unitarias siguiendo la metodología TDD (Test-Driven Development) de XP (Extreme Programming).

## Estructura

```
tests/
├── README.md                    # Este archivo
├── setup.js                     # Configuración global de pruebas
├── mocks/
│   └── api.js                   # Mocks para API y datos de prueba
├── login.utils.test.js           # Pruebas de validación de login
├── usuarios.utils.test.js        # Pruebas de validación de usuarios
├── usuarios.services.test.js     # Pruebas del servicio de usuarios
├── bienes.services.test.js       # Pruebas del servicio de bienes
├── useNotificaciones.test.js     # Pruebas del composable de notificaciones
└── Login.test.js                # Pruebas del componente de Login
```

## Pruebas Implementadas

### 1. login.utils.test.js
Pruebas para los schemas de validación de Zod en `login.utils.js`:

**loginSchema:**
- ✓ Valida objeto de login válido
- ✓ Falla si el username está vacío
- ✓ Falla si la contraseña está vacía
- ✓ Falla si ambos campos están vacíos
- ✓ Falla si faltan ambos campos

**nuevaContrasenaSchema:**
- ✓ Valida contraseña válida con requisitos mínimos
- ✓ Falla si la contraseña tiene menos de 8 caracteres
- ✓ Falla si la contraseña no tiene minúscula
- ✓ Falla si la contraseña no tiene mayúscula
- ✓ Falla si la contraseña no tiene número
- ✓ Falla si las contraseñas no coinciden
- ✓ Falla si confirmar contraseña está vacío
- ✓ Valida contraseña con caracteres especiales

### 2. usuarios.utils.test.js
Pruebas para constantes y schemas de `usuarios.utils.js`:

**Constants:**
- ✓ Tiene exactamente 3 roles definidos
- ✓ Tiene 10 preguntas de seguridad
- ✓ Tiene preguntas de seguridad no vacías
- ✓ Tiene roles únicos

**Schemas:**
- ✓ Exporta createUsuarioSchema
- ✓ Exporta createPerfilSchema
- ✓ Crea schema para crear usuario (no edit mode)
- ✓ Crea schema para editar usuario

### 3. useNotificaciones.test.js
Pruebas para el composable `useNotificaciones.js`:

**showSuccess:**
- ✓ Llama a toast.add con severity success
- ✓ Usa mensaje predeterminado si no se proporciona
- ✓ Usa mensaje personalizado si se proporciona
- ✓ Establece life en 5000ms

**showError:**
- ✓ Llama a toast.add con severity error
- ✓ Usa mensaje predeterminado si no se proporciona
- ✓ Usa mensaje personalizado si se proporciona

**showWarning:**
- ✓ Llama a toast.add con severity warn
- ✓ Usa mensaje predeterminado si no se proporciona
- ✓ Usa mensaje personalizado si se proporciona

### 4. usuarios.services.test.js
Pruebas para el servicio `usuarios.services.js`:

**listar():**
- ✓ Hace GET /usuarios y retorna los datos
- ✓ Maneja errores de red

**login():**
- ✓ Hace POST /usuarios/login con credenciales
- ✓ Retorna autenticado: false cuando credenciales son inválidas

**crear():**
- ✓ Hace POST /usuarios con datos del usuario

**obtener():**
- ✓ Hace GET /usuarios/:id y retorna el usuario

**actualizar():**
- ✓ Hace PUT /usuarios con datos actualizados

**eliminar():**
- ✓ Hace DELETE /usuarios/:id

**validarUsernameCorreo():**
- ✓ Hace POST /usuarios/username-correo
- ✓ Incluye id cuando se proporciona para edición

**recuperarContrasena():**
- ✓ Hace POST /usuarios/recuperar-contrasena

**actualizarContrasena():**
- ✓ Hace PUT /usuarios/cambiar-contrasena

### 5. bienes.services.test.js
Pruebas para el servicio `bienes.services.js`:

**listar():**
- ✓ Hace GET /bienes y retorna los bienes
- ✓ Retorna array vacío si no hay bienes

**obtener():**
- ✓ Hace GET /bienes/:id y retorna el bien

**crear():**
- ✓ Hace POST /bienes con datos del bien

**actualizar():**
- ✓ Hace PUT /bienes con datos actualizados

**eliminar():**
- ✓ Hace DELETE /bienes/:id

**listarOperativos():**
- ✓ Hace GET /bienes/operativos

**listarNoAsignados():**
- ✓ Hace GET /bienes/no-asignados

**validarNumero():**
- ✓ Hace POST /bienes/validar-numero y retorna esUnico
- ✓ Retorna false si el número ya existe
- ✓ Incluye id para edición

**generarReporte():**
- ✓ Hace GET /bienes/reporte/:idDependencia con responseType blob

### 6. Login.test.js
Pruebas para el componente de Login y su flujo:

**Estructura del formulario:**
- ✓ Tiene username y contrasena en el formulario
- ✓ Tiene estado inicial con cargando en false
- ✓ Tiene esquema de validación definido

**Validación:**
- ✓ Valida que username no esté vacío
- ✓ Valida que contrasena no esté vacía
- ✓ Tiene credenciales válidas según esquema

**Flujo de Login:**
- ✓ Llama a usuariosService.login con valores del formulario
- ✓ Guarda sesión en localStorage cuando login es exitoso
- ✓ Guarda token en socket.auth
- ✓ Conecta socket después de login exitoso
- ✓ Maneja respuesta de login fallido
- ✓ Maneja errores de red

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
# Solo pruebas de login utils
npm test -- login.utils

# Solo pruebas de servicios de usuarios
npm test -- usuarios.services

# Solo pruebas del componente Login
npm test -- Login
```

## Configuración de Testing

El archivo `vite.config.js` contiene la configuración:

- **Entorno:** jsdom (simulación de DOM)
- **Patrón de archivos:** `*.test.js`
- **Timeout:** 10000ms
- **Cobertura:** Incluye utils, services y components

## Mocks Disponibles

En `tests/mocks/api.js` encontrarás:

- `mockUsuarios` - Datos de prueba de usuarios
- `mockBienes` - Datos de prueba de bienes
- `mockLoginResponse` - Respuesta simulada de login
- `mockSession` - Sesión simulada de usuario
- `mockApi` - Funciones mock para axios

## Recomendaciones para Completar las Pruebas

1. **Componentes Vue:** Agregar pruebas para componentes como BienesView, UsuarioRegister, etc.
2. **Composables:** Agregar pruebas para más composables como useFormatters
3. **Integración:** Crear tests de integración para flujos completos
4. **E2E:** Considerar agregar Cypress para pruebas end-to-end

## Archivos Creados

- `vite.config.js` - Configuración de Vitest actualizada
- `package.json` - Scripts de testing añadidos
- `tests/setup.js` - Configuración global
- `tests/mocks/api.js` - Mocks de API
- `tests/*.test.js` - Archivos de pruebas

## Dependencias Añadidas

```json
"devDependencies": {
  "vitest": "^4.1.7",
  "@vitest/ui": "^4.1.7",
  "@vitest/coverage-v8": "^4.1.7",
  "@vue/test-utils": "^2.4.6",
  "jsdom": "^24.0.0"
}
```

## Tips para Escribir Pruebas TDD

1. **Red-Green-Refactor:** Escribe una prueba que falle, implementa el código mínimo para que pase, luego refactoriza.
2. **Mocks:** Usa mocks para aislar las pruebas de dependencias externas.
3. **Arrange-Act-Assert:** Estructura tus pruebas con esta convención.
4. **Nombres descriptivos:** Usa nombres de prueba que describan el comportamiento esperado.