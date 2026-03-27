import ubicacionServices from '@/services/ubicacion.services.js';
import cargosServices from '@/services/cargos.services.js';
import dependenciasServices from '@/services/dependencias.services.js';
import personalServices from '@/services/personal.services.js';
import usuariosServices from '@/services/usuarios.services.js';
import bienesServices from '@/services/bienes.services';
import presupuestosServices from '@/services/presupuestos.services.js';



// --- UBICACIÓN GEOGRÁFICA ---
export async function listarEstados() {
  try {
    return await ubicacionServices.listarEstados();
  } catch (error) {
    console.error('Error al listar estados: ', error);
    return [];
  }
}

export async function listarMunicipiosPorEstado(idEstado) {
  try {
    return await ubicacionServices.listarMunicipios(idEstado);
  } catch (error) {
    console.error('Error al listar municipios: ', error);
    return [];
  }
}

export async function listarParroquiasPorMunicipio(idMunicipio) {
  try {
    return await ubicacionServices.listarParroquias(idMunicipio);
  } catch (error) {
    console.error('Error al listar parroquias: ', error);
    return [];
  }
}



// --- ESTRUCTURA ORGANIZATIVA ---
export async function listarCargos() {
  try {
    return await cargosServices.listar();
  } catch (error) {
    console.error('Error al listar cargos: ', error);
    return [];
  }
}

export async function listarDependencias() {
  try {
    return await dependenciasServices.listar();
  } catch (error) {
    console.error('Error al listar dependencias: ', error);
    throw error;
  }
}

export async function listarDependenciasConResponsables() {
  try {
    return await dependenciasServices.listarResponsables();
  } catch (error) {
    console.error('Error al listar dependencias con responsables: ', error);
    return [];
  }
}



// --- PERSONAL Y USUARIOS ---
export async function listarPersonal() {
  try {
    return await personalServices.listar();
  } catch (error) {
    console.error('Error al listar personal: ', error);
    return [];
  }
}

export async function listarPersonalSinUsuario() {
  try {
    return await personalServices.listarSinUsuario();
  } catch (error) {
    console.error('Error al listar personal sin usuario: ', error);
    return [];
  }
}

export async function obtenerUsuario(id) {
  try {
    return await usuariosServices.obtener(id);
  } catch (error) {
    console.error('Error al obtener usuario: ', error);
    return {};
  }
}



// --- BIENES ---
export async function listarBienesNoAsignados() {
  try {
    return await bienesServices.listarNoAsignados();
  } catch (error) {
    console.error('Error al listar bienes no asignados: ', error);
    return [];
  }
}

export async function listarBienesOperativos() {
  try {
    return await bienesServices.listarOperativos();
  } catch (error) {
    console.error('Error al listar bienes operativos: ', error);
    return [];
  }
}



// --- PRESUPUESTOS ---
export async function listarPresupuestosActivos() {
  try {
    return await presupuestosServices.listarActivos();
  } catch (error) {
    console.error('Error al listar presupuestos activos: ', error);
    return [];
  }
}