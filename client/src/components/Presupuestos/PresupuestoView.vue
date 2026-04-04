<script setup>
import { formatearMonto } from '@/utils/formatters';

const visible = defineModel('visible');
defineProps({ presupuesto: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Presupuesto</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4">
      <div class="flex flex-col min-w-0 w-full">
        <span class="font-bold text-lg! block wrap-break-word whitespace-normal">
          {{ presupuesto.tipo }}
        </span>
        <div class="flex gap-2 mt-0.5">
          <Tag :value="presupuesto.estatus" :severity="{'Activo': 'success', 'Cerrado': 'secondary'}[presupuesto.estatus]" class="ring-1 ring-inset ring-current/10" />
          <Tag :value="'Año Fiscal ' + presupuesto.anio" severity="info" class="ring-1 ring-inset ring-current/10" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 mt-3">
      <MiniCard
        label="Asignación inicial (USD)" 
        :value="'$' + formatearMonto(presupuesto.montousd)"
        icon="fi-sr-sack-dollar" 
        color="emerald"
        size="sm"
      />
      <MiniCard 
        label="Disponible" 
        :value="'$' + formatearMonto(presupuesto.total_disponible)" 
        icon="fi-sr-wallet" 
        color="blue" 
        size="sm" 
      />
      <MiniCard 
        label="Gastos acumulados" 
        :value="'$' + formatearMonto(presupuesto.total_gastos)" 
        icon="fi-sr-arrow-trend-down" 
        color="slate" 
        size="sm" 
      />
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-info text-blue-500"></i>
        Clasificación Operativa
      </span>
      <div class="flex flex-col gap-1">
        <span class="text-slate-500 dark:text-slate-400">Descripción</span>
        <span class="font-medium! leading-relaxed">
          {{ presupuesto.descripcion }}
        </span>
      </div>
      <Divider class="my-0.5!" />
      <div class="flex justify-between gap-3 pt-1">
        <span class="text-slate-500 dark:text-slate-400">Año fiscal</span>
        <span class="font-medium! text-right">{{ presupuesto.anio }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Semestre</span>
        <span class="font-medium! text-right">{{ presupuesto.semestre }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-file-invoice-dollar text-blue-500"></i>
        Registro y Tasa
      </span>
      <div class="flex justify-between gap-3 pt-1">
        <span class="text-slate-500 dark:text-slate-400">Presupuesto inicial en Bs.</span>
        <span class="font-bold text-right">Bs. {{ formatearMonto(presupuesto.montobs) }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Tasa BCV</span>
        <span class="font-medium! text-right">Bs. {{ formatearMonto(presupuesto.tasacambio) }}</span>
      </div>
      <div class="flex justify-between gap-3 mt-1 pt-2 border-t border-slate-200 dark:border-slate-700">
        <span class="text-slate-500 dark:text-slate-400">Fecha de registro</span>
        <span class="font-medium text-right text-xs mt-0.5">{{ presupuesto.fecharegistro }}</span>
      </div>
    </div>

  </Drawer>
</template>