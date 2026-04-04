<script setup>
import { computed, ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { formatearFecha, obtenerFinAnio } from '@/utils/formatters.js';
import { listarBienesOperativos } from '@/utils/fetch.utils.js';
import { desincorporacionSchema, tiposDesincorporacion } from '@/utils/desincorporaciones.utils.js';

const visible = defineModel('visible');
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  desincorporacion: {
    type: Object,
    default: () => ({})
  }
});

const resolver = ({ values }) => {
  return zodResolver(desincorporacionSchema)({
    values: {
      ...values,
      bienes: bienesSeleccionados.value,
      dependencia: props.desincorporacion.idd
    }
  });
};

const maxDate = obtenerFinAnio();
const minDate = computed(()=> {
  return formatearFecha(props.desincorporacion?.fecha_salida);
});

// --- Estados ---
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

  const { descripcion, fecha_salida } = e.values;

  const payload = {
    id: props.desincorporacion.id,
    fecha_salida,
    descripcion,
    dependencia: props.desincorporacion.idd,
    responsable: props.desincorporacion.idp,
    bienes: bienesSeleccionados.value.map(b => ({
      id_bien: b.id,
      tipo: b.tipo_desincorporacion,
    }))
  };
  
  emit('confirmEdit', payload);
  visible.value = false;
  bienesSeleccionados.value = [];
};


// --- Operaciones con la API y Carga de Datos ---
watch(visible, async(isOpen) => {
  if (isOpen) {
    const bs = await listarBienesOperativos();
    
    const bienesActuales = props.desincorporacion.bienes || [];
    bienesSeleccionados.value = bienesActuales.map(b => ({
      ...b,
      id: b.id,
      tipo_desincorporacion: b.tipo_desincorporacion || null
    }));

    const idsExistentes = new Set(bienesSeleccionados.value.map(b => b.id));
    bienesDisponibles.value = [
      ...bienesSeleccionados.value,
      ...bs.filter(b => b.idd === props.desincorporacion.idd && !idsExistentes.has(b.id))
    ];
  } else {
    bienesSeleccionados.value = [];
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-212!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-red-500 text-white">
          <i class="fi-sr-apps-delete"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar desincorporación</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :initialValues="desincorporacion" :resolver="resolver" :key="desincorporacion?.id" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-1 text-xl text-red-400"></i>
        <span class="font-semibold">Datos del Registro</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        
        <div class="flex flex-col gap-1">
          <span>Dependencia y Responsable <span class="text-red-500">*</span></span>
          <Select :model-value="{ nombre: props.desincorporacion.dependencia, responsable: props.desincorporacion.responsable, cedula: props.desincorporacion.cedula }" disabled readonly dropdownIcon="false" size="small" fluid>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula}}</span>
              </div>
            </template>
          </Select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="fecha_salida">Fecha de salida <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha_salida"
            :model-value="$form.fecha_salida?.value"
            inputId="fecha_salida"
            updateModelType="string"
            :minDate="minDate" 
            :maxDate="maxDate"
            :manualInput="false"
            size="small"
            fluid showIcon
          />
          <Message v-if="$form.fecha_salida?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha_salida.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1 col-span-full">
          <div class="flex justify-between items-center">
            <label for="descripcion">Descripción</label>
            <span class="text-slate-400 dark:text-slate-500 text-xs!">
              {{ $form.descripcion?.value?.length || 0 }}/100
            </span>
          </div>
          <Textarea name="descripcion" id="descripcion" maxlength="100" autocomplete="off" size="small" fluid class="h-20!" />
          <Message v-if="$form.descripcion?.invalid" severity="error" size="small" variant="simple">
            {{ $form.descripcion.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-red-400"></i>
        <span class="font-semibold">Detalle de bienes</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
        <div class="sm:col-span-1 col-span-2 flex flex-col gap-1">
          <span>Seleccionar Bienes <span class="text-red-500">*</span></span>
          <MultiSelect
            name="bienes"
            dataKey="id"
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
                <span class="text-xs! text-slate-500">Nro: {{ slotProps.option.numero }}</span>
              </div>
            </template>
          </MultiSelect>
          <Message v-if="$form.bienes?.invalid" severity="error" size="small" variant="simple">
            {{ $form.bienes.error?.message }}
          </Message>
        </div>

        <div v-if="bienesSeleccionados.length > 0" class="sm:col-span-2">
          <DataTable :value="bienesSeleccionados" scrollable scrollHeight="300px" size="small" tableStyle="min-width: 100%" stripedRows>
            <Column field="numeroBien" header="Número">
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
                  <span class="text-xs! text-slate-500">{{ data.marca }} - {{ data.modelo }}</span>
                </div>
              </template>
            </Column>
            <Column header="Tipo de desincorporación" style="max-width: 15rem">
              <template #body="{ data }">
                <Select v-model="data.tipo_desincorporacion" :options="tiposDesincorporacion" placeholder="Seleccione" size="small" class="w-full" showClear />
              </template>
            </Column>
            <Column header="">
              <template #body="{ data }">
                <Button @click="eliminarBien(data.id)" icon="fi-rr-trash" severity="danger" outlined size="small" class="size-8!" />
              </template>
            </Column>
          </DataTable>
          <div class="flex justify-between items-center py-2 px-4 text-slate-500 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-800">
            <span class="text-xs! text-slate-500 dark:text-slate-400">Total de bienes a desincorporar</span>
            <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ bienesSeleccionados.length }}</span>
          </div>
        </div>

        <div v-else class="col-span-2 p-8 text-center rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-750">
          <span class="text-sm">Seleccione los bienes a desincorporar...</span>
        </div>
      </div>
      <div class="pt-6 flex justify-end gap-3">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Actualizar" type="submit" severity="danger" /> </div>
    </Form>
  </Drawer>
</template>