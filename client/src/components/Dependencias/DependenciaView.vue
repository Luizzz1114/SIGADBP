<script setup>
import CustomTag from '@/components/CustomTag.vue';
import MiniCard from '../MiniCard.vue';

const visible = defineModel('visible', { type: Boolean, default: false });
defineProps({ dependencia: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-130!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-building"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Dependencia</span>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-0.5">
      <span class="font-bold text-lg!">{{ dependencia.nombre }}</span>
      <CustomTag
        :value="dependencia.tipo"
        :icon="{'Centro de Acopio' : 'fi-sr-warehouse-alt', 'Módulo' : 'fi-sr-shop', 'Unidad' : 'fi-sr-desk',}[dependencia.tipo]"
        :color="{'Centro de Acopio' : 'violet', 'Módulo' : 'indigo', 'Unidad' : 'sky'}[dependencia.tipo]"
      />
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl bg-slate-50/60 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <div class="flex flex-col gap-3">
        <span class="flex items-center gap-2 font-bold uppercase">
          <i class="fi-br-marker text-blue-500"></i>
          Ubicación
        </span>
        <div class="flex flex-col gap-0.5">
          <span class="text-slate-500 dark:text-slate-400">Dirección</span>
          <span class="font-medium!">{{ dependencia.direccion || 'N/A' }}</span>
        </div>
        <Divider class="my-0!" />
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Estado</span>
          <span class="font-medium! text-right">{{ dependencia.estado }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Municipio</span>
          <span class="font-medium! text-right">{{ dependencia.municipio }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Parroquia</span>
          <span class="font-medium! text-right">{{ dependencia.parroquia }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      <MiniCard 
        label="Personal"
        :value="dependencia.total_personal"
        icon="fi-sr-users"
        color="blue"
      />
      <MiniCard 
        label="Bienes"
        :value="dependencia.total_bienes"
        icon="fi-sr-box"
        color="indigo"
      />
    </div>

  </Drawer>
</template>