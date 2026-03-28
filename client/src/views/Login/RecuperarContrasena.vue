<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { nuevaContrasenaSchema, recuperarContrasenaSchema } from '@/utils/login.utils.js';
import { preguntasSeguridad, } from '@/utils/usuarios.utils';

const vistaActual = ref('inicio');
const cargando = ref(false);
const resolver = zodResolver(recuperarContrasenaSchema);
const resolverNuevaContrasena = zodResolver(nuevaContrasenaSchema);

const datos = ref({
  identificador: '',
  metodo: 'correo', 
  pregunta: undefined,
  respuesta: undefined
});

const datosNuevaContrasena = ref({
  contrasena: '',
  confirmarContrasena: ''
});

const metodoRecuperacion = [
  { label: 'Enviar por correo', value: 'correo' },
  { label: 'Pregunta de seguridad', value: 'pregunta' }
];

const onFormSubmit = async ({ valid, values }) => {
  if (!valid) return;

  cargando.value = true;
  setTimeout(() => {
    cargando.value = false;
    if (values.metodo === 'correo') {
      vistaActual.value = 'correo_enviado';
    } else {
      vistaActual.value = 'nueva_contrasena';
    }
  }, 1500);
};

const onNuevaContrasenaSubmit = async ({ valid, values }) => {
  if (!valid)  return;

  cargando.value = true;
  setTimeout(() => {
    cargando.value = false;
    vistaActual.value = 'exito'; 
  }, 1500);
};
</script>

<template>
  <div class="flex flex-col justify-center gap-8 px-8 pb-8 w-full h-full text-slate-700 max-w-108 dark:text-slate-150">

    <template v-if="vistaActual === 'inicio'">
      <div class="flex flex-col">
        <span class="text-xl font-bold">Recuperar contraseña</span>
        <span class="text-sm text-slate-400">Ingrese su nombre de usuario o correo para recuperar su contraseña</span>
      </div>
      <Form v-slot="$form" :initialValues="datos" :resolver="resolver" @submit="onFormSubmit">
        <div class="grid grid-cols-1 gap-y-4 gap-x-6">
          <div class="flex flex-col gap-1">
            <label for="identificador">Nombre de usuario o Correo electrónico</label>
            <InputGroup>
              <InputGroupAddon>
                <i class="fi-rr-user"></i>
              </InputGroupAddon>
              <InputText name="identificador" id="identificador" size="small" fluid autocomplete="off" />
            </InputGroup>
            <Message v-if="$form.identificador?.invalid" severity="error" size="small" variant="simple">
              {{ $form.identificador.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <label for="identificador">Método de recuperación</label>
            <SelectButton name="metodo" :options="metodoRecuperacion" optionLabel="label" optionValue="value" fluid />
          </div>
          <div class="flex flex-col gap-1 mt-2">
            <label for="pregunta">Pregunta de seguridad</label>
            <Select name="pregunta" id="pregunta" :options="preguntasSeguridad" size="small" fluid :disabled="$form.metodo?.value === 'correo' || $form.metodo?.value === null" />
            <Message v-if="$form.pregunta?.invalid" severity="error" size="small" variant="simple">
              {{ $form.pregunta.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <label for="respuesta">Respuesta secreta</label>
            <InputText name="respuesta" id="respuesta" size="small" fluid autocomplete="off" :disabled="$form.metodo?.value === 'correo' || $form.metodo?.value === null" />
            <Message v-if="$form.respuesta?.invalid" severity="error" size="small" variant="simple">
              {{ $form.respuesta.error?.message }}
            </Message>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-6">
          <Button as="router-link" to="/login" label="Volver" severity="secondary" outlined class="grow h-9!" />
          <Button :label="$form.metodo?.value === 'correo' ? 'Enviar nueva contraseña' : 'Verificar y recuperar'" type="submit" class="grow h-9! whitespace-nowrap" :disabled="cargando">
            <i class="fi-rr-loading text-lg animate-[spin_5s_linear_infinite] text-white!" v-if="cargando"></i>
          </Button>
        </div>
      </Form>
    </template>

    <template v-else-if="vistaActual === 'correo_enviado'">
      <div class="flex flex-col gap-4 py-8">
        <div class="flex flex-col gap-2">
          <span class="text-xl font-bold">Correo enviado</span>
          <span class="text-sm text-slate-500 dark:text-slate-400">Hemos enviado las credenciales de recuperación al correo:</span>
          <span class="font-bold text-slate-700 dark:text-slate-200">{{ 'correo@ejemplo.com' }}</span>
        </div>
        <div class="flex items-center gap-3 p-4 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <i class="fi-rr-info text-sm"></i>
          <span class="text-[13px] leading-4">
            Si no lo encuentras en unos minutos, revisa tu carpeta de <b>spam</b> o correo no deseado.
          </span>
        </div>
        <Button as="router-link" to="/login" label="Volver al inicio de sesión" class="mt-4 w-full h-9!" />
      </div>
    </template>

    <template v-else-if="vistaActual === 'nueva_contrasena'">
      <div class="flex flex-col">
        <span class="text-xl font-bold">Crear nueva contraseña</span>
        <span class="text-sm text-slate-400">Credenciales correctas. Ingrese su nueva contraseña a continuación.</span>
      </div>
      <Form v-slot="$form" :initialValues="datosNuevaContrasena" :resolver="resolverNuevaContrasena" @submit="onNuevaContrasenaSubmit">
        <div class="grid grid-cols-1 gap-y-4 gap-x-6">
          <div class="flex flex-col gap-1">
            <label for="contrasena">Nueva contraseña</label>
            <InputGroup>
              <InputGroupAddon><i class="fi-rr-lock"></i></InputGroupAddon>
              <Password name="contrasena" id="contrasena" toggleMask size="small" fluid promptLabel="Ingrese una contraseña" weakLabel="Débil" mediumLabel="Media" strongLabel="Fuerte">
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
            <label for="confirmarContrasena">Confirmar contraseña</label>
            <InputGroup>
              <InputGroupAddon><i class="fi-rr-lock"></i></InputGroupAddon>
              <Password name="confirmarContrasena" id="confirmarContrasena" toggleMask :feedback="false" size="small" fluid />
            </InputGroup>
            <Message v-if="$form.confirmarContrasena?.invalid" severity="error" size="small" variant="simple">
              {{ $form.confirmarContrasena.error?.message }}
            </Message>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-6">
          <Button @click="vistaActual = 'inicio'" label="Cancelar" severity="secondary" outlined class="grow h-9!" type="button" />
          <Button label="Guardar contraseña" type="submit" class="grow h-9! whitespace-nowrap" :disabled="cargando">
            <i class="fi-rr-loading text-lg animate-[spin_5s_linear_infinite] text-white!" v-if="cargando"></i>
          </Button>
        </div>
      </Form>
    </template>

    <template v-else-if="vistaActual === 'exito'">
      <div class="flex flex-col items-center text-center gap-4 py-8">        
        <div class="flex flex-col gap-2">
          <span class="text-xl font-bold">Contraseña actualizada</span>
          <span class="text-sm text-slate-500 dark:text-slate-400">
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
          </span>
        </div>
        <Button as="router-link" to="/login" label="Volver al inicio de sesión" class="mt-4 w-full h-9!" />
      </div>
    </template>

  </div>
</template>