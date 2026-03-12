<script setup>
import { ref } from 'vue';
import evaluacionesServices from '@/services/evaluaciones.services';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
const { showSuccess, showError } = useNotificaciones();

const visible = defineModel('visible', { type: Boolean, default: false });

const encuesta = ref({
  capacitacion: null,
  satisfaccion: null
});

const opcionesCapacitacion = [
  { label: 'Sí', value: 1 },
  { label: 'No', value: 0 },
];

const opcionesSatisfaccion = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 }
];

const onFormSubmit = async ({ valid, values }) => {
  if (!valid) return;

  const hoy = new Date();
  const semestre = `${hoy.getFullYear()}-${hoy.getMonth() < 6 ? 1 : 2}`;
  const usuario = JSON.parse(localStorage.getItem('user_session'))?.usuario;
  const payload = {
    id: usuario.id,
    semestre,
    ...values
  }

  try {
    const respuesta = await evaluacionesServices.crear(payload);
    showSuccess(respuesta.message);
    const session = JSON.parse(localStorage.getItem('user_session'));
    session.usuario.encuestaRespondida = true;
    localStorage.setItem('user_session', JSON.stringify(session));
    
  } catch (error) {
    showError(error.response?.data?.message);
    console.error('Error al enviar la encuesta: ', error);
  }
  visible.value = false;
  
};
</script>

<template>
  <Dialog v-model:visible="visible" modal class="w-120!">
    <template #header>
      <div class="flex items-center gap-4 py-2">
        <div class="grid place-items-center size-10 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Encuesta</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form"  :initialValues="encuesta" @submit="onFormSubmit" class="flex flex-col">
      <span class="leading-tight mt-2 p-3 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Necesitamos actualizar los indicadores semestrales de la unidad. Por favor, responde estas dos preguntas rápidas antes de continuar.</span>
      <div class="flex items-center gap-2 mt-6">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Capacitación</span>
      </div>
      <div class="flex flex-col gap-2 mt-3">
        <span class="leading-tight">¿Ha recibido capacitación en los procesos de gestión de bienes en los últimos 6 meses?</span>
        <SelectButton
          name="capacitacion"
          :options="opcionesCapacitacion"
          optionLabel="label"
          optionValue="value"
          class="w-full *:w-1/2"
        />
      </div>
      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Satisfacción</span>
      </div>
      <div class="flex flex-col gap-2 mt-3">
        <span class="leading-tight">¿Qué tan satisfecho estás con el clima laboral y tus herramientas de trabajo?</span>
        <SelectButton 
          name="satisfaccion" 
          :options="opcionesSatisfaccion"
          optionLabel="label"
          optionValue="value"
          class="w-full *:flex-1" 
        />
        <div class="flex items-center justify-between px-4 text-xs text-slate-500 dark:text-slate-400">
          <p>Poco</p>
          <p>Neutral</p>
          <p>Mucho</p>
        </div>
      </div>
      <div class="flex justify-end mt-8">
        <Button type="submit" label="Enviar y continuar" :disabled="$form.capacitacion?.value === null || $form.satisfaccion?.value === null" />
      </div>
    </Form>
  </Dialog>
</template>