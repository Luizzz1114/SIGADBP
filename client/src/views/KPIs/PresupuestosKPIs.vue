<script setup>
import { computed, onMounted, ref } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MoneyCard from '@/components/MoneyCard.vue';
import MiniBarChart from '@/components/Graficos/MiniBarChart.vue';
import metricasServices from '@/services/metricas.services.js';
import { exportarAImpresion } from '@/utils/imprimir.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();


// --- Configuración de la vista ---
const items = [
  { label: 'Presupuestos', route: '/presupuestos' },
  { label: 'Estadísticas', route: '/presupuestos/estadisticas' }
];

const kpisConfig = [
  { name: 'Inversión Equipos Tecnológicos', color: 'blue', icon: 'fi-rr-computer' },
  { name: 'Inversión Muebles', color: 'cyan', icon: 'fi-rr-chair' },
  { name: 'Mantenimiento Bienes', color: 'sky', icon: 'fi-rr-tools' }
];

const obtenerUltimoSemestre = () => {
  const hoy = new Date();
  return hoy.getMonth() >= 6 ? `I-${hoy.getFullYear()}` : `II-${hoy.getFullYear() - 1}`;
};

const obtenerSemestres = () => {
  const semestres = [];
  let periodo = obtenerUltimoSemestre();

  for (let indice = 0; indice < 10; indice += 1) {
    const [semestre, anio] = periodo.split('-');
    semestres.push({
      label: `${semestre} semestre ${anio}`,
      value: periodo
    });
    periodo = semestre === 'I' ? `II-${Number(anio) - 1}` : `I-${anio}`;
  }

  return semestres;
};

const semestres = obtenerSemestres();
const semestreSeleccionado = ref(semestres[0]?.value || null);
const cargando = ref(false);

// --- Referencias para impresión (Individuales) ---
const chartEquiposRef = ref(null);
const chartMueblesRef = ref(null);
const chartMantenimientoRef = ref(null);

// --- Computado para unificar la tabla (Se mantiene igual) ---
const datosConsolidadosPresupuesto = computed(() => {
  const equipos = chartDataEquipos.value;
  const muebles = chartDataMuebles.value;
  const mant = chartDataMantenimiento.value;

  return equipos.map((item, index) => {
    const valMuebles = muebles[index];
    const valMant = mant[index];

    return {
      periodo: item.label,
      porcEquipos: item.value,
      totalEquipos: item.detalles?.total || 0,
      porcMuebles: valMuebles?.value || 0,
      totalMuebles: valMuebles?.detalles?.total || 0,
      porcMant: valMant?.value || 0,
      totalMant: valMant?.detalles?.total || 0,
    };
  });
});

// --- Exportación a PDF (Gráficos en pág 1, Tabla en pág 2) ---
const manejarExportacion = () => {
  // 1. Contenedor virtual
  const contenedorVirtual = document.createElement('div');
  contenedorVirtual.style.display = 'flex';
  contenedorVirtual.style.flexDirection = 'column';
  contenedorVirtual.style.alignItems = 'center';
  contenedorVirtual.style.gap = '12px'; // Reducimos un poco el gap para ahorrar espacio
  contenedorVirtual.style.width = '100%';
  
  // ¡LA MAGIA DEL SALTO DE PÁGINA!
  // Esto obliga al PDF a pasar todo lo que viene después (la tabla) a la siguiente hoja.
  contenedorVirtual.style.pageBreakAfter = 'always';
  contenedorVirtual.style.breakAfter = 'page';

  // 2. Función auxiliar para clonar y aplastar a medida
  const agregarClon = (elemento) => {
    if (!elemento) return;
    const clon = elemento.cloneNode(true);
    clon.classList.remove('min-w-0'); 
    
    // Control de tamaño estricto para que los 3 entren en una hoja A4
    clon.style.width = '100%';
    clon.style.maxWidth = '600px'; 
    clon.style.height = '230px'; // Forzamos una altura fija compacta
    clon.style.overflow = 'hidden';
    
    // Estética
    clon.style.border = '1px solid #e2e8f0'; 
    clon.style.borderRadius = '10px';
    clon.style.padding = '12px';
    clon.style.pageBreakInside = 'avoid';
    clon.style.breakInside = 'avoid';

    // Ajustamos el SVG/Canvas interno para que no se desborde de nuestra nueva altura
    const graficoInterno = clon.querySelector('svg, canvas, .apexcharts-canvas');
    if (graficoInterno) {
      graficoInterno.style.maxHeight = '160px'; // Deja espacio para el título de la tarjeta
      graficoInterno.style.height = '100%';
    }

    contenedorVirtual.appendChild(clon);
  };

  // 3. Añadimos los 3 gráficos
  agregarClon(chartEquiposRef.value);
  agregarClon(chartMueblesRef.value);
  agregarClon(chartMantenimientoRef.value);

  // 4. Exportamos
  const config = {
    elementoRef: contenedorVirtual,
    datos: datosConsolidadosPresupuesto.value,
    titulo: 'Histórico de ejecución presupuestaria (Comparativo)',
    descripcion: 'Porcentaje de uso y montos totales del presupuesto asignado a Equipos Tecnológicos, Muebles y Mantenimiento de Bienes durante los semestres evaluados.',
    columnas: ['Período', 'Equipos Tecnológicos', 'Muebles', 'Mantenimiento'],
    formatearFila: (d) => {
      const fmt = (monto) => new Intl.NumberFormat('de-DE').format(monto);
      return [
        d.periodo,
        `${d.porcEquipos}% ($${fmt(d.totalEquipos)})`,
        `${d.porcMuebles}% ($${fmt(d.totalMuebles)})`,
        `${d.porcMant}% ($${fmt(d.totalMant)})`
      ];
    },
    rangosAlerta: [
      { value: 'Óptimo: ≥ 60%', severity: 'success' },
      { value: 'Atención: 30% a 59%', severity: 'warn' },
      { value: 'Crítico: < 30%', severity: 'danger' }
    ]
  };

  exportarAImpresion(config);
};


// --- Estados ---
const respuestasAPI = ref([]);
const opPresupuesto = ref();


// --- Computados ---
const cardsData = computed(() => {
  // Estado 1: Cargando datos (respuestasAPI vacío)
  if (!respuestasAPI.value.length) {
    return kpisConfig.map(config => ({
      icon: config.icon,
      tipo: config.name,
      color: config.color,
      gasto_total: 0,
      presupuesto_total_usd: 0,
      porcentaje_uso: null,
      message: 'Cargando datos...'
    }));
  }

  // Estado 2: Datos cargados
  return respuestasAPI.value.map((res, index) => {
    const config = kpisConfig[index] || {};
    const kpiData = res?.[0] || {};
    const historial = kpiData.historial_metricas || [];
    const lastItem = historial.at(-1);
    const lastValue = lastItem?.valor ?? null;
    const message = lastItem ? lastItem.periodo : 'Sin datos';

    return {
      icon: config.icon, 
      tipo: config.name, 
      color: config.color,
      gasto_total: lastItem?.detalles?.cantidad ?? 0,
      presupuesto_total_usd: lastItem?.detalles?.total ?? 0,
      porcentaje_uso: lastValue,
      message
    };
  });
});

const chartDataEquipos = computed(() => {
  const historial = respuestasAPI.value[0]?.[0]?.historial_metricas || [];
  return historial.map(m => ({
    label: m.periodo,
    value: m.valor,
    detalles: m.detalles
  }));
});

const chartDataMuebles = computed(() => {
  const historial = respuestasAPI.value[1]?.[0]?.historial_metricas || [];
  return historial.map(m => ({
    label: m.periodo,
    value: m.valor,
    detalles: m.detalles
  }));
});

const chartDataMantenimiento = computed(() => {
  const historial = respuestasAPI.value[2]?.[0]?.historial_metricas || [];
  return historial.map(m => ({
    label: m.periodo,
    value: m.valor,
    detalles: m.detalles
  }));
});

const formatDetallesPresupuesto = (detalles) => {
  if (!detalles) return [];
  return [
    { label: 'Ejecutado', value: `$${new Intl.NumberFormat('de-DE').format(detalles.cantidad)}` },
    { label: 'Total', value: `$${new Intl.NumberFormat('de-DE').format(detalles.total)}` }
  ];
};


// --- Operaciones con la API ---
const cargarMetricas = async () => {
  cargando.value = true;
  try {
    const periodo = semestreSeleccionado.value;
    const [resEquipos, resMuebles, resMantenimiento] = await Promise.all([
      metricasServices.obtenerKPI('IIET', null, periodo),
      metricasServices.obtenerKPI('IIM', null, periodo),
      metricasServices.obtenerKPI('IIMB', null, periodo)
    ]);

    respuestasAPI.value = [resEquipos, resMuebles, resMantenimiento];

  } catch (error) {
    showError(error.response?.data?.message);
    console.error("Error cargando los KPIs:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarMetricas);
</script>

<template>
  <Breadcrumbs :items="items" />
  
  <div class="flex flex-col px-4 pb-4 gap-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg dark:text-slate-50">Análisis presupuestario</span>
          <span class="-mt-1 text-xs text-slate-400">Control y seguimiento de inversión en bienes</span>
        </div>
      </div>
      <Select
        v-model="semestreSeleccionado"
        :options="semestres"
        optionLabel="label"
        optionValue="value"
        :disabled="cargando"
        size="small"
        class="w-full sm:w-52"
        @change="cargarMetricas"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <MoneyCard
        v-for="(card, index) in cardsData"
        :key="index"
        :icon="card.icon"
        :item="card"
        :color="card.color || 'blue'"
      />
    </div>

    <div class="w-full">
      <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-850">
        <div class="flex items-center justify-between gap-x-4 p-2 rounded-t-xl border-b border-slate-200 bg-slate-50 ring-2 ring-inset ring-white dark:ring-slate-900/55 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="grid place-items-center shrink-0 size-7 text-base rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <i class="fi-rr-stats"></i>
            </div>
            <span class="font-bold text-base leading-tight dark:text-slate-50">Histórico de ejecución presupuestaria</span>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="manejarExportacion" label="Exportar PDF" icon="fi-rr-file-export" severity="secondary" class="h-7! shrink-0" />
            <Button @click="opPresupuesto.toggle($event)" severity="secondary" icon="fi-rr-info" class="size-7! shrink-0" />
            <Popover ref="opPresupuesto">
              <div class="flex flex-col gap-2 p-1 max-w-[calc(100vw-4rem)] sm:max-w-96">
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-info text-xs"></i>
                  </div>
                  Descripción
                </span>
                <p>Porcentaje de uso del presupuesto asignado a cada categoría durante el semestre culminado.</p>
                <Divider class="my-1!" />
                <span class="flex items-center gap-2 font-bold text-sm uppercase dark:text-slate-50">
                  <div class="flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 size-6 text-blue-500">
                    <i class="fi-br-triangle-warning text-xs"></i>
                  </div>
                  Rangos de alerta
                </span>
                <div class="flex items-center gap-2 flex-wrap">
                  <Tag value="Óptimo: ≥ 60%" severity="success" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Atención: 30% a 59%" severity="warn" class="ring-1 ring-inset ring-current/10" />
                  <Tag value="Crítico: < 30%" severity="danger" class="ring-1 ring-inset ring-current/10" />
                </div>
              </div>
            </Popover>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
          <!-- Equipos Tecnológicos -->
          <div ref="chartEquiposRef" class="flex flex-col p-4 gap-3 min-w-0 bg-white dark:bg-slate-850">
            <div class="flex items-center gap-2">
              <div class="grid place-items-center shrink-0 size-8 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                <i class="fi-rr-computer"></i>
              </div>
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">Equipos Tecnológicos</span>
            </div>
            <div class="w-full">
              <MiniBarChart
                v-if="chartDataEquipos.length"
                :data="chartDataEquipos" 
                is-percentage
                historical
                type="Ejecución"
                unit="%"
                :details-formatter="formatDetallesPresupuesto"
                color="blue"
              />
            </div>
          </div>
          <!-- Muebles -->
          <div ref="chartMueblesRef" class="flex flex-col p-4 gap-3 min-w-0 bg-white dark:bg-slate-850">
            <div class="flex items-center gap-2">
              <div class="grid place-items-center shrink-0 size-8 rounded-lg bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400">
                <i class="fi-rr-chair"></i>
              </div>
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">Muebles</span>
            </div>
            <div class="w-full">
              <MiniBarChart
                v-if="chartDataMuebles.length"
                :data="chartDataMuebles" 
                is-percentage
                historical
                type="Ejecución"
                unit="%"
                :details-formatter="formatDetallesPresupuesto"
                color="cyan"
              />
            </div>
          </div>
          <!-- Mantenimiento Bienes -->
          <div ref="chartMantenimientoRef" class="flex flex-col p-4 gap-3 min-w-0 bg-white dark:bg-slate-850">
            <div class="flex items-center gap-2">
              <div class="grid place-items-center shrink-0 size-8 rounded-lg bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400">
                <i class="fi-rr-tools"></i>
              </div>
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">Mantenimiento Bienes</span>
            </div>
            <div class="w-full">
              <MiniBarChart
                v-if="chartDataMantenimiento.length"
                :data="chartDataMantenimiento" 
                is-percentage
                historical
                type="Ejecución"
                unit="%"
                :details-formatter="formatDetallesPresupuesto"
                color="sky"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>