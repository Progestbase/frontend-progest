<template>
  <div>
    <!-- Exibe AdminView se a role for admin -->
    <AdminView v-if="userRole === 'A'" />
    
    <!-- Exibe SolicitanteView se a role for solicitante -->
    <ItensView v-if="userRole === 'S'" />
    
    <!-- Caso a role não seja reconhecida, exibe uma mensagem de erro -->
    <p v-if="userRole === null">Acesso negado! Role não reconhecida.</p>
  </div>
</template>

<script>
import AdminView from '@/views/roleAdmin/AdminView.vue';
import ItensView from '@/views/roleSolicitante/ItensView.vue';

export default {
  name: 'DashboardView',
  components: {
    AdminView,
    ItensView
  },
  data() {
    return {
      // Obtém a role do usuário a partir do localStorage
      userRole: localStorage.getItem('role') // A role pode ser 'admin' ou 'solicitante'
    };
  },
  mounted() {
    console.log('User Role:', this.userRole); // Log para ver o valor de userRole
  }
};
</script>

<style>
</style>
