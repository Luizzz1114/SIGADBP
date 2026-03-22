<template>
  <div class="w-full mx-auto">
    <div ref="chartWrapper" class="relative flex items-center justify-start w-full overflow-x-auto" role="region" aria-label="Gráfico de área mensual">
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          <clipPath id="chart-reveal-clip">
            <rect 
              x="0" 
              y="0" 
              :width="isMounted ? svgWidth : 0" 
              :height="svgHeight" 
              class="transition-all duration-1000 ease-out" 
            />
          </clipPath>

          <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" class="stroke-blue-400" stroke-width="1.5" stroke-opacity="0.15" />
          </pattern>

          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" class="stop-color-blue-400" stop-opacity="0.25" stop-color="#60a5fa" />
            <stop offset="100%" class="stop-color-blue-400" stop-opacity="0.05" stop-color="#60a5fa" />
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
              class="fill-slate-400 dark:fill-slate-500 text-[13px] transition-colors duration-300"
            >
              {{ tick.value }}%
            </text>
          </template>
        </g>

        <g clip-path="url(#chart-reveal-clip)">
          <path 
            :d="areaPath" 
            fill="url(#areaGradient)" 
            class="transition-all duration-300"
          />
          <path 
            :d="areaPath" 
            fill="url(#diagonalHatch)" 
            class="transition-all duration-300"
          />

          <path 
            :d="linePath" 
            fill="none" 
            class="stroke-blue-400 dark:stroke-blue-400" 
            stroke-width="3" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <line
            v-if="processedData.length"
            :x1="processedData[processedData.length - 1].x"
            :y1="processedData[processedData.length - 1].y"
            :x2="processedData[processedData.length - 1].x"
            :y2="margins.top + chartHeight"
            class="stroke-blue-300 dark:stroke-blue-400"
            stroke-width="1.5"
            stroke-dasharray="4 4"
          />
        </g>

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
            :x="item.x - (spacePerBar / 2)" 
            :y="margins.top" 
            :width="spacePerBar" 
            :height="chartHeight" 
            fill="transparent"
          />

          <line
            :x1="item.x"
            :y1="margins.top"
            :x2="item.x"
            :y2="margins.top + chartHeight"
            class="stroke-slate-300 dark:stroke-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            stroke-width="1"
            stroke-dasharray="3 3"
          />

          <circle 
            :cx="item.x" 
            :cy="item.y" 
            r="4" 
            class="fill-blue-400 group-hover:r-[6px] transition-all duration-200"
            clip-path="url(#chart-reveal-clip)"
          />

          <text
            :x="item.x"
            :y="margins.top + chartHeight + 25"
            text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300 group-hover:fill-blue-500 dark:group-hover:fill-blue-400!"
            :class="{ 'font-semibold fill-slate-700 dark:fill-slate-200!': index === processedData.length - 1 }"
            aria-hidden="true"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>
    </div>

    <Teleport to="body">
      <div 
        v-if="tooltipData"
        v-show="tooltipVisible"
        class="fixed z-9999 pointer-events-none overflow-hidden rounded-lg shadow-xs border border-slate-200 bg-white dark:bg-slate-850 dark:border-slate-700 transition-all duration-100 ease-out"
        :style="tooltipStyle"
      >
        <div class="px-2 pt-2 pb-1.5 border-b border-slate-200 bg-slate-100 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800 font-medium mb-1">
          {{ tooltipData.label }}
        </div>
        <div class="px-2 pb-2 pt-1.5 flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-400"></div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
              {{ unit }}: {{ tooltipData.value }}%
            </span>
          </div>
          <div v-if="tooltipData.detalles && details === 'bienes'" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{{ tooltipData.detalles.cantidad }} bienes operativos de {{ tooltipData.detalles.total }} en inventario</span>
          </div>
          <div v-if="tooltipData.detalles && details === 'mantenimiento_operatividad'" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{{ tooltipData.detalles.cantidad }} bienes en estado óptimo de {{ tooltipData.detalles.total }} mantenimientos realizados</span>
          </div>
          <div v-if="tooltipData.detalles && details === 'personal'" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{{ tooltipData.detalles.cantidad }} de {{ tooltipData.detalles.total }} miembros del personal</span>
          </div>
          <div v-if="tooltipData.detalles && details === 'd_deterioro'" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{{ tooltipData.detalles.cantidad }} desincorporaciones por deterioro de {{ tooltipData.detalles.total }} totales</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: { type: Array, required: true },
  unit: { type: String, default: 'Valor'},
  details: { type: String, default: '' }
});

const isMounted = ref(false);
const chartWrapper = ref(null);
const containerWidth = ref(400);

// --- ESTADO Y LÓGICA DEL TOOLTIP ---
const tooltipVisible = ref(false);
const tooltipData = ref(null);
const tooltipStyle = ref({ 
  left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  let x = event.clientX;
  let y = event.clientY; 
  const offset = 15; 

  let transformX = '-50%';
  let transformY = '-100%';

  if (x > window.innerWidth - 180) {
    transformX = '-100%';
    x -= offset;
  } else if (x < 150) {
    transformX = '0%';
    x += offset; 
  }

  if (y < 100) {
    transformY = '0%';
    y += offset;
  } else {
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
};

// --- LÓGICA RESPONSIVE ---
let resizeObserver = null;
onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });

  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerWidth.value = entries[0].contentRect.width - 2; 
      }
    });
    resizeObserver.observe(chartWrapper.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

// --- CONFIGURACIÓN BASE ---
const svgHeight = 250; 
const margins = { top: 20, right: 20, bottom: 40, left: 45 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 
const minSpacePerBar = 90; 

// --- CÁLCULO DE LÍMITE DINÁMICO ---
const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return 100;
  const maxInData = Math.max(...props.data.map(item => item.value));
  if (maxInData <= 0) return 100;
  const targetMax = maxInData > 100 ? maxInData * 1.15 : 100;
  return Math.ceil(targetMax / ticksCount) * ticksCount;
});

// --- DIMENSIONES Y CÁLCULOS ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerBar);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / (props.data.length || 1));

// --- LÓGICA DEL EJE Y ---
const computedYTicks = computed(() => {
  const max = maxValue.value;
  return Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = (max / ticksCount) * (ticksCount - i);
    return {
      value: Math.round(val),
      y: margins.top + (chartHeight / ticksCount) * i
    };
  });
});

// --- PROCESAMIENTO DE PUNTOS ---
const processedData = computed(() => {
  return props.data.map((item, index) => {
    const heightRatio = item.value / maxValue.value; 
    const yPos = margins.top + chartHeight - (heightRatio * chartHeight);
    
    return {
      ...item,
      x: margins.left + (index * spacePerBar.value) + (spacePerBar.value / 2),
      y: yPos
    };
  });
});

// --- GENERACIÓN DE PATHS (Línea y Área) ---
const linePath = computed(() => {
  if (processedData.value.length === 0) return '';
  const pts = processedData.value;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  return d;
});

const areaPath = computed(() => {
  if (processedData.value.length === 0) return '';
  const pts = processedData.value;
  let d = `M ${pts[0].x} ${margins.top + chartHeight}`;
  for (let i = 0; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${margins.top + chartHeight} Z`;
  return d;
});
</script>