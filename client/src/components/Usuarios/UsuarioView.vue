<script setup>
import CustomTag from '@/components/CustomTag.vue';
import MiniCard from '@/components/MiniCard.vue';

const visible = defineModel('visible', { type: Boolean, default: false });
defineProps({ usuario: Object });
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! md:w-120!">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="grid place-items-center size-9 text-xl rounded-lg bg-blue-500 text-white">
          <i class="fi-sr-user"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg! dark:text-slate-50">Usuario</span>
        </div>
      </div>
    </template>

    <div class="flex gap-4 mt-4">
      <div class="grid place-items-center p-3 size-16 text-2xl font-bold rounded-2xl bg-blue-500 text-white">
        {{ usuario.username.charAt(0) }}
      </div>
      <div class="flex flex-col">
        <span class="font-bold text-xl! tracking-tight leading-none">{{ usuario.username }}</span>
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ usuario.correo }}</span>
        <CustomTag
          :value="usuario.rol"
          :icon="{'Administrador' : 'fi-sr-admin-alt', 'Supervisor' : 'fi-sr-user-tag', 'Analista' : 'fi-sr-user',}[usuario.rol]"
          :color="{'Administrador': 'violet', 'Supervisor': 'indigo', 'Analista': 'sky'}[usuario.rol]"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-id-badge text-blue-500"></i>
        Información personal
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Empleado responsable</span>
        <span class="font-medium! text-right">{{ usuario.empleado }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Cédula de Identidad</span>
        <span class="font-medium! text-right">{{ usuario.cedula }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-3 mt-4 w-full rounded-xl ring-1 ring-inset ring-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:ring-slate-700">
      <span class="flex items-center gap-2 font-bold uppercase">
        <i class="fi-br-time-past text-blue-500"></i>
        Trazabilidad
      </span>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Registro en sistema</span>
        <span class="font-medium! text-right">{{ usuario.creacion }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-slate-500 dark:text-slate-400">Última modificación</span>
        <span class="font-medium! text-right">{{ usuario.actualizacion || 'Sin cambios recientes' }}</span>
      </div>
    </div>

  </Drawer>
</template>