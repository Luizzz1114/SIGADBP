-- Active: 1775572526746@@127.0.0.1@5432@sigadbp_bd
--- TABLAS ---


-- 1. GEOGRAFÍA
CREATE TABLE Estados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE
);

CREATE TABLE Municipios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50),
  idEstado INT REFERENCES Estados(id)
);

CREATE TABLE Parroquias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50),
  idMunicipio INT REFERENCES Municipios(id)
);


-- 2. ORGANIZACIÓN Y PERSONAL
CREATE TABLE Dependencias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  direccion TEXT NOT NULL,
  idParroquia INT REFERENCES Parroquias(id)
);

CREATE TABLE Cargos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(100) NOT NULL
);

CREATE TABLE Personal (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(10) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fechaNacimiento DATE NOT NULL,
  genero VARCHAR(10) NOT NULL,
  telefono VARCHAR(20),
  nivelProfesional VARCHAR(10),
  estatus VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE HistorialCargos (
  id SERIAL PRIMARY KEY,
  fechaIngreso DATE,
  fechaSalida DATE DEFAULT NULL,
  idPersonal INT REFERENCES Personal(id) ON DELETE CASCADE,
  idCargo INT REFERENCES Cargos(id),
  idDependencia INT REFERENCES Dependencias(id)
);

CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  correo VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizacion TIMESTAMP DEFAULT NULL,
  pregunta TEXT,
  respuesta VARCHAR(255),
  idPersonal INT REFERENCES Personal(id)
);


-- 3. FINANZAS Y BIENES
CREATE TABLE Presupuestos (
  id SERIAL PRIMARY KEY,
  codigoPartida VARCHAR(50),
  anioFiscal INT,
  semestre VARCHAR(50),
  tipo VARCHAR(100),
  montoUsd DECIMAL(15, 2),
  montoBs DECIMAL(15, 2),
  tasaCambio DECIMAL(15, 2),
  fechaRegistro DATE DEFAULT CURRENT_DATE,
  estatus VARCHAR(50) DEFAULT 'Activo',
  descripcion TEXT
);

CREATE TABLE Incorporaciones (
  id SERIAL PRIMARY KEY,
  fechaEntrada DATE NOT NULL,
  ordenCompra VARCHAR(100),
  factura VARCHAR(100),
  notaEntrega VARCHAR(100),
  proveedor VARCHAR(150),
  motivo VARCHAR(100) NOT NULL,
  idDependencia INT REFERENCES Dependencias(id),
  idPersonal INT REFERENCES Personal(id)
);

CREATE TABLE Bienes (
  id SERIAL PRIMARY KEY,
  numeroBien VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  estatus VARCHAR(20) DEFAULT 'No asignado',
  categoria VARCHAR(50) NOT NULL,
  idIncorporacion INT REFERENCES Incorporaciones(id) ON DELETE SET NULL,
  idDependencia INT REFERENCES Dependencias(id),
  idPersonal INT REFERENCES Personal(id)
);

-- Índice para manejar bienes sin número (S/N)
CREATE UNIQUE INDEX idx_unique_numero_real 
ON Bienes (numeroBien) 
WHERE numeroBien <> 'S/N';


-- 4. ESPECIALIZACIONES DE BIENES
CREATE TABLE Muebles (
  idMueble INTEGER PRIMARY KEY REFERENCES Bienes(id) ON DELETE CASCADE,
  tipoMueble VARCHAR(100),
  material VARCHAR(100)
);

CREATE TABLE Tecnologicos (
  idTecnologico INTEGER PRIMARY KEY REFERENCES Bienes(id) ON DELETE CASCADE,
  especificaciones TEXT,
  serial VARCHAR(100)
);

CREATE TABLE Vehiculos (
  idVehiculo INTEGER PRIMARY KEY REFERENCES Bienes(id) ON DELETE CASCADE,
  color VARCHAR(50),
  placa VARCHAR(20),
  serialCarroceria VARCHAR(100)
);


-- 5. MANTENIMIENTO Y GASTOS
CREATE TABLE Mantenimientos (
  id SERIAL PRIMARY KEY,
  fechaInicio DATE NOT NULL,
  fechaFin DATE,
  estadoPosterior VARCHAR(20),
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  estatus VARCHAR(20) DEFAULT 'En proceso',
  idBien INT REFERENCES Bienes(id) ON DELETE CASCADE
);

CREATE TABLE Gastos (
  id SERIAL PRIMARY KEY,
  fecha DATE DEFAULT CURRENT_DATE,
  monto NUMERIC(15, 2) NOT NULL,
  idPresupuesto INT REFERENCES Presupuestos(id),
  idBien INT REFERENCES Bienes(id) ON DELETE CASCADE,
  idMantenimiento INT REFERENCES Mantenimientos(id) ON DELETE CASCADE
);


-- 6. DESINCORPORACIONES
CREATE TABLE Desincorporaciones (
  id SERIAL PRIMARY KEY,
  fechaSalida DATE NOT NULL,
  descripcion TEXT,
  idDependencia INT REFERENCES Dependencias(id),
  idPersonal INT REFERENCES Personal(id)
);

CREATE TABLE DetallesDesincorporacion (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  idDesincorporacion INT REFERENCES Desincorporaciones(id) ON DELETE CASCADE,
  idBien INT REFERENCES Bienes(id) ON DELETE CASCADE
);


-- 7. MOVIMIENTOS
CREATE TABLE Movimientos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50),
  motivo VARCHAR(100),
  fecha DATE,
  idCedente INT REFERENCES Personal(id),
  idReceptor INT REFERENCES Personal(id),
  idOrigen INT REFERENCES Dependencias(id),
  idDestino INT REFERENCES Dependencias(id)
);

CREATE TABLE DetallesMovimientos (
  id SERIAL PRIMARY KEY,
  idMovimiento INT REFERENCES Movimientos(id) ON DELETE CASCADE,
  idBien INT REFERENCES Bienes(id) ON DELETE CASCADE
);


-- 8. EVALUACIONES DEL PERSONAL
CREATE TABLE Evaluaciones (
  id SERIAL PRIMARY KEY,
  capacitacion INT NOT NULL,
  satisfaccion INT NOT NULL,
  semestre VARCHAR(50),
  fecha DATE DEFAULT CURRENT_DATE,
  idPersonal INT REFERENCES Personal(id)
);


-- 9. INDICADORES DE GESTIÓN
CREATE TABLE Indicadores (
  id SERIAL PRIMARY KEY,
  perspectiva VARCHAR(100) NOT NULL,
  denominacion VARCHAR(255) NOT NULL,
  meta NUMERIC(15, 2),
  peligro NUMERIC(15, 2),
  frecuencia VARCHAR(50) NOT NULL
);

CREATE TABLE Metricas (
  id SERIAL PRIMARY KEY,
  periodo VARCHAR(50) NOT NULL,
  valor NUMERIC(15, 2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  detalles JSONB,
  idIndicador INT NOT NULL REFERENCES Indicadores(id) ON DELETE CASCADE
);




--- TRIGGERS ---


-- 1. ESTATUS DE BIEN Y MANTENIMIENTO
CREATE OR REPLACE FUNCTION sincronizar_estatus_mantenimiento()
RETURNS TRIGGER AS $$
DECLARE
  v_bien RECORD;
  v_estatus TEXT;
BEGIN

  SELECT id, estatus, idDependencia, idPersonal
  INTO v_bien
  FROM Bienes
  WHERE id = NEW.idBien;

  IF v_bien.id IS NULL OR v_bien.estatus = 'Desincorporado' THEN
    RETURN NEW;
  END IF;

  IF NEW.estatus = 'En proceso' THEN
    v_estatus := 'En mantenimiento';
  ELSE
    IF v_bien.idDependencia IS NULL AND v_bien.idPersonal IS NULL THEN
      v_estatus := 'No asignado';
    ELSE 
      v_estatus := 'Operativo';
    END IF;
  END IF;

  IF v_estatus IS DISTINCT FROM v_bien.estatus THEN
    UPDATE Bienes SET estatus = v_estatus WHERE id = v_bien.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_mantenimiento_sincronizar_estatus
AFTER INSERT OR UPDATE ON Mantenimientos
FOR EACH ROW
EXECUTE FUNCTION sincronizar_estatus_mantenimiento();


CREATE OR REPLACE FUNCTION revertir_estatus_al_eliminar()
RETURNS TRIGGER AS $$
DECLARE
  v_bien RECORD;
  v_estatus TEXT;
BEGIN
  
  SELECT id, estatus, idDependencia, idPersonal
  INTO v_bien
  FROM Bienes
  WHERE id = OLD.idBien;

  IF v_bien.id IS NULL OR v_bien.estatus = 'Desincorporado' THEN
    RETURN OLD;
  END IF;

  IF v_bien.idDependencia IS NULL AND v_bien.idPersonal IS NULL THEN
    v_estatus := 'No asignado';
  ELSE
    v_estatus := 'Operativo';
  END IF;

  IF v_estatus IS DISTINCT FROM v_bien.estatus THEN
    UPDATE Bienes SET estatus = v_estatus WHERE id = v_bien.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_mantenimiento_eliminar
AFTER DELETE ON Mantenimientos
FOR EACH ROW
WHEN (OLD.estatus = 'En proceso')
EXECUTE FUNCTION revertir_estatus_al_eliminar();


--- Historial de cambios en el personal ---
CREATE OR REPLACE FUNCTION cerrar_cargo_anterior()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE HistorialCargos
  SET fechaSalida = NEW.fechaIngreso
  WHERE idPersonal = NEW.idPersonal
    AND id != NEW.id
    AND fechaSalida IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_nuevo_cargo_historial
BEFORE INSERT ON HistorialCargos
FOR EACH ROW
EXECUTE FUNCTION cerrar_cargo_anterior();




--- VISTAS ---


-- 1. INFORMACION GENERAL DE DEPENDENCIAS
CREATE OR REPLACE VIEW vistaDependencias AS
WITH count_bienes AS (
	SELECT idDependencia, COUNT(*) as total_bienes
	FROM Bienes
	GROUP BY idDependencia
),
count_personal AS (
	SELECT idDependencia, COUNT(*) as total_personal
	FROM HistorialCargos
  WHERE fechaSalida IS NULL
	GROUP BY idDependencia
)
SELECT D.id, D.nombre, D.tipo, D.direccion,
	P.id AS idp, P.nombre AS parroquia,
	M.id AS idm, M.nombre AS municipio,
	E.id AS ide, E.nombre AS estado,
	COALESCE(CB.total_bienes, 0) AS total_bienes,
	COALESCE(CP.total_personal, 0) AS total_personal
FROM Dependencias AS D
INNER JOIN Parroquias P ON D.idParroquia = P.id
INNER JOIN Municipios M ON P.idMunicipio = M.id
INNER JOIN Estados E ON M.idEstado = E.id
LEFT JOIN count_bienes CB ON D.id = CB.idDependencia
LEFT JOIN count_personal CP ON D.id = CP.idDependencia;


-- 2. INFORMACIÓN GENERAL DEL PERSONAL
CREATE OR REPLACE VIEW vistaPersonal AS
WITH count_bienes AS (
	SELECT idPersonal, COUNT(*) AS bienes_asignados
	FROM Bienes
	GROUP BY idPersonal
)
SELECT P.id, P.cedula, P.nombres, P.apellidos, CONCAT_WS(' ', nombres, apellidos) AS empleado, P.nivelProfesional AS nivel_profesional,
	TO_CHAR(P.fechaNacimiento, 'DD/MM/YYYY') AS fechaNacimiento, DATE_PART('YEAR', AGE(P.fechaNacimiento)) AS edad,
	P.genero, P.telefono, P.nivelProfesional, P.estatus,
	C.id idc, C.nombre AS cargo, C.tipo AS tipo_cargo, D.id idd, D.nombre dependencia,
	HC.id idhc, TO_CHAR(HC.fechaIngreso, 'DD/MM/YYYY') AS fechaIngreso, TO_CHAR(HC.fechaSalida, 'DD/MM/YYYY') AS fechaSalida,
	DATE_PART('YEAR', AGE(COALESCE(HC.fechaSalida, CURRENT_DATE), HC.fechaIngreso)) AS antiguedad,
	COALESCE(CB.bienes_asignados, 0) AS bienes_asignados
FROM Personal P
LEFT JOIN HistorialCargos HC ON HC.idPersonal = P.id AND HC.fechaSalida IS NULL
LEFT JOIN Cargos C ON HC.idCargo = C.id
LEFT JOIN Dependencias D ON HC.idDependencia = D.id
LEFT JOIN count_bienes CB ON P.id = CB.idPersonal;


-- 3. USUARIOS
CREATE OR REPLACE VIEW vistaUsuarios AS
SELECT U.id, U.username, U.correo, U.rol, U.pregunta,
  TO_CHAR(U.fechaCreacion, 'DD/MM/YYYY HH24:MI') AS creacion,
  TO_CHAR(U.fechaActualizacion, 'DD/MM/YYYY HH24:MI') AS actualizacion,
  P.id AS idp, P.cedula, P.nombres, P.apellidos, CONCAT_WS(' ', P.nombres, P.apellidos) AS empleado
FROM Usuarios U
INNER JOIN Personal P ON U.idPersonal = P.id;


-- 4. PRESUPUESTOS
CREATE OR REPLACE VIEW vistaPresupuestos AS
WITH resumen_gastos AS (
  SELECT idPresupuesto, SUM(monto) AS total_gastos
  FROM Gastos 
  GROUP BY idPresupuesto
)
SELECT 
  P.id, P.codigoPartida AS codigo, P.anioFiscal AS anio, P.semestre, P.tipo,
  P.montoUsd, P.montoBs, P.tasaCambio, P.estatus, P.descripcion, 
  TO_CHAR(P.fechaRegistro, 'DD/MM/YYYY') AS fechaRegistro,
  COALESCE(RG.total_gastos, 0) AS total_gastos, 
  (P.montoUsd - COALESCE(RG.total_gastos, 0)) AS total_disponible
FROM Presupuestos P
LEFT JOIN resumen_gastos RG ON P.id = RG.idPresupuesto;


-- 5. MANTENIMIENTOS
CREATE OR REPLACE VIEW vistaMantenimiento AS
SELECT 
  M.id AS id, 
  M.tipo, 
  TO_CHAR(M.fechaInicio, 'DD/MM/YYYY') AS fecha_inicio, 
  TO_CHAR(M.fechaFin, 'DD/MM/YYYY') AS fecha_fin,
  M.estatus AS estatus, 
  M.estadoPosterior AS estado_posterior, 
  M.descripcion AS descripcion,
  (COALESCE(m.fechaFin, CURRENT_DATE) - m.fechaInicio) + 1 AS dias_duracion,
  b.id AS id_bien, 
  b.numeroBien AS numero_bien, 
  b.descripcion AS descripcion_bien, 
  b.categoria AS categoria_bien,
  COALESCE(g.monto, 0) AS gasto, 
  VP.id AS id_presupuesto, 
  VP.codigo AS codigo_partida, 
  VP.tipo AS tipo_presupuesto,
  VP.montoUsd AS monto, 
  VP.anio AS anio_fiscal,
  VP.total_disponible AS total_disponible,
  D.nombre AS dependencia, 
  PE.cedula, 
  CONCAT_WS(' ', PE.nombres, PE.apellidos) AS responsable
FROM Mantenimientos M
INNER JOIN Bienes B ON M.idBien = B.id
LEFT JOIN Gastos G ON M.id = G.idMantenimiento
LEFT JOIN vistaPresupuestos VP ON G.idPresupuesto = VP.id
LEFT JOIN Dependencias D ON B.idDependencia = D.id
LEFT JOIN Personal PE ON B.idPersonal = PE.id;


-- 6. MOVIMIENTOS
CREATE OR REPLACE VIEW vistaMovimientos AS
WITH resumen_bienes AS (
  SELECT DM.idMovimiento, COUNT(DM.idBien) AS cantidad_bienes
  FROM DetallesMovimientos AS DM
  GROUP BY DM.idMovimiento
)
SELECT 
  M.id, M.tipo, TO_CHAR(M.fecha, 'DD/MM/YYYY') AS fecha, M.motivo,
  D_orig.id AS id_origen, 
  D_orig.nombre AS dependencia_origen,
  P_ced.id AS id_cedente, 
  P_ced.cedula AS cedula_cedente, 
  CONCAT(P_ced.nombres, ' ', P_ced.apellidos) AS cedente,
  VP_ced.nivelProfesional AS nivel_profesional_cedente, -- NUEVO
  VP_ced.cargo AS cargo_cedente,                        -- NUEVO
  D_dest.id AS id_destino, 
  D_dest.nombre AS dependencia_destino,
  P_rec.id AS id_receptor, 
  P_rec.cedula AS cedula_receptor, 
  CONCAT(P_rec.nombres, ' ', P_rec.apellidos) AS receptor,
  VP_rec.nivelProfesional AS nivel_profesional_receptor, -- NUEVO
  VP_rec.cargo AS cargo_receptor,                        -- NUEVO
  COALESCE(RB.cantidad_bienes, 0) AS cantidad_bienes
FROM Movimientos M
LEFT JOIN resumen_bienes RB ON M.id = RB.idMovimiento
INNER JOIN Dependencias D_orig ON D_orig.id = M.idOrigen
INNER JOIN Dependencias D_dest ON D_dest.id = M.idDestino
INNER JOIN Personal P_ced ON P_ced.id = M.idCedente
INNER JOIN Personal P_rec ON P_rec.id = M.idReceptor
LEFT JOIN vistaPersonal VP_ced ON VP_ced.id = P_ced.id
LEFT JOIN vistaPersonal VP_rec ON VP_rec.id = P_rec.id;

CREATE OR REPLACE VIEW vistaBienesPorMovimiento AS
SELECT 
  B.id AS id, 
  B.numeroBien AS numero, 
  B.descripcion, 
  B.marca, 
  B.modelo, 
  B.categoria,
  COALESCE(T.serial, V.serialCarroceria, 'S/S') AS serial,
  DM.idMovimiento
FROM Bienes B
INNER JOIN DetallesMovimientos DM ON B.id = DM.idBien
LEFT JOIN Tecnologicos T ON B.id = T.idTecnologico
LEFT JOIN Vehiculos V ON B.id = V.idVehiculo;


-- 7. DESINCORPORACIONES
CREATE OR REPLACE VIEW vistaDesincorporaciones AS
WITH resumen_bienes AS (
  SELECT DD.idDesincorporacion, COUNT(DD.idBien) AS cantidad_bienes
  FROM DetallesDesincorporacion AS DD
  GROUP BY DD.idDesincorporacion
)
SELECT D.id, TO_CHAR(D.fechaSalida, 'DD/MM/YYYY') AS fecha_salida, D.descripcion,
  P.id AS idp, P.cedula, CONCAT(P.nombres, ' ', P.apellidos) AS responsable, C.nombre AS cargo, P.nivelProfesional AS nivel_profesional,
  DP.id AS idd, DP.nombre AS dependencia,
  RB.cantidad_bienes
FROM Desincorporaciones D
INNER JOIN resumen_bienes RB ON D.id = RB.idDesincorporacion
INNER JOIN Dependencias DP ON DP.id = D.idDependencia
INNER JOIN Personal P ON P.id = D.idPersonal
INNER JOIN HistorialCargos HC ON P.id = HC.idPersonal AND HC.fechaSalida IS NULL
INNER JOIN Cargos C ON C.id = HC.idCargo;

CREATE VIEW vistaBienesDesincorporados AS
SELECT B.id, B.numeroBien AS numero, B.descripcion, B.marca, B.modelo, B.categoria,
DD.idDesincorporacion, DD.tipo AS tipo_desincorporacion
FROM Bienes B
INNER JOIN DetallesDesincorporacion DD ON B.id = DD.idBien
WHERE B.estatus = 'Desincorporado';


-- 8. INCORPORACIONES
CREATE OR REPLACE VIEW vistaIncorporaciones AS
WITH ResumenBienes AS (
  SELECT B.idIncorporacion, 
    COUNT(B.id) AS cantidad_bienes,
    SUM(G.monto) AS total_gasto
  FROM Bienes B
  LEFT JOIN Gastos G ON B.id = G.idBien
  GROUP BY B.idIncorporacion
)
SELECT I.id, TO_CHAR(I.fechaEntrada, 'DD/MM/YYYY') AS fecha_entrada, I.motivo, I.ordenCompra AS orden_compra, I.notaEntrega AS nota_entrega, I.factura, I.proveedor,
  P.id AS idp, P.cedula, CONCAT(P.nombres, ' ', P.apellidos) AS responsable, C.nombre AS cargo, P.nivelProfesional AS nivel_profesional,
  D.id AS idd, D.nombre AS dependencia,
  RB.total_gasto, RB.cantidad_bienes
FROM Incorporaciones I
INNER JOIN ResumenBienes RB ON I.id = RB.idIncorporacion
INNER JOIN Dependencias D ON D.id = I.idDependencia
INNER JOIN Personal P ON P.id = I.idPersonal
INNER JOIN HistorialCargos HC ON P.id = HC.idPersonal AND HC.fechaSalida IS NULL
INNER JOIN Cargos C ON C.id = HC.idCargo;

CREATE OR REPLACE VIEW vistaGastosPorIncorporacion AS
SELECT B.id, B.numeroBien AS numero, B.descripcion, B.marca, B.modelo, B.estatus, B.categoria, B.idIncorporacion,
G.monto as gasto, G.idPresupuesto, p.tipo, p.montousd
FROM Bienes B
LEFT JOIN Gastos G ON B.id = G.idBien
LEFT JOIN Presupuestos P ON P.id = G.idPresupuesto;


-- 9. BIENES
CREATE OR REPLACE VIEW vistaBienes AS
SELECT B.id, b.numeroBien AS numero, B.descripcion, B.marca, B.modelo, B.estatus, B.categoria,
  M.tipoMueble, M.material,
  T.especificaciones, T.serial,
  V.color, V.placa, V.serialCarroceria,
  P.id AS idp, CONCAT_WS(' ', P.nombres, P.apellidos) AS responsable, P.cedula AS cedula_responsable,
  D.id AS idd, D.nombre AS dependencia
FROM Bienes B
LEFT JOIN Muebles M ON B.id = M.idMueble
LEFT JOIN Tecnologicos T ON B.id = T.idTecnologico
LEFT JOIN Vehiculos V ON B.id = V.idVehiculo
LEFT JOIN Personal P ON B.idPersonal = P.id
LEFT JOIN Dependencias D ON B.idDependencia = D.id;


-- 10. RESPONSABLES Y DEPENDENCIAS
CREATE OR REPLACE VIEW vistaResponsables AS
SELECT DISTINCT ON (D.id) 
  D.id, 
  D.nombre, 
  D.tipo, 
  D.direccion,
  P.id AS idr, 
  CONCAT_WS(' ', P.nombres, P.apellidos) AS responsable, 
  P.cedula,
  P.nivelProfesional AS nivel_profesional,
  C.nombre as cargo
FROM Dependencias AS D
INNER JOIN HistorialCargos AS HC ON HC.idDependencia = D.id AND HC.fechaSalida IS NULL
INNER JOIN Personal AS P ON HC.idPersonal = P.id
INNER JOIN Cargos AS C ON HC.idCargo = C.id
WHERE C.tipo IS DISTINCT FROM 'Personal de la Unidad de Administración'
ORDER BY D.id, HC.fechaIngreso DESC;

-- 11. VISTA GENERAL PARA LOS KPI
CREATE OR REPLACE VIEW vistaIndicadores AS 
SELECT I.id AS id_indicador, I.denominacion, I.frecuencia, I.meta, I.peligro,
  COALESCE(
    json_agg(
      json_build_object(
        'valor', M.valor,
        'periodo', M.periodo,
        'fecha', M.fecha,
        'detalles', M.detalles
      ) ORDER BY M.fecha ASC
    ) FILTER (WHERE M.fecha IS NOT NULL), 
    '[]'::json
  ) AS historial_metricas
FROM Indicadores I
LEFT JOIN LATERAL (
    SELECT valor, periodo, fecha, detalles
    FROM Metricas 
    WHERE idIndicador = I.id 
    ORDER BY fecha DESC
    LIMIT 6
) AS M ON true
GROUP BY I.id, I.denominacion, I.frecuencia, I.meta, I.peligro;


CREATE OR REPLACE VIEW vistaHistorialCargos AS
SELECT 
  P.cedula, CONCAT_WS(' ', P.nombres, P.apellidos) AS empleado,
  C.nombre AS cargo, C.tipo AS tipo_cargo, D.nombre AS dependencia,
  HC.fechaIngreso AS fecha_ingreso_raw,
  TO_CHAR(HC.fechaIngreso, 'DD/MM/YYYY') AS fecha_ingreso,
  TO_CHAR(HC.fechaSalida, 'DD/MM/YYYY') AS fecha_salida,
  CASE 
    WHEN HC.fechaSalida IS NULL THEN 'Actual'
    ELSE 'Anterior'
  END AS estado_cargo,
  AGE(COALESCE(HC.fechaSalida, CURRENT_DATE), HC.fechaIngreso) AS tiempo_en_cargo
FROM HistorialCargos HC
INNER JOIN Personal P ON HC.idPersonal = P.id
INNER JOIN Cargos C ON HC.idCargo = C.id
INNER JOIN Dependencias D ON HC.idDependencia = D.id;


--- VISTAS PARA LOS KPI Y DASHBOARD ---


-- CONTADORES BÁSICOS
CREATE OR REPLACE VIEW vistaMetricasBasicas AS
SELECT 
(SELECT COUNT(*) FROM Bienes WHERE estatus != 'Desincorporado') AS total_bienes,
(SELECT COUNT(*) FROM Dependencias) AS total_dependencias,
(SELECT COUNT(*) FROM Incorporaciones WHERE fechaEntrada >= DATE_TRUNC('month', CURRENT_DATE)) AS incorporaciones_mes,
(SELECT COUNT(*) FROM Desincorporaciones WHERE fechaSalida >= DATE_TRUNC('month', CURRENT_DATE)) AS desincorporaciones_mes,
(SELECT COUNT(*) FROM Movimientos WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)) AS movimientos_mes,
(SELECT COUNT(*) FROM Mantenimientos WHERE fechaInicio >= DATE_TRUNC('month', CURRENT_DATE)) AS mantenimientos_mes;


-- %IBEO
CREATE OR REPLACE VIEW vistaBienesPorEstatus AS
WITH resumen_bienes AS (
  SELECT 
  COUNT(*) FILTER (WHERE estatus = 'Operativo') AS operativos,
  COUNT(*) FILTER (WHERE estatus = 'En mantenimiento') AS mantenimiento,
  COUNT(*) FILTER (WHERE estatus = 'No asignado') AS noasignados,
  COUNT(*) FILTER (WHERE estatus != 'Desincorporado') AS activos
  FROM Bienes
)
SELECT 
  operativos, ROUND((operativos * 100.0) / NULLIF(activos, 0), 2) AS p_operativos,
  mantenimiento, ROUND((mantenimiento * 100.0) / NULLIF(activos, 0), 2) AS p_mantenimiento,
  noasignados, ROUND((noasignados * 100.0) / NULLIF(activos, 0), 2) AS p_noasignados,
  activos
FROM resumen_bienes;


-- %IBDT, %IBTMCD, %IBTTCD, %IBTVCD
CREATE OR REPLACE VIEW vistaBienesPorDependencia AS
WITH conteo_categorias AS (
SELECT 
  idDependencia,
  COUNT(*) FILTER (WHERE categoria = 'Tecnológico') AS tecnologicos,
  COUNT(*) FILTER (WHERE categoria = 'Mueble') AS muebles,
  COUNT(*) FILTER (WHERE categoria = 'Vehículo o Equipo de Elevación') AS vehiculos,
  COUNT(*) AS total_bienes
  FROM Bienes
  GROUP BY idDependencia
)
SELECT D.id, D.nombre AS dependencia,
COALESCE(C.tecnologicos, 0) AS tecnologicos, 
COALESCE(C.muebles, 0) AS muebles, 
COALESCE(C.vehiculos, 0) AS vehiculos, 
COALESCE(C.total_bienes, 0) AS total,
ROUND(COALESCE((C.total_bienes * 100.0) / NULLIF((SELECT COUNT(*) FROM Bienes WHERE estatus != 'Desincorporado'), 0), 0), 2) AS p_bienes,
ROUND(COALESCE((C.muebles * 100.0) / NULLIF(C.total_bienes, 0), 0), 2) AS p_muebles,
ROUND(COALESCE((C.tecnologicos * 100.0) / NULLIF(C.total_bienes, 0), 0), 2) AS p_tecnologicos,
ROUND(COALESCE((C.vehiculos * 100.0) / NULLIF(C.total_bienes, 0), 0), 2) AS p_vehiculos
FROM Dependencias D
LEFT JOIN conteo_categorias C ON D.id = C.idDependencia;

CREATE OR REPLACE VIEW vistaBienesPorCategoria AS
WITH categorias AS (	
SELECT  
  COUNT(*) FILTER (WHERE categoria = 'Mueble') AS muebles,
  COUNT(*) FILTER (WHERE categoria = 'Tecnológico') AS tecnologicos,
  COUNT(*) FILTER (WHERE categoria = 'Vehículo o Equipo de Elevación') AS vehiculos,
  COUNT(*) AS total
  FROM Bienes
  WHERE estatus != 'Desincorporado'
)
SELECT total,
muebles, ROUND(COALESCE((muebles * 100.0) / NULLIF(total, 0), 0), 2) AS p_muebles,
tecnologicos, ROUND(COALESCE((tecnologicos * 100.0) / NULLIF(total, 0), 0), 2) AS p_tecnologicos,
vehiculos, ROUND(COALESCE((vehiculos * 100.0) / NULLIF(total, 0), 0), 2) AS p_vehiculos
FROM categorias;


-- %IIET, %IIM, IIMB
CREATE OR REPLACE VIEW vistaResumenPresupuestos AS
WITH gastos_agrupados AS (
  SELECT idPresupuesto, SUM(monto) AS total_gastado
  FROM Gastos
  GROUP BY idPresupuesto
)
SELECT P.tipo, P.semestre, P.aniofiscal AS anio,
  SUM(P.montousd) AS presupuesto_total_usd,
  COALESCE(SUM(G.total_gastado), 0) AS gasto_total,
  (SUM(P.montousd) - COALESCE(SUM(G.total_gastado), 0)) AS monto_disponible,
  ROUND(COALESCE((SUM(G.total_gastado) * 100.0) / NULLIF(SUM(P.montousd), 0), 0), 2) AS porcentaje_uso
FROM Presupuestos P
LEFT JOIN Gastos_Agrupados G ON P.id = G.idpresupuesto
WHERE P.estatus = 'Activo'
AND P.aniofiscal = EXTRACT(YEAR FROM CURRENT_DATE)
AND P.semestre = CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 6 THEN 'Semestre I' ELSE 'Semestre II' END
GROUP BY P.tipo, P.semestre, P.aniofiscal;


-- %ICP, %IPS
CREATE OR REPLACE VIEW vistaFormacionCrecimiento AS
SELECT E.semestre, COUNT(E.id) AS total_evaluados,
  SUM(CASE WHEN E.capacitacion = 1 THEN 1 ELSE 0 END) AS personal_capacitado,
  ROUND((SUM(CASE WHEN E.capacitacion = 1 THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(E.id), 0)) * 100, 2) AS porcentaje_capacitacion,
  SUM(CASE WHEN E.satisfaccion >= 4 THEN 1 ELSE 0 END) AS personal_satisfecho,
  ROUND((SUM(CASE WHEN E.satisfaccion >= 4 THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(E.id), 0)) * 100, 2) AS porcentaje_satisfaccion
FROM Evaluaciones E
INNER JOIN Personal P ON E.idPersonal = P.id
GROUP BY E.semestre
ORDER BY 
  SPLIT_PART(E.semestre, '-', 1) DESC, -- Ordena por Año (ej: 2026)
  SPLIT_PART(E.semestre, '-', 2) DESC  -- Ordena por Semestre (ej: 2)
LIMIT 1;


CREATE OR REPLACE VIEW vistaMantenimientoEfectivo AS
WITH conteo_mantenimiento AS (
  SELECT COUNT(*) AS total_mantenimiento,
	COUNT(*) FILTER (WHERE estadoPosterior IN ('Óptimo', 'Bueno') AND estatus = 'Finalizado') AS total_buen_estado,
	TO_CHAR(CURRENT_DATE, 'MM-YYYY') AS periodo
  FROM Mantenimientos
  WHERE EXTRACT(MONTH FROM fechaFin) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM fechaFin) = EXTRACT(YEAR FROM CURRENT_DATE)
)
SELECT total_mantenimiento, total_buen_estado, periodo,
  ROUND(COALESCE((total_buen_estado * 100.0) / NULLIF(total_mantenimiento, 0), 0), 2) AS porcentaje_buen_estado
FROM conteo_mantenimiento;


CREATE OR REPLACE VIEW vistaPromedioMantenimiento AS
WITH dias_por_mantenimiento AS (
	SELECT (M.fechaFin - M.fechaInicio) + 1 AS dias_duracion
  FROM Mantenimientos M
  WHERE M.fechaFin IS NOT NULL
	AND EXTRACT(MONTH FROM M.fechaFin) = EXTRACT(MONTH FROM CURRENT_DATE)
	AND EXTRACT(YEAR FROM M.fechaFin) = EXTRACT(YEAR FROM CURRENT_DATE)
)
SELECT ROUND(COALESCE(AVG(dias_duracion), 0)) AS promedio_dias, COUNT(*) AS mantenimientos_realizados
FROM dias_por_mantenimiento;

CREATE OR REPLACE VIEW vistaMetricasDesincorporacion AS
WITH count_desincorporacion AS (
  SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER(WHERE DD.tipo = 'Deterioro') AS total_deterioro,
    COUNT(*) FILTER(WHERE DD.tipo = 'Obsolescencia') AS total_obsolescencia
  FROM DetallesDesincorporacion AS DD
  INNER JOIN Desincorporaciones D ON D.id = DD.idDesincorporacion
  WHERE D.fechaSalida >= DATE_TRUNC('month', CURRENT_DATE)
    AND D.fechaSalida < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
),
count_bienes AS (
  SELECT COUNT(*) FILTER(WHERE estatus <> 'Desincorporado') AS bienes_activos
  FROM Bienes 
)
SELECT total, total_deterioro, total_obsolescencia,
  ROUND(COALESCE((total_deterioro * 100.0) / NULLIF(total, 0), 0), 2) AS porcentaje_deterioro,
  ROUND(COALESCE((total_obsolescencia * 100.0) / NULLIF(total, 0), 0), 2) AS porcentaje_obsolescencia,
  (bienes_activos + total) AS bienes_inventario,
  ROUND(COALESCE((total * 100.00) / NULLIF(bienes_activos + total, 0), 0), 2) AS tasa_desincorporacion
FROM count_desincorporacion
CROSS JOIN count_bienes;

CREATE OR REPLACE VIEW vistaBienesSinNumero AS
WITH count_bienes AS (
  SELECT COUNT(*) AS total_bienes,
  COUNT(*) FILTER(WHERE numeroBien = 'S/N') AS total_sin_numero
  FROM Bienes
	WHERE estatus != 'Desincorporado'
)
SELECT total_bienes, total_sin_numero,
ROUND(COALESCE((total_sin_numero * 100.0) / NULLIF(total_bienes, 0), 0), 2) AS porcentaje_sin_numero
FROM count_bienes;


CREATE OR REPLACE VIEW vistaDisponibilidadPorDependencia AS
WITH mantenimiento_actual AS (
  SELECT idBien 
  FROM Mantenimientos 
  WHERE estatus = 'En proceso'
  GROUP BY idBien
),
conteo_bienes AS (
  SELECT d.id AS id_dependencia, d.nombre AS nombre_dependencia,
    COUNT(b.id) AS total_bienes,
    COUNT(m.idBien) AS bienes_mantenimiento,
    (COUNT(b.id) - COUNT(m.idBien)) AS bienes_operativos
  FROM Dependencias d
  LEFT JOIN Bienes b ON d.id = b.idDependencia
  LEFT JOIN mantenimiento_actual m ON b.id = m.idBien
  GROUP BY d.id, d.nombre
)
SELECT id_dependencia, nombre_dependencia, total_bienes, bienes_operativos, bienes_mantenimiento,
	ROUND(COALESCE((bienes_operativos * 100.0) / NULLIF(total_bienes, 0), 0), 2) AS porcentaje_operativos,
	ROUND(COALESCE((bienes_mantenimiento * 100.0) / NULLIF(total_bienes, 0), 0), 2) AS porcentaje_mantenimiento
FROM conteo_bienes;




-- INSERTS
INSERT INTO Estados (nombre)
VALUES ('Sucre');

INSERT INTO Municipios (nombre, idEstado) VALUES
  ('Andrés Eloy Blanco', 1),
  ('Andrés Mata', 1),
  ('Arismendi', 1),
  ('Benítez', 1),
  ('Bermúdez', 1),
  ('Bolívar', 1),
  ('Cajigal', 1),
  ('Cruz Salmerón Acosta', 1),
  ('Libertador', 1),
  ('Mariño', 1),
  ('Mejía', 1),
  ('Montes', 1),
  ('Ribero', 1),
  ('Sucre', 1),
  ('Valdez', 1);

INSERT INTO Parroquias (nombre, idMunicipio) VALUES
  -- Andrés Eloy Blanco
  ('Mariño', 1),
  ('Rómulo Gallegos', 1),
  -- Andrés Mata
  ('San José de Aerocuar', 2),
  ('Tavera Acosta', 2),
  -- Arismendi
  ('Río Caribe', 3),
  ('Antonio José de Sucre', 3),
  ('El Morro de Puerto Santo', 3),
  ('Puerto Santo', 3),
  ('San Juan de las Galdonas', 3),
  -- Benítez
  ('El Rincón', 4),
  ('General Francisco Antonio Vásquez', 4),
  ('Guaraúnos', 4),
  ('Tunapuicito', 4),
  ('Unión', 4),
  -- Bermúdez
  ('Bolívar', 5),
  ('Maracapana', 5),
  ('Santa Catalina', 5),
  ('Santa Rosa', 5),
  ('Santa Teresa', 5),
  -- Bolívar
  ('Marigüitar', 6),
  -- Cajigal
  ('El Paují', 7),
  ('Libertad', 7),
  ('Yaguaraparo', 7),
  -- Cruz Salmerón Acosta
  ('Araya', 8),
  ('Chacopata', 8),
  ('Manicuare', 8),
  -- Libertador
  ('Tunapuy', 9),
  ('Campo Elías', 9),
  -- Mariño
  ('Irapa', 10),
  ('Campo Claro', 10),
  ('Marabal', 10),
  ('San Antonio de Irapa', 10),
  ('Soro', 10),
  -- Mejía
  ('San Antonio del Golfo', 11),
  -- Montes
  ('Cumanacoa', 12),
  ('Arenas', 12),
  ('Aricagua', 12),
  ('Cocollar', 12),
  ('San Fernando', 12),
  ('San Lorenzo', 12),
  -- Ribero
  ('Cariaco', 13),
  ('Catuaro', 13),
  ('Rendón', 13),
  ('Santa Cruz', 13),
  ('Santa María', 13),
  -- Sucre
  ('Altagracia', 14),
  ('Ayacucho', 14),
  ('Santa Inés', 14),
  ('Valentín Valiente', 14),
  ('San Juan', 14),
  ('Raúl Leoni', 14),
  ('Gran Mariscal', 14),
  -- Valdez
  ('Güiria', 15),
  ('Bideau', 15),
  ('Cristóbal Colón', 15),
  ('Punta de Piedras', 15);


--- ==========================================
--- 1. DEPENDENCIAS
--- ==========================================
INSERT INTO Dependencias (id, nombre, tipo, direccion, idParroquia) VALUES
(1, 'Jefatura Estadal', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(2, 'Área de Administración', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(3, 'Área de Logística y Distribución', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(4, 'Área de Soporte Técnico', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(5, 'Módulo Brasil', 'Módulo', 'Barrio Brasil, calle principal', 46);

--- ==========================================
--- 2. CARGOS (Con los módulos y operativos agregados)
--- ==========================================
INSERT INTO Cargos (id, nombre, tipo) VALUES 
(1, 'Jefe Estadal', 'Responsable Patrimonial Primario'),
(2, 'Coordinador de Administración', 'Responsable Patrimonial de Uso y Custodia'),
(3, 'Coordinador de Logística Y Distribución', 'Responsable Patrimonial de Uso y Custodia'),
(4, 'Coordinador de Soporte Técnico', 'Responsable Patrimonial de Uso y Custodia'),
(5, 'Jefe de Módulo', 'Responsable Patrimonial de Uso y Custodia'),
(6, 'Supervisor de Bienes', 'Personal de la Unidad de Administración'),
(7, 'Analista Administrativo', 'Personal de la Unidad de Administración'),
(8, 'Analista de Bienes', 'Personal de la Unidad de Administración');

--- ==========================================
--- 3. PERSONAL Y ASIGNACIONES
--- ==========================================
INSERT INTO Personal (id, cedula, nombres, apellidos, fechaNacimiento, genero, telefono, nivelProfesional, estatus) VALUES
(1, '12345678', 'Carlos Eduardo', 'Gómez Pérez', '1980-05-14', 'M', '0414-1234567', 'Ing.', 'Activo'),
(2, '15876543', 'María Alejandra', 'Rodríguez Silva', '1985-11-22', 'F', '0424-9876543', 'Lic.', 'Activo'),
(3, '18999888', 'José Antonio', 'Marcano', '1990-03-10', 'M', '0416-5554433', 'T.S.U.', 'Activo'),
(4, '20111222', 'Ana Karina', 'López', '1995-07-08', 'F', '0412-1112233', 'Lic.', 'Activo'),
(5, '14555666', 'Luis Fernando', 'Martínez', '1982-09-30', 'M', '0426-9998877', 'T.S.U.', 'Activo'),
(6, '16777888', 'Roberto Carlos', 'Díaz', '1986-04-12', 'M', '0414-2223344', 'Lic.', 'Activo'),
(7, '19333444', 'Carmen Elena', 'Suárez', '1992-08-25', 'F', '0416-7778899', 'Ing.', 'Activo'),
(8, '22444555', 'Jesús Manuel', 'Rojas', '1998-01-15', 'M', '0424-5556677', 'T.S.U.', 'Activo');

INSERT INTO HistorialCargos (id, fechaIngreso, idPersonal, idCargo, idDependencia) VALUES
(1, '2023-01-15', 1, 1, 1),    -- Carlos (Jefe Estadal) -> Jefatura Estadal
(2, '2023-02-01', 2, 2, 2),    -- María (Coord. Admin) -> Área Admin
(3, '2023-03-10', 3, 3, 3),    -- José (Coord. Logística) -> Logística
(4, '2024-05-10', 4, 4, 4),    -- Ana (Coord. Soporte) -> Soporte Técnico
(5, '2023-11-05', 5, 5, 5),    -- Luis (Jefe de Módulo) -> Brasil
(6, '2023-05-01', 6, 6, 2),    -- Roberto (Supervisor Bienes) -> Área Admin
(7, '2024-02-15', 7, 7, 2),    -- Carmen (Analista Admin) -> Área Admin
(8, '2025-08-10', 8, 8, 2);    -- Jesús (Analista Bienes) -> Área Admin

--- ==========================================
--- 4. USUARIOS DEL SISTEMA
--- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO Usuarios (id, username, correo, contrasena, rol, idPersonal) VALUES
(1, 'Admin01', 'mrodriguez@gmail.com', crypt('Admin01*', gen_salt('bf', 10)), 'Administrador', 2),        -- Coord Admin
(2, 'Supervisor01', 'rdiaz@gmail.com', crypt('Supervisor01*', gen_salt('bf', 10)), 'Supervisor', 6),      -- Supervisor Bienes
(3, 'Analista01', 'csuarez@gmail.com', crypt('Analista01*', gen_salt('bf', 10)), 'Analista', 7),          -- Analista Admin
(4, 'Analista02', 'jgarcia@gmail.com', crypt('Analista02*', gen_salt('bf', 10)), 'Analista', 8);          -- Analista Bienes

--- ==========================================
--- 5. PRESUPUESTOS E INCORPORACIONES
--- ==========================================
INSERT INTO Presupuestos (id, codigoPartida, anioFiscal, semestre, tipo, montoUsd, montoBs, tasaCambio, descripcion) VALUES
(1, '401-01', 2026, 'Semestre I', 'Compra de Equipos Tecnológicos', 500.00, 303500.00, 607.00, 'Modernización tecnológica'),
(2, '402-05', 2026, 'Semestre I', 'Compra de Vehículos / Equipos de Elevación', 5000.00, 3035000.00, 607.00, 'Renovación de flota'),
(3, '403-10', 2026, 'Semestre I', 'Compra de Muebles', 500.00, 303500.00, 607.00, 'Dotación de oficinas y módulos'),
(4, '404-01', 2026, 'Semestre I', 'Mantenimiento de Bienes', 500.00, 303500.00, 607.00, 'Mantenimiento preventivo general');

--- ==========================================
--- 5. INCORPORACIONES (Motivos según interfaz)
--- ==========================================
INSERT INTO Incorporaciones (id, fechaEntrada, ordenCompra, factura, proveedor, motivo, idDependencia, idPersonal) VALUES
-- Dependencia 1: Jefatura Estadal (id 1, Personal 1)
(1, '2026-01-10', 'OC-2026-001', 'FACT-001', 'TechVe C.A.', 'Compra', 1, 1),
(2, '2026-01-15', NULL, NULL, 'Gobernación del Estado Sucre', 'Donación', 1, 1),
-- Dependencia 2: Área de Administración (id 2, Personal 2)
(3, '2026-02-05', 'OC-2026-002', 'FACT-002', 'Muebles Cumaná', 'Compra', 2, 2),
(4, '2026-02-20', NULL, NULL, 'Sede Central Caracas', 'Reposición', 2, 2),
-- Dependencia 3: Área de Logística y Distribución (id 3, Personal 3)
(5, '2026-03-01', 'OC-2026-003', 'FACT-003', 'AutoMotors C.A.', 'Compra', 3, 3),
(6, '2026-03-15', NULL, NULL, 'Alcaldía de Cumaná', 'Permuta', 3, 3),
-- Dependencia 4: Área de Soporte Técnico (id 4, Personal 4)
(7, '2026-04-10', 'OC-2026-004', 'FACT-004', 'Sistemas y Redes C.A.', 'Compra', 4, 4),
(8, '2026-04-20', NULL, NULL, 'Inventario Anterior No Registrado', 'Sobrante', 4, 4),
-- Dependencia 5: Módulo Brasil (id 5, Personal 5)
(9, '2026-05-05', 'OC-2026-005', 'FACT-005', 'Equipos Módulo C.A.', 'Compra', 5, 5),
(10, '2026-05-15', NULL, NULL, 'Almacén Central Sucre', 'Reposición', 5, 5);


--- ==========================================
--- 6. BIENES (10 por Dependencia) Y TABLAS ESPECIALIZADAS
--- ==========================================

-- ==========================================
-- 6.1 DEPENDENCIA 1: JEFATURA ESTADAL (Bienes 1 al 10)
-- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
(1, 'BM-1001', 'Laptop Corporativa Alta Gama', 'Dell', 'Latitude 5420', 'Operativo', 'Tecnológico', 1, 1, 1),
(2, 'BM-1002', 'Impresora Multifuncional', 'HP', 'LaserJet Pro', 'Operativo', 'Tecnológico', 1, 1, 1),
(3, 'BM-1003', 'Proyector Interactivo', 'Epson', 'PowerLite', 'Operativo', 'Tecnológico', 1, 1, 1),
(4, 'BM-1004', 'Escritorio Ejecutivo en L', 'S/M', 'S/M', 'Operativo', 'Mueble', 1, 1, 1),
(5, 'BM-1005', 'Silla Presidencial Ergonómica', 'S/M', 'S/M', 'Operativo', 'Mueble', 1, 1, 1),
(6, 'BM-1006', 'Monitor 24 pulgadas', 'Samsung', 'F24T350', 'Operativo', 'Tecnológico', 2, 1, 1),
(7, 'BM-1007', 'Teléfono IP', 'Cisco', 'CP-7821', 'Operativo', 'Tecnológico', 2, 1, 1),
(8, 'S/N', 'Archivador de Metal 4 Gavetas', 'S/M', 'S/M', 'Operativo', 'Mueble', 2, 1, 1),
(9, 'BM-1009', 'Silla de Visitante', 'S/M', 'S/M', 'Operativo', 'Mueble', 2, 1, 1),
(10, 'BM-1010', 'Camioneta Doble Cabina', 'Toyota', 'Hilux', 'Operativo', 'Vehículo o Equipo de Elevación', 2, 1, 1);

INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES 
(1, 'Core i7, 16GB RAM, 512GB SSD', 'DL-5420-XYZ'), (2, 'Láser B/N, WiFi', 'HP-LJ-888'),
(3, '3300 Lúmenes, 1080p', 'EP-PW-999'), (6, 'FHD, 75Hz, IPS', 'SM-24-001'), (7, 'PoE, Pantalla B/N', 'CS-7821-22');
INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES 
(4, 'Escritorio', 'Madera MDF'), (5, 'Silla', 'Malla y Cuero Sintético'), (8, 'Archivador', 'Metal'), (9, 'Silla', 'Metal y Tela');
INSERT INTO Vehiculos (idVehiculo, color, placa, serialCarroceria) VALUES 
(10, 'Blanco', 'A12B34C', 'JTEBT123456789012');

-- ==========================================
-- 6.2 DEPENDENCIA 2: ÁREA DE ADMINISTRACIÓN (Bienes 11 al 20)
-- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
(11, 'BM-2001', 'Computadora de Escritorio', 'Lenovo', 'ThinkCentre', 'Operativo', 'Tecnológico', 3, 2, 2),
(12, 'BM-2002', 'Computadora de Escritorio', 'Lenovo', 'ThinkCentre', 'Operativo', 'Tecnológico', 3, 2, 2),
(13, 'BM-2003', 'Servidor de Archivos Local', 'HP', 'Proliant', 'Operativo', 'Tecnológico', 3, 2, 2),
(14, 'BM-2004', 'Máquina Contadora de Billetes', 'AccuBanker', 'AB4200', 'Operativo', 'Tecnológico', 3, 2, 2),
(15, 'BM-2005', 'Escritorio Modular Administrativo', 'S/M', 'S/M', 'Operativo', 'Mueble', 3, 2, 2),
(16, 'BM-2006', 'Escritorio Modular Administrativo', 'S/M', 'S/M', 'Operativo', 'Mueble', 3, 2, 2),
(17, 'BM-2007', 'Silla Secretarial', 'S/M', 'S/M', 'Operativo', 'Mueble', 3, 2, 2),
(18, 'BM-2008', 'Impresora Matriz de Punto', 'Epson', 'LX-350', 'Operativo', 'Tecnológico', 4, 2, 2),
(19, 'BM-2009', 'Escaner de Documentos', 'Fujitsu', 'ScanSnap', 'Operativo', 'Tecnológico', 4, 2, 2),
(20, 'BM-2010', 'Archivador Aéreo 2 Puertas', 'S/M', 'S/M', 'Operativo', 'Mueble', 4, 2, 2);

INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES 
(11, 'Core i5, 8GB RAM', 'LN-TC-001'), (12, 'Core i5, 8GB RAM', 'LN-TC-002'), (13, 'Xeon, 32GB RAM, 4TB', 'HP-PR-555'), 
(14, 'UV/MG Detección', 'AB-4200-11'), (18, '9 pines', 'EP-LX-333'), (19, '50 ppm, Dúplex', 'FJ-SS-222');
INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES 
(15, 'Escritorio', 'MDF y Formica'), (16, 'Escritorio', 'MDF y Formica'), (17, 'Silla', 'Tela y Plástico'), (20, 'Archivador', 'Metal');

-- ==========================================
-- 6.3 DEPENDENCIA 3: ÁREA DE LOGÍSTICA (Bienes 21 al 30)
-- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
(21, 'BM-3001', 'Lector de Código de Barras', 'Zebra', 'DS2208', 'Operativo', 'Tecnológico', 5, 3, 3),
(22, 'BM-3002', 'Lector de Código de Barras', 'Zebra', 'DS2208', 'Operativo', 'Tecnológico', 5, 3, 3),
(23, 'BM-3003', 'Estante Industrial Carga Pesada', 'S/M', 'S/M', 'Operativo', 'Mueble', 5, 3, 3),
(24, 'BM-3004', 'Estante Industrial Carga Pesada', 'S/M', 'S/M', 'Operativo', 'Mueble', 5, 3, 3),
(25, 'BM-3005', 'Montacargas Hidráulico', 'Toyota', '8FD25', 'Operativo', 'Vehículo o Equipo de Elevación', 5, 3, 3),
(26, 'BM-3006', 'Transpaleta Manual', 'Crown', 'PTH50', 'Operativo', 'Vehículo o Equipo de Elevación', 5, 3, 3),
(27, 'BM-3007', 'Mesa de Embalaje', 'S/M', 'S/M', 'Operativo', 'Mueble', 6, 3, 3),
(28, 'BM-3008', 'Casillero Metálico 6 Puertas', 'S/M', 'S/M', 'Operativo', 'Mueble', 6, 3, 3),
(29, 'BM-3009', 'Camión Cargo 815', 'Ford', 'Cargo 815', 'Operativo', 'Vehículo o Equipo de Elevación', 6, 3, 3),
(30, 'BM-3010', 'Camión 350', 'Chevrolet', 'Silverado 3500', 'Operativo', 'Vehículo o Equipo de Elevación', 6, 3, 3);

INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES 
(21, 'Inalámbrico 1D/2D', 'ZB-DS-100'), (22, 'Inalámbrico 1D/2D', 'ZB-DS-101');
INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES 
(23, 'Estante', 'Acero'), (24, 'Estante', 'Acero'), (27, 'Mesa', 'Metal y Madera'), (28, 'Casillero', 'Metal');
INSERT INTO Vehiculos (idVehiculo, color, placa, serialCarroceria) VALUES 
(25, 'Naranja', 'S/P', 'TY-MC-001'), (26, 'Amarillo', 'S/P', 'CR-TP-002'), 
(29, 'Blanco', 'A23D45F', 'FD-CG-888'), (30, 'Blanco', 'A99E88G', 'CH-350-999');

-- ==========================================
-- 6.4 DEPENDENCIA 4: ÁREA DE SOPORTE TÉCNICO (Bienes 31 al 40)
-- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
(31, 'BM-4001', 'Switch de Red 24 Puertos', 'Cisco', 'Catalyst 2960', 'Operativo', 'Tecnológico', 7, 4, 4),
(32, 'BM-4002', 'Router Empresarial', 'MikroTik', 'RB4011', 'Operativo', 'Tecnológico', 7, 4, 4),
(33, 'BM-4003', 'Tester de Cables de Red', 'Fluke', 'MicroScanner2', 'Operativo', 'Tecnológico', 7, 4, 4),
(34, 'BM-4004', 'Kit de Herramientas PC', 'Proskit', '1PK-1900NB', 'Operativo', 'Tecnológico', 7, 4, 4),
(35, 'BM-4005', 'Laptop de Diagnóstico', 'Asus', 'VivoBook', 'Operativo', 'Tecnológico', 7, 4, 4),
(36, 'BM-4006', 'Disco Duro Externo 2TB', 'Seagate', 'Backup Plus', 'Operativo', 'Tecnológico', 7, 4, 4),
(37, 'BM-4007', 'Mesa de Trabajo Técnico', 'S/M', 'S/M', 'Operativo', 'Mueble', 7, 4, 4),
(38, 'BM-4008', 'Silla de Banco de Trabajo', 'S/M', 'S/M', 'Operativo', 'Mueble', 7, 4, 4),
(39, 'BM-4009', 'Monitor CRT Antiguo', 'LG', 'Flatron', 'Desincorporado', 'Tecnológico', 8, 4, 4), -- Ejemplo de un sobrante
(40, 'BM-4010', 'Teclado y Mouse Genérico', 'Genius', 'KM-160', 'Operativo', 'Tecnológico', 8, 4, 4);

INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES 
(31, 'PoE, Gigabit', 'CS-2960-AA'), (32, '10xGigabit', 'MK-4011-BB'), (33, 'VDI, Cobre', 'FL-MS-CC'), 
(34, 'Kit Profesional', 'PK-1900-DD'), (35, 'Core i3, 8GB', 'AS-VB-EE'), (36, 'USB 3.0', 'SG-BP-FF'),
(39, '15 pulgadas', 'LG-CRT-00'), (40, 'Cableado USB', 'GN-KM-11');
INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES 
(37, 'Mesa', 'Metal y Formica Antiestática'), (38, 'Silla', 'Plástico Duro');

-- ==========================================
-- 6.5 DEPENDENCIA 5: MÓDULO BRASIL (Bienes 41 al 50)
-- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
(41, 'BM-5001', 'Caja Registradora Punto de Venta', 'Samoa', 'ER-230', 'Operativo', 'Tecnológico', 9, 5, 5),
(42, 'BM-5002', 'Balanza Electrónica', 'CAS', 'PR-II', 'Operativo', 'Tecnológico', 9, 5, 5),
(43, 'BM-5003', 'Mostrador de Atención', 'S/M', 'S/M', 'Operativo', 'Mueble', 9, 5, 5),
(44, 'BM-5004', 'Anaquel Exhibidor', 'S/M', 'S/M', 'Operativo', 'Mueble', 9, 5, 5),
(45, 'BM-5005', 'Anaquel Exhibidor', 'S/M', 'S/M', 'Operativo', 'Mueble', 9, 5, 5),
(46, 'BM-5006', 'Silla Plástica Blanca', 'S/M', 'S/M', 'Operativo', 'Mueble', 9, 5, 5),
(47, 'BM-5007', 'Escritorio Pequeño de Gerente', 'S/M', 'S/M', 'Operativo', 'Mueble', 10, 5, 5),
(48, 'BM-5008', 'Silla Giratoria', 'S/M', 'S/M', 'Operativo', 'Mueble', 10, 5, 5),
(49, 'BM-5009', 'Archivo de 2 Gavetas', 'S/M', 'S/M', 'Operativo', 'Mueble', 10, 5, 5),
(50, 'BM-5010', 'Ventilador de Pedestal', 'Bionaire', 'StandFan', 'Operativo', 'Mueble', 10, 5, 5);

INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES 
(41, 'Gaveta de Dinero Integrada', 'SM-ER-123'), (42, 'Capacidad 30kg', 'CA-PR-456');
INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES 
(43, 'Mostrador', 'Madera MDF'), (44, 'Estante', 'Metal'), (45, 'Estante', 'Metal'), (46, 'Silla', 'Plástico'),
(47, 'Escritorio', 'Madera'), (48, 'Silla', 'Tela y Plástico'), (49, 'Archivador', 'Madera'), (50, 'Ventilador', 'Metal y Plástico');

--- ==========================================
--- 7. GASTOS (Asociados a Bienes Incorporados por 'Compra')
--- ==========================================
INSERT INTO Gastos (fecha, monto, idPresupuesto, idBien, idMantenimiento) VALUES
-- Dep 1 (Inc 1 - Compra)
('2026-01-10', 60.00, 1, 1, NULL),  -- Laptop (Tecnológico)
('2026-01-10', 20.00, 1, 2, NULL),  -- Impresora (Tecnológico)
('2026-01-10', 30.00, 1, 3, NULL),  -- Proyector (Tecnológico)
('2026-01-10', 40.00, 3, 4, NULL),  -- Escritorio (Mueble)
('2026-01-10', 20.00, 3, 5, NULL),  -- Silla (Mueble)

-- Dep 2 (Inc 3 - Compra)
('2026-02-05', 30.00, 1, 11, NULL), -- PC 1
('2026-02-05', 30.00, 1, 12, NULL), -- PC 2
('2026-02-05', 80.00, 1, 13, NULL), -- Servidor
('2026-02-05', 15.00, 1, 14, NULL), -- Máquina Billetes
('2026-02-05', 45.00, 3, 15, NULL), -- Escritorio Modular
('2026-02-05', 45.00, 3, 16, NULL), -- Escritorio Modular
('2026-02-05', 25.00, 3, 17, NULL), -- Silla Secretarial

-- Dep 3 (Inc 5 - Compra)
('2026-03-01', 10.00, 1, 21, NULL), -- Lector Barras
('2026-03-01', 10.00, 1, 22, NULL), -- Lector Barras
('2026-03-01', 50.00, 3, 23, NULL), -- Estante Industrial
('2026-03-01', 50.00, 3, 24, NULL), -- Estante Industrial
('2026-03-01', 4200.00, 2, 25, NULL), -- Montacargas (Vehículo/Elevación)
('2026-03-01', 750.00, 2, 26, NULL),  -- Transpaleta (Vehículo/Elevación)

-- Dep 4 (Inc 7 - Compra)
('2026-04-10', 35.00, 1, 31, NULL), -- Switch
('2026-04-10', 25.00, 1, 32, NULL), -- Router
('2026-04-10', 10.00, 1, 33, NULL), -- Tester
('2026-04-10', 5.00, 1, 34, NULL),  -- Kit de herramientas
('2026-04-10', 50.00, 1, 35, NULL), -- Laptop Diagnóstico
('2026-04-10', 15.00, 1, 36, NULL), -- Disco Externo
('2026-04-10', 50.00, 3, 37, NULL), -- Mesa Trabajo Técnico
('2026-04-10', 25.00, 3, 38, NULL), -- Silla Trabajo

-- Dep 5 (Inc 9 - Compra)
('2026-05-05', 45.00, 1, 41, NULL), -- Caja Venta
('2026-05-05', 20.00, 1, 42, NULL), -- Balanza
('2026-05-05', 60.00, 3, 43, NULL), -- Mostrador
('2026-05-05', 40.00, 3, 44, NULL), -- Anaquel
('2026-05-05', 40.00, 3, 45, NULL), -- Anaquel
('2026-05-05', 5.00, 3, 46, NULL);  -- Silla Plástica

--- ==========================================
--- 8. MANTENIMIENTOS
--- ==========================================
INSERT INTO Mantenimientos (id, fechaInicio, fechaFin, estadoPosterior, tipo, descripcion, estatus, idBien) VALUES
(1, '2026-06-01', '2026-06-05', 'Óptimo', 'Correctivo', 'Cambio de aceite, filtros y revisión y ajuste de frenos.', 'Finalizado', 10),
(2, '2026-06-15', NULL, NULL, 'Preventivo', 'Limpieza profunda de cabezales y lubricación de rodillos.', 'En proceso', 2),
(3, '2026-05-10', '2026-05-12', NULL, 'Correctivo', 'Falla en el display digital. Se cancela el mantenimiento por falta de repuestos del proveedor.', 'Cancelado', 42),
(4, '2026-04-20', '2026-04-25', 'Bueno', 'Preventivo', 'Mantenimiento preventivo general del sistema hidráulico y engrase de cadenas.', 'Finalizado', 25),
(5, '2026-06-18', NULL, NULL, 'Correctivo', 'Revisión técnica por puertos PoE inactivos y limpieza de contactos.', 'En proceso', 31);

INSERT INTO Gastos (fecha, monto, idPresupuesto, idBien, idMantenimiento) VALUES
('2026-06-05', 150.00, 4, 10, 1), -- Gasto del Mantenimiento 1
('2026-04-25', 200.00, 4, 25, 4); -- Gasto del Mantenimiento 4

--- ==========================================
--- 9. MOVIMIENTOS ENTRE DEPENDENCIAS (Solo Traslados)
--- ==========================================
INSERT INTO Movimientos (id, tipo, motivo, fecha, idCedente, idReceptor, idOrigen, idDestino) VALUES
(1, 'Traslado', 'Reubicación de mobiliario por reestructuración de oficinas', '2026-06-10', 1, 2, 1, 2),
(2, 'Traslado', 'Dotación de equipo de impresión para facturación', '2026-06-12', 2, 5, 2, 5),
(3, 'Traslado', 'Asignación de mobiliario extra para resguardo de documentos', '2026-06-18', 3, 1, 3, 1),
(4, 'Traslado', 'Asignación de herramientas para el área de almacén', '2026-06-20', 4, 3, 4, 3);

INSERT INTO DetallesMovimientos (id, idMovimiento, idBien) VALUES
(1, 1, 4),
(2, 2, 18),
(3, 3, 27),
(4, 3, 28),
(5, 4, 34);

UPDATE Bienes SET idDependencia = 2, idPersonal = 2 WHERE id = 4;
UPDATE Bienes SET idDependencia = 5, idPersonal = 5 WHERE id = 18;
UPDATE Bienes SET idDependencia = 1, idPersonal = 1 WHERE id IN (27, 28);
UPDATE Bienes SET idDependencia = 3, idPersonal = 3 WHERE id = 34;

--- ==========================================
--- 10. DESINCORPORACIONES
--- ==========================================
INSERT INTO Desincorporaciones (id, fechaSalida, descripcion, idDependencia, idPersonal) VALUES
(1, '2026-06-05', 'Desincorporación de mobiliario por daños irreversibles en estructura.', 1, 1),
(2, '2026-06-12', 'Salida de equipos de diagnóstico por extravío y antigüedad técnica.', 4, 4),
(3, '2026-06-15', 'Reporte policial por extracción no autorizada de equipo en las instalaciones.', 5, 5),
(4, '2026-06-19', 'Equipos reemplazados y sin uso actual.', 2, 2);

INSERT INTO DetallesDesincorporacion (id, tipo, idDesincorporacion, idBien) VALUES
(1, 'Deterioro', 1, 8),      -- Archivador (estaba en Dep 1) 
(2, 'Pérdida', 2, 36),       -- Disco Duro Externo (estaba en Dep 4)
(3, 'Obsolescencia', 2, 33), -- Tester de Cables (estaba en Dep 4)
(4, 'Robo', 3, 50),          -- Ventilador de Pedestal (estaba en Dep 5)
(5, 'Desuso', 4, 19),        -- Escaner de Documentos (estaba en Dep 2)
(6, 'Donación', 4, 11);      -- Computadora de Escritorio (estaba en Dep 2)

UPDATE Bienes 
SET estatus = 'Desincorporado',
  idDependencia = NULL,
  idPersonal = NULL
WHERE id IN (8, 11, 19, 33, 36, 50);

--- ==========================================
--- 11. REINICIAR LAS SECUENCIAS
--- ==========================================
INSERT INTO Indicadores (id, perspectiva, denominacion, meta, peligro, frecuencia) VALUES
(1, 'Planificación y Presupuesto', '% Inversión en Equipos Tecnológicos (%IIET)', 60, 30, 'Semestral'),
(2, 'Planificación y Presupuesto', '% Inversión en Muebles (%IIM)', 60, 30, 'Semestral'),
(3, 'Planificación y Presupuesto', '% Inversión en Mantenimiento de Bienes (%IIMB)', 60, 30, 'Semestral'),
(4, 'Usuarios', '% Tasa de Disponibilidad Real de Bienes (%TDRB)', 90.00, 80.00, 'Mensual'),
(5, 'Usuarios', 'Índice de Afectación Operativa por Mantenimiento (IAOM)', 5.00, 15.00, 'Mensual'),
(6, 'Procesos Internos', '% Bienes en Estado Operativo (%IBEO)', 90, 70, 'Mensual'),
(7, 'Procesos Internos', '% Bienes No Identificados (%IBNI)', 5, 15, 'Mensual'),
(8, 'Procesos Internos', 'Índice de Crecimiento Mensual de Inventario (ICMI)', 15, -5, 'Mensual'),
(9, 'Procesos Internos', '% Bienes Operativos Después del Mantenimiento (%IBODP)', 90, 60, 'Mensual'),
(10, 'Procesos Internos', 'Tiempo Promedio de Mantenimiento de Bienes (ITPMB)', 5, 10, 'Mensual'),
(11, 'Procesos Internos', '% Tasa de Desincorporación de Bienes (%ITDB)', 5, 10, 'Mensual'),
(12, 'Procesos Internos', '% Desincorporaciones por Deterioro (%IDD)', 20, 30, 'Mensual'),
(13, 'Procesos Internos', '% Desincorporaciones por Obsolescencia (%IDO)', 20, 30, 'Mensual'),
(14, 'Formación y Crecimiento', '% Capacitación del Personal (%ICP)', 75, 60, 'Semestral'),
(15, 'Formación y Crecimiento', '% Personal Satisfecho (%IPS)', 75, 60, 'Semestral');


--- ==============================================================================
--- 12. MÉTRICAS DE INDICADORES (Historial Consistente - Enero a Mayo 2026)
--- ==============================================================================
INSERT INTO Metricas (idIndicador, periodo, valor, fecha, detalles) VALUES
-- ==============================================================================
-- INDICADORES SEMESTRALES (I-2025 a I-2026)
-- Basado en: Presupuestos ($500), Personal (8 empleados)
-- ==============================================================================
-- 1. % Inversión en Equipos Tecnológicos (%IIET) (Ppto: 500, Gastado: 490)
(1, 'I-2025', 50.00, '2025-06-30', '{"total": 500, "cantidad": 250}'),
(1, 'II-2025', 70.00, '2025-12-31', '{"total": 500, "cantidad": 350}'),
(1, 'I-2026', 98.00, '2026-06-15', '{"total": 500, "cantidad": 490}'),
-- 2. % Inversión en Muebles (%IIM) (Ppto: 500, Gastado: 495)
(2, 'I-2025', 40.00, '2025-06-30', '{"total": 500, "cantidad": 200}'),
(2, 'II-2025', 60.00, '2025-12-31', '{"total": 500, "cantidad": 300}'),
(2, 'I-2026', 99.00, '2026-06-15', '{"total": 500, "cantidad": 495}'),
-- 3. % Inversión en Mantenimiento de Bienes (%IIMB) (Ppto: 500, Gastado: 350)
(3, 'I-2025', 20.00, '2025-06-30', '{"total": 500, "cantidad": 100}'),
(3, 'II-2025', 50.00, '2025-12-31', '{"total": 500, "cantidad": 250}'),
(3, 'I-2026', 70.00, '2026-06-15', '{"total": 500, "cantidad": 350}'),
-- 14. % Capacitación del Personal (%ICP) (Total Personal: 8)
(14, 'I-2025', 50.00, '2025-06-30', '{"total": 8, "cantidad": 4}'),
(14, 'II-2025', 62.50, '2025-12-31', '{"total": 8, "cantidad": 5}'),
(14, 'I-2026', 75.00, '2026-06-15', '{"total": 8, "cantidad": 6}'),
-- 15. % Personal Satisfecho (%IPS) (Total Personal: 8)
(15, 'I-2025', 62.50, '2025-06-30', '{"total": 8, "cantidad": 5}'),
(15, 'II-2025', 75.00, '2025-12-31', '{"total": 8, "cantidad": 6}'),
(15, 'I-2026', 87.50, '2026-06-15', '{"total": 8, "cantidad": 7}'),
-- ==============================================================================
-- INDICADORES MENSUALES (Enero 2026 a Mayo 2026)
-- Crecimiento progresivo de 10 en 10 hasta los 50 bienes actuales.
-- ==============================================================================
-- 6. % Bienes en Estado Operativo (%IBEO)
(6, '01-2026', 100.00, '2026-01-31', '{"total": 10, "cantidad": 10}'),
(6, '02-2026', 95.00,  '2026-02-28', '{"total": 20, "cantidad": 19}'),
(6, '03-2026', 93.33,  '2026-03-31', '{"total": 30, "cantidad": 28}'),
(6, '04-2026', 95.00,  '2026-04-30', '{"total": 40, "cantidad": 38}'),
(6, '05-2026', 96.00,  '2026-05-31', '{"total": 50, "cantidad": 48}'),
-- 7. % Bienes No Identificados (%IBNI) (El único S/N es el ID 8, asumiendo ingreso en Feb)
(7, '01-2026', 0.00, '2026-01-31', '{"total": 10, "cantidad": 0}'),
(7, '02-2026', 5.00, '2026-02-28', '{"total": 20, "cantidad": 1}'),
(7, '03-2026', 3.33, '2026-03-31', '{"total": 30, "cantidad": 1}'),
(7, '04-2026', 2.50, '2026-04-30', '{"total": 40, "cantidad": 1}'),
(7, '05-2026', 2.00, '2026-05-31', '{"total": 50, "cantidad": 1}'),
-- 8. Índice de Crecimiento Mensual de Inventario (ICMI) (Solo guarda la cantidad neta)
(8, '01-2026', 10.00, '2026-01-31', NULL),
(8, '02-2026', 20.00, '2026-02-28', NULL),
(8, '03-2026', 30.00, '2026-03-31', NULL),
(8, '04-2026', 40.00, '2026-04-30', NULL),
(8, '05-2026', 50.00, '2026-05-31', NULL),
-- 9. % Bienes Operativos Después del Mantenimiento (%IBODP)
(9, '01-2026', 100.00, '2026-01-31', '{"total": 1, "cantidad": 1}'),
(9, '02-2026', 100.00, '2026-02-28', '{"total": 1, "cantidad": 1}'),
(9, '03-2026', 100.00, '2026-03-31', '{"total": 2, "cantidad": 2}'),
(9, '04-2026', 100.00, '2026-04-30', '{"total": 1, "cantidad": 1}'),
(9, '05-2026', 100.00, '2026-05-31', '{"total": 1, "cantidad": 1}'),
-- 10. Tiempo Promedio de Mantenimiento de Bienes (ITPMB)
(10, '01-2026', 5.00, '2026-01-31', '{"total": 5, "cantidad": 1}'),
(10, '02-2026', 4.00, '2026-02-28', '{"total": 4, "cantidad": 1}'),
(10, '03-2026', 5.00, '2026-03-31', '{"total": 10, "cantidad": 2}'),
(10, '04-2026', 6.00, '2026-04-30', '{"total": 6, "cantidad": 1}'),
(10, '05-2026', 5.00, '2026-05-31', '{"total": 5, "cantidad": 1}'),
-- 11. % Tasa de Desincorporación de Bienes (%ITDB) (Todo en 0 porque las bajas son en Junio)
(11, '01-2026', 0.00, '2026-01-31', '{"total": 10, "cantidad": 0}'),
(11, '02-2026', 0.00, '2026-02-28', '{"total": 20, "cantidad": 0}'),
(11, '03-2026', 0.00, '2026-03-31', '{"total": 30, "cantidad": 0}'),
(11, '04-2026', 0.00, '2026-04-30', '{"total": 40, "cantidad": 0}'),
(11, '05-2026', 0.00, '2026-05-31', '{"total": 50, "cantidad": 0}'),
-- 12. % Desincorporaciones por Deterioro (%IDD)
(12, '01-2026', 0.00, '2026-01-31', '{"total": 0, "cantidad": 0}'),
(12, '02-2026', 0.00, '2026-02-28', '{"total": 0, "cantidad": 0}'),
(12, '03-2026', 0.00, '2026-03-31', '{"total": 0, "cantidad": 0}'),
(12, '04-2026', 0.00, '2026-04-30', '{"total": 0, "cantidad": 0}'),
(12, '05-2026', 0.00, '2026-05-31', '{"total": 0, "cantidad": 0}');
-- 13. % Desincorporaciones por Obsolescencia (%IDO)
(13, '01-2026', 0.00, '2026-01-31', '{"total": 0, "cantidad": 0}'),
(13, '02-2026', 0.00, '2026-02-28', '{"total": 0, "cantidad": 0}'),
(13, '03-2026', 0.00, '2026-03-31', '{"total": 0, "cantidad": 0}'),
(13, '04-2026', 0.00, '2026-04-30', '{"total": 0, "cantidad": 0}'),
(13, '05-2026', 0.00, '2026-05-31', '{"total": 0, "cantidad": 0}');


--- ==============================================================================
--- 12.1 MÉTRICAS CON DESGLOSE POR DEPENDENCIA: %TDRB (ID: 4) e IAOM (ID: 5)
--- ==============================================================================
INSERT INTO Metricas (idIndicador, periodo, valor, fecha, detalles) VALUES
-- ==============================================================================
-- 4. % Tasa de Disponibilidad Real de Bienes (%TDRB) - ID: 4
-- ==============================================================================
(4, '01-2026', 100.00, '2026-01-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(4, '02-2026', 95.00, '2026-02-28', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(4, '03-2026', 93.33, '2026-03-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(4, '04-2026', 95.00, '2026-04-30', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(4, '05-2026', 96.00, '2026-05-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00}
}'::jsonb),

-- ==============================================================================
-- 5. Índice de Afectación Operativa por Mantenimiento (IAOM) - ID: 5
-- ==============================================================================
(5, '01-2026', 0.00, '2026-01-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(5, '02-2026', 5.00, '2026-02-28', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(5, '03-2026', 6.67, '2026-03-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(5, '04-2026', 5.00, '2026-04-30', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 0, "bienes_operativos": 0, "bienes_mantenimiento": 0, "porcentaje_operativos": 0.00, "porcentaje_mantenimiento": 0.00}
}'::jsonb),

(5, '05-2026', 4.00, '2026-05-31', 
'{
  "0": {"id_dependencia": 1, "nombre_dependencia": "Jefatura Estadal", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "1": {"id_dependencia": 2, "nombre_dependencia": "Área de Administración", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "2": {"id_dependencia": 3, "nombre_dependencia": "Área de Logística y Distribución", "total_bienes": 10, "bienes_operativos": 10, "bienes_mantenimiento": 0, "porcentaje_operativos": 100.00, "porcentaje_mantenimiento": 0.00},
  "3": {"id_dependencia": 4, "nombre_dependencia": "Área de Soporte Técnico", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00},
  "4": {"id_dependencia": 5, "nombre_dependencia": "Módulo Brasil", "total_bienes": 10, "bienes_operativos": 9, "bienes_mantenimiento": 1, "porcentaje_operativos": 90.00, "porcentaje_mantenimiento": 10.00}
}'::jsonb);

--- ==========================================
--- 13. REINICIAR LAS SECUENCIAS
--- ==========================================
SELECT setval(pg_get_serial_sequence('Dependencias', 'id'), coalesce(max(id),0) + 1, false) FROM Dependencias;
SELECT setval(pg_get_serial_sequence('Cargos', 'id'), coalesce(max(id),0) + 1, false) FROM Cargos;
SELECT setval(pg_get_serial_sequence('Personal', 'id'), coalesce(max(id),0) + 1, false) FROM Personal;
SELECT setval(pg_get_serial_sequence('HistorialCargos', 'id'), coalesce(max(id),0) + 1, false) FROM HistorialCargos;
SELECT setval(pg_get_serial_sequence('Usuarios', 'id'), coalesce(max(id),0) + 1, false) FROM Usuarios;
SELECT setval(pg_get_serial_sequence('Presupuestos', 'id'), coalesce(max(id),0) + 1, false) FROM Presupuestos;
SELECT setval(pg_get_serial_sequence('Incorporaciones', 'id'), coalesce(max(id),0) + 1, false) FROM Incorporaciones;
SELECT setval(pg_get_serial_sequence('Bienes', 'id'), coalesce(max(id),0) + 1, false) FROM Bienes;
SELECT setval(pg_get_serial_sequence('Mantenimientos', 'id'), coalesce(max(id),0) + 1, false) FROM Mantenimientos;
SELECT setval(pg_get_serial_sequence('Gastos', 'id'), coalesce(max(id),0) + 1, false) FROM Gastos;
SELECT setval(pg_get_serial_sequence('Movimientos', 'id'), coalesce(max(id),0) + 1, false) FROM Movimientos;
SELECT setval(pg_get_serial_sequence('DetallesMovimientos', 'id'), coalesce(max(id),0) + 1, false) FROM DetallesMovimientos;
SELECT setval(pg_get_serial_sequence('Desincorporaciones', 'id'), coalesce(max(id),0) + 1, false) FROM Desincorporaciones;
SELECT setval(pg_get_serial_sequence('DetallesDesincorporacion', 'id'), coalesce(max(id),0) + 1, false) FROM DetallesDesincorporacion;
SELECT setval(pg_get_serial_sequence('Indicadores', 'id'), coalesce(max(id),0) + 1, false) FROM Indicadores;
SELECT setval(pg_get_serial_sequence('Metricas', 'id'), coalesce(max(id),0) + 1, false) FROM Metricas;