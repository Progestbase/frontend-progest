<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div
      class="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl"
    >
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 animate__animated animate__fadeIn">PROGEST - Acesso ao Sistema</h2>
        <p class="text-gray-600 mt-1 animate__animated animate__fadeIn animate__delay-1s">Faça login para acessar o sistema.</p>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Digite seu email"
            class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ease-in-out"
            :class="{'border-red-500': errorMessage}"
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
            class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ease-in-out"
            :class="{'border-red-500': errorMessage}"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 text-white bg-blue-800 rounded-md shadow-md hover:bg-blue-900 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:opacity-50 transition-all ease-in-out"
          :disabled="loading"
        >
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>

        <div class="flex justify-between items-center text-sm">
          <p v-if="errorMessage" class="text-center text-red-600 mt-2 animate__animated animate__fadeIn animate__delay-1s">
            <span class="mr-2 text-red-700">⚠️</span>{{ errorMessage }}
          </p>
          <p @click="forgotPassword" class="text-blue-600 hover:underline cursor-pointer transition-all ease-in-out">
            Esqueceu sua senha?
          </p>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">Não tem uma conta?</p>
        <button
          @click="redirectToRegister"
          class="mt-4 w-full py-2 text-blue-800 border border-blue-800 rounded-md shadow-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-all ease-in-out"
        >
          Cadastre-se
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_URL } from '@/config';

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: '',
      apiUrl: API_URL
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post(`${this.apiUrl}/login`, {
          email: this.email,
          password: this.password
        });

        // Verifique se a resposta contém os dados necessários
        if (response.data && response.data.token && response.data.user) {
          // Salvar no localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('name', response.data.user.name);
          localStorage.setItem('role', response.data.user.role);

          // Redireciona para o dashboard
          this.$router.push('/dashboard');
        } else {
          this.errorMessage = 'Falha no login. Dados incompletos.';
        }
      } catch (error) {
        this.errorMessage = 'Email ou senha inválidos';
      } finally {
        this.loading = false;
      }
    },
    redirectToRegister() {
      this.$router.push('/register');
    },
    forgotPassword() {
      // Aqui você pode redirecionar para a página de recuperação de senha
      alert("Funcionalidade de recuperação de senha ainda não implementada.");
    }
  }
};
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";

button, input {
  transition: all 0.3s ease;
}

input:focus, button:hover {
  transform: scale(1.03);
}

div {
  transition: all 0.5s ease;
}

input.border-red-500 {
  border-color: #f87171;
}

p.text-red-600 {
  background-color: rgba(248, 113, 113, 0.2);
  padding: 6px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 13px;
}
</style>
