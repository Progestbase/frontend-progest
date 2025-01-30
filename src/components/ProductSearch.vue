<template>
    <main class="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
        <h1 class="text-center text-4xl font-extrabold mb-8 text-azul-eclipse">
            Buscar Item
        </h1>
        <!-- Barra de pesquisa -->
        <div class="mb-8 relative w-full max-w-xl">
            <input type="text" v-model="searchQuery" @input="searchProducts" placeholder="Pesquise por um produto..."
                class="w-full px-6 py-4 pl-12 border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            <img src="../../src/components/icons/lupa.svg" alt="Ícone lupa"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6" />
        </div>


        <!-- Passando os produtos filtrados para o ProductTemplate -->
        <div v-for="product in filteredProducts" :key="product.id"
            class="w-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out mb-4">
            <ProductTemplate :productId="product.id" :productName="product.name" :unit="product.unit"
                :image="product.image_url" :brand="product.brand" @update-quantity="updateQuantity" />
        </div>

        

        <!-- Botão Adicionar ao pedido fixo no canto inferior esquerdo -->
        <button
            class="fixed bottom-4 right-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
            @click="addAllToCart">
            Adicionar ao pedido
        </button>
    </main>
</template>


<script>
import axios from 'axios';
import ProductTemplate from './ProductTemplate.vue'; // Ajuste o caminho conforme necessário

export default {
    data() {
        return {
            searchQuery: "",
            products: [],
            filteredProducts: [],
            cart: [],
            selectedQuantities: {},
            loading: false, // Estado de carregamento
            page: 1, // Página inicial
            hasMoreProducts: true, // Verifica se há mais produtos para carregar
        };
    },
    methods: {
        async searchProducts() {
            // Busca local nos produtos carregados
            const normalizedSearchQuery = this.normalizeString(this.searchQuery);
            const localResults = this.products.filter(product =>
                this.normalizeString(product.name).includes(normalizedSearchQuery)
            );

            // Se não encontrar nada, faz a requisição na API
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
            if (this.loading || !this.hasMoreProducts) return; // Impede múltiplas requisições simultâneas

            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/products?page=${this.page}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Verifica se a resposta contém produtos
                if (response.data.data && response.data.data.length > 0) {
                    this.products = [...this.products, ...response.data.data];
                    this.page++; // Incrementa a página para próxima requisição
                    this.searchProducts(); // Realiza a busca após carregar os novos produtos
                } else {
                    this.hasMoreProducts = false; // Não há mais produtos para carregar
                }

                console.log("Produtos carregados com sucesso:", this.products);
            } catch (error) {
                console.error("Erro ao carregar produtos:", error.response ? error.response.data : error.message);
            } finally {
                this.loading = false;
            }
        },

        updateQuantity({ productId, quantity }) {
            this.$set(this.selectedQuantities, productId, quantity);
        },

        addAllToCart() {
            const productsToAdd = Object.keys(this.selectedQuantities).map((productId) => {
                const quantity = this.selectedQuantities[productId];
                if (quantity > 0) {
                    const product = this.products.find((prod) => prod.id === Number(productId));
                    return {
                        productId: product.id,
                        productName: product.name,
                        quantity: quantity,
                        unit: product.unit,
                        image: product.image,
                        brand: product.brand,
                    };
                }
            }).filter(item => item !== undefined);

            productsToAdd.forEach(product => {
                const existingProduct = this.cart.find(item => item.productId === product.productId);
                if (existingProduct) {
                    existingProduct.quantity += product.quantity;
                } else {
                    this.cart.push(product);
                }
            });

            console.log('Carrinho atualizado:', this.cart);
        },

        // Detecta o scroll e carrega mais produtos
        handleScroll() {
            const scrollPosition = window.scrollY + window.innerHeight;
            const bottomPosition = document.documentElement.scrollHeight;

            if (scrollPosition >= bottomPosition - 100) {
                this.loadProducts(); // Carrega mais produtos
            }
        },
    },

    created() {
        this.loadProducts(); // Carrega os produtos assim que o componente for criado
        window.addEventListener('scroll', this.handleScroll); // Adiciona o evento de scroll
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll); // Remove o evento de scroll
    },

    components: {
        ProductTemplate, // Certifique-se de que ProductTemplate está sendo registrado aqui
    },
};
</script>


<style scoped>
/* Estilos adicionais, caso necessário */
</style>
