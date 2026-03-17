<template>
  <div class="w-full mx-auto">
    <div 
      class="relative flex items-center justify-start w-full overflow-x-auto"
      ref="chartWrapper"
      :style="{ minWidth: `${svgWidth}px` }"
      role="region"
      aria-label="Gráfico de evolución mensual"
    >
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="none"
        role="img"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>

          <pattern id="diagonal-area-stripes" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.15" />
          </pattern>
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

        <path 
          :d="areaPath" 
          fill="url(#blueGradient)" 
          class="transition-all duration-700 ease-out"
        />
        <path 
          :d="areaPath" 
          fill="url(#diagonal-area-stripes)" 
          class="transition-all duration-700 ease-out"
        />

        <path 
          :d="linePath" 
          class="stroke-blue-400 dark:stroke-blue-400 transition-all duration-700 ease-out" 
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
            class="fill-blue-400 transition-all duration-700 ease-out group-hover:[r:5px] group-hover:fill-blue-500" 
          />

          <text
            :x="item.x"
            :y="item.yStatic + 25"
            :text-anchor="index === 0 ? 'start' : (index === processedData.length - 1 ? 'end' : 'middle')"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300 group-hover:fill-blue-400 dark:group-hover:fill-blue-300!"
            :class="{ 'font-semibold fill-slate-600 dark:fill-slate-300!': index === processedData.length - 1 }"
            aria-hidden="true"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>
    </div>
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
      <div class="flex items-center gap-2 px-2 pb-2 pt-1.5">
        <svg viewBox="0 0 10 10" class="w-2.5 h-2.5 rounded-full shrink-0">
          <circle cx="5" cy="5" r="5" :class="tooltipData.colorClass" />
        </svg>
        <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
          Operatividad: {{ tooltipData.value }}%
        </span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: { type: Array, required: true },
  ranges: {
    type: Object,
    default: () => ({ optimal: 90, warning: 70 })
  }
});

const isMounted = ref(false);

const chartWrapper = ref(null);
const tooltipVisible = ref(false);
const tooltipData = ref(null);

const tooltipStyle = ref({ 
  left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  // Ahora usamos clientX y clientY que son relativos a toda la pantalla del navegador
  let x = event.clientX;
  let y = event.clientY; 

  let transformX = '-50%';
  let transformY = '-100%';
  const offset = 15; 

  // Límites basados en la ventana completa
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

const containerWidth = ref(400);
let resizeObserver = null;

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });

  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Restamos 2px para evitar barras de scroll fantasma por decimales
        containerWidth.value = entries[0].contentRect.width - 2; 
      }
    });
    resizeObserver.observe(chartWrapper.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

const svgHeight = 250; 
// Márgenes restaurados a un valor limpio ya que controlamos el texto dinámicamente
const margins = { top: 20, right: 20, bottom: 40, left: 40 }; 
const minSpacePerPoint = 60; 
const ticksCount = 4; 
const maxValue = 100;
const chartHeight = svgHeight - margins.top - margins.bottom; 

const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerPoint);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const hoverZoneWidth = computed(() => chartWidth.value / (props.data.length || 1));

const getThresholdFillColor = (value) => {
  if (value >= props.ranges.optimal) return 'fill-emerald-400';
  if (value >= props.ranges.warning) return 'fill-orange-400';
  return 'fill-red-400';
};

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

const linePath = computed(() => {
  const pts = processedData.value;
  if (!pts || pts.length === 0) return '';
  
  let d = `M ${pts[0].x},${isMounted.value ? pts[0].yAnimated : pts[0].yStatic}`;
  
  for (let i = 1; i < pts.length; i++) {
    const pt = pts[i];
    const y = isMounted.value ? pt.yAnimated : pt.yStatic;
    d += ` L ${pt.x},${y}`;
  }
  
  return d;
});

const areaPath = computed(() => {
  const pts = processedData.value;
  if (!pts || pts.length === 0) return '';
  
  const bottomY = margins.top + chartHeight;
  let d = linePath.value;
  
  d += ` L ${pts[pts.length - 1].x},${bottomY} L ${pts[0].x},${bottomY} Z`;
  
  return d;
});
</script>