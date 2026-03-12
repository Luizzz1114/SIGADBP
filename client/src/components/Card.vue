<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  message: String
});
</script>

<template>
  <div class="flex flex-col justify-between flex-1 gap-2 p-3 min-w-60 snap-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-xs">
    <div class="grid place-items-center size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
      <i :class="icon"></i>
    </div>
    <div class="flex flex-col">
      <span class="text-sm font-medium text-slate-500 dark:text-slate-200">
        {{ label }}
      </span>
      <span class="text-2xl font-bold text-slate-700 dark:text-white">
        {{ value }}
      </span>
      <span v-if="message" class="text-xs text-slate-400">{{ message }}</span>
    </div>
  </div>
</template>