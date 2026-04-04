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
    <div class="flex items-center gap-3 px-3 pt-3 pb-1">
      <div class="grid place-items-center shrink-0 size-9 text-lg rounded-lg bg-blue-100 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
        <i class="fi-rr-building"></i>
      </div>
      <span class="font-bold text-base leading-tight dark:text-slate-50">Distribución de bienes por dependencia</span>
    </div>

    <div class="px-3 pb-3">
      <Tabs value="resumen">
        <TabList>
          <Tab value="resumen">
            <div class="flex items-center gap-2 font-medium">
              <i class="fi-rr-bars-progress"></i>
              Resumen General
            </div>
          </Tab>
          <Tab value="desglose">
            <div class="flex items-center gap-2 font-medium">
              <i class="fi-rr-table-list"></i>
              Desglose por Categorías
            </div>
          </Tab>
        </TabList>

        <TabPanels class="p-0 pt-3 bg-transparent!">
          
          <TabPanel value="resumen">
            <DataTable :value="data" paginator :rows="5" size="small" tableStyle="min-width: 100%" class="mt-3!">
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
              <template #empty><div class="p-3 text-center text-slate-500">No se encontraron registros.</div></template>
              <Column field="dependencia" header="Dependencia" bodyClass="h-10!" class="whitespace-nowrap text-slate-700 dark:text-slate-200 w-1/2" />
              <Column header="Total de bienes asignados">
                <template #body="{ data }">
                  <div v-if="Number(data.total) > 0" class="flex flex-col w-full max-w-50">
                    <div class="flex items-baseline justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-100">{{ data.total }}</span>
                      <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ data.p_bienes }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-700 bg-blue-400"
                        :style="{ width: `${Math.min(parseFloat(data.p_bienes), 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <TabPanel value="desglose">
            <DataTable :value="data" paginator :rows="5" size="small" tableStyle="min-width: 100%" class="mt-3!">
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
              <template #empty><div class="p-3 text-center text-slate-500">No se encontraron registros.</div></template>
              <Column field="dependencia" header="Dependencia" bodyClass="h-10!" class="whitespace-nowrap text-slate-700 dark:text-slate-200 w-1/2" />
              <Column header="Muebles" style="width: 175px; min-width: 150px;">
                <template #body="{ data }">
                  <div v-if="Number(data.muebles) > 0" class="flex flex-col w-full max-w-28">
                    <div class="flex items-baseline justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-100">{{ data.muebles }}</span>
                      <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ data.p_muebles }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full bg-emerald-400"
                        :style="{ width: `${Math.min(parseFloat(data.p_muebles), 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </template>
              </Column>
              <Column header="Tecnológicos" style="width: 175px; min-width: 150px;">
                <template #body="{ data }">
                  <div v-if="Number(data.tecnologicos) > 0" class="flex flex-col w-full max-w-28">
                    <div class="flex items-baseline justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-100">{{ data.tecnologicos }}</span>
                      <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ data.p_tecnologicos }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full bg-blue-400"
                        :style="{ width: `${Math.min(parseFloat(data.p_tecnologicos), 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </template>
              </Column>
              <Column header="Vehículos" style="width: 175px; min-width: 150px;">
                <template #body="{ data }">
                  <div v-if="Number(data.vehiculos) > 0" class="flex flex-col w-full max-w-28">
                    <div class="flex items-baseline justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-100">{{ data.vehiculos }}</span>
                      <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ data.p_vehiculos }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-slate-400" :style="{ width: `${Math.min(parseFloat(data.p_vehiculos), 100)}%` }"></div>
                    </div>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

  </div>
</template>