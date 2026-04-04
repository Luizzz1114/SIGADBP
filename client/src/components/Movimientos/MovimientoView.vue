<script setup>
const visible = defineModel('visible');
defineProps({ movimiento: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-priority-arrows rotate-90!"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Movimiento</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4">
      <div class="flex flex-col min-w-0 w-full">
        <span class="font-bold text-lg! block wrap-break-word whitespace-normal">
          {{ movimiento?.tipo }}
        </span>
        <span class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm!">
          <i class="fi-rr-calendar"></i>
          {{ movimiento?.fecha }}
        </span>
      </div>
    </div>

    <div v-if="movimiento?.motivo" class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase text-sm">
        <i class="fi-br-info text-blue-500"></i>
        Motivo
      </span>
      <span class="text-slate-600 dark:text-slate-300 text-sm">{{ movimiento.motivo }}</span>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase text-sm">
        <i class="fi-br-arrow-up-right text-red-500"></i>
        Origen (Entrega)
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ movimiento?.dependencia_origen }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Responsable actual</span>
        <span class="font-medium! text-right">{{ movimiento?.cedente }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula de identidad</span>
        <span class="font-medium! text-right">{{ movimiento?.cedula_cedente }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase text-sm">
        <i class="fi-br-arrow-down-left text-green-500"></i>
        Destino (Recibe)
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ movimiento?.dependencia_destino }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Nuevo responsable</span>
        <span class="font-medium! text-right">{{ movimiento?.receptor }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula de identidad</span>
        <span class="font-medium! text-right">{{ movimiento?.cedula_receptor }}</span>
      </div>
    </div>

    <div class="flex flex-col mt-3 w-full">
      <div class="p-3">
        <span class="font-bold uppercase text-sm flex items-center gap-2">
          <i class="fi fi-br-boxes text-blue-500"></i>
          Bienes
        </span>
      </div>
      <DataTable :value="movimiento?.bienes" size="small" tableStyle="min-width: 100%" stripedRows>
        <Column header="Número de Bien">
          <template #body="{ data }">
            <span class="px-1 whitespace-nowrap rounded border border-slate-150 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {{ data.numero }}
            </span>
          </template>
        </Column>
        <Column header="Descripción">
          <template #body="{ data }">
            <div class="flex flex-col items-start gap-1 whitespace-nowrap">
              <span class="text-sm dark:text-slate-200">{{ data.descripcion }}</span>
              <span class="text-xs! text-slate-500 dark:text-slate-400">
                {{ data.marca || 'S/M' }} - {{ data.modelo || 'S/M' }}
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
      <div class="flex justify-between items-center py-2 px-4 text-slate-500 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-750">
        <span class="text-xs! text-slate-500 dark:text-slate-400">Total de bienes</span>
        <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ movimiento?.cantidad_bienes }}</span>
      </div>
    </div>
  </Drawer>
</template>