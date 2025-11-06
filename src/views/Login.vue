<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <Card class="w-full max-w-sm shadow-2xl border-0">
      <CardHeader class="space-y-2">
        <CardTitle class="text-2xl font-bold text-center"> PROGEST </CardTitle>
        <CardDescription class="text-center">
          Acesso ao Sistema de Gestão de Estoque
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="login" class="space-y-4">
          <!-- Email Input -->
          <div class="space-y-2">
            <label
              for="email"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              required
              :disabled="loading"
              class="h-10"
            />
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <label
              for="password"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Senha
            </label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Digite sua senha"
              required
              :disabled="loading"
              class="h-10"
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          >
            <span class="mr-2">⚠️</span>{{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full h-10 mt-6" :disabled="loading">
            {{ loading ? "Entrando..." : "Entrar" }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { API_URL } from "@/config";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const router = useRouter();
const store = useStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const apiUrl = API_URL;

const login = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await axios.post(`${apiUrl}/login`, {
      email: email.value,
      password: password.value,
    });

    if (response.data && response.data.token && response.data.user) {
      store.commit("setUserToken", response.data.token);
      store.commit("setUser", response.data.user);
      router.push("/setor-selection");
    } else {
      errorMessage.value = "Falha no login. Dados incompletos.";
    }
  } catch (error) {
    errorMessage.value = "Email ou senha inválidos";
  } finally {
    loading.value = false;
  }
};
</script>
