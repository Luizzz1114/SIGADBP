<script setup></script>

<template>
  <div class="flex justify-end w-dvw h-dvh bg-linear-to-b bg-slate-200 overflow-hidden dark:bg-slate-800">
    <div class="flex flex-col items-center justify-center flex-1 md:p-4">
      <img src="../assets/images/analysis-bro.svg" class="max-w-md">
    </div>
    <div class="flex flex-col items-center w-full h-full bg-white border-s border-slate-300 md:w-104 dark:bg-slate-850 dark:border-slate-700">
      <div class="flex items-center gap-3 px-8 py-6 w-full text-slate-700 dark:text-slate-200">
        <div class="flex items-center justify-center shrink-0 p-1.5 h-10 w-12 rounded-md bg-blue-600">
          <img
            src="../assets/images/Mercal_logo.webp"
            alt="Mercal_logo"
            title="Mercal"
            class="max-h-full max-w-full object-contain"
          >
        </div>
        <div class="flex flex-col leading-tight overflow-hidden whitespace-nowrap duration-300 ease-in-out">
          <span class="font-bold text-lg">SIGADBP</span>
          <span class="text-sm -mt-1.5">Mercal Sucre</span>
        </div>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>