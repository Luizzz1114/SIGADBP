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
              :style="{ 
                transitionProperty: 'width', 
                transitionDuration: isResizing ? '0ms' : '1000ms', 
                transitionTimingFunction: 'ease-out' 
              }" 
            />
          </clipPath>

          <pattern id="diagonalHatch" width="12" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" class="stroke-blue-400" stroke-width="1.5" stroke-opacity="0.15" />
          </pattern>

          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.00" />
          </linearGradient>
        </defs>

        <!-- Eje Y -->
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

        <!-- Área y Líneas -->
        <g clip-path="url(#chart-reveal-clip)">
          <path :d="areaPath" fill="url(#areaGradient)" />
          <path :d="areaPath" fill="url(#diagonalHatch)" />

          <path 
            :d="linePath" 
            fill="none" 
            class="stroke-blue-400 dark:stroke-blue-400" 
            stroke-width="3" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Línea vertical del último dato -->
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

        <!-- Interacción y Puntos -->
        <g 
          v-for="(item, index) in processedData" 
          :key="index"
          class="group cursor-pointer outline-none chart-bar-group"
          role="graphics-symbol"
          @mouseenter="onMouseEnter($event, item)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
          @touchstart.passive="onTouchStart($event, item)"
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
            r="3.5" 
            class="fill-blue-400 transition-all duration-200"
            clip-path="url(#chart-reveal-clip)"
          />

          <text
            :x="item.x"
            :y="margins.top + chartHeight + 25"
            text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300 group-hover:fill-slate-700 dark:group-hover:fill-slate-200!"
            :class="{ 'font-semibold fill-slate-700 dark:fill-slate-200!': index === processedData.length - 1 }"
            aria-hidden="true"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Tooltip Original -->
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
          <!-- Detalles dinámicos (se mantienen tus condiciones exactas) -->
          <div v-if="tooltipData.detalles" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span v-if="details === 'bienes'">{{ tooltipData.detalles.cantidad }} bienes operativos de {{ tooltipData.detalles.total }} en inventario</span>
            <span v-else-if="details === 'mantenimiento_operatividad'">{{ tooltipData.detalles.cantidad }} bienes en estado óptimo de {{ tooltipData.detalles.total }} mantenimientos realizados</span>
            <span v-else-if="details === 'personal'">{{ tooltipData.detalles.cantidad }} de {{ tooltipData.detalles.total }} miembros del personal</span>
            <span v-else-if="details === 'd_deterioro'">{{ tooltipData.detalles.cantidad }} desincorporaciones por deterioro de {{ tooltipData.detalles.total }} totales</span>
            <span v-else-if="details === 'd_tasa'">{{ tooltipData.detalles.cantidad }} bienes desincorporados de {{ tooltipData.detalles.total }} en inventario</span>
            <span v-else-if="details === 'b_sin_numero'">{{ tooltipData.detalles.cantidad }} bien(es) de {{ tooltipData.detalles.total }} en inventario</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  data: { type: Array, required: true },
  unit: { type: String, default: 'Valor'},
  details: { type: String, default: '' }
});

const isMounted = ref(false);
const isResizing = ref(false);
const chartWrapper = ref(null);
const containerWidth = ref(400);

// --- TOOLTIP LOGIC ---
const tooltipVisible = ref(false);
const tooltipData = ref(null);
const tooltipStyle = ref({ 
  left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  let x, y;
  let isTouch = false;

  if (event.touches && event.touches.length > 0) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
    isTouch = true;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  const offset = isTouch ? 35 : 15; 
  let transformX = '-50%';
  let transformY = '-100%';

  if (x > window.innerWidth - 180) { transformX = '-100%'; x -= offset; }
  else if (x < 150) { transformX = '0%'; x += offset; }

  if (y < 100) { transformY = '0%'; y += offset; }
  else { transformY = '-100%'; y -= offset; }

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

const onMouseLeave = () => { tooltipVisible.value = false; };

const onTouchStart = (event, item) => {
  tooltipData.value = item;
  tooltipVisible.value = true;
  updateTooltipPosition(event);
};

const handleOutsideInteraction = (event) => {
  if (tooltipVisible.value && !event.target.closest('.chart-bar-group')) {
    tooltipVisible.value = false;
  }
};

// --- RESPONSIVE LOGIC ---
let resizeTimeout = null;
let resizeObserver = null;

onMounted(() => {
  nextTick(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });

  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        isResizing.value = true;
        containerWidth.value = entries[0].contentRect.width;
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => { isResizing.value = false; }, 100);
      }
    });
    resizeObserver.observe(chartWrapper.value);
  }

  document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  document.removeEventListener('touchstart', handleOutsideInteraction);
});

// --- CÁLCULOS BASE ---
const svgHeight = 250; 
const margins = { top: 20, right: 20, bottom: 40, left: 45 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 
const minSpacePerBar = 90; 

const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return 100;
  const maxInData = Math.max(...props.data.map(item => Number(item.value) || 0));
  if (maxInData <= 0) return 100;
  const dynamicMax = maxInData * 1.2;
  const roundedMax = Math.ceil(dynamicMax / ticksCount) * ticksCount;
  return Math.min(roundedMax, 100);
});

const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerBar);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / (props.data.length || 1));

const computedYTicks = computed(() => {
  const max = maxValue.value;
  return Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = (max / ticksCount) * (ticksCount - i);
    return {
      value: Number.isInteger(val) ? val : Number(val.toFixed(1)),
      y: margins.top + (chartHeight / ticksCount) * i
    };
  });
});

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

const linePath = computed(() => {
  if (processedData.value.length === 0) return '';
  const pts = processedData.value;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { d += ` L ${pts[i].x} ${pts[i].y}`; }
  return d;
});

const areaPath = computed(() => {
  if (processedData.value.length === 0) return '';
  const pts = processedData.value;
  const baseY = margins.top + chartHeight;
  let d = `M ${pts[0].x} ${baseY}`;
  for (let i = 0; i < pts.length; i++) { d += ` L ${pts[i].x} ${pts[i].y}`; }
  d += ` L ${pts[pts.length - 1].x} ${baseY} Z`;
  return d;
});
</script>