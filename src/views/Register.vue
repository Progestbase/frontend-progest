<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-center text-gray-800 mb-4">Cadastro de Usuário</h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="Digite seu nome"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Digite seu e-mail"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Digite sua senha"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirmar Senha</label>
          <input
            type="password"
            id="password_confirmation"
            v-model="passwordConfirmation"
            placeholder="Confirme sua senha"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Registrar
        </button>
      </form>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">Já tem uma conta? <a href="/login" class="text-blue-600 hover:underline">Faça login</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    };
  },
  methods: {
    async submitForm() {
      const formData = {
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      };

      try {
        await axios.post("http://localhost:8000/api/register", formData);
        this.$router.push("/login");
      } catch (error) {
        console.error("Erro ao registrar usuário", error.response.data);
      }
    },
  },
};
</script>

<style scoped>
/* Estilos simplificados */
input, button {
  transition: all 0.3s ease;
}

input:focus, button:hover {
  transform: scale(1.03);
}
</style>
