<script setup>
import { computed } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createUsuarioSchema, roles } from '@/utils/usuarios.utils.js';

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['confirmEdit']);

const props = defineProps({
  usuario: {
    type: Object,
    default: () => ({})
  }
});

const initialValues = computed(() => {
  const usuario = props.usuario;
  return {
    ...usuario,
    personal: props.usuario?.idp,
    contrasena: ''
  };
});

const usuarioSchema = createUsuarioSchema();
const resolver = (options) => {
  return zodResolver(usuarioSchema)({
    ...options,
    values: { 
      ...options.values, 
      id: props.usuario?.id
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
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Actualizar usuario</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" :key="usuario?.id" @submit="onFormSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-6">
        <div class="flex flex-col gap-1">
          <span>Personal <span class="text-red-500">*</span></span>
          <Select name="personal" dropdownIcon="false" size="small" fluid readonly disabled>
            <template #value>
              <div class="flex flex-col leading-tight">
                <span>{{ usuario.nombres }} {{ usuario.apellidos }}</span>
                <span class="text-xs! opacity-80">CI: {{ usuario.cedula }}</span>
              </div>
            </template>
          </Select>
        </div>
        <div class="flex flex-col gap-1">
          <span>Rol <span class="text-red-500">*</span></span>
          <Select name="rol" :options="roles" placeholder="Seleccione" size="small" fluid />
          <Message v-if="$form.rol?.invalid" severity="error" size="small" variant="simple">
            {{ $form.rol.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="username">Nombre de usuario <span class="text-red-500">*</span></label>
          <InputGroup>
            <InputGroupAddon>
              <i class="fi-rr-user"></i>
            </InputGroupAddon>
            <InputText name="username" id="username" autocomplete="off" size="small" fluid />
          </InputGroup>
          <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">
            {{ $form.username.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="correo">Correo electrónico <span class="text-red-500">*</span></label>
          <InputGroup>
            <InputGroupAddon>
              <i class="fi-rr-envelope"></i>
            </InputGroupAddon>
            <InputText name="correo" id="correo" autocomplete="off" size="small" fluid />
          </InputGroup>
          <Message v-if="$form.correo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.correo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Contraseña <span class="text-red-500">*</span></span>
          <InputGroup>
            <InputGroupAddon>
              <i class="fi-rr-lock"></i>
            </InputGroupAddon>
            <Password name="contrasena" size="small" fluid toggleMask>
              <template #header>
                <div class="font-semibold mb-3">Requisitos de seguridad</div>
              </template>
              <template #footer>
                <Divider />
                <ul class="pl-2 leading-normal text-sm">
                  <li>Al menos una minúscula</li>
                  <li>Al menos una mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Mínimo 8 caracteres</li>
                </ul>
              </template>
            </Password>
          </InputGroup>
          <Message v-if="$form.contrasena?.invalid" severity="error" size="small" variant="simple">
            {{ $form.contrasena.error?.message }}
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