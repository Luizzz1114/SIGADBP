<script setup>
import CustomTag from '../CustomTag.vue';
import MiniCard from '../MiniCard.vue';

const visible = defineModel('visible');
defineProps({ bien: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Bien</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4 mt-4">
      <div class="flex flex-col min-w-0 w-full">
        <span class="font-bold text-lg! block wrap-break-word whitespace-normal">
          {{ bien.descripcion }}
        </span>
        <div class="flex flex-wrap gap-2 mt-0.5">
          <Tag :value="bien.estatus" :severity="{'Operativo': 'success', 'En mantenimiento': 'info', 'No asignado': 'secondary', 'Desincorporado': 'danger'}[bien.estatus]" class="ring-1 ring-inset ring-current/10" />
          <CustomTag
            :value="bien.categoria"
            :icon="{'Mueble': 'fi-sr-chair', 'Tecnológico': 'fi-sr-computer', 'Vehículo o Equipo de Elevación': 'fi-sr-truck-moving'}[bien.categoria] || 'fi-sr-box-open-full'" 
            :color="{'Mueble': 'emerald', 'Tecnológico': 'blue', 'Vehículo o Equipo de Elevación': 'slate'}[bien.categoria] || 'blue'"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <MiniCard
        label="Número de bien" 
        :value="bien.numero"
        icon="fi-sr-tags" 
        color="slate" 
        size="sm"
      />
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-info text-blue-500"></i>
        Especificaciones Técnicas
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Marca</span>
        <span class="font-medium! text-right">{{ bien.marca || 'No especificada' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Modelo</span>
        <span class="font-medium! text-right">{{ bien.modelo || 'No especificado' }}</span>
      </div>

      <template v-if="bien.categoria === 'Mueble'">
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Tipo de Mueble</span>
          <span class="font-medium! text-right">{{ bien.tipomueble || 'No especificado' }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Material</span>
          <span class="font-medium! text-right">{{ bien.material || 'No especificado' }}</span>
        </div>
      </template>
      
      <template v-if="bien.categoria === 'Tecnológico'">
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Serial</span>
          <span class="font-medium! text-right">{{ bien.serial || 'No especificado' }}</span>
        </div>
        <Divider class="my-0.5!" />
        <div class="flex flex-col gap-0.5">
          <span class="text-slate-500 dark:text-slate-400">Especificaciones</span>
          <span class="font-medium!">
            {{ bien.especificaciones || 'Sin especificaciones detalladas' }}
          </span>
        </div>
      </template>

      <template v-if="bien.categoria === 'Vehículo o Equipo de Elevación'">
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Serial de Carrocería</span>
          <span class="font-medium! text-right">{{ bien.serialcarroceria || 'No especificado' }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Placa</span>
          <span class="font-medium! text-right">{{ bien.placa || 'N/A' }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="text-slate-500 dark:text-slate-400">Color</span>
          <span class="font-medium! text-right">{{ bien.color || 'No especificado' }}</span>
        </div>
      </template>

    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi fi-br-home-location-alt text-blue-500"></i>  
        Ubicación actual
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ bien.dependencia || 'Sin dependencia' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Responsable</span>
        <span class="font-medium! text-right">{{ bien.responsable || 'Sin responsable' }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula del Responsable</span>
        <span class="font-medium! text-right">{{ bien.cedula_responsable || 'N/A' }}</span>
      </div>
    </div>

  </Drawer>
</template>