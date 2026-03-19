<template>
  <div class="w-full mx-auto" ref="chartWrapper">
    <div class="relative flex items-center justify-start w-full min-h-7" role="region" aria-label="Gráfico de tasa de aprobación">
      <svg 
        v-if="containerWidth > 0"
        :viewBox="`0 0 ${containerWidth} ${svgHeight}`"
        :width="containerWidth"
        :height="svgHeight"
        class="overflow-visible transition-all duration-1100 ease-out"
        :style="{ clipPath: isMounted ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }"
        role="img"
      >
        <defs>
          <pattern id="stripes" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" class="fill-slate-200 dark:fill-slate-800" /> 
            <line x1="0" y1="0" x2="0" y2="8" class="stroke-slate-300 dark:stroke-slate-700" stroke-width="3" /> 
          </pattern>
        </defs>

        <g 
          v-for="(item, index) in processedSegments" 
          :key="index"
          class="outline-none"
          role="graphics-symbol"
          :aria-label="`${item.label}: ${item.value} (${item.percentage}%)`"
        >
          <rect
            :x="item.x"
            :y="0"
            :width="item.width"
            :height="svgHeight"
            :rx="8"
            :fill="item.color"
          />
        </g>
      </svg>
    </div>

    <div 
      class="flex flex-wrap items-center justify-start gap-4 mt-4 transition-opacity duration-700 delay-300"
      :class="isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      aria-label="Leyenda del gráfico"
    >
      <div v-for="(item, index) in processedSegments" :key="'legend-' + index" class="flex items-center gap-3">
        <svg width="12" height="12" class="shrink-0">
          <rect width="12" height="12" rx="3" :fill="item.color" />
        </svg>
        <span class="text-sm text-slate-700 dark:text-slate-300">
          <span class="font-medium">{{ item.label }}</span>
          <span class="ml-1 text-slate-600 dark:text-slate-400">
            {{ item.value }} ({{ item.percentage }}%)
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: { 
    type: Array, 
    default: () => [
      { label: 'Operativos', value: 14, percentage: 87.5, color: '#34d399' }, 
      { label: 'En mantenimiento', value: 1, percentage: 6.25, color: '#60a5fa' },
      { label: 'No asignados', value: 1, percentage: 6.25, color: 'url(#stripes)' }
    ]
  }
});

// --- ESTADO GENERAL ---
const isMounted = ref(false);
const chartWrapper = ref(null);
const containerWidth = ref(0); 

const svgHeight = 28; 
const gapSizePx = 8; 

// --- LÓGICA RESPONSIVE Y ANIMACIÓN ---
let resizeObserver = null;

onMounted(() => {
  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerWidth.value = entries[0].contentRect.width;
      }
    });
    resizeObserver.observe(chartWrapper.value);
  }

  requestAnimationFrame(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

// --- CÁLCULOS MATEMÁTICOS PRECISOS ---
const processedSegments = computed(() => {
  if (!props.data || props.data.length === 0 || containerWidth.value <= 0) return [];

  const totalNetValue = props.data.reduce((sum, item) => sum + (item.value || 0), 0);
  const numGaps = props.data.length - 1;
  const totalGapsWidth = numGaps * gapSizePx;
  
  const availableWidthForBars = Math.max(0, containerWidth.value - totalGapsWidth);

  let currentX = 0;

  return props.data.map((item) => {
    let pct = item.percentage;
    if (pct === undefined) {
      pct = totalNetValue > 0 ? (item.value / totalNetValue) * 100 : 0;
    }

    const exactWidth = (pct / 100) * availableWidthForBars;
    
    const segment = {
      ...item,
      percentage: Number(pct.toFixed(2)),
      x: currentX,
      width: exactWidth
    };

    currentX += exactWidth + gapSizePx;
    
    return segment;
  });
});
</script>