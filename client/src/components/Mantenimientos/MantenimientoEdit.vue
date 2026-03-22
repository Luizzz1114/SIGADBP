<script setup>
import { computed, ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { formatearFecha, formatearMonto, obtenerHoy, obtenerFinAnio } from '@/utils/formatters';
import { mantenimientoSchema, tiposMantenimiento, estatusMantenimiento, estadosPosteriores } from '@/utils/mantenimiento.utils.js';
import presupuestosServices from '@/services/presupuestos.services';

const visible = defineModel('visible');
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  mantenimiento: {
    type: Object,
    default: () => ({})
  }
});

const maxDate = obtenerFinAnio();
const minDate = obtenerHoy();
const minDateEdit = computed(()=> {
  return formatearFecha(props.mantenimiento?.fecha_inicio);
});

const initialValues = computed(() => {
  const mantenimiento = props.mantenimiento;
  return {
    ...mantenimiento,
    bien: mantenimiento.id_bien,
    presupuesto: mantenimiento.id_presupuesto
  };
});

const resolver = ({ values }) => {
  return zodResolver(mantenimientoSchema)({
    values: { ...values, id: props.mantenimiento?.id }
  });
};

const onEstatusChange = (event, form) => {
  if (event.value === 'En proceso') {
    form.fecha_fin.value = null;
    form.estado_posterior.value = null;
  }
}

const onFormSubmit = ({ valid, values, reset }) => {
  if (valid) {
    emit('confirmEdit', values);
    visible.value = false;
    reset();
  }
}

// --- Operaciones con la API
const presupuestos = ref([]);

watch(visible, async(isOpen) => {
  if(isOpen) {
    presupuestos.value = await presupuestosServices.listarActivosMantenimiento();
  }
});

const estatusDisponibles = computed(() => {
  const estatusActual = props.mantenimiento?.estatus;
  if (estatusActual === 'Finalizado' || estatusActual === 'Cancelado') {
    return estatusMantenimiento.filter(estatus => estatus !== 'En proceso');
  }
  return estatusMantenimiento;
})
</script>

<template>
  <Drawer v-model:visible="visible" :dismissable="false" position="right" class="w-full! md:w-180!">
<template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-screw-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar mantenimiento</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2 mt-6">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Detalles del mantenimiento</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Bien <span class="text-red-500">*</span></span>
          <Select name="bien" :options="[]" placeholder="Seleccione" dropdownIcon="false"  size="small" fluid disabled>
            <template #value>
              <div v-if="props.mantenimiento">
                {{ props.mantenimiento.descripcion_bien }} - Código: {{ props.mantenimiento.numero_bien }}
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
          <label for="fecha_inicio">Fecha de inicio <span class="text-red-500">*</span></label>
          <DatePicker
            name="fecha_inicio"
            :model-value="$form.fecha_inicio?.value"
            inputId="fecha_inicio"
            updateModelType="string"
            :minDate="minDateEdit" 
            :maxDate="maxDate"
            :manualInput="false"
            size="small"
            fluid showIcon
          />
          <Message v-if="$form.fecha_inicio?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha_inicio.error?.message }}
          </Message> 
        </div>

        <div class="flex flex-col gap-1">
          <span>Estatus <span class="text-red-500">*</span></span>
          <Select name="estatus" :options="estatusDisponibles" placeholder="Seleccione" size="small" fluid @change="(e) => onEstatusChange(e, $form)" />
          <Message v-if="$form.estatus?.invalid" severity="error" size="small" variant="simple">
            {{ $form.estatus.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fecha_fin">Fecha de finalización</label>
          <DatePicker
            name="fecha_fin"
            :model-value="$form.fecha_fin?.value"
            inputId="fecha_fin"
            updateModelType="string"
            :manualInput="false"
            :minDate="minDate"
            :maxDate="maxDate"
            size="small"
            fluid showIcon
            :disabled="$form.estatus?.value === 'En proceso'"
          />
          <Message v-if="$form.fecha_fin?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fecha_fin.error?.message }}
          </Message> 
        </div>
        <div class="flex flex-col gap-1">
          <span>Estado posterior al mantenimiento <span class="text-red-500">*</span></span>
          <Select name="estado_posterior" :options="estadosPosteriores" placeholder="Selecione" size="small" fluid :disabled="$form.estatus?.value === 'En proceso'" />
          <Message v-if="$form.estado_posterior?.invalid" severity="error" size="small" variant="simple">
            {{ $form.estado_posterior.error?.message }}
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
          :model-value="mantenimiento.gasto"
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
        <Button label="Actualizar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>