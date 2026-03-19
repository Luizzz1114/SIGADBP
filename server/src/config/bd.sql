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
  ultimoAcceso TIMESTAMP DEFAULT NULL,
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
    UPDATE Bienes SET estatus = v_estatus WHERE id = v_bien.id;-
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_mantenimiento_eliminar
AFTER DELETE ON Mantenimientos
FOR EACH ROW
WHEN (OLD.estatus = 'En proceso')
EXECUTE FUNCTION revertir_estatus_al_eliminar();




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
SELECT P.id, P.cedula, P.nombres, P.apellidos, CONCAT_WS(' ', nombres, apellidos) AS empleado,
	TO_CHAR(P.fechaNacimiento, 'DD/MM/YYYY') AS fechaNacimiento, DATE_PART('YEAR', AGE(P.fechaNacimiento)) AS edad,
	P.genero, P.telefono, P.nivelProfesional, P.estatus,
	C.id idc, C.nombre AS cargo, C.tipo AS tipo_cargo, D.id idd, D.nombre dependencia,
	HC.id idhc, TO_CHAR(HC.fechaIngreso, 'DD/MM/YYYY') AS fechaIngreso, TO_CHAR(HC.fechaSalida, 'DD/MM/YYYY') AS fechaSalida,
	DATE_PART('YEAR', AGE(COALESCE(HC.fechaSalida, CURRENT_DATE), HC.fechaIngreso)) AS antiguedad,
	COALESCE(CB.bienes_asignados, 0) AS bienes_asignados
FROM Personal P
LEFT JOIN HistorialCargos HC ON HC.idPersonal = P.id
LEFT JOIN Cargos C ON HC.idCargo = C.id
LEFT JOIN Dependencias D ON HC.idDependencia = D.id
LEFT JOIN count_bienes CB ON P.id = CB.idPersonal;


-- 3. USUARIOS
CREATE OR REPLACE VIEW vistaUsuarios AS
SELECT U.id, U.username, U.correo, U.rol,
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
SELECT M.id AS id, M.tipo, TO_CHAR(M.fechaInicio, 'DD/MM/YYYY') AS fecha_inicio, TO_CHAR(M.fechaFin, 'DD/MM/YYYY') AS fecha_fin,
  M.estatus AS estatus, M.estadoPosterior AS estado_posterior, M.descripcion AS descripcion,
  (COALESCE(m.fechaFin, CURRENT_DATE) - m.fechaInicio) + 1 AS dias_duracion,
  b.id AS id_bien, b.numeroBien AS numero_bien, b.descripcion AS descripcion_bien, b.categoria AS categoria_bien,
  COALESCE(g.monto, 0) AS gasto, p.id AS id_presupuesto, p.codigoPartida AS codigo_partida, p.tipo AS tipo_presupuesto,
  p.montoUsd AS monto, p.anioFiscal AS anio_fiscal,
  D.nombre AS dependencia, PE.cedula, CONCAT_WS(' ', PE.nombres, PE.apellidos) AS responsable
FROM Mantenimientos M
INNER JOIN Bienes B ON M.idBien = B.id
LEFT JOIN Gastos G ON M.id = G.idMantenimiento
LEFT JOIN Presupuestos P ON G.idPresupuesto = P.id
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
  D_dest.id AS id_destino, 
  D_dest.nombre AS dependencia_destino,
  P_rec.id AS id_receptor, 
  P_rec.cedula AS cedula_receptor, 
  CONCAT(P_rec.nombres, ' ', P_rec.apellidos) AS receptor,
  COALESCE(RB.cantidad_bienes, 0) AS cantidad_bienes
FROM Movimientos M
LEFT JOIN resumen_bienes RB ON M.id = RB.idMovimiento
INNER JOIN Dependencias D_orig ON D_orig.id = M.idOrigen
INNER JOIN Dependencias D_dest ON D_dest.id = M.idDestino
INNER JOIN Personal P_ced ON P_ced.id = M.idCedente
INNER JOIN Personal P_rec ON P_rec.id = M.idReceptor;

CREATE VIEW vistaBienesPorMovimiento AS
SELECT B.id, B.numeroBien AS numero, B.descripcion, B.marca, B.modelo, B.categoria, DM.idMovimiento
FROM Bienes B
INNER JOIN DetallesMovimientos DM ON B.id = DM.idBien;


-- 7. DESINCORPORACIONES
CREATE VIEW vistaDesincorporaciones AS
WITH resumen_bienes AS (
  SELECT DD.idDesincorporacion, COUNT(DD.idBien) AS cantidad_bienes
  FROM DetallesDesincorporacion AS DD
  GROUP BY DD.idDesincorporacion
)
SELECT D.id, TO_CHAR(D.fechaSalida, 'DD/MM/YYYY') AS fecha_salida, D.descripcion,
  P.id AS idp, P.cedula, CONCAT(P.nombres, ' ', P.apellidos) AS responsable, C.nombre AS cargo,
  DP.id AS idd, DP.nombre AS dependencia,
  RB.cantidad_bienes
FROM Desincorporaciones D
INNER JOIN resumen_bienes RB ON D.id = RB.idDesincorporacion
INNER JOIN Dependencias DP ON DP.id = D.idDependencia
INNER JOIN Personal P ON P.id = D.idPersonal
INNER JOIN HistorialCargos HC ON P.id = HC.idPersonal
INNER JOIN Cargos C ON C.id = HC.idCargo;

CREATE VIEW vistaBienesDesincorporados AS
SELECT B.id, B.numeroBien AS numero, B.descripcion, B.marca, B.modelo, B.categoria,
DD.idDesincorporacion, DD.tipo AS tipo_desincorporacion
FROM Bienes B
INNER JOIN DetallesDesincorporacion DD ON B.id = DD.idBien
WHERE B.estatus = 'Desincorporado';


-- 8. INCORPORACIONES
CREATE VIEW vistaIncorporaciones AS
WITH ResumenBienes AS (
  SELECT B.idIncorporacion, 
    COUNT(B.id) AS cantidad_bienes,
    SUM(G.monto) AS total_gasto
  FROM Bienes B
  LEFT JOIN Gastos G ON B.id = G.idBien
  GROUP BY B.idIncorporacion
)
SELECT I.id, TO_CHAR(I.fechaEntrada, 'DD/MM/YYYY') AS fecha_entrada, I.motivo, I.ordenCompra AS orden_compra, I.factura, I.proveedor,
  P.id AS idp, P.cedula, CONCAT(P.nombres, ' ', P.apellidos) AS responsable, C.nombre AS cargo,
  D.id AS idd, D.nombre AS dependencia,
  RB.total_gasto, RB.cantidad_bienes
FROM Incorporaciones I
INNER JOIN ResumenBienes RB ON I.id = RB.idIncorporacion
INNER JOIN Dependencias D ON D.id = I.idDependencia
INNER JOIN Personal P ON P.id = I.idPersonal
INNER JOIN HistorialCargos HC ON P.id = HC.idPersonal
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
SELECT D.id, D.nombre, D.tipo, D.direccion,
P.id AS idr, CONCAT_WS(' ', P.nombres, P.apellidos) AS responsable, P.cedula
FROM Dependencias AS D
INNER JOIN HistorialCargos AS HC ON HC.idDependencia = D.id
INNER JOIN Personal AS P ON HC.idPersonal = P.id
INNER JOIN Cargos AS C ON HC.idCargo = C.id
WHERE C.tipo IS DISTINCT FROM 'Personal de la Unidad de Administración';


-- 11. VISTA GENERAL PARA LOS KPI
CREATE OR REPLACE VIEW vistaIndicadores AS 
SELECT I.id AS id_indicador, I.denominacion, I.frecuencia, I.meta, I.peligro,
    COALESCE(json_agg(json_build_object(
        'valor', M.valor,
        'periodo', M.periodo,
        'fecha', M.fecha
      ) ORDER BY M.fecha ASC
		) FILTER (WHERE M.fecha IS NOT NULL), 
		'[]'::json
	) AS historial_metricas
FROM Indicadores I
LEFT JOIN LATERAL (
  SELECT valor, periodo, fecha 
  FROM Metricas 
  WHERE idIndicador = I.id 
  ORDER BY fecha DESC
  --LIMIT 6
) AS M ON true
GROUP BY I.id, I.denominacion, I.frecuencia, I.meta, I.peligro;




--- VISTAS PARA LOS KPI Y DASHBOARD ---


-- CONTADORES BÁSICOS
CREATE OR REPLACE VIEW vistaMetricasBasicas AS
SELECT 
(SELECT COUNT(*) FROM Bienes WHERE estatus != 'Desincorporado') AS total_bienes,
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
(3, 'Área de Compras', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(4, 'Área de Contabilidad', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(5, 'Área de Control de Calidad', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(6, 'Área de Finanzas', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(7, 'Área de Gestión Humana', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(8, 'Área de Gestión Socialista', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(9, 'Área de Infraestructura y Mantenimiento', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(10, 'Área de Logística y Distribución', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(11, 'Área de Mercadeo y Ventas', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(12, 'Área de Programas Especiales', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(13, 'Área de Seguridad Integral', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(14, 'Área de Soporte Técnico', 'Unidad', 'Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.', 49),
(15, 'Centro de Acopio Sacosal', 'Centro de Acopio', 'Av. Carúpano, a 20mts de Makro', 49),
(16, 'Centro de Acopio Carúpano', 'Centro de Acopio', 'Zona Industrial, Galpón 4', 15),
(17, 'Módulo La Llanada', 'Módulo', 'Sector La Llanada, vereda 5', 46),
(18, 'Módulo Brasil', 'Módulo', 'Barrio Brasil, calle principal', 46);

--- ==========================================
--- 2. CARGOS (Con los módulos y operativos agregados)
--- ==========================================
INSERT INTO Cargos (id, nombre, tipo) VALUES 
(1, 'Jefe Estadal', 'Responsable Patrimonial Primario'),
(2, 'Coordinador de Administración', 'Responsable Patrimonial de Uso y Custodia'),
(3, 'Coordinador de Compras', 'Responsable Patrimonial de Uso y Custodia'),
(4, 'Coordinador de Contabilidad', 'Responsable Patrimonial de Uso y Custodia'),
(5, 'Coordinador de Control de Calidad', 'Responsable Patrimonial de Uso y Custodia'),
(6, 'Coordinador de Finanzas', 'Responsable Patrimonial de Uso y Custodia'),
(7, 'Coordinador de Gestión Humana', 'Responsable Patrimonial de Uso y Custodia'),
(8, 'Coordinador de Gestión Socialista', 'Responsable Patrimonial de Uso y Custodia'),
(9, 'Coordinador de Infraestructura y Mantenimiento', 'Responsable Patrimonial de Uso y Custodia'),
(10, 'Coordinador de Logística Y Distribución', 'Responsable Patrimonial de Uso y Custodia'),
(11, 'Coordinador de Mercadeo y Ventas', 'Responsable Patrimonial de Uso y Custodia'),
(12, 'Coordinador de Programas Especiales', 'Responsable Patrimonial de Uso y Custodia'),
(13, 'Coordinador de Soporte Técnico', 'Responsable Patrimonial de Uso y Custodia'),
(14, 'Coordinador de Seguridad Integral', 'Responsable Patrimonial de Uso y Custodia'),
(15, 'Jefe de Centro de Acopio', 'Responsable Patrimonial de Uso y Custodia'),
(16, 'Supervisor de Bienes', 'Personal de la Unidad de Administración'),
(17, 'Analista Administrativo', 'Personal de la Unidad de Administración'),
(18, 'Analista de Bienes', 'Personal de la Unidad de Administración'),
(19, 'Jefe de Módulo', 'Responsable Patrimonial de Uso y Custodia'),
(20, 'Chofer de Carga Pesada', 'Responsable Patrimonial de Uso y Custodia'),
(21, 'Operador de Montacargas', 'Responsable Patrimonial de Uso y Custodia');

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
(8, '22444555', 'Jesús Manuel', 'Rojas', '1998-01-15', 'M', '0424-5556677', 'T.S.U.', 'Activo'),
(9, '17444333', 'Pedro Pablo', 'Guzmán', '1988-02-18', 'M', '0414-8887766', 'Ing.', 'Activo'),
(10, '21555999', 'Luisa Fernanda', 'Márquez', '1996-11-05', 'F', '0424-3332211', 'T.S.U.', 'Activo'),
(11, '13222111', 'Miguel Ángel', 'Brito', '1979-06-20', 'M', '0416-1110099', 'Bachiller', 'Activo'),
(12, '18444555', 'Sofia Valentina', 'Rojas', '1991-09-10', 'F', '0414-7778899', 'Lic.', 'Activo'),
(13, '15222333', 'Héctor José', 'Pino', '1983-12-05', 'M', '0416-2221133', 'Bachiller', 'Activo'),
(14, '24555888', 'Daniela Carolina', 'Bermúdez', '1999-01-20', 'F', '0424-6667788', 'T.S.U.', 'Activo'),
(15, '17666555', 'Valeria Andrea', 'Campos', '1989-10-12', 'F', '0414-5558899', 'Lic.', 'Activo'),
(16, '19888777', 'Fernando José', 'Mendoza', '1993-02-28', 'M', '0424-1114455', 'Lic.', 'Activo');

INSERT INTO HistorialCargos (id, fechaIngreso, idPersonal, idCargo, idDependencia) VALUES
(1, '2023-01-15', 1, 1, 1),    -- Carlos (Jefe Estadal) -> Jefatura Estadal
(2, '2023-02-01', 2, 2, 2),    -- María (Coord. Admin) -> Área Admin
(3, '2023-03-10', 3, 3, 3),    -- José (Coord. Compras) -> Compras
(4, '2024-05-10', 4, 13, 14),  -- Ana (Coord. Soporte) -> Soporte Técnico
(5, '2023-11-05', 5, 10, 10),  -- Luis (Coord. Logística) -> Logística
(6, '2023-05-01', 6, 16, 2),   -- Roberto (Supervisor Bienes) -> Área Admin
(7, '2024-02-15', 7, 17, 2),   -- Carmen (Analista Admin) -> Área Admin
(8, '2025-08-10', 8, 9, 9),    -- Jesús (Coord. Infraestructura) -> Infra y Mantenimiento
(9, '2024-03-01', 9, 15, 15),  -- Pedro (Jefe CA Sacosal) -> Sacosal
(10, '2024-04-15', 10, 15, 16),-- Luisa (Jefe CA Carúpano) -> CA Carúpano
(11, '2023-08-10', 11, 19, 17),-- Miguel (Jefe de Módulo) -> La Llanada
(12, '2023-09-01', 12, 19, 18),-- Sofia (Jefe de Módulo) -> Brasil
(13, '2024-11-20', 13, 20, 10),-- Héctor (Chofer) -> Logística
(14, '2025-06-15', 14, 18, 2), -- Daniela (Analista Bienes) -> Área Admin
(15, '2023-04-20', 15, 4, 4),  -- Valeria: Coord. Contabilidad -> Área de Contabilidad (Dependencia 4)
(16, '2023-07-15', 16, 7, 7);  -- Fernando: Coord. Gestión Humana -> Área de Gestión Humana (Dependencia 7)

--- ==========================================
--- 4. USUARIOS DEL SISTEMA
--- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO Usuarios (id, username, correo, contrasena, rol, idPersonal) VALUES
(1, 'AdminSistemas', 'alopez@mercal.gob.ve', crypt('AdminSistemas*', gen_salt('bf', 10)), 'Administrador', 4), -- Soporte Técnico
(2, 'Admin01', 'mrodriguez@mercal.gob.ve', crypt('Admin01*', gen_salt('bf', 10)), 'Administrador', 2),        -- Coord Admin
(3, 'Supervisor01', 'rdiaz@mercal.gob.ve', crypt('Supervisor01*', gen_salt('bf', 10)), 'Supervisor', 6),      -- Supervisor Bienes
(4, 'Analista01', 'csuarez@mercal.gob.ve', crypt('Analista01*', gen_salt('bf', 10)), 'Analista', 7);          -- Analista Admin

--- ==========================================
--- 5. PRESUPUESTOS E INCORPORACIONES
--- ==========================================
INSERT INTO Presupuestos (id, codigoPartida, anioFiscal, semestre, tipo, montoUsd, montoBs, tasaCambio, descripcion) VALUES
(1, '401-01', 2026, 'Semestre I', 'Compra de Equipos Tecnológicos', 15000.00, 540000.00, 36.00, 'Modernización tecnológica'),
(2, '402-05', 2026, 'Semestre I', 'Compra de Vehículos / Equipos de Elevación', 85000.00, 3060000.00, 36.00, 'Renovación de flota'),
(3, '403-10', 2026, 'Semestre I', 'Compra de Muebles', 8000.00, 288000.00, 36.00, 'Dotación de oficinas y módulos'),
(4, '404-01', 2026, 'Semestre I', 'Mantenimiento de Bienes', 5000.00, 180000.00, 36.00, 'Mantenimiento preventivo general');

INSERT INTO Incorporaciones (id, fechaEntrada, ordenCompra, factura, proveedor, motivo, idDependencia, idPersonal) VALUES
(1, '2026-01-15', 'OC-2026-001', 'FACT-9988', 'Distribuidora Tecnológica C.A.', 'Dotación de tecnología', 3, 3),
(2, '2026-02-10', 'OC-2026-002', 'FACT-1122', 'Metalúrgica Sucre', 'Equipamiento logístico', 3, 3),
(3, '2026-02-25', 'OC-2026-003', 'FACT-5566', 'Concesionario Los Andes', 'Flota de Carga', 3, 3);

--- ==========================================
--- 6. BIENES MÁS ADAPTADOS A LAS DEPENDENCIAS
--- ==========================================
INSERT INTO Bienes (id, numeroBien, descripcion, marca, modelo, estatus, categoria, idIncorporacion, idDependencia, idPersonal) VALUES
-- Tecnológicos
(1, '001001', 'Servidor de Base de Datos', 'Dell', 'PowerEdge T440', 'Operativo', 'Tecnológico', 1, 14, 4), -- Soporte Técnico (Ana López)
(2, '001002', 'Laptop Corporativa', 'HP', 'ProBook 450', 'Operativo', 'Tecnológico', 1, 1, 1), -- Jefatura Estadal (Carlos Gómez)
(3, '001003', 'Computadora de Escritorio', 'Lenovo', 'ThinkCentre', 'Operativo', 'Tecnológico', 1, 2, 2), -- Administración (María Rodríguez)
(4, '001004', 'Computadora de Escritorio', 'Lenovo', 'ThinkCentre', 'Operativo', 'Tecnológico', 1, 4, 2), -- Contabilidad (Custodia: Coord. Admin)
(5, '001005', 'Impresora Multifuncional', 'Epson', 'EcoTank', 'Operativo', 'Tecnológico', 1, 7, 2), -- Gestión Humana (Custodia: Coord. Admin)
(6, '001006', 'Punto de Venta Inalámbrico', 'Verifone', 'VX690', 'Operativo', 'Tecnológico', 1, 17, 11), -- Módulo La Llanada (Miguel Brito)
(7, '001007', 'Punto de Venta Inalámbrico', 'Verifone', 'VX690', 'Operativo', 'Tecnológico', 1, 18, 12), -- Módulo Brasil (Sofia Rojas)

-- Vehículos y Carga (Todos en Logística o Infraestructura)
(8, '002001', 'Camión de Carga NPR', 'Isuzu', 'NPR 81K Cava', 'Operativo', 'Vehículo o Equipo de Elevación', 3, 10, 13), -- Logística (Héctor Pino)
(9, '002002', 'Montacargas a Gas', 'Toyota', '8FGCU25', 'Operativo', 'Vehículo o Equipo de Elevación', 3, 15, 9), -- CA Sacosal (Pedro Guzmán)
(10, '002003', 'Camioneta de Supervisión', 'Toyota', 'Hilux', 'Operativo', 'Vehículo o Equipo de Elevación', 3, 9, 8), -- Infraestructura (Jesús Rojas)
(11, '002004', 'Moto de Mensajería', 'Bera', 'BR-150', 'Operativo', 'Vehículo o Equipo de Elevación', 3, 2, 6), -- Área Admin (Roberto Díaz)

-- Muebles
(12, '003001', 'Escritorio Ejecutivo L', 'Genérico', 'Classic-L', 'Operativo', 'Mueble', 2, 1, 1), -- Jefatura Estadal
(13, '003002', 'Archivo de Metal 4 Gavetas', 'Cisa', 'Arch-4', 'Operativo', 'Mueble', 2, 7, 2), -- Gestión Humana (Custodia: Coord. Admin)
(14, '003003', 'Estante de Carga Pesada', 'Sivensa', 'Pesado-4M', 'Operativo', 'Mueble', 2, 16, 10), -- CA Carúpano (Luisa Márquez)
(15, 'S/N', 'Silla Ergonómica', 'ErgoPro', 'Mesh-V1', 'Operativo', 'Mueble', 2, 2, 2); -- Administración

-- Especializaciones
INSERT INTO Tecnologicos (idTecnologico, especificaciones, serial) VALUES
(1, 'Intel Xeon Silver, 64GB RAM, 2TB SSD RAID 1', 'DELL-SRV-9988'),
(2, 'Intel Core i7, 16GB RAM, 1TB SSD', 'HP-LP-0091'),
(3, 'Intel Core i5, 16GB RAM, 512GB SSD', 'LNV-887766'),
(4, 'Intel Core i5, 16GB RAM, 512GB SSD', 'LNV-887767'),
(5, 'Impresión a color, escáner ADF, Wifi', 'EPS-112233'),
(6, 'Conexión 4G/Wifi, Batería 24h', 'VF-POS-101'),
(7, 'Conexión 4G/Wifi, Batería 24h', 'VF-POS-102');

INSERT INTO Vehiculos (idVehiculo, color, placa, serialCarroceria) VALUES
(8, 'Blanco', 'A99C88D', 'ISZ-NPR-11223344'),
(9, 'Naranja', 'S/P', 'TYT-MC-555444'),
(10, 'Plata', 'AB123CD', 'TYT-HLX-333222'),
(11, 'Rojo', 'M-12345', 'BERA-MT-111000');

INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES
(12, 'Escritorio L', 'Madera MDF y metal'),
(13, 'Archivador', 'Lámina de acero pintada'),
(14, 'Estantería Industrial', 'Acero Galvanizado'),
(15, 'Silla de Oficina', 'Malla transpirable y aluminio');

--- ==========================================
--- 7. MANTENIMIENTOS, GASTOS, MOVIMIENTOS Y BAJAS
--- ==========================================
INSERT INTO Mantenimientos (id, fechaInicio, fechaFin, estadoPosterior, tipo, descripcion, estatus, idBien) VALUES
(1, '2026-03-01', '2026-03-03', 'Operativo', 'Preventivo', 'Cambio de aceite y filtros', 'Finalizado', 8),
(2, '2026-03-08', NULL, NULL, 'Correctivo', 'Reemplazo de fusor atascado', 'En proceso', 5);

INSERT INTO Gastos (id, fecha, monto, idPresupuesto, idBien, idMantenimiento) VALUES
(1, '2026-03-03', 150.00, 4, 8, 1),
(2, '2026-03-08', 85.00, 4, 5, 2);

INSERT INTO Movimientos (id, tipo, motivo, fecha, idCedente, idReceptor, idOrigen, idDestino) VALUES
(1, 'Asignación', 'Apertura de caja adicional en Brasil', '2026-03-01', 4, 12, 14, 18);

INSERT INTO DetallesMovimientos (idMovimiento, idBien) VALUES (1, 7);

INSERT INTO Desincorporaciones (id, fechaSalida, descripcion, idDependencia, idPersonal) VALUES
(1, '2026-03-02', 'Equipo dañado por fluctuación eléctrica, tarjeta madre quemada', 2, 2);

INSERT INTO DetallesDesincorporacion (id, tipo, idDesincorporacion, idBien) VALUES
(1, 'Obsolescencia / Daño Irreparable', 1, 4);

UPDATE Bienes SET estatus = 'Desincorporado' WHERE id = 4;

--- ==========================================
--- 8. REINICIAR LAS SECUENCIAS
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
SELECT setval(pg_get_serial_sequence('Desincorporaciones', 'id'), coalesce(max(id),0) + 1, false) FROM Desincorporaciones;



--- ==========================================
--- 8. KPIs
--- ==========================================
INSERT INTO Indicadores (perspectiva, denominacion, meta, peligro, frecuencia) VALUES
('Procesos Internos', '% Bienes en Estado Operativo (%IBEO)', 90, 70, 'Mensual'),
('Procesos Internos', 'Índice de Crecimiento Mensual de Inventario (ICMI)', 15, -5, 'Mensual'),
('Planificación y Presupuesto', '% Inversión en Equipos Tecnológicos (%IIET)', 60, 30, 'Semestral'),
('Planificación y Presupuesto', '% Inversión en Muebles (%IIM)', 60, 30, 'Semestral'),
('Planificación y Presupuesto', '% Inversión en Mantenimiento de Bienes (%IIMB)', 60, 30, 'Semestral'),
('Formación y Crecimiento', '% Capacitación del Personal (%ICP)', 80, 70, 'Semestral'),
('Formación y Crecimiento', '% Personal Satisfecho (%IPS)', 80, 70, 'Semestral');



INSERT INTO Metricas (periodo, fecha, valor, idIndicador) VALUES
('09-2025', '01-09-2025', 79, 1),
('10-2025', '01-10-2025', 85, 1),
('11-2025', '01-11-2025', 87, 1),
('12-2025', '01-12-2025', 95, 1),
('01-2026', '01-01-2026', 92, 1),
('02-2026', '01-02-2026', 95, 1),
('03-2026', '01-03-2026', 92, 1);


INSERT INTO Metricas (periodo, fecha, valor, idIndicador) VALUES
('09-2025', '01-09-2025', 13, 2),
('10-2025', '01-10-2025', 9, 2),
('11-2025', '01-11-2025', 14, 2),
('12-2025', '01-12-2025', 13, 2),
('01-2026', '01-01-2026', 12, 2),
('02-2026', '01-02-2026', 11, 2),
('03-2026', '01-03-2026', 14, 2);


INSERT INTO Metricas (periodo, fecha, valor, idIndicador) VALUES
('I-2024', '30-06-2024', 67, 3),
('II-2024', '30-12-2024', 50, 3),
('I-2025', '30-06-2025', 20, 3),
('II-2025', '30-12-2025', 87, 3);

INSERT INTO Metricas (periodo, fecha, valor, idIndicador) VALUES
('I-2024', '30-06-2024', 40, 4),
('II-2024', '30-12-2024', 55, 4),
('I-2025', '30-06-2025', 39, 4),
('II-2025', '30-12-2025', 78, 4);

INSERT INTO Metricas (periodo, fecha, valor, idIndicador) VALUES
('I-2024', '30-06-2024', 10, 5),
('II-2024', '30-12-2024', 45, 5),
('I-2025', '30-06-2025', 87, 5),
('II-2025', '30-12-2025', 90, 5);