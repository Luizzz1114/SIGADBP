import cron from 'node-cron';
import IndicadoresServices from '../services/indicadoresServices.js';

export const iniciarTareasProgramadas = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Ejecutando tarea programada: IBEO, ICMI');
    await IndicadoresServices.procesarKpiIBEO();
    await IndicadoresServices.procesarICMI();
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });
  
  cron.schedule('0 0 1 1,7 *', async () => {
    console.log('Ejecutando tarea programada: IIET, IIM, IIMB');
    await IndicadoresServices.procesarKpiIIET();
    await IndicadoresServices.procesarKpiIIM();
    await IndicadoresServices.procesarKpiIIMB();
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });

  console.log('📅 Tareas programadas (Cron jobs) inicializadas correctamente.');
};