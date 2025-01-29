<template>
  <div class=" bg-gray-100 rounded-lg w-full p-6">
    <div class="bg-white rounded-lg shadow-md flex items-center space-x-4">
      <img src="../../src/assets/alcool-em-gel.png" alt="Alcóol em gel" class="w-16 h-16 object-cover rounded-full">
      <div class="space-y-2 flex-1">
        <h2 class="text-xl font-semibold text-gray-800">Alcóol em gel</h2>
        <p class="text-gray-600">Unidade: Frasco</p>
        <p class="text-gray-600">Marca: XXX</p>
      </div>
      <div class="flex items-center flex-col space-y-2">
        <label for="Quantidade" class="text-gray-700 font-medium">Quantidade</label>
        <input type="number" name="Quantidade" id="Quantidade" class="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value="0" min="0">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductTemplate',
  props: {
    products: Array,  // Espera uma lista de produtos como prop
  },
  methods: {
    addToCart(product) {
      // Lógica para adicionar o produto ao carrinho
      console.log("Produto adicionado ao carrinho:", product);
    },
  },
};
</script>

<style scoped>
/* Adicione estilos aqui, se necessário */
</style>
