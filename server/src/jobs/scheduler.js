import cron from 'node-cron';
import IndicadoresServices from '../services/indicadoresServices.js';
import PresupuestosService from '../services/presupuestosService.js'

export const iniciarTareasProgramadas = () => {
  cron.schedule('59 23 * * *', async () => {
    // 1. Verificamos si mañana es el día 1
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    
    if (manana.getDate() === 1) {
      console.log('Ejecutando tarea programada: IBEO, ICMI, IBODP');
      await IndicadoresServices.procesarKpiIBEO();
      await IndicadoresServices.procesarICMI();
      await IndicadoresServices.procesarKpiIBODP();
    } else {
    }
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });
  
  cron.schedule('59 23 30 5,11 *', async () => {
    console.log('Ejecutando tarea programada: IIET, IIM, IIMB, ICP, IPS');
    await IndicadoresServices.procesarKpiIIET();
    await IndicadoresServices.procesarKpiIIM();
    await IndicadoresServices.procesarKpiIIMB();
    await IndicadoresServices.procesarKpiICP();
    await IndicadoresServices.procesarKpiIPS();
    
    const mes = new Date();

    if (mes.getMonth() === 5) {
      console.log('Desactivando presupuesto del semestre I');
      await PresupuestosService.desactivarSemestreI();
    } else if (mes.getMonth() === 11) {
      console.log('Desactivando presupuesto del semestre II');
      await PresupuestosService.desactivarSemestreII();
    }
  }, {
    scheduled: true,
    timezone: "America/Caracas"
  });

  console.log('📅 Tareas programadas (Cron jobs) inicializadas correctamente.');
};