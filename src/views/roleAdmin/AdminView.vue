<template>
    <div class="grid grid-cols-12 h-screen bg-gray-100 font-sans">
      <Sidebar />
  
      <main class="col-span-10 grid grid-rows-[auto,1fr]">
        <Header :userName="userName" :userRole="userRole"/>
  
        <section class="grid grid-cols-3 gap-4 p-6 h-2/3 text-off-white">
          <Card
            v-for="(card, index) in cards"
            :key="index"
            :title="card.title"
            :number="card.number"
            :icon="card.icon"
            :cardClass="card.cardClass"
            :buttonClass="card.buttonClass"
          />
        </section>
      </main>
    </div>
  </template>
  
  <script>
  import Sidebar from "@/components/roleAdmin/Sidebar.vue";
  import Header from "@/components/roleAdmin/Header.vue";
  import Card from "@/components/roleAdmin/Card.vue";
  import axios from "axios";
  import { API_URL } from '@/config';

  
  export default {
    components: {
      Sidebar,
      Header,
      Card,
    },
    data() {
      return {
        apiUrl: API_URL,
        userName: "",
        userRole: "Admin", // Você pode ajustar conforme necessário
        cards: [
          {
            title: "Pedidos pendentes",
            icon: "../../src/components/icons/carrinho.svg",
            cardClass: "bg-yellow-300",
            buttonClass: "bg-yellow-400 hover:bg-yellow-500",
          },
          {
            title: "Usuários",
            icon: "../../src/components/icons/adicionar-usuario.svg",
            cardClass: "bg-blue-300",
            buttonClass: "bg-blue-400 hover:bg-blue-500",
          },
          {
            title: "Produtos abaixo do mínimo",
            icon: "../../src/components/icons/sirene.svg",
            cardClass: "bg-red-300",
            buttonClass: "bg-red-400 hover:bg-red-500",
          },
          {
            title: "Produtos próximo ao vencimento",
            icon: "../../src/components/icons/atencao.svg",
            cardClass: "bg-orange-300",
            buttonClass: "bg-orange-400 hover:bg-orange-500",
          },
          {
            title: "Farmácias",
            icon: "../../src/components/icons/farmacia.svg",
            cardClass: "bg-green-300",
            buttonClass: "bg-green-400 hover:bg-green-500",
          },
        ],
      };
    },
    created() {
      this.fetchUserInfo();
      this.fetchData();
    },
    methods: {
      async fetchUserInfo() {
        try {
          // Recupera o token do localStorage
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Token não encontrado");
            this.$router.push("/login");
            return;
          }
  
          // Define os headers com o token
          const headers = {
            Authorization: `Bearer ${token}`,
          };
  
          // Faz a requisição para obter informações do usuário
          const response = await axios.get(`${this.apiUrl}/user`, {
            headers,
          });
  
          // Atualiza os dados do usuário
          this.userName = response.data.name; // Certifique-se de que o nome vem no campo correto
          this.userRole = response.data.role;
        } catch (error) {
          console.error("Erro ao buscar informações do usuário:", error);
  
          // Redireciona para login em caso de erro (ex.: token expirado ou inválido)
          this.$router.push("/login");
        }
      },
      async fetchData() {
        try {
          const token = localStorage.getItem("token");
          const headers = {
            Authorization: `Bearer ${token}`,
          };
  
          const responseCountUsers = await axios.get(
            `${this.apiUrl}/countUsers`,
            { headers }
          );
  
          const responseBelowMinimumStock = await axios.get(
            `${this.apiUrl}/count-below-minimum-stock`,
            { headers }
          );
          const responseExpiringSoon = await axios.get(
            `${this.apiUrl}/count-expiring-soon`,
            { headers }
          );
  
          this.cards[0].number = 0;
          this.cards[1].number = responseCountUsers.data.count;
          this.cards[2].number = responseBelowMinimumStock.data.count;
          this.cards[3].number = responseExpiringSoon.data.count;
          this.cards[4].number = 7;
        } catch (error) {
          console.error(error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Estilos gerais do DashboardView, se necessário */
  </style>
  