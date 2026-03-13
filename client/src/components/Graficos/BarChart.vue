<template>
  <div class="w-full mx-auto">
    <div ref="chartContainer" class="relative flex items-center justify-start w-full" role="region" aria-label="Gráfico de barras">
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="chart-title chart-desc"
      >

        <g class="y-axis" aria-hidden="true">
          <template v-for="(tick, index) in computedYTicks" :key="'tick-' + index">
            <line 
              :x1="margins.left" 
              :y1="tick.y" 
              :x2="svgWidth - margins.right" 
              :y2="tick.y" 
              class="stroke-slate-300 dark:stroke-slate-700 transition-colors duration-300"
              stroke-dasharray="4 4"
              stroke-width="1"
            />
            <text 
              :x="margins.left - 12"
              :y="tick.y + 5" 
              text-anchor="end"
              class="fill-slate-400 dark:fill-slate-500 text-[13px] font-medium transition-colors duration-300"
            >
              {{ tick.value }}%
            </text>
          </template>
        </g>

        <g 
          v-for="(item, index) in processedData" 
          :key="index"
          :transform="`translate(${item.x}, 0)`"
          class="group cursor-pointer outline-none rounded"
          role="graphics-symbol"
          :aria-label="`Mes de ${item.label}, valor: ${item.value}`"
          @mouseenter="onMouseEnter($event, item)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
        >
          <rect
            :y="margins.top"
            :width="barWidth"
            :height="chartHeight"
            rx="4"
            class="fill-transparent group-hover:fill-slate-50 group-focus:fill-slate-50 dark:group-hover:fill-slate-800/40 dark:group-focus:fill-slate-800/40 transition-colors duration-300"
          />
          
          <rect
            :y="isMounted ? item.yAnimated : item.yStatic"
            :width="barWidth"
            :height="isMounted ? item.height : 0"
            rx="4"
            :style="{ transitionDelay: `${Math.min(index * 30, 600)}ms` }"
            :class="[
              item.color || 'fill-blue-500 dark:fill-blue-500', 
              'transition-all duration-700 ease-out hover:opacity-80 dark:hover:opacity-80 group-focus:opacity-80'
            ]"
          />

          <text
            :x="barWidth / 2"
            :y="item.yStatic + 25"
            text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] font-medium transition-all duration-300"
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
            <circle cx="5" cy="5" r="5" :class="tooltipData.color || 'fill-blue-500 dark:fill-blue-500'" />
          </svg>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-100">{{ tooltipData.total }} - {{ tooltipData.value }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: Array,
});

const isMounted = ref(false);

// --- ESTADO Y LÓGICA DEL TOOLTIP ---
const chartContainer = ref(null);
const tooltipVisible = ref(false);
const tooltipData = ref(null);

const tooltipStyle = ref({ 
  left: '0px', 
  top: '0px', 
  transform: 'translate(-50%, -100%)',
  whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  if (!chartContainer.value) return;
  const rect = chartContainer.value.getBoundingClientRect();

  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top; 

  let transformX = '-50%';
  let transformY = '-100%';

  if (x > rect.width - 120) {
    transformX = '-100%';
    x += 15;
  } else if (x < 120) {
    transformX = '0%';
    x -= 15;
  }

  if (y < 80) {
    transformY = '0%';
    y += 15;
  } else {
    transformY = '-100%';
    y -= 15;
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
  if (tooltipVisible.value) {
    updateTooltipPosition(event);
  }
};

const onMouseLeave = () => {
  tooltipVisible.value = false;
  tooltipData.value = null;
};

// --- LÓGICA RESPONSIVE CON RESIZEOBSERVER ---
const containerWidth = ref(400);
let resizeObserver = null;

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
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
const svgHeight = 250; 
const margins = { top: 40, right: 30, bottom: 40, left: 50 }; 
const spacePerColumn = 80; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 

// --- DIMENSIONES BASE DINÁMICAS ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * spacePerColumn);
  // Usa el ancho del contenedor, pero respeta un mínimo para el overflow
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / props.data.length);
const barWidth = computed(() => Math.min(spacePerBar.value * 0.65, 32));

// --- LÓGICA DEL EJE Y ---
const maxValue = 100;

const computedYTicks = computed(() => {
  return Array.from({ length: ticksCount + 1 }, (_, i) => ({
    value: (maxValue / ticksCount) * (ticksCount - i),
    y: margins.top + (chartHeight / ticksCount) * i
  }));
});

// --- LÓGICA DE LAS BARRAS ---
const processedData = computed(() => {
  const offset = (spacePerBar.value - barWidth.value) / 2;
  return props.data.map((item, index) => {
    const height = (item.value / maxValue) * chartHeight; 
    const yStatic = margins.top + chartHeight;
    return {
      ...item,
      x: margins.left + (index * spacePerBar.value) + offset,
      height: height,
      yStatic: yStatic,
      yAnimated: yStatic - height
    };
  });
});
</script>