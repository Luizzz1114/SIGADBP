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
              {{ tick.value }}
            </text>
          </template>
        </g>

        <g 
          v-for="(item, index) in processedData" 
          :key="index"
          class="group cursor-pointer outline-none"
          role="graphics-symbol"
          :aria-label="`Mes de ${item.label}, valor: ${item.value}`"
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
            class="transition-colors duration-200 group-hover:fill-slate-200/30 dark:group-hover:fill-slate-800/50"
          />

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
              transitionDuration: '700ms', 
              transitionTimingFunction: 'ease-out',
              transitionDelay: `${index * 40}ms`, 
              marginBottom: '12px',
            }"
          />

          <text
            :x="item.x"
            :y="item.yStatic + 25"
            text-anchor="middle"
            :class="[
              'fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300',
              item.hoverTextColor || 'group-hover:fill-blue-400 dark:group-hover:fill-blue-300',
              index === processedData.length - 1 && historical ? 'font-semibold fill-slate-700 dark:fill-slate-200!' : ''
            ]"
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
            <div :class="tooltipData.color || 'bg-blue-400'" class="w-2.5 h-2.5 rounded-full shrink-0"></div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
              {{ type }}: {{ tooltipData.value }} {{ unit }}
            </span>
          </div>
          <div v-if="tooltipData.detalles && details === 'dias_promedio'" class="pl-4.5 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{{ tooltipData.detalles.cantidad }} mantenimientos realizados</span>
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
  historical: { type: Boolean, default: false },
  type: { type: String, default: 'Valor'},
  unit: { type: String, default: ''},
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
const margins = { top: 20, right: 20, bottom: 40, left: 40 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 
const minSpacePerBar = 90; 

// --- CÁLCULO DE LÍMITE DINÁMICO ---
const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return ticksCount;
  const maxInData = Math.max(...props.data.map(item => item.value));
  if (maxInData <= 0) return ticksCount;
  
  const targetMax = maxInData * 1.15;
  return Math.ceil(targetMax / ticksCount) * ticksCount;
});

// --- DIMENSIONES Y CÁLCULOS ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.data.length * minSpacePerBar);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / (props.data.length || 1));
const barWidth = computed(() => Math.min(spacePerBar.value * 0.50, 32));

// --- LÓGICA DEL EJE Y (Enteros) ---
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

// --- LÓGICA DE LAS BARRAS ---
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