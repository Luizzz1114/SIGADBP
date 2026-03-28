<script setup>
import { computed } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createPerfilSchema, preguntasSeguridad } from '@/utils/usuarios.utils';
import usuariosServices from '@/services/usuarios.services';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();

const visible = defineModel('visible', { type: Boolean, default: false });

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
    contrasena: '',
    confirmarContrasena: '',
    pregunta: '',
    respuesta: '' 
  };
});

const perfilSchema = createPerfilSchema();
const resolver = (options) => {
  return zodResolver(perfilSchema)({
    ...options,
    values: { 
      ...options.values, 
      id: props.usuario?.id
    }
  });
};

const onFormSubmit = async ({ valid, values, reset }) => {
  if(!valid) return;
  try {
    const resultado = await usuariosServices.actualizar(values);
    showSuccess(resultado.message);
  } catch(error) {
    showError(error.response?.data?.message);
    console.log('Error al actualizar usuario: ', error);
  } finally {
    visible.value = false;
    reset();
  }
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Perfil de usuario</span>
        </div>
      </div>
    </template>
    <div class="mt-4">

      <div class="flex gap-4 mt-4">
        <div class="grid place-items-center p-3 size-18 text-2xl font-bold rounded-2xl bg-blue-500 text-white">
          {{ usuario.username.charAt(0) }}
        </div>
        <div class="flex flex-col gap-1">
          <span class="font-bold text-xl! tracking-tight leading-none">{{ usuario.username }}</span>
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ usuario.correo }}</span>
          <CustomTag
            :value="usuario.rol"
            :icon="{'Administrador' : 'fi-sr-admin-alt', 'Supervisor' : 'fi-sr-user-tag', 'Analista' : 'fi-sr-user',}[usuario.rol]"
            :color="{'Administrador': 'violet', 'Supervisor': 'indigo', 'Analista': 'sky'}[usuario.rol]"
          />
        </div>
      </div>

      <div class="mt-2">
        <Tabs value="0">
          <TabList>
            <Tab value="0" lazy>
              <div class="flex items-center gap-2 font-medium">
                <i class="fi-rr-user"></i>
                Información
              </div>  
            </Tab>
            <Tab value="1" lazy>
              <div class="flex items-center gap-2 font-medium">
                <i class="fi-rr-pencil"></i>
                Editar usuario
              </div>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
                <span class="flex items-center gap-2 font-bold uppercase">
                  <i class="fi-br-info text-blue-500"></i>
                  Información personal
                </span>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Nombre completo</span>
                  <span class="font-medium! text-right">{{ usuario.empleado }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Cédula</span>
                  <span class="font-medium! text-right">{{ usuario.cedula }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Género</span>
                  <span class="font-medium! text-right">{{ usuario.genero === 'M' ? 'Masculino' : 'Femenino' }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Fecha de nacimiento</span>
                  <span class="font-medium! text-right">{{ usuario.fechanacimiento }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Edad</span>
                  <span class="font-medium! text-right">{{ usuario.edad }} años</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Teléfono</span>
                  <span class="font-medium! text-right">{{ usuario.telefono }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
                <span class="flex items-center gap-2 font-bold uppercase">
                  <i class="fi-br-briefcase text-blue-500"></i>
                  Información laboral
                </span>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Dependencia</span>
                  <span class="font-medium! text-right">{{ usuario.dependencia || 'No asignado' }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Cargo</span>
                  <span class="font-medium! text-right">{{ usuario.cargo || 'No asignado' }}</span>
                </div>
                <div class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Fecha de ingreso</span>
                  <span class="font-medium! text-right">{{ usuario.fechaingreso || 'N/A' }}</span>
                </div>
                <div v-if="usuario.fechasalida" class="flex justify-between gap-3">
                  <span class="text-slate-500 dark:text-slate-400">Fecha de salida</span>
                  <span class="font-medium! text-right">{{ usuario.fechasalida || 'N/A' }}</span>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-4 mt-4">
                <MiniCard
                  label="Años de servicio" 
                  :value="usuario.antiguedad"
                  icon="fi-sr-calendar-clock" 
                  color="indigo" 
                />
              </div>
            </TabPanel>
            <TabPanel value="1">
              <Form v-slot="$form" :initialValues="initialValues" :key="usuario?.id" :resolver="resolver" @submit="onFormSubmit">
                <div class="grid grid-cols-1 gap-y-4 gap-x-6 mt-6">
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
                  <Button label="Actualizar" type="submit" />
                </div>
              </Form>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </Drawer>
</template>