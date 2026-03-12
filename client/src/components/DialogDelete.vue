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
      <div class="flex flex-col items-center p-8 bg-slate-0 dark:bg-slate-850">
        <i class="fi-rr-hexagon-exclamation text-4xl! text-red-400!"></i>
        <span class="mt-4 font-bold text-xl!">{{ message.header }}</span>
        <p class="mt-2 text-center">¿Está seguro de eliminar este registro?</p>
        <div class="flex flex-col gap-2 mt-3 p-2 w-full rounded-lg text-sm bg-slate-50 dark:bg-slate-800">
          <div v-for="(val, label) in message.message" :key="label" class="flex justify-between gap-3">
            <span class="font-semibold text-left whitespace-nowrap leading-none">{{ label }}:</span>
            <span class="ml-4 text-right leading-4">{{ val }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <Button @click="rejectCallback" label="Cancelar" severity="secondary" variant="outlined" />
          <Button @click="acceptCallback" label="Eliminar" severity="danger" />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>