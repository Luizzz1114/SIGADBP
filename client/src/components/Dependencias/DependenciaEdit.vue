<script setup>
import { ref, computed, watch} from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createDependenciaSchema, tiposDependencias } from '@/utils/dependencias.utils.js';
import { listarEstados, listarMunicipiosPorEstado, listarParroquiasPorMunicipio } from '@/utils/fetch.utils.js';

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  dependencia: { 
    type: Object, 
    default: () => ({})
  }
});

const initialValues = computed(() => {
  const dependencia = props.dependencia;
  return {
    ...dependencia,
    estado: dependencia.ide,
    municipio: dependencia.idm,
    parroquia: dependencia.idp
  };
});

const dependenciaSchema = createDependenciaSchema();
const resolver = (options) => {
  return zodResolver(dependenciaSchema)({
    ...options,
    values: { 
      ...options.values, 
      id: props.dependencia?.id
    }
  });
};

const onFormSubmit = ({ valid, values, reset }) => {
  if (!valid) return; 
  emit('confirmEdit', values);
  visible.value = false;
  reset();
}

// --- Operaciones para los select de ubicación ---
const estados = ref([]);
const municipios = ref([]);
const parroquias = ref([]);

watch(() => visible.value, async (isOpen) => {
  if (isOpen && props.dependencia) {
    [estados.value, municipios.value, parroquias.value] = await Promise.all([
      listarEstados(),
      listarMunicipiosPorEstado(props.dependencia.ide),
      listarParroquiasPorMunicipio(props.dependencia.idm)
    ]);
  }
});

const onEstadoChange = async (event, form) => {
  const estado = event.value;
  municipios.value = [];
  parroquias.value = [];
  if (form.municipio) form.municipio.value = null;
  if (form.parroquia) form.parroquia.value = null;
  if (estado) {
    municipios.value = await listarMunicipiosPorEstado(estado);
  }
};

const onMunicipioChange = async (event, form) => {
  const municipio = event.value;
  parroquias.value = [];
  if (form.parroquia) form.parroquia.value = null;
  if (municipio) {
    parroquias.value = await listarParroquiasPorMunicipio(municipio);
  }
};
</script>

<template>
  <Drawer v-model:visible="visible" :dismissable="false" position="right" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-building"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar dependencia</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" :key="dependencia?.id" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2 mt-6">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Información básica</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <label for="nombre">Nombre de la dependencia <span class="text-red-500">*</span></label>
          <InputText name="nombre" id="nombre" maxlength="50" autocomplete="off" size="small" fluid />
          <Message v-if="$form.nombre?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nombre.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Tipo de dependencia <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposDependencias" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.tipo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.tipo.error?.message }}
          </Message>
        </div>
      </div>
      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Información de Ubicación</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1 col-span-full">
          <div class="flex justify-between items-center">
            <label for="direccion">Dirección <span class="text-red-500">*</span></label>
            <span class="text-slate-400 dark:text-slate-500 text-xs!">
              {{ $form.direccion?.value?.length || 0 }}/100
            </span>
          </div>
          <Textarea name="direccion" id="direccion" maxlength="100" autocomplete="off" size="small" fluid class="h-20!" />
          <Message v-if="$form.direccion?.invalid" severity="error" size="small" variant="simple">
            {{ $form.direccion.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Estado <span class="text-red-500">*</span></span>
          <Select @change="(e) => onEstadoChange(e, $form)" name="estado" :options="estados" optionLabel="nombre" optionValue="id" placeholder="Selecione" size="small" fluid filter />
          <Message v-if="$form.estado?.invalid" severity="error" size="small" variant="simple">
            {{ $form.estado.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Municipio <span class="text-red-500">*</span></span>
          <Select @change="(e) => onMunicipioChange(e, $form)" name="municipio" :options="municipios" optionLabel="nombre" optionValue="id" placeholder="Selecione" size="small" fluid filter />
          <Message v-if="$form.municipio?.invalid" severity="error" size="small" variant="simple">
            {{ $form.municipio.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Parroquia <span class="text-red-500">*</span></span>
          <Select name="parroquia" :options="parroquias" optionLabel="nombre" optionValue="id" placeholder="Selecione" size="small" fluid filter />
          <Message v-if="$form.parroquia?.invalid" severity="error" size="small" variant="simple">
            {{ $form.parroquia.error?.message }}
          </Message>
        </div>
      </div>
      <div class="flex pt-6 justify-end gap-4 mt-0">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" type="button" />
        <Button label="Actualizar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>