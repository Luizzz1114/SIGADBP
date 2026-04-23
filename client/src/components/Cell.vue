<script setup>
import CustomTag from '@/components/CustomTag.vue';
import { formatearMonto } from '@/utils/formatters.js';

defineProps({
  valor: [String, Number],
  tipo: String,
  fila: { type: Object, default: () => [] }
});
</script>

<template>

  <!-- ESTATUS -->
  <Tag 
    v-if="tipo === 'estatus'"
    :value="valor"
    :severity="{
      'Activo': 'success',
      'Operativo': 'success',
      'En mantenimiento': 'info',
      'No asignado': 'secondary',
      'Cerrado': 'secondary',
      'Desincorporado': 'danger',
      'En proceso': 'info',
      'Finalizado': 'secondary',
      'Cancelado': 'danger',
      'Actual': 'success',
      'Anterior': 'secondary',
    }[valor] || 'secondary'"
    class="ring-1 ring-inset ring-current/10"
  />


  <!-- DESCRIPCIÓN -->
  <span v-else-if="tipo === 'descripcion'" class="block max-w-54 truncate">
    {{ valor || 'Sin descripción' }}
  </span>


  <!-- FECHAS -->
  <span v-else-if="tipo === 'fecha'" class="flex items-center gap-2 whitespace-nowrap">
    <i class="fi-rr-calendar text-slate-400/70 dark:text-slate-500/90"></i>
    {{ valor || '-' }}
  </span>


  <!-- PERSOLANAL Y USUARIOS -->
  <div v-else-if="tipo === 'empleado'" class="flex flex-col whitespace-nowrap">
    <span>{{ valor }}</span>
    <span class="text-xs! text-slate-500 dark:text-slate-400">CI: {{ fila.cedula }}</span>
  </div>

  <span v-else-if="tipo === 'telefono'" class="flex items-center gap-2 whitespace-nowrap">
    <i class="fi-rr-phone-flip text-slate-400/70 dark:text-slate-500/70 rotate-90"></i>
    {{ valor }}
  </span>

  <span v-else-if="tipo === 'correo'" class="flex items-center gap-2 whitespace-nowrap">
    <i class="fi-rr-envelope text-slate-400/70 dark:text-slate-500/70"></i>
    {{ valor }}
  </span>

  <CustomTag v-else-if="tipo === 'rol'"
    :value="valor"
    :icon="{'Administrador': 'fi-sr-admin-alt', 'Supervisor': 'fi-sr-user-tag', 'Analista': 'fi-sr-user'}[valor]"
    :color="{'Administrador': 'violet', 'Supervisor': 'indigo', 'Analista': 'sky'}[valor]"
  />

  <CustomTag v-else-if="tipo === 'tipo_cargo'"
    :value="valor"
    :icon="{'Responsable Patrimonial Primario': 'fi-sr-boss', 'Responsable Patrimonial de Uso y Custodia': 'fi-sr-user-tie-hair', 'Personal de la Unidad de Administración': 'fi-sr-user'}[valor]"
    :color="{'Responsable Patrimonial Primario': 'violet', 'Responsable Patrimonial de Uso y Custodia': 'indigo', 'Personal de la Unidad de Administración': 'sky'}[valor]"
  />



  <!-- DEPENDENCIAS -->
  <CustomTag v-else-if="tipo === 'tipo_dependencia'"
    :value="valor"
    :icon="{'Centro de Acopio' : 'fi-sr-warehouse-alt', 'Módulo' : 'fi-sr-shop', 'Unidad' : 'fi-sr-desk'}[valor]"
    :color="{'Centro de Acopio' : 'violet', 'Módulo' : 'indigo', 'Unidad' : 'sky'}[valor]"
  />
  
  <span v-else-if="tipo === 'direccion'" class="flex items-center gap-2 whitespace-nowrap">
    <i class="fi-rr-marker text-slate-400/70 dark:text-slate-500/70"></i>
    {{ valor }}
  </span>
  


  <!-- PRESUPUESTOS -->
  <span v-else-if="tipo === 'codigo'" class="px-1 whitespace-nowrap rounded border border-slate-150 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
    {{ valor }}
  </span>

  <div v-else-if="tipo === 'tipo_presupuesto'" class="flex flex-col whitespace-nowrap">
    <span>{{ valor }}</span>
    <span class="text-xs! text-slate-500 dark:text-slate-400">{{ fila.descripcion }}</span>
  </div>

  <p v-else-if="tipo === 'usd'" class="whitespace-nowrap">
    ${{ formatearMonto(valor) }}
  </p>

  <div v-else-if="tipo === 'anio_fiscal'" class="flex flex-col whitespace-nowrap">
    <span>{{ valor }}</span>
    <span class="text-xs! text-slate-500 dark:text-slate-400">{{ fila.semestre }}</span>
  </div>



  <!-- MANTENIMIENTO -->
  <div v-else-if="tipo === 'bien'" class="flex flex-col items-start gap-0.5 whitespace-nowrap">
    <span class="px-1 whitespace-nowrap rounded border border-slate-150 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{{ valor }}</span>
    <span class="text-xs! text-slate-500 dark:text-slate-400">{{ fila.descripcion_bien }}</span>
  </div>

  <div v-else-if="tipo === 'mantenimiento'" class="flex flex-col whitespace-nowrap">
    <span>{{ valor }}</span>
    <span class="text-xs! text-slate-500 dark:text-slate-400">{{ fila.descripcion }}</span>
  </div>

  
  <!-- POR DEFECTO -->
  <span v-else class="whitespace-nowrap">{{ valor || '-' }}</span>
  
</template>