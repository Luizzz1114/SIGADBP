<script setup>
import { ref, watch, computed } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { obtenerHoy, obtenerFinAnio } from '@/utils/formatters.js';
import { listarDependenciasConResponsables, listarBienesOperativos, listarPersonal } from '@/utils/fetch.utils.js';
import { movimientoSchema, tiposMovimiento } from '@/utils/movimientos.utils.js';

const visible = defineModel('visible');
const emit = defineEmits(['register']);
const resolver = zodResolver(movimientoSchema);
const minDate = obtenerHoy();
const maxDate = obtenerFinAnio();

const initialFormState = {
  tipo: '',
  fecha: '',
  motivo: '',
  origen: null,
  destino: null,
  nuevoResponsable: null,
  bienes: []
};

const movimiento = ref({ ...initialFormState });
const bienesSeleccionados = ref([]);

const resetForm = () => {
  movimiento.value = { ...initialFormState };
  bienesSeleccionados.value = [];
};

const eliminarBien = (id) => {
  bienesSeleccionados.value = bienesSeleccionados.value.filter(b => b.id !== id);
};

const onFormSubmit = (e) => {
  if (!e.valid) return;

  const { bienes, origen, destino, nuevoResponsable, ...datos } = e.values;
  const esTraslado = datos.tipo === 'Traslado';

  const payload = {
    ...datos,
    origen: origen?.id,
    cedente: origen?.idr,
    destino: esTraslado ? destino?.id : origen?.id, 
    receptor: esTraslado ? destino?.idr : nuevoResponsable?.id, 
    bienes: bienesSeleccionados.value.map(b => ({
      id_bien: b.id
    }))
  };
  
  emit('register', payload);
  visible.value = false;
  resetForm();
};


// --- Operaciones con la API ---
const dependencias = ref([]);
const bienes = ref([]);
const personal = ref([]);
const origenSeleccionado = ref(null);

watch(visible, async(isOpen) => {
  if (isOpen) {
    dependencias.value = await listarDependenciasConResponsables();
    personal.value = await listarPersonal();
    return;
  }
  resetForm();
});

const onChangeOrigen = async (event) => {
  const dependencia = event.value;
  origenSeleccionado.value = dependencia; 
  bienesSeleccionados.value = []; 
  
  if (dependencia?.id) {
    const data = await listarBienesOperativos();
    bienes.value = data.filter(b => b.idd === dependencia.id);
  } else {
    bienes.value = [];
  }
};

const dependenciasDestino = computed(() => {
  if (!origenSeleccionado.value) return dependencias.value;
  return dependencias.value.filter(dep => dep.id !== origenSeleccionado.value.id);
});

const personalDisponible = computed(() => {
  if (!origenSeleccionado.value) return personal.value;
  return personal.value.filter(persona => persona.id !== origenSeleccionado.value.idr);
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-212!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-priority-arrows rotate-90!"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registro de Movimiento</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :initialValues="movimiento" :resolver="resolver" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2 mt-4">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Datos del Movimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Tipo de Movimiento <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposMovimiento" placeholder="Seleccione" size="small" fluid />
          <Message v-if="$form.tipo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.tipo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fecha">Fecha <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha"
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
          <span>Dependencia (Origen / Actual) <span class="text-red-500">*</span></span>
          <Select @change="(e) => onChangeOrigen(e, $form)" name="origen" :options="dependencias" placeholder="Seleccione" size="small" fluid filter>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ slotProps.option.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.option.responsable }} - CI: {{ slotProps.option.cedula}}</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula}}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Select>
          <Message v-if="$form.origen?.invalid" severity="error" size="small" variant="simple">
            {{ $form.origen.error?.message }}
          </Message>
        </div>
        <div v-if="$form.tipo?.value === 'Traslado'" class="flex flex-col gap-1">
          <span>Dependencia Destino <span class="text-red-500">*</span></span>
          <Select name="destino" :options="dependenciasDestino" placeholder="Seleccione Destino" size="small" fluid filter>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ slotProps.option.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.option.responsable }} - CI: {{ slotProps.option.cedula}}</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombre }}</span>
                <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula}}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Select>
          <Message v-if="$form.destino?.invalid" severity="error" size="small" variant="simple">
            {{ $form.destino.error?.message }}
          </Message>
        </div>
        <div v-if="$form.tipo?.value === 'Cambio de responsable'" class="flex flex-col gap-1">
          <span>Nuevo Responsable (Receptor) <span class="text-red-500">*</span></span>
          <Select name="nuevoResponsable" :options="personalDisponible" placeholder="Seleccione la persona" size="small" fluid filter>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ slotProps.option.nombres }} {{ slotProps.option.apellidos }}</span>
                <span class="text-xs! opacity-80">CI: {{ slotProps.option.cedula }}</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col">
                <span>{{ slotProps.value.nombres }} {{ slotProps.value.apellidos }}</span>
                <span class="text-xs! opacity-80">CI: {{ slotProps.value.cedula }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Select>
          <Message v-if="$form.nuevoResponsable?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nuevoResponsable.error?.message }}
          </Message>
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
            :options="bienes"
            optionLabel="descripcion"
            :placeholder="!$form.origen?.value ? 'Seleccione el origen primero' : (bienes.length === 0 ? 'No hay bienes disponibles' : 'Buscar bienes')"
            :disabled="!$form.origen?.value || bienes.length === 0"
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
                  <span class="text-xs! text-slate-500">{{ data.marca }} - {{ data.modelo }}</span>
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
            <span class="text-xs! text-slate-500 dark:text-slate-400">Total de bienes en movimiento</span>
            <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ bienesSeleccionados.length }}</span>
          </div>
        </div>
        <div v-else class="col-span-2 p-8 text-center rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-750">
          <span class="text-sm">Seleccione los bienes a mover...</span>
        </div>
      </div>

      <div class="pt-6 flex justify-end gap-3">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>