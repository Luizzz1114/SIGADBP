<template>
  <div class="flex flex-wrap items-center gap-8 p-6 w-fit">
    
    <div class="relative w-60 h-60 shrink-0">
      <svg viewBox="0 0 200 200" class="w-full h-full transform -rotate-90">
        <g v-for="(ring, index) in ringsData" :key="index">
          
          <circle 
            cx="100" cy="100" :r="ring.radius" 
            class="fill-none stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300"
            :stroke-width="strokeWidth" 
          />
          
          <circle 
            cx="100" cy="100" :r="ring.radius" 
            class="fill-none stroke-current transition-all duration-1000 ease-out"
            :class="ring.colorClass"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="ring.circumference"
            :stroke-dashoffset="ring.offset"
          />
        </g>
      </svg>
    </div>

    <div class="flex flex-col gap-4">
      <div 
        v-for="(item, index) in ringsData" 
        :key="'legend-' + index" 
        class="flex items-center gap-4"
      >
        <div class="flex items-center gap-2">
          <span 
            class="w-3 h-3 rounded-full" 
            :class="item.bgClass"
          ></span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 w-20">
            {{ item.label }}
          </span>
        </div>
        
        <div class="flex items-center gap-3 text-sm">
          <span class="font-bold text-slate-800 dark:text-white w-12 text-right">
            {{ item.value }}
          </span>
          <span class="text-slate-400 dark:text-slate-500 font-medium w-10 text-right">
            {{ item.percentage }}%
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

// --- CONFIGURACIÓN VISUAL ---
const strokeWidth = 10;  // Grosor de los anillos
const baseRadius = 75;   // Radio del anillo exterior
const gap = 20;          // Espacio entre anillos

// --- ESTADO DE LA ANIMACIÓN ---
const isAnimated = ref(false);

onMounted(() => {
  setTimeout(() => {
    isAnimated.value = true;
  }, 50);
});

// --- CÁLCULO MATEMÁTICO DEL SVG ---
const ringsData = computed(() => {
  return props.data.map((item, index) => {
    const radius = baseRadius - (index * gap);
    const circumference = 2 * Math.PI * radius;
    
    // Tomamos el porcentaje directamente de tu objeto
    const percentage = item.percentage || 0;
    
    const targetOffset = circumference - (percentage / 100) * circumference;
    const offset = isAnimated.value ? targetOffset : circumference;
    
    return {
      ...item,
      radius,
      circumference,
      offset
    };
  });
});
</script>