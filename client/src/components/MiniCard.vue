<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon:  { type: String, required: true },
  color: { type: String, default: 'blue' },
  size:  { type: String, default: 'xl' }
});

const sizeStyles = {
  'xs':   'text-xs!',
  'sm':   'text-sm!',
  'base': 'text-base!',
  'lg':   'text-lg!',
  'xl':   'text-xl!',
  '2xl':  'text-2xl!'
};

const containerStyles = {
  slate:   'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-300',
  gray:    'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-gray-300',
  zinc:    'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-300',
  neutral: 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-300',
  stone:   'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-700/50 text-stone-800 dark:text-stone-300',
  red:     'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200',
  orange:  'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-500/30 text-orange-800 dark:text-orange-200',
  amber:   'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200',
  yellow:  'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200',
  lime:    'bg-lime-50 dark:bg-lime-900/30 border-lime-200 dark:border-lime-500/30 text-lime-800 dark:text-lime-200',
  green:   'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200',
  teal:    'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-200',
  cyan:    'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-200',
  sky:     'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-200',
  blue:    'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200',
  indigo:  'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-200',
  violet:  'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-500/30 text-violet-800 dark:text-violet-200',
  purple:  'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-200',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-900/30 border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-800 dark:text-fuchsia-200',
  pink:    'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-500/30 text-pink-800 dark:text-pink-200',
  rose:    'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200',
};

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
  <div class="flex items-center gap-3 p-1 rounded-xl border" :class="containerStyles[color]">
    <div class="grid place-items-center size-8 text-lg! rounded-lg text-white" :class="iconStyles[color]">
      <i :class="icon"></i>
    </div>
    <span class="text-sm! font-medium! flex-1 whitespace-nowrap">
      {{ label }}
    </span>
    <span :class="sizeStyles[size] || sizeStyles.base" class="font-bold pl-1 pr-1.5 whitespace-nowrap">
      {{ value }}
    </span>
  </div>
</template>