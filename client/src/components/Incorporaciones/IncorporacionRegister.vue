<script setup>
import { ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { obtenerHoy, obtenerFinAnio, formatearMonto } from '@/utils/formatters.js';
import { listarDependenciasConResponsables, listarBienesNoAsignados, listarPresupuestosActivos } from '@/utils/fetch.utils.js';
import { incorporacionSchema, motivos } from '@/utils/incorporaciones.utils.js';
import MoneyInput from '@/components/MoneyInput.vue';

const visible = defineModel('visible');
const emit = defineEmits(['register']);
const resolver = zodResolver(incorporacionSchema);
const minDate = obtenerHoy();
const maxDate = obtenerFinAnio();

const initialFormState = {
  motivo: '',
  fecha_entrada: '',
  orden_compra: '',
  factura: '',
  proveedor: '',
  dependencia: null,
  bienes: []
};

const incorporacion = ref({ ...initialFormState });
const bienesSeleccionados = ref([]);

const resetForm = () => {
  incorporacion.value = { ...initialFormState };
  bienesSeleccionados.value = [];
};

const eliminarBien = (id) => {
  bienesSeleccionados.value = bienesSeleccionados.value.filter(b => b.id !== id);
};

const onFormSubmit = (e) => {

  if (!e.valid) return;
  const { bienes, dependencia, ...datos } = e.values;

  const payload = {
    ...datos,
    responsable: dependencia?.idr,
    dependencia: dependencia?.id,
    bienes: bienesSeleccionados.value.map(b => ({
      id_bien: b.id,
      id_presupuesto: b.id_presupuesto ?? null, 
      gasto: Number(b.gasto) || 0,
    }))
  };
  
  emit('register', payload);
  visible.value = false;
  resetForm();
};


// --- Operaciones con la API (SELECTORES) ---
const dependencias = ref([]);
const presupuestos = ref([]);
const bienes = ref([]);

watch(visible, async(isOpen) => {
  if (isOpen) {
    [dependencias.value, bienes.value, presupuestos.value] = await Promise.all([
      listarDependenciasConResponsables(),
      listarBienesNoAsignados(),
      listarPresupuestosActivos()
    ]);
    return;
  }
  resetForm();
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-212!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-apps-add"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registrar incorporación</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :initialValues="incorporacion" :resolver="resolver" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Datos del Registro</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Dependencia y Responsable <span class="text-red-500">*</span></span>
          <Select
            name="dependencia"
            :options="dependencias"
            optionLabel="nombre"
            :filterFields="['nombre', 'responsable', 'cedula']"
            placeholder="Seleccione"
            size="small"
            fluid filter
          >
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
          <Message v-if="$form.dependencia?.invalid" severity="error" size="small" variant="simple">
            {{ $form.dependencia.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fecha_entrada">Fecha de entrada <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha_entrada"
            inputId="fecha_entrada"
            updateModelType="string"
            :manualInput="false"
            :minDate="minDate" 
            :maxDate="maxDate"
            size="small"
            fluid showIcon
          />
          <Message v-if="$form.fecha_entrada?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha_entrada.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Motivo <span class="text-red-500">*</span></span>
          <Select name="motivo" :options="motivos" placeholder="Selecione" size="small" fluid editable />
          <Message v-if="$form.motivo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.motivo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="orden_compra">Orden de compra</label>
          <InputText name="orden_compra" id="orden_compra" maxlength="25" autocomplete="off" size="small" fluid />
          <Message v-if="$form.orden_compra?.invalid" severity="error" size="small" variant="simple">
            {{ $form.orden_compra.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="factura">Factura</label>
          <InputText name="factura" id="factura" maxlength="30" autocomplete="off" size="small" fluid />
          <Message v-if="$form.factura?.invalid" severity="error" size="small" variant="simple">
            {{ $form.factura.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="proveedor">Proveedor</label>
          <InputText name="proveedor" id="proveedor" maxlength="50" autocomplete="off" size="small" fluid />
          <Message v-if="$form.proveedor?.invalid" severity="error" size="small" variant="simple">
            {{ $form.proveedor.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Detalle de bienes</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
        <div class="sm:col-span-1 col-span-2 flex flex-col gap-1">
          <span>Seleccionar Bienes <span class="text-red-500">*</span></span>
          <MultiSelect
            name="bienes"
            v-model="bienesSeleccionados"
            :options="bienes" optionLabel="descripcion"
            :filterFields="['descripcion', 'numero']"
            :placeholder="bienes.length === 0 ? 'No hay bienes disponibles' : 'Buscar bienes'"
            :disabled="bienes.length === 0"
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
                  <span class="text-xs! opacity-80">{{ data.marca }} - {{ data.modelo }}</span>
                </div>
              </template>
            </Column>
            <Column header="Gasto (Opcional)" style="max-width: 10rem">
              <template #body="{ data }">
                <MoneyInput v-model="data.gasto" currency="USD" />
              </template>
            </Column>
            <Column header="Partida Presupuestaria" style="max-width: 15rem">
              <template #body="{ data }">
                <Select v-model="data.id_presupuesto" :options="presupuestos" optionLabel="tipo" optionValue="id" placeholder="Seleccione" size="small" class="w-full" showClear>
                  <template #option="slotProps">
                    <div class="flex flex-col">
                      <span>{{ slotProps.option.tipo }}</span>
                      <span class="text-xs! opacity-80">Disponible: ${{ formatearMonto(slotProps.option.total_disponible) }}</span>
                    </div>
                  </template>
                </Select>
              </template>
            </Column>
            <Column header="">
              <template #body="{ data }">
                <Button  @click="eliminarBien(data.id)" icon="fi-rr-trash" severity="danger" outlined size="small" class="size-8!" />
              </template>
            </Column>
          </DataTable>
          <div class="flex justify-between items-center py-2 px-4 text-slate-500 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-850">
            <span class="text-xs! text-slate-500 dark:text-slate-400">Total de bienes a incorporar</span>
            <span class="font-semibold! text-slate-700 dark:text-slate-200">{{ bienesSeleccionados.length }}</span>
          </div>
        </div>

        <div v-else class="col-span-2 p-8 text-center rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800">
          <span class="text-sm">Seleccione los bienes a incorporar...</span>
        </div>
      </div>
      <div class="pt-6 flex justify-end gap-3">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>