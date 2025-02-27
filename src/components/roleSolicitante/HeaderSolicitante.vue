<template>
  <header class="flex justify-between items-center bg-azul-eclipse p-4 shadow-md">
    <h2 class="text-4xl font-semibold text-white ml-2">Progest</h2>
    <nav class="flex items-center space-x-10 text-xl">
      <a href="/itens" class="text-white underline-effect">Itens</a>
      <a href="/historico-pedidos" class="text-white underline-effect">Histórico de Pedidos</a>
      <a href="/devolucoes" class="text-white underline-effect">Devoluções</a>
      <router-link to="/pedido" class="text-white underline-effect">Finalizar Pedido</router-link>


    </nav>
    <div class="flex items-center space-x-4">
      <div class="text-right">
        <p class="font-bold text-white">{{ userName }}</p>
        <p class="text-sm text-white">{{ userRole }}</p>
      </div>
      <!-- Importa e usa o botão de logout -->
      <LogoutButton />
    </div>
  </header>
</template>

<script>
import LogoutButton from '../LogoutButton.vue';

export default {
  name: 'Header',
  components: {
    LogoutButton,
  },
  props: {
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.underline-effect {
  position: relative;
}

.underline-effect::after {
  content: "";
  position: absolute;
  top: 90%;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: white;
  border-radius: 1rem;
  transition: width 0.3s ease, left 0.3s ease;
}

.underline-effect:hover::after {
  width: 100%;
  left: 0;
}
</style>
