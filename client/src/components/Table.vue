<script setup>
import { ref, inject, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import Cell from '@/components/Cell.vue';

const props = defineProps({
  data: Array,
  columns: Array,
  globalFilterFields: Array,
  headerFilters: { type: Array, default: () => [] },
});

const emit = defineEmits(['view', 'edit', 'delete']);
const optionView = inject('optionView', true);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

if (props.headerFilters) {
  props.headerFilters.forEach(filter => {
    filters.value[filter.field] = { 
      matchMode: filter.matchMode || FilterMatchMode.EQUALS
    };
  });
}


const popupFilter = ref(null);
const toggleFilter = (event) => popupFilter.value.toggle(event);


const currentSortField = ref(null);
const currentSortOrder = ref(1);
const sortMenu = ref(null);

const sortMenuItems = computed(() => {
  return props.columns
    .filter(col => col.sortable)
    .map(col => ({
      label: col.header,
      icon: currentSortField.value === col.field ? 'fi-rr-check' : '', 
      command: () => currentSortField.value = col.field
    }));
});

const currentLabel = computed(() => {
  const col = props.columns.find(c => c.field === currentSortField.value);
  return col ? col.header : 'Ordenar por';
});


const rows = ref(5);
const first = ref(0);
const menu = ref(null);
const selectedItem = ref(null);

const toggleMenu = (event, data) => {
  selectedItem.value = data;
  menu.value.toggle(event);
};

const options = computed(() => [
  { 
    label: 'Ver detalles', 
    icon: 'fi-rr-eye',
    visible: optionView, 
    command: () => emit('view', selectedItem.value) 
  },
  { 
    label: 'Actualizar', 
    icon: 'fi-rr-pencil', 
    command: () => emit('edit', selectedItem.value) 
  },
  { separator: true },
  { 
    label: 'Eliminar', 
    icon: 'fi-rr-trash',
    class: 'menu-item-danger',
    command: () => emit('delete', selectedItem.value) 
  }
]);
</script>

<template>

  <DataTable
    :value="data"
    v-model:sortField="currentSortField"
    v-model:sortOrder="currentSortOrder"
    paginator :rows="rows"
    @page="e => first = e.first"
    v-model:filters="filters"
    :globalFilterFields="globalFilterFields"
    stripedRows
  >

    <template #header>
      <div class="flex flex-wrap justify-start items-center gap-4">

        <!-- Buscador -->
        <IconField>
          <InputIcon>
            <i class="fi-rr-search"></i>
          </InputIcon>
          <InputText v-model="filters['global'].value" id="buscador" placeholder="Buscador" size="small" class="max-w-50 h-9!" autocomplete="off" />
        </IconField>

        <!-- Filtro -->
        <Button
          v-if="headerFilters.length > 0"
          type="button"
          icon="fi-rr-settings-sliders"
          label="Filtros"
          severity="secondary" 
          outlined
          @click="toggleFilter"
          class="h-9! shadow-xs"
        />
        <Popover ref="popupFilter">
          <div class="flex flex-col gap-2 w-64 p-1">
            <div v-for="filter in headerFilters" :key="filter.field" class="flex flex-col gap-1">
              <label :for="filter.field">{{ filter.placeholder }}</label>
              <Select 
                :id="filter.field"
                v-model="filters[filter.field].value" 
                :options="filter.options"
                placeholder="Seleccione" 
                showClear 
                fluid
                size="small"
              />
            </div>
          </div>
        </Popover>

        <!-- Ordenar por -->
        <ButtonGroup v-if="sortMenuItems.length > 0">
          <Button 
            type="button" 
            icon="fi-sr-bars-filter" 
            :label="currentLabel"
            severity="secondary" 
            outlined
            @click="(e) => sortMenu.toggle(e)" 
            class="h-9! shadow-xs"
          />
          <Button
            type="button" 
            :icon="currentSortOrder === 1 ? 'fi-rr-arrow-small-up text-lg!' : 'fi-rr-arrow-small-down text-lg!'" 
            severity="secondary"
            outlined 
            @click="currentSortOrder = currentSortOrder === 1 ? -1 : 1" 
            v-tooltip.top="currentSortOrder === 1 ? 'Descendente' : 'Ascendente'"
            class="size-9! shadow-xs"
            :disabled="currentSortField === null"
          />
          <Menu ref="sortMenu" :model="sortMenuItems" :popup="true" />
        </ButtonGroup>
      </div>
    </template>

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
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-600 dark:text-slate-400">Filas:</span>
          <Select v-model="rows" :options="[5, 10, 20]" size="small" class="h-9!" />
        </div>
      </div>
    </template>

    <template #empty>
      <div class="p-4 text-center text-slate-500">No se encontraron registros.</div>
    </template>

    <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
      <template #body="{ data }">
        <Cell :valor="data[col.field]" :tipo="col.type" :fila="data" />
      </template>
    </Column>

    <Column header="Acciones">
      <template #body="props">
        <button @click="toggleMenu($event, props.data)" type="button" class="h-7 w-7 rounded-md hover:bg-slate-100 duration-300 ease-in-out cursor-pointer dark:hover:bg-slate-800">
          <i class="fi-rr-menu-dots text-[0.95rem]"></i>
        </button>
      </template>
    </Column>

  </DataTable>

  <Menu ref="menu" :model="options" :popup="true" />

</template>