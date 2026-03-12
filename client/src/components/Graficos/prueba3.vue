<template>
  <div class="relative w-full rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Data Overview</h2>
      <select class="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <option>March</option>
        <option>April</option>
        <option>May</option>
      </select>
    </div>

    <div 
      ref="chartContainer" 
      class="relative flex items-center justify-start w-full overflow-visible" 
      role="region" 
      aria-label="Gráfico de líneas de resumen de datos"
    >
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="chart-title"
        @mouseleave="onMouseLeave"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" class="[stop-color:var(--color-indigo-500)] dark:[stop-color:var(--color-indigo-400)]" stop-opacity="0.2" />
            <stop offset="100%" class="[stop-color:var(--color-indigo-500)] dark:[stop-color:var(--color-indigo-400)]" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="y-axis" aria-hidden="true">
          <template v-for="(label, index) in yAxisLabels" :key="'y-' + index">
            <line
              :x1="margins.left"
              :y1="label.y"
              :x2="svgWidth - margins.right"
              :y2="label.y"
              class="stroke-slate-200 stroke-2 dark:stroke-slate-700/50 transition-all duration-300"
              stroke-dasharray="6"
            />
            <text
              :x="margins.left - 15"
              :y="label.y + 4"
              text-anchor="end"
              class="fill-slate-400 text-[11px] font-medium dark:fill-slate-500 transition-colors duration-300"
            >
              {{ label.text }}
            </text>
          </template>
        </g>

        <g class="x-axis" aria-hidden="true">
          <text
            v-for="(point, index) in points"
            :key="'x-' + index"
            :x="point.x"
            :y="svgHeight - margins.bottom + 25"
            text-anchor="middle"
            class="fill-slate-400 text-[11px] font-medium dark:fill-slate-500 transition-all duration-300"
          >
            {{ point.label }}
          </text>
        </g>

        <g :class="['transition-opacity duration-1000 ease-out', isMounted ? 'opacity-100' : 'opacity-0']">
          <path
            :d="areaPath"
            fill="url(#areaGradient)"
            class="transition-all duration-300"
          />
          <path
            :d="linePath"
            fill="none"
            class="stroke-indigo-500 stroke-[3px] transition-all duration-300 dark:stroke-indigo-400"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>

        <g 
          v-for="(point, index) in points" 
          :key="`point-${index}`"
          role="graphics-symbol"
          :aria-label="`Período ${point.label}, valor: ${point.value.toLocaleString()}`"
        >
          <line
            v-if="hoveredIndex === index"
            :x1="point.x"
            :y1="point.y"
            :x2="point.x"
            :y2="svgHeight - margins.bottom"
            class="stroke-slate-400 stroke-[1.5px] dark:stroke-slate-500"
            stroke-dasharray="4"
          />
          
          <circle
            :cx="point.x"
            :cy="point.y"
            r="20"
            fill="transparent"
            class="cursor-pointer outline-none"
            @mouseenter="onMouseEnter($event, index, point)"
            @mousemove="onMouseMove($event)"
            @focus="onMouseEnter($event, index, point)"
            @blur="onMouseLeave"
            tabindex="0"
          />

          <circle
            v-if="hoveredIndex === index"
            :cx="point.x"
            :cy="point.y"
            r="5"
            class="fill-white stroke-indigo-500 stroke-[3px] dark:fill-slate-900 dark:stroke-indigo-400 transition-all duration-200"
            style="pointer-events: none;"
          />
        </g>
      </svg>
      
      <div
        v-if="tooltipVisible && tooltipData"
        class="absolute z-50 pointer-events-none transition-all duration-100 ease-out"
        :style="tooltipStyle"
      >
        <div class="relative z-10 flex flex-col items-center rounded-lg bg-slate-800 px-3 py-1.5 shadow-lg dark:bg-slate-700">
          <span class="text-sm font-bold text-white">{{ tooltipData.value.toLocaleString() }}</span>
          <span class="text-[10px] text-slate-300">Total | {{ tooltipData.label }}</span>
          <div 
            class="absolute -bottom-1 h-2 w-2 rotate-45 bg-slate-800 dark:bg-slate-700 transition-all duration-100"
            :style="{ left: tooltipArrowLeft }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { label: 'Jan', value: 35000 },
      { label: 'Feb', value: 55000 },
      { label: 'Mar', value: 30000 },
      { label: 'Apr', value: 52000 },
      { label: 'May', value: 48000 },
      { label: 'Jun', value: 70685 },
      { label: 'Jul', value: 58000 },
      { label: 'Aug', value: 58000 },
      { label: 'Sep', value: 82000 },
      { label: 'Oct', value: 65000 },
      { label: 'Nov', value: 48000 }
    ]
  }
});

const isMounted = ref(false);

// --- ESTADO Y LÓGICA DEL TOOLTIP ---
const chartContainer = ref(null);
const tooltipVisible = ref(false);
const tooltipData = ref(null);
const hoveredIndex = ref(null);

const tooltipStyle = ref({ 
  left: '0px', 
  top: '0px', 
  transform: 'translate(-50%, -100%)',
  whiteSpace: 'nowrap'
});
const tooltipArrowLeft = ref('50%');

const updateTooltipPosition = (event) => {
  if (!chartContainer.value) return;
  const rect = chartContainer.value.getBoundingClientRect();
  
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top - 20; 
  
  let transformX = '-50%'; 
  tooltipArrowLeft.value = 'calc(50% - 4px)'; 
  
  if (x > rect.width - 80) {
    transformX = '-100%'; 
    x += 15;
    tooltipArrowLeft.value = 'calc(80% - 4px)'; 
  } else if (x < 80) {
    transformX = '0%';    
    x -= 15;
    tooltipArrowLeft.value = 'calc(20% - 4px)'; 
  }

  tooltipStyle.value = {
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate(${transformX}, -100%)`,
    whiteSpace: 'nowrap'
  };
};

const onMouseEnter = (event, index, item) => {
  hoveredIndex.value = index;
  tooltipData.value = item;
  tooltipVisible.value = true;
  updateTooltipPosition(event);
};

const onMouseMove = (event) => {
  if (tooltipVisible.value) {
    updateTooltipPosition(event);
  }
};

const onMouseLeave = () => {
  hoveredIndex.value = null;
  tooltipVisible.value = false;
  tooltipData.value = null;
};

// --- LÓGICA RESPONSIVE CON RESIZEOBSERVER ---
const containerWidth = ref(800);
let resizeObserver = null;

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 100);
  });

  if (chartContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerWidth.value = entries[0].contentRect.width;
      }
    });
    resizeObserver.observe(chartContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

// --- CONFIGURACIÓN ESTÁTICA ---
const svgHeight = 300; 
const margins = { top: 40, right: 30, bottom: 40, left: 50 }; 
const minSpacePerPoint = 50;

// --- DIMENSIONES BASE DINÁMICAS ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerPoint);
  return Math.max(containerWidth.value, minRequiredWidth, 600);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const chartHeight = computed(() => svgHeight - margins.top - margins.bottom);

// --- CÁLCULOS DEL GRÁFICO DE LÍNEAS ---
// Redondeamos al múltimo de 10k o 25k dependiendo de tu preferencia, aquí lo dejé dinámico según el max
const maxValue = computed(() => {
  if (!props.data.length) return 100;
  const max = Math.max(...props.data.map(d => d.value));
  // Dinámico para no atarlo a grandes sumas de dinero, redondea al 10% más alto
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const step = magnitude >= 10 ? magnitude / 2 : 10;
  return Math.ceil(max / step) * step || 100;
});

const points = computed(() => {
  if (props.data.length === 0) return [];
  return props.data.map((d, index) => {
    const x = margins.left + (index / (props.data.length - 1)) * chartWidth.value;
    const y = margins.top + chartHeight.value - (d.value / maxValue.value) * chartHeight.value;
    return { ...d, x, y };
  });
});

const linePath = computed(() => {
  if (points.value.length === 0) return '';
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
});

const areaPath = computed(() => {
  if (points.value.length === 0) return '';
  const firstP = points.value[0];
  const lastP = points.value[points.value.length - 1];
  const baseY = margins.top + chartHeight.value;
  return `${linePath.value} L ${lastP.x} ${baseY} L ${firstP.x} ${baseY} Z`;
});

const yAxisLabels = computed(() => {
  const labels = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const value = (maxValue.value / steps) * i;
    labels.push({
      // Formateo simple: añade 'k' si es mayor a 1000 para ahorrar espacio, sin signo de dólar
      text: value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value),
      y: margins.top + chartHeight.value - (value / maxValue.value) * chartHeight.value
    });
  }
  return labels;
});
</script>