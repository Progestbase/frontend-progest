<template>
  <div class="flex items-center gap-4">
      <div class="flex w-full items-center rounded-l-lg bg-white p-8 border-2">
          <img :src="image" :alt="productName" class="mr-6 max-w-full max-h-32 object-contain rounded-md">
          <div class="space-y-2 flex-1">
              <h2 class="text-xl font-semibold text-azul-eclipse">{{ productName }}</h2>
              <p class="text-azul-eclipse">Unidade: <span>{{ unit }}</span></p>
              <p class="text-azul-eclipse">Marca: <span>{{ brand }}</span></p>
          </div>
      </div>

      <div class="flex items-center space-y-2 bg-white py-[72px] rounded-r-lg border-2 max-w-72 w-full justify-around">
          <input
              type="number"
              :value="quantity"
              name="quantidade"
              id="quantidade"
              class="w-20 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleQuantityChange"
          />
          
          <button 
              class="bg-red-600 text-white ml-4 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg"
              @click="removeProduct" 
          >
              Remover
          </button>
      </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { API_URL } from '@/config';

export default {
  name: 'ProductCartTemplate',
  props: {
      productId: Number,
      productName: String,
      unit: String,
      image: String,
      brand: String,
      quantity: Number, 
  },

  methods: {
    handleQuantityChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const newQuantity = parseInt(target.value, 10); // Converte o valor para número
        if (!isNaN(newQuantity)) {
            this.$emit('update-quantity', this.productId, newQuantity); // Emite o evento com productId e newQuantity
        }

        if (newQuantity <= 0) {
            this.removeProduct()
        }
    },

    async removeProduct() {
        try {
            // Faz a requisição DELETE para remover o item do carrinho
            await axios.delete(`${API_URL}/cart/remove/${this.productId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Substitua com seu método de obtenção do token
                },
            });
            // Emite o evento após remover com sucesso
            this.$emit('remove-product', this.productId);
        } catch (error) {
            console.error('Erro ao remover o produto:', error);
            // Aqui você pode adicionar uma mensagem de erro se necessário
        }
    },
  },
};
</script>
