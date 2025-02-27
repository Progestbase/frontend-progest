<template>
    <div class="bg-[#f7f8fc] min-h-screen">
    <HeaderSolicitante :userName="userName" :userRole="userRole" />
    <FinalizarPedido />
  </div>
  </template>
  
  <script>
  import axios from 'axios';
  import HeaderSolicitante from '@/components/roleSolicitante/HeaderSolicitante.vue';
  import FinalizarPedido from '@/components/roleSolicitante/FinalizarPedido.vue';
  import { API_URL } from '@/config';
  export default {
    name: 'PedidoView',
    components: {
    HeaderSolicitante,
    FinalizarPedido,
    },
    data() {
    return {
      userName: "",
      userRole: "",
      apiUrl: API_URL, // Ajuste conforme necessário
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

        const response = await axios.get(`${this.apiUrl}/user`, {
          headers,
        });

        this.userName = response.data.name; // Certifique-se de que o nome vem no campo correto
        this.userRole = response.data.role;
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
        this.$router.push("/login");
      }
    },
  }
  };
  </script>
  
  
  <style scoped>
  /* Estilos gerais do DashboardView, se necessário */
  </style>
  