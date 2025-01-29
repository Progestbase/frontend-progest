<template>
  <div>
    <!-- Exibe AdminView se a role for admin -->
    <AdminView v-if="userRole === 'admin'" />
    
    <!-- Exibe SolicitanteView se a role for solicitante -->
    <SolicitanteView v-if="userRole === 'solicitante'" />
    
    <!-- Caso a role não seja reconhecida, exibe uma mensagem de erro -->
    <p v-if="userRole === null">Acesso negado! Role não reconhecida.</p>
  </div>
</template>

<script>
import AdminView from '@/views/AdminView.vue';
import SolicitanteView from '@/views/SolicitanteView.vue';

export default {
  name: 'DashboardView',
  components: {
    AdminView,
    SolicitanteView
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
