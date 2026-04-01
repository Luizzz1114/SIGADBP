<script setup>
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createCargoSchema, tiposCargos } from '@/utils/cargos.utils.js';

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  cargo: {
    type: Object,
    default: () => ({})
  }
});

const cargoSchema = createCargoSchema();
const resolver = (options) => {
  return zodResolver(cargoSchema)({
    ...options,
    values: { 
      ...options.values, 
      id: props.cargo?.id
    }
  });
};

const onFormSubmit = ({ valid, values, reset }) => {
  if (!valid) return;
  emit('confirmEdit', values);
  visible.value = false;
  reset();
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-briefcase"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar cargo</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="cargo" :key="cargo?.id" @submit="onFormSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mt-6">
        <div class="flex flex-col gap-1">
          <label for="nombre-cargo">Nombre del cargo <span class="text-red-500">*</span></label>
          <InputText name="nombre" id="nombre-cargo" placeholder="Ingrese el nombre del cargo" maxlength="50" autocomplete="off" size="small" fluid />
          <Message v-if="$form.nombre?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nombre.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Tipo de cargo <span class="text-red-500">*</span></span>
          <Select name="tipo" :options="tiposCargos" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.tipo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.tipo.error?.message }}
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