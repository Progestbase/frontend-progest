<template>
    <div class="flex justify-start items-center min-h-screen flex-col mt-24">
        <div class="max-w-4xl w-full mb-24">
            <div>
                <h2 class="text-3xl text-azul-eclipse font-bold">
                    Finalizar pedido
                    <span class="font-light italic"> ({{ qtdItensCarrinho }} itens)</span>
                </h2>
            </div>

            <div class="bg-azul-eclipse flex justify-between w-full p-2 text-white">
                <p class="ml-4">Produto</p>
                <div class="flex gap-24 mr-8">
                    <p>Quantidade</p>
                    <p>Ação</p>
                </div>
            </div>

            <div v-for="item in cart" :key="item.id"
                class="w-full hover:shadow-lg transition-all duration-300 ease-in-out mb-4">
                <ProductCartTemplate class="mt-4" :productId="item.id" :productName="item.product.name"
                    :unit="item.product.unit" :image="item.product.image_url" :brand="item.product.brand"
                    :quantity="item.quantity" @update-quantity="updateCartQuantity" @remove-product="removeFromCart" />
            </div>

            <div v-if="cart.length > 0" class="w-full flex flex-col">
                <h3 class="text-azul-eclipse font-bold">Justificativa</h3>

                <textarea v-model="justificativa"
                    placeholder="Descreva resumidamente o motivo para qual deseja o item..."
                    class="resize-none w-full h-32 p-3 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-eclipse">
                </textarea>

                <div class="flex justify-between mt-6">
                    <button
                        class="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-yellow-300"
                        @click="adicionarItem">
                        Adicionar mais itens
                    </button>

                    <button
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-green-300"
                        @click="finalizarPedido">
                        Finalizar pedido
                    </button>
                </div>
            </div>

            <MensagemCarrinhoVazio v-if="cart.length === 0" @goToShop="navigateToShop" />


        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { API_URL } from '@/config';
import ProductCartTemplate from './ProductCartTemplate.vue';
import MensagemCarrinhoVazio from './MensagemCarrinhoVazio.vue';

export default {
    components: {
        ProductCartTemplate,
        MensagemCarrinhoVazio,
    },
    data() {
        return {
            cart: [],
            qtdItensCarrinho: 0,
            apiUrl: API_URL,
            token: localStorage.getItem('token'),
        };
    },
    created() {
        this.loadCart();
    },
    methods: {
        navigateToShop() {
    this.$router.push('/produtos');
},

        async loadCart() {
            try {
                const response = await axios.get(`${this.apiUrl}/cart/items`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.cart = response.data;
                this.updateCartCount();
            } catch (error) {
                console.error('Erro ao carregar o carrinho:', error);
            }
        },
        async updateCartQuantity(productId, newQuantity) {
            try {
                await axios.put(`${this.apiUrl}/cart/update/${productId}`, {
                    quantity: newQuantity,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                const product = this.cart.find(p => p.id === productId);
                if (product) {
                    product.quantity = newQuantity;
                    this.updateCartCount();
                }
            } catch (error) {
                console.error('Erro ao atualizar a quantidade:', error);
            }
        },
        removeFromCart(productId) {
            this.cart = this.cart.filter(p => p.id !== productId);
            this.updateCartCount();
        },
        updateCartCount() {
            this.qtdItensCarrinho = this.cart.reduce((acc, item) => acc + item.quantity, 0);
        }
    },
};
</script>