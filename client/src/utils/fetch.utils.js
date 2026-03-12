import ubicacionServices from '@/services/ubicacion.services.js';
import cargosServices from '@/services/cargos.services.js';
import dependenciasServices from '@/services/dependencias.services.js';
import personalServices from '@/services/personal.services.js';
import usuariosServices from '@/services/usuarios.services.js';
import bienesServices from '@/services/bienes.services';
import presupuestosServices from '@/services/presupuestos.services';


// --- Ubicación Geográfica ---
export async function listarEstados() {
  try {
    const estados = await ubicacionServices.listarEstados();
    return estados;
  } catch(error) {
    console.error('Error al listar estados: ', error);
    return [];
  }
}

export async function listarMunicipios(idEstado) {
  try {
    const municipios = await ubicacionServices.listarMunicipios(idEstado);
    return municipios;
  } catch(error) {
    console.error('Error al listar municipios: ', error);
    return [];
  }
}

export async function listarParroquias(idMunicipio) {
  try {
    const parroquias = await ubicacionServices.listarParroquias(idMunicipio);
    return parroquias;
  } catch(error) {
    console.error('Error al listar parroquias: ', error);
    return [];
  }
}


// --- Cargos y Dependencias
export async function listarCargos() {
  try {
    const cargos = await cargosServices.listar();
    return cargos;
  } catch (error) {
    console.error('Error al listar los cargos: ', error);
    return [];
  }
}

export async function listarDependencias() {
  try {
    const dependencias = await dependenciasServices.listar();
    return dependencias;
  } catch (error) {
    console.error('Error al listar las dependencias: ', error);
    return [];
  }
}

// --- Listar Personal
export async function listarSinUsuario() {
  try {
    const personal = await personalServices.listarSinUsuario();
    return personal;
  } catch (error) {
    console.error('Error al listar el personal: ', error);
    return [];
  }
}

// --- Leer Usuario
export async function obtenerUsuario(id) {
  try {
    const usuario = await usuariosServices.leer(id);
    return usuario;
  } catch (error) {
    console.error('Error al obtener el usuario: ', error);
    return {};
  }
}

// --- Listar los bienes "No asignados"
export async function listarBienesNoAsignados() {
  try {
    const bienes = await bienesServices.listarNoAsignados();
    return bienes;
  } catch (error) {
    console.error('Error al listar los bienes: ', error);
    return [];
  }
}

// --- Listar los bienes "Operativos"
export async function listarOperativos() {
  try {
    const bienes = await bienesServices.listarOperativos();
    return bienes;
  } catch (error) {
    console.error('Error al listar los bienes: ', error);
    return [];
  }
}

// --- Listar los presupuestos activos
export async function listarPresupuestos() {
  try {
    const presupuestos = await presupuestosServices.listarActivos();
    return presupuestos;
  } catch (error) {
    console.error('Error al listar presupuestos: ', error);
    return [];
  }
}

// --- Listar las Dependencias con sus Responsables
export async function listarDependenciasResponsables() {
  try {
    const dependencias = await dependenciasServices.listarDependenciasResponsables();
    return dependencias;
  } catch (error) {
    console.error('Error al listar dependencias: ', error);
    return [];
  }
}


export async function listarPersonal() {
  try {
    const personal = await personalServices.listar();
    return personal;
  } catch (error) {
    console.error('Error al listar personal: ', error);
    return [];
  }
} 