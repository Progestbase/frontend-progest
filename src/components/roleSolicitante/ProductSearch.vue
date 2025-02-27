<template>
    <main class="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
        <h1 class="text-center text-4xl font-extrabold mb-8 text-azul-eclipse">
            Buscar Item
        </h1>
        <!-- Barra de pesquisa -->
        <div class="mb-8 relative w-full max-w-xl">
            <input type="text" v-model="searchQuery" @input="searchProducts" placeholder="Pesquise por um produto..."
                class="w-full px-6 py-4 pl-12 border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            <img src="../../../src/components/icons/lupa.svg" alt="Ícone lupa"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6" />
        </div>

        <div v-for="product in filteredProducts" :key="product.id"
            class="w-full hover:scale-105 transition-all duration-300 ease-in-out mb-4">
            <ProductTemplate ref="productTemplates" :productId="product.id" :productName="product.name"
                :unit="product.unit" :image="product.image_url" :brand="product.brand"
                @update-quantity="updateSelectedQuantities" />
        </div>

        <button
            class="fixed bottom-4 right-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
            @click="addToCart">
            Adicionar ao pedido
        </button>

        <!-- Indicador de carregamento -->
        <div v-if="loading" class="flex justify-center items-center space-x-2 p-4">
            <div class="animate-spin rounded-full h-5 w-5 border-4 border-t-4 border-blue-600 border-t-transparent"></div>
            <span class="text-blue-600">Carregando mais produtos...</span>
        </div>

        <div v-if="showMessage" :class="{
            'fixed': true,
            'top-20': true,
            'right-0': true,
            'bg-green-500': successMessage,
            'bg-red-500': !successMessage,
            'text-white': true,
            'shadow-lg': true,
            'p-4': true,
            'rounded-md': true,
            'transform': true,
            'transition-all': true,
            'duration-500': true,
            'ease-out': true,
            'translate-x-full': !showMessage,
            'translate-x-0': showMessage,
            'max-w-sm': true,
            'w-full': true
        }">
            <div class="flex items-center justify-between">
                {{ message }}
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';
import ProductTemplate from './ProductTemplate.vue'; // Ajuste o caminho conforme necessário
import { API_URL } from '@/config';

export default {
    components: {
        ProductTemplate,
    },

    data() {
        return {
            cart: [],
            searchQuery: "",
            products: [],
            filteredProducts: [],
            selectedQuantities: {},
            loading: false,
            page: 1,
            hasMoreProducts: true,
            message: "",
            successMessage: false,
            showMessage: false,
            apiUrl: API_URL,
        };
    },

    methods: {
        resetProductQuantities() {
            console.log('Resetando quantidades');
            this.$refs.productTemplates.forEach((template) => {
                template.resetQuantity();
            });
        },

        updateSelectedQuantities({ productId, quantity }) {
            // Atualiza a quantidade temporária para cada produto
            if (quantity > 0) {
                this.selectedQuantities[productId] = quantity;
            } else {
                delete this.selectedQuantities[productId]; // Remove se a quantidade for 0
            }
        },

        async addToCart() {
            const itemsToAdd = Object.entries(this.selectedQuantities).map(([productId, quantity]) => ({
                product_id: productId,
                quantity,
            }));

            if (itemsToAdd.length <= 0) {
                this.message = "Selecione um produto para adicionar ao carrinho!";
                this.successMessage = false;
                this.showMessage = true;
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${this.apiUrl}/cart/add`, { items: itemsToAdd }, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                // Verifica se a resposta contém uma mensagem de sucesso
                if (response.data.message) {
                    this.message = response.data.message; // Mensagem retornada pela API
                    this.successMessage = true;
                } else {
                    this.message = "Erro ao adicionar produtos ao carrinho!";
                    this.successMessage = false;
                }
            } catch (error) {
                console.error("Erro ao adicionar ao carrinho:", error);
                this.message = "Erro ao adicionar produto ao carrinho!"; // Mensagem de erro genérica
                this.successMessage = false;
            } finally {
                this.showMessage = true;
                setTimeout(() => {
                    this.showMessage = false;
                }, 4000);

                // Limpa o objeto de quantidades selecionadas após adicionar ao carrinho
                this.selectedQuantities = {};
                this.resetProductQuantities();
            }
        },


        async searchProducts() {
            const normalizedSearchQuery = this.normalizeString(this.searchQuery);
            const localResults = this.products.filter(product =>
                this.normalizeString(product.name).includes(normalizedSearchQuery)
            );

            if (localResults.length === 0 && this.searchQuery.length > 0) {
                await this.loadProducts();
            } else {
                this.filteredProducts = localResults;
            }
        },

        normalizeString(str) {
            const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalized.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
        },

        async loadProducts() {
            if (this.loading || !this.hasMoreProducts) return;

            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${this.apiUrl}/products?page=${this.page}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.data.data && response.data.data.length > 0) {
                    this.products = [...this.products, ...response.data.data];
                    this.page++;
                    this.searchProducts();
                } else {
                    this.hasMoreProducts = false;
                }
            } catch (error) {
                console.error("Erro ao carregar produtos:", error.response ? error.response.data : error.message);
            } finally {
                this.loading = false;
            }
        },

        handleScroll() {
            const scrollPosition = window.scrollY + window.innerHeight;
            const bottomPosition = document.documentElement.scrollHeight;

            if (scrollPosition >= bottomPosition - 100) {
                this.loadProducts();
            }
        },
    },

    created() {
        this.loadProducts();
        window.addEventListener('scroll', this.handleScroll);
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    
};
</script>

<style scoped>
/* Estilos adicionais, caso necessário */
</style>
