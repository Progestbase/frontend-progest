<template>
  <div :class="['rounded-lg shadow-md flex flex-col transition-all transform duration-300', cardClass, 'hover:shadow-lg hover:scale-105']">
    <div class="flex justify-between p-6 h-full">
      <div class="flex flex-col items-start justify-center">
        <p class="text-6xl font-bold">{{ number }}</p>
        <p class="mt-2 font-semibold">{{ title }}</p>
      </div>
      <img class="w-1/3" :src="icon" :alt="`Ícone ${title}`">
    </div>
    <button :class="['px-4 py-2 rounded-b', buttonClass]">Visualizar</button>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    number: Number,
    icon: String,
    cardClass: String,
    buttonClass: String
  }
}
</script>

<style scoped>
/* Você pode adicionar estilos personalizados aqui, se necessário */
</style>
