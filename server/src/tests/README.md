# Tests TDD - Backend SIGADBP

Este directorio contiene las pruebas unitarias siguiendo la metodología **TDD (Test-Driven Development)** de **XP (Extreme Programming)**.

## Metodología XP TDD

El ciclo de desarrollo es:

1. **RED** 🔴 - Escribir un test que falla primero
2. **GREEN** 🟢 - Implementar el código mínimo para que pase
3. **REFACTOR** 🔵 - Limpiar y mejorar el código

## Servicios Probados

| Servicio | Tests | Descripción |
|----------|-------|-------------|
| `UsuariosService` | 14 | Autenticación, usuarios, contraseñas |
| `BienesService` | 19 | Bienes muebles, tecnológicos, vehículos |
| `IncorporacionesService` | 10 | Incorporación de bienes al sistema |
| `DesincorporacionesService` | 11 | Desincorporación de bienes |

**Total: 54 tests**

## Ejecutar los Tests

```bash
cd server

# Ejecutar tests una vez
npm run test:run

# Ejecutar en modo watch (recomendado durante desarrollo)
npm test

# Ejecutar con cobertura de código
npm run test:coverage
```

## Estructura de Archivos

```
server/src/tests/
├── __mocks__/
│   ├── bcrypt.js          # Mock de bcrypt
│   └── jsonwebtoken.js    # Mock de JWT
├── usuariosService.test.js       # Tests de usuarios
├── bienesServices.test.js        # Tests de bienes
├── incorporacionesService.test.js # Tests de incorporaciones
└── desincorporacionesService.test.js # Tests de desincorporaciones
```

## Configuración

La configuración de Vitest está en `server/vitest.config.js`:

- **Entorno**: Node.js
- **Directorio de tests**: `src/tests/**/*.test.js`
- **Timeout**: 10 segundos por test

## Escribir Nuevos Tests

### Estructura Básica

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MiServicio - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('miMetodo', () => {
    // TEST 1: Caso de uso normal
    it('debe retornar X cuando Y', async () => {
      // Arrange: preparar datos de prueba
      mockRepositorio.metodo.mockResolvedValue(expectedValue);
      
      // Act: ejecutar el método a probar
      const resultado = await MiService.miMetodo(input);
      
      // Assert: verificar el resultado
      expect(resultado).toBe(expectedValue);
    });
  });
});
```

### Convenciones

- Usar **`it()`** con descripción en español
- Incluir comment **// TEST N** para identificar cada test
- Etiquetar con **// RED**, **// GREEN**, o **// REFACTOR** según corresponda
- Usar mocks para dependencias externas (repositorios, bcrypt, jwt)

## Mocks Disponibles

Los mocks de dependencias externas ya están configurados:

- **bcrypt**: Hash y comparación de contraseñas
- **jsonwebtoken**: Firma y verificación de tokens
- **database**: Pool de conexiones PostgreSQL
- **Repositories**: Todos los repositorios del proyecto

## Cobertura de Tests

Para ver la cobertura de código, ejecuta:

```bash
npm run test:coverage
```

Se generará un reporte en `coverage/` con formato HTML.

## Mejores Prácticas

1. **Un test, una responsabilidad**: Cada test debe verificar un solo comportamiento
2. **Nombres descriptivos**: El nombre del test debe describir qué hace
3. **Preparación (Arrange), Acción (Act), Verificación (Assert)**: Estructura clara
4. **Independencia**: Los tests no deben depender entre sí
5. **Rápidos**: Los tests unitarios deben ejecutarse en milisegundos

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [XP TDD](https://en.wikipedia.org/wiki/Test-driven_development)
- [Extreme Programming](https://en.wikipedia.org/wiki/Extreme_programming)
