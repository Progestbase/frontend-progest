<template>
  <div class="flex items-center gap-4">
    <div class="flex w-full items-center rounded-l-lg bg-white p-8">
      <img :src="image" :alt="productName" class="mr-6 max-w-full max-h-32 object-contain rounded-md">
      <div class="space-y-2 flex-1">
        <h2 class="text-xl font-semibold text-azul-eclipse">{{ productName }}</h2>
        <p class="text-azul-eclipse">Unidade: <span>{{ unit }}</span></p>
        <p class="text-azul-eclipse">Marca: <span>{{ brand }}</span></p>
      </div>
    </div>

    <div class="flex flex-col items-center space-y-2 bg-white p-[60px] rounded-r-lg">
      <label for="quantidade" class="text-azul-eclipse font-medium">Quantidade</label>
      <input
        type="number"
        v-model="quantity"
        name="quantidade"
        id="quantidade"
        class="w-20 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ProductTemplate',
  props: {
    productName: String,
    unit: String,
    image: String,
    brand: String,
    productId: Number,
  },
  data() {
    return {
      quantity: '' as string | number, // Quantidade selecionada para este produto
    };
  },
  methods: {
    updateQuantity() {
      // Emitir a quantidade alterada para o componente pai
      this.$emit('update-quantity', {
        productId: this.productId,
        quantity: this.quantity,
      });
    },
  },
  watch: {
    quantity(newQuantity) {
      this.updateQuantity(); // Quando a quantidade mudar, atualizar no pai
    },
  },
};
</script>
