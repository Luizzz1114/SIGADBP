<script setup>
import { ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { formatearMonto, obtenerHoy, obtenerFinAnio } from '@/utils/formatters';
import { mantenimientoSchema, tiposMantenimiento } from '@/utils/mantenimiento.utils.js';
import bienesServices from '@/services/bienes.services';
import presupuestosServices from '@/services/presupuestos.services';

const visible = defineModel('visible');
const emit = defineEmits(['register']);
const resolver = ref(zodResolver(mantenimientoSchema));
const minDate = obtenerHoy();
const maxDate = obtenerFinAnio();

const mantenimiento = ref({ 
  bien: null,
  tipo: '',
  descripcion: '',
  fecha_inicio: '',
  gasto: 0,
  presupuesto: null,
});

const onFormSubmit = ({ valid, values, reset }) => {
  if (valid) {
    emit('register', values);
    visible.value = false;
    reset();
  }
}

// --- Operaciones con la API ---
const bienes = ref([]);
const presupuestos = ref([]);

watch(visible, async(isOpen) => {
  if (isOpen) {
    [bienes.value, presupuestos.value] = await Promise.all([
      bienesServices.listarOperativos(),
      presupuestosServices.listarActivosMantenimiento(),
    ]);
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" :dismissable="false" position="right" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-screw-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Programar mantenimiento</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="mantenimiento" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Detalles del mantenimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Bien <span class="text-red-500">*</span></span>
          <Select
            name="bien"
            :options="bienes"
            optionLabel="descripcion"
            optionValue="id"
            placeholder="Seleccione"
            size="small" fluid
            filter :filterFields="['descripcion', 'numero']"
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
          </Select>
          <Message v-if="$form.bien?.invalid" severity="error" size="small" variant="simple">
            {{ $form.bien.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Tipo de mantenimiento <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposMantenimiento" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.tipo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.tipo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1 col-span-full">
          <div class="flex justify-between items-center">
            <label for="descripcion">Descripción <span class="text-red-500">*</span></label>
            <span class="text-slate-400 dark:text-slate-500 text-xs!">
              {{ $form.descripcion?.value?.length || 0 }}/50
            </span>
          </div>
          <Textarea name="descripcion" id="descripcion" maxlength="50" autocomplete="off" size="small" fluid class="h-20!" />
          <Message v-if="$form.descripcion?.invalid" severity="error" size="small" variant="simple">
            {{ $form.descripcion.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fecha_inicio">Fecha programada <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha_inicio"
            inputId="fecha_inicio"
            updateModelType="string"
            :minDate="minDate" 
            :maxDate="maxDate"
            :manualInput="false" 
            size="small"
            fluid showIcon
          />
          <Message v-if="$form.fecha_inicio?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha_inicio.error?.message }}
          </Message> 
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Costo del mantenimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <MoneyInput 
          name="gasto"
          label="Gasto"
          currency="USD"
          :required="false"
          :error="$form.gasto?.error?.message"
        />
        <div class="flex flex-col gap-1">
          <span>Partida presupuestaria</span>
          <Select name="presupuesto" :options="presupuestos" optionLabel="tipo" optionValue="id" placeholder="Seleccione" size="small" fluid showClear>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ slotProps.option.tipo }}</span>
                <span class="text-xs! opacity-80">Disponible: ${{ formatearMonto(slotProps.option.total_disponible) }}</span>
              </div>
            </template>
          </Select>
          <Message v-if="$form.presupuesto?.invalid" severity="error" size="small" variant="simple">
            {{ $form.presupuesto.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex pt-6 justify-end gap-4 mt-0">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>