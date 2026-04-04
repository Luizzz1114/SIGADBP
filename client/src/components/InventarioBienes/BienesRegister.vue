<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { categorias, tiposMuebles, materialesMuebles, coloresVehiculos, createBienSchema } from '@/utils/bienes.utils.js';

const visible = defineModel('visible');
const emit = defineEmits(['register']);
const bienSchema = createBienSchema();
const resolver = ref(zodResolver(bienSchema));

const bien = ref({
  numero: '',
  descripcion: '',
  categoria: '',
  marca: '',
  modelo: '',
  serial: '',
  serialcarroceria: '',
  placa: '',
  color: '',
  especificaciones: '',
  tipomueble: '',
  material: ''
});

const onFormSubmit = ({ valid, values, reset }) => {
  if (valid) {
    emit('register', values);
    visible.value = false;
    reset();
  }
}
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :dismissable="false" class="w-full! md:w-180!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-boxes"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Registrar bien</span>
        </div>
      </div>
    </template>
    <Form v-slot="$form" :initialValues="bien" :resolver="resolver" @submit="onFormSubmit">
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-1 text-xl text-blue-500"></i>
        <span class="font-semibold">Información básica</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
        <div class="flex flex-col gap-1">
          <label for="numero">Número de bien</label>
          <InputText name="numero" id="numero" v-keyfilter.int maxlength="10" autocomplete="off" size="small" fluid />
          <small class="text-slate-400 dark:text-slate-500 text-xs">
            Si deja este campo vacío se registrará como <strong>S/N</strong>
          </small>
          <Message v-if="$form.numero?.invalid" severity="error" size="small" variant="simple">
            {{ $form.numero.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <span>Categoría del bien <span class="text-red-500">*</span></span>
          <Select name="categoria" :options="categorias" placeholder="Selecione" size="small" fluid />
          <Message v-if="$form.categoria?.invalid" severity="error" size="small" variant="simple">
            {{ $form.categoria.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1 col-span-full">
          <div class="flex justify-between items-center">
            <label for="descripcion">Descripción <span class="text-red-500">*</span></label>
            <span class="text-slate-400 dark:text-slate-500 text-xs!">
              {{ $form.descripcion?.value?.length || 0 }}/50
            </span>
          </div>
          <Textarea name="descripcion" id="descripcion" maxlength="50" autocomplete="off" size="small" fluid class="h-20!" />
          <Message v-if="$form.descripcion?.invalid" severity="error" size="small" variant="simple">
            {{ $form.descripcion.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="marca">Marca del bien</label>
          <InputText name="marca" id="marca" maxlength="40" autocomplete="off" size="small" fluid />
          <Message v-if="$form.marca?.invalid" severity="error" size="small" variant="simple">
            {{ $form.marca.error?.message }}
          </Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="modelo">Modelo del bien</label>
          <InputText name="modelo" id="modelo" maxlength="40" autocomplete="off" size="small" fluid />
          <Message v-if="$form.modelo?.invalid" severity="error" size="small" variant="simple">
            {{ $form.modelo.error?.message }}
          </Message>
        </div>
      </div>

      <Divider class="my-6!" />
      <div class="flex items-center gap-2">
        <i class="fi-sr-circle-2 text-xl text-blue-500"></i>
        <span class="font-semibold">Detalles del bien</span>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <!-- PLACEHOLDER -->
        <div v-if="!$form.categoria?.value" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
          <div class="col-span-full p-8 text-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <span class="text-slate-400 dark:text-slate-500">Seleccione la categoría del bien...</span>
          </div>
        </div>


        <!-- DETALLES PARA MUEBLES -->
        <div v-else-if="$form.categoria?.value === 'Mueble'" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
          <div class="flex flex-col gap-1">
            <span>Tipo de mueble <span class="text-red-500">*</span></span>
            <Select name="tipomueble" :options="tiposMuebles" placeholder="Seleccione" size="small" fluid editable />
            <Message v-if="$form.tipomueble?.invalid" severity="error" size="small" variant="simple">
              {{ $form.tipomueble.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <span>Material del mueble <span class="text-red-500">*</span></span>
            <Select name="material" :options="materialesMuebles" placeholder="Seleccione" size="small" fluid editable />
            <Message v-if="$form.material?.invalid" severity="error" size="small" variant="simple">
              {{ $form.material.error?.message }}
            </Message>
          </div>
        </div>


        <!-- DETALLES PARA TECNOLÓGICOS -->
        <div v-else-if="$form.categoria?.value === 'Tecnológico'" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
          <div class="flex flex-col gap-1">
            <label for="serial">Serial <span class="text-red-500">*</span></label>
            <InputText name="serial" id="serial" maxlength="50" autocomplete="off" size="small" fluid />
            <Message v-if="$form.serial?.invalid" severity="error" size="small" variant="simple">
              {{ $form.serial.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <label for="especificaciones">Especificaciones</label>
            <InputText name="especificaciones" id="especificaciones" maxlength="50" autocomplete="off" size="small" fluid />
            <Message v-if="$form.especificaciones?.invalid" severity="error" size="small" variant="simple">
              {{ $form.especificaciones.error?.message }}
            </Message>
          </div>
        </div>


        <!-- DETALLES PARA VEHÍCULOS -->
        <div v-else-if="$form.categoria?.value === 'Vehículo o Equipo de Elevación'" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-4">
          <div class="flex flex-col gap-1">
            <label for="serialcarroceria">Serial de carrocería <span class="text-red-500">*</span></label>
            <InputText name="serialcarroceria" id="serialcarroceria" maxlength="30" autocomplete="off" size="small" fluid />
            <Message v-if="$form.serialcarroceria?.invalid" severity="error" size="small" variant="simple">
              {{ $form.serialcarroceria.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <label for="placa">Placa</label>
            <InputText name="placa" id="placa" maxlength="10" autocomplete="off" size="small" fluid />
            <Message v-if="$form.placa?.invalid" severity="error" size="small" variant="simple">
              {{ $form.placa.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-1">
            <span>Color del vehículo</span>
            <Select name="color" :options="coloresVehiculos" placeholder="Seleccione" size="small" fluid editable />
            <Message v-if="$form.color?.invalid" severity="error" size="small" variant="simple">
              {{ $form.color.error?.message }}
            </Message>
          </div>
        </div>
      </Transition>

      
      <div class="flex pt-6 justify-end gap-4 mt-0">
        <Button @click="visible = false" label="Cancelar" variant="outlined" severity="secondary" />
        <Button label="Registrar" type="submit" />
      </div>
    </Form>
  </Drawer>
</template>