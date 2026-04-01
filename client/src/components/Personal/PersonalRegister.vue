<script setup>
import { ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { createPersonalSchema, generos, prefijosAcademicos, minDate, maxDate } from '@/utils/personal.utils.js';
import { listarCargos, listarDependencias } from '@/utils/fetch.utils.js';
import { capitalizarInput } from '@/utils/formatters.js';

const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['register']);
const personalSchema = createPersonalSchema();
const resolver = ref(zodResolver(personalSchema));

const personal = ref({ 
  cedula: '',
  nombres: '',
  apellidos: '',
  fechanacimiento: '',
  genero: '',
  telefono: '',
  nivelprofesional: '',
  cargo: '',
  dependencia: '',
  fechaingreso: ''
});

const onFormSubmit = ({ valid, values, reset }) => {
  if (!valid) return;
  emit('register', values);
  visible.value = false;
  reset();
}

// --- Cargos y Dependencias ---
const cargos = ref([]);
const dependencias = ref([]);

watch(visible, async(isOpen) => {
  if(isOpen) {
    [cargos.value, dependencias.value] = await Promise.all([
      listarCargos(),
      listarDependencias()
    ]);
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" :dismissable="false" position="right" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-employee-man"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registrar personal</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :resolver="resolver" :initialValues="personal" @submit="onFormSubmit" class="flex flex-col">
      <div class="flex items-center gap-2 mt-6">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Información básica</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <label for="cedula">Cédula <span class="text-red-500">*</span></label>
          <InputText name="cedula" id="cedula" v-keyfilter.int maxlength="8" autocomplete="off" size="small" fluid />
          <Message v-if="$form.cedula?.invalid" severity="error" size="small" variant="simple">
            {{ $form.cedula.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="nombres">Nombres <span class="text-red-500">*</span></label>
          <InputText @input="capitalizarInput" name="nombres" id="nombres" maxlength="50" autocomplete="off" size="small" fluid />
          <Message v-if="$form.nombres?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nombres.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="apellidos">Apellidos <span class="text-red-500">*</span></label>
          <InputText @input="capitalizarInput" name="apellidos" id="apellidos" maxlength="50" autocomplete="off" size="small" fluid />
          <Message v-if="$form.apellidos?.invalid" severity="error" size="small" variant="simple">
            {{ $form.apellidos.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fechanacimiento">Fecha de nacimiento <span class="text-red-500">*</span></label>
          <DatePicker name="fechanacimiento" inputId="fechanacimiento" :minDate="minDate" :maxDate="maxDate" updateModelType="string" :manualInput="false" size="small" fluid showIcon />
          <Message v-if="$form.fechanacimiento?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fechanacimiento.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Género <span class="text-red-500">*</span></span>
          <Select name="genero" :options="generos" optionLabel="label" optionValue="value" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.genero?.invalid" severity="error" size="small" variant="simple">
            {{ $form.genero.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="telefono">Teléfono <span class="text-red-500">*</span></label>
          <InputMask name="telefono" id="telefono" mask="9999-9999999" autocomplete="off" size="small" fluid />
          <Message v-if="$form.telefono?.invalid" severity="error" size="small" variant="simple">
            {{ $form.telefono.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Nivel profesional <span class="text-red-500">*</span></span>
          <Select name="nivelprofesional" :options="prefijosAcademicos" placeholder="Selecione" size="small" fluid editable filter />
          <Message v-if="$form.nivelprofesional?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nivelprofesional.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Información laboral</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <span>Cargo <span class="text-red-500">*</span></span>
          <Select name="cargo" :options="cargos" optionLabel="nombre" optionValue="id" filter placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.cargo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.cargo.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Dependencia <span class="text-red-500">*</span></span>
          <Select name="dependencia" :options="dependencias" optionLabel="nombre" optionValue="id" filter placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.dependencia?.invalid" severity="error" size="small" variant="simple">
            {{ $form.dependencia.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="fechaingreso">Fecha de ingreso <span class="text-red-500">*</span></label>
          <DatePicker name="fechaingreso" inputId="fechaingreso" :minDate="new Date('2002-01-01')" :maxDate="new Date()" updateModelType="string" :manualInput="false" size="small" fluid showIcon />
          <Message v-if="$form.fechaingreso?.invalid" severity="error" size="small" variant="simple">
            {{ $form.fechaingreso.error?.message }}
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