<script setup>
import { formatearMonto } from '@/utils/formatters';

defineProps({
  item: Object,
  icon: String,
});
</script>

<template>
  <div class="flex flex-col justify-between gap-3 p-3 min-w-76 min-h-36 snap-center rounded-xl bg-slate-50/50 border border-slate-200 dark:bg-slate-800/75 dark:border-slate-700 shadow-xs">
    <div class="flex items-center gap-3">
      <div class="grid place-items-center size-9 text-lg rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
        <i :class="icon"></i>
      </div>
      <span class="mr-1 text-sm font-medium text-slate-500 dark:text-slate-200">
        {{ item.tipo }}
      </span>
    </div>
    <div class="flex items-baseline justify-between">
      <div class="flex items-baseline gap-1">
        <span class="font-bold text-xl dark:text-slate-100">${{ formatearMonto(item.gasto_total) }}</span>
        <span class="font-medium text-sm text-slate-500 dark:text-slate-400">/ ${{ formatearMonto(item.presupuesto_total_usd) }}</span>
      </div>
      <Tag 
        :value="`${item.porcentaje_uso}%`"
        class="ring-1 ring-inset ring-current/10"
        :severity="
          Number(item.porcentaje_uso) >= 60 ? 'success' : 
          Number(item.porcentaje_uso) > 30 ? 'warn' : 'danger'
        "
        />
    </div>
    <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div 
        class="h-full rounded-full transition-[width] duration-700 ease-out"
        :class="
          Number(item.porcentaje_uso) >= 60 ? 'bg-emerald-500' : 
          Number(item.porcentaje_uso) > 30 ? 'bg-orange-400' : 'bg-red-400'
        "
        :style="`width: ${item.porcentaje_uso}%`"
      ></div>
    </div>
    <div class="flex items-baseline gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <span>Disponible:</span>
      <span>${{ formatearMonto(item.monto_disponible) }}</span>
    </div>
  </div>
</template>