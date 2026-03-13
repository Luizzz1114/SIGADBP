<template>
  <div class="flex justify-between sm:items-end mt-4">
    <div class="flex flex-col sm:flex-row gap-1 sm:gap-8 text-sm font-medium text-slate-400 dark:text-slate-400 flex-wrap">
      <div class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-emerald-400"></span> ≥ {{ thresholdConfig.optimal }}%
      </div>
      <div class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-orange-400"></span> {{ thresholdConfig.warning }}% - {{ thresholdConfig.optimal - 1 }}%
      </div>
      <div class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-red-400"></span> < {{ thresholdConfig.warning }}%
      </div>
    </div>
    <div v-if="latestValue" class="text-right flex flex-col items-end">
      <span class="block text-2xl font-black" :class="getThresholdTextColor(latestValue.value)">
        {{ latestValue.value }}%
      </span>
      <span class="text-sm font-medium text-slate-400">
        Mes actual
      </span>
    </div>
  </div>

  <div class="w-full relative mt-4 overflow-x-auto">
    <div 
      ref="chartContainer" 
      class="relative flex items-center justify-start w-full" 
      role="region"
      aria-label="Gráfico de evolución mensual"
    >
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="y-axis" aria-hidden="true">
          <template v-for="(tick, index) in computedYTicks" :key="'tick-' + index">
            <line 
              :x1="margins.left" 
              :y1="tick.y" 
              :x2="svgWidth - margins.right" 
              :y2="tick.y" 
              class="stroke-slate-200 dark:stroke-slate-700 transition-colors duration-300"
              stroke-width="1"
            />
            <text 
              :x="margins.left - 12"
              :y="tick.y + 4" 
              text-anchor="end"
              class="fill-slate-400 dark:fill-slate-500 text-[13px] font-medium transition-colors duration-300"
            >
              {{ tick.value }}%
            </text>
          </template>
        </g>

        <path 
          :d="areaPath" 
          fill="url(#blueGradient)" 
          class="transition-all duration-700 ease-out"
        />

        <path 
          :d="linePath" 
          class="stroke-blue-400 transition-all duration-700 ease-out" 
          stroke-width="3" 
          fill="none" 
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <line 
          v-if="processedData.length > 0"
          :x1="processedData[processedData.length - 1].x" 
          :y1="isMounted ? processedData[processedData.length - 1].yAnimated : processedData[processedData.length - 1].yStatic" 
          :x2="processedData[processedData.length - 1].x" 
          :y2="margins.top + chartHeight" 
          class="stroke-blue-400/50 dark:stroke-blue-400/50 transition-all duration-700 ease-out"
          stroke-dasharray="4 4"
          stroke-width="1.5"
        />

        <g 
          v-for="(item, index) in processedData" 
          :key="index"
          class="group cursor-pointer outline-none"
          role="graphics-symbol"
          :aria-label="`Mes de ${item.label}, valor: ${item.value}%`"
          @mouseenter="onMouseEnter($event, item)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
        >
          <rect 
            :x="item.x - (hoverZoneWidth / 2)" 
            :y="margins.top" 
            :width="hoverZoneWidth" 
            :height="chartHeight" 
            fill="transparent"
            class="transition-colors"
          />

          <line 
            :x1="item.x" 
            :y1="isMounted ? item.yAnimated : item.yStatic" 
            :x2="item.x" 
            :y2="margins.top + chartHeight" 
            class="stroke-slate-400 dark:stroke-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            stroke-dasharray="4 4"
            stroke-width="1.5"
          />

          <circle 
            v-if="index === processedData.length - 1"
            :cx="item.x" 
            :cy="isMounted ? item.yAnimated : item.yStatic" 
            r="8" 
            class="fill-blue-400/20 dark:fill-blue-400/20 animate-pulse transition-all duration-700 ease-out" 
          />

          <circle 
            :cx="item.x" 
            :cy="isMounted ? item.yAnimated : item.yStatic" 
            r="4" 
            class="fill-blue-400 transition-all duration-700 ease-out group-hover:r-[6px]" 
          />

          <text
            :x="item.x"
            :y="item.yStatic + 25"
            text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] font-medium transition-all duration-300 group-hover:fill-slate-800 dark:group-hover:fill-slate-200"
            :class="{ 'font-bold fill-slate-700 dark:fill-slate-300': index === processedData.length - 1 }"
            aria-hidden="true"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>

      <div 
        v-if="tooltipVisible && tooltipData"
        class="absolute z-50 pointer-events-none overflow-hidden rounded-lg shadow-xs border border-slate-200 bg-white dark:bg-slate-850 dark:border-slate-700 transition-all duration-100 ease-out"
        :style="tooltipStyle"
      >
        <div class="px-2 pt-2 pb-1.5 border-b border-slate-200 bg-slate-100 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800 font-medium mb-1">
          {{ tooltipData.label }}
        </div>
        <div class="flex items-center gap-2 px-2 pb-2 pt-1.5">
          <svg viewBox="0 0 10 10" class="w-2.5 h-2.5 rounded-full shrink-0">
            <circle cx="5" cy="5" r="5" :class="tooltipData.colorClass" />
          </svg>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
            Operatividad: {{ tooltipData.value }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

// --- PROPS DEL COMPONENTE ---
const props = defineProps({
  title: { type: String, default: '% Bienes en Estado Operativo' },
  subtitle: { type: String, default: 'Evolución mensual (%IBEO)' },
  data: { type: Array, required: true },
  thresholdConfig: {
    type: Object,
    default: () => ({ optimal: 90, warning: 70 })
  }
});

const isMounted = ref(false);

// --- ESTADO Y LÓGICA DEL TOOLTIP ---
const chartContainer = ref(null);
const tooltipVisible = ref(false);
const tooltipData = ref(null);

const tooltipStyle = ref({ 
  left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  if (!chartContainer.value) return;
  const rect = chartContainer.value.getBoundingClientRect();

  // Obtenemos la posición inicial del mouse relativa al contenedor
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top; 

  let transformX = '-50%';
  let transformY = '-100%';
  const offset = 15; // Distancia del cursor al tooltip

  // --- CONTROL BORDES HORIZONTALES ---
  if (x > rect.width - 120) {
    // Si está muy a la derecha, anclar el borde derecho del tooltip y moverlo a la izquierda
    transformX = '-100%';
    x -= offset;
  } else if (x < 100) {
    // Si está muy a la izquierda (Eje Y), anclar el borde izquierdo del tooltip y moverlo a la derecha
    transformX = '0%';
    x += offset; 
  }

  // --- CONTROL BORDES VERTICALES ---
  if (y < 80) {
    // Si está muy cerca del techo, anclar por arriba para que el tooltip baje
    transformY = '0%';
    y += offset;
  } else {
    // Comportamiento normal: el tooltip sube
    transformY = '-100%';
    y -= offset;
  }

  tooltipStyle.value = {
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate(${transformX}, ${transformY})`,
    whiteSpace: 'nowrap'
  };
};

const onMouseEnter = (event, item) => {
  tooltipData.value = item;
  tooltipVisible.value = true;
  updateTooltipPosition(event);
};

const onMouseMove = (event) => {
  if (tooltipVisible.value) updateTooltipPosition(event);
};

const onMouseLeave = () => {
  tooltipVisible.value = false;
  tooltipData.value = null;
};

// --- LÓGICA RESPONSIVE (ResizeObserver) ---
const containerWidth = ref(400);
let resizeObserver = null;

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });

  if (chartContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) containerWidth.value = entries[0].contentRect.width;
    });
    resizeObserver.observe(chartContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

// --- CONFIGURACIÓN GEOMÉTRICA ---
const svgHeight = 220; 
// Nueva configuración
const margins = { top: 20, right: 20, bottom: 40, left: 45 };
const minSpacePerPoint = 60; // Espacio mínimo entre meses
const ticksCount = 4; // Mostrará 100%, 50%, 0%
const maxValue = 100;
const chartHeight = svgHeight - margins.top - margins.bottom; 

// --- DIMENSIONES BASE DINÁMICAS ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerPoint);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const hoverZoneWidth = computed(() => chartWidth.value / (props.data.length || 1));

// --- LÓGICA DE COLORES SEMÁNTICOS ---
const getThresholdTextColor = (value) => {
  if (value >= props.thresholdConfig.optimal) return 'text-emerald-500';
  if (value >= props.thresholdConfig.warning) return 'text-amber-500';
  return 'text-rose-500';
};

const getThresholdFillColor = (value) => {
  if (value >= props.thresholdConfig.optimal) return 'fill-emerald-400';
  if (value >= props.thresholdConfig.warning) return 'fill-orange-400';
  return 'fill-red-400';
};

// --- LÓGICA DE DATOS Y COORDENADAS ---
const computedYTicks = computed(() => {
  return Array.from({ length: ticksCount + 1 }, (_, i) => ({
    value: (maxValue / ticksCount) * (ticksCount - i),
    y: margins.top + (chartHeight / ticksCount) * i
  }));
});

const processedData = computed(() => {
  const step = props.data.length > 1 ? chartWidth.value / (props.data.length - 1) : 0;
  
  return props.data.map((item, index) => {
    const heightRatio = item.value / maxValue; 
    const yStatic = margins.top + chartHeight; 
    const yAnimated = margins.top + chartHeight - (heightRatio * chartHeight); 
    
    return {
      ...item,
      x: margins.left + (index * step),
      yStatic,
      yAnimated,
      colorClass: getThresholdFillColor(item.value)
    };
  });
});

// --- LÓGICA PARA LÍNEA SUAVE (BÉZIER) ---
const linePath = computed(() => {
  const pts = processedData.value;
  if (!pts || pts.length === 0) return '';
  
  let d = `M ${pts[0].x},${isMounted.value ? pts[0].yAnimated : pts[0].yStatic}`;
  
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    
    const yCurr = isMounted.value ? curr.yAnimated : curr.yStatic;
    const yNext = isMounted.value ? next.yAnimated : next.yStatic;
    
    // Puntos de control en el eje X para crear una curva natural
    const cpX = (curr.x + next.x) / 2;
    
    d += ` C ${cpX},${yCurr} ${cpX},${yNext} ${next.x},${yNext}`;
  }
  return d;
});

// --- LÓGICA PARA EL ÁREA DE DEGRADADO ---
const areaPath = computed(() => {
  const pts = processedData.value;
  if (!pts || pts.length === 0) return '';
  
  const bottomY = margins.top + chartHeight;
  let d = linePath.value;
  
  // Se cierra la curva hacia la base del gráfico
  d += ` L ${pts[pts.length - 1].x},${bottomY} L ${pts[0].x},${bottomY} Z`;
  
  return d;
});

const latestValue = computed(() => {
  if (!props.data || props.data.length === 0) return null;
  return props.data[props.data.length - 1];
});
</script>