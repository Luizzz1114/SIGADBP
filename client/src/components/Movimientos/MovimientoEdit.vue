<script setup>
import { computed, ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { formatearFecha, obtenerFinAnio } from '@/utils/formatters.js';
import { listarBienesOperativos } from '@/utils/fetch.utils.js';
import { movimientoSchema, tiposMovimiento } from '@/utils/movimientos.utils.js';

const visible = defineModel('visible');
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  movimiento: {
    type: Object,
    default: () => ({})
  }
});

const maxDate = obtenerFinAnio();
const minDate = computed(()=> {
  return formatearFecha(props.movimiento?.fecha);
});

const resolver = ({ values }) => {
  return zodResolver(movimientoSchema)({
    values: {
      ...values,
      tipo: props.movimiento.tipo,
      origen: {
        id: props.movimiento.id_origen,
        idr: props.movimiento.id_cedente 
      },
      destino: props.movimiento.tipo === 'Traslado' 
        ? { id: props.movimiento.id_destino } 
        : null,
      nuevoResponsable: props.movimiento.tipo === 'Cambio de responsable' 
        ? { id: props.movimiento.id_receptor } 
        : null,
      bienes: bienesSeleccionados.value
    }
  });
};

const bienesSeleccionados = ref([]);
const bienesDisponibles = ref([]);

const eliminarBien = (id) => {
  const index = bienesSeleccionados.value.findIndex(b => b.id === id);
  if (index !== -1) {
    bienesSeleccionados.value.splice(index, 1);
  }
};

const onFormSubmit = (e) => {
  if (!e.valid) return;

  const { fecha, motivo } = e.values;

  const payload = {
    id: props.movimiento.id,
    tipo: props.movimiento.tipo,
    fecha,
    motivo,
    origen: props.movimiento.id_origen,
    cedente: props.movimiento.id_cedente,
    destino: props.movimiento.id_destino, 
    receptor: props.movimiento.id_receptor, 
    bienes: bienesSeleccionados.value.map(b => ({
      id_bien: b.id
    }))
  };
  
  emit('confirmEdit', payload);
  visible.value = false;
  bienesSeleccionados.value = [];
};


watch(visible, async(isOpen) => {
  if (isOpen) {
    let bs = [];
    if (props.movimiento.id_origen) {
      const data = await listarBienesOperativos();
      bs = data.filter(b => b.idd === props.movimiento.id_origen);
    }

    const bienesActuales = props.movimiento.bienes || [];
    bienesSeleccionados.value = [...bienesActuales];

    const idsExistentes = new Set(bienesSeleccionados.value.map(b => b.id));
    bienesDisponibles.value = [
      ...bienesSeleccionados.value,
      ...bs.filter(b => !idsExistentes.has(b.id))
    ];

  } else {
    bienesSeleccionados.value = [];
    bienesDisponibles.value = [];
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-212!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-edit"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar Movimiento</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :initialValues="movimiento" :resolver="resolver" :key="movimiento?.id" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2 mt-4">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Datos del Movimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Tipo de Movimiento <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposMovimiento" placeholder="Seleccione" dropdownIcon="false" size="small" fluid disabled readonly />
        </div>
        <div class="flex flex-col gap-1">
          <label for="fecha">Fecha <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha"
            :model-value="$form.fecha?.value"
            inputId="fecha"
            updateModelType="string"
            :minDate="minDate" 
            :maxDate="maxDate"
            :manualInput="false"
            size="small"
            fluid showIcon
          />
          <Message v-if="$form.fecha?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <span>Dependencia (Origen) <span class="text-red-500">*</span></span>
          <Select :model-value="{ nombre: props.movimiento.dependencia_origen, responsable: props.movimiento.cedente, cedula: props.movimiento.cedula_cedente }" disabled readonly dropdownIcon="false" size="small" fluid>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula}}</span>
              </div>
            </template>
          </Select>
        </div>

        <div v-if="props.movimiento.tipo === 'Traslado'" class="flex flex-col gap-1">
          <span>Dependencia Destino <span class="text-red-500">*</span></span>
          <Select :model-value="{ nombre: props.movimiento.dependencia_destino, responsable: props.movimiento.receptor, cedula: props.movimiento.cedula_receptor }" disabled readonly dropdownIcon="false" size="small" fluid>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula}}</span>
              </div>
            </template>
          </Select>
        </div>

        <div v-if="props.movimiento.tipo === 'Cambio de responsable'" class="flex flex-col gap-1">
          <span>Nuevo Responsable (Receptor) <span class="text-red-500">*</span></span>
          <Select :model-value="{ nombres: props.movimiento.receptor, cedula: props.movimiento.cedula_receptor }" disabled readonly dropdownIcon="false" size="small" fluid>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombres }}</span>
                <span class="text-xs! opacity-80">CI: {{ slotProps.value.cedula }}</span>
              </div>
            </template>
          </Select>
        </div>

        <div class="flex flex-col gap-1 col-span-full">
          <div class="flex justify-between items-center">
            <label for="motivo">Motivo del movimiento</label>
            <span class="text-slate-400 dark:text-slate-500 text-xs!">
              {{ $form.motivo?.value?.length || 0 }}/150
            </span>
          </div>
          <Textarea name="motivo" id="motivo" maxlength="150" autocomplete="off" size="small" fluid class="h-20!" />
          <Message v-if="$form.motivo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.motivo.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Bienes en movimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
        <div class="sm:col-span-1 col-span-2 flex flex-col gap-1">
          <span>Seleccionar Bienes <span class="text-red-500">*</span></span>
          <MultiSelect
            name="bienes"
            v-model="bienesSeleccionados"
            :options="bienesDisponibles" optionLabel="descripcion"
            :filterFields="['descripcion', 'numero']"
            placeholder="Buscar bienes"
            display="chip" size="small"
            fluid filter
          >
            <template #chip="slotProps">
              <div class="flex items-center px-2 rounded-sm bg-slate-100 dark:bg-slate-700">
                <span>{{ slotProps.value.descripcion }}</span>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ slotProps.option.descripcion }}</span>
                <span class="text-xs! opacity-80">Nro: {{ slotProps.option.numero }}</span>
              </div>
            </template>
          </MultiSelect>
          <Message v-if="$form.bienes?.invalid" severity="error" size="small" variant="simple">
            {{ $form.bienes.error?.message }}
          </Message>
        </div>
        
        <div v-if="bienesSeleccionados.length > 0" class="sm:col-span-2">
          <DataTable :value="bienesSeleccionados" scrollable scrollHeight="250px" size="small" tableStyle="min-width: 100%" stripedRows>
            <Column field="numero" header="Número">
              <template #body="{ data }">
                <span class="px-1 whitespace-nowrap rounded border border-slate-150 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ data.numero }}
                </span>
              </template>
            </Column>
            <Column field="descripcion" header="Descripción">
              <template #body="{ data }">
                <div class="flex flex-col whitespace-nowrap">
                  <span class="font-medium">{{ data.descripcion }}</span>
                  <span class="text-xs! opacity-80">{{ data.marca }} - {{ data.modelo }}</span>
                </div>
              </template>
            </Column>
            <Column header="" style="width: 4rem; text-align: center">
              <template #body="{ data }">
                <Button @click="eliminarBien(data.id)" icon="fi-rr-trash" severity="danger" outlined size="small" class="size-8!" />
              </template>
            </Column>
          </DataTable>
          <div class="flex justify-between items-center py-2 px-4 text-slate-500 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-750">
            <span class="text-xs! opacity-75 dark:text-slate-400">Total de bienes en movimiento</span>
            <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ bienesSeleccionados.length }}</span>
          </div>
        </div>
        <div v-else class="col-span-2 p-8 text-center rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-750">
          <span class="text-sm">Seleccione los bienes a mover...</span>
        </div>
      </div>

      <div class="pt-6 flex justify-end gap-3">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Actualizar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>