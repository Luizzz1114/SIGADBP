<script setup>
import { ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createUsuarioSchema, roles, preguntasSeguridad } from '@/utils/usuarios.utils.js';
import { listarPersonalSinUsuario } from '@/utils/fetch.utils.js';

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['register']);

const usuarioSchema = createUsuarioSchema();
const resolver = zodResolver(usuarioSchema);

const personal = ref([]);
const usuario = ref({ 
  username: '',
  correo: '',
  rol: '',
  contrasena: '',
  confirmarContrasena: '',
  pregunta: '',
  respuesta: '',
  personal: ''
});

const onFormSubmit = ({ valid, values, reset }) => {
  if (!valid) return;
  const payload = {
    ...values,
    personal: values.personal.id 
  };
  emit('register', payload);
  visible.value = false;
  reset();
}

watch(visible, async(isOpen) => {
  if (isOpen) {
    personal.value = await listarPersonalSinUsuario();
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registrar usuario</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="usuario" @submit="onFormSubmit">
      <div class="flex items-center gap-2 mt-6">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Credenciales</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Personal <span class="text-red-500">*</span></span>
          <Select name="personal" :options="personal" optionLabel="nombres" placeholder="Seleccione" size="small" fluid filter>
            <template #option="slotProps">
              <div class="flex flex-col leading-tight">
                <span>{{ slotProps.option.nombres }} {{ slotProps.option.apellidos }}</span>
                <span class="text-xs! opacity-80">CI: {{ slotProps.option.cedula }}</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col leading-tight">
                <span>{{ slotProps.value.nombres }} {{ slotProps.value.apellidos }}</span>
                <span class="text-xs! opacity-80">CI: {{ slotProps.value.cedula }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Select>
          <Message v-if="$form.personal?.invalid" severity="error" size="small" variant="simple">
            {{ $form.personal.error?.message }}
          </Message>
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
        <div class="flex flex-col gap-1">
          <span>Confirmar contraseña</span>
          <InputGroup>
            <InputGroupAddon><i class="fi-rr-lock"></i></InputGroupAddon>
            <Password name="confirmarContrasena" toggleMask :feedback="false" size="small" fluid />
          </InputGroup>
          <Message v-if="$form.confirmarContrasena?.invalid" severity="error" size="small" variant="simple">
            {{ $form.confirmarContrasena.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Pregunta de seguridad</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Pregunta <span class="text-red-500">*</span></span>
          <Select name="pregunta" :options="preguntasSeguridad" placeholder="Seleccione" size="small" fluid />
          <Message v-if="$form.pregunta?.invalid" severity="error" size="small" variant="simple">
            {{ $form.pregunta.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="respuesta">Respuesta <span class="text-red-500">*</span></label>
          <InputText name="respuesta" id="respuesta" autocomplete="off" size="small" fluid />
          <Message v-if="$form.respuesta?.invalid" severity="error" size="small" variant="simple">
            {{ $form.respuesta.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex pt-6 justify-end gap-4 mt-0">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" type="button" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>