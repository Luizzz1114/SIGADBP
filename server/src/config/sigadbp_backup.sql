--
-- PostgreSQL database dump
--

\restrict 8rvh3KaGmUsgKUIXnC0CiH0hnbqsqWQWLw7CjySAOeRUxgQKL647h86WbJf2vte

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-07 15:02:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 38613)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 2 (class 3079 OID 38975)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 326 (class 1255 OID 47425)
-- Name: revertir_estatus_al_eliminar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.revertir_estatus_al_eliminar() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.revertir_estatus_al_eliminar() OWNER TO postgres;

--
-- TOC entry 325 (class 1255 OID 38918)
-- Name: sincronizar_estatus_mantenimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sincronizar_estatus_mantenimiento() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
    UPDATE bienes SET estatus = v_estatus WHERE id = v_bien.id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.sincronizar_estatus_mantenimiento() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 38771)
-- Name: bienes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bienes (
    id integer NOT NULL,
    numerobien character varying(50) NOT NULL,
    descripcion text NOT NULL,
    marca character varying(100),
    modelo character varying(100),
    estatus character varying(20) DEFAULT 'No asignado'::character varying,
    categoria character varying(50) NOT NULL,
    idincorporacion integer,
    iddependencia integer,
    idpersonal integer
);


ALTER TABLE public.bienes OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 38770)
-- Name: bienes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bienes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bienes_id_seq OWNER TO postgres;

--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 240
-- Name: bienes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bienes_id_seq OWNED BY public.bienes.id;


--
-- TOC entry 229 (class 1259 OID 38670)
-- Name: cargos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cargos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(100) NOT NULL
);


ALTER TABLE public.cargos OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 38669)
-- Name: cargos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cargos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cargos_id_seq OWNER TO postgres;

--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 228
-- Name: cargos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cargos_id_seq OWNED BY public.cargos.id;


--
-- TOC entry 227 (class 1259 OID 38652)
-- Name: dependencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dependencias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(50) NOT NULL,
    direccion text NOT NULL,
    idparroquia integer
);


ALTER TABLE public.dependencias OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 38651)
-- Name: dependencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dependencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dependencias_id_seq OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 226
-- Name: dependencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dependencias_id_seq OWNED BY public.dependencias.id;


--
-- TOC entry 250 (class 1259 OID 38879)
-- Name: desincorporaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.desincorporaciones (
    id integer NOT NULL,
    fechasalida date NOT NULL,
    descripcion text,
    iddependencia integer,
    idpersonal integer
);


ALTER TABLE public.desincorporaciones OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 38878)
-- Name: desincorporaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.desincorporaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.desincorporaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 249
-- Name: desincorporaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.desincorporaciones_id_seq OWNED BY public.desincorporaciones.id;


--
-- TOC entry 252 (class 1259 OID 38900)
-- Name: detallesdesincorporacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detallesdesincorporacion (
    id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    iddesincorporacion integer,
    idbien integer
);


ALTER TABLE public.detallesdesincorporacion OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 38899)
-- Name: detallesdesincorporacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detallesdesincorporacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detallesdesincorporacion_id_seq OWNER TO postgres;

--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 251
-- Name: detallesdesincorporacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detallesdesincorporacion_id_seq OWNED BY public.detallesdesincorporacion.id;


--
-- TOC entry 267 (class 1259 OID 47354)
-- Name: detallesmovimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detallesmovimientos (
    id integer NOT NULL,
    idmovimiento integer,
    idbien integer
);


ALTER TABLE public.detallesmovimientos OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 47353)
-- Name: detallesmovimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detallesmovimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detallesmovimientos_id_seq OWNER TO postgres;

--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 266
-- Name: detallesmovimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detallesmovimientos_id_seq OWNED BY public.detallesmovimientos.id;


--
-- TOC entry 221 (class 1259 OID 38616)
-- Name: estados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados (
    id integer NOT NULL,
    nombre character varying(50)
);


ALTER TABLE public.estados OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 38615)
-- Name: estados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_id_seq OWNER TO postgres;

--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 220
-- Name: estados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_id_seq OWNED BY public.estados.id;


--
-- TOC entry 271 (class 1259 OID 47386)
-- Name: evaluaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluaciones (
    id integer NOT NULL,
    capacitacion integer NOT NULL,
    satisfaccion integer NOT NULL,
    semestre character varying(50),
    fecha date DEFAULT CURRENT_DATE,
    idpersonal integer
);


ALTER TABLE public.evaluaciones OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 47385)
-- Name: evaluaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 270
-- Name: evaluaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluaciones_id_seq OWNED BY public.evaluaciones.id;


--
-- TOC entry 248 (class 1259 OID 38854)
-- Name: gastos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gastos (
    id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE,
    monto numeric(15,2) NOT NULL,
    idpresupuesto integer,
    idbien integer,
    idmantenimiento integer
);


ALTER TABLE public.gastos OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 38853)
-- Name: gastos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gastos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gastos_id_seq OWNER TO postgres;

--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 247
-- Name: gastos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gastos_id_seq OWNED BY public.gastos.id;


--
-- TOC entry 233 (class 1259 OID 38696)
-- Name: historialcargos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historialcargos (
    id integer NOT NULL,
    fechaingreso date,
    fechasalida date,
    idpersonal integer,
    idcargo integer,
    iddependencia integer
);


ALTER TABLE public.historialcargos OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 38695)
-- Name: historialcargos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historialcargos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historialcargos_id_seq OWNER TO postgres;

--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 232
-- Name: historialcargos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historialcargos_id_seq OWNED BY public.historialcargos.id;


--
-- TOC entry 239 (class 1259 OID 38751)
-- Name: incorporaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incorporaciones (
    id integer NOT NULL,
    fechaentrada date NOT NULL,
    ordencompra character varying(100),
    factura character varying(100),
    proveedor character varying(150),
    motivo character varying(100) NOT NULL,
    iddependencia integer,
    idpersonal integer
);


ALTER TABLE public.incorporaciones OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 38750)
-- Name: incorporaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incorporaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incorporaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 238
-- Name: incorporaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incorporaciones_id_seq OWNED BY public.incorporaciones.id;


--
-- TOC entry 275 (class 1259 OID 47442)
-- Name: kpibienesporcategoria; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.kpibienesporcategoria AS
 WITH categorias AS (
         SELECT count(*) FILTER (WHERE ((bienes.categoria)::text = 'Mueble'::text)) AS muebles,
            count(*) FILTER (WHERE ((bienes.categoria)::text = 'Tecnológico'::text)) AS tecnologicos,
            count(*) FILTER (WHERE ((bienes.categoria)::text = 'Vehículo o Equipo de Elevación'::text)) AS vehiculos,
            count(*) AS total
           FROM public.bienes
          WHERE ((bienes.estatus)::text <> 'Desincorporado'::text)
        )
 SELECT total,
    muebles,
    round(COALESCE((((muebles)::numeric * 100.0) / (NULLIF(total, 0))::numeric), (0)::numeric), 2) AS p_muebles,
    tecnologicos,
    round(COALESCE((((tecnologicos)::numeric * 100.0) / (NULLIF(total, 0))::numeric), (0)::numeric), 2) AS p_tecnologicos,
    vehiculos,
    round(COALESCE((((vehiculos)::numeric * 100.0) / (NULLIF(total, 0))::numeric), (0)::numeric), 2) AS p_vehiculos
   FROM categorias;


ALTER VIEW public.kpibienesporcategoria OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 47427)
-- Name: kpibienespordependencia; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.kpibienespordependencia AS
 WITH conteo_categorias AS (
         SELECT bienes.iddependencia,
            count(*) FILTER (WHERE ((bienes.categoria)::text = 'Tecnológico'::text)) AS tecnologicos,
            count(*) FILTER (WHERE ((bienes.categoria)::text = 'Mueble'::text)) AS muebles,
            count(*) FILTER (WHERE ((bienes.categoria)::text = 'Vehículo o Equipo de Elevación'::text)) AS vehiculos,
            count(*) AS total_bienes
           FROM public.bienes
          GROUP BY bienes.iddependencia
        )
 SELECT d.id,
    d.nombre AS dependencia,
    COALESCE(c.tecnologicos, (0)::bigint) AS tecnologicos,
    COALESCE(c.muebles, (0)::bigint) AS muebles,
    COALESCE(c.vehiculos, (0)::bigint) AS vehiculos,
    COALESCE(c.total_bienes, (0)::bigint) AS total,
    round(COALESCE((((c.muebles)::numeric * 100.0) / (NULLIF(c.total_bienes, 0))::numeric), (0)::numeric), 2) AS p_muebles,
    round(COALESCE((((c.tecnologicos)::numeric * 100.0) / (NULLIF(c.total_bienes, 0))::numeric), (0)::numeric), 2) AS p_tecnologicos,
    round(COALESCE((((c.vehiculos)::numeric * 100.0) / (NULLIF(c.total_bienes, 0))::numeric), (0)::numeric), 2) AS p_vehiculos
   FROM (public.dependencias d
     LEFT JOIN conteo_categorias c ON ((d.id = c.iddependencia)));


ALTER VIEW public.kpibienespordependencia OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 38836)
-- Name: mantenimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mantenimientos (
    id integer NOT NULL,
    fechainicio date NOT NULL,
    fechafin date,
    estadoposterior character varying(20),
    tipo character varying(50) NOT NULL,
    descripcion text,
    estatus character varying(20) DEFAULT 'En proceso'::character varying,
    idbien integer
);


ALTER TABLE public.mantenimientos OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 47326)
-- Name: movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos (
    id integer NOT NULL,
    tipo character varying(50),
    motivo character varying(100),
    fecha date,
    idcedente integer,
    idreceptor integer,
    idorigen integer,
    iddestino integer
);


ALTER TABLE public.movimientos OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 47432)
-- Name: kpicontadoresbasicos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.kpicontadoresbasicos AS
 SELECT ( SELECT count(*) AS count
           FROM public.bienes
          WHERE ((bienes.estatus)::text <> 'Desincorporado'::text)) AS total_bienes,
    ( SELECT count(*) AS count
           FROM public.incorporaciones
          WHERE (incorporaciones.fechaentrada >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS incorporaciones_mes,
    ( SELECT count(*) AS count
           FROM public.desincorporaciones
          WHERE (desincorporaciones.fechasalida >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS desincorporaciones_mes,
    ( SELECT count(*) AS count
           FROM public.movimientos
          WHERE (movimientos.fecha >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS movimientos_mes,
    ( SELECT count(*) AS count
           FROM public.mantenimientos
          WHERE (mantenimientos.fechainicio >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS mantenimientos_mes;


ALTER VIEW public.kpicontadoresbasicos OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 47451)
-- Name: kpidistribuciondependencias; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.kpidistribuciondependencias AS
 WITH conteo_activo AS (
         SELECT bienes.iddependencia,
            count(*) FILTER (WHERE ((bienes.estatus)::text <> 'Desincorporado'::text)) AS activos
           FROM public.bienes
          GROUP BY bienes.iddependencia
        ), total_bienes AS (
         SELECT count(*) FILTER (WHERE ((bienes.estatus)::text <> 'Desincorporado'::text)) AS total_bienes
           FROM public.bienes
        )
 SELECT d.id,
    d.nombre AS dependencia,
    d.tipo,
    COALESCE(c.activos, (0)::bigint) AS activos,
    round(COALESCE((((c.activos)::numeric * 100.0) / (NULLIF(t.total_bienes, 0))::numeric), (0)::numeric), 2) AS p_activos
   FROM ((public.dependencias d
     LEFT JOIN conteo_activo c ON ((d.id = c.iddependencia)))
     CROSS JOIN total_bienes t);


ALTER VIEW public.kpidistribuciondependencias OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 47437)
-- Name: kpiestatusbienes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.kpiestatusbienes AS
 WITH resumen_bienes AS (
         SELECT count(*) FILTER (WHERE ((bienes.estatus)::text = 'Operativo'::text)) AS operativos,
            count(*) FILTER (WHERE ((bienes.estatus)::text = 'En mantenimiento'::text)) AS mantenimiento,
            count(*) FILTER (WHERE ((bienes.estatus)::text = 'No asignado'::text)) AS noasignados,
            count(*) FILTER (WHERE ((bienes.estatus)::text <> 'Desincorporado'::text)) AS activos
           FROM public.bienes
        )
 SELECT operativos,
    round((((operativos)::numeric * 100.0) / (NULLIF(activos, 0))::numeric), 2) AS p_operativos,
    mantenimiento,
    round((((mantenimiento)::numeric * 100.0) / (NULLIF(activos, 0))::numeric), 2) AS p_mantenimiento,
    noasignados,
    round((((noasignados)::numeric * 100.0) / (NULLIF(activos, 0))::numeric), 2) AS p_noasignados,
    activos
   FROM resumen_bienes;


ALTER VIEW public.kpiestatusbienes OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 38835)
-- Name: mantenimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mantenimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mantenimientos_id_seq OWNER TO postgres;

--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 245
-- Name: mantenimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimientos_id_seq OWNED BY public.mantenimientos.id;


--
-- TOC entry 264 (class 1259 OID 47325)
-- Name: movimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_id_seq OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 264
-- Name: movimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_id_seq OWNED BY public.movimientos.id;


--
-- TOC entry 242 (class 1259 OID 38800)
-- Name: muebles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muebles (
    idmueble integer NOT NULL,
    tipomueble character varying(100),
    material character varying(100)
);


ALTER TABLE public.muebles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 38626)
-- Name: municipios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.municipios (
    id integer NOT NULL,
    nombre character varying(50),
    idestado integer
);


ALTER TABLE public.municipios OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 38625)
-- Name: municipios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.municipios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.municipios_id_seq OWNER TO postgres;

--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 222
-- Name: municipios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.municipios_id_seq OWNED BY public.municipios.id;


--
-- TOC entry 225 (class 1259 OID 38639)
-- Name: parroquias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parroquias (
    id integer NOT NULL,
    nombre character varying(50),
    idmunicipio integer
);


ALTER TABLE public.parroquias OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 38638)
-- Name: parroquias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parroquias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parroquias_id_seq OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 224
-- Name: parroquias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parroquias_id_seq OWNED BY public.parroquias.id;


--
-- TOC entry 231 (class 1259 OID 38680)
-- Name: personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal (
    id integer NOT NULL,
    cedula character varying(10) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    fechanacimiento date NOT NULL,
    genero character varying(10) NOT NULL,
    telefono character varying(20),
    nivelprofesional character varying(10),
    estatus character varying(20) DEFAULT 'Activo'::character varying
);


ALTER TABLE public.personal OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 38679)
-- Name: personal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_id_seq OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 230
-- Name: personal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_id_seq OWNED BY public.personal.id;


--
-- TOC entry 237 (class 1259 OID 38739)
-- Name: presupuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuestos (
    id integer NOT NULL,
    codigopartida character varying(50),
    aniofiscal integer,
    semestre character varying(50),
    tipo character varying(100),
    montousd numeric(15,2),
    montobs numeric(15,2),
    tasacambio numeric(15,2),
    fecharegistro date DEFAULT CURRENT_DATE,
    estatus character varying(50) DEFAULT 'Activo'::character varying,
    descripcion text
);


ALTER TABLE public.presupuestos OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 38738)
-- Name: presupuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presupuestos_id_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 236
-- Name: presupuestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuestos_id_seq OWNED BY public.presupuestos.id;


--
-- TOC entry 243 (class 1259 OID 38811)
-- Name: tecnologicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tecnologicos (
    idtecnologico integer NOT NULL,
    especificaciones text,
    serial character varying(100)
);


ALTER TABLE public.tecnologicos OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 38719)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    correo character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    rol character varying(50) NOT NULL,
    fechacreacion date DEFAULT CURRENT_DATE,
    fechaactualizacion date,
    idpersonal integer
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 38718)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 234
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 244 (class 1259 OID 38824)
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    idvehiculo integer NOT NULL,
    color character varying(50),
    placa character varying(20),
    serialcarroceria character varying(100)
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 38940)
-- Name: vistabienes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistabienes AS
 SELECT b.id,
    b.numerobien AS numero,
    b.descripcion,
    b.marca,
    b.modelo,
    b.estatus,
    b.categoria,
    m.tipomueble,
    m.material,
    t.especificaciones,
    t.serial,
    v.color,
    v.placa,
    v.serialcarroceria,
    p.id AS idp,
    concat_ws(' '::text, p.nombres, p.apellidos) AS responsable,
    p.cedula AS cedula_responsable,
    d.id AS idd,
    d.nombre AS dependencia
   FROM (((((public.bienes b
     LEFT JOIN public.muebles m ON ((b.id = m.idmueble)))
     LEFT JOIN public.tecnologicos t ON ((b.id = t.idtecnologico)))
     LEFT JOIN public.vehiculos v ON ((b.id = v.idvehiculo)))
     LEFT JOIN public.personal p ON ((b.idpersonal = p.id)))
     LEFT JOIN public.dependencias d ON ((b.iddependencia = d.id)));


ALTER VIEW public.vistabienes OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 38970)
-- Name: vistabienesdesincorporados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistabienesdesincorporados AS
 SELECT b.id,
    b.numerobien AS numero,
    b.descripcion,
    b.marca,
    b.modelo,
    b.categoria,
    dd.iddesincorporacion,
    dd.tipo AS tipo_desincorporacion
   FROM (public.bienes b
     JOIN public.detallesdesincorporacion dd ON ((b.id = dd.idbien)))
  WHERE ((b.estatus)::text = 'Desincorporado'::text);


ALTER VIEW public.vistabienesdesincorporados OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 47376)
-- Name: vistabienespormovimiento; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistabienespormovimiento AS
 SELECT b.id,
    b.numerobien AS numero,
    b.descripcion,
    b.marca,
    b.modelo,
    b.categoria,
    dm.idmovimiento
   FROM (public.bienes b
     JOIN public.detallesmovimientos dm ON ((b.id = dm.idbien)));


ALTER VIEW public.vistabienespormovimiento OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 38920)
-- Name: vistadependencias; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistadependencias AS
 WITH count_bienes AS (
         SELECT bienes.iddependencia,
            count(*) AS total_bienes
           FROM public.bienes
          GROUP BY bienes.iddependencia
        ), count_personal AS (
         SELECT historialcargos.iddependencia,
            count(*) AS total_personal
           FROM public.historialcargos
          GROUP BY historialcargos.iddependencia
        )
 SELECT d.id,
    d.nombre,
    d.tipo,
    d.direccion,
    p.id AS idp,
    p.nombre AS parroquia,
    m.id AS idm,
    m.nombre AS municipio,
    e.id AS ide,
    e.nombre AS estado,
    COALESCE(cb.total_bienes, (0)::bigint) AS total_bienes,
    COALESCE(cp.total_personal, (0)::bigint) AS total_personal
   FROM (((((public.dependencias d
     JOIN public.parroquias p ON ((d.idparroquia = p.id)))
     JOIN public.municipios m ON ((p.idmunicipio = m.id)))
     JOIN public.estados e ON ((m.idestado = e.id)))
     LEFT JOIN count_bienes cb ON ((d.id = cb.iddependencia)))
     LEFT JOIN count_personal cp ON ((d.id = cp.iddependencia)));


ALTER VIEW public.vistadependencias OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 38965)
-- Name: vistadesincorporaciones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistadesincorporaciones AS
 WITH resumen_bienes AS (
         SELECT dd.iddesincorporacion,
            count(dd.idbien) AS cantidad_bienes
           FROM public.detallesdesincorporacion dd
          GROUP BY dd.iddesincorporacion
        )
 SELECT d.id,
    to_char((d.fechasalida)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha_salida,
    d.descripcion,
    p.id AS idp,
    p.cedula,
    concat(p.nombres, ' ', p.apellidos) AS responsable,
    c.nombre AS cargo,
    dp.id AS idd,
    dp.nombre AS dependencia,
    rb.cantidad_bienes
   FROM (((((public.desincorporaciones d
     JOIN resumen_bienes rb ON ((d.id = rb.iddesincorporacion)))
     JOIN public.dependencias dp ON ((dp.id = d.iddependencia)))
     JOIN public.personal p ON ((p.id = d.idpersonal)))
     JOIN public.historialcargos hc ON ((p.id = hc.idpersonal)))
     JOIN public.cargos c ON ((c.id = hc.idcargo)));


ALTER VIEW public.vistadesincorporaciones OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 38955)
-- Name: vistagastosporincorporacion; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistagastosporincorporacion AS
 SELECT b.id,
    b.numerobien AS numero,
    b.descripcion,
    b.marca,
    b.modelo,
    b.estatus,
    b.categoria,
    b.idincorporacion,
    g.monto AS gasto,
    g.idpresupuesto,
    p.tipo,
    p.montousd
   FROM ((public.bienes b
     LEFT JOIN public.gastos g ON ((b.id = g.idbien)))
     LEFT JOIN public.presupuestos p ON ((p.id = g.idpresupuesto)));


ALTER VIEW public.vistagastosporincorporacion OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 38950)
-- Name: vistaincorporaciones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistaincorporaciones AS
 WITH resumenbienes AS (
         SELECT b.idincorporacion,
            count(b.id) AS cantidad_bienes,
            sum(g.monto) AS total_gasto
           FROM (public.bienes b
             LEFT JOIN public.gastos g ON ((b.id = g.idbien)))
          GROUP BY b.idincorporacion
        )
 SELECT i.id,
    to_char((i.fechaentrada)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha_entrada,
    i.motivo,
    i.ordencompra AS orden_compra,
    i.factura,
    i.proveedor,
    p.id AS idp,
    p.cedula,
    concat(p.nombres, ' ', p.apellidos) AS responsable,
    c.nombre AS cargo,
    d.id AS idd,
    d.nombre AS dependencia,
    rb.total_gasto,
    rb.cantidad_bienes
   FROM (((((public.incorporaciones i
     JOIN resumenbienes rb ON ((i.id = rb.idincorporacion)))
     JOIN public.dependencias d ON ((d.id = i.iddependencia)))
     JOIN public.personal p ON ((p.id = i.idpersonal)))
     JOIN public.historialcargos hc ON ((p.id = hc.idpersonal)))
     JOIN public.cargos c ON ((c.id = hc.idcargo)));


ALTER VIEW public.vistaincorporaciones OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 38960)
-- Name: vistamantenimiento; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistamantenimiento AS
 SELECT m.id,
    b.id AS id_bien,
    b.numerobien AS numero_bien,
    b.descripcion AS descripcion_bien,
    b.categoria AS categoria_bien,
    m.tipo,
    to_char((m.fechainicio)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha_inicio,
    to_char((m.fechafin)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha_fin,
    m.estatus,
    m.estadoposterior AS estado_posterior,
    m.descripcion,
    COALESCE(g.monto, (0)::numeric) AS gasto,
    p.id AS id_presupuesto,
    p.codigopartida AS codigo_partida,
    p.tipo AS tipo_presupuesto,
    p.montousd AS monto,
    p.aniofiscal AS anio_fiscal,
    d.nombre AS dependencia,
    per.cedula,
    (((per.nombres)::text || ' '::text) || (per.apellidos)::text) AS responsable
   FROM ((((((public.mantenimientos m
     JOIN public.bienes b ON ((m.idbien = b.id)))
     LEFT JOIN public.gastos g ON ((m.id = g.idmantenimiento)))
     LEFT JOIN public.presupuestos p ON ((g.idpresupuesto = p.id)))
     LEFT JOIN public.incorporaciones inc ON ((b.idincorporacion = inc.id)))
     LEFT JOIN public.dependencias d ON ((inc.iddependencia = d.id)))
     LEFT JOIN public.personal per ON ((inc.idpersonal = per.id)));


ALTER VIEW public.vistamantenimiento OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 47380)
-- Name: vistamovimientos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistamovimientos AS
 WITH resumen_bienes AS (
         SELECT dm.idmovimiento,
            count(dm.idbien) AS cantidad_bienes
           FROM public.detallesmovimientos dm
          GROUP BY dm.idmovimiento
        )
 SELECT m.id,
    m.tipo,
    to_char((m.fecha)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha,
    m.motivo,
    d_orig.id AS id_origen,
    d_orig.nombre AS dependencia_origen,
    p_ced.id AS id_cedente,
    p_ced.cedula AS cedula_cedente,
    concat(p_ced.nombres, ' ', p_ced.apellidos) AS cedente,
    d_dest.id AS id_destino,
    d_dest.nombre AS dependencia_destino,
    p_rec.id AS id_receptor,
    p_rec.cedula AS cedula_receptor,
    concat(p_rec.nombres, ' ', p_rec.apellidos) AS receptor,
    COALESCE(rb.cantidad_bienes, (0)::bigint) AS cantidad_bienes
   FROM (((((public.movimientos m
     LEFT JOIN resumen_bienes rb ON ((m.id = rb.idmovimiento)))
     JOIN public.dependencias d_orig ON ((d_orig.id = m.idorigen)))
     JOIN public.dependencias d_dest ON ((d_dest.id = m.iddestino)))
     JOIN public.personal p_ced ON ((p_ced.id = m.idcedente)))
     JOIN public.personal p_rec ON ((p_rec.id = m.idreceptor)));


ALTER VIEW public.vistamovimientos OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 38925)
-- Name: vistapersonal; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistapersonal AS
 WITH count_bienes AS (
         SELECT bienes.idpersonal,
            count(*) AS bienes_asignados
           FROM public.bienes
          GROUP BY bienes.idpersonal
        )
 SELECT p.id,
    p.cedula,
    p.nombres,
    p.apellidos,
    concat_ws(' '::text, p.nombres, p.apellidos) AS empleado,
    to_char((p.fechanacimiento)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fechanacimiento,
    date_part('YEAR'::text, age((p.fechanacimiento)::timestamp with time zone)) AS edad,
    p.genero,
    p.telefono,
    p.nivelprofesional,
    p.estatus,
    c.id AS idc,
    c.nombre AS cargo,
    d.id AS idd,
    d.nombre AS dependencia,
    hc.id AS idhc,
    to_char((hc.fechaingreso)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fechaingreso,
    to_char((hc.fechasalida)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fechasalida,
    date_part('YEAR'::text, age((COALESCE(hc.fechasalida, CURRENT_DATE))::timestamp with time zone, (hc.fechaingreso)::timestamp with time zone)) AS antiguedad,
    COALESCE(cb.bienes_asignados, (0)::bigint) AS bienes_asignados
   FROM ((((public.personal p
     LEFT JOIN public.historialcargos hc ON ((hc.idpersonal = p.id)))
     LEFT JOIN public.cargos c ON ((hc.idcargo = c.id)))
     LEFT JOIN public.dependencias d ON ((hc.iddependencia = d.id)))
     LEFT JOIN count_bienes cb ON ((p.id = cb.idpersonal)));


ALTER VIEW public.vistapersonal OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 38945)
-- Name: vistapresupuestos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistapresupuestos AS
 WITH resumen_gastos AS (
         SELECT p_1.id,
            sum(g.monto) AS total_gastos
           FROM (public.presupuestos p_1
             LEFT JOIN public.gastos g ON ((p_1.id = g.idpresupuesto)))
          GROUP BY p_1.id
        )
 SELECT p.id,
    p.codigopartida AS codigo,
    p.aniofiscal AS anio,
    p.semestre,
    p.tipo,
    p.montousd,
    p.montobs,
    p.tasacambio,
    p.estatus,
    p.descripcion,
    to_char((p.fecharegistro)::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecharegistro,
    rg.total_gastos,
    (p.montousd - rg.total_gastos) AS total_disponible
   FROM (public.presupuestos p
     JOIN resumen_gastos rg ON ((p.id = rg.id)));


ALTER VIEW public.vistapresupuestos OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 39108)
-- Name: vistaresponsables; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistaresponsables AS
 SELECT d.id,
    d.nombre,
    d.tipo,
    d.direccion,
    p.id AS idr,
    concat_ws(' '::text, p.nombres, p.apellidos) AS responsable,
    p.cedula
   FROM (((public.dependencias d
     JOIN public.historialcargos hc ON ((hc.iddependencia = d.id)))
     JOIN public.personal p ON ((hc.idpersonal = p.id)))
     JOIN public.cargos c ON ((hc.idcargo = c.id)))
  WHERE ((c.tipo)::text <> 'Personal de la Unidad de Administración'::text);


ALTER VIEW public.vistaresponsables OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 38935)
-- Name: vistausuarios; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vistausuarios AS
 SELECT u.id,
    u.username,
    u.correo,
    u.rol,
    to_char((u.fechacreacion)::timestamp with time zone, 'DD/MM/YYYY'::text) AS creacion,
    to_char((u.fechaactualizacion)::timestamp with time zone, 'DD/MM/YYYY'::text) AS actualizacion,
    p.id AS idp,
    p.cedula,
    p.nombres,
    p.apellidos,
    concat_ws(' '::text, p.nombres, p.apellidos) AS empleado
   FROM (public.usuarios u
     JOIN public.personal p ON ((u.idpersonal = p.id)));


ALTER VIEW public.vistausuarios OWNER TO postgres;

--
-- TOC entry 4978 (class 2604 OID 38774)
-- Name: bienes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bienes ALTER COLUMN id SET DEFAULT nextval('public.bienes_id_seq'::regclass);


--
-- TOC entry 4968 (class 2604 OID 38673)
-- Name: cargos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargos ALTER COLUMN id SET DEFAULT nextval('public.cargos_id_seq'::regclass);


--
-- TOC entry 4967 (class 2604 OID 38655)
-- Name: dependencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dependencias ALTER COLUMN id SET DEFAULT nextval('public.dependencias_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 38882)
-- Name: desincorporaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desincorporaciones ALTER COLUMN id SET DEFAULT nextval('public.desincorporaciones_id_seq'::regclass);


--
-- TOC entry 4985 (class 2604 OID 38903)
-- Name: detallesdesincorporacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesdesincorporacion ALTER COLUMN id SET DEFAULT nextval('public.detallesdesincorporacion_id_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 47357)
-- Name: detallesmovimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesmovimientos ALTER COLUMN id SET DEFAULT nextval('public.detallesmovimientos_id_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 38619)
-- Name: estados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados ALTER COLUMN id SET DEFAULT nextval('public.estados_id_seq'::regclass);


--
-- TOC entry 4988 (class 2604 OID 47389)
-- Name: evaluaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones ALTER COLUMN id SET DEFAULT nextval('public.evaluaciones_id_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 38857)
-- Name: gastos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos ALTER COLUMN id SET DEFAULT nextval('public.gastos_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 38699)
-- Name: historialcargos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historialcargos ALTER COLUMN id SET DEFAULT nextval('public.historialcargos_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 38754)
-- Name: incorporaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incorporaciones ALTER COLUMN id SET DEFAULT nextval('public.incorporaciones_id_seq'::regclass);


--
-- TOC entry 4980 (class 2604 OID 38839)
-- Name: mantenimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos ALTER COLUMN id SET DEFAULT nextval('public.mantenimientos_id_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 47329)
-- Name: movimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos ALTER COLUMN id SET DEFAULT nextval('public.movimientos_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 38629)
-- Name: municipios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios ALTER COLUMN id SET DEFAULT nextval('public.municipios_id_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 38642)
-- Name: parroquias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parroquias ALTER COLUMN id SET DEFAULT nextval('public.parroquias_id_seq'::regclass);


--
-- TOC entry 4969 (class 2604 OID 38683)
-- Name: personal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal ALTER COLUMN id SET DEFAULT nextval('public.personal_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 38742)
-- Name: presupuestos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuestos ALTER COLUMN id SET DEFAULT nextval('public.presupuestos_id_seq'::regclass);


--
-- TOC entry 4972 (class 2604 OID 38722)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5257 (class 0 OID 38771)
-- Dependencies: 241
-- Data for Name: bienes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bienes (id, numerobien, descripcion, marca, modelo, estatus, categoria, idincorporacion, iddependencia, idpersonal) FROM stdin;
2	001235	Impresora Multifuncional	HP	LaserJet Pro	Operativo	Tecnológico	9	2	2
4	001237	Escritorio Ejecutivo en L	Genérico	Classic-L	Operativo	Mueble	9	1	1
1	001234	Computadora de Escritorio Completa	Lenovo	ThinkCentre M720	Operativo	Tecnológico	9	2	2
8	001239	Escritorio de oficina con gabinete	N/A	Ejecutivo	Operativo	Mueble	10	3	4
5	S/N	Silla Ergonómica de Oficina	Genérico	ErgoPro	Operativo	Mueble	9	1	1
9	123456789	erwxvwetyubniuymopmupioj,´j,m´poij oihmoiphoipmnpi	ertyuiopl´lk,´pk,mópmopm´pimípmípm´´pim´	mi0jm0iji0jopi´jmoi´´moimoipmopmnononiub	Operativo	Tecnológico	11	14	3
3	001236	Camión de Carga 350	Ford	F-350 Super Duty	Operativo	Vehículo o Equipo de Elevación	9	15	5
\.


--
-- TOC entry 5245 (class 0 OID 38670)
-- Dependencies: 229
-- Data for Name: cargos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cargos (id, nombre, tipo) FROM stdin;
1	Jefe Estadal	Responsable Patrimonial Primario
2	Coordinador de Administración	Responsable Patrimonial de Uso y Custodia
3	Coordinador de Compras	Responsable Patrimonial de Uso y Custodia
4	Coordinador de Contabilidad	Responsable Patrimonial de Uso y Custodia
5	Coordinador de Control de Calidad	Responsable Patrimonial de Uso y Custodia
6	Coordinador de Finanzas	Responsable Patrimonial de Uso y Custodia
7	Coordinador de Gestión Humana	Responsable Patrimonial de Uso y Custodia
8	Coordinador de Gestión Socialista	Responsable Patrimonial de Uso y Custodia
9	Coordinador de Infraestructura y Mantenimiento	Responsable Patrimonial de Uso y Custodia
10	Coordinador de Logística Y Distribución	Responsable Patrimonial de Uso y Custodia
11	Coordinador de Mercadeo y Ventas	Responsable Patrimonial de Uso y Custodia
12	Coordinador de Programas Especiales	Responsable Patrimonial de Uso y Custodia
13	Coordinador de Soporte Técnico	Responsable Patrimonial de Uso y Custodia
14	Coordinador de Seguridad Integral	Responsable Patrimonial de Uso y Custodia
15	Jefe de Centro de Acopio	Responsable Patrimonial de Uso y Custodia
16	Supervisor de Bienes	Personal de la Unidad de Administración
17	Analista Administrativo	Personal de la Unidad de Administración
18	Analista de Bienes	Personal de la Unidad de Administración
\.


--
-- TOC entry 5243 (class 0 OID 38652)
-- Dependencies: 227
-- Data for Name: dependencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dependencias (id, nombre, tipo, direccion, idparroquia) FROM stdin;
1	Jefatura Estadal	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
2	Área de Administración	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
3	Área de Compras	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
4	Área de Contabilidad	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
5	Área de Control de Calidad	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
6	Área de Finanzas	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
7	Área de Gestión Humana	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
8	Área de Gestión Socialista	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
9	Área de Infraestructura y Mantenimiento	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
10	Área de Logística y Distribución	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
11	Área de Mercadeo y Ventas	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
12	Área de Programas Especiales	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
13	Área de Seguridad Integral	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
14	Área de Soporte Técnico	Unidad	Mercal Sucre Sacosal. Av. Carúpano, a 20mts de Makro.	49
15	Centro de Acopio Sacosal	Centro de Acopio	Av. Carúpano, a 20mts de Makro	49
\.


--
-- TOC entry 5266 (class 0 OID 38879)
-- Dependencies: 250
-- Data for Name: desincorporaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.desincorporaciones (id, fechasalida, descripcion, iddependencia, idpersonal) FROM stdin;
\.


--
-- TOC entry 5268 (class 0 OID 38900)
-- Dependencies: 252
-- Data for Name: detallesdesincorporacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detallesdesincorporacion (id, tipo, iddesincorporacion, idbien) FROM stdin;
\.


--
-- TOC entry 5272 (class 0 OID 47354)
-- Dependencies: 267
-- Data for Name: detallesmovimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detallesmovimientos (id, idmovimiento, idbien) FROM stdin;
31	12	1
32	12	2
34	15	3
\.


--
-- TOC entry 5237 (class 0 OID 38616)
-- Dependencies: 221
-- Data for Name: estados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados (id, nombre) FROM stdin;
1	Sucre
\.


--
-- TOC entry 5274 (class 0 OID 47386)
-- Dependencies: 271
-- Data for Name: evaluaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluaciones (id, capacitacion, satisfaccion, semestre, fecha, idpersonal) FROM stdin;
1	1	5	2026-1	2026-03-03	8
2	1	5	2026-1	2026-03-03	6
3	1	5	2026-1	2026-03-03	7
4	1	4	2026-1	2026-03-07	6
\.


--
-- TOC entry 5264 (class 0 OID 38854)
-- Dependencies: 248
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gastos (id, fecha, monto, idpresupuesto, idbien, idmantenimiento) FROM stdin;
14	2026-03-04	20.00	4	\N	4
24	2026-02-24	10.00	4	\N	3
\.


--
-- TOC entry 5249 (class 0 OID 38696)
-- Dependencies: 233
-- Data for Name: historialcargos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historialcargos (id, fechaingreso, fechasalida, idpersonal, idcargo, iddependencia) FROM stdin;
1	2023-01-15	\N	1	1	1
2	2023-02-01	\N	2	2	2
3	2024-05-10	\N	3	14	14
4	2025-01-20	\N	4	3	3
5	2023-11-05	\N	5	15	15
7	2024-02-15	\N	7	17	2
8	2025-08-10	\N	8	18	2
6	2023-05-01	2026-03-01	6	16	2
\.


--
-- TOC entry 5255 (class 0 OID 38751)
-- Dependencies: 239
-- Data for Name: incorporaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incorporaciones (id, fechaentrada, ordencompra, factura, proveedor, motivo, iddependencia, idpersonal) FROM stdin;
9	2026-02-26				Donación	1	1
10	2026-03-03				Donación	3	4
11	2026-03-04				Donación	14	3
\.


--
-- TOC entry 5262 (class 0 OID 38836)
-- Dependencies: 246
-- Data for Name: mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimientos (id, fechainicio, fechafin, estadoposterior, tipo, descripcion, estatus, idbien) FROM stdin;
4	2026-03-04	2026-03-05	Óptimo	Correctivo	Cambio de cartuchos	Finalizado	2
3	2026-02-24	2026-03-04	Óptimo	Preventivo	Limpieza hardware / software	Finalizado	1
\.


--
-- TOC entry 5270 (class 0 OID 47326)
-- Dependencies: 265
-- Data for Name: movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos (id, tipo, motivo, fecha, idcedente, idreceptor, idorigen, iddestino) FROM stdin;
12	Traslado	aaaaaaaaaaaaaaaaaa	2026-03-02	1	2	1	2
15	Traslado		2026-03-07	1	5	1	15
\.


--
-- TOC entry 5258 (class 0 OID 38800)
-- Dependencies: 242
-- Data for Name: muebles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.muebles (idmueble, tipomueble, material) FROM stdin;
4	Escritorio	Madera MDF y estructura metálica
5	Silla	Plástico, metal y tela de malla transpirable
8	Escritorio	Madera
\.


--
-- TOC entry 5239 (class 0 OID 38626)
-- Dependencies: 223
-- Data for Name: municipios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.municipios (id, nombre, idestado) FROM stdin;
1	Andrés Eloy Blanco	1
2	Andrés Mata	1
3	Arismendi	1
4	Benítez	1
5	Bermúdez	1
6	Bolívar	1
7	Cajigal	1
8	Cruz Salmerón Acosta	1
9	Libertador	1
10	Mariño	1
11	Mejía	1
12	Montes	1
13	Ribero	1
14	Sucre	1
15	Valdez	1
\.


--
-- TOC entry 5241 (class 0 OID 38639)
-- Dependencies: 225
-- Data for Name: parroquias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parroquias (id, nombre, idmunicipio) FROM stdin;
1	Mariño	1
2	Rómulo Gallegos	1
3	San José de Aerocuar	2
4	Tavera Acosta	2
5	Río Caribe	3
6	Antonio José de Sucre	3
7	El Morro de Puerto Santo	3
8	Puerto Santo	3
9	San Juan de las Galdonas	3
10	El Rincón	4
11	General Francisco Antonio Vásquez	4
12	Guaraúnos	4
13	Tunapuicito	4
14	Unión	4
15	Bolívar	5
16	Maracapana	5
17	Santa Catalina	5
18	Santa Rosa	5
19	Santa Teresa	5
20	Marigüitar	6
21	El Paují	7
22	Libertad	7
23	Yaguaraparo	7
24	Araya	8
25	Chacopata	8
26	Manicuare	8
27	Tunapuy	9
28	Campo Elías	9
29	Irapa	10
30	Campo Claro	10
31	Marabal	10
32	San Antonio de Irapa	10
33	Soro	10
34	San Antonio del Golfo	11
35	Cumanacoa	12
36	Arenas	12
37	Aricagua	12
38	Cocollar	12
39	San Fernando	12
40	San Lorenzo	12
41	Cariaco	13
42	Catuaro	13
43	Rendón	13
44	Santa Cruz	13
45	Santa María	13
46	Altagracia	14
47	Ayacucho	14
48	Santa Inés	14
49	Valentín Valiente	14
50	San Juan	14
51	Raúl Leoni	14
52	Gran Mariscal	14
53	Güiria	15
54	Bideau	15
55	Cristóbal Colón	15
56	Punta de Piedras	15
\.


--
-- TOC entry 5247 (class 0 OID 38680)
-- Dependencies: 231
-- Data for Name: personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal (id, cedula, nombres, apellidos, fechanacimiento, genero, telefono, nivelprofesional, estatus) FROM stdin;
1	12345678	Carlos Eduardo	Gómez Pérez	1980-05-14	M	0414-1234567	Ing.	Activo
2	15876543	María Alejandra	Rodríguez Silva	1985-11-22	F	0424-9876543	Lic.	Activo
3	18999888	José Antonio	Marcano	1990-03-10	M	0416-5554433	T.S.U.	Activo
4	20111222	Ana Karina	López	1995-07-08	F	0412-1112233	Lic.	Activo
5	14555666	Luis Fernando	Martínez	1982-09-30	M	0426-9998877	T.S.U.	Activo
7	19333444	Carmen Elena	Suárez	1992-08-25	F	0416-7778899	Ing.	Activo
8	22444555	Jesús Manuel	Rojas	1998-01-15	M	0424-5556677	T.S.U.	Activo
6	16777888	Roberto Carlos	Díaz	1986-04-12	M	0414-2223344	Lic.	Inactivo
\.


--
-- TOC entry 5253 (class 0 OID 38739)
-- Dependencies: 237
-- Data for Name: presupuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuestos (id, codigopartida, aniofiscal, semestre, tipo, montousd, montobs, tasacambio, fecharegistro, estatus, descripcion) FROM stdin;
1	401-01	2026	Semestre I	Compra de Equipos Tecnológicos	5000.00	2086800.00	417.36	2026-02-25	Activo	Fondo para modernización de equipos de oficina
2	402-05	2026	Semestre I	Compra de Vehículos / Equipos de Elevación	12000.00	5008320.00	417.36	2026-02-25	Activo	Adquisición de vehículos de carga
4	404-01	2026	Semestre I	Mantenimiento de Bienes	1000.00	417360.00	417.36	2026-02-25	Activo	Fondo para mantenimiento general
3	403-10	2026	Semestre I	Compra de Muebles	2500.00	1043400.00	417.36	2026-02-25	Activo	Renovación de escritorios y sillas ergonómicas
\.


--
-- TOC entry 5259 (class 0 OID 38811)
-- Dependencies: 243
-- Data for Name: tecnologicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tecnologicos (idtecnologico, especificaciones, serial) FROM stdin;
2	Impresión láser blanco y negro, escáner ADF	HP-11223344
1	Intel Core i5, 8GB RAM, 256GB SSD, Monitor 19"	LNV-88776655
9	dq dqw dqw dwqdqwdqw	10987654321|234567890'¿'098765432234567890'
\.


--
-- TOC entry 5251 (class 0 OID 38719)
-- Dependencies: 235
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, correo, contrasena, rol, fechacreacion, fechaactualizacion, idpersonal) FROM stdin;
1	Supervisor01	rdiaz@mercal.gob.ve	$2a$10$rcjwH5zZZrxI7v4rdLH1eu3BAqTamqrgjS2tvyoDQWtRJY3FDO656	Supervisor	2026-02-25	\N	6
2	Analista01	csuarez@mercal.gob.ve	$2a$10$3fFknKr0WFCk81UBehHFC.KsiShwZFY7nuHRq2ECwOiFSd1kvgLcC	Analista	2026-02-25	\N	7
3	Admin01	jrojas@mercal.gob.ve	$2b$10$nyypJ26hFmDW5XyHRZ6tMOmdE5aoV9z1HhTM5YyonKF/wpWHht2jy	Administrador	2026-02-25	2026-03-05	8
\.


--
-- TOC entry 5260 (class 0 OID 38824)
-- Dependencies: 244
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (idvehiculo, color, placa, serialcarroceria) FROM stdin;
3	Blanco	A12B34C	1FMYU3500XYZ98765
\.


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 240
-- Name: bienes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bienes_id_seq', 10, true);


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 228
-- Name: cargos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cargos_id_seq', 18, true);


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 226
-- Name: dependencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dependencias_id_seq', 15, true);


--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 249
-- Name: desincorporaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.desincorporaciones_id_seq', 11, true);


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 251
-- Name: detallesdesincorporacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detallesdesincorporacion_id_seq', 40, true);


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 266
-- Name: detallesmovimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detallesmovimientos_id_seq', 34, true);


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 220
-- Name: estados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_id_seq', 1, true);


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 270
-- Name: evaluaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluaciones_id_seq', 4, true);


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 247
-- Name: gastos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gastos_id_seq', 24, true);


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 232
-- Name: historialcargos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historialcargos_id_seq', 8, true);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 238
-- Name: incorporaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incorporaciones_id_seq', 11, true);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 245
-- Name: mantenimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimientos_id_seq', 15, true);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 264
-- Name: movimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_id_seq', 15, true);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 222
-- Name: municipios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.municipios_id_seq', 15, true);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 224
-- Name: parroquias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parroquias_id_seq', 56, true);


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 230
-- Name: personal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_id_seq', 8, true);


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 236
-- Name: presupuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuestos_id_seq', 4, true);


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 234
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- TOC entry 5017 (class 2606 OID 38783)
-- Name: bienes bienes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bienes
    ADD CONSTRAINT bienes_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 38678)
-- Name: cargos cargos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_pkey PRIMARY KEY (id);


--
-- TOC entry 4999 (class 2606 OID 38663)
-- Name: dependencias dependencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dependencias
    ADD CONSTRAINT dependencias_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 38888)
-- Name: desincorporaciones desincorporaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desincorporaciones
    ADD CONSTRAINT desincorporaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5032 (class 2606 OID 38907)
-- Name: detallesdesincorporacion detallesdesincorporacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesdesincorporacion
    ADD CONSTRAINT detallesdesincorporacion_pkey PRIMARY KEY (id);


--
-- TOC entry 5036 (class 2606 OID 47360)
-- Name: detallesmovimientos detallesmovimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesmovimientos
    ADD CONSTRAINT detallesmovimientos_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 38624)
-- Name: estados estados_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados
    ADD CONSTRAINT estados_nombre_key UNIQUE (nombre);


--
-- TOC entry 4993 (class 2606 OID 38622)
-- Name: estados estados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados
    ADD CONSTRAINT estados_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 47395)
-- Name: evaluaciones evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 38862)
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 38702)
-- Name: historialcargos historialcargos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historialcargos
    ADD CONSTRAINT historialcargos_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 38759)
-- Name: incorporaciones incorporaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incorporaciones
    ADD CONSTRAINT incorporaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 38847)
-- Name: mantenimientos mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 47332)
-- Name: movimientos movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 38805)
-- Name: muebles muebles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muebles
    ADD CONSTRAINT muebles_pkey PRIMARY KEY (idmueble);


--
-- TOC entry 4995 (class 2606 OID 38632)
-- Name: municipios municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 38645)
-- Name: parroquias parroquias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parroquias
    ADD CONSTRAINT parroquias_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 38694)
-- Name: personal personal_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_cedula_key UNIQUE (cedula);


--
-- TOC entry 5005 (class 2606 OID 38692)
-- Name: personal personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 38749)
-- Name: presupuestos presupuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuestos
    ADD CONSTRAINT presupuestos_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 38818)
-- Name: tecnologicos tecnologicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tecnologicos
    ADD CONSTRAINT tecnologicos_pkey PRIMARY KEY (idtecnologico);


--
-- TOC entry 5009 (class 2606 OID 38730)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 38732)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 5024 (class 2606 OID 38829)
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (idvehiculo);


--
-- TOC entry 5018 (class 1259 OID 38799)
-- Name: idx_unique_numero_real; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_unique_numero_real ON public.bienes USING btree (numerobien) WHERE ((numerobien)::text <> 'S/N'::text);


--
-- TOC entry 5069 (class 2620 OID 47450)
-- Name: mantenimientos tr_mantenimiento_eliminar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_mantenimiento_eliminar AFTER DELETE ON public.mantenimientos FOR EACH ROW WHEN (((old.estatus)::text = 'En proceso'::text)) EXECUTE FUNCTION public.revertir_estatus_al_eliminar();


--
-- TOC entry 5070 (class 2620 OID 47449)
-- Name: mantenimientos tr_mantenimiento_sincronizar_estatus; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_mantenimiento_sincronizar_estatus AFTER INSERT OR UPDATE ON public.mantenimientos FOR EACH ROW EXECUTE FUNCTION public.sincronizar_estatus_mantenimiento();


--
-- TOC entry 5048 (class 2606 OID 38789)
-- Name: bienes bienes_iddependencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bienes
    ADD CONSTRAINT bienes_iddependencia_fkey FOREIGN KEY (iddependencia) REFERENCES public.dependencias(id);


--
-- TOC entry 5049 (class 2606 OID 38784)
-- Name: bienes bienes_idincorporacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bienes
    ADD CONSTRAINT bienes_idincorporacion_fkey FOREIGN KEY (idincorporacion) REFERENCES public.incorporaciones(id) ON DELETE SET NULL;


--
-- TOC entry 5050 (class 2606 OID 38794)
-- Name: bienes bienes_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bienes
    ADD CONSTRAINT bienes_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id);


--
-- TOC entry 5041 (class 2606 OID 38664)
-- Name: dependencias dependencias_idparroquia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dependencias
    ADD CONSTRAINT dependencias_idparroquia_fkey FOREIGN KEY (idparroquia) REFERENCES public.parroquias(id);


--
-- TOC entry 5058 (class 2606 OID 38889)
-- Name: desincorporaciones desincorporaciones_iddependencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desincorporaciones
    ADD CONSTRAINT desincorporaciones_iddependencia_fkey FOREIGN KEY (iddependencia) REFERENCES public.dependencias(id);


--
-- TOC entry 5059 (class 2606 OID 38894)
-- Name: desincorporaciones desincorporaciones_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desincorporaciones
    ADD CONSTRAINT desincorporaciones_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id);


--
-- TOC entry 5060 (class 2606 OID 38913)
-- Name: detallesdesincorporacion detallesdesincorporacion_idbien_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesdesincorporacion
    ADD CONSTRAINT detallesdesincorporacion_idbien_fkey FOREIGN KEY (idbien) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 38908)
-- Name: detallesdesincorporacion detallesdesincorporacion_iddesincorporacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesdesincorporacion
    ADD CONSTRAINT detallesdesincorporacion_iddesincorporacion_fkey FOREIGN KEY (iddesincorporacion) REFERENCES public.desincorporaciones(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 47366)
-- Name: detallesmovimientos detallesmovimientos_idbien_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesmovimientos
    ADD CONSTRAINT detallesmovimientos_idbien_fkey FOREIGN KEY (idbien) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 47361)
-- Name: detallesmovimientos detallesmovimientos_idmovimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallesmovimientos
    ADD CONSTRAINT detallesmovimientos_idmovimiento_fkey FOREIGN KEY (idmovimiento) REFERENCES public.movimientos(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 47396)
-- Name: evaluaciones evaluaciones_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id);


--
-- TOC entry 5055 (class 2606 OID 38868)
-- Name: gastos gastos_idbien_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_idbien_fkey FOREIGN KEY (idbien) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 38873)
-- Name: gastos gastos_idmantenimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_idmantenimiento_fkey FOREIGN KEY (idmantenimiento) REFERENCES public.mantenimientos(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 38863)
-- Name: gastos gastos_idpresupuesto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_idpresupuesto_fkey FOREIGN KEY (idpresupuesto) REFERENCES public.presupuestos(id);


--
-- TOC entry 5042 (class 2606 OID 38708)
-- Name: historialcargos historialcargos_idcargo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historialcargos
    ADD CONSTRAINT historialcargos_idcargo_fkey FOREIGN KEY (idcargo) REFERENCES public.cargos(id);


--
-- TOC entry 5043 (class 2606 OID 38713)
-- Name: historialcargos historialcargos_iddependencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historialcargos
    ADD CONSTRAINT historialcargos_iddependencia_fkey FOREIGN KEY (iddependencia) REFERENCES public.dependencias(id);


--
-- TOC entry 5044 (class 2606 OID 38703)
-- Name: historialcargos historialcargos_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historialcargos
    ADD CONSTRAINT historialcargos_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 38760)
-- Name: incorporaciones incorporaciones_iddependencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incorporaciones
    ADD CONSTRAINT incorporaciones_iddependencia_fkey FOREIGN KEY (iddependencia) REFERENCES public.dependencias(id);


--
-- TOC entry 5047 (class 2606 OID 38765)
-- Name: incorporaciones incorporaciones_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incorporaciones
    ADD CONSTRAINT incorporaciones_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id);


--
-- TOC entry 5054 (class 2606 OID 38848)
-- Name: mantenimientos mantenimientos_idbien_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_idbien_fkey FOREIGN KEY (idbien) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 47333)
-- Name: movimientos movimientos_idcedente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_idcedente_fkey FOREIGN KEY (idcedente) REFERENCES public.personal(id);


--
-- TOC entry 5063 (class 2606 OID 47348)
-- Name: movimientos movimientos_iddestino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_iddestino_fkey FOREIGN KEY (iddestino) REFERENCES public.dependencias(id);


--
-- TOC entry 5064 (class 2606 OID 47343)
-- Name: movimientos movimientos_idorigen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_idorigen_fkey FOREIGN KEY (idorigen) REFERENCES public.dependencias(id);


--
-- TOC entry 5065 (class 2606 OID 47338)
-- Name: movimientos movimientos_idreceptor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_idreceptor_fkey FOREIGN KEY (idreceptor) REFERENCES public.personal(id);


--
-- TOC entry 5051 (class 2606 OID 38806)
-- Name: muebles muebles_idmueble_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muebles
    ADD CONSTRAINT muebles_idmueble_fkey FOREIGN KEY (idmueble) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5039 (class 2606 OID 38633)
-- Name: municipios municipios_idestado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_idestado_fkey FOREIGN KEY (idestado) REFERENCES public.estados(id);


--
-- TOC entry 5040 (class 2606 OID 38646)
-- Name: parroquias parroquias_idmunicipio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parroquias
    ADD CONSTRAINT parroquias_idmunicipio_fkey FOREIGN KEY (idmunicipio) REFERENCES public.municipios(id);


--
-- TOC entry 5052 (class 2606 OID 38819)
-- Name: tecnologicos tecnologicos_idtecnologico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tecnologicos
    ADD CONSTRAINT tecnologicos_idtecnologico_fkey FOREIGN KEY (idtecnologico) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 2606 OID 38733)
-- Name: usuarios usuarios_idpersonal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_idpersonal_fkey FOREIGN KEY (idpersonal) REFERENCES public.personal(id);


--
-- TOC entry 5053 (class 2606 OID 38830)
-- Name: vehiculos vehiculos_idvehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_idvehiculo_fkey FOREIGN KEY (idvehiculo) REFERENCES public.bienes(id) ON DELETE CASCADE;


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2026-03-07 15:02:54

--
-- PostgreSQL database dump complete
--

\unrestrict 8rvh3KaGmUsgKUIXnC0CiH0hnbqsqWQWLw7CjySAOeRUxgQKL647h86WbJf2vte

