<template>
  <div class="flex flex-col gap-5 w-full">
    <div v-for="(item, index) in data" :key="index" class="flex flex-col gap-1">
      <div class="flex justify-between items-center text-sm">
        <span class="font-medium text-slate-600 dark:text-slate-200">
          {{ item.label }}
        </span>
        <div class="flex items-center gap-4">
          <span class="font-medium text-slate-500 dark:text-slate-400">
            {{ item.value }}
          </span>
          <span class="w-12 text-right font-semibold dark:text-slate-200">
            {{ item.percentage }}%
          </span>
        </div>
      </div>
      <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          class="h-full rounded-full transition-[width] duration-700 ease-out"
          :class="item.color || 'bg-blue-500'"
          :style="{ width: isMounted ? `${item.percentage}%` : '0%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  data: {
    type: Array,
    required: true,
  }
});

const isMounted = ref(false);

onMounted(() => {
  setTimeout(() => { isMounted.value = true }, 50);
});
</script>