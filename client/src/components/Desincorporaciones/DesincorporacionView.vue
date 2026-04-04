<script setup>
const visible = defineModel('visible');
defineProps({ desincorporacion: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-red-500 text-white">
          <i class="fi-sr-apps-delete"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Desincorporación</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4">
      <div class="flex flex-col min-w-0 w-full">
        <span class="font-bold text-lg! block wrap-break-word whitespace-normal">
          Desincoporación de bienes
        </span>
        <span class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm!">
          <i class="fi-rr-calendar"></i>
          {{ desincorporacion.fecha_salida }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-3 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-info text-red-400"></i>
        Detalles
      </span>
      <div class="flex flex-col gap-0.5">
        <span class="text-slate-500 dark:text-slate-400">Descripción</span>
        <span class="font-medium!">{{ desincorporacion.descripcion || 'Sin descripción' }}</span>
      </div>
      <Divider class="my-0!" />
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
        <span class="font-medium! text-right">{{ desincorporacion.dependencia }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Responsable</span>
        <span class="font-medium! text-right">{{ desincorporacion.responsable }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula de identidad</span>
        <span class="font-medium! text-right">{{ desincorporacion.cedula }}</span>
      </div>
    </div>

    <div class="flex flex-col mt-3 w-full">
      <div class="p-3">
        <span class="font-bold uppercase text-sm flex items-center gap-2">
          <i class="fi fi-br-boxes text-red-400"></i>
          Bienes Desincorporados
        </span>
      </div>
      <DataTable :value="desincorporacion.bienes" size="small" tableStyle="min-width: 100%">
        <Column header="Bienes desincorporados">
          <template #body="{ data }">
            <div class="flex flex-col items-start gap-1 whitespace-nowrap">
              <span class="px-1 whitespace-nowrap rounded border border-slate-150 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {{ data.numero }}
              </span>
              <span class="text-xs! text-slate-500 dark:text-slate-400">{{ data.descripcion }}</span>
            </div>
          </template>
        </Column>
        <Column header="Tipo de desincorporación">
          <template #body="{ data }">
            <span v-if="data.tipo_desincorporacion" class="whitespace-nowrap font-medium">
              {{ data.tipo_desincorporacion }}
            </span>
          </template>
        </Column>
      </DataTable>
      <div class="flex justify-between items-center py-2 px-4 text-slate-500 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-750">
        <span class="text-xs! text-slate-500 dark:text-slate-400">Total de bienes desincorporados</span>
        <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ desincorporacion.cantidad_bienes }}</span>
      </div>
    </div>
  </Drawer>
</template>