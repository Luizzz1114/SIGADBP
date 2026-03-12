<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  name: { type: String, required: false, default: '' },
  label: { type: String, default: '' },
  modelValue: { type: [Number, String], default: 0 },
  currency: { type: String, default: 'USD' },
  disabled: { type: Boolean, default: false },
  message: { type: String, default: ''},
  error: { type: String, default: '' },
  showButton: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  btnIcon: { type: String, default: 'fi-sr-refresh' },
  required: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'btnClick']);

// Si prefieres coma decimal (Venezuela), cambia 'en-US' por 'es-VE'
const formatter = new Intl.NumberFormat('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true // ¡Esto es lo que agrega los puntos de miles! (1.000,00)
});

const displayValue = ref('');

const formatValue = (val) => {
  if (val === null || val === undefined || val === '') return '0.00';
  return formatter.format(Number(val));
};

watch(() => props.modelValue, (newValue) => {
  displayValue.value = formatValue(newValue);
}, { immediate: true });

const handleInput = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  if (!value) value = '0';
  const floatValue = parseInt(value, 10) / 100;
  emit('update:modelValue', floatValue);
  displayValue.value = formatter.format(floatValue);
};
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="name">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative flex items-center">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
        {{ currency === 'USD' ? '$' : 'Bs.' }}
      </span>
      <InputText 
        :id="name || null" 
        :name="name || null"
        :model-value="displayValue" 
        @input="handleInput"
        :readonly="disabled"
        class="text-right pl-8"
        autocomplete="off" 
        size="small" 
        fluid
        v-keyfilter.int
        maxlength="12"
      />
      <Button 
        v-if="showButton"
        type="button" 
        :icon="btnIcon" 
        @click="emit('btnClick')" 
        :loading="loading"
        class="size-9! shrink-0! ml-2!"
        severity="secondary"
        variant="outlined"
        v-tooltip.top="'Actualizar tasa BCV'"
      />
    </div>
    <small v-if="message" class="text-slate-400 dark:text-slate-500 text-xs">{{ message }}</small>
    <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
  </div>
</template>