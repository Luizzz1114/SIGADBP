import cron from 'node-cron';
import IndicadoresServices from '../services/indicadoresServices.js';

export const iniciarTareasProgramadas = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Ejecutando tarea programada: IBEO');
    await IndicadoresServices.procesarKpiIBEO();
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });
  
  cron.schedule('0 0 1 * *', async () => {
    console.log('Ejecutando tarea programada: ICMI');
    await IndicadoresServices.procesarICMI();
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });

  console.log('📅 Tareas programadas (Cron jobs) inicializadas correctamente.');
};