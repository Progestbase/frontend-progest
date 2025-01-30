<template class="">
  <div class="bg-[#f7f8fc] min-h-screen">
    <HeaderSolicitante :userName="userName" :userRole="userRole" />
  <ProductSearch />
  </div>
  
</template>

<script>
import HeaderSolicitante from '@/components/HeaderSolicitante.vue';
import ProductSearch from '@/components/ProductSearch.vue';
import axios from 'axios';

export default {
  name: "SolicitanteView",
  components: {
    HeaderSolicitante,
    ProductSearch,
  },
  data() {
    return {
      userName: "",
      userRole: "Solicitante", // Ajuste conforme necessário
    };
  },
  created() {
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado");
          this.$router.push("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get("http://localhost:8000/api/user", {
          headers,
        });

        this.userName = response.data.name; // Certifique-se de que o nome vem no campo correto
        this.userRole = response.data.role;
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
/* Estilos adicionais, caso necessário */
</style>
