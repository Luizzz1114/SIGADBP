<template>
  <div class="w-full mx-auto">
    
    <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-12 gap-y-4" role="region" aria-label="Gráfico de distribución">
      
      <div ref="chartWrapper" class="relative size-45 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          class="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <defs>
            <pattern id="stripes_donut" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" class="fill-slate-200 dark:fill-slate-700" /> 
              <line x1="0" y1="0" x2="0" y2="8" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="3" /> 
            </pattern>
          </defs>

          <g aria-hidden="true">
            <!-- Fondo del donut -->
            <path
              :d="`M 100, ${100 - radius} A ${radius},${radius} 0 0,1 100,${100 + radius} A ${radius},${radius} 0 0,1 100,${100 - radius}`"
              fill="none"
              class="stroke-slate-100 dark:stroke-slate-800"
              :stroke-width="strokeWidth"
            />
            
            <!-- Estado vacío con patrón original -->
            <circle
              v-if="isEmpty"
              cx="100"
              cy="100"
              :r="radius"
              fill="none"
              stroke="url(#stripes_donut)"
              :stroke-width="strokeWidth"
              class="opacity-60 transition-opacity duration-300"
            />

            <!-- Segmentos -->
            <path
              v-else
              v-for="(item, index) in processedData"
              :key="'slice-' + index"
              :d="`M 100, ${100 - radius} A ${radius},${radius} 0 0,1 100,${100 + radius} A ${radius},${radius} 0 0,1 100,${100 - radius}`"
              fill="none"
              :stroke="item.color"
              :stroke-width="strokeWidth"
              :stroke-dasharray="isMounted ? `${item.sliceLength} ${circumference}` : `0 ${circumference}`"
              :stroke-dashoffset="item.dashOffset"
              class="transition-all duration-1000 ease-out cursor-pointer hover:opacity-80 focus:outline-none chart-bar-group"
              role="graphics-symbol"
              :aria-label="`${item.label}: ${item.value}`"
              @mouseenter="onMouseEnter($event, item)"
              @mousemove="onMouseMove($event)"
              @mouseleave="onMouseLeave"
              @touchstart.passive="onTouchStart($event, item)"
            />
          </g>
        </svg>

        <!-- Agujero central -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="size-24 bg-white dark:bg-slate-850 rounded-full"></div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="flex flex-col md:w-auto gap-3 transition-opacity duration-1000" :class="isMounted ? 'opacity-100' : 'opacity-0'">
        
        <div v-if="isEmpty" class="flex items-center gap-3">
          <svg width="10" height="10" class="shrink-0 overflow-visible">
            <rect width="10" height="10" rx="5" fill="url(#stripes_donut)" class="opacity-60" />
          </svg>
          <span class="text-sm italic text-slate-500 dark:text-slate-400">
            Sin datos disponibles
          </span>
        </div>

        <template v-else>
          <div v-for="(item, index) in processedData" :key="'legend-' + index" class="flex items-center gap-4">
            <svg width="10" height="10" class="shrink-0 overflow-visible">
              <rect width="10" height="10" rx="5" :fill="item.color" />
            </svg>

            <div class="flex items-center justify-between gap-10 w-full min-w-45">
              <span class="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {{ item.label }}
              </span>
              <span class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                <span class="font-bold">{{ item.percentage }}%</span>
                <span class="opacity-30">•</span>
                <span>{{ formatNumber(item.value) }}</span>
              </span>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Tooltip Estandarizado -->
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
          <!-- Valor Principal -->
          <div class="flex items-center justify-between gap-4 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <svg width="10" height="10" class="shrink-0 overflow-visible">
                <rect width="10" height="10" rx="5" :fill="tooltipData.color" />
              </svg>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
                {{ type }}:
              </span>
            </div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
              {{ formatNumber(tooltipData.value) }} {{ unit }}
            </span>
          </div>
          
          <!-- Detalles (Porcentaje y Formateador) -->
          <div class="pl-4.5 flex flex-col">
            <!-- El porcentaje siempre se muestra de primero en los detalles -->
            <div class="flex items-center justify-between gap-4 text-xs whitespace-nowrap">
              <span class="text-slate-500 dark:text-slate-400">Porcentaje:</span>
              <span class="font-medium text-slate-700 dark:text-slate-300">{{ tooltipData.percentage }}%</span>
            </div>

            <!-- Detalles adicionales inyectados por prop -->
            <template v-if="tooltipData.detalles && detailsFormatter">
              <div 
                v-for="(item, idx) in detailsFormatter(tooltipData.detalles)" 
                :key="'detail-' + idx" 
                class="flex items-center justify-between gap-4 text-xs whitespace-nowrap"
              >
                <span class="text-slate-500 dark:text-slate-400">{{ item.label }}:</span>
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ item.value }}</span>
              </div>
            </template>
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
  type: { type: String, default: 'Total' }, // Añadido para estandarizar
  unit: { type: String, default: '' },      // Limpiado el default de "Products"
  detailsFormatter: { type: Function, default: null } // El mismo prop mágico
});

const isMounted = ref(false);
const chartWrapper = ref(null);

onMounted(() => {
  nextTick(() => {
    setTimeout(() => { isMounted.value = true; }, 50);
  });
  document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener('touchstart', handleOutsideInteraction);
});

const radius = 70; 
const strokeWidth = 45; 
const circumference = 2 * Math.PI * radius;
const defaultColors = ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe']; 

const isEmpty = computed(() => {
  return !props.data || props.data.length === 0 || props.data.every(item => !Number(item.value));
});

const processedData = computed(() => {
  if (isEmpty.value) return [];
  const totalValue = props.data.reduce((acc, curr) => acc + Number(curr.value), 0);
  let currentOffsetAcc = 0;

  return props.data.map((item, index) => {
    const numericValue = Number(item.value); 
    const ratio = numericValue / totalValue;
    const sliceLength = ratio * circumference;
    const percentage = Math.round(ratio * 100);
    
    const dashOffset = -currentOffsetAcc;
    currentOffsetAcc += sliceLength; 

    return {
      ...item,
      percentage,
      sliceLength,
      dashOffset,
      color: item.color || defaultColors[index % defaultColors.length]
    };
  });
});

const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

// --- TOOLTIP LOGIC ---
const tooltipVisible = ref(false);
const tooltipData = ref(null);
const tooltipStyle = ref({ 
  left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap'
});

const updateTooltipPosition = (event) => {
  let x, y;
  const isTouch = event.touches && event.touches.length > 0;
  if (isTouch) { x = event.touches[0].clientX; y = event.touches[0].clientY; } 
  else { x = event.clientX; y = event.clientY; }

  const offset = isTouch ? 35 : 15;
  let transformX = '-50%', transformY = '-100%';

  if (x > window.innerWidth - 180) { transformX = '-100%'; x -= offset; }
  else if (x < 150) { transformX = '0%'; x += offset; }

  if (y < 100) { transformY = '0%'; y += offset; }
  else { transformY = '-100%'; y -= offset; }

  tooltipStyle.value = {
    left: `${x}px`, top: `${y}px`,
    transform: `translate(${transformX}, ${transformY})`
  };
};

const onMouseEnter = (e, item) => { tooltipData.value = item; tooltipVisible.value = true; updateTooltipPosition(e); };
const onMouseMove = (e) => { if (tooltipVisible.value) updateTooltipPosition(e); };
const onMouseLeave = () => { tooltipVisible.value = false; };
const onTouchStart = (e, item) => { tooltipData.value = item; tooltipVisible.value = true; updateTooltipPosition(e); };

const handleOutsideInteraction = (event) => {
  if (tooltipVisible.value && !event.target.closest('.chart-bar-group')) {
    tooltipVisible.value = false;
  }
};
</script>