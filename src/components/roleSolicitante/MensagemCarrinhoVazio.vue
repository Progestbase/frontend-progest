<template>
    <div class="flex flex-col items-center justify-center py-12">
        <img src="../../../src/components/icons/carrinho-vazio.svg" alt="Carrinho vazio" class="w-48 h-48 mb-4">
        <h3 class="text-2xl font-bold text-gray-700">Seu carrinho está vazio</h3>
        <p class="text-gray-500">Adicione itens para finalizar seu pedido.</p>
        <button 
    class="mt-6 bg-azul-eclipse text-white px-6 py-2 rounded-lg hover:bg-azul-eclipse-dark transition-all transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-azul-eclipse-light"
    @click="$emit('goToShop')">
    Explorar itens
</button>

    </div>
</template>

<script>
export default {
    name: 'MensagemCarrinhoVazio'
};
</script>

<style scoped>
/* Adicione estilos específicos, se necessário */
</style>