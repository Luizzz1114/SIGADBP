<script setup>
import { ref, watch } from 'vue';
import MoneyInput from '@/components/MoneyInput.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createPresupuestoSchema, tiposPresupuestos, obtenerOpcionesSemestre, montoCalculadoBs } from '@/utils/presupuestos.utils';
import presupuestosServices from '@/services/presupuestos.services';

const visible = defineModel('visible');
const emit = defineEmits(['register']);
const presupuestoSchema = createPresupuestoSchema();
const resolver = ref(zodResolver(presupuestoSchema));
const currentYear = new Date().getFullYear().toString();
const opcionesSemestre = obtenerOpcionesSemestre();
const formKey = ref(0);

const presupuesto = ref({
  codigo: '',
  anio: currentYear,
  semestre: '',
  tipo: '',
  montousd: 0,
  montobs: 0,
  tasacambio: 0,
  descripcion: '',
});

const onFormSubmit = ({ valid, values, reset }) => {
  if (!valid) return;
  const finalValues = {
    ...values,
    montobs: montoCalculadoBs(values.montousd, values.tasacambio)
  };
  emit('register', finalValues);
  visible.value = false;
  reset();
}

// --- Obtener tasa del dolar BCV ---
const cargarTasaDolar = async () => {
  try {
    const data = await presupuestosServices.obtenerDolarOficial();
    if (data.promedio) {
      presupuesto.value.tasacambio = data.promedio;
      formKey.value++;
    }
  } catch (error) {
    console.error('Error al obtener la tasa de cambio: ', error);
    presupuesto.value.tasacambio = 0;
  }
};

// --- Watch ---
watch(visible, async(isOpen) => {
  if (isOpen) {
    await cargarTasaDolar();
  } else {
    presupuesto.value.montousd = 0;
    presupuesto.value.tasacambio = 0;
    presupuesto.value.montobs = 0;
  }
});

watch([() => presupuesto.value.montousd, () => presupuesto.value.tasacambio], ([usd, tasa]) => {
  presupuesto.value.montobs = montoCalculadoBs(usd, tasa);
}, { immediate: true });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-piggy-bank"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registrar presupuesto</span>
        </div>
      </div>
    </template>
    <Form :key="formKey" v-slot="$form" :resolver="resolver" :initialValues="presupuesto" @submit="onFormSubmit">
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Datos del Registro</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <label for="codigo">Código de la partida <span class="text-red-500">*</span></label>
          <InputText name="codigo" id="codigo" v-keyfilter.num maxlength="12" autocomplete="off" size="small" fluid />
          <Message v-if="$form.codigo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.codigo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Tipo de presupuesto <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposPresupuestos" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.tipo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.tipo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="anio">Año fiscal <span class="text-red-500">*</span></label>
          <InputText name="anio" id="anio" size="small" fluid readonly />
        </div>
        <div class="flex flex-col gap-1">
          <span>Semestre <span class="text-red-500">*</span></span>
          <Select 
            name="semestre" 
            :options="opcionesSemestre" 
            optionLabel="label" 
            optionValue="value"
            optionDisabled="disabled" 
            placeholder="Seleccione un semestre" 
            size="small" 
            fluid 
          />
          <Message v-if="$form.semestre?.invalid" severity="error" size="small" variant="simple">
            {{ $form.semestre.error?.message }}
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
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Desglose Financiero</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <MoneyInput
          name="montousd"
          label="Monto asignado (USD)"
          currency="USD"
          v-model="presupuesto.montousd"
          :error="$form.montousd?.error?.message"
        />

        <MoneyInput 
          name="tasacambio"
          label="Tasa de cambio"
          currency="VES"
          v-model="presupuesto.tasacambio"
          :error="$form.tasacambio?.error?.message"
        />

        <MoneyInput 
          name="montobs"
          label="Monto en Bs."
          currency="VES"
          v-model="presupuesto.montobs"
          :error="$form.montobs?.error?.message"
          disabled
          message="Calculado según la tasa de cambio"
        />
      </div>
      
      <div class="flex pt-6 justify-end gap-4 mt-0">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" type="button" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>