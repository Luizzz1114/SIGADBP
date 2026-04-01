<script setup>
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();

const openConfirm = (item, details) => {
  confirm.require({
    group: 'headless',
    message: details,
    header: 'Eliminar registro',
    accept: () => {
      emit('confirmDelete', item.id);
    },
  });
};

defineExpose({ openConfirm });
const emit = defineEmits(['confirmDelete']);
</script>

<template>
  <ConfirmDialog group="headless" class="overflow-hidden">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center p-6 bg-slate-0 dark:bg-slate-850">
        <div class="grid place-items-center size-10 text-lg rounded-lg bg-red-100 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <i class="fi-rr-hexagon-exclamation text-xl! text-red-400!"></i>
        </div>
        <span class="mt-2 font-bold text-xl!">{{ message.header }}</span>
        <p class="mt-1 text-center">¿Está seguro de eliminar este registro?</p>
        <div class="flex flex-col w-full mt-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
          <div 
            v-for="(val, label, index) in message.message" 
            :key="label" 
            class="flex justify-between items-center py-2 px-3 text-sm"
            :class="{ 'border-b border-slate-200 dark:border-slate-700': index !== Object.keys(message.message).length - 1 }"
          >
            <span class="font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ label }}
            </span>
            <span class="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[60%]">
              {{ val }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-6">
          <Button @click="rejectCallback" label="Cancelar" severity="secondary" variant="outlined" />
          <Button @click="acceptCallback" label="Eliminar" severity="danger" />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>