<script setup>
import { ref, watch } from 'vue';
import { saveAs } from 'file-saver';
import { useNotificaciones } from '@/utils/useNotificaciones.js';
import dependenciasServices from '@/services/dependencias.services.js';
import bienesServices from '@/services/bienes.services.js';

const { showSuccess, showError } = useNotificaciones();
const visible = defineModel('visible', { type: Boolean, default: false });
const loading = ref(false);

const initialValues = ref({
  dependencia: null,
});

const dependencias = ref([]);

const cargarDependencias = async () => {
  try {
    const data = await dependenciasServices.listarResponsables();
    dependencias.value = data;
  } catch (error) {
    showError('Error al cargar las dependencias');
  }
};

watch(visible, async(isOpen) => {
  if (isOpen) {
    await cargarDependencias();
    return;
  }
});

const onFormSubmit = async ({ valid, values }) => {
  if (!valid) return;
  loading.value = true;
  const idDependencia = values.dependencia.id;
  try {
    const blob = await bienesServices.generarReporte(idDependencia);
    saveAs(blob, `inventario - ${values.dependencia.nombre}.xlsx`);
    showSuccess('Reporte Excel generado exitosamente');
    visible.value = false;
  } catch (error) {
    showError('Error al generar el reporte');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Dialog v-model:visible="visible" modal class="w-full max-w-md md:w-120!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-br-file-excel"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Exportar Inventario</span>
        </div>
      </div>
    </template>
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col mt-2"
    >
      <span class="leading-tight p-3 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Selecciona la dependencia específica para generar y descargar su reporte de inventario en formato Excel.
      </span>
      <div class="flex flex-col gap-2 mt-6">
        <span class="font-semibold flex items-center">Dependencia</span>
        <Select
          name="dependencia"
          :options="dependencias"
          optionLabel="nombre"
          :filterFields="['nombre', 'responsable', 'cedula']"
          placeholder="Seleccione"
          size="small"
          fluid
          filter
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span>{{ slotProps.option.nombre }}</span>
              <span class="text-xs! opacity-80">{{ slotProps.option.responsable }} - CI: {{ slotProps.option.cedula }}</span>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex flex-col">
              <span>{{ slotProps.value.nombre }}</span>
              <span class="text-xs! opacity-80">{{ slotProps.value.responsable }} - CI: {{ slotProps.value.cedula }}</span>
            </div>
            <span v-else>{{ slotProps.placeholder }}</span>
          </template>
        </Select>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <Button
          type="button"
          label="Cancelar"
          variant="outlined"
          severity="secondary"
          @click="visible = false"
        />
        <Button
          type="submit"
          label="Descargar Excel"
          icon="fi-br-download"
          :loading="loading"
          :disabled="$form.dependencia?.value == null"
        />
      </div>
    </Form>
  </Dialog>
</template>
