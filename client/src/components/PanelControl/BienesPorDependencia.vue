<script setup>
import { onMounted, ref } from 'vue';
import metricasServices from '@/services/metricas.services.js';


const data = ref([]);

onMounted(async() => {
  data.value = await metricasServices.bienesPorDependencia();
});
</script>

<template>
  <div class="flex-1 rounded-xl border border-slate-200 shadow-xs dark:border-slate-700">
    <div class="flex items-center gap-3 px-4 pt-4 pb-1">
      <div class="grid place-items-center size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
        <i class="fi-rr-building"></i>
      </div>
      <span class="font-bold text-base dark:text-slate-50">Distribución de bienes por dependencia</span>
    </div>
    <div class="p-4 flex flex-col gap-5">
       <DataTable
        :value="data"
        paginator :rows="5"
        size="small" tableStyle="min-width: 100%" stripedRows
      >
        <template #paginatorcontainer="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-4">
              <div class="flex gap-2">
                <Button @click="prevPageCallback" :disabled="page === 0" variant="outlined" severity="secondary" icon="fi-rr-angle-small-left text-lg!" class="size-8! shadow-xs" />
                <Button @click="nextPageCallback" :disabled="page === pageCount - 1 || totalRecords === 0" variant="outlined" severity="secondary" icon="fi-rr-angle-small-right text-lg!" class="size-8! shadow-xs" />
              </div>
              <span class="text-sm text-slate-600 dark:text-slate-400">
                {{ totalRecords > 0 ? first : 0 }} - {{ last }} de {{ totalRecords }}
              </span>
            </div>
          </div>
        </template>
        <template #empty>No se encontraron registros.</template>
        <Column field="dependencia" header="Dependencia" class="whitespace-nowrap" />
        <Column header="Total de bienes (% / Neto)">
          <template #body="{ data }">
            <div class="flex items-baseline gap-2">
              <div 
                class="size-2 rounded-full"
                :class="parseFloat(data.p_bienes) >= 15 ? 'bg-emerald-500' : parseFloat(data.p_bienes) > 10 ? 'bg-amber-500' : 'bg-red-400'"
              ></div>
              <div class="flex flex-col whitespace-nowrap">
                <span class="font-medium">{{ data.p_bienes }}%</span>
                <span class="text-xs! text-slate-500">{{ data.total }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Muebles (% / Neto)">
          <template #body="{ data }">
            <div class="flex items-baseline gap-2">
              <div 
                class="size-2 rounded-full"
                :class="parseFloat(data.p_muebles) >= 60 ? 'bg-emerald-500' : parseFloat(data.p_muebles) > 30 ? 'bg-amber-500' : 'bg-red-400'"
              ></div>
              <div class="flex flex-col whitespace-nowrap">
                <span class="font-medium">{{ data.p_muebles }}%</span>
                <span class="text-xs! text-slate-500">{{ data.muebles }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Tecnológicos (% / Neto)">
          <template #body="{ data }">
            <div class="flex items-baseline gap-2">
              <div 
                class="size-2 rounded-full"
                :class="parseFloat(data.p_tecnologicos) >= 40 ? 'bg-emerald-500' : parseFloat(data.p_tecnologicos) > 20 ? 'bg-amber-500' : 'bg-red-400'"
              ></div>
              <div class="flex flex-col whitespace-nowrap">
                <span class="font-medium">{{ data.p_tecnologicos }}%</span>
                <span class="text-xs! text-slate-500">{{ data.tecnologicos }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Vehículos (% / Neto)">
          <template #body="{ data }">
            <div v-if="data.vehiculos !== '0'" class="flex items-baseline gap-2">
              <div class="flex flex-col whitespace-nowrap">
                <span class="font-medium">{{ data.p_vehiculos }}%</span>
                <span class="text-xs! text-slate-500">{{ data.vehiculos }}</span>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>