<script setup>
import MiniCard from '../MiniCard.vue';

const visible = defineModel('visible', { type: Boolean, default: false });
defineProps({ personal: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-employee-man"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Personal</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4 mt-4">
      <div class="grid place-items-center p-3 size-18 text-2xl font-bold rounded-2xl bg-blue-500 text-white">
        {{ personal.nombres.charAt(0) }}{{ personal.apellidos.charAt(0) }}
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="font-bold text-xl! tracking-tight leading-none">{{ personal.nombres }} {{ personal.apellidos }}</span>
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400">CI: {{ personal.cedula }}</span>
        <div class="flex gap-2">
          <Tag :value="personal.estatus" :severity="personal.estatus === 'Activo' ? 'success' : 'secondary'" class="ring-1 ring-inset ring-current/10" />
          <Tag :value="personal.nivelprofesional" icon="fi-sr-graduation-cap" severity="secondary" class="ring-1 ring-inset ring-current/10" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-info text-blue-500"></i>
        Información personal
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Género</span>
        <span class="font-medium! text-right">{{ personal.genero === 'M' ? 'Masculino' : 'Femenino' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Fecha de nacimiento</span>
        <span class="font-medium! text-right">{{ personal.fechanacimiento }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Edad</span>
        <span class="font-medium! text-right">{{ personal.edad }} años</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Teléfono</span>
        <span class="font-medium! text-right">{{ personal.telefono }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-briefcase text-blue-500"></i>
        Ubicación y Cargo
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ personal.dependencia || 'No asignado' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cargo</span>
        <span class="font-medium! text-right">{{ personal.cargo || 'No asignado' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Fecha de ingreso</span>
        <span class="font-medium! text-right">{{ personal.fechaingreso || 'N/A' }}</span>
      </div>
      <div v-if="personal.fechasalida" class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Fecha de salida</span>
        <span class="font-medium! text-right">{{ personal.fechasalida || 'N/A' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <MiniCard 
        label="Bienes asignados"
        :value="personal.bienes_asignados || 0" 
        icon="fi-sr-box" 
        color="blue" 
      />
      <MiniCard
        label="Años de servicio" 
        :value="personal.antiguedad"
        icon="fi-sr-calendar-clock" 
        color="indigo" 
      />
    </div>

  </Drawer>
</template>