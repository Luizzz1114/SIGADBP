<template>
  <div class="w-full mx-auto">
    <div ref="chartWrapper" class="relative flex items-center justify-start w-full overflow-x-auto" role="region" aria-label="Gráfico de barras apiladas porcentual">
      <svg 
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
        :style="{ width: '100%', minWidth: `${svgWidth}px`, height: `${svgHeight}px` }"
        class="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="stripes_stacked" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" class="fill-slate-200 dark:fill-slate-700" /> 
            <line x1="0" y1="0" x2="0" y2="8" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="3" /> 
          </pattern>
        </defs>

        <g class="y-axis" aria-hidden="true">
          <template v-for="(tick, index) in computedYTicks" :key="'tick-' + index">
            <line 
              :x1="margins.left" :y1="tick.y" :x2="svgWidth - margins.right" :y2="tick.y" 
              class="stroke-slate-200 dark:stroke-slate-700" stroke-width="1"
            />
            <text 
              :x="margins.left - 12" :y="tick.y + 4" text-anchor="end"
              class="fill-slate-400 dark:fill-slate-500 text-[13px]"
            >
              {{ tick.value }}%
            </text>
          </template>
        </g>

        <g 
          v-for="(item, index) in processedData" :key="index"
          class="group cursor-pointer outline-none"
          @mouseenter="onMouseEnter($event, item)"
          @mousemove="onMouseMove($event)"
          @mouseleave="onMouseLeave"
        >
          <rect 
            :x="item.x - (spacePerBar / 2)" :y="margins.top" :width="spacePerBar" :height="chartHeight" 
            fill="transparent" class="transition-colors duration-200 group-hover:fill-slate-200/30 dark:group-hover:fill-slate-800/50"
          />

          <rect
            :x="item.x - (barWidth / 2)" :y="margins.top" :width="barWidth" :height="chartHeight" rx="8"
            class="fill-slate-100/50 dark:fill-slate-800/50"
          />

          <rect
            :x="item.x - (barWidth / 2)" :y="isMounted ? item.yAnimatedBottom : item.yStatic"
            :width="barWidth" :height="isMounted ? item.heightBottom : 0" rx="8"
            :class="colorBottom" 
            :style="{ transition: 'height 700ms ease-out, y 700ms ease-out', transitionDelay: `${index * 40}ms` }"
          />

          <rect
            :x="item.x - (barWidth / 2)" :y="isMounted ? item.yAnimatedTop : item.yStatic"
            :width="barWidth" :height="isMounted ? item.heightTop : 0" rx="8"
            :fill="usePatternTop ? 'url(#stripes_stacked)' : undefined"
            :class="usePatternTop ? '' : colorTop" 
            :style="{ transition: 'height 700ms ease-out, y 700ms ease-out', transitionDelay: `${index * 40}ms` }"
          />

          <text
            :x="item.x" :y="item.yStatic + 25" text-anchor="middle"
            class="fill-slate-500 dark:fill-slate-400 text-[13px] group-hover:fill-slate-700 dark:group-hover:fill-slate-200"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>
    </div>

    <Teleport to="body">
      <div 
        v-if="tooltipData" v-show="tooltipVisible"
        class="fixed z-9999 pointer-events-none overflow-hidden rounded-lg shadow-xs border border-slate-200 bg-white dark:bg-slate-850 dark:border-slate-700"
        :style="tooltipStyle"
      >
        <div class="px-3 pt-2 pb-1.5 border-b border-slate-200 bg-slate-100 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800 font-medium">
          {{ tooltipData.label }}
        </div>
        <div class="px-3 pb-3 pt-2 flex flex-col gap-2 text-[13px]">
          
          <div class="flex items-center justify-between gap-6">
            <div class="flex items-center gap-2">
              <div :class="colorBottom" class="size-2 rounded-full"></div>
              <span class="text-slate-600 dark:text-slate-300">{{ labelBottom }}</span>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-700 dark:text-slate-100">{{ tooltipData.valueBottom }}%</span>
              <span class="text-slate-400 dark:text-slate-500 ml-1">• {{ tooltipData.countBottom }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-6">
            <div class="flex items-center gap-2">
              <svg v-if="usePatternTop" width="8" height="8" class="shrink-0 rounded-full">
                <rect width="8" height="8" fill="url(#stripes_stacked)" />
              </svg>
              <div v-else :class="colorTop" class="size-2 rounded-full"></div>
              
              <span class=" text-slate-600 dark:text-slate-300">{{ labelTop }}</span>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-700 dark:text-slate-100">{{ tooltipData.valueTop }}%</span>
              <span class="text-slate-400 dark:text-slate-500 ml-1">• {{ tooltipData.countTop }}</span>
            </div>
          </div>
          
          <div class="mt-1 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span class="font-medium text-slate-500">Total Asignado</span>
            <span class="font-bold text-slate-700 dark:text-slate-100">{{ tooltipData.total }} bienes</span>
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
  colorBottom: { type: String, default: 'fill-emerald-400 dark:fill-emerald-500 bg-emerald-400 dark:bg-emerald-500' },
  colorTop: { type: String, default: 'fill-amber-400 dark:fill-amber-500 bg-amber-400 dark:bg-amber-500' },
  labelBottom: { type: String, default: 'Operativos' },
  labelTop: { type: String, default: 'En Mantenimiento' },
  usePatternTop: { type: Boolean, default: false }
});

const isMounted = ref(false);
const chartWrapper = ref(null);
const containerWidth = ref(400);

const tooltipVisible = ref(false);
const tooltipData = ref(null);
const tooltipStyle = ref({ left: '0px', top: '0px', transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap' });

const updateTooltipPosition = (event) => {
  let x = event.clientX;
  let y = event.clientY; 
  let transformX = '-50%';
  let transformY = '-100%';

  if (x > window.innerWidth - 200) { transformX = '-100%'; x -= 15; } else if (x < 150) { transformX = '0%'; x += 15; }
  if (y < 150) { transformY = '0%'; y += 15; } else { transformY = '-100%'; y -= 15; }

  tooltipStyle.value = { left: `${x}px`, top: `${y}px`, transform: `translate(${transformX}, ${transformY})`, whiteSpace: 'nowrap' };
};

const onMouseEnter = (event, item) => { tooltipData.value = item; tooltipVisible.value = true; updateTooltipPosition(event); };
const onMouseMove = (event) => { if (tooltipVisible.value) updateTooltipPosition(event); };
const onMouseLeave = () => { tooltipVisible.value = false; };

let resizeObserver = null;
onMounted(() => {
  requestAnimationFrame(() => { setTimeout(() => { isMounted.value = true; }, 50); });
  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) containerWidth.value = entries[0].contentRect.width - 2; 
    });
    resizeObserver.observe(chartWrapper.value);
  }
});
onUnmounted(() => { if (resizeObserver) resizeObserver.disconnect(); });

const svgHeight = 250; 
const margins = { top: 20, right: 20, bottom: 40, left: 40 }; 
const ticksCount = 4;
const chartHeight = svgHeight - margins.top - margins.bottom; 
const minSpacePerBar = 90; 

const maxValue = 100;

const svgWidth = computed(() => Math.max(containerWidth.value, margins.left + margins.right + (props.data.length * minSpacePerBar), 400));
const chartWidth = computed(() => svgWidth.value - margins.left - margins.right);
const spacePerBar = computed(() => chartWidth.value / (props.data.length || 1));
const barWidth = computed(() => Math.min(spacePerBar.value * 0.40, 32));

const computedYTicks = computed(() => {
  return Array.from({ length: ticksCount + 1 }, (_, i) => ({
    value: Math.round((maxValue / ticksCount) * (ticksCount - i)),
    y: margins.top + (chartHeight / ticksCount) * i
  }));
});

const processedData = computed(() => {
  return props.data.map((item, index) => {
    const heightBottom = (item.valueBottom / maxValue) * chartHeight;
    const heightTop = (item.valueTop / maxValue) * chartHeight;
    const yStatic = margins.top + chartHeight; 

    const gap = (heightBottom > 0 && heightTop > 0) ? 2 : 0;
    
    return {
      ...item,
      x: margins.left + (index * spacePerBar.value) + (spacePerBar.value / 2),
      heightBottom, heightTop, yStatic,
      yAnimatedBottom: yStatic - heightBottom,
      yAnimatedTop: yStatic - heightBottom - heightTop - gap
    };
  });
});
</script>