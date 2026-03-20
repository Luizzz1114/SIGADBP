<template>
  <div class="w-full mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-center gap-8" role="region" aria-label="Gráfico de distribución">
      <div ref="chartWrapper" class="relative size-48 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          class="w-full h-full transform -rotate-90 overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <g aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              :r="radius"
              fill="none"
              class="stroke-slate-100 dark:stroke-slate-800"
              :stroke-width="strokeWidth"
            />
            
            <circle
              v-for="(item, index) in processedData"
              :key="'slice-' + index"
              cx="100"
              cy="100"
              :r="radius"
              fill="none"
              :stroke="item.color || defaultColors[index % defaultColors.length]"
              :stroke-width="strokeWidth"
              :stroke-dasharray="isMounted ? `${item.sliceLength} ${circumference}` : `0 ${circumference}`"
              :stroke-dashoffset="item.dashOffset"
              class="transition-all duration-1000 ease-out cursor-pointer hover:opacity-80 focus:outline-none"
              role="graphics-symbol"
              :aria-label="`${item.label}: ${item.value}`"
              @mouseenter="onMouseEnter($event, item)"
              @mousemove="onMouseMove($event)"
              @mouseleave="onMouseLeave"
            />
          </g>
        </svg>

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="size-24 bg-white dark:bg-slate-900 rounded-full"></div>
        </div>
      </div>

      <div class="flex flex-col md:w-auto gap-3 transition-opacity duration-1000" :class="isMounted ? 'opacity-100' : 'opacity-0'">
        <div v-for="(item, index) in processedData" :key="'legend-' + index" class="flex items-center gap-3 ">
          <div class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }"></div>
          <div class="flex items-center justify-between gap-4 w-full">
            <span class="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {{ item.label }}
            </span>
            <span class="flex items-center gap-1.5 *:text-sm text-slate-600 dark:text-slate-400">
              <span>{{ item.percentage }}%</span>
              <span>•</span>
              <span>{{ formatNumber(item.value) }} {{ unit }}</span>
            </span>
          </div>
        </div>
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
        <div class="flex items-center gap-2 px-3 pb-2 pt-2">
          <div 
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: tooltipData.color || defaultColors[0] }"
          ></div>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-100">
             {{ tooltipData.percentage }}% ({{ formatNumber(tooltipData.value) }})
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  data: { 
    type: Array, 
    required: true,
  },
  unit: { 
    type: String, 
    default: 'Products' 
  }
});

// --- ESTADO Y ANIMACIÓN ---
const isMounted = ref(false);
const chartWrapper = ref(null);

onMounted(() => {
  // Retraso ligero para permitir que la transición CSS se ejecute al montar
  setTimeout(() => { 
    isMounted.value = true; 
  }, 100);
});

// --- CONFIGURACIÓN DEL SVG DONA ---
const radius = 70; // Radio del círculo
const strokeWidth = 45; // Grosor de la dona
const circumference = 2 * Math.PI * radius;
const defaultColors = ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe']; // Paleta por defecto


// --- CÁLCULOS MATEMÁTICOS PARA LOS SEGMENTOS ---
const processedData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  // CORRECCIÓN: Usar Number() para evitar concatenación de strings
  const totalValue = props.data.reduce((acc, curr) => acc + Number(curr.value), 0);
  let currentOffsetAcc = 0;

  return props.data.map((item, index) => {
    // CORRECCIÓN: Asegurar que el valor individual sea tratado como número
    const numericValue = Number(item.value); 
    const ratio = numericValue / totalValue;
    const sliceLength = ratio * circumference;
    const percentage = Math.round(ratio * 100);
    
    // El dashoffset debe ser negativo para que el trazo avance en sentido horario
    const dashOffset = -currentOffsetAcc;
    currentOffsetAcc += sliceLength; // Acumulamos el inicio para el siguiente segmento

    return {
      ...item,
      percentage,
      sliceLength,
      dashOffset,
      color: item.color || defaultColors[index % defaultColors.length]
    };
  });
});

// --- UTILIDADES ---
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// --- LÓGICA DEL TOOLTIP (Exactamente como tu código) ---
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
  if (event.clientX && event.clientY) {
    updateTooltipPosition(event);
  }
};

const onMouseMove = (event) => {
  if (tooltipVisible.value) updateTooltipPosition(event);
};

const onMouseLeave = () => {
  tooltipVisible.value = false;
};
</script>