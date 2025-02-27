<template>
  <div class="flex items-center gap-4">
    <div class="flex w-full items-center rounded-l-lg bg-white p-8 border border-azul-eclipse">
      <img :src="image" :alt="productName" class="mr-6 max-w-full max-h-32 object-contain rounded-md">
      <div class="space-y-2 flex-1">
        <h2 class="text-xl font-semibold text-azul-eclipse">{{ productName }}</h2>
        <p class="text-azul-eclipse">Unidade: <span>{{ unit }}</span></p>
        <p class="text-azul-eclipse">Marca: <span>{{ brand }}</span></p>
      </div>
    </div>

    <div class="flex flex-col items-center space-y-2 bg-white p-[60px] rounded-r-lg border border-azul-eclipse">
      <label for="quantidade" class="text-azul-eclipse font-medium">Quantidade</label>
      <input
        type="number"
        v-model.number="quantity"
        name="quantidade"
        id="quantidade"
        class="w-20 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-azul-eclipse"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ProductTemplate',
  props: {
    productId: Number, // ID do produto
    productName: String,
    unit: String,
    image: String,
    brand: String,
  },
  data() {
    return {
      quantity: "", // Inicializado como número
    };
  },
  methods: {
    updateQuantity() {
      this.$emit('update-quantity', {
        productId: this.productId,
        quantity: this.quantity,
      });
    },
    resetQuantity() {
      this.quantity = ""; // Reseta a quantidade
    },
  },
  watch: {
    quantity() {
      this.updateQuantity(); // Chama updateQuantity quando a quantidade muda
    },
  },
};
</script>
