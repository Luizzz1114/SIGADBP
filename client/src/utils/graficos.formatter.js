import { obtenerMesAnio } from "./formatters";

export const adaptarDatosStackedBar = (datosApi, idDependenciaBuscada) => {
  const indicador = datosApi[0]; 
  const datosProcesados = [];
  indicador.historial_metricas.forEach(registroMensual => {
    const listaDependencias = Object.values(registroMensual.detalles);
    const depEncontrada = listaDependencias.find(dep => dep.id_dependencia === idDependenciaBuscada);
    if (depEncontrada) {
      datosProcesados.push({
        label: obtenerMesAnio( registroMensual.periodo),
        valueBottom: parseFloat(depEncontrada.porcentaje_operativos),
        valueTop: parseFloat(depEncontrada.porcentaje_mantenimiento),
        countBottom: parseInt(depEncontrada.bienes_operativos, 10),
        countTop: parseInt(depEncontrada.bienes_mantenimiento, 10),
        total: parseInt(depEncontrada.total_bienes, 10)
      });
    }
  });
  return datosProcesados;
};