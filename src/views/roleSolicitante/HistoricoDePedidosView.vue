<template>
    <div class="bg-[#f7f8fc] min-h-screen flex flex-col">
      <HeaderSolicitante :userName="userName" :userRole="userRole" class="" />
      <div class="flex flex-col items-center w-4/5 h-48 bg-white border border-red-900">
        <h2 class="text-azul-eclipse font-bold text-3xl self-start">Histórico de Pedidos</h2>
        <Pedidos />
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import HeaderSolicitante from '@/components/roleSolicitante/HeaderSolicitante.vue';
  import Pedidos from '@/components/roleSolicitante/Pedidos.vue';
  import { API_URL } from '@/config';
  export default {
    name: 'PedidoView',
    components: {
    HeaderSolicitante,
    Pedidos,
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
  