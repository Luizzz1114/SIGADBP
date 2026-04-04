<template>
  <div class="w-full mx-auto">
    <div ref="chartWrapper" class="relative flex items-center justify-start w-full overflow-x-auto" role="region" aria-label="Gráfico de barras mensual">
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          <clipPath id="bars-base-clip">
            <rect x="0" y="0" width="100%" :height="margins.top + chartHeight" />
          </clipPath>
          
          <pattern id="stripes_bar" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="2" height="8" class="fill-slate-200/60 dark:fill-slate-700/30" />
          </pattern>
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
              <!-- Solo añade % si el prop está activo -->
              {{ tick.value }}{{ isPercentage ? '%' : '' }}
            </text>
          </template>
        </g>

        <!-- Grupos de Barras -->
        <g 
          v-for="(item, index) in processedData" 
          :key="index"
          class="group cursor-pointer outline-none chart-bar-group"
          role="graphics-symbol"
          :aria-label="`Mes de ${item.label}, valor: ${item.value}`"
          @mouseenter="onMouseEnter($event, item)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
          @touchstart.passive="onTouchStart($event, item)"
        >
          <!-- Área de hover -->
          <rect 
            :x="item.x - (spacePerBar / 2)" 
            :y="margins.top" 
            :width="spacePerBar" 
            :height="chartHeight" 
            fill="transparent"
            class="transition-colors duration-200 group-hover:fill-slate-200/30 dark:group-hover:fill-slate-800/50"
          />

          <!-- Fondo gris de la barra -->
          <rect
            :x="item.x - (barWidth / 2)"
            :y="margins.top"
            :width="barWidth"
            :height="chartHeight"
            rx="10"
            class="fill-slate-100/50 dark:fill-slate-800/50"
          />
          
          <!-- Patrón de rayas -->
          <rect
            :x="item.x - (barWidth / 2)"
            :y="margins.top"
            :width="barWidth"
            :height="chartHeight"
            rx="10"
            fill="url(#stripes_bar)"
          />

          <!-- Barra de valor (Animada) -->
          <rect
            :x="item.x - (barWidth / 2)"
            :y="isMounted ? item.yAnimated : item.yStatic"
            :width="barWidth"
            :height="isMounted ? item.height + 15 : 15"
            rx="10"
            clip-path="url(#bars-base-clip)"
            :class="item.color || 'fill-blue-400 dark:fill-blue-400'" 
            :style="{ 
              transitionProperty: 'height, y', 
              transitionDuration: isResizing ? '0ms' : '700ms', 
              transitionTimingFunction: 'ease-out',
              transitionDelay: isResizing ? '0ms' : `${index * 40}ms`, 
            }"
          />

          <!-- Label del eje X -->
          <text
            :x="item.x"
            :y="item.yStatic + 25"
            text-anchor="middle"
            :class="[
              'fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300',
              item.hoverTextColor || 'group-hover:fill-slate-700 dark:group-hover:fill-slate-200',
              index === processedData.length - 1 && historical ? 'font-semibold fill-slate-700 dark:fill-slate-200!' : ''
            ]"
            aria-hidden="true"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Tooltip -->
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
        <div class="px-2 pb-2 pt-1.5 flex flex-col">
          <div class="flex items-center justify-between gap-4 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <div :class="tooltipData.color || 'bg-blue-400'" class="w-2.5 h-2.5 rounded-full shrink-0"></div>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
                {{ type }}:
              </span>
            </div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
              {{ tooltipData.value }} {{ unit }}
            </span>
          </div>
          
          <div v-if="tooltipData.detalles && detailsFormatter" class="pl-4.5 flex flex-col">
            <div 
              v-for="(item, idx) in detailsFormatter(tooltipData.detalles)" 
              :key="idx" 
              class="flex items-center justify-between gap-4 text-xs whitespace-nowrap"
            >
              <span class="text-slate-500 dark:text-slate-400">{{ item.label }}:</span>
              <span class="font-medium text-slate-700 dark:text-slate-300">{{ item.value }}</span>
            </div>
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
  historical: { type: Boolean, default: false },
  type: { type: String, default: 'Valor'},
  unit: { type: String, default: ''},
  detailsFormatter: { type: Function, default: null },
  isPercentage: { type: Boolean, default: false }
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
  if (x === undefined || y === undefined) return;
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
    transform: `translate(${transformX}, ${transformY})`
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

// --- CONFIGURACIÓN BASE (RESTAURADA) ---
const svgHeight = 250; 
const margins = { top: 20, right: 20, bottom: 40, left: 40 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 

// --- CÁLCULOS ---
const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return ticksCount;
  const maxInData = Math.max(...props.data.map(item => Number(item.value) || 0));
  if (maxInData <= 0) return props.isPercentage ? 100 : ticksCount;
  
  if (props.isPercentage) {
    const baseMax = Math.max(100, maxInData);
    return Math.ceil(baseMax / ticksCount) * ticksCount;
  }
  
  const targetMax = maxInData * 1.15;
  return Math.ceil(targetMax / ticksCount) * ticksCount;
});

const minSpacePerBar = computed(() => containerWidth.value < 600 ? 70 : 90);
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerBar.value);
  return Math.max(containerWidth.value, minRequiredWidth);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / (props.data.length || 1));

const barWidth = computed(() => Math.min(spacePerBar.value * 0.50, 32));

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

const processedData = computed(() => {
  return props.data.map((item, index) => {
    const heightRatio = item.value / maxValue.value; 
    const height = heightRatio * chartHeight;
    const yStatic = margins.top + chartHeight; 
    return {
      ...item,
      x: margins.left + (index * spacePerBar.value) + (spacePerBar.value / 2),
      height: height,
      yStatic: yStatic,
      yAnimated: yStatic - height
    };
  });
});
</script>