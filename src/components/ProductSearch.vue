<template>
    <main class="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
        <h1 class="text-center text-4xl font-extrabold mb-8 text-azul-eclipse">
            Buscar Item
        </h1>
        
        <!-- Barra de pesquisa -->
        <div class="mb-8 relative w-full max-w-xl">
            <!-- Input com imagem de lupa como background -->
            <input type="text" v-model="searchQuery" placeholder="Pesquise por um produto..."
                class="w-full px-6 py-4 pl-12 border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            <!-- Ícone de lupa posicionado dentro do campo -->
            <img src="../../src/components/icons/lupa.svg" alt="Ícone lupa"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6" />
        </div>

        <!-- Passando os produtos filtrados para o ProductTemplate -->
        <ProductTemplate />
    </main>
</template>

<script>
import ProductTemplate from './ProductTemplate.vue';

export default {
    data() {
        return {
            searchQuery: "",
            products: [
                { id: 1, name: "Produto 1", description: "Descrição do Produto 1", price: 20.99, image: "url_da_imagem_1" },
                { id: 2, name: "Produto 2", description: "Descrição do Produto 2", price: 30.99, image: "url_da_imagem_2" },
                { id: 3, name: "Produto 3", description: "Descrição do Produto 3", price: 40.99, image: "url_da_imagem_3" },
                // Adicione mais produtos conforme necessário
            ],
        };
    },
    computed: {
        filteredProducts() {
            return this.products.filter((product) => {
                return product.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        },
    },
    methods: {
        addToCart(product) {
            // Lógica para adicionar o produto ao carrinho
            console.log("Produto adicionado ao carrinho:", product);
        },
    },
    components: {
        ProductTemplate,
    },
};
</script>

<style scoped>
/* Estilos adicionais, caso necessário */
</style>
