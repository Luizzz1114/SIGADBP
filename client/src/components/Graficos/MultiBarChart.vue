<template>
  <div class="w-full mx-auto">
    <div 
      ref="chartWrapper" 
      class="relative flex items-center justify-start w-full overflow-x-auto" 
      role="region" 
      aria-label="Gráfico de barras múltiples"
    >
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
              {{ tick.value }}{{ isPercentage ? '%' : '' }}
            </text>
          </template>
        </g>

        <g 
          v-for="(group, groupIndex) in processedGroups" 
          :key="'group-' + groupIndex"
          class="group cursor-pointer outline-none"
          role="graphics-symbol"
          :aria-label="`Período ${group.label}`"
          @mouseenter="onMouseEnter($event, group)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
        >
          <rect 
            :x="group.x" 
            :y="margins.top" 
            :width="spacePerGroup" 
            :height="chartHeight" 
            fill="transparent"
            class="transition-colors duration-200 group-hover:fill-slate-200/30 dark:group-hover:fill-slate-800/50"
          />

          <template v-for="(bar, barIndex) in group.bars" :key="'bar-' + groupIndex + '-' + barIndex">
            <rect
              :x="bar.x"
              :y="isMounted ? bar.yAnimated : bar.yStatic"
              :width="barWidth"
              :height="isMounted ? bar.height + 15 : 15"
              rx="4"
              clip-path="url(#bars-base-clip)"
              :fill="bar.color"
              :style="{ 
                transitionProperty: 'height, y', 
                transitionDuration: '700ms', 
                transitionTimingFunction: 'ease-out',
                transitionDelay: `${groupIndex * 40 + barIndex * 20}ms`, 
                marginBottom: '12px',
              }"
            />
          </template>

          <text
            :x="group.x + (spacePerGroup / 2)"
            :y="margins.top + chartHeight + 25"
            text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] transition-colors duration-300 group-hover:fill-slate-800 dark:group-hover:fill-slate-200"
            :class="{ 'font-semibold fill-slate-700 dark:fill-slate-300': groupIndex === processedGroups.length - 1 }"
            aria-hidden="true"
          >
            {{ group.label }}
          </text>
        </g>
      </svg>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3">
      <div v-for="(dataset, i) in datasets" :key="i" class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full block" :style="{ backgroundColor: dataset.color }"></span>
        <span class="text-[13px] text-slate-600 dark:text-slate-300">{{ dataset.name }}</span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div 
      v-if="tooltipData"
      v-show="tooltipVisible"
      class="fixed z-9999 pointer-events-none overflow-hidden rounded-lg shadow-xs border border-slate-200 bg-white dark:bg-slate-850 dark:border-slate-700 transition-all duration-100 ease-out min-w-40"
      :style="tooltipStyle"
    >
      <div class="px-2 pt-2 pb-1.5 border-b border-slate-200 bg-slate-100 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800 font-medium mb-1">
        {{ tooltipData.label }}
      </div>
      <div class="flex flex-col gap-1.5 px-3 pb-2.5 pt-1.5">
        <div v-for="(bar, idx) in tooltipData.bars" :key="idx" class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <svg viewBox="0 0 10 10" class="size-2.5 rounded-full shrink-0">
              <rect width="10" height="10" :fill="bar.color" />
            </svg>
            <span class="text-[13px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {{ bar.name }}:
            </span>
          </div>
          <div>
            <span class="text-[13px] font-bold text-slate-800 dark:text-slate-100">
              {{ bar.value }}{{ isPercentage ? '%' : '' }}
            </span>
            <template v-if="bar.detalles">
              <span class="mx-1 text-slate-400">•</span>
              <span class="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {{ bar.detalles.cantidad }}$ / {{ bar.detalles.total }}$
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  labels: { 
    type: Array, 
    required: true 
  },
  datasets: { 
    type: Array, 
    required: true,
    // Formato esperado: [{ name: 'KPI 1', color: '#3b82f6', values: [10, 20, 30], detalles: [{cantidad, total}, null, {cantidad, total}] }]
  },
  isPercentage: {
    type: Boolean,
    default: true
  },
  forceMaxValue: {
    type: Number,
    default: null // Si pasas 100, el gráfico siempre irá de 0 a 100
  }
});

const isMounted = ref(false);
const chartWrapper = ref(null);
const containerWidth = ref(400);

// --- ESTADO DEL TOOLTIP ---
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

  if (x > window.innerWidth - 200) {
    transformX = '-100%';
    x -= offset;
  } else if (x < 150) {
    transformX = '0%';
    x += offset; 
  }

  if (y < 120) {
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
  };
};

const onMouseEnter = (event, group) => {
  tooltipData.value = group;
  tooltipVisible.value = true;
  updateTooltipPosition(event);
};

const onMouseMove = (event) => {
  if (tooltipVisible.value) updateTooltipPosition(event);
};

const onMouseLeave = () => {
  tooltipVisible.value = false;
};

// --- RESPONSIVE ---
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
const svgHeight = 280; 
const margins = { top: 20, right: 20, bottom: 40, left: 45 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 
const minSpacePerGroup = 80; 

// --- CÁLCULO DEL MÁXIMO ---
const computedMaxValue = computed(() => {
  if (props.forceMaxValue !== null) return props.forceMaxValue;
  
  let maxInData = 0;
  props.datasets.forEach(ds => {
    const dsMax = Math.max(...(ds.values || [0]));
    if (dsMax > maxInData) maxInData = dsMax;
  });

  if (maxInData <= 0) return ticksCount;
  
  const targetMax = maxInData * 1.15;
  return Math.ceil(targetMax / ticksCount) * ticksCount;
});

// --- DIMENSIONES ---
const svgWidth = computed(() => {
  const minRequiredWidth = margins.left + margins.right + (props.labels.length * minSpacePerGroup);
  return Math.max(containerWidth.value, minRequiredWidth, 400);
});

const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerGroup = computed(() => chartWidth.value / (props.labels.length || 1));

const numDatasets = computed(() => props.datasets.length);
const barGap = 4;
const maxBarWidth = 24; 

const barWidth = computed(() => {
  const availableSpaceForBars = spacePerGroup.value * 0.7;
  const rawWidth = (availableSpaceForBars - (barGap * (numDatasets.value - 1))) / numDatasets.value;
  return Math.max(Math.min(rawWidth, maxBarWidth), 4);
});

const totalBarsWidth = computed(() => (barWidth.value * numDatasets.value) + (barGap * (numDatasets.value - 1)));

// --- EJE Y ---
const computedYTicks = computed(() => {
  const max = computedMaxValue.value;
  return Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = (max / ticksCount) * (ticksCount - i);
    return {
      value: Math.round(val),
      y: margins.top + (chartHeight / ticksCount) * i
    };
  });
});

// --- LÓGICA DE AGRUPACIÓN Y BARRAS ---
const processedGroups = computed(() => {
  const maxVal = computedMaxValue.value;

  return props.labels.map((label, groupIndex) => {
    const groupX = margins.left + (groupIndex * spacePerGroup.value);
    const startX = groupX + (spacePerGroup.value / 2) - (totalBarsWidth.value / 2);

    const bars = props.datasets.map((ds, dsIndex) => {
      const value = ds.values[groupIndex] || 0;
      
      const detallesObj = (ds.detalles && ds.detalles[groupIndex]) ? ds.detalles[groupIndex] : null;

      const heightRatio = value / maxVal;
      const height = heightRatio * chartHeight;
      const yStatic = margins.top + chartHeight;

      return {
        name: ds.name,
        color: ds.color,
        value: value,
        detalles: detallesObj,
        x: startX + (dsIndex * (barWidth.value + barGap)),
        height: height,
        yStatic: yStatic,
        yAnimated: yStatic - height
      };
    });

    return {
      label,
      x: groupX,
      bars
    };
  });
});
</script>