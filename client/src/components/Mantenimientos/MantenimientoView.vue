<script setup>
import MiniCard from '@/components/MiniCard.vue';
import { formatearMonto } from '@/utils/formatters';

const visible = defineModel('visible');
defineProps({ mantenimiento: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-screw-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Mantenimiento</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4 mt-4">
      <div class="flex flex-col min-w-0 w-full">
        <span class="font-bold text-lg! block wrap-break-word whitespace-normal">
          {{ mantenimiento.descripcion_bien }}
        </span>
        <div class="flex flex-wrap items-center gap-2 mt-0.5">
          <Tag 
            :value="mantenimiento.estatus"
            :severity="{'Finalizado': 'secondary', 'En proceso': 'info', 'Cancelado': 'danger'}[mantenimiento.estatus] || 'info'"
            class="ring-1 ring-inset ring-current/10"
          />
          <span class="flex items-center justify-center text-sm font-bold text-slate-600 bg-slate-100 px-3 rounded-full dark:bg-slate-800 dark:text-slate-300 ring-1 ring-inset ring-current/10">
            {{ mantenimiento.tipo }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <MiniCard
        label="Número de bien" 
        :value="mantenimiento.numero_bien"
        icon="fi-sr-tags" 
        color="slate" 
        size="sm"
      />
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-clock-three text-blue-500"></i>  
        Tiempos y Estado
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Fecha de inicio</span>
        <span class="font-medium! text-right">{{ mantenimiento.fecha_inicio }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Fecha de finalización</span>
        <span class="font-medium! text-right">{{ mantenimiento.fecha_fin || 'No finalizado' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Estado posterior</span>
        <span class="font-medium! text-right">{{ mantenimiento.estado_posterior || 'N/A' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Días en mantenimiento</span>
        <span class="font-medium! text-right">{{ mantenimiento.dias_duracion ? `${mantenimiento.dias_duracion} día(s)` : 'N/A' }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-home-location-alt text-blue-500"></i>  
        Ubicación Actual
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ mantenimiento.dependencia || 'No asignada' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Responsable</span>
        <span class="font-medium! text-right">{{ mantenimiento.responsable  || 'Sin responsable' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula del responsable</span>
        <span class="font-medium! text-right">{{ mantenimiento.cedula || 'N/A' }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi fi-br-document text-blue-500"></i>  
        Detalles Técnicos y Presupuesto
      </span>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-0.5">
          <span class="text-slate-500 dark:text-slate-400">Costo del mantenimiento</span>
          <span class="font-bold!">{{ mantenimiento.gasto ? `${formatearMonto(mantenimiento.gasto)}` : 'N/A' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-slate-500 dark:text-slate-400">Partida presupuestaria</span>
          <span class="font-medium!">{{ mantenimiento.codigo_partida || 'N/A' }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-slate-500 dark:text-slate-400">Monto presupuestado</span>
          <span class="font-medium!">{{ mantenimiento.monto ? `$${formatearMonto(mantenimiento.monto)}` : 'N/A' }}</span>
        </div>
      </div>
       <Divider class="my-0.5!" />
      <div class="flex flex-col gap-0.5">
        <span class="text-slate-500 dark:text-slate-400">Descripción</span>
        <p class="font-medium! whitespace-pre-wrap">
          {{ mantenimiento.descripcion || 'Sin descripción detallada.' }}
        </p>
      </div>
    </div>

  </Drawer>
</template>