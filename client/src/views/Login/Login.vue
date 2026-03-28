<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import usuariosService from '@/services/usuarios.services.js';
import { loginSchema } from '@/utils/login.utils.js';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showError } = useNotificaciones();

const usuario = ref({
  username: '',
  contrasena: ''
});

const cargando = ref(false);
const router = useRouter();
const resolver = zodResolver(loginSchema);

const onFormSubmit = async ({ valid, values }) => {
  if (valid) {
    cargando.value = true;
    await login(values);
  }
};

async function login(values) {
  try {
    const respuesta = await usuariosService.login(values);
    if (respuesta.autenticado) {
      localStorage.setItem('user_session', JSON.stringify(respuesta));
      router.push('/inicio');
    } else {
      showError('Credenciales incorrectas.');
    }
  } catch(error) {
    showError('Error al validar las credenciales.');
    console.error('Ocurrió un error al validar las credenciales: ', error);
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col justify-center gap-8 px-8 pb-8 w-full h-full text-slate-700 max-w-108 dark:text-slate-150">
    <div class="flex flex-col">
      <span class="text-xl font-bold">Iniciar sesión</span>
      <span class="text-sm text-slate-400">Ingrese sus credenciales para continuar</span>
    </div>
    <Form v-slot="$form" :initialValues="usuario" :resolver="resolver" @submit="onFormSubmit">
      <div class="grid grid-cols-1 gap-y-4 gap-x-6">
        <div class="flex flex-col gap-1">
          <label for="username">Nombre de usuario</label>
          <InputGroup>
            <InputGroupAddon>
              <i class="fi-rr-user"></i>
            </InputGroupAddon>
            <InputText name="username" id="username" size="small" fluid autocomplete="off" />
          </InputGroup>
          <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">
            {{ $form.username.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Contraseña</span>
          <InputGroup>
            <InputGroupAddon>
              <i class="fi-rr-lock"></i>
            </InputGroupAddon>
            <Password name="contrasena" toggleMask :feedback="false" size="small" fluid />
          </InputGroup>
          <Message v-if="$form.contrasena?.invalid" severity="error" size="small" variant="simple">
            {{ $form.contrasena.error?.message }}
          </Message>
        </div>
      </div>
      <div class="flex flex-col gap-4 mt-4">
        <router-link to="/recuperar-contrasena" class="flex w-full justify-end text-blue-500 hover:opacity-80 duration-300 ease-in-out dark:text-blue-400">¿Olvidó su contraseña?</router-link>
        <Button label="Iniciar sesión" type="submit" class="w-full h-9!" :disabled="cargando">
          <i class="fi-rr-loading text-lg animate-[spin_5s_linear_infinite] text-white!" v-if="cargando"></i>
        </Button>
      </div>
    </Form>
  </div>
</template>