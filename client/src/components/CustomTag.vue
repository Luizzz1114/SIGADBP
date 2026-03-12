<script setup>
const props = defineProps({
  value: String,
  icon: String,
  color: String
});

const iconStyles = {
  slate: 'bg-slate-500', gray: 'bg-gray-500', zinc: 'bg-zinc-500', neutral: 'bg-neutral-500',
  stone: 'bg-stone-500', red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
  yellow: 'bg-yellow-500', lime: 'bg-lime-500', green: 'bg-green-500', emerald: 'bg-emerald-500',
  teal: 'bg-teal-500', cyan: 'bg-cyan-500', sky: 'bg-sky-500', blue: 'bg-blue-500',
  indigo: 'bg-indigo-500', violet: 'bg-violet-500', purple: 'bg-purple-500', fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500', rose: 'bg-rose-500',
};
</script>

<template>
  <span class="inline-flex items-center justify-center w-fit gap-2 rounded-full whitespace-nowrap">
    <div :class="iconStyles[color]" class="p-1 rounded-md text-white">
      <i :class="icon" class="text-[0.75rem]"></i>
    </div>
    {{ value }}
  </span>
</template>